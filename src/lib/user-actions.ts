
'use server';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'src/app/lib/users-db.json');

export async function getUsers() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveUsers(users: any[]) {
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), 'utf8');
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
  const users = await getUsers();
  
  // Gerar código
  const prefix = userData.role === 'patient' ? 'p' : 'r';
  const roleUsers = users.filter((u: any) => u.role === userData.role);
  const code = `${prefix}${(roleUsers.length + 1).toString().padStart(2, '0')}`;

  const newUser = {
    ...userData,
    id: uuidv4(),
    assignedCode: code,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function updateUser(userId: string, updates: any) {
  const users = await getUsers();
  const index = users.findIndex((u: any) => u.id === userId);
  if (index === -1) throw new Error("Utilizador não encontrado.");

  users[index] = { ...users[index], ...updates };
  await saveUsers(users);
  return users[index];
}

export async function deleteUser(userId: string) {
  const users = await getUsers();
  const filtered = users.filter((u: any) => u.id !== userId);
  await saveUsers(filtered);
}
