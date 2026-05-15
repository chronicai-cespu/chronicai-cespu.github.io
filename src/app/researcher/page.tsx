
"use client"

import { useHealth } from '@/components/health-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Edit, Save, History, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * EDIÇÃO COM AUDITORIA (INVESTIGADOR)
 * Os investigadores só podem editar pacientes e TODA a alteração requer justificação.
 */
export default function ResearcherPage() {
  const { role, assignedCode: currentCode } = useHealth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [justification, setJustification] = useState('');
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);

  const patientsQuery = useMemoFirebase(() => (db && (role === 'researcher' || role === 'admin')) ? query(collection(db, 'patient_profiles')) : null, [db, role]);
  const { data: allPatients } = useCollection(patientsQuery);

  // EXECUÇÃO DA EDIÇÃO (APÓS JUSTIFICAÇÃO)
  const handleExecuteUpdate = () => {
    if (!db || !editingPatient || !justification.trim()) return;

    // 1. Criar Log de Auditoria
    const auditRef = doc(collection(db, 'patient_profiles', editingPatient.userId, 'audit_logs'));
    setDocumentNonBlocking(auditRef, {
      actionType: 'profile_update',
      justification: justification.trim(),
      performedBy: currentCode,
      timestamp: serverTimestamp(),
    }, { merge: true });

    // 2. Atualizar Perfil Clínico
    const profileRef = doc(db, 'patient_profiles', editingPatient.userId);
    updateDocumentNonBlocking(profileRef, editingPatient);

    // 3. Sincronizar com Coleção de Utilizadores
    const userRef = doc(db, 'users', editingPatient.userId);
    updateDocumentNonBlocking(userRef, { 
      name: editingPatient.name,
      email: editingPatient.email,
      mobileNumber: editingPatient.mobileNumber
    });

    setIsJustifyOpen(false);
    setEditingPatient(null);
    toast({ title: "Sucesso", description: "Alteração gravada com auditoria." });
  };

  if (role !== 'researcher' && role !== 'admin') return <div>Acesso Restrito</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FlaskConical /> Lista de Pacientes</h1>
      
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPatients?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-primary">{p.assignedCode}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" onClick={() => setEditingPatient(p)}><Edit className="h-4 w-4 mr-2" /> Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIÁLOGO DE EDIÇÃO */}
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

      {/* DIÁLOGO DE JUSTIFICAÇÃO (OBRIGATÓRIO) */}
      <Dialog open={isJustifyOpen} onOpenChange={setIsJustifyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertCircle /> Justificação Obrigatória</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Indique o motivo da alteração para efeitos de auditoria:</Label>
            <Textarea value={justification} onChange={e => setJustification(e.target.value)} placeholder="Ex: Correção de erro de digitação no nome..." />
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
