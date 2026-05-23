
'use server';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'src/lib/data');

const PATHS = {
  admin: path.join(DATA_DIR, 'admins.json'),
  researcher: path.join(DATA_DIR, 'researchers.json'),
  patient: path.join(DATA_DIR, 'patients.json'),
};

async function ensureDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJson(filePath: string) {
  await ensureDir();
  try {
    const data = await fs.readFile(filePath, 'utf8');
    if (!data || data.trim() === '') return [];
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

async function writeJson(filePath: string, data: any[]) {
  await ensureDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function getUsers() {
  const [admins, researchers, patients] = await Promise.all([
    readJson(PATHS.admin),
    readJson(PATHS.researcher),
    readJson(PATHS.patient)
  ]);
  return [...admins, ...researchers, ...patients];
}

export async function authenticateUser(identifier: string, pass: string) {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();
  
  const users = await getUsers();
  const user = users.find((u: any) => 
    (u.email?.toLowerCase() === cleanId || 
     u.assignedCode?.toLowerCase() === cleanId || 
     u.mobileNumber === cleanId) && 
    u.password === cleanPass
  );
  
  if (!user) {
    throw new Error("Credenciais inválidas. Verifique o código e a password.");
  }
  
  // Criar uma cópia segura sem a password para o cliente
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function createUser(userData: any) {
  const role: keyof typeof PATHS = userData.role;
  const users = await readJson(PATHS[role]);
  
  const prefix = role === 'patient' ? 'p' : role === 'researcher' ? 'r' : 'adm';
  const nextNum = users.length + 1;
  const code = `${prefix}${nextNum.toString().padStart(2, '0')}`;

  const newUser = {
    ...userData,
    id: uuidv4(),
    assignedCode: code,
    createdAt: new Date().toISOString(),
    chronicDiseases: userData.role === 'patient' ? [] : undefined
  };

  users.push(newUser);
  await writeJson(PATHS[role], users);
  return newUser;
}

export async function updateUser(userId: string, updates: any) {
  const allUsers = await getUsers();
  const originalUser = allUsers.find(u => u.id === userId);
  if (!originalUser) throw new Error("Utilizador não encontrado.");

  const role: keyof typeof PATHS = originalUser.role;
  const users = await readJson(PATHS[role]);
  const index = users.findIndex((u: any) => u.id === userId);

  if (index === -1) throw new Error("Erro na integridade dos dados.");

  users[index] = { ...users[index], ...updates };
  await writeJson(PATHS[role], users);
  return users[index];
}

export async function deleteUser(userId: string) {
  const allUsers = await getUsers();
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  const role: keyof typeof PATHS = user.role;
  const users = await readJson(PATHS[role]);
  const filtered = users.filter((u: any) => u.id !== userId);
  
  await writeJson(PATHS[role], filtered);
}
