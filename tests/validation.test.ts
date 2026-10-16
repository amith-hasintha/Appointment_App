import { describe, it, expect } from 'vitest';
import { validateAppointmentForm } from '@/lib/validation';
import { AppointmentFormData } from '@/types/appointment';

describe('Validation Unit Tests', () => {
  const validData: AppointmentFormData = {
    patientName: 'Sarah Connor',
    appointmentDate: '2026-11-15',
    appointmentTime: '10:30',
    doctor: 'Dr. Michael Chen (General Medicine)',
    appointmentType: 'General Consultation',
    status: 'Scheduled',
  };

  it('validates a correct appointment input without errors', () => {
    const result = validateAppointmentForm(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.sanitizedData).toEqual(validData);
  });

  it('rejects missing or empty required fields', () => {
    const result = validateAppointmentForm({});
    expect(result.isValid).toBe(false);
    expect(result.errors.patientName).toBeDefined();
    expect(result.errors.doctor).toBeDefined();
    expect(result.errors.appointmentDate).toBeDefined();
    expect(result.errors.appointmentTime).toBeDefined();
    expect(result.errors.appointmentType).toBeDefined();
    expect(result.errors.status).toBeDefined();
  });

  it('rejects whitespace-only patient name and doctor name', () => {
    const result = validateAppointmentForm({
      ...validData,
      patientName: '     ',
      doctor: '   \t  \n ',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.patientName).toMatch(/required and cannot be empty/i);
    expect(result.errors.doctor).toMatch(/required and cannot be empty/i);
  });

  it('trims whitespace from valid names in sanitizedData', () => {
    const result = validateAppointmentForm({
      ...validData,
      patientName: '  Johnathan Doe   ',
      doctor: '  Dr. Emily Rodriguez   ',
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData?.patientName).toBe('Johnathan Doe');
    expect(result.sanitizedData?.doctor).toBe('Dr. Emily Rodriguez');
  });

  it('rejects invalid date formats or calendar-impossible dates', () => {
    const invalidFormat = validateAppointmentForm({
      ...validData,
      appointmentDate: '2026/10/20',
    });
    expect(invalidFormat.isValid).toBe(false);
    expect(invalidFormat.errors.appointmentDate).toBeDefined();

    // Feb 30 is calendar-impossible
    const impossibleDate = validateAppointmentForm({
      ...validData,
      appointmentDate: '2026-02-30',
    });
    expect(impossibleDate.isValid).toBe(false);
    expect(impossibleDate.errors.appointmentDate).toMatch(/calendar-valid/i);
  });

  it('allows historical dates (past appointments)', () => {
    const historicalResult = validateAppointmentForm({
      ...validData,
      appointmentDate: '2020-05-12',
    });
    expect(historicalResult.isValid).toBe(true);
    expect(historicalResult.errors.appointmentDate).toBeUndefined();
  });

  it('rejects invalid time formats and out-of-range times', () => {
    const resultInvalidHour = validateAppointmentForm({
      ...validData,
      appointmentTime: '25:00',
    });
    expect(resultInvalidHour.isValid).toBe(false);
    expect(resultInvalidHour.errors.appointmentTime).toBeDefined();

    const resultInvalidMin = validateAppointmentForm({
      ...validData,
      appointmentTime: '12:75',
    });
    expect(resultInvalidMin.isValid).toBe(false);
    expect(resultInvalidMin.errors.appointmentTime).toBeDefined();

    const resultInvalidFormat = validateAppointmentForm({
      ...validData,
      appointmentTime: '9:30 AM',
    });
    expect(resultInvalidFormat.isValid).toBe(false);
    expect(resultInvalidFormat.errors.appointmentTime).toBeDefined();
  });

  it('rejects invalid appointment types and statuses', () => {
    const result = validateAppointmentForm({
      ...validData,
      // @ts-expect-error Testing invalid runtime value
      appointmentType: 'Acupuncture',
      // @ts-expect-error Testing invalid runtime value
      status: 'PendingPayment',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.appointmentType).toMatch(/valid appointment type/i);
    expect(result.errors.status).toMatch(/valid appointment status/i);
  });
});
