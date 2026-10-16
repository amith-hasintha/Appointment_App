import {
  Appointment,
  AppointmentFilters,
  AppointmentSummary,
} from '@/types/appointment';

/**
 * Formats a YYYY-MM-DD date string into a user-friendly locale format
 * (e.g., "Oct 20, 2026") without causing timezone-induced day shifts.
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return dateString;
  }
  const [year, month, day] = parts;
  // Construct date in local timezone explicitly
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats 24-hour time "HH:mm" into 12-hour AM/PM format (e.g., "09:30 AM", "02:15 PM").
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hourStr, minStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (isNaN(hour) || isNaN(min)) {
    return timeString;
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMin = min < 10 ? `0${min}` : `${min}`;

  return `${displayHour}:${displayMin} ${period}`;
}

/**
 * Formats an ISO 8601 timestamp string into a friendly localized date and time.
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Computes live appointment counts by status.
 */
export function calculateSummary(appointments: Appointment[]): AppointmentSummary {
  return appointments.reduce<AppointmentSummary>(
    (acc, apt) => {
      acc.total += 1;
      if (apt.status === 'Scheduled') acc.scheduled += 1;
      else if (apt.status === 'Confirmed') acc.confirmed += 1;
      else if (apt.status === 'Completed') acc.completed += 1;
      else if (apt.status === 'Cancelled') acc.cancelled += 1;
      return acc;
    },
    {
      total: 0,
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    }
  );
}

/**
 * Extracts a unique, sorted list of doctor names from current appointments,
 * merged with predefined default doctors for autocomplete/dropdown selection.
 */
export function getUniqueDoctors(appointments: Appointment[]): string[] {
  const set = new Set<string>();
  appointments.forEach((apt) => {
    if (apt.doctor && apt.doctor.trim()) {
      set.add(apt.doctor.trim());
    }
  });
  return Array.from(set).sort();
}

/**
 * Filters and sorts appointments based on user criteria.
 * Search, filters, and sorting work cohesively together.
 */
export function filterAndSortAppointments(
  appointments: Appointment[],
  filters: AppointmentFilters
): Appointment[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return appointments
    .filter((apt) => {
      // 1. Text Search across patientName, doctor, appointmentType, status
      if (query) {
        const matchesName = apt.patientName.toLowerCase().includes(query);
        const matchesDoctor = apt.doctor.toLowerCase().includes(query);
        const matchesType = apt.appointmentType.toLowerCase().includes(query);
        const matchesStatus = apt.status.toLowerCase().includes(query);

        if (!matchesName && !matchesDoctor && !matchesType && !matchesStatus) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== 'ALL' && apt.status !== filters.status) {
        return false;
      }

      // 3. Appointment Type Filter
      if (filters.type !== 'ALL' && apt.appointmentType !== filters.type) {
        return false;
      }

      // 4. Doctor Filter
      if (filters.doctor !== 'ALL' && apt.doctor !== filters.doctor) {
        return false;
      }

      // 5. Date Range Filters
      if (filters.startDate && apt.appointmentDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && apt.appointmentDate > filters.endDate) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === 'appointmentDate') {
        // Compare date first, then time
        const dateA = `${a.appointmentDate} ${a.appointmentTime}`;
        const dateB = `${b.appointmentDate} ${b.appointmentTime}`;
        comparison = dateA.localeCompare(dateB);
      } else if (filters.sortBy === 'patientName') {
        comparison = a.patientName.localeCompare(b.patientName, undefined, {
          sensitivity: 'base',
        });
      } else if (filters.sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
}
