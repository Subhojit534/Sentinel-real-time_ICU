export type PatientStatus = 'stable' | 'watch' | 'warning' | 'critical' | 'code';
export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'escalated' | 'resolved';
export type UserRole = 'doctor' | 'nurse' | 'admin';

export interface VitalReading {
  time: string;
  hr: number;
  spo2: number;
  sbp: number;
  dbp: number;
  temp: number;
  rr: number;
  map: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  bedId: string;
  wardId: string;
  admissionDate: string;
  diagnosis: string;
  status: PatientStatus;
  news2: number;
  aiRiskScore: number; // 0–100
  vitals: {
    hr: number;
    spo2: number;
    sbp: number;
    dbp: number;
    temp: number;
    rr: number;
    map: number;
  };
  trend: VitalReading[];
  attendingPhysician: string;
  primaryNurse: string;
}

export interface Bed {
  id: string;
  wardId: string;
  number: string;
  status: 'occupied' | 'available' | 'maintenance' | 'reserved';
  patientId?: string;
}

export interface Ward {
  id: string;
  name: string;
  hospitalId: string;
  totalBeds: number;
  occupiedBeds: number;
  criticalPatients: number;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  wardId: string;
  wardName: string;
  type: string;
  triggerMetric: string;
  triggerValue: string;
  normalRange: string;
  news2: number;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo: string;
  escalationLevel: number;
  notes?: string;
  aiGenerated: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  hospitalId: string;
  wardId: string;
  email: string;
  avatar?: string;
}
