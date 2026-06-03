
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { getUsers } from '@/lib/user-actions';

export default function SetupPage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkSetup = async () => {
    setIsLoading(true);
    setStatus('');

    try {
      // O sistema agora inicializa os ficheiros JSON automaticamente ao ler
      const users = await getUsers();
      const adminExists = users.some(u => u.assignedCode === 'admin2526');
      
      if (adminExists) {
        setStatus('O sistema está configurado corretamente com o administrador local (JSON).');
      } else {
        setStatus('Erro: O administrador padrão não foi encontrado nos ficheiros JSON.');
      }
    } catch (error: any) {
      setStatus('Erro ao verificar ficheiros: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Database className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Configuração ChronicAI (Local)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            O sistema utiliza armazenamento local em ficheiros JSON para garantir a privacidade dos dados.
          </p>
          
          <div className="bg-muted p-4 rounded-lg text-xs space-y-1">
            <p className="font-bold text-primary mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Credenciais de Administrador:
            </p>
            <p><strong>Código/Email:</strong> admin2526 / chronicai.cespu@gmail.com</p>
            <p><strong>Password:</strong> ditechAI2526</p>
          </div>

          <Button 
            onClick={checkSetup} 
            disabled={isLoading} 
            className="w-full h-14 text-lg rounded-full shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Verificar Estado do Sistema"}
          </Button>

          {status && (
            <div className={`p-4 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2 ${status.includes('Erro') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {status.includes('corretamente') && <CheckCircle2 className="w-4 h-4" />}
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
