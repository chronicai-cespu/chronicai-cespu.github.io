
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
    // Validação para números portugueses (9 dígitos)
    return /^\d{9}$/.test(mobile.replace(/\s/g, ''));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailTrim = email.trim();
    const mobileTrim = mobile.trim().replace(/\s/g, '');

    const hasEmail = emailTrim !== '';
    const hasMobile = mobileTrim !== '';

    // Validação: Pelo menos um campo deve estar preenchido
    if (!hasEmail && !hasMobile) {
      toast({
        variant: "destructive",
        title: "Dados de Registo Necessários",
        description: "Por favor, introduza um E-mail ou um número de Telemóvel.",
      });
      return;
    }

    // Validação: Se fornecidos, devem ser válidos
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

      // Se não houver email, geramos um técnico baseado no telemóvel para o Firebase Auth
      // O login por telemóvel usará este email técnico internamente após pesquisa no Firestore
      const authEmail = hasEmail ? emailTrim : `${mobileTrim}@chronicai.pt`;

      // Step 1: Gerar assignedCode
      const rolePrefix = role === 'patient' ? 'p' : 'r';
      const q = query(collection(db, 'users'), where('role', '==', role));
      const snapshot = await getDocs(q);
      const count = snapshot.size + 1;
      const assignedCode = `${rolePrefix}${count.toString().padStart(2, '0')}`;

      // Step 2: Registar na Autenticação
      const userCredential = await initiateEmailSignUp(auth, authEmail, password);
      const user = userCredential.user;

      // Step 3: Criar Documento de Utilizador
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: authEmail,
        mobileNumber: hasMobile ? mobileTrim : null,
        role: role,
        assignedCode: assignedCode,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Step 4: Criar Perfil de Paciente se aplicável
      if (role === 'patient') {
        const profileRef = doc(db, 'patient_profiles', user.uid);
        setDocumentNonBlocking(profileRef, {
          userId: user.uid,
          name: '',
          age: 0,
          birthDate: birthDate || '',
          gender: '',
          education: '',
          householdSize: '',
          healthUnit: '',
          weight: 0,
          height: 0,
          chronicDiseases: [],
          assignedCode: assignedCode
        }, { merge: true });
      }

      toast({
        title: "Conta Criada com Sucesso",
        description: `Bem-vindo! O seu código de acesso é ${assignedCode}.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Ocorreu um erro ao criar a conta.";
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = "Este e-mail ou telemóvel já está associado a uma conta.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = "A palavra-passe deve ter pelo menos 6 caracteres.";
      }

      toast({
        variant: "destructive",
        title: "Erro no Registo",
        description: errorMsg,
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
                type="text" 
                placeholder="DD/MM/AAAA" 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
                className="h-12" 
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
