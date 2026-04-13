
"use client"

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, where, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState<'patient' | 'researcher'>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile: string) => {
    return /^\d{9}$/.test(mobile.replace(/\s/g, ''));
  };

  const validateBirthDate = (date: string) => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome Necessário",
        description: "Por favor, introduza o seu nome completo.",
      });
      return;
    }

    if (!birthDate.trim() || !validateBirthDate(birthDate)) {
      toast({
        variant: "destructive",
        title: "Data de Nascimento Inválida",
        description: "Por favor, introduza a data no formato DD/MM/AAAA.",
      });
      return;
    }

    const emailTrim = email.trim();
    const mobileTrim = mobile.trim().replace(/\s/g, '');

    const hasEmail = emailTrim !== '';
    const hasMobile = mobileTrim !== '';

    if (!hasEmail && !hasMobile) {
      toast({
        variant: "destructive",
        title: "Dados de Registo Necessários",
        description: "Por favor, introduza um E-mail ou um número de Telemóvel.",
      });
      return;
    }

    if (hasEmail && !validateEmail(emailTrim)) {
      toast({
        variant: "destructive",
        title: "E-mail Inválido",
        description: "O formato do e-mail introduzido não é válido.",
      });
      return;
    }

    if (hasMobile && !validateMobile(mobileTrim)) {
      toast({
        variant: "destructive",
        title: "Telemóvel Inválido",
        description: "O número de telemóvel deve conter exatamente 9 dígitos.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!db || !auth) throw new Error("Erro de ligação aos serviços Firebase.");

      // 1. Verificação de Unicidade (E-mail e Telemóvel)
      if (hasEmail) {
        const qEmail = query(collection(db, 'users'), where('email', '==', emailTrim));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          throw new Error("Este e-mail já se encontra registado. Por favor, utilize outro ou faça login.");
        }
      }

      if (hasMobile) {
        const qMobile = query(collection(db, 'users'), where('mobileNumber', '==', mobileTrim));
        const snapMobile = await getDocs(qMobile);
        if (!snapMobile.empty) {
          throw new Error("Este número de telemóvel já se encontra registado.");
        }
      }

      const authEmail = hasEmail ? emailTrim : `${mobileTrim}@chronicai.pt`;
      const rolePrefix = role === 'patient' ? 'p' : 'r';
      const qCount = query(collection(db, 'users'), where('role', '==', role));
      const snapshotCount = await getDocs(qCount);
      const assignedCode = `${rolePrefix}${(snapshotCount.size + 1).toString().padStart(2, '0')}`;

      const userCredential = await initiateEmailSignUp(auth, authEmail, password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        name: name.trim(),
        email: authEmail,
        mobileNumber: hasMobile ? mobileTrim : null,
        role: role,
        assignedCode: assignedCode,
        createdAt: new Date().toISOString()
      }, { merge: true });

      if (role === 'patient') {
        const profileRef = doc(db, 'patient_profiles', user.uid);
        setDocumentNonBlocking(profileRef, {
          userId: user.uid,
          name: name.trim(),
          age: 0,
          birthDate: birthDate,
          gender: '',
          education: '',
          householdSize: '',
          healthUnit: '',
          weight: 0,
          height: 0,
          chronicDiseases: [],
          assignedCode: assignedCode,
          email: hasEmail ? emailTrim : null,
          mobileNumber: hasMobile ? mobileTrim : null
        }, { merge: true });
        
        toast({
          title: "Conta Criada",
          description: `Bem-vindo! O seu código é ${assignedCode}.`,
        });
        router.push('/');
      } else {
        // Marcador de Investigador para as Security Rules
        const researcherRoleRef = doc(db, 'roles_researcher', user.uid);
        setDocumentNonBlocking(researcherRoleRef, { active: true }, { merge: true });

        toast({
          title: "Conta Criada",
          description: `Investigador registado com o código ${assignedCode}.`,
        });
        router.push('/researcher');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Registo",
        description: error.message || "Ocorreu um erro ao criar a conta.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
              <AppLogo className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar Nova Conta</CardTitle>
          <p className="text-muted-foreground">Junte-se à comunidade ChronicAI.</p>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Utilizador</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o papel..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="researcher">Investigador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                placeholder="Nome completo" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="h-12" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="exemplo@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="h-12" 
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Telemóvel</Label>
              <Input 
                id="mobile" 
                type="tel" 
                placeholder="912345678" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                className="h-12" 
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input 
                id="birthDate" 
                placeholder="DD/MM/AAAA" 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                className="h-12" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-12" 
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg rounded-full bg-secondary hover:bg-secondary/90 text-white shadow-md">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Registar"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Já tem conta? <Link href="/login" className="text-primary font-bold hover:underline">Entre aqui</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
