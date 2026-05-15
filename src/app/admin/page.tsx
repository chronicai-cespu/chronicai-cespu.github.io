
"use client"

import { useHealth } from '@/components/health-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Trash2, Edit, UserPlus, Search, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * EDIÇÃO E REMOÇÃO (ADMIN)
 * O Admin pode editar qualquer campo de qualquer utilizador e remover contas.
 */
export default function AdminPage() {
  const { role: currentUserRole, isLoading: isContextLoading } = useHealth();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!db || currentUserRole !== 'admin') return null;
    return query(collection(db, 'users'));
  }, [db, currentUserRole]);

  const { data: allUsers, isLoading: isUsersLoading } = useCollection(usersQuery);

  // REMOÇÃO
  const handleDelete = (userId: string, code: string, userRole: string) => {
    if (window.confirm(`Tem a certeza que deseja apagar o utilizador ${code}?`)) {
      // 1. Remover do documento de utilizador
      deleteDocumentNonBlocking(doc(db!, 'users', userId));
      
      // 2. Limpar perfis e marcadores associados
      if (userRole === 'patient') deleteDocumentNonBlocking(doc(db!, 'patient_profiles', userId));
      if (userRole === 'researcher') deleteDocumentNonBlocking(doc(db!, 'roles_researcher', userId));
      if (userRole === 'admin') deleteDocumentNonBlocking(doc(db!, 'roles_admin', userId));

      toast({ title: "Removido", description: `Utilizador ${code} apagado com sucesso.` });
    }
  };

  // EDIÇÃO (GRAVAR)
  const handleUpdateUser = () => {
    if (!editingUser || !db) return;
    
    const userRef = doc(db, 'users', editingUser.id);
    const updatedData = {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      assignedCode: editingUser.assignedCode,
      mobileNumber: editingUser.mobileNumber || null
    };

    // 1. Atualizar Documento Base
    updateDocumentNonBlocking(userRef, updatedData);

    // 2. Sincronizar Papéis (Roles markers)
    if (editingUser.role === 'admin') setDocumentNonBlocking(doc(db, 'roles_admin', editingUser.id), { active: true }, { merge: true });
    if (editingUser.role === 'researcher') setDocumentNonBlocking(doc(db, 'roles_researcher', editingUser.id), { active: true }, { merge: true });

    // 3. Sincronizar Perfil Clínico se for Paciente
    if (editingUser.role === 'patient') {
      const profileRef = doc(db, 'patient_profiles', editingUser.id);
      setDocumentNonBlocking(profileRef, {
        name: editingUser.name,
        email: updatedData.email,
        mobileNumber: updatedData.mobileNumber
      }, { merge: true });
    }

    setIsEditDialogOpen(false);
    toast({ title: "Atualizado", description: "As alterações foram guardadas." });
  };

  if (currentUserRole !== 'admin' && !isContextLoading) return <div>Acesso Negado</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldAlert /> Gestão de Utilizadores</h1>
          <p className="text-muted-foreground">Administração total do sistema.</p>
        </div>
        <Button asChild className="rounded-full"><Link href="/register"><UserPlus className="mr-2" /> Novo Utilizador</Link></Button>
      </header>

      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers?.filter(u => u.name.includes(searchTerm) || u.assignedCode.includes(searchTerm)).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold">{user.assignedCode}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell><Badge>{user.role}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingUser(user); setIsEditDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" disabled={user.role === 'admin'} onClick={() => handleDelete(user.id, user.assignedCode, user.role)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Utilizador: {editingUser?.assignedCode}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Nome" value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
            <Input label="E-mail" value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
            <Select value={editingUser?.role} onValueChange={v => setEditingUser({...editingUser, role: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="researcher">Investigador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateUser}><Save className="mr-2 h-4 w-4" /> Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
