export type AppointmentType =
  | 'General Consultation'
  | 'Follow-up'
  | 'Dental'
  | 'Cardiology'
  | 'Dermatology'
  | 'Other';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface Appointment {
  id: string;
  patientName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm (24-hour format)
  doctor: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface AppointmentFormData {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  doctor: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
}

export type FormValidationErrors = Partial<Record<keyof AppointmentFormData, string>>;

export interface AppointmentSummary {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export type SortField = 'appointmentDate' | 'patientName' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface AppointmentFilters {
  searchQuery: string;
  status: AppointmentStatus | 'ALL';
  type: AppointmentType | 'ALL';
  doctor: string | 'ALL';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  sortBy: SortField;
  sortOrder: SortOrder;
}

export const APPOINTMENT_TYPES: AppointmentType[] = [
  'General Consultation',
  'Follow-up',
  'Dental',
  'Cardiology',
  'Dermatology',
  'Other',
];

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'Scheduled',
  'Confirmed',
  'Completed',
  'Cancelled',
];

export const DEFAULT_DOCTORS: string[] = [
  'Dr. Sarah Jenkins (Cardiology)',
  'Dr. Michael Chen (General Medicine)',
  'Dr. Emily Rodriguez (Dermatology)',
  'Dr. James Wilson (Dental Surgery)',
  'Dr. Lisa Patel (Pediatrics & Family Medicine)',
  'Dr. Robert Taylor (Orthopedics)',
];
