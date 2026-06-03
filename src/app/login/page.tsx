
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { authenticateUser } from '@/lib/user-actions';
import { useHealth } from '@/components/health-context';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile, setUserProfile, isLoading: isAuthLoading } = useHealth();

  useEffect(() => {
    if (!isAuthLoading && userProfile) {
      // Redirecionamento inteligente: se paciente e sem data de nascimento, vai para perfil
      if (userProfile.role === 'patient' && !userProfile.birthDate) {
        router.replace('/profile');
        return;
      }

      const target = userProfile.role === 'admin' ? '/admin' : userProfile.role === 'researcher' ? '/researcher' : '/dashboard';
      router.replace(target);
    }
  }, [userProfile, isAuthLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      const user = await authenticateUser(identifier, password);
      setUserProfile(user as any);
      
      toast({ 
        title: "Sessão Iniciada", 
        description: `Bem-vindo, ${user.name}.` 
      });

      // Se for paciente novo (sem birthDate), manda direto para perfil
      if (user.role === 'patient' && !user.birthDate) {
        router.replace('/profile');
      } else {
        const target = user.role === 'admin' ? '/admin' : user.role === 'researcher' ? '/researcher' : '/dashboard';
        router.replace(target);
      }
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Acesso",
        description: error.message || "Credenciais inválidas.",
      });
      setIsLoggingIn(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
              <AppLogo className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Bem-vindo ao ChronicAI</CardTitle>
          <p className="text-muted-foreground text-sm">Introduza as suas credenciais para aceder aos seus dados de saúde.</p>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Código de Utilizador ou E-mail</Label>
              <Input 
                id="identifier" 
                placeholder="Ex: p01, r01, maria@email.com" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="h-12 text-lg"
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
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoggingIn} className="w-full h-14 text-xl rounded-full bg-primary shadow-lg">
              {isLoggingIn ? <Loader2 className="animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Entrar</>}
            </Button>
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                  <UserPlus className="w-4 h-4" /> Registe-se aqui
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
