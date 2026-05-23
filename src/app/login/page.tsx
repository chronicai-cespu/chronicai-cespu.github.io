
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authenticateUser } from '@/lib/user-actions';
import { useHealth } from '@/components/health-context';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setUserProfile } = useHealth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      // 1. Validar credenciais no servidor (ficheiros JSON)
      const user = await authenticateUser(identifier, password);
      
      // 2. Atualizar o contexto global da aplicação (ISTO CORRIGE O ERRO)
      // O setUserProfile já trata de guardar no localStorage e atualizar o estado React
      setUserProfile(user as any);

      toast({ 
        title: "Bem-vindo", 
        description: `Sessão iniciada como ${user.name} (${user.assignedCode})` 
      });

      // 3. Redirecionar com base no papel
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'researcher') {
        router.push('/researcher');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        variant: "destructive",
        title: "Erro no Acesso",
        description: error.message || "Dados de acesso inválidos. Verifique o código e a palavra-passe.",
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
          <CardTitle className="text-2xl font-bold">Entrar no ChronicAI</CardTitle>
          <p className="text-muted-foreground text-sm">Inicie sessão com os seus dados de participante.</p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Identificador (Código, Email ou Telemóvel)</Label>
              <Input 
                id="identifier" 
                placeholder="Ex: p01, r01 ou admin2526" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-12 text-lg"
                autoComplete="username"
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
                className="h-12 text-lg"
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoggingIn} className="w-full h-14 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-md">
              {isLoggingIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar na Conta"}
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
