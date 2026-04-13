
"use client"

import { useHealth } from '@/components/health-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Search, Eye, FileText, Activity, HeartPulse, Scale, Calendar, Plus, Trash2, History, AlertCircle, Edit, UserPlus, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ResearcherPage() {
  const { role, assignedCode: currentResearcherCode, isLoading: isContextLoading } = useHealth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Edição de Paciente
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editPatientData, setEditPatientData] = useState<any>(null);
  
  // Justificação de Alterações
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [justification, setJustification] = useState('');
  const [pendingAction, setPendingAction] = useState<{type: 'profile' | 'record', data: any} | null>(null);

  // Edição de Registos
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);

  // Eliminação (Apenas Admin)
  const [isDeleteReasonDialogOpen, setIsDeleteReasonDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [logToDelete, setLogToDelete] = useState<any>(null);

  const isAdmin = role === 'admin';

  const patientsQuery = useMemoFirebase(() => {
    if (!db || isContextLoading || (role !== 'researcher' && role !== 'admin')) return null;
    return query(collection(db, 'patient_profiles'));
  }, [db, role, isContextLoading]);
  
  const { data: allPatients, isLoading: isPatientsLoading } = useCollection(patientsQuery);

  const selectedPatientLogsQuery = useMemoFirebase(() => {
    if (!db || !selectedPatient || isContextLoading || (role !== 'researcher' && role !== 'admin')) return null;
    return query(
      collection(db, 'patient_profiles', selectedPatient.userId, 'clinical_records'),
      orderBy('recordedAt', 'desc'),
      limit(50)
    );
  }, [db, selectedPatient, role, isContextLoading]);
  
  const { data: patientLogs } = useCollection(selectedPatientLogsQuery);

  const auditLogsQuery = useMemoFirebase(() => {
    if (!db || !selectedPatient) return null;
    return query(
      collection(db, 'patient_profiles', selectedPatient.userId, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
  }, [db, selectedPatient]);

  const { data: auditHistory } = useCollection(auditLogsQuery);

  if (!isContextLoading && role !== 'researcher' && role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FlaskConical className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Esta área é reservada a investigadores e administradores.</p>
      </div>
    );
  }

  const filteredPatients = allPatients?.filter(p => 
    p.assignedCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (patient: any) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleEditPatientClick = (patient: any) => {
    setEditPatientData({ ...patient });
    setIsEditingPatient(true);
  };

  const handleSavePatientRequest = () => {
    setPendingAction({ type: 'profile', data: editPatientData });
    setJustification('');
    setIsJustifyOpen(true);
  };

  const handleEditRecordClick = (record: any) => {
    setEditingRecord({ ...record });
    setIsEditRecordOpen(true);
  };

  const handleSaveRecordRequest = () => {
    setPendingAction({ type: 'record', data: editingRecord });
    setJustification('');
    setIsJustifyOpen(true);
  };

  const handleExecuteAction = () => {
    if (!db || !pendingAction || !justification.trim() || !selectedPatient) return;

    const auditRef = doc(collection(db, 'patient_profiles', selectedPatient.userId, 'audit_logs'));
    const auditData = {
      actionType: pendingAction.type === 'profile' ? 'profile_update' : 'record_update',
      justification: justification.trim(),
      performedBy: currentResearcherCode || role,
      timestamp: serverTimestamp(),
    };

    if (pendingAction.type === 'profile') {
      const profileRef = doc(db, 'patient_profiles', pendingAction.data.userId);
      updateDocumentNonBlocking(profileRef, pendingAction.data);
      
      const userRef = doc(db, 'users', pendingAction.data.userId);
      updateDocumentNonBlocking(userRef, { name: pendingAction.data.name });
      
      setSelectedPatient(pendingAction.data);
      setIsEditingPatient(false);
    } else {
      const recordRef = doc(db, 'patient_profiles', selectedPatient.userId, 'clinical_records', pendingAction.data.id);
      updateDocumentNonBlocking(recordRef, {
        value: pendingAction.data.value,
        notes: pendingAction.data.notes
      });
      setIsEditRecordOpen(false);
    }

    setDocumentNonBlocking(auditRef, auditData, { merge: true });

    setIsJustifyOpen(false);
    setPendingAction(null);
    toast({ title: "Alteração Guardada", description: "O log de auditoria foi atualizado." });
  };

  const initiateDelete = (log: any) => {
    if (!isAdmin) {
      toast({ variant: "destructive", title: "Ação Bloqueada", description: "Apenas administradores podem apagar registos." });
      return;
    }
    setLogToDelete(log);
    setDeletionReason('');
    setIsDeleteReasonDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!db || !selectedPatient || !logToDelete || !deletionReason.trim()) return;

    const logRef = doc(db, 'patient_profiles', selectedPatient.userId, 'clinical_records', logToDelete.id);
    const auditRef = doc(collection(db, 'patient_profiles', selectedPatient.userId, 'audit_logs'));

    setDocumentNonBlocking(auditRef, {
      actionType: 'record_deletion',
      originalData: logToDelete,
      justification: deletionReason.trim(),
      performedBy: currentResearcherCode || role,
      timestamp: serverTimestamp()
    }, { merge: true });

    deleteDocumentNonBlocking(logRef);

    setIsDeleteReasonDialogOpen(false);
    setLogToDelete(null);
    toast({ title: "Registo Apagado", description: "Eliminação registada em auditoria." });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" /> Painel de Investigação
          </h1>
          <p className="text-muted-foreground">Monitorização de dados clínicos e análise de adesão ao autocuidado.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button asChild className="rounded-full bg-secondary">
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" /> Novo Paciente
            </Link>
          </Button>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar pXX ou Nome..." 
              className="pl-9 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <Card className="shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>Lista de Pacientes Participantes</CardTitle>
          <CardDescription>Visualização geral do perfil clínico dos utilizadores registados.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Doenças Crónicas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients?.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-bold text-primary">{patient.assignedCode}</TableCell>
                  <TableCell>{patient.name || 'N/A'}</TableCell>
                  <TableCell>{patient.age ? `${patient.age} anos` : 'N/A'}</TableCell>
                  <TableCell>{patient.gender || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.chronicDiseases?.map((d: string) => (
                        <Badge key={d} variant="outline" className="text-[10px] px-2 py-0">
                          {d}
                        </Badge>
                      )) || '---'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-secondary hover:text-secondary hover:bg-secondary/10 w-full justify-start"
                        onClick={() => handleViewDetails(patient)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> Ver Registos
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10 w-full justify-start"
                        asChild
                      >
                        <Link href={`/logs?patientId=${patient.userId}`}>
                          <Plus className="mr-2 h-4 w-4" /> Inserir Registos
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(isPatientsLoading || isContextLoading) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FlaskConical className="h-8 w-8 animate-pulse mx-auto text-muted-foreground mb-2" />
                    A carregar participantes...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-secondary text-white shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" /> Detalhes do Paciente: {selectedPatient?.assignedCode}
                </DialogTitle>
                <DialogDescription className="text-white/80 mt-1">
                  {selectedPatient?.name} • {selectedPatient?.age} anos • {selectedPatient?.gender}
                </DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => handleEditPatientClick(selectedPatient)}
              >
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/20 border-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-red-500">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Peso e Altura</p>
                      <p className="font-bold">{selectedPatient?.weight}kg / {selectedPatient?.height}cm</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20 border-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Atividade Física</p>
                      <p className="font-bold">{selectedPatient?.physicalActivityLevel || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/20 border-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-green-500">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Unidade de Saúde</p>
                      <p className="font-bold truncate max-w-[150px]">{selectedPatient?.healthUnit || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                  <Calendar className="h-5 w-5 text-primary" /> Histórico Recente de Medições
                </h3>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {log.recordedAt?.toDate ? format(log.recordedAt.toDate(), "dd/MM/yy HH:mm", { locale: pt }) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="ghost" className={cn(
                              "text-[10px] h-5",
                              log.recordType === 'bp' ? "bg-red-50 text-red-600" : 
                              log.recordType === 'activity' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-500"
                            )}>
                              {log.recordType === 'bp' ? 'P. Arterial' : 
                               log.recordType === 'activity' ? 'Atividade' : 'Peso'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold">{log.value}</TableCell>
                          <TableCell className="text-xs text-muted-foreground italic max-w-[200px] truncate">
                            {log.notes || '---'}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => handleEditRecordClick(log)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => initiateDelete(log)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-muted-foreground">
                  <History className="h-5 w-5" /> Log de Auditoria
                </h3>
                <div className="space-y-3">
                  {auditHistory && auditHistory.length > 0 ? auditHistory.map((del) => (
                    <Card key={del.id} className={cn("border-l-4", del.actionType === 'record_deletion' ? "border-l-destructive bg-destructive/5" : "border-l-primary bg-primary/5")}>
                      <CardContent className="p-4 text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={del.actionType === 'record_deletion' ? "destructive" : "outline"} className="text-[10px]">
                            {del.actionType === 'record_deletion' ? 'ELIMINAÇÃO' : 'EDIÇÃO'} - {del.timestamp?.toDate ? format(del.timestamp.toDate(), "dd/MM HH:mm") : 'N/A'}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground">Por: {del.performedBy}</span>
                        </div>
                        <p className="font-medium text-xs mb-1">Justificativa: {del.justification}</p>
                        {del.actionType === 'record_deletion' ? (
                          <p className="text-[10px] text-muted-foreground"><strong>Dado Apagado:</strong> {del.originalData?.value} ({del.originalData?.recordType})</p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">Alteração efetuada em perfil ou registo.</p>
                        )}
                      </CardContent>
                    </Card>
                  )) : (
                    <p className="text-center text-xs text-muted-foreground italic">Sem histórico de auditoria.</p>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button onClick={() => setIsDetailsOpen(false)} variant="outline" className="rounded-full">
              Fechar Detalhes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingPatient} onOpenChange={setIsEditingPatient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Paciente: {editPatientData?.assignedCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input 
                value={editPatientData?.name || ''} 
                onChange={e => setEditPatientData({...editPatientData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input 
                  type="number"
                  value={editPatientData?.weight || 0} 
                  onChange={e => setEditPatientData({...editPatientData, weight: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input 
                  type="number"
                  value={editPatientData?.height || 0} 
                  onChange={e => setEditPatientData({...editPatientData, height: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unidade de Saúde</Label>
              <Input 
                value={editPatientData?.healthUnit || ''} 
                onChange={e => setEditPatientData({...editPatientData, healthUnit: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPatient(false)}>Cancelar</Button>
            <Button onClick={handleSavePatientRequest} className="bg-primary">
              <Save className="mr-2 h-4 w-4" /> Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditRecordOpen} onOpenChange={setIsEditRecordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Registo Clínico</DialogTitle>
            <DialogDescription>Alterar valor ou notas da medição.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor do Registo</Label>
              <Input 
                value={editingRecord?.value || ''} 
                onChange={e => setEditingRecord({...editingRecord, value: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea 
                value={editingRecord?.notes || ''} 
                onChange={e => setEditingRecord({...editingRecord, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRecordOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveRecordRequest} className="bg-primary">
              <Save className="mr-2 h-4 w-4" /> Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isJustifyOpen} onOpenChange={setIsJustifyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" /> Justificação da Alteração
            </DialogTitle>
            <DialogDescription>
              Todas as alterações efetuadas por investigadores devem ser justificadas para auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="justification">Motivo da Alteração</Label>
              <Textarea 
                id="justification" 
                placeholder="Ex: Correção de erro de digitação, atualização de dados após consulta..." 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsJustifyOpen(false); setPendingAction(null); }}>Cancelar</Button>
            <Button onClick={handleExecuteAction} disabled={!justification.trim()} className="bg-primary">
              Confirmar e Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteReasonDialogOpen} onOpenChange={setIsDeleteReasonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Confirmar Eliminação (ADMIN)
            </DialogTitle>
            <DialogDescription>
              Esta ação é permanente e será registada em auditoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="del-reason">Justificação da Eliminação</Label>
              <Textarea 
                id="del-reason" 
                placeholder="Indique o motivo da remoção..." 
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteReasonDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={!deletionReason.trim()}>
              Confirmar Eliminação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
