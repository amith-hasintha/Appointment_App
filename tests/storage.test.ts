import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredAppointments,
  saveAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  resetToDemoData,
  STORAGE_KEY,
  INITIAL_DEMO_APPOINTMENTS,
} from '@/lib/storage';
import { Appointment, AppointmentFormData } from '@/types/appointment';

describe('Storage Access Layer Unit Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('seeds demo appointments on the first visit when localStorage is empty', () => {
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    const loaded = getStoredAppointments();

    expect(loaded.length).toBe(INITIAL_DEMO_APPOINTMENTS.length);
    expect(loaded[0].patientName).toBe(INITIAL_DEMO_APPOINTMENTS[0].patientName);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('does not overwrite existing user data with demo data on subsequent visits', () => {
    const customAppointment: Appointment = {
      id: 'apt-custom-99',
      patientName: 'Ada Lovelace',
      appointmentDate: '2026-12-01',
      appointmentTime: '11:00',
      doctor: 'Dr. Sarah Jenkins (Cardiology)',
      appointmentType: 'Cardiology',
      status: 'Scheduled',
      createdAt: '2026-10-15T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    };

    saveAppointments([customAppointment]);

    const retrieved = getStoredAppointments();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].id).toBe('apt-custom-99');
    expect(retrieved[0].patientName).toBe('Ada Lovelace');
  });

  it('handles malformed JSON in localStorage gracefully without crashing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ invalid_json_syntax %%% }');
    const result = getStoredAppointments();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(INITIAL_DEMO_APPOINTMENTS.length);
  });

  it('handles invalid stored schema (empty or corrupt objects) gracefully', () => {
    const corruptedData = [
      { foo: 'bar' }, // invalid record missing all required fields
      { id: '123' },  // incomplete record
    ];
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, data: corruptedData })
    );

    const result = getStoredAppointments();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(INITIAL_DEMO_APPOINTMENTS.length);
  });

  it('creates an appointment with a unique ID and matching timestamps', () => {
    // initialize storage
    getStoredAppointments();

    const formInput: AppointmentFormData = {
      patientName: 'Grace Hopper',
      appointmentDate: '2026-11-20',
      appointmentTime: '14:30',
      doctor: 'Dr. Michael Chen (General Medicine)',
      appointmentType: 'General Consultation',
      status: 'Confirmed',
    };

    const created = createAppointment(formInput);

    expect(created.id).toBeDefined();
    expect(created.id.startsWith('apt-')).toBe(true);
    expect(created.patientName).toBe('Grace Hopper');
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBe(created.createdAt);

    const stored = getStoredAppointments();
    const found = stored.find((a) => a.id === created.id);
    expect(found).toBeDefined();
    expect(found?.patientName).toBe('Grace Hopper');
  });

  it('edits an existing appointment, preserving ID and createdAt while updating updatedAt', async () => {
    const originalAppointment: Appointment = {
      id: 'apt-preserve-test',
      patientName: 'Katherine Johnson',
      appointmentDate: '2026-10-10',
      appointmentTime: '09:00',
      doctor: 'Dr. Emily Rodriguez (Dermatology)',
      appointmentType: 'Dermatology',
      status: 'Scheduled',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    };

    saveAppointments([originalAppointment]);

    // Small delay to ensure timestamp differs
    await new Promise((resolve) => setTimeout(resolve, 15));

    const updated = updateAppointment('apt-preserve-test', {
      patientName: 'Katherine Johnson-Goble',
      appointmentDate: '2026-10-12',
      appointmentTime: '10:30',
      doctor: 'Dr. Emily Rodriguez (Dermatology)',
      appointmentType: 'Follow-up',
      status: 'Confirmed',
    });

    expect(updated).not.toBeNull();
    expect(updated?.id).toBe('apt-preserve-test');
    expect(updated?.createdAt).toBe('2026-09-01T08:00:00.000Z');
    expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThan(
      new Date(originalAppointment.updatedAt).getTime()
    );
    expect(updated?.patientName).toBe('Katherine Johnson-Goble');
    expect(updated?.appointmentType).toBe('Follow-up');
    expect(updated?.status).toBe('Confirmed');
  });

  it('correctly deletes an appointment and persists removal', () => {
    const list: Appointment[] = [
      {
        id: 'apt-delete-1',
        patientName: 'Patient One',
        appointmentDate: '2026-10-11',
        appointmentTime: '09:00',
        doctor: 'Dr. Michael Chen',
        appointmentType: 'General Consultation',
        status: 'Scheduled',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      },
      {
        id: 'apt-delete-2',
        patientName: 'Patient Two',
        appointmentDate: '2026-10-12',
        appointmentTime: '10:00',
        doctor: 'Dr. Sarah Jenkins',
        appointmentType: 'Cardiology',
        status: 'Confirmed',
        createdAt: '2026-10-02T00:00:00.000Z',
        updatedAt: '2026-10-02T00:00:00.000Z',
      },
    ];

    saveAppointments(list);

    const deleted = deleteAppointment('apt-delete-1');
    expect(deleted).toBe(true);

    const remaining = getStoredAppointments();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('apt-delete-2');
  });

  it('returns false when attempting to delete a non-existent appointment ID', () => {
    saveAppointments(INITIAL_DEMO_APPOINTMENTS);
    const result = deleteAppointment('non-existent-id');
    expect(result).toBe(false);
    expect(getStoredAppointments().length).toBe(INITIAL_DEMO_APPOINTMENTS.length);
  });

  it('resets storage to initial demo data when requested', () => {
    saveAppointments([]);
    expect(getStoredAppointments().length).toBe(0);

    // Add a custom record
    createAppointment({
      patientName: 'Temporary User',
      appointmentDate: '2026-11-01',
      appointmentTime: '12:00',
      doctor: 'Dr. Lisa Patel',
      appointmentType: 'Other',
      status: 'Scheduled',
    });

    expect(getStoredAppointments().length).toBe(1);

    const resetResult = resetToDemoData();
    expect(resetResult.length).toBe(INITIAL_DEMO_APPOINTMENTS.length);
    expect(getStoredAppointments().some((a) => a.patientName === 'Temporary User')).toBe(
      false
    );
  });
});
