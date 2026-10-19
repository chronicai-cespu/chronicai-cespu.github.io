
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/user-actions';

export type UserProfile = {
  id: string;
  name: string;
  role: 'patient' | 'admin' | 'researcher' | 'pending_researcher';
  assignedCode: string;
  email?: string;
  mobileNumber?: string;
  chronicDiseases: string[];
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  alcoholFreq?: string;
  tobaccoFreq?: string;
  physicalActivityLevel?: string;
  motivationToChange?: boolean;
  birthDate?: string;
  education?: string;
  householdSize?: string;
  healthUnit?: string;
  otherConditions?: string;
  medicationDescription?: string;
  medications?: any[];
  allergies?: string[];
  recentHealthConcerns?: string;
};

interface HealthContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  role: string | null;
  assignedCode: string | null;
  isLoading: boolean;
  logout: () => void;
  logs: any[];
  meds: any[];
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // A sessão é gerida pelo Firebase Authentication; o perfil vem do Firestore.
    try { localStorage.removeItem('chronic_user'); } catch {}
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserProfileState(null);
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        if (!profile || profile.role === 'pending_researcher') {
          setUserProfileState(null);
        } else {
          setUserProfileState(profile);
        }
      } catch (e) {
        console.error('Erro ao carregar o perfil:', e);
        setUserProfileState(null);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try { await signOut(auth); } catch {}
    setUserProfileState(null);
    window.location.href = '/login';
  };

  const setUserProfile = (p: UserProfile | null) => {
    setUserProfileState(p);
  };

  const value = {
    userProfile,
    setUserProfile,
    role: userProfile?.role || null,
    assignedCode: userProfile?.assignedCode || null,
    isLoading,
    logout,
    logs: [],
    meds: []
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth deve ser usado dentro de um HealthProvider');
  }
  return context;
}
