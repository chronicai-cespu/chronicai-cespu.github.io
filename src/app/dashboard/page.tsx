
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
  const { userProfile, logs = [], meds = [], role, isLoading } = useHealth();
  const [didYouKnow, setDidYouKnow] = useState<string | null>(null);
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
      }
    }
  }, [role, isLoading, isMounted, router]);

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
    return last7Days;
  }, [isMounted]);

  if (!isMounted || isLoading || !userProfile || role !== 'patient') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A carregar os seus dados de saúde...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-secondary">Olá, {userProfile.name}</h1>
          <p className="text-muted-foreground text-lg">Aqui está o seu resumo de saúde diário.</p>
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
        <Card className="border-none shadow-lg bg-gradient-to-r from-accent/20 to-accent/5 overflow-hidden">
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
            <div className="text-center py-6 text-muted-foreground italic">Sem registos vitais hoje.</div>
            <Button asChild className="w-full mt-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/logs">Registar Pressão Arterial</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md border-none">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-secondary">
              <TrendingUp className="h-5 w-5" /> Atividade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[200px]">
             <p className="text-center text-muted-foreground pt-10 italic">Inicie os seus registos para ver o progresso.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
