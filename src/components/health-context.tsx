
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserProfile = {
  id: string;
  name: string;
  role: 'patient' | 'admin' | 'researcher';
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
    const stored = localStorage.getItem('chronic_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setUserProfileState(parsed);
        }
      } catch (e) {
        localStorage.removeItem('chronic_user');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('chronic_user');
    setUserProfileState(null);
    window.location.href = '/login';
  };

  const setUserProfile = (p: UserProfile | null) => {
    setUserProfileState(p);
    if (p) {
      localStorage.setItem('chronic_user', JSON.stringify(p));
    } else {
      localStorage.removeItem('chronic_user');
    }
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
