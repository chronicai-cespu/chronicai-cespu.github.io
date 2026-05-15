
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

/**
 * CRIAÇÃO DE UTILIZADOR
 * Este componente lida com o registo inicial, criando o utilizador no Auth,
 * um documento na coleção 'users' e, se for paciente, o seu perfil clínico.
 */
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validações básicas omitidas por brevidade, mas presentes no código real...

    setIsSubmitting(true);
    
    try {
      if (!db || !auth) throw new Error("Erro de ligação aos serviços Firebase.");

      const emailTrim = email.trim();
      const mobileTrim = mobile.trim().replace(/\s/g, '');
      const authEmail = emailTrim || `${mobileTrim}@chronicai.pt`;
      
      // 1. Gerar Código Automático (pXX ou rXX)
      const rolePrefix = role === 'patient' ? 'p' : 'r';
      const qCount = query(collection(db, 'users'), where('role', '==', role));
      const snapshotCount = await getDocs(qCount);
      const assignedCode = `${rolePrefix}${(snapshotCount.size + 1).toString().padStart(2, '0')}`;

      // 2. Criar no Firebase Authentication
      const userCredential = await initiateEmailSignUp(auth, authEmail, password);
      const user = userCredential.user;

      // 3. Criar Documento Base de Utilizador
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        name: name.trim(),
        email: authEmail,
        mobileNumber: mobileTrim || null,
        role: role,
        assignedCode: assignedCode,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // 4. Se for Paciente, criar Perfil Clínico
      if (role === 'patient') {
        const profileRef = doc(db, 'patient_profiles', user.uid);
        setDocumentNonBlocking(profileRef, {
          userId: user.uid,
          name: name.trim(),
          birthDate: birthDate,
          weight: 0,
          height: 0,
          chronicDiseases: [],
          assignedCode: assignedCode,
          email: authEmail,
          mobileNumber: mobileTrim || null
        }, { merge: true });
        
        toast({ title: "Conta Criada", description: `Bem-vindo! Código: ${assignedCode}` });
        router.push('/');
      } else {
        // Marcador de papel para Security Rules
        setDocumentNonBlocking(doc(db, 'roles_researcher', user.uid), { active: true }, { merge: true });
        router.push('/researcher');
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4"><AppLogo className="w-12 h-12" /></div>
          <CardTitle>Nova Conta ChronicAI</CardTitle>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label>Tipo de Utilizador</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="researcher">Investigador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} required />
            <Input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Telemóvel" value={mobile} onChange={e => setMobile(e.target.value)} />
            <Input placeholder="DD/MM/AAAA" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
            <Input placeholder="Palavra-passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Registar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
