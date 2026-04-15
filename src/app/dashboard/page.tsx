
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useHealth } from '@/components/health-context';
import { aiHealthAssistantAdvice } from '@/ai/flows/ai-health-assistant-advice-flow';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Pill, History, ArrowRight, MessageCircle, User, HeartPulse, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const chartConfig = {
  minutes: {
    label: "Minutos",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { userProfile, logs, meds, role, isLoading } = useHealth();
  const [didYouKnow, setDidYouKnow] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Garante que o componente só renderiza conteúdo dinâmico após hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirecionamento se não estiver autenticado ou se não for paciente
  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        router.push('/login');
      } else if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'researcher') {
        router.push('/researcher');
      }
    }
  }, [role, isLoading, router]);

  useEffect(() => {
    async function fetchCuriosity() {
      if (!userProfile || role !== 'patient') return;
      try {
        const response = await aiHealthAssistantAdvice({
          question: "Gera uma curiosidade útil sobre as minhas condições de saúde para o meu dashboard.",
          userProfile: userProfile
        });
        setDidYouKnow(response.didYouKnow || null);
      } catch (error) {
        console.error("Failed to fetch curiosity", error);
      }
    }
    if (userProfile && role === 'patient') {
      fetchCuriosity();
    }
  }, [userProfile, role]);

  const activityData = useMemo(() => {
    if (!isMounted) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date,
        label: format(date, 'eee', { locale: pt }),
        minutes: 0
      };
    });

    logs.filter(log => log.type === 'activity').forEach(log => {
      const logDate = startOfDay(log.timestamp);
      const dayData = last7Days.find(d => isSameDay(startOfDay(d.date), logDate));
      
      if (dayData) {
        const match = log.value.match(/\((\d+)\s*min\)/);
        if (match && match[1]) {
          dayData.minutes += parseInt(match[1]);
        }
      }
    });

    return last7Days;
  }, [logs, isMounted]);

  if (!isMounted || isLoading || !userProfile || role !== 'patient') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A carregar os seus dados de saúde...</p>
      </div>
    );
  }

  const recentLogs = logs.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-secondary">Bom dia, {userProfile.name || 'Utilizador'}</h1>
          <p className="text-muted-foreground text-lg">Aqui está o seu resumo de saúde e sugestões personalizadas.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/logs">
              <Activity className="mr-2 h-4 w-4" /> Registar Novo
            </Link>
          </Button>
          <Button asChild className="rounded-full bg-primary">
            <Link href="/chat">
              <MessageCircle className="mr-2 h-4 w-4" /> Perguntar à IA
            </Link>
          </Button>
        </div>
      </header>

      {didYouKnow && (
        <Card className="border-none shadow-lg bg-gradient-to-r from-accent/20 to-accent/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-1 bg-accent"></div>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-accent shadow-sm shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-accent-foreground flex items-center gap-2">
                Informação Personalizada: Sabia que...?
              </h3>
              <p className="text-lg leading-relaxed text-accent-foreground/90">
                {didYouKnow}
              </p>
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
            {logs.find(l => l.type === 'bp') ? (
              <div className="text-center py-4">
                <span className="text-4xl font-bold text-secondary">
                  {logs.find(l => l.type === 'bp')?.value}
                </span>
                <p className="text-muted-foreground mt-2">Última Pressão Arterial</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registado em {format(logs.find(l => l.type === 'bp')!.timestamp, "d 'de' MMMM, HH:mm", { locale: pt })}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground italic">Sem registos vitais ainda.</div>
            )}
            <Button asChild className="w-full mt-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/logs">Registar Novo Sinal Vital</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md border-none">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <TrendingUp className="h-5 w-5" /> Progresso Semanal
                </CardTitle>
                <CardDescription>Minutos de atividade física por dia</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">Últimos 7 dias</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[200px] w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="label" 
                      line={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="minutes" 
                      fill="var(--color-minutes)" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="shadow-md border-none">
          <CardHeader className="bg-primary/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Perfil de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Patologias Registadas</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {userProfile.chronicDiseases && userProfile.chronicDiseases.length > 0 ? userProfile.chronicDiseases.map(d => (
                  <Badge key={d} variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">{d}</Badge>
                )) : <p className="text-sm italic">Nenhuma patologia registada.</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-muted-foreground text-xs">Atividade</p>
                <p className="font-bold">{userProfile.physicalActivityLevel || 'N/A'}</p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-muted-foreground text-xs">Motivação</p>
                <p className="font-bold">{userProfile.motivationToChange ? 'Sim' : 'Não'}</p>
              </div>
            </div>
            <Button asChild variant="link" className="p-0 h-auto text-primary">
              <Link href="/profile">Atualizar Perfil & Questionário <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 shadow-md border-none">
          <CardHeader className="bg-secondary/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Pill className="h-5 w-5" /> Medicamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {meds && meds.length > 0 ? (
              <div className="space-y-3">
                {meds.slice(0, 2).map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-bold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.dosage}</p>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">Ativo</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground italic">Sem medicação listada.</p>
            )}
            <Button asChild variant="outline" className="w-full rounded-full border-secondary text-secondary hover:bg-secondary/5">
              <Link href="/profile">Gerir Farmacoterapêutica</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 shadow-md border-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-muted-foreground" /> Histórico
              </CardTitle>
              <Button asChild variant="link" className="text-primary text-xs h-auto p-0">
                <Link href="/logs">Ver Tudo</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentLogs.length > 0 ? recentLogs.map((log, idx) => (
                <div key={log.id} className={cn(
                  "flex items-center justify-between p-2 rounded-lg border-b last:border-0",
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      log.type === 'bp' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                    )}>
                      {log.type === 'bp' ? <HeartPulse className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{log.value}</p>
                      <p className="text-[10px] text-muted-foreground">{format(log.timestamp, 'd MMM HH:mm', { locale: pt })}</p>
                    </div>
                  </div>
                </div>
              )) : <p className="text-center py-4 text-xs text-muted-foreground italic">Nenhuma atividade recente.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
