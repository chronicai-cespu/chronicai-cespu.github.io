
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, limit } from 'firebase/firestore';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
};

export type HealthEntry = {
  id: string;
  type: 'bp' | 'activity' | 'weight';
  value: string;
  timestamp: any;
  notes?: string;
  patientProfileId: string;
};

export type UserProfile = {
  name: string;
  age: number;
  gender: string;
  education: string;
  householdSize: string;
  healthUnit: string;
  weight: number;
  height: number;
  alcoholFreq: string;
  tobaccoFreq: string;
  physicalActivityLevel: string;
  motivationToChange: boolean;
  chronicDiseases: string[];
  diabetesInfo?: any;
  hypertensionInfo?: any;
  cholesterolInfo?: any;
  otherConditions: string;
  assignedCode?: string;
  role?: string;
};

interface HealthContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  logs: HealthEntry[];
  meds: Medication[];
  role: string | null;
  assignedCode: string | null;
  isLoading: boolean;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => user ? doc(db!, 'users', user.uid) : null, [db, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const profileDocRef = useMemoFirebase(() => user ? doc(db!, 'patient_profiles', user.uid) : null, [db, user]);
  const { data: profileData, isLoading: isProfileLoading } = useDoc(profileDocRef);

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'patient_profiles', user.uid, 'clinical_records'),
      orderBy('recordedAt', 'desc'),
      limit(20)
    );
  }, [db, user]);
  
  const { data: logsData } = useCollection(logsQuery);

  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profileData) {
      setLocalProfile(profileData as any);
    }
  }, [profileData]);

  const value = {
    userProfile: localProfile,
    setUserProfile: (p: UserProfile) => setLocalProfile(p),
    logs: (logsData || []).map(l => ({
      id: l.id,
      type: l.recordType,
      value: l.value,
      timestamp: l.recordedAt?.toDate ? l.recordedAt.toDate() : new Date(l.recordedAt),
      notes: l.notes,
      patientProfileId: l.patientProfileId
    })) as HealthEntry[],
    meds: [], // To be implemented with Firestore subcollection
    role: userData?.role || null,
    assignedCode: userData?.assignedCode || null,
    isLoading: isUserLoading || isUserDataLoading || isProfileLoading
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
