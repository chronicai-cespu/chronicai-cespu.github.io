
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useHealth } from '@/components/health-context';
import { aiHealthAssistantAdvice } from '@/ai/flows/ai-health-assistant-advice-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, MessageCircle, HeartPulse, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { subDays, format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { getHealthRecords } from '@/lib/health-actions';

const chartConfig = {
  minutes: {
    label: "Minutos",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { userProfile, role, isLoading } = useHealth();
  const [didYouKnow, setDidYouKnow] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (!role) {
        router.replace('/login');
      } else if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'researcher') {
        router.replace('/researcher');
      } else if (role === 'patient' && !userProfile?.birthDate) {
        // Redirecionamento obrigatório se perfil incompleto
        router.replace('/profile');
      }
    }
  }, [role, userProfile, isLoading, isMounted, router]);

  useEffect(() => {
    async function fetchData() {
      if (!userProfile || role !== 'patient' || !userProfile.birthDate) return;
      try {
        const [curiosity, logs] = await Promise.all([
          aiHealthAssistantAdvice({
            question: "Gera uma curiosidade útil sobre as minhas condições de saúde.",
            userProfile: userProfile
          }),
          getHealthRecords(userProfile.id)
        ]);
        setDidYouKnow(curiosity.didYouKnow || null);
        setRecentLogs(logs.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    }
    if (userProfile && role === 'patient' && isMounted && userProfile.birthDate) {
      fetchData();
    }
  }, [userProfile, role, isMounted]);

  const activityData = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        label: format(date, 'eee', { locale: pt }),
        minutes: 0
      };
    });
  }, [isMounted]);

  if (!isMounted || isLoading || !userProfile || role !== 'patient' || !userProfile.birthDate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A carregar dados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-secondary">Olá, {userProfile.name}</h1>
          <p className="text-muted-foreground text-lg">Resumo de saúde do ficheiro JSON.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/logs"><Activity className="mr-2 h-4 w-4" /> Registar Novo</Link>
          </Button>
          <Button asChild className="rounded-full bg-primary">
            <Link href="/chat"><MessageCircle className="mr-2 h-4 w-4" /> Perguntar à IA</Link>
          </Button>
        </div>
      </header>

      {didYouKnow && (
        <Card className="border-none shadow-lg bg-gradient-to-r from-accent/20 to-accent/5">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent shadow-sm shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-accent-foreground">Sabia que...?</h3>
              <p className="text-lg leading-relaxed text-accent-foreground/90">{didYouKnow}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md border-none">
          <CardHeader className="bg-accent/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <HeartPulse className="h-5 w-5" /> Vitais Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-bold">{log.value}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(log.recordedAt), 'd MMM', { locale: pt })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground italic">Sem registos recentes no JSON.</div>
            )}
            <Button asChild className="w-full mt-4 rounded-full bg-accent text-accent-foreground">
              <Link href="/logs">Registar Medição</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md border-none">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <TrendingUp className="h-5 w-5" /> Atividade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[250px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={activityData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
