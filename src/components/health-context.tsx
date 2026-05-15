
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserProfile = {
  id: string;
  name: string;
  role: string;
  assignedCode: string;
  email?: string;
  mobileNumber?: string;
  chronicDiseases: string[];
};

interface HealthContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  role: string | null;
  assignedCode: string | null;
  isLoading: boolean;
  logout: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('chronic_user');
    if (stored) {
      setUserProfileState(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('chronic_user');
    setUserProfileState(null);
    window.location.href = '/login';
  };

  const value = {
    userProfile,
    setUserProfile: (p: UserProfile) => {
      setUserProfileState(p);
      localStorage.setItem('chronic_user', JSON.stringify(p));
    },
    role: userProfile?.role || null,
    assignedCode: userProfile?.assignedCode || null,
    isLoading,
    logout
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
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
