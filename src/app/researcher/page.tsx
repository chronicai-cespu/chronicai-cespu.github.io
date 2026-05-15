
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FlaskConical, Edit, Save, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getUsers, updateUser } from '@/lib/user-actions';

export default function ResearcherPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [justification, setJustification] = useState('');
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const { toast } = useToast();

  const loadPatients = async () => {
    const data = await getUsers();
    setPatients(data.filter((u: any) => u.role === 'patient'));
  };

  useEffect(() => { loadPatients(); }, []);

  const handleExecuteUpdate = async () => {
    if (!editingPatient || !justification.trim()) return;
    try {
      // Nota: Auditoria poderia ser guardada noutro ficheiro JSON, aqui apenas atualizamos o user
      await updateUser(editingPatient.id, editingPatient);
      toast({ title: "Sucesso", description: "Paciente atualizado no JSON." });
      setIsJustifyOpen(false);
      setEditingPatient(null);
      loadPatients();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FlaskConical /> Lista de Pacientes (JSON)</h1>
      
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-primary">{p.assignedCode}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => setEditingPatient(p)}><Edit className="h-4 w-4 mr-2" /> Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Paciente: {editingPatient?.assignedCode}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Nome" value={editingPatient?.name || ''} onChange={e => setEditingPatient({...editingPatient, name: e.target.value})} />
            <Input label="E-mail" value={editingPatient?.email || ''} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} />
            <Input label="Telemóvel" value={editingPatient?.mobileNumber || ''} onChange={e => setEditingPatient({...editingPatient, mobileNumber: e.target.value})} />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsJustifyOpen(true)} className="bg-primary">Continuar para Justificação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isJustifyOpen} onOpenChange={setIsJustifyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertCircle /> Justificação Obrigatória</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Indique o motivo da alteração (Auditoria JSON):</Label>
            <Textarea value={justification} onChange={e => setJustification(e.target.value)} placeholder="Ex: Correção de nome..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJustifyOpen(false)}>Cancelar</Button>
            <Button onClick={handleExecuteUpdate} disabled={!justification.trim()} className="bg-primary">Confirmar e Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
