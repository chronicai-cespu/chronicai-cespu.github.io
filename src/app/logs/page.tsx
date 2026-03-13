"use client"

import { useState } from 'react';
import { useHealth } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartPulse, Activity, Scale, ClipboardList, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function LogsPage() {
  const { logs, addLog } = useHealth();
  const { toast } = useToast();
  
  // States for the new structured inputs
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [activityType, setActivityType] = useState('');
  const [activityDuration, setActivityDuration] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Dropdown ranges
  const systolicRange = Array.from({ length: 151 }, (_, i) => i + 70); // 70 to 220
  const diastolicRange = Array.from({ length: 91 }, (_, i) => i + 40); // 40 to 130
  const weightRange = Array.from({ length: 161 }, (_, i) => i + 40); // 40 to 200
  const durationOptions = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180];

  const getBpStatus = (sys: number, dia: number) => {
    if (!sys || !dia) return null;
    if (sys >= 140 || dia >= 90) return { label: 'Alta (Hipertensão)', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive' };
    if (sys >= 120 || dia >= 80) return { label: 'Elevada (Pré-hipertensão)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (sys < 90 || dia < 60) return { label: 'Baixa (Hipotensão)', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const bpStatus = getBpStatus(parseInt(systolic), parseInt(diastolic));

  const handleLog = (type: 'bp' | 'activity' | 'weight') => {
    let value = '';
    
    if (type === 'bp') {
      if (!systolic || !diastolic) {
        toast({ title: "Erro", description: "Por favor, selecione os valores de pressão arterial.", variant: "destructive" });
        return;
      }
      value = `${systolic}/${diastolic} mmHg`;
    }
    
    if (type === 'activity') {
      if (!activityType || !activityDuration) {
        toast({ title: "Erro", description: "Por favor, preencha o tipo e a duração da atividade.", variant: "destructive" });
        return;
      }
      value = `${activityType} (${activityDuration} min)`;
    }
    
    if (type === 'weight') {
      if (!weight) {
        toast({ title: "Erro", description: "Por favor, selecione o seu peso.", variant: "destructive" });
        return;
      }
      value = `${weight} kg`;
    }

    addLog({ type, value, notes });
    
    // Clear current tab inputs
    if (type === 'bp') { setSystolic(''); setDiastolic(''); }
    if (type === 'activity') { setActivityType(''); setActivityDuration(''); }
    if (type === 'weight') setWeight('');
    setNotes('');

    toast({
      title: "Sucesso",
      description: "O seu registo foi guardado com sucesso!",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" /> Registo de Saúde Diário
        </h1>
        <p className="text-muted-foreground text-lg">Mantenha o seu histórico atualizado. É simples e rápido.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6">
          <Card className="shadow-lg border-none overflow-hidden">
            <Tabs defaultValue="bp" className="w-full">
              <TabsList className="w-full h-16 rounded-none bg-muted grid grid-cols-3">
                <TabsTrigger value="bp" className="data-[state=active]:bg-white h-full text-lg gap-2">
                  <HeartPulse className="w-5 h-5" /> Vitais
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-white h-full text-lg gap-2">
                  <Activity className="w-5 h-5" /> Atividade
                </TabsTrigger>
                <TabsTrigger value="weight" className="data-[state=active]:bg-white h-full text-lg gap-2">
                  <Scale className="w-5 h-5" /> Peso
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="bp" className="space-y-6 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Sistólica (Máxima)</Label>
                      <Select value={systolic} onValueChange={setSystolic}>
                        <SelectTrigger className="h-14 text-xl">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {systolicRange.map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Diastólica (Mínima)</Label>
                      <Select value={diastolic} onValueChange={setDiastolic}>
                        <SelectTrigger className="h-14 text-xl">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {diastolicRange.map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {bpStatus && (
                    <div className={cn("p-4 rounded-xl border flex items-center gap-3 animate-in fade-in duration-300", bpStatus.bg, bpStatus.border)}>
                      {bpStatus.label.includes('Alta') || bpStatus.label.includes('Baixa') ? (
                        <AlertTriangle className={cn("w-6 h-6", bpStatus.color)} />
                      ) : (
                        <CheckCircle2 className={cn("w-6 h-6", bpStatus.color)} />
                      )}
                      <div>
                        <p className={cn("font-bold", bpStatus.color)}>{bpStatus.label}</p>
                        <p className="text-xs text-muted-foreground">Estado atual baseado nos valores inseridos.</p>
                      </div>
                    </div>
                  )}

                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('bp')} />
                </TabsContent>

                <TabsContent value="activity" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Tipo de Atividade</Label>
                      <Input 
                        placeholder="ex: Caminhada, Hidroginástica..." 
                        className="h-14 text-lg"
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Duração (Minutos)</Label>
                      <Select value={activityDuration} onValueChange={setActivityDuration}>
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder="Selecione o tempo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map(v => <SelectItem key={v} value={v.toString()}>{v} minutos</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('activity')} />
                </TabsContent>

                <TabsContent value="weight" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Peso Atual (kg)</Label>
                    <Select value={weight} onValueChange={setWeight}>
                      <SelectTrigger className="h-14 text-xl">
                        <SelectValue placeholder="Selecione o peso..." />
                      </SelectTrigger>
                      <SelectContent>
                        {weightRange.map(v => <SelectItem key={v} value={v.toString()}>{v} kg</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('weight')} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-md border-none h-full bg-secondary/5">
            <CardHeader className="border-b bg-white rounded-t-lg">
              <CardTitle className="text-xl">Registos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-secondary/10">
                      <div className={cn(
                        "p-2 rounded-lg",
                        log.type === 'bp' ? "bg-red-50 text-red-500" : 
                        log.type === 'activity' ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                      )}>
                        {log.type === 'bp' ? <HeartPulse className="w-5 h-5" /> : 
                         log.type === 'activity' ? <Activity className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-lg">{log.value}</p>
                          <span className="text-xs text-muted-foreground">{format(log.timestamp, 'HH:mm')}</span>
                        </div>
                        {log.notes && <p className="text-sm text-muted-foreground italic mt-1">"{log.notes}"</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">{format(log.timestamp, "d 'de' MMM", { locale: pt })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground italic">Nenhum registo efetuado hoje.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LogFields({ notes, setNotes, onLog }: { notes: string, setNotes: (v: string) => void, onLog: () => void }) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="space-y-2">
        <Label htmlFor="notes">Notas ou Sentimentos (Opcional)</Label>
        <Textarea 
          id="notes" 
          placeholder="Como se sente no momento?" 
          className="min-h-[100px] text-lg bg-muted/20"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button 
        onClick={onLog} 
        className="w-full h-14 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-lg"
      >
        <CheckCircle2 className="mr-2 h-6 w-6" /> Guardar no Histórico
      </Button>
    </div>
  );
}
