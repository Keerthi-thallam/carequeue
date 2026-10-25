import { Appointment, AppointmentStatus, Provider, QueueStats, Service, SqlExecutionResult, TimeSlot } from '../types';
import { generateInitialAppointments, generateInitialSlots, INITIAL_PROVIDERS, INITIAL_SERVICES, getTodayDateString } from '../data/mockData';

class CareQueueDatabaseStore {
  private providers: Provider[] = [];
  private services: Service[] = [];
  private slots: TimeSlot[] = [];
  private appointments: Appointment[] = [];
  private listeners: Set<() => void> = new Set();
  private lastTokenNumber: number = 106;

  constructor() {
    this.init();
  }

  private init() {
    this.providers = [...INITIAL_PROVIDERS];
    this.services = [...INITIAL_SERVICES];
    this.slots = generateInitialSlots();
    this.appointments = generateInitialAppointments(this.slots);
    this.lastTokenNumber = Math.max(...this.appointments.map((a) => parseInt(a.tokenNumber.replace(/\D/g, ''), 10) || 100), 106);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getProviders(): Provider[] {
    return this.providers;
  }

  public getServices(): Service[] {
    return this.services;
  }

  public getSlots(providerId?: number, date?: string): TimeSlot[] {
    return this.slots.filter((s) => {
      if (providerId && s.providerId !== providerId) return false;
      if (date && s.date !== date) return false;
      return true;
    });
  }

  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public getQueueStats(): QueueStats {
    const today = getTodayDateString();
    const todayApps = this.appointments.filter((a) => a.date === today && a.status !== 'cancelled');
    const checkedIn = todayApps.filter((a) => a.status === 'checked_in').length;
    const inConsultation = todayApps.filter((a) => a.status === 'in_consultation').length;
    const completed = todayApps.filter((a) => a.status === 'completed').length;

    return {
      totalToday: todayApps.length,
      checkedInWaiting: checkedIn,
      currentlyServing: inConsultation,
      completedToday: completed,
      avgWaitMinutes: 14,
    };
  }

  public getCurrentPatient(): Appointment | null {
    const today = getTodayDateString();
    return this.appointments.find((a) => a.date === today && a.status === 'in_consultation') || null;
  }

  public getNextInQueue(): Appointment | null {
    const today = getTodayDateString();
    return this.appointments.find((a) => a.date === today && a.status === 'checked_in') || null;
  }

  /**
   * Simulates transactional booking:
   * START TRANSACTION;
   * SELECT * FROM time_slots WHERE id = ? FOR UPDATE;
   * UPDATE time_slots SET is_booked = 1 WHERE id = ?;
   * INSERT INTO appointments ...;
   * COMMIT;
   */
  public bookAppointment(params: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    providerId: number;
    serviceId: number;
    slotId: number;
    notes?: string;
  }): { success: boolean; appointment?: Appointment; error?: string } {
    const slotIndex = this.slots.findIndex((s) => s.id === params.slotId);

    if (slotIndex === -1) {
      return { success: false, error: 'Target time slot does not exist.' };
    }

    const slot = this.slots[slotIndex];
    if (slot.isBooked) {
      return {
        success: false,
        error: `Slot collision: The ${slot.startTime} slot is already reserved. Transaction rolled back.`,
      };
    }

    // Mark slot as booked
    this.slots[slotIndex] = {
      ...slot,
      isBooked: true,
    };

    // Increment token
    this.lastTokenNumber += 1;
    const prefix = params.providerId === 1 ? 'A' : params.providerId === 2 ? 'B' : params.providerId === 3 ? 'C' : 'D';
    const tokenNumber = `${prefix}-${this.lastTokenNumber}`;

    const newAppointment: Appointment = {
      id: Date.now(),
      tokenNumber,
      patientName: params.patientName.trim(),
      patientPhone: params.patientPhone.trim(),
      patientEmail: params.patientEmail.trim(),
      providerId: params.providerId,
      serviceId: params.serviceId,
      slotId: params.slotId,
      date: slot.date,
      time: slot.startTime,
      status: 'confirmed',
      notes: params.notes?.trim() || 'Booked via client reservation flow',
      createdAt: new Date().toISOString(),
    };

    this.appointments.push(newAppointment);
    this.notify();

    return { success: true, appointment: newAppointment };
  }

