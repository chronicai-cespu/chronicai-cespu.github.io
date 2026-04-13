
"use client"

import { useHealth } from '@/components/health-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, getDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Trash2, Edit, UserPlus, Search, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminPage() {
  const { role: currentUserRole } = useHealth();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const usersQuery = useMemoFirebase(() => db ? query(collection(db, 'users')) : null, [db]);
  const { data: allUsers, isLoading } = useCollection(usersQuery);

  if (currentUserRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Apenas administradores podem aceder a esta página.</p>
      </div>
    );
  }

  const handleDelete = (userId: string, code: string) => {
    if (window.confirm(`Tem a certeza que deseja apagar o utilizador ${code}?`)) {
      const userRef = doc(db!, 'users', userId);
      deleteDocumentNonBlocking(userRef);
      toast({ title: "Utilizador Apagado", description: `O utilizador ${code} foi removido.` });
    }
  };

  const handleEditClick = async (user: any) => {
    setEditingUser({ ...user, fullName: '' });
    setIsEditDialogOpen(true);

    if (user.role === 'patient' && db) {
      setIsFetchingProfile(true);
      try {
        const profileRef = doc(db, 'patient_profiles', user.id);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setEditingUser((prev: any) => ({ ...prev, fullName: profileSnap.data().name || '' }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsFetchingProfile(false);
      }
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser || !db) return;
    
    const userRef = doc(db, 'users', editingUser.id);
    updateDocumentNonBlocking(userRef, {
      email: editingUser.email,
      role: editingUser.role,
      assignedCode: editingUser.assignedCode,
      mobileNumber: editingUser.mobileNumber || null
    });

    // Se for paciente, atualizar também o perfil
    if (editingUser.role === 'patient') {
      const profileRef = doc(db, 'patient_profiles', editingUser.id);
      updateDocumentNonBlocking(profileRef, {
        name: editingUser.fullName
      });
    }

    setIsEditDialogOpen(false);
    toast({ title: "Utilizador Atualizado", description: `Os dados de ${editingUser.assignedCode} foram guardados.` });
  };

  const filteredUsers = allUsers?.filter(u => 
    u.assignedCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const cleanEmail = (email: string) => {
    if (!email) return 'N/A';
    return email.replace(/^"|"$/g, '');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <ShieldAlert className="h-8 w-8" /> Painel de Administração
          </h1>
          <p className="text-muted-foreground">Gestão total de utilizadores, perfis e segurança.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="rounded-full bg-secondary text-white">
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" /> Criar Utilizador
            </Link>
          </Button>
        </div>
      </header>

      <Card className="shadow-lg border-none">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <CardTitle>Todos os Utilizadores do Sistema</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar por código ou email..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-bold">{user.assignedCode}</TableCell>
                  <TableCell>{cleanEmail(user.email)}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'researcher' ? 'secondary' : 'outline'}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-primary"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-destructive"
                      disabled={user.role === 'admin'}
                      onClick={() => handleDelete(user.id, user.assignedCode)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    A carregar utilizadores...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Utilizador: {editingUser?.assignedCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingUser?.role === 'patient' && (
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <div className="relative">
                  <Input 
                    id="edit-name" 
                    value={editingUser?.fullName || ''} 
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    placeholder="Carregando..."
                    disabled={isFetchingProfile}
                  />
                  {isFetchingProfile && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input 
                id="edit-email" 
                value={cleanEmail(editingUser?.email || '')} 
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Telemóvel</Label>
              <Input 
                id="edit-mobile" 
                value={editingUser?.mobileNumber || ''} 
                onChange={(e) => setEditingUser({ ...editingUser, mobileNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Papel</Label>
              <Select 
                value={editingUser?.role} 
                onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="researcher">Investigador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Código Atribuído</Label>
              <Input 
                id="edit-code" 
                value={editingUser?.assignedCode || ''} 
                onChange={(e) => setEditingUser({ ...editingUser, assignedCode: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateUser} className="bg-primary">
              <Save className="mr-2 h-4 w-4" /> Guardar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
