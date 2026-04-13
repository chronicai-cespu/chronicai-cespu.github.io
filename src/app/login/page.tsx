
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
      if (!db) throw new Error("Erro de ligação à base de dados.");

      // 1. Caso especial: Username Admin (hardcoded mapping)
      if (identifier === 'admin2526') {
        loginEmail = 'chronicai.cespu@gmail.com';
      } 
      // 2. Identificador por Email direto
      else if (identifier.includes('@')) {
        loginEmail = identifier;
      } 
      // 3. Pesquisa em Firestore (Código, Telemóvel ou Data de Nascimento)
      else {
        const usersRef = collection(db, 'users');
        const profilesRef = collection(db, 'patient_profiles');

        // Pesquisa por Código de Utilizador (pXX ou rXX)
        const qCode = query(usersRef, where('assignedCode', '==', identifier), limit(1));
        const snapCode = await getDocs(qCode);
        
        if (!snapCode.empty) {
          loginEmail = snapCode.docs[0].data().email;
        } else {
          // Pesquisa por Telemóvel
          const qMobile = query(usersRef, where('mobileNumber', '==', identifier), limit(1));
          const snapMobile = await getDocs(qMobile);
          
          if (!snapMobile.empty) {
            loginEmail = snapMobile.docs[0].data().email;
          } else {
            // Pesquisa por Data de Nascimento (formato DD/MM/AAAA)
            const isBirthDatePattern = /^\d{2}\/\d{2}\/\d{4}$/.test(identifier);
            if (isBirthDatePattern) {
              const qBirth = query(profilesRef, where('birthDate', '==', identifier), limit(1));
              const snapBirth = await getDocs(qBirth);
              
              if (!snapBirth.empty) {
                const profileData = snapBirth.docs[0].data();
                const userId = profileData.userId;
                
                // Obter o email do utilizador associado à data de nascimento
                const qUser = query(usersRef, where('id', '==', userId), limit(1));
                const snapUser = await getDocs(qUser);
                
                if (!snapUser.empty) {
                  const userData = snapUser.docs[0].data();
                  // Regra: Admin não pode usar data de nascimento para login
                  if (userData.role === 'admin') {
                    throw new Error("Administradores não podem usar a data de nascimento para entrar.");
                  }
                  loginEmail = userData.email;
                }
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
      console.error("Login Error:", error);
      let message = "Verifique as suas credenciais.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Dados de acesso inválidos.";
      } else if (error.message) {
        message = error.message;
      }

      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: message,
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
              <Label htmlFor="identifier">Identificador</Label>
              <Input 
                id="identifier" 
                type="text" 
                placeholder="Código, Email, Telemóvel ou DD/MM/AAAA" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-12 text-lg"
                disabled={isLoggingIn}
              />
              <p className="text-[10px] text-muted-foreground">
                Nota: Para o admin, utilize o código atribuído, email ou telemóvel.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 text-lg"
                disabled={isLoggingIn}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Recuperação: <a href="mailto:chronicai.cespu@gmail.com" className="text-primary hover:underline font-bold">chronicai.cespu@gmail.com</a>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoggingIn} className="w-full h-14 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-md">
              {isLoggingIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar"}
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
