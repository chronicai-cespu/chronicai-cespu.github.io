
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createUser } from '@/lib/user-actions';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    role: 'patient'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const newUser = await createUser(formData);
      toast({ title: "Conta Criada", description: `Registado com sucesso. O seu código é ${newUser.assignedCode}` });
      router.push('/login');
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
          <CardTitle>Nova Conta ChronicAI (JSON)</CardTitle>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label>Tipo de Utilizador</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="researcher">Investigador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Nome Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Input placeholder="E-mail" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input placeholder="Palavra-passe" type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <Input placeholder="Telemóvel" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Registar no Ficheiro JSON"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
