export type AppointmentStatus =
  | 'confirmed'
  | 'checked_in'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Provider {
  id: number;
  name: string;
  specialty: string;
  department: string;
  roomNumber: string;
  avatarUrl: string;
  availableDays: string[];
}

export interface Service {
  id: number;
  providerId: number;
  title: string;
  durationMinutes: number;
  price: number;
  description: string;
}

export interface TimeSlot {
  id: number;
  providerId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isBooked: boolean;
}

export interface Appointment {
  id: number;
  tokenNumber: string; // e.g., A-101
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  providerId: number;
  serviceId: number;
  slotId: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  checkInTime?: string;
  notes?: string;
  createdAt: string;
}

export interface QueueStats {
  totalToday: number;
  checkedInWaiting: number;
  currentlyServing: number;
  completedToday: number;
  avgWaitMinutes: number;
}

export type ActiveTab = 'admin' | 'patient_portal' | 'mysql_architecture';

export interface SqlExecutionResult {
  query: string;
  rowCount: number;
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
}
