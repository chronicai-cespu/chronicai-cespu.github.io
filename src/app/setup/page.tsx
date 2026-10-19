"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, CheckCircle2, XCircle, Database } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { urgentCareGuidance } from '@/ai/flows/urgent-care-guidance';
import { useHealth } from '@/components/health-context';

type Check = { label: string; ok: boolean; detail: string };

export default function SetupPage() {
  const { userProfile } = useHealth();
  const [checks, setChecks] = useState<Check[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runChecks = async () => {
    setIsLoading(true);
    const results: Check[] = [];

    try {
      await getDoc(doc(db, 'login_codes', '__diagnostico__'));
      results.push({ label: 'Cloud Firestore', ok: true, detail: 'Ligação e regras de segurança ativas.' });
    } catch (e: any) {
      results.push({ label: 'Cloud Firestore', ok: false, detail: e?.message || 'Sem ligação.' });
    }

    results.push({
      label: 'Sessão',
      ok: !!userProfile,
      detail: userProfile
        ? `${userProfile.name} (${userProfile.assignedCode}) — papel: ${userProfile.role}`
        : 'Sem sessão iniciada.',
    });

    try {
      await urgentCareGuidance({ symptoms: 'Teste de diagnóstico: sem sintomas.' });
      results.push({ label: 'IA (Gemini via Firebase AI Logic)', ok: true, detail: 'Resposta recebida.' });
    } catch (e: any) {
      results.push({ label: 'IA (Gemini via Firebase AI Logic)', ok: false, detail: e?.message || 'Sem resposta.' });
    }

    setChecks(results);
    setIsLoading(false);
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
          <CardTitle className="text-2xl font-bold">Diagnóstico do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground text-sm">
            O ChronicAI usa o Firebase Authentication, o Cloud Firestore e o Firebase AI Logic,
            todos no plano gratuito (Spark).
          </p>

          <div className="bg-muted p-4 rounded-lg text-xs space-y-1">
            <p className="font-bold text-primary mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Primeiro administrador:
            </p>
            <p>1. Registe uma conta normal em /register.</p>
            <p>2. Na consola do Firebase → Firestore → coleção <code>users</code>, abra o documento dessa conta e altere <code>role</code> para <code>admin</code>.</p>
          </div>

          <Button onClick={runChecks} disabled={isLoading} className="w-full h-14 text-lg rounded-full shadow-lg">
            {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Executar Diagnóstico'}
          </Button>

          {checks.length > 0 && (
            <ul className="space-y-2">
              {checks.map((c) => (
                <li
                  key={c.label}
                  className={`p-3 rounded-lg text-sm flex gap-2 ${c.ok ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                >
                  {c.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span><strong>{c.label}:</strong> {c.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
