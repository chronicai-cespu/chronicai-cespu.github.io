
'use server';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_FILE = path.join(process.cwd(), 'src/lib/data/contact_messages.json');

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

export async function saveContactMessage(message: any) {
  await ensureFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const allMessages = JSON.parse(data);
    
    const newMessage = {
      ...message,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };

    allMessages.push(newMessage);
    await fs.writeFile(DATA_FILE, JSON.stringify(allMessages, null, 2), 'utf8');
    return newMessage;
  } catch (error) {
    throw new Error("Não foi possível enviar a mensagem.");
  }
}

export async function getContactMessages() {
  await ensureFile();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return [];
  }
}
