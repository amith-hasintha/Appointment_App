import {
  AppointmentFormData,
  AppointmentStatus,
  AppointmentType,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  FormValidationErrors,
} from '@/types/appointment';

export interface ValidationResult {
  isValid: boolean;
  errors: FormValidationErrors;
  sanitizedData?: AppointmentFormData;
}

export function validateAppointmentForm(
  data: Partial<AppointmentFormData>
): ValidationResult {
  const errors: FormValidationErrors = {};

  // 1. Patient Name Validation
  const rawPatientName = data.patientName ?? '';
  const trimmedPatientName = rawPatientName.trim();
  if (!trimmedPatientName) {
    errors.patientName = 'Patient name is required and cannot be empty.';
  } else if (trimmedPatientName.length < 2) {
    errors.patientName = 'Patient name must be at least 2 characters long.';
  } else if (trimmedPatientName.length > 100) {
    errors.patientName = 'Patient name must not exceed 100 characters.';
  }

  // 2. Doctor Name Validation
  const rawDoctor = data.doctor ?? '';
  const trimmedDoctor = rawDoctor.trim();
  if (!trimmedDoctor) {
    errors.doctor = 'Doctor name is required and cannot be empty.';
  } else if (trimmedDoctor.length < 2) {
    errors.doctor = 'Doctor name must be at least 2 characters long.';
  } else if (trimmedDoctor.length > 100) {
    errors.doctor = 'Doctor name must not exceed 100 characters.';
  }

  // 3. Appointment Date Validation
  const rawDate = data.appointmentDate ?? '';
  const trimmedDate = rawDate.trim();
  if (!trimmedDate) {
    errors.appointmentDate = 'Appointment date is required.';
  } else {
    // Expected format: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trimmedDate)) {
      errors.appointmentDate = 'Please enter a valid date in YYYY-MM-DD format.';
    } else {
      const [year, month, day] = trimmedDate.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
      ) {
        errors.appointmentDate = 'Please enter a calendar-valid date.';
      }
    }
  }

  // 4. Appointment Time Validation
  const rawTime = data.appointmentTime ?? '';
  const trimmedTime = rawTime.trim();
  if (!trimmedTime) {
    errors.appointmentTime = 'Appointment time is required.';
  } else {
    // 24-hour time format: HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(trimmedTime)) {
      errors.appointmentTime = 'Please enter a valid time in 24-hour format (HH:mm).';
    }
  }

  // 5. Appointment Type Validation
  const rawType = data.appointmentType;
  if (!rawType) {
    errors.appointmentType = 'Appointment type is required.';
  } else if (!APPOINTMENT_TYPES.includes(rawType as AppointmentType)) {
    errors.appointmentType = 'Please select a valid appointment type.';
  }

  // 6. Appointment Status Validation
  const rawStatus = data.status;
  if (!rawStatus) {
    errors.status = 'Appointment status is required.';
  } else if (!APPOINTMENT_STATUSES.includes(rawStatus as AppointmentStatus)) {
    errors.status = 'Please select a valid appointment status.';
  }

  const isValid = Object.keys(errors).length === 0;

  let sanitizedData: AppointmentFormData | undefined;
  if (isValid) {
    sanitizedData = {
      patientName: trimmedPatientName,
      doctor: trimmedDoctor,
      appointmentDate: trimmedDate,
      appointmentTime: trimmedTime,
      appointmentType: rawType as AppointmentType,
      status: rawStatus as AppointmentStatus,
    };
  }

  return {
    isValid,
    errors,
    sanitizedData,
  };
}
