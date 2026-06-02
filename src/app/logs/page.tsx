
"use client"

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useHealth } from '@/components/health-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HeartPulse, Activity, Scale, ClipboardList, CheckCircle2, AlertTriangle, Loader2, RefreshCw, Trash2, Edit2, Save } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getUsers } from '@/lib/user-actions';
import { getHealthRecords, addHealthRecord, deleteHealthRecord, updateHealthRecord } from '@/lib/health-actions';
import { logAuditAction } from '@/lib/audit-actions';

const MOODS = [
  { id: 'feliz', emoji: '😊', label: 'Feliz' },
  { id: 'triste', emoji: '😢', label: 'Triste' },
  { id: 'cansado', emoji: '😫', label: 'Cansado' },
  { id: 'doente', emoji: '🤒', label: 'Doente' },
  { id: 'pensativo', emoji: '🤔', label: 'Pensativo' },
];

function LogsPageContent() {
  const { role, userProfile, isLoading: isContextLoading } = useHealth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const patientIdFromUrl = searchParams.get('patientId');
  
  const [targetPatientId, setTargetPatientId] = useState<string>('');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [activityType, setActivityType] = useState('');
  const [activityDuration, setActivityDuration] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [displayLogs, setDisplayLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  // Estados para edição
  const [editingLog, setEditingLog] = useState<any>(null);

  const canManagePatients = role === 'admin' || role === 'researcher';
  const isAdmin = role === 'admin';

  const loadLogs = useCallback(async () => {
    if (!targetPatientId) return;
    setIsLogsLoading(true);
    try {
      const records = await getHealthRecords(targetPatientId);
      setDisplayLogs(records || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao carregar o histórico.", variant: "destructive" });
    } finally {
      setIsLogsLoading(false);
    }
  }, [targetPatientId, toast]);

  useEffect(() => {
    if (canManagePatients) {
      getUsers().then(users => {
        setAllPatients(users.filter(u => u.role === 'patient'));
      });
    }
  }, [canManagePatients]);

  useEffect(() => {
    if (canManagePatients && patientIdFromUrl) {
      setTargetPatientId(patientIdFromUrl);
    } else if (!canManagePatients && userProfile) {
      setTargetPatientId(userProfile.id);
    }
  }, [canManagePatients, userProfile, patientIdFromUrl]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (isContextLoading || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A carregar registos...</p>
      </div>
    );
  }

  const handleLog = async (type: 'bp' | 'activity' | 'weight') => {
    if (!targetPatientId || isActionPending) return;

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
        toast({ title: "Erro", description: "Por favor, selecione o peso.", variant: "destructive" });
        return;
      }
      value = `${weight} kg`;
    }

    setIsActionPending(true);
    try {
      await addHealthRecord({
        patientProfileId: targetPatientId,
        recordType: type,
        value,
        notes: notes || '',
        mood: selectedMood
      });

      const targetPatient = allPatients.find(p => p.id === targetPatientId);
      const moodObj = MOODS.find(m => m.id === selectedMood);
      const moodString = moodObj ? `${moodObj.emoji} ${moodObj.label}` : 'N/A';
      
      await logAuditAction({
        userId: userProfile.id,
        userName: userProfile.name,
        userRole: userProfile.role,
        actionType: canManagePatients ? 'CRIAÇÃO_REGISTO_SAÚDE' : 'AUTO_REGISTO_SAÚDE',
        targetId: targetPatientId,
        targetName: targetPatient?.name || userProfile.name,
        details: `Tipo: ${type.toUpperCase()}, Valor: ${value}, Estado: ${moodString}, Notas: ${notes || 'N/A'}`
      });

      toast({
        title: "Sucesso",
        description: canManagePatients ? "Registo clínico inserido e auditado com sucesso." : "O seu registo foi guardado com sucesso!",
      });

      if (type === 'bp') { setSystolic(''); setDiastolic(''); }
      if (type === 'activity') { setActivityType(''); setActivityDuration(''); }
      if (type === 'weight') setWeight('');
      setNotes('');
      setSelectedMood(null);
      await loadLogs();
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao gravar os dados.", variant: "destructive" });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleDelete = async (log: any) => {
    if (!isAdmin || isActionPending) return;
    if (!window.confirm("Tem a certeza que deseja eliminar este registo? Esta ação será registada no log de auditoria.")) return;

    setIsActionPending(true);
    try {
      await deleteHealthRecord(log.id);
      
      const targetPatient = allPatients.find(p => p.id === targetPatientId);
      await logAuditAction({
        userId: userProfile.id,
        userName: userProfile.name,
        userRole: userProfile.role,
        actionType: 'ELIMINAÇÃO_REGISTO_SAÚDE',
        targetId: targetPatientId,
        targetName: targetPatient?.name || 'Paciente',
        details: `Registo eliminado - Tipo: ${log.recordType.toUpperCase()}, Valor: ${log.value}, Data Original: ${log.recordedAt}`
      });

      toast({ title: "Eliminado", description: "O registo foi removido do JSON e a ação auditada." });
      await loadLogs();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message || "Não foi possível eliminar o registo." });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleUpdate = async () => {
    if (!isAdmin || !editingLog || isActionPending) return;

    setIsActionPending(true);
    try {
      const original = displayLogs.find(l => l.id === editingLog.id);
      await updateHealthRecord(editingLog.id, editingLog);
      
      const targetPatient = allPatients.find(p => p.id === targetPatientId);
      await logAuditAction({
        userId: userProfile.id,
        userName: userProfile.name,
        userRole: userProfile.role,
        actionType: 'EDIÇÃO_REGISTO_SAÚDE',
        targetId: targetPatientId,
        targetName: targetPatient?.name || 'Paciente',
        details: `Edição Admin - Original: [${original.value}, Mood: ${original.mood}], Novo: [${editingLog.value}, Mood: ${editingLog.mood}], Notas: ${editingLog.notes}`
      });

      toast({ title: "Atualizado", description: "O registo foi alterado com sucesso." });
      setEditingLog(null);
      await loadLogs();
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o registo." });
    } finally {
      setIsActionPending(false);
    }
  };

  const systolicRange = Array.from({ length: 151 }, (_, i) => i + 70);
  const diastolicRange = Array.from({ length: 91 }, (_, i) => i + 40);
  const weightRange = Array.from({ length: 161 }, (_, i) => i + 40);
  const durationOptions = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-secondary flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" /> 
            {canManagePatients ? 'Inserção de Registos Clínicos' : 'Registo de Saúde Diário'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {canManagePatients ? 'Adicione medições para um paciente participante.' : 'Mantenha o seu histórico atualizado. É simples e rápido.'}
          </p>
        </div>
        
        {canManagePatients && (
          <div className="w-full md:w-80 space-y-2">
            <Label className="text-xs font-bold uppercase text-primary">Selecionar Paciente</Label>
            <Select value={targetPatientId} onValueChange={setTargetPatientId}>
              <SelectTrigger className="h-12 border-primary bg-primary/5">
                <SelectValue placeholder="Escolha um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {allPatients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.assignedCode} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
                          <SelectValue placeholder="..." />
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
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          {diastolicRange.map(v => <SelectItem key={v} value={v.toString()}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <LogFields notes={notes} setNotes={setNotes} selectedMood={selectedMood} setSelectedMood={setSelectedMood} onLog={() => handleLog('bp')} isManagement={canManagePatients} disabled={isActionPending} />
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
                  <LogFields notes={notes} setNotes={setNotes} selectedMood={selectedMood} setSelectedMood={setSelectedMood} onLog={() => handleLog('activity')} isManagement={canManagePatients} disabled={isActionPending} />
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
                  <LogFields notes={notes} setNotes={setNotes} selectedMood={selectedMood} setSelectedMood={setSelectedMood} onLog={() => handleLog('weight')} isManagement={canManagePatients} disabled={isActionPending} />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>

        <div className="md:col-span-5 space-y-6">
          <Card className="shadow-md border-none h-full bg-secondary/5">
            <CardHeader className="border-b bg-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Histórico (JSON)</span>
                <Button variant="ghost" size="icon" onClick={loadLogs} className="h-8 w-8">
                  <RefreshCw className={cn("h-4 w-4", isLogsLoading && "animate-spin")} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {isLogsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                  </div>
                ) : displayLogs.length > 0 ? (
                  displayLogs.map((log) => (
                    <div key={log.id} className="group flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-secondary/10 relative">
                      <div className={cn(
                        "p-2 rounded-lg",
                        log.recordType === 'bp' ? "bg-red-50 text-red-500" : 
                        log.recordType === 'activity' ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
                      )}>
                        {log.recordType === 'bp' ? <HeartPulse className="w-5 h-5" /> : 
                         log.recordType === 'activity' ? <Activity className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">{log.value}</p>
                            {log.mood && (
                              <span className="text-xl" title={MOODS.find(m => m.id === log.mood)?.label}>
                                {MOODS.find(m => m.id === log.mood)?.emoji}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {log.recordedAt ? format(parseISO(log.recordedAt), 'HH:mm') : '...'}
                          </span>
                        </div>
                        {log.notes && <p className="text-sm text-muted-foreground italic mt-1">"{log.notes}"</p>}
                        <div className="flex justify-between items-center mt-2">
                           <p className="text-[10px] text-muted-foreground">
                            {log.recordedAt ? format(parseISO(log.recordedAt), "d 'de' MMM", { locale: pt }) : ''}
                          </p>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-primary hover:bg-primary/10" 
                                onClick={() => setEditingLog(log)}
                                disabled={isActionPending}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive hover:bg-destructive/10" 
                                onClick={() => handleDelete(log)}
                                disabled={isActionPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground italic text-sm">
                      Nenhum registo encontrado para este paciente.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de Edição para Admin */}
      <Dialog open={!!editingLog} onOpenChange={(open) => !open && !isActionPending && setEditingLog(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Registo Clínico</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Valor da Medição</Label>
              <Input 
                value={editingLog?.value || ''} 
                onChange={e => setEditingLog({...editingLog, value: e.target.value})}
                disabled={isActionPending}
              />
              <p className="text-[10px] text-muted-foreground italic">Ex: 120/80 mmHg, 30 min, 75 kg</p>
            </div>
            <div className="space-y-2">
              <Label>Estado de Espírito</Label>
              <Select 
                value={editingLog?.mood || ""} 
                onValueChange={v => setEditingLog({...editingLog, mood: v})}
                disabled={isActionPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.emoji} {m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea 
                value={editingLog?.notes || ''} 
                onChange={e => setEditingLog({...editingLog, notes: e.target.value})}
                disabled={isActionPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)} disabled={isActionPending}>Cancelar</Button>
            <Button onClick={handleUpdate} className="bg-primary shadow-md" disabled={isActionPending}>
              {isActionPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LogFields({ notes, setNotes, selectedMood, setSelectedMood, onLog, isManagement, disabled }: { notes: string, setNotes: (v: string) => void, selectedMood: string | null, setSelectedMood: (v: string | null) => void, onLog: () => void, isManagement?: boolean, disabled?: boolean }) {
  return (
    <div className="space-y-6 pt-4 border-t">
      <div className="space-y-4">
        <Label className="text-base font-bold text-primary block text-center">Como se sente agora?</Label>
        <div className="flex justify-between gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedMood(mood.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all border-2",
                selectedMood === mood.id 
                  ? "bg-primary/10 border-primary scale-110 shadow-md" 
                  : "bg-muted/30 border-transparent hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-3xl md:text-4xl">{mood.emoji}</span>
              <span className={cn(
                "text-[10px] md:text-xs font-bold uppercase",
                selectedMood === mood.id ? "text-primary" : "text-muted-foreground"
              )}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas ou Observações Clínicas</Label>
        <Textarea 
          id="notes" 
          disabled={disabled}
          placeholder={isManagement ? "Adicione observações sobre a medição..." : "Como se sente no momento?"} 
          className="min-h-[100px] text-lg bg-muted/20"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button 
        onClick={onLog} 
        disabled={disabled}
        className={cn(
          "w-full h-14 text-xl rounded-full shadow-lg",
          isManagement ? "bg-secondary hover:bg-secondary/90" : "bg-primary hover:bg-primary/90"
        )}
      >
        {disabled ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
        {isManagement ? "Confirmar Registo Clínico" : "Guardar no Histórico"}
      </Button>
    </div>
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>}>
      <LogsPageContent />
    </Suspense>
  );
}
