
'use server';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const AUDIT_FILE = path.join(process.cwd(), 'src/lib/data/audit_logs.json');

async function ensureFile() {
  try {
    await fs.access(AUDIT_FILE);
  } catch {
    await fs.mkdir(path.dirname(AUDIT_FILE), { recursive: true });
    await fs.writeFile(AUDIT_FILE, '[]', 'utf8');
  }
}

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
  await ensureFile();
  try {
    const data = await fs.readFile(AUDIT_FILE, 'utf8');
    const logs = JSON.parse(data);
    
    const newLog = {
      ...action,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };

    logs.push(newLog);
    await fs.writeFile(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
    return newLog;
  } catch (error) {
    console.error('Erro ao registar auditoria:', error);
  }
}

export async function getAuditLogs() {
  await ensureFile();
  try {
    const data = await fs.readFile(AUDIT_FILE, 'utf8');
    return JSON.parse(data).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    return [];
  }
}
