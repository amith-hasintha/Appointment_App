import { Appointment, AppointmentFormData } from '@/types/appointment';

export const STORAGE_KEY = 'carepoint_appointments_v1';
export const STORAGE_VERSION = 1;

export interface StoragePayload {
  version: number;
  data: Appointment[];
}

export const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-demo-01',
    patientName: 'Eleanor Vance',
    appointmentDate: '2026-10-20',
    appointmentTime: '09:30',
    doctor: 'Dr. Sarah Jenkins (Cardiology)',
    appointmentType: 'Cardiology',
    status: 'Confirmed',
    createdAt: '2026-10-10T08:00:00.000Z',
    updatedAt: '2026-10-10T08:00:00.000Z',
  },
  {
    id: 'apt-demo-02',
    patientName: 'Marcus Sterling',
    appointmentDate: '2026-10-22',
    appointmentTime: '10:15',
    doctor: 'Dr. Michael Chen (General Medicine)',
    appointmentType: 'General Consultation',
    status: 'Scheduled',
    createdAt: '2026-10-11T09:30:00.000Z',
    updatedAt: '2026-10-11T09:30:00.000Z',
  },
  {
    id: 'apt-demo-03',
    patientName: 'Sophia Ramirez',
    appointmentDate: '2026-10-14',
    appointmentTime: '14:00',
    doctor: 'Dr. Emily Rodriguez (Dermatology)',
    appointmentType: 'Dermatology',
    status: 'Completed',
    createdAt: '2026-10-01T11:00:00.000Z',
    updatedAt: '2026-10-14T15:00:00.000Z',
  },
  {
    id: 'apt-demo-04',
    patientName: 'Arthur Pendelton',
    appointmentDate: '2026-10-25',
    appointmentTime: '11:45',
    doctor: 'Dr. James Wilson (Dental Surgery)',
    appointmentType: 'Dental',
    status: 'Scheduled',
    createdAt: '2026-10-12T14:20:00.000Z',
    updatedAt: '2026-10-12T14:20:00.000Z',
  },
  {
    id: 'apt-demo-05',
    patientName: 'Clara Oswald',
    appointmentDate: '2026-10-18',
    appointmentTime: '15:30',
    doctor: 'Dr. Lisa Patel (Pediatrics & Family Medicine)',
    appointmentType: 'Follow-up',
    status: 'Confirmed',
    createdAt: '2026-10-08T10:15:00.000Z',
    updatedAt: '2026-10-09T16:00:00.000Z',
  },
  {
    id: 'apt-demo-06',
    patientName: 'David Thorne',
    appointmentDate: '2026-10-12',
    appointmentTime: '16:00',
    doctor: 'Dr. Robert Taylor (Orthopedics)',
    appointmentType: 'Other',
    status: 'Cancelled',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-11T13:45:00.000Z',
  },
  {
    id: 'apt-demo-07',
    patientName: 'Maya Lin',
    appointmentDate: '2026-10-05',
    appointmentTime: '13:30',
    doctor: 'Dr. Sarah Jenkins (Cardiology)',
    appointmentType: 'Follow-up',
    status: 'Completed',
    createdAt: '2026-09-28T08:30:00.000Z',
    updatedAt: '2026-10-05T14:15:00.000Z',
  },
  {
    id: 'apt-demo-08',
    patientName: 'Henry Gallagher',
    appointmentDate: '2026-10-28',
    appointmentTime: '08:45',
    doctor: 'Dr. Michael Chen (General Medicine)',
    appointmentType: 'General Consultation',
    status: 'Scheduled',
    createdAt: '2026-10-13T17:00:00.000Z',
    updatedAt: '2026-10-13T17:00:00.000Z',
  },
];

/**
 * Checks whether localStorage is available and accessible.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__carepoint_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether an unknown object fits the Appointment schema.
 */
