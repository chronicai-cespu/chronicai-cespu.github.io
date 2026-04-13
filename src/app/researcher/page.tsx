
"use client"

import { useHealth } from '@/components/health-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Search, Eye, FileText, Activity, HeartPulse, Scale, Calendar, ArrowLeft, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ResearcherPage() {
  const { role } = useHealth();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries para a lista de pacientes
  const patientsQuery = useMemoFirebase(() => db ? query(collection(db, 'patient_profiles')) : null, [db]);
  const { data: allPatients, isLoading } = useCollection(patientsQuery);

  // Query para os registos do paciente selecionado
  const selectedPatientLogsQuery = useMemoFirebase(() => {
    if (!db || !selectedPatient) return null;
    return query(
      collection(db, 'patient_profiles', selectedPatient.userId, 'clinical_records'),
      orderBy('recordedAt', 'desc'),
      limit(50)
    );
  }, [db, selectedPatient]);
  
  const { data: patientLogs, isLoading: isLogsLoading } = useCollection(selectedPatientLogsQuery);

  if (role !== 'researcher' && role !== 'admin') {
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

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" /> Painel de Investigação
          </h1>
          <p className="text-muted-foreground">Monitorização de dados clínicos e análise de adesão ao autocuidado.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por Código (pXX) ou Nome..." 
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                      {role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary hover:bg-primary/10 w-full justify-start"
                          asChild
                        >
                          <Link href={`/logs?patientId=${patient.userId}`}>
                            <Pencil className="mr-2 h-4 w-4" /> Inserir Registos
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FlaskConical className="h-8 w-8 animate-pulse mx-auto text-muted-foreground mb-2" />
                    A carregar participantes...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredPatients?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                    Nenhum paciente encontrado com os critérios de pesquisa.
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
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6" /> Detalhes do Paciente: {selectedPatient?.assignedCode}
                </DialogTitle>
                <DialogDescription className="text-white/80 mt-1">
                  {selectedPatient?.name} • {selectedPatient?.age} anos • {selectedPatient?.gender}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                Data Nascimento: {selectedPatient?.birthDate}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {/* Resumo Biométrico */}
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

              {/* Histórico de Registos Clinicos */}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {log.recordedAt ? format(log.recordedAt.toDate(), "dd/MM/yy HH:mm", { locale: pt }) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="ghost" className={cn(
                              "text-[10px] h-5",
                              log.recordType === 'bp' ? "bg-red-50 text-red-600" : 
                              log.recordType === 'activity' ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                            )}>
                              {log.recordType === 'bp' ? 'P. Arterial' : 
                               log.recordType === 'activity' ? 'Atividade' : 'Peso'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold">{log.value}</TableCell>
                          <TableCell className="text-xs text-muted-foreground italic max-w-[200px] truncate">
                            {log.notes || '---'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {isLogsLoading && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            A carregar histórico...
                          </TableCell>
                        </TableRow>
                      )}
                      {!isLogsLoading && (!patientLogs || patientLogs.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Ainda não existem registos clínicos para este paciente.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>

              {/* Informação Médica Adicional */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-accent/20 bg-accent/5">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-bold">Condições Crónicas</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {selectedPatient?.chronicDiseases?.includes('Diabetes') && (
                      <div className="p-2 bg-white rounded border">
                        <p className="font-bold text-xs text-primary">Diabetes</p>
                        <p className="text-[10px]">Medicação: {selectedPatient.diabetesInfo?.meds || 'N/A'}</p>
                      </div>
                    )}
                    {selectedPatient?.chronicDiseases?.includes('Hipertensão') && (
                      <div className="p-2 bg-white rounded border">
                        <p className="font-bold text-xs text-secondary">Hipertensão</p>
                        <p className="text-[10px]">Medicação: {selectedPatient.hypertensionInfo?.meds || 'N/A'}</p>
                      </div>
                    )}
                    {selectedPatient?.chronicDiseases?.includes('Colesterol') && (
                      <div className="p-2 bg-white rounded border">
                        <p className="font-bold text-xs text-accent-foreground">Colesterol</p>
                        <p className="text-[10px]">Medicação: {selectedPatient.cholesterolInfo?.meds || 'N/A'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border-muted bg-muted/5">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-bold">Observações do Investigador</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground italic">
                    {selectedPatient?.otherConditions || "Nenhuma observação adicional registada pelo utilizador."}
                  </CardContent>
                </Card>
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
    </div>
  );
}
