/**
 * GESTÃO DE UTILIZADORES - ChronicAI
 * Firebase Authentication (palavras-passe geridas pela Google, nunca guardadas
 * na base de dados) + Cloud Firestore (perfis em `users/{uid}`).
 */
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  getFirestore,
  runTransaction,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import { auth, db, getSecondaryApp } from '@/lib/firebase';

export type Role = 'patient' | 'researcher' | 'admin' | 'pending_researcher';

const PENDING_MSG =
  'A sua conta de investigador aguarda aprovação do administrador.';

function authErrorMessage(error: any): string {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está registado.';
    case 'auth/invalid-email':
      return 'O e-mail introduzido não é válido.';
    case 'auth/weak-password':
      return 'A palavra-passe deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenciais inválidas. Verifique o código e a palavra-passe.';
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Sem ligação à internet. Verifique a sua ligação.';
    default:
      return error?.message || 'Ocorreu um erro inesperado.';
  }
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as any) : null;
}

export async function getUsers(): Promise<any[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id }) as any)
    .sort((a, b) => String(a.assignedCode).localeCompare(String(b.assignedCode), 'pt', { numeric: true }));
}

/** Login com e-mail OU código atribuído (p01, r01...). */
export async function authenticateUser(identifier: string, pass: string) {
  const cleanId = identifier.trim().toLowerCase();
  let email = cleanId;

  if (!cleanId.includes('@')) {
    const codeSnap = await getDoc(doc(db, 'login_codes', cleanId));
    if (!codeSnap.exists()) {
      throw new Error('Credenciais inválidas. Verifique o código e a palavra-passe.');
    }
    email = codeSnap.data().email;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(cred.user.uid);
    if (!profile) {
      await signOut(auth);
      throw new Error('Esta conta foi removida. Contacte a equipa ChronicAI.');
    }
    if (profile.role === 'pending_researcher') {
      await signOut(auth);
      throw new Error(PENDING_MSG);
    }
    return profile;
  } catch (error: any) {
    if (error?.code) throw new Error(authErrorMessage(error));
    throw error;
  }
}

function secondaryDb(): Firestore {
  const app = getSecondaryApp();
  try {
    return initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(app);
  }
}

/**
 * Cria uma conta nova sem afetar a sessão atual.
 * Os investigadores ficam pendentes até um administrador os aprovar,
 * exceto quando é o próprio administrador a criar a conta.
 */
export async function createUser(userData: any) {
  const { password, role: requestedRole, ...rest } = userData;
  const email = String(rest.email || '').trim().toLowerCase();
  const wantsResearcher = requestedRole === 'researcher';

  const secAuth = getAuth(getSecondaryApp());
  const secDb = secondaryDb();

  let uid: string;
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    uid = cred.user.uid;
  } catch (error: any) {
    throw new Error(authErrorMessage(error));
  }

  try {
    const prefix = wantsResearcher ? 'r' : 'p';
    const counterRef = doc(secDb, 'counters', prefix);
    const code = await runTransaction(secDb, async (tx) => {
      const snap = await tx.get(counterRef);
      const last = snap.exists() ? Number(snap.data().last) || 0 : 0;
      const next = last + 1;
      if (snap.exists()) tx.update(counterRef, { last: next });
      else tx.set(counterRef, { last: next });
      return `${prefix}${String(next).padStart(2, '0')}`;
    });

    const newUser = {
      ...rest,
      email,
      role: (wantsResearcher ? 'pending_researcher' : 'patient') as Role,
      assignedCode: code,
      chronicDiseases: wantsResearcher ? [] : rest.chronicDiseases || [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(secDb, 'users', uid), newUser);
    await setDoc(doc(secDb, 'login_codes', code), { uid, email });

    // Um administrador autenticado aprova logo o investigador que criou.
    if (wantsResearcher && auth.currentUser) {
      const me = await getUserProfile(auth.currentUser.uid);
      if (me?.role === 'admin') {
        await updateDoc(doc(db, 'users', uid), { role: 'researcher' });
        newUser.role = 'researcher';
      }
    }

    return { ...newUser, id: uid };
  } finally {
    await signOut(secAuth);
  }
}

export async function updateUser(userId: string, updates: any) {
  // O e-mail de acesso e o código são geridos pelo Firebase Authentication
  // e não podem ser alterados a partir daqui.
  const {
    id,
    assignedCode,
    email,
    password,
    createdAt,
    ...safeUpdates
  } = updates || {};

  await updateDoc(doc(db, 'users', userId), safeUpdates);
  return { ...updates, id: userId };
}

/**
 * Remove o perfil e o código de acesso. A conta de autenticação deixa de
 * conseguir entrar; pode ser apagada definitivamente na consola do Firebase
 * (Authentication → Utilizadores).
 */
export async function deleteUser(userId: string) {
  const profile = await getUserProfile(userId);
  if (!profile) return;
  if (profile.assignedCode) {
    await deleteDoc(doc(db, 'login_codes', String(profile.assignedCode).toLowerCase()));
  }
  await deleteDoc(doc(db, 'users', userId));
}
