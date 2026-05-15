
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Trash2, Edit, UserPlus, Save, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, updateUser, deleteUser } from '@/lib/user-actions';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { toast } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Apagar definitivamente ${code}?`)) {
      await deleteUser(id);
      toast({ title: "Removido", description: "Utilizador apagado do JSON." });
      loadUsers();
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      toast({ title: "Atualizado", description: "Dados guardados no JSON." });
      setEditingUser(null);
      loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldAlert /> Gestão JSON de Utilizadores</h1>
          <p className="text-muted-foreground">Administração direta via sistema de ficheiros.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadUsers}><RefreshCw className="mr-2 h-4 w-4" /> Atualizar</Button>
          <Button asChild className="rounded-full"><Link href="/register"><UserPlus className="mr-2" /> Novo</Link></Button>
        </div>
      </header>

      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cód.</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold">{user.assignedCode}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{user.password}</TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditingUser(user)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(user.id, user.assignedCode)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar: {editingUser?.assignedCode}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input label="Nome" value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
            <Input label="E-mail" value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
            <Input label="Password" value={editingUser?.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
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
            <Button onClick={handleUpdate}><Save className="mr-2 h-4 w-4" /> Gravar no JSON</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
