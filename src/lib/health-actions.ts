
'use server';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

const DATA_FILE = path.join(process.cwd(), 'src/lib/data/clinical_records.json');

async function ensureFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, '[]', 'utf8');
    }
  } catch (error) {
    console.error('Erro ao assegurar ficheiro:', error);
  }
}

export async function getHealthRecords(patientId?: string) {
  await ensureFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const allRecords = JSON.parse(data);
    
    let filtered = Array.isArray(allRecords) ? allRecords : [];
    
    if (patientId) {
      filtered = filtered.filter((r: any) => r.patientProfileId === patientId);
    }
    
    return filtered.sort((a: any, b: any) => 
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  } catch (error) {
    console.error('Erro ao ler registos:', error);
    return [];
  }
}

export async function addHealthRecord(record: any) {
  await ensureFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const allRecords = JSON.parse(data);
    
    const newRecord = {
      ...record,
      id: uuidv4(),
      recordedAt: new Date().toISOString()
    };

    allRecords.push(newRecord);
    await fs.writeFile(DATA_FILE, JSON.stringify(allRecords, null, 2), 'utf8');
    
    revalidatePath('/logs');
    revalidatePath('/dashboard');
    return newRecord;
  } catch (error) {
    throw new Error("Não foi possível guardar o registo clínico.");
  }
}

export async function deleteHealthRecord(recordId: string) {
  await ensureFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    let allRecords = JSON.parse(data);
    
    if (!Array.isArray(allRecords)) {
      allRecords = [];
    }

    const initialLength = allRecords.length;
    // Garantir que a comparação é feita entre strings
    const filtered = allRecords.filter((r: any) => String(r.id) !== String(recordId));
    
    if (filtered.length === initialLength) {
      console.warn(`Tentativa de eliminar registo inexistente: ${recordId}`);
      return { success: false, error: "Registo não encontrado no ficheiro." };
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf8');
    
    revalidatePath('/logs');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Erro crítico ao eliminar registo:', error);
    return { success: false, error: error.message || "Falha técnica na escrita do ficheiro." };
  }
}

export async function updateHealthRecord(recordId: string, updates: any) {
  await ensureFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const allRecords = JSON.parse(data);
    const index = allRecords.findIndex((r: any) => String(r.id) === String(recordId));
    
    if (index === -1) throw new Error("Registo não encontrado para atualização.");

    allRecords[index] = { ...allRecords[index], ...updates };
    await fs.writeFile(DATA_FILE, JSON.stringify(allRecords, null, 2), 'utf8');
    
    revalidatePath('/logs');
    revalidatePath('/dashboard');
    return allRecords[index];
  } catch (error) {
    throw new Error("Não foi possível atualizar o registo clínico.");
  }
}
