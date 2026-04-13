
"use client"

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function SetupPage() {
  const auth = useAuth();
  const db = useFirestore();
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setupAdmin = async () => {
    if (!db || !auth) return;
    setIsLoading(true);
    setStatus('');

    try {
      const email = 'chronicai.cespu@gmail.com';
      const password = 'ditechAI2526';
      
      // 1. Criar utilizador na Autenticação
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Criar documento de utilizador no Firestore
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        email: email,
        role: 'admin',
        assignedCode: 'admin2526',
        createdAt: new Date().toISOString()
      });

      // 3. Criar marcador de role admin
      await setDoc(doc(db, 'roles_admin', uid), {
        active: true
      });

      setStatus('Sucesso! Administrador criado. Pode agora fazer login em /login.');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setStatus('O administrador já existe na Autenticação. Verifique se o documento no Firestore também existe.');
      } else {
        setStatus('Erro: ' + error.message);
      }
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
              <ShieldCheck className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Configuração ChronicAI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            Clique no botão abaixo para criar a conta de administrador inicial necessária para o sistema.
          </p>
          
          <div className="bg-muted p-4 rounded-lg text-xs space-y-1">
            <p><strong>Email:</strong> chronicai.cespu@gmail.com</p>
            <p><strong>Password:</strong> ditechAI2526</p>
            <p><strong>Código:</strong> admin2526</p>
          </div>

          <Button 
            onClick={setupAdmin} 
            disabled={isLoading} 
            className="w-full h-14 text-lg rounded-full shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Criar Administrador"}
          </Button>

          {status && (
            <div className={`p-4 rounded-lg text-sm font-medium text-center ${status.includes('Sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
