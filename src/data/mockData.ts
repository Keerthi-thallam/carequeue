import { Provider, Service, TimeSlot, Appointment } from '../types';

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getTomorrowDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: 'Dr. Sarah Chen, MD',
    specialty: 'Internal Medicine',
    department: 'General Care & Diagnostics',
    roomNumber: 'Suite 204',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=240',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 2,
    name: 'Dr. Marcus Vance, MD',
    specialty: 'Cardiovascular Care',
    department: 'Heart & Vascular',
    roomNumber: 'Suite 310',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=240',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday'],
  },
  {
    id: 3,
    name: 'Dr. Elena Rostova, MD',
    specialty: 'Pediatrics & Adolescent Care',
    department: 'Children’s Health',
    roomNumber: 'Suite 108',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813575-5244beeb8c27?auto=format&fit=crop&q=80&w=240',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
  },
  {
    id: 4,
    name: 'Dr. James Wilson, DO',
    specialty: 'Dermatology & Skin Health',
    department: 'Dermatology Clinic',
    roomNumber: 'Suite 402',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=240',
    availableDays: ['Monday', 'Thursday', 'Friday'],
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 1,
    providerId: 1,
    title: 'General Health Consultation',
    durationMinutes: 30,
    price: 65,
    description: 'Comprehensive physical examination, prescription renewal, and chronic care triage.',
  },
  {
    id: 2,
    providerId: 1,
    title: 'Routine Bloodwork & Lab Review',
    durationMinutes: 20,
    price: 45,
    description: 'Discussion of lipid profile, metabolic panel, and diagnostic next steps.',
  },
  {
    id: 3,
    providerId: 2,
    title: 'ECG & Cardiovascular Triage',
    durationMinutes: 45,
    price: 130,
    description: '12-lead resting electrocardiogram, arterial blood pressure check, and symptom review.',
  },
  {
    id: 4,
    providerId: 3,
    title: 'Pediatric Wellness Check',
    durationMinutes: 30,
    price: 75,
    description: 'Developmental milestones assessment, standard immunizations, and growth tracking.',
  },
  {
    id: 5,
    providerId: 4,
    title: 'Full Body Skin Exam & Lesion Check',
    durationMinutes: 25,
    price: 90,
    description: 'Dermoscopic evaluation of suspicious moles, rashes, and cutaneous lesions.',
  },
];

export const generateInitialSlots = (): TimeSlot[] => {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  const slots: TimeSlot[] = [];
  let slotId = 1;

  [today, tomorrow].forEach((date) => {
    INITIAL_PROVIDERS.forEach((provider) => {
      times.forEach((time) => {
        const [h, m] = time.split(':').map(Number);
        const endMinutes = m + 30;
        const endHour = endMinutes >= 60 ? h + 1 : h;
        const endMinFormatted = endMinutes % 60 === 0 ? '00' : '30';
        const endTime = `${String(endHour).padStart(2, '0')}:${endMinFormatted}`;

        // Mark some morning slots as booked initially to create realistic state
        const isBooked = date === today && (time === '09:00' || time === '09:30' || time === '10:00' || time === '10:30' || time === '11:00');

        slots.push({
          id: slotId++,
          providerId: provider.id,
          date,
          startTime: time,
          endTime,
          isBooked,
        });
      });
    });
  });

  return slots;
};

export const generateInitialAppointments = (slots: TimeSlot[]): Appointment[] => {
  const today = getTodayDateString();

  return [
    {
      id: 101,
      tokenNumber: 'A-101',
      patientName: 'Marcus Vance Jr.',
      patientPhone: '+1 (555) 234-8901',
      patientEmail: 'marcus.v@example.com',
      providerId: 1,
      serviceId: 1,
      slotId: slots.find((s) => s.date === today && s.providerId === 1 && s.startTime === '09:00')?.id || 1,
      date: today,
      time: '09:00',
      status: 'completed',
      checkInTime: '08:52 AM',
      notes: 'Completed routine physical. Prescription refilled for 90 days.',
      createdAt: `${today}T08:15:00Z`,
    },
    {
      id: 102,
      tokenNumber: 'A-102',
      patientName: 'Devon Miller',
      patientPhone: '+1 (555) 872-1144',
      patientEmail: 'dmiller92@example.com',
      providerId: 1,
      serviceId: 2,
      slotId: slots.find((s) => s.date === today && s.providerId === 1 && s.startTime === '09:30')?.id || 2,
      date: today,
      time: '09:30',
      status: 'in_consultation',
      checkInTime: '09:20 AM',
      notes: 'Reviewed elevated fasting glucose; ordered HbA1c repeat in 8 weeks.',
      createdAt: `${today}T08:30:00Z`,
    },
    {
      id: 103,
      tokenNumber: 'A-103',
      patientName: 'Priya Patel',
      patientPhone: '+1 (555) 612-4099',
      patientEmail: 'priya.patel@example.com',
      providerId: 1,
      serviceId: 1,
      slotId: slots.find((s) => s.date === today && s.providerId === 1 && s.startTime === '10:00')?.id || 3,
      date: today,
      time: '10:00',
      status: 'checked_in',
      checkInTime: '09:48 AM',
      notes: 'Experiencing seasonal asthma flare-up; requests inhaler review.',
      createdAt: `${today}T08:45:00Z`,
    },
    {
      id: 104,
      tokenNumber: 'A-104',
      patientName: 'Claire Beauchamp',
      patientPhone: '+1 (555) 349-7812',
      patientEmail: 'claire.b@example.com',
      providerId: 2,
      serviceId: 3,
      slotId: slots.find((s) => s.date === today && s.providerId === 2 && s.startTime === '10:30')?.id || 15,
      date: today,
      time: '10:30',
      status: 'checked_in',
      checkInTime: '10:12 AM',
      notes: 'Mild palpitations after light exertion. Baseline resting ECG scheduled.',
      createdAt: `${today}T09:00:00Z`,
    },
    {
      id: 105,
      tokenNumber: 'A-105',
      patientName: 'Liam O’Connor',
      patientPhone: '+1 (555) 902-3341',
      patientEmail: 'liam.oc@example.com',
      providerId: 3,
      serviceId: 4,
      slotId: slots.find((s) => s.date === today && s.providerId === 3 && s.startTime === '11:00')?.id || 27,
      date: today,
      time: '11:00',
      status: 'confirmed',
      notes: '6-year-old school entrance checkup and booster vaccines.',
      createdAt: `${today}T09:10:00Z`,
    },
    {
      id: 106,
      tokenNumber: 'A-106',
      patientName: 'Sofia Al-Mansoor',
      patientPhone: '+1 (555) 438-9210',
      patientEmail: 'sofia.am@example.com',
      providerId: 4,
      serviceId: 5,
      slotId: slots.find((s) => s.date === today && s.providerId === 4 && s.startTime === '11:30')?.id || 39,
      date: today,
      time: '11:30',
      status: 'confirmed',
      notes: 'Evaluating recurring contact dermatitis on forearm.',
      createdAt: `${today}T09:25:00Z`,
    },
  ];
};
