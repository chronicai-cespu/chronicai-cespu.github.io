
"use client"

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    let loginEmail = '';
    const loginPass = identifier === 'admin2526' ? 'ditechAI2526' : password;

    try {
      // 1. Determine the email based on the identifier
      if (identifier === 'admin2526') {
        loginEmail = 'chronicai.cespu@gmail.com';
      } else if (identifier.includes('@')) {
        loginEmail = identifier;
      } else {
        // Search Firestore for assignedCode, mobileNumber, or birthDate
        const usersRef = collection(db!, 'users');
        const profilesRef = collection(db!, 'patient_profiles');

        // Check assignedCode
        const qCode = query(usersRef, where('assignedCode', '==', identifier), limit(1));
        const snapCode = await getDocs(qCode);
        
        if (!snapCode.empty) {
          loginEmail = snapCode.docs[0].data().email;
        } else {
          // Check mobileNumber
          const qMobile = query(usersRef, where('mobileNumber', '==', identifier), limit(1));
          const snapMobile = await getDocs(qMobile);
          
          if (!snapMobile.empty) {
            loginEmail = snapMobile.docs[0].data().email;
          } else {
            // Check birthDate in profiles
            const qBirth = query(profilesRef, where('birthDate', '==', identifier), limit(1));
            const snapBirth = await getDocs(qBirth);
            
            if (!snapBirth.empty) {
              const userId = snapBirth.docs[0].data().userId;
              const qUser = query(usersRef, where('id', '==', userId), limit(1));
              const snapUser = await getDocs(qUser);
              if (!snapUser.empty) {
                loginEmail = snapUser.docs[0].data().email;
              }
            }
          }
        }
      }

      if (!loginEmail) {
        throw new Error("Não foi encontrado nenhum utilizador com estes dados.");
      }

      await initiateEmailSignIn(auth, loginEmail, loginPass);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: error.message || "Verifique as suas credenciais.",
      });
    } finally {
      setIsLoggingIn(false);
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
          <CardTitle className="text-2xl font-bold">Bem-vindo ao ChronicAI</CardTitle>
          <p className="text-muted-foreground">Inicie sessão para gerir a sua saúde.</p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Utilizador, Email, Telemóvel ou Data de Nascimento</Label>
              <Input 
                id="identifier" 
                type="text" 
                placeholder="ex: p01, jose@email.com, 912345678 ou DD/MM/AAAA" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-12"
                disabled={isLoggingIn}
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
                disabled={isLoggingIn}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Esqueceu-se da senha? Contacte <a href="mailto:chronicai.cespu@gmail.com" className="text-primary hover:underline">chronicai.cespu@gmail.com</a>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoggingIn} className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90">
              {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Ainda não tem conta? <Link href="/register" className="text-secondary font-bold hover:underline">Registe-se aqui</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
