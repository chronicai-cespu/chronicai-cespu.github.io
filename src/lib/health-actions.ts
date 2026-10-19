/**
 * REGISTOS CLÍNICOS - Cloud Firestore (`clinical_records`).
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COL = 'clinical_records';

export async function getHealthRecords(patientId?: string): Promise<any[]> {
  const ref = collection(db, COL);
  const snap = await getDocs(patientId ? query(ref, where('patientProfileId', '==', patientId)) : ref);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as any)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
}

export async function addHealthRecord(record: any) {
  const newRecord = { ...record, recordedAt: new Date().toISOString() };
  try {
    const ref = await addDoc(collection(db, COL), newRecord);
    return { ...newRecord, id: ref.id };
  } catch {
    throw new Error('Não foi possível guardar o registo clínico.');
  }
}

export async function deleteHealthRecord(recordId: string) {
  try {
    await deleteDoc(doc(db, COL, recordId));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao eliminar registo:', error);
    return { success: false, error: 'Não foi possível eliminar o registo.' };
  }
}

export async function updateHealthRecord(recordId: string, updates: any) {
  const { id, patientProfileId, recordedAt, ...safeUpdates } = updates || {};
  try {
    await updateDoc(doc(db, COL, recordId), safeUpdates);
    return { ...updates, id: recordId };
  } catch {
    throw new Error('Não foi possível atualizar o registo clínico.');
  }
}