  public updateAppointmentStatus(appointmentId: number, status: AppointmentStatus): boolean {
    const index = this.appointments.findIndex((a) => a.id === appointmentId);
    if (index === -1) return false;

    const current = this.appointments[index];
    const updated: Appointment = {
      ...current,
      status,
    };

    if (status === 'checked_in' && !updated.checkInTime) {
      const now = new Date();
      updated.checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (status === 'cancelled') {
      // Release slot
      const slotIndex = this.slots.findIndex((s) => s.id === current.slotId);
      if (slotIndex !== -1) {
        this.slots[slotIndex] = { ...this.slots[slotIndex], isBooked: false };
      }
    }

    this.appointments[index] = updated;
    this.notify();
    return true;
  }

  public callNextPatient(): { success: boolean; appointment?: Appointment; message: string } {
    const today = getTodayDateString();
    const currentInConsult = this.appointments.find((a) => a.date === today && a.status === 'in_consultation');

    // If someone is currently in consultation, complete them first
    if (currentInConsult) {
      const currentIdx = this.appointments.findIndex((a) => a.id === currentInConsult.id);
      if (currentIdx !== -1) {
        this.appointments[currentIdx] = { ...this.appointments[currentIdx], status: 'completed' };
      }
    }

    // Find next checked_in patient
    const nextPatient = this.appointments.find((a) => a.date === today && a.status === 'checked_in');

    if (!nextPatient) {
      this.notify();
      return {
        success: false,
        message: 'No patients currently waiting in Checked-In queue.',
      };
    }

    const nextIdx = this.appointments.findIndex((a) => a.id === nextPatient.id);
    this.appointments[nextIdx] = { ...this.appointments[nextIdx], status: 'in_consultation' };
    this.notify();

    return {
      success: true,
      appointment: this.appointments[nextIdx],
      message: `Token ${nextPatient.tokenNumber} (${nextPatient.patientName}) called into consultation.`,
    };
  }

  public resetDatabase(): void {
    this.init();
    this.notify();
  }

  /**
   * Executes SQL-like queries against in-memory relational tables
   */
  public executeSql(sql: string): SqlExecutionResult {
    const startTime = performance.now();
    const cleanSql = sql.trim().replace(/;+$/, '');
    const lower = cleanSql.toLowerCase();

    let rows: Record<string, any>[] = [];
    let columns: string[] = [];

    if (lower.includes('from appointments') || lower.includes('from appointment')) {
      columns = ['id', 'token_number', 'patient_name', 'phone', 'time', 'status', 'provider_id'];
      rows = this.appointments.map((a) => ({
        id: a.id,
        token_number: a.tokenNumber,
        patient_name: a.patientName,
        phone: a.patientPhone,
        time: `${a.date} ${a.time}`,
        status: a.status,
        provider_id: a.providerId,
      }));
    } else if (lower.includes('from providers') || lower.includes('from provider')) {
      columns = ['id', 'name', 'specialty', 'department', 'room_number'];
      rows = this.providers.map((p) => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        department: p.department,
        room_number: p.roomNumber,
      }));
    } else if (lower.includes('from services') || lower.includes('from service')) {
      columns = ['id', 'provider_id', 'title', 'duration_min', 'price'];
      rows = this.services.map((s) => ({
        id: s.id,
        provider_id: s.providerId,
        title: s.title,
        duration_min: s.durationMinutes,
        price: `$${s.price.toFixed(2)}`,
      }));
    } else if (lower.includes('from time_slots') || lower.includes('from slots')) {
      columns = ['id', 'provider_id', 'date', 'start_time', 'end_time', 'is_booked'];
      rows = this.slots.slice(0, 20).map((s) => ({
        id: s.id,
        provider_id: s.providerId,
        date: s.date,
        start_time: s.startTime,
        end_time: s.endTime,
        is_booked: s.isBooked ? 1 : 0,
      }));
    } else {
      // Default: join appointments with providers
      columns = ['token', 'patient', 'doctor', 'service', 'status', 'time'];
      rows = this.appointments.slice(0, 10).map((a) => {
        const prov = this.providers.find((p) => p.id === a.providerId);
        const serv = this.services.find((s) => s.id === a.serviceId);
        return {
          token: a.tokenNumber,
          patient: a.patientName,
          doctor: prov?.name || 'Unknown',
          service: serv?.title || 'Consultation',
          status: a.status,
          time: a.time,
        };
      });
    }

    const executionTimeMs = parseFloat((performance.now() - startTime + 0.8).toFixed(2));

    return {
      query: cleanSql,
      rowCount: rows.length,
      columns,
      rows,
      executionTimeMs,
    };
  }
}

export const dbStore = new CareQueueDatabaseStore();
