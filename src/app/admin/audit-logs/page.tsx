
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, ArrowLeft, RefreshCw, Loader2, User, Target, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getAuditLogs, AuditAction } from '@/lib/audit-actions';
import { useHealth } from '@/components/health-context';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: isAuthLoading } = useHealth();
  const { toast } = useToast();
  const router = useRouter();

  const isAuthorized = role === 'admin' || role === 'researcher';

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthorized) {
        router.push('/login');
      } else {
        loadLogs();
      }
    }
  }, [role, isAuthLoading, router, isAuthorized]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar logs de auditoria." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic">A verificar permissões...</p>
      </div>
    );
  }

  const backLink = role === 'admin' ? '/admin' : '/researcher';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link href={backLink} className="text-sm font-bold text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Voltar à Gestão
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2"><History className="text-primary" /> Histórico de Auditoria</h1>
          <p className="text-muted-foreground">Monitorização de todas as interações efetuadas por pacientes, investigadores e admins.</p>
        </div>
        <Button variant="outline" onClick={loadLogs} className="w-full sm:w-auto">
          <RefreshCw className={logs.length > 0 ? "mr-2 h-4 w-4" : "h-4 w-4"} /> {logs.length > 0 ? "Atualizar Histórico" : ""}
        </Button>
      </header>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Data e Hora</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Tipo de Ação</TableHead>
                  <TableHead>Alvo (Paciente)</TableHead>
                  <TableHead>Detalhes da Interação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">A carregar histórico...</TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">Nenhum registo de auditoria encontrado.</TableCell>
                  </TableRow>
                ) : logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.timestamp ? format(parseISO(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: pt }) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-1"><User className="w-3 h-3" /> {log.userName}</span>
                        <Badge variant="outline" className="text-[9px] w-fit py-0 h-4 mt-1">{log.userRole}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.actionType.includes('AUTO') ? 'outline' : log.actionType.includes('EDIÇÃO') ? 'secondary' : 'default'} className="text-[10px]">
                        {log.actionType.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium flex items-center gap-1"><Target className="w-3 h-3 text-primary" /> {log.targetName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-md">
                        <Info className="w-3 h-3 mt-1 text-muted-foreground shrink-0" />
                        <span className="text-xs leading-relaxed text-muted-foreground italic">{log.details}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
