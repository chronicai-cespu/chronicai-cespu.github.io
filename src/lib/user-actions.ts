
'use server';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const PATHS = {
  admin: path.join(process.cwd(), 'src/app/lib/admins.json'),
  researcher: path.join(process.cwd(), 'src/app/lib/researchers.json'),
  patient: path.join(process.cwd(), 'src/app/lib/patients.json'),
};

async function readJson(filePath: string) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeJson(filePath: string, data: any[]) {
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
  const users = await getUsers();
  const user = users.find((u: any) => 
    (u.email === identifier || u.assignedCode === identifier || u.mobileNumber === identifier) && 
    u.password === pass
  );
  
  if (!user) throw new Error("Credenciais inválidas.");
  return { id: user.id, role: user.role, name: user.name, assignedCode: user.assignedCode };
}

export async function createUser(userData: any) {
  const role: keyof typeof PATHS = userData.role;
  const users = await readJson(PATHS[role]);
  
  // Gerar código sequencial para o papel específico
  const prefix = role === 'patient' ? 'p' : role === 'researcher' ? 'r' : 'adm';
  const code = `${prefix}${(users.length + 1).toString().padStart(2, '0')}`;

  const newUser = {
    ...userData,
    id: uuidv4(),
    assignedCode: code,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeJson(PATHS[role], users);
  return newUser;
}

export async function updateUser(userId: string, updates: any) {
  // Primeiro identificar o papel para saber qual ficheiro editar
  const allUsers = await getUsers();
  const originalUser = allUsers.find(u => u.id === userId);
  if (!originalUser) throw new Error("Utilizador não encontrado.");

  const role: keyof typeof PATHS = originalUser.role;
  const users = await readJson(PATHS[role]);
  const index = users.findIndex((u: any) => u.id === userId);

  if (index === -1) throw new Error("Erro na integridade dos ficheiros.");

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
