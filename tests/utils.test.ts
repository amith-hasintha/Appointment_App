import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  calculateSummary,
  filterAndSortAppointments,
} from '@/lib/utils';
import { Appointment, AppointmentFilters } from '@/types/appointment';

describe('Utility Functions Unit Tests', () => {
  const sampleAppointments: Appointment[] = [
    {
      id: 'apt-1',
      patientName: 'Alice Walker',
      appointmentDate: '2026-10-20',
      appointmentTime: '09:00',
      doctor: 'Dr. Sarah Jenkins',
      appointmentType: 'Cardiology',
      status: 'Scheduled',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'apt-2',
      patientName: 'Bob Dylan',
      appointmentDate: '2026-10-25',
      appointmentTime: '14:30',
      doctor: 'Dr. Michael Chen',
      appointmentType: 'General Consultation',
      status: 'Confirmed',
      createdAt: '2026-10-02T11:00:00.000Z',
      updatedAt: '2026-10-02T11:00:00.000Z',
    },
    {
      id: 'apt-3',
      patientName: 'Charlie Parker',
      appointmentDate: '2026-10-15',
      appointmentTime: '11:15',
      doctor: 'Dr. Emily Rodriguez',
      appointmentType: 'Dermatology',
      status: 'Completed',
      createdAt: '2026-09-25T08:00:00.000Z',
      updatedAt: '2026-10-15T12:00:00.000Z',
    },
    {
      id: 'apt-4',
      patientName: 'Diana Ross',
      appointmentDate: '2026-10-18',
      appointmentTime: '16:00',
      doctor: 'Dr. Sarah Jenkins',
      appointmentType: 'Cardiology',
      status: 'Cancelled',
      createdAt: '2026-10-05T09:30:00.000Z',
      updatedAt: '2026-10-10T14:00:00.000Z',
    },
  ];

  const defaultFilters: AppointmentFilters = {
    searchQuery: '',
    status: 'ALL',
    type: 'ALL',
    doctor: 'ALL',
    startDate: '',
    endDate: '',
    sortBy: 'appointmentDate',
    sortOrder: 'asc',
  };

  describe('formatDate', () => {
    it('formats YYYY-MM-DD into readable date without timezone shift', () => {
      // "2026-10-20" must always format to Oct 20, 2026 regardless of local timezone
      const formatted = formatDate('2026-10-20');
      expect(formatted).toBe('Oct 20, 2026');
    });

    it('handles empty or malformed date strings gracefully', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatTime', () => {
    it('converts 24-hour time to 12-hour AM/PM format', () => {
      expect(formatTime('09:00')).toBe('9:00 AM');
      expect(formatTime('14:30')).toBe('2:30 PM');
      expect(formatTime('00:05')).toBe('12:05 AM');
      expect(formatTime('12:00')).toBe('12:00 PM');
      expect(formatTime('23:59')).toBe('11:59 PM');
    });

    it('returns empty string if time is empty', () => {
      expect(formatTime('')).toBe('');
    });
  });

  describe('calculateSummary', () => {
    it('calculates summary card totals accurately from appointment records', () => {
      const summary = calculateSummary(sampleAppointments);
      expect(summary.total).toBe(4);
      expect(summary.scheduled).toBe(1);
      expect(summary.confirmed).toBe(1);
      expect(summary.completed).toBe(1);
      expect(summary.cancelled).toBe(1);
    });

    it('returns zero counts for an empty appointment list', () => {
      const summary = calculateSummary([]);
      expect(summary.total).toBe(0);
      expect(summary.scheduled).toBe(0);
      expect(summary.confirmed).toBe(0);
      expect(summary.completed).toBe(0);
      expect(summary.cancelled).toBe(0);
    });
  });

  describe('filterAndSortAppointments', () => {
    it('performs case-insensitive search across patient, doctor, type, and status', () => {
      // Search by patient name
      const byPatient = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        searchQuery: 'aLiCe',
      });
      expect(byPatient.length).toBe(1);
      expect(byPatient[0].patientName).toBe('Alice Walker');

      // Search by doctor
      const byDoctor = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        searchQuery: 'jEnKiNs',
      });
      expect(byDoctor.length).toBe(2);

      // Search by type
      const byType = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        searchQuery: 'dermatology',
      });
      expect(byType.length).toBe(1);
      expect(byType[0].patientName).toBe('Charlie Parker');

      // Search by status
      const byStatus = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        searchQuery: 'cancelled',
      });
      expect(byStatus.length).toBe(1);
      expect(byStatus[0].patientName).toBe('Diana Ross');
    });

    it('filters by status', () => {
      const result = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        status: 'Scheduled',
      });
      expect(result.length).toBe(1);
      expect(result[0].patientName).toBe('Alice Walker');
    });

    it('filters by appointment type', () => {
      const result = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        type: 'Cardiology',
      });
      expect(result.length).toBe(2);
      expect(result.every((a) => a.appointmentType === 'Cardiology')).toBe(true);
    });

    it('filters by doctor', () => {
      const result = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        doctor: 'Dr. Michael Chen',
      });
      expect(result.length).toBe(1);
      expect(result[0].patientName).toBe('Bob Dylan');
    });

    it('filters by date range (startDate and endDate)', () => {
      const result = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        startDate: '2026-10-16',
        endDate: '2026-10-22',
      });
      // Should include Oct 18 (Diana Ross) and Oct 20 (Alice Walker)
      expect(result.length).toBe(2);
      const names = result.map((a) => a.patientName);
      expect(names).toContain('Diana Ross');
      expect(names).toContain('Alice Walker');
    });

    it('combines search and multiple filters correctly', () => {
      const result = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        searchQuery: 'Sarah',
        status: 'Scheduled',
        type: 'Cardiology',
      });
      // Diana is Cancelled, Alice is Scheduled -> only Alice matches
      expect(result.length).toBe(1);
      expect(result[0].patientName).toBe('Alice Walker');
    });

    it('sorts by patientName ascending and descending', () => {
      const asc = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        sortBy: 'patientName',
        sortOrder: 'asc',
      });
      expect(asc[0].patientName).toBe('Alice Walker');
      expect(asc[asc.length - 1].patientName).toBe('Diana Ross');

      const desc = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        sortBy: 'patientName',
        sortOrder: 'desc',
      });
      expect(desc[0].patientName).toBe('Diana Ross');
      expect(desc[desc.length - 1].patientName).toBe('Alice Walker');
    });

    it('sorts by appointmentDate ascending and descending', () => {
      const asc = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        sortBy: 'appointmentDate',
        sortOrder: 'asc',
      });
      expect(asc[0].appointmentDate).toBe('2026-10-15'); // Charlie Parker
      expect(asc[asc.length - 1].appointmentDate).toBe('2026-10-25'); // Bob Dylan

      const desc = filterAndSortAppointments(sampleAppointments, {
        ...defaultFilters,
        sortBy: 'appointmentDate',
        sortOrder: 'desc',
      });
      expect(desc[0].appointmentDate).toBe('2026-10-25');
      expect(desc[desc.length - 1].appointmentDate).toBe('2026-10-15');
    });
  });
});
