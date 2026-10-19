/**
 * Inicialização do Firebase no browser (versão estática, plano Spark gratuito).
 *
 * - Authentication (email/palavra-passe)
 * - Cloud Firestore (dados clínicos, perfis, auditoria)
 * - Firebase AI Logic com a Gemini Developer API (nível gratuito)
 * - App Check opcional (reCAPTCHA v3) para proteger a quota da IA
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, type Firestore } from 'firebase/firestore';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig } from '@/firebase/config';

export const AI_MODEL = 'gemini-2.5-flash';

function createApp(): FirebaseApp {
  if (getApps().some((a) => a.name === '[DEFAULT]')) return getApp();
  const app = initializeApp(firebaseConfig);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (siteKey && typeof window !== 'undefined') {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
  return app;
}

function createFirestore(app: FirebaseApp): Firestore {
  try {
    // Ignora campos `undefined` em vez de falhar a escrita.
    return initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    return getFirestore(app);
  }
}

export const app = createApp();
export const auth = getAuth(app);
export const db = createFirestore(app);

const ai = getAI(app, { backend: new GoogleAIBackend() });

/** Modelo Gemini configurado para devolver JSON. */
export function jsonModel(responseSchema: any, systemInstruction?: string) {
  return getGenerativeModel(ai, {
    model: AI_MODEL,
    systemInstruction,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });
}

/**
 * Instância secundária do Firebase usada apenas para criar contas novas.
 * Criar uma conta com a instância principal terminaria a sessão de quem
 * está autenticado (ex.: um administrador a registar um paciente).
 */
export function getSecondaryApp(): FirebaseApp {
  const name = 'account-creation';
  return getApps().find((a) => a.name === name) ?? initializeApp(firebaseConfig, name);
}
