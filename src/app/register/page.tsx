
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import { createUser } from '@/lib/user-actions';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    role: 'patient'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const newUser = await createUser(formData);
      setRegisteredCode(newUser.assignedCode);
      toast({ 
        title: "Conta Criada com Sucesso!", 
        description: `O seu código de acesso é: ${newUser.assignedCode}. Guarde-o bem.` 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro no Registo", 
        description: error.message || "Ocorreu um erro ao criar a conta." 
      });
      setIsSubmitting(false);
    }
  };

  if (registeredCode) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-md shadow-2xl border-none text-center animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-primary/5 rounded-t-lg pt-10 pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <ShieldCheck className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-primary">Registo Concluído!</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <p className="text-lg text-muted-foreground">Bem-vindo à comunidade ChronicAI, <strong>{formData.name}</strong>.</p>
            <div className="bg-muted p-6 rounded-2xl border-2 border-dashed border-primary/20">
              <p className="text-sm font-bold uppercase text-primary mb-2">O seu Código de Acesso:</p>
              <p className="text-5xl font-mono font-black tracking-widest text-secondary">{registeredCode}</p>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Utilize este código ou o seu e-mail para fazer login. Por favor, guarde-o num local seguro.
            </p>
          </CardContent>
          <CardFooter className="pb-10 px-8">
            <Button asChild className="w-full h-14 text-xl rounded-full bg-primary shadow-lg">
              <Link href="/login">Ir para o Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-background">
      <Card className="w-full max-w-lg shadow-xl border-none overflow-hidden">
        <CardHeader className="text-center space-y-4 bg-primary/5 pt-10 pb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
              <AppLogo className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Criar Nova Conta</CardTitle>
          <CardDescription className="text-base px-6">
            Junte-se ao ChronicAI para uma gestão de saúde mais inteligente e empática.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="p-8 space-y-6">
             <div className="space-y-3">
              <Label className="text-sm font-bold text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Qual é o seu papel no sistema?
              </Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                <SelectTrigger className="h-12 border-2 focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">Paciente</span>
                      <span className="text-xs text-muted-foreground">Vou registar os meus dados de saúde</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="researcher" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">Investigador</span>
                      <span className="text-xs text-muted-foreground">Vou acompanhar estudos clínicos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="name"
                    placeholder="Como se chama?" 
                    className="h-12 pl-10 text-base"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="exemplo@email.com" 
                    className="h-12 text-base"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Telemóvel (Opcional)</Label>
                  <Input 
                    id="mobile"
                    placeholder="9xx xxx xxx" 
                    className="h-12 text-base"
                    value={formData.mobileNumber} 
                    onChange={e => setFormData({...formData, mobileNumber: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Crie uma palavra-passe segura" 
                  className="h-12 text-base"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-8 flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-lg transition-transform active:scale-95">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><UserPlus className="mr-2 h-6 w-6" /> Concluir Registo</>}
            </Button>
            <div className="text-center w-full">
              <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Já tenho uma conta. Voltar ao Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
