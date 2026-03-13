"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  timestamp: Date;
  notes?: string;
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
  diabetesInfo?: {
    duration: string;
    insulinDependent: boolean;
    meds: string;
    symptoms: string[];
  };
  hypertensionInfo?: {
    highestReading: string;
    regularReading: string;
    meds: string;
    symptoms: string;
  };
  cholesterolInfo?: {
    highestReading: string;
    regularReading: string;
    highTriglycerides: boolean;
    meds: string;
  };
  otherConditions: string;
  allergies: string[];
  recentHealthConcerns: string;
};

interface HealthContextType {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  logs: HealthEntry[];
  addLog: (entry: Omit<HealthEntry, 'id' | 'timestamp'>) => void;
  meds: Medication[];
  addMed: (med: Omit<Medication, 'id'>) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'João Silva',
    age: 68,
    gender: 'Masculino',
    education: 'Ensino Básico',
    householdSize: '2 pessoas',
    healthUnit: 'Centro de Saúde de Arroios',
    weight: 82,
    height: 175,
    alcoholFreq: 'Ocasional',
    tobaccoFreq: 'Não fumador',
    physicalActivityLevel: 'Baixa',
    motivationToChange: true,
    chronicDiseases: ['Hipertensão', 'Diabetes'],
    diabetesInfo: {
      duration: '10 anos',
      insulinDependent: false,
      meds: 'Metformina',
      symptoms: ['Fadiga']
    },
    hypertensionInfo: {
      highestReading: '160/95',
      regularReading: '135/85',
      meds: 'Lisinopril',
      symptoms: 'Nenhuns'
    },
    otherConditions: '',
    allergies: ['Penicilina'],
    recentHealthConcerns: 'Leve elevação nas leituras de pressão arterial matinais.',
  });

  const [logs, setLogs] = useState<HealthEntry[]>([
    { id: '1', type: 'bp', value: '135/85', timestamp: new Date(Date.now() - 86400000), notes: 'Check matinal' },
    { id: '2', type: 'activity', value: '30 min de caminhada', timestamp: new Date(Date.now() - 43200000), notes: 'Trilha no parque' },
  ]);

  const [meds, setMeds] = useState<Medication[]>([
    { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Uma vez ao dia' },
    { id: 'm2', name: 'Metformina', dosage: '500mg', frequency: 'Duas vezes ao dia' },
  ]);

  const addLog = (entry: Omit<HealthEntry, 'id' | 'timestamp'>) => {
    const newEntry: HealthEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const addMed = (med: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...med,
      id: Math.random().toString(36).substr(2, 9),
    };
    setMeds((prev) => [...prev, newMed]);
  };

  return (
    <HealthContext.Provider value={{ userProfile, setUserProfile, logs, addLog, meds, addMed }}>
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
