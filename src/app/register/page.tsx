
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Step 1: Generate assignedCode
      const rolePrefix = role === 'patient' ? 'p' : 'r';
      const q = query(collection(db!, 'users'), where('role', '==', role));
      const snapshot = await getDocs(q);
      const count = snapshot.size + 1;
      const assignedCode = `${rolePrefix}${count.toString().padStart(2, '0')}`;

      // Step 2: Register user in Auth
      const userCredential = await initiateEmailSignUp(auth, email, password);
      const user = userCredential.user;

      // Step 3: Create User Document in Firestore
      const userRef = doc(db!, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: email,
        mobileNumber: mobile || null,
        role: role,
        assignedCode: assignedCode,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Step 4: Create Patient Profile if role is patient
      if (role === 'patient') {
        const profileRef = doc(db!, 'patient_profiles', user.uid);
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
        title: "Conta Criada",
        description: `Bem-vindo! O seu código de utilizador é ${assignedCode}.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Registo",
        description: error.message,
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
                  <SelectItem value="patient">Paciente (pXX)</SelectItem>
                  <SelectItem value="researcher">Investigador (rXX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jose@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Telemóvel (Opcional)</Label>
              <Input id="mobile" type="tel" placeholder="912345678" value={mobile} onChange={(e) => setMobile(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento (Opcional)</Label>
              <Input id="birthDate" type="text" placeholder="DD/MM/AAAA" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg rounded-full bg-secondary hover:bg-secondary/90 text-white">
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
