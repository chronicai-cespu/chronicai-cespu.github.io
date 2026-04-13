
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
  birthDate: string;
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
  email?: string;
  mobileNumber?: string;
};

interface HealthContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  logs: HealthEntry[];
  addLog: (log: { type: 'bp' | 'activity' | 'weight', value: string, notes?: string }) => void;
  meds: Medication[];
  role: string | null;
  assignedCode: string | null;
  isLoading: boolean;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const profileDocRef = useMemoFirebase(() => (db && user) ? doc(db, 'patient_profiles', user.uid) : null, [db, user]);
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
    if (userData && db && user) {
      if (userData.role === 'researcher') {
        const markerRef = doc(db, 'roles_researcher', user.uid);
        setDocumentNonBlocking(markerRef, { active: true }, { merge: true });
      } else if (userData.role === 'admin') {
        const markerRef = doc(db, 'roles_admin', user.uid);
        setDocumentNonBlocking(markerRef, { active: true }, { merge: true });
      }
    }

    if (profileData) {
      setLocalProfile({
        ...(profileData as any),
        role: userData?.role,
        assignedCode: userData?.assignedCode,
        name: userData?.name || profileData.name,
        email: userData?.email,
        mobileNumber: userData?.mobileNumber
      });
    } else if (userData) {
      setLocalProfile({
        name: userData.role === 'admin' ? 'Administrador' : (userData.name || 'Utilizador'),
        role: userData.role,
        assignedCode: userData.assignedCode,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        chronicDiseases: []
      } as any);
    } else {
      setLocalProfile(null);
    }
  }, [profileData, userData, db, user]);

  const addLog = ({ type, value, notes }: { type: 'bp' | 'activity' | 'weight', value: string, notes?: string }) => {
    if (!db || !user) return;
    const colRef = collection(db, 'patient_profiles', user.uid, 'clinical_records');
    addDocumentNonBlocking(colRef, {
      patientProfileId: user.uid,
      recordType: type,
      value,
      notes: notes || '',
      recordedAt: serverTimestamp()
    });
  };

  const value = {
    userProfile: localProfile,
    setUserProfile: (p: UserProfile) => {
      setLocalProfile(p);
      if (db && user) {
        const profileRef = doc(db, 'patient_profiles', user.uid);
        updateDocumentNonBlocking(profileRef, p);
      }
    },
    logs: (logsData || []).map(l => ({
      id: l.id,
      type: l.recordType,
      value: l.value,
      timestamp: l.recordedAt?.toDate ? l.recordedAt.toDate() : (l.recordedAt ? new Date(l.recordedAt) : new Date()),
      notes: l.notes,
      patientProfileId: l.patientProfileId
    })) as HealthEntry[],
    addLog,
    meds: [], 
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
