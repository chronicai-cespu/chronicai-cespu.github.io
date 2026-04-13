
"use client"

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin override check as requested
    const loginEmail = email === 'admin2526' ? 'chronicai.cespu@gmail.com' : email;
    const loginPass = email === 'admin2526' ? 'ditechAI2526' : password;

    try {
      initiateEmailSignIn(auth, loginEmail, loginPass);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: "Verifique as suas credenciais.",
      });
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
              <Label htmlFor="email">Utilizador ou Email</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="ex: admin2526 ou jose@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
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
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Esqueceu-se da senha? Contacte <a href="mailto:chronicai.cespu@gmail.com" className="text-primary hover:underline">chronicai.cespu@gmail.com</a>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 text-lg rounded-full bg-primary hover:bg-primary/90">
              Entrar
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
