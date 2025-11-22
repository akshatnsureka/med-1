export enum Frequency {
  DAILY = 'Daily',
  TWICE_DAILY = 'Twice Daily',
  WEEKLY = 'Weekly',
  AS_NEEDED = 'As Needed'
}

export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  description: string;
  currentStock: number;
  totalStock: number; // Initial stock to calculate percentages
  lowStockThreshold: number;
  expiryDate: string; // ISO Date string
  rate: number; // Cost per unit
  frequency: Frequency;
  prescriptionImage?: string; // Base64 string
}

export interface DoseLog {
  id: string;
  medicineId: string;
  timestamp: string;
  status: 'taken' | 'skipped' | 'missed';
}

export interface SymptomLog {
  id: string;
  userId: string;
  timestamp: string;
  description: string;
  severity: number; // 1-10
  aiAnalysis?: string;
}

export type Tab = 'dashboard' | 'inventory' | 'health' | 'settings';
