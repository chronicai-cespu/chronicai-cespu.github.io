/**
 * AUDITORIA - Cloud Firestore (`audit_logs`). As regras de segurança
 * impedem a alteração ou eliminação de entradas (log imutável).
 */
import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type AuditAction = {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType: string;
  targetId: string;
  targetName: string;
  details: string;
  timestamp?: string;
};

export async function logAuditAction(action: AuditAction) {
  try {
    const { id, ...rest } = action;
    const newLog = { ...rest, timestamp: new Date().toISOString() };
    const ref = await addDoc(collection(db, 'audit_logs'), newLog);
    return { ...newLog, id: ref.id };
  } catch (error) {
    console.error('Erro ao registar auditoria:', error);
  }
}

export async function getAuditLogs(): Promise<AuditAction[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(1000))
    );
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as AuditAction);
  } catch (error) {
    console.error('Erro ao ler auditoria:', error);
    return [];
  }
}
