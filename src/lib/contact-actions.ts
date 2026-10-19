/**
 * MENSAGENS DE CONTACTO - Cloud Firestore (`contact_messages`).
 * Qualquer visitante pode enviar; só o administrador pode ler.
 */
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function saveContactMessage(message: any) {
  const newMessage = {
    name: String(message?.name || ''),
    email: String(message?.email || ''),
    phone: String(message?.phone || ''),
    subject: String(message?.subject || ''),
    message: String(message?.message || ''),
    createdAt: new Date().toISOString(),
  };
  try {
    const ref = await addDoc(collection(db, 'contact_messages'), newMessage);
    return { ...newMessage, id: ref.id };
  } catch {
    throw new Error('Não foi possível enviar a mensagem.');
  }
}

export async function getContactMessages() {
  try {
    const snap = await getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
  } catch {
    return [];
  }
}
