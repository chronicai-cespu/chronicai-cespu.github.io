"use client"

import { useState } from 'react';
import { useHealth } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartPulse, Activity, Scale, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function LogsPage() {
  const { logs, addLog } = useHealth();
  const { toast } = useToast();
  
  const [bp, setBp] = useState('');
  const [activity, setActivity] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = (type: 'bp' | 'activity' | 'weight') => {
    let value = '';
    if (type === 'bp') value = bp;
    if (type === 'activity') value = activity;
    if (type === 'weight') value = weight;

    if (!value) {
      toast({ title: "Erro", description: "Por favor, introduza um valor.", variant: "destructive" });
      return;
    }

    addLog({ type, value, notes });
    
    // Clear form
    setBp('');
    setActivity('');
    setWeight('');
    setNotes('');

    toast({
      title: "Sucesso",
      description: `Registo de ${type === 'bp' ? 'Pressão Arterial' : type === 'activity' ? 'Atividade' : 'Peso'} adicionado com sucesso!`,
      variant: "default",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" /> Registo de Saúde
        </h1>
        <p className="text-muted-foreground text-lg">Registe as suas medições diárias e atividades para manter o controlo.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Logging Forms */}
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
                  <div className="space-y-2">
                    <Label htmlFor="bp" className="text-lg">Pressão Arterial (mmHg)</Label>
                    <Input 
                      id="bp" 
                      placeholder="ex: 120/80" 
                      className="h-14 text-xl"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">Formato: Sistólica/Diastólica</p>
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('bp')} />
                </TabsContent>

                <TabsContent value="activity" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="activity" className="text-lg">Descrição do Exercício</Label>
                    <Input 
                      id="activity" 
                      placeholder="ex: 20 min de caminhada no parque" 
                      className="h-14 text-xl"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    />
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('activity')} />
                </TabsContent>

                <TabsContent value="weight" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-lg">Peso Corporal (kg/lbs)</Label>
                    <Input 
                      id="weight" 
                      placeholder="ex: 75 kg" 
                      className="h-14 text-xl"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} onLog={() => handleLog('weight')} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        {/* Recent History Sidebar */}
        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-md border-none h-full bg-secondary/5">
            <CardHeader className="border-b bg-white rounded-t-lg">
              <CardTitle className="text-xl">Registos de Hoje</CardTitle>
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
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground italic">Nenhum registo hoje.</p>
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (Opcional)</Label>
        <Textarea 
          id="notes" 
          placeholder="Como se sente? Algum sintoma?" 
          className="min-h-[100px] text-lg"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button 
        onClick={onLog} 
        className="w-full h-14 text-xl rounded-full bg-primary hover:bg-primary/90 shadow-lg"
      >
        <CheckCircle2 className="mr-2 h-6 w-6" /> Guardar Registo
      </Button>
    </div>
  );
}
