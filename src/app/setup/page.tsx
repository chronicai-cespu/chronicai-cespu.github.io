
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, Database, CheckCircle2, FileJson } from 'lucide-react';
import { getUsers } from '@/lib/user-actions';

export default function SetupPage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkSetup = async () => {
    setIsLoading(true);
    setStatus('');

    try {
      // Verifica a integridade do sistema JSON local
      const users = await getUsers();
      const adminExists = users.some(u => u.assignedCode === 'admin2526');
      const patientCount = users.filter(u => u.role === 'patient').length;
      const researcherCount = users.filter(u => u.role === 'researcher').length;
      
      if (adminExists) {
        setStatus(`Sistema OK. Encontrados: 1 Admin, ${researcherCount} Investigadores, ${patientCount} Pacientes nos ficheiros locais.`);
      } else {
        setStatus('Aviso: O administrador padrão (admin2526) não foi detetado. Verifique src/lib/data/admins.json.');
      }
    } catch (error: any) {
      setStatus('Erro ao aceder aos dados JSON: ' + error.message);
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
              <FileJson className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Diagnóstico de Dados (Local)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground text-sm">
            O ChronicAI opera de forma 100% local através de ficheiros JSON na pasta <code>src/lib/data/</code>.
          </p>
          
          <div className="bg-muted p-4 rounded-lg text-xs space-y-1">
            <p className="font-bold text-primary mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Credenciais Administrativas:
            </p>
            <p><strong>ID:</strong> admin2526</p>
            <p><strong>Email:</strong> chronicai.cespu@gmail.com</p>
            <p><strong>Pass:</strong> ditechAI2526</p>
          </div>

          <Button 
            onClick={checkSetup} 
            disabled={isLoading} 
            className="w-full h-14 text-lg rounded-full shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Validar Ficheiros de Dados"}
          </Button>

          {status && (
            <div className={`p-4 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2 ${status.includes('Erro') || status.includes('Aviso') ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
              {status.includes('OK') && <CheckCircle2 className="w-4 h-4" />}
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
