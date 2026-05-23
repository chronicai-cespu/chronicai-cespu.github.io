
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

const INITIAL_DATA = {
  admin: [{
    "id": "admin-id-01",
    "name": "Administrador ChronicAI",
    "email": "chronicai.cespu@gmail.com",
    "password": "ditechAI2526",
    "role": "admin",
    "assignedCode": "admin2526",
    "mobileNumber": "910000000",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }],
  researcher: [{
    "id": "researcher-id-01",
    "name": "Investigador DiTech",
    "email": "investigador@ditech.pt",
    "password": "investigador25",
    "role": "researcher",
    "assignedCode": "r01",
    "mobileNumber": "920000000",
    "createdAt": "2025-01-10T10:00:00.000Z"
  }],
  patient: [{
    "id": "patient-id-01",
    "name": "Maria Silva",
    "email": "maria.silva@email.com",
    "password": "maria123",
    "role": "patient",
    "assignedCode": "p01",
    "mobileNumber": "930000000",
    "chronicDiseases": ["Hipertensão"],
    "createdAt": "2025-01-15T09:00:00.000Z"
  }]
};

async function ensureDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJson(filePath: string, type: keyof typeof INITIAL_DATA) {
  await ensureDir();
  try {
    const content = await fs.readFile(filePath, 'utf8');
    if (!content || content.trim() === '') return INITIAL_DATA[type];
    return JSON.parse(content);
  } catch (error) {
    // Se o ficheiro não existir, cria com dados iniciais
    await writeJson(filePath, INITIAL_DATA[type]);
    return INITIAL_DATA[type];
  }
}

async function writeJson(filePath: string, data: any[]) {
  await ensureDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function getUsers() {
  const [admins, researchers, patients] = await Promise.all([
    readJson(PATHS.admin, 'admin'),
    readJson(PATHS.researcher, 'researcher'),
    readJson(PATHS.patient, 'patient')
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
  
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function createUser(userData: any) {
  const role: keyof typeof PATHS = userData.role;
  const users = await readJson(PATHS[role], role as any);
  
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
  const users = await readJson(PATHS[role], role as any);
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
  const users = await readJson(PATHS[role], role as any);
  const filtered = users.filter((u: any) => u.id !== userId);
  
  await writeJson(PATHS[role], filtered);
}