function isValidAppointmentRecord(item: unknown): item is Appointment {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.patientName === 'string' &&
    typeof candidate.appointmentDate === 'string' &&
    typeof candidate.appointmentTime === 'string' &&
    typeof candidate.doctor === 'string' &&
    typeof candidate.appointmentType === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

/**
 * Retrieves all stored appointments.
 * If no appointments exist in storage, seeds fictional demo data.
 * Gracefully handles malformed stored data by falling back to demo data.
 */
export function getStoredAppointments(): Appointment[] {
  if (!isStorageAvailable()) {
    // In SSR or when storage is unavailable, return initial demo data
    return [...INITIAL_DEMO_APPOINTMENTS];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit: Seed demo data
      saveAppointments(INITIAL_DEMO_APPOINTMENTS);
      return [...INITIAL_DEMO_APPOINTMENTS];
    }

    const parsed: unknown = JSON.parse(raw);

    // Support both direct array format and { version, data } wrapper
    let items: unknown[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      'data' in parsed &&
      Array.isArray((parsed as StoragePayload).data)
    ) {
      items = (parsed as StoragePayload).data;
    } else {
      console.warn('CarePoint Storage: Malformed format detected, re-seeding demo data.');
      saveAppointments(INITIAL_DEMO_APPOINTMENTS);
      return [...INITIAL_DEMO_APPOINTMENTS];
    }

    // Filter valid records
    const validAppointments = items.filter(isValidAppointmentRecord);
    if (validAppointments.length === 0 && items.length > 0) {
      console.warn('CarePoint Storage: No valid appointments found in data, re-seeding.');
      saveAppointments(INITIAL_DEMO_APPOINTMENTS);
      return [...INITIAL_DEMO_APPOINTMENTS];
    }

    return validAppointments;
  } catch (err) {
    console.error('CarePoint Storage: Failed to parse stored appointments', err);
    saveAppointments(INITIAL_DEMO_APPOINTMENTS);
    return [...INITIAL_DEMO_APPOINTMENTS];
  }
}

/**
 * Persists appointments to browser localStorage using versioned format.
 */
export function saveAppointments(appointments: Appointment[]): void {
  if (!isStorageAvailable()) return;
  try {
    const payload: StoragePayload = {
      version: STORAGE_VERSION,
      data: appointments,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('CarePoint Storage: Failed to write to localStorage', err);
  }
}

/**
 * Generates a collision-resistant unique appointment ID.
 */
export function generateAppointmentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `apt-${timestamp}-${random}`;
}

/**
 * Creates a new appointment, persists it, and returns the newly created record.
 */
export function createAppointment(formData: AppointmentFormData): Appointment {
  const now = new Date().toISOString();
  const newAppointment: Appointment = {
    id: generateAppointmentId(),
    patientName: formData.patientName.trim(),
    appointmentDate: formData.appointmentDate.trim(),
    appointmentTime: formData.appointmentTime.trim(),
    doctor: formData.doctor.trim(),
    appointmentType: formData.appointmentType,
    status: formData.status,
    createdAt: now,
    updatedAt: now,
  };

  const current = getStoredAppointments();
  // Prepend so newest appears first by default
  const updated = [newAppointment, ...current];
  saveAppointments(updated);
  return newAppointment;
}

/**
 * Updates an existing appointment, preserving ID and createdAt.
 */
export function updateAppointment(
  id: string,
  formData: AppointmentFormData
): Appointment | null {
  const current = getStoredAppointments();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const existing = current[index];
  const updatedAppointment: Appointment = {
    ...existing,
    patientName: formData.patientName.trim(),
    appointmentDate: formData.appointmentDate.trim(),
    appointmentTime: formData.appointmentTime.trim(),
    doctor: formData.doctor.trim(),
    appointmentType: formData.appointmentType,
    status: formData.status,
    updatedAt: new Date().toISOString(),
  };

  current[index] = updatedAppointment;
  saveAppointments(current);
  return updatedAppointment;
}

/**
 * Deletes an appointment by ID. Returns true if removed, false if not found.
 */
export function deleteAppointment(id: string): boolean {
  const current = getStoredAppointments();
  const initialLength = current.length;
  const filtered = current.filter((item) => item.id !== id);

  if (filtered.length === initialLength) {
    return false;
  }

  saveAppointments(filtered);
  return true;
}

/**
 * Resets storage to the initial fictional demo dataset.
 */
export function resetToDemoData(): Appointment[] {
  const copy = JSON.parse(JSON.stringify(INITIAL_DEMO_APPOINTMENTS)) as Appointment[];
  saveAppointments(copy);
  return copy;
}
