
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FlaskConical, Edit, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getUsers, updateUser } from '@/lib/user-actions';
import { logAuditAction } from '@/lib/audit-actions';
import { useHealth } from '@/components/health-context';
import { useRouter } from 'next/navigation';

export default function ResearcherPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [justification, setJustification] = useState('');
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile: researcher, role, isLoading: isAuthLoading } = useHealth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (role !== 'researcher' && role !== 'admin') {
        router.push('/login');
      } else {
        loadPatients();
      }
    }
  }, [role, isAuthLoading, router]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setPatients(data.filter((u: any) => u.role === 'patient'));
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar pacientes." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteUpdate = async () => {
    if (!editingPatient || !justification.trim() || !researcher) return;
    
    try {
      await updateUser(editingPatient.id, editingPatient);
      
      // Registo de auditoria
      await logAuditAction({
        userId: researcher.id,
        userName: researcher.name,
        userRole: researcher.role,
        actionType: 'EDIÇÃO_PERFIL_PACIENTE',
        targetId: editingPatient.id,
        targetName: editingPatient.name,
        details: `Justificação: ${justification}`
      });

      toast({ title: "Sucesso", description: "Paciente atualizado e ação registada em auditoria." });
      setIsJustifyOpen(false);
      setEditingPatient(null);
      setJustification('');
      loadPatients();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  if (isAuthLoading || (role !== 'researcher' && role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A verificar permissões...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><FlaskConical className="text-primary" /> Lista de Pacientes (JSON)</h1>
          <p className="text-muted-foreground">Gestão e acompanhamento de participantes no estudo clínico.</p>
        </div>
      </header>
      
      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">A carregar dados...</TableCell>
                  </TableRow>
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Nenhum paciente encontrado.</TableCell>
                  </TableRow>
                ) : patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-primary font-mono">{p.assignedCode}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{p.email}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" onClick={() => setEditingPatient(p)} className="hover:text-primary">
                        <Edit className="h-4 w-4 mr-2" /> Editar Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingPatient} onOpenChange={(open) => !open && setEditingPatient(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Paciente: {editingPatient?.assignedCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Nome Completo</Label>
              <Input value={editingPatient?.name || ''} onChange={e => setEditingPatient({...editingPatient, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>E-mail</Label>
              <Input type="email" value={editingPatient?.email || ''} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Telemóvel</Label>
              <Input value={editingPatient?.mobileNumber || ''} onChange={e => setEditingPatient({...editingPatient, mobileNumber: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPatient(null)}>Cancelar</Button>
            <Button onClick={() => setIsJustifyOpen(true)} className="bg-primary shadow-lg">Continuar para Justificação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isJustifyOpen} onOpenChange={setIsJustifyOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertCircle /> Justificação Obrigatória</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label className="text-sm font-bold">Indique o motivo da alteração (Registo de Auditoria):</Label>
            <Textarea 
              value={justification} 
              onChange={e => setJustification(e.target.value)} 
              placeholder="Ex: Correção de nome conforme documento de identificação..." 
              className="min-h-[120px]"
            />
            <p className="text-[10px] text-muted-foreground italic">
              Esta alteração será registada com o seu nome ({researcher?.name}) e o carimbo de data/hora atual no log de auditoria.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJustifyOpen(false)}>Voltar</Button>
            <Button onClick={handleExecuteUpdate} disabled={!justification.trim()} className="bg-primary shadow-lg">
              Confirmar e Guardar Ação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
