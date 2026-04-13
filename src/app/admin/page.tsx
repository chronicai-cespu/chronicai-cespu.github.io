
"use client"

import { useHealth } from '@/components/health-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Trash2, Edit, UserPlus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { role } = useHealth();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const usersQuery = useMemoFirebase(() => db ? query(collection(db, 'users')) : null, [db]);
  const { data: allUsers, isLoading } = useCollection(usersQuery);

  if (role !== 'admin') {
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

  const filteredUsers = allUsers?.filter(u => 
    u.assignedCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8" /> Painel de Administração
          </h1>
          <p className="text-muted-foreground">Gestão total de utilizadores, perfis e segurança.</p>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-full bg-secondary text-white">
            <UserPlus className="mr-2 h-4 w-4" /> Criar Investigador
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
                  <TableCell>{user.email ? user.email.replace(/^"|"$/g, '') : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'researcher' ? 'secondary' : 'outline'}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" className="text-primary">
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
    </div>
  );
}
