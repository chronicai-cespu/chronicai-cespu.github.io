
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Trash2, Edit, UserPlus, Save, RefreshCw, Loader2, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUsers, updateUser, deleteUser } from '@/lib/user-actions';
import { useHealth } from '@/components/health-context';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { role, userProfile, isLoading: isAuthLoading } = useHealth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (role !== 'admin' || !userProfile) {
        router.push('/login');
      } else {
        loadUsers();
      }
    }
  }, [role, userProfile, isAuthLoading, router]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os utilizadores do ficheiro JSON." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (code === 'admin2526') {
      toast({ variant: "destructive", title: "Ação Bloqueada", description: "Não é possível remover a conta de administrador principal." });
      return;
    }
    if (window.confirm(`Apagar definitivamente ${code}?`)) {
      try {
        await deleteUser(id);
        toast({ title: "Removido", description: "Utilizador apagado do ficheiro JSON." });
        loadUsers();
      } catch (e) {
        toast({ variant: "destructive", title: "Erro", description: "Falha ao apagar o utilizador." });
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      toast({ title: "Atualizado", description: "Dados guardados com sucesso no JSON." });
      setEditingUser(null);
      loadUsers();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  if (isAuthLoading || role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A verificar permissões administrativas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldAlert className="text-primary" /> Gestão de Utilizadores (JSON)</h1>
          <p className="text-muted-foreground">Administração central de contas guardadas em ficheiros locais.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={loadUsers} className="flex-1 sm:flex-none"><RefreshCw className="mr-2 h-4 w-4" /> Atualizar</Button>
          <Button asChild variant="secondary" className="flex-1 sm:flex-none">
            <Link href="/admin/audit-logs"><History className="mr-2 h-4 w-4" /> Auditoria</Link>
          </Button>
          <Button asChild className="rounded-full flex-1 sm:flex-none"><Link href="/register"><UserPlus className="mr-2 h-4 w-4" /> Novo Utilizador</Link></Button>
        </div>
      </header>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">A ler ficheiros JSON...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Nenhum utilizador encontrado nos dados.</TableCell>
                  </TableRow>
                ) : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold font-mono">{user.assignedCode}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'researcher' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditingUser(user)}><Edit className="h-4 w-4" /></Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive" 
                        onClick={() => handleDelete(user.id, user.assignedCode)}
                        disabled={user.assignedCode === 'admin2526'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar: {editingUser?.assignedCode}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-bold">Nome Completo</label>
              <Input value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-bold">E-mail de Acesso</label>
              <Input type="email" value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-bold">Papel no Sistema</label>
              <Select value={editingUser?.role} onValueChange={v => setEditingUser({...editingUser, role: v})} disabled={editingUser?.assignedCode === 'admin2526'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="researcher">Investigador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" /> Guardar no JSON</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
