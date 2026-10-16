import React from 'react';
import { Appointment } from '@/types/appointment';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { Eye, Edit2, Trash2, CalendarX } from 'lucide-react';

interface AppointmentTableProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  onViewDetails,
  onEdit,
  onDelete,
  onClearFilters,
  hasActiveFilters,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state" data-testid="empty-appointments-state">
          <div className="empty-icon-box" aria-hidden="true">
            <CalendarX size={32} />
          </div>
          <h3 className="empty-title">No appointments found</h3>
          <p className="empty-description">
            {hasActiveFilters
              ? 'No appointments matched your search and filter criteria. Try clearing some filters or searching for something else.'
              : 'There are currently no appointments in the system. Click "New Appointment" above to create one.'}
          </p>
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClearFilters}
              data-testid="empty-state-reset-btn"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="appointment-table" data-testid="appointments-table">
          <thead>
            <tr>
              <th scope="col">Patient</th>
              <th scope="col">Date & Time</th>
              <th scope="col">Doctor</th>
              <th scope="col">Type</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.id} data-testid={`appointment-row-${apt.id}`}>
                <td className="cell-patient">{apt.patientName}</td>
                <td>
                  <div className="cell-datetime">
                    <span className="cell-date">{formatDate(apt.appointmentDate)}</span>
                    <span className="cell-time">{formatTime(apt.appointmentTime)}</span>
                  </div>
                </td>
                <td>{apt.doctor}</td>
                <td>
                  <span className="type-tag">{apt.appointmentType}</span>
                </td>
                <td>
                  <StatusBadge status={apt.status} />
                </td>
                <td>
                  <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => onViewDetails(apt)}
                      title={`View details for ${apt.patientName}`}
                      aria-label={`View details for ${apt.patientName}`}
                      data-testid={`view-apt-${apt.id}`}
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      type="button"
                      className="action-btn edit"
                      onClick={() => onEdit(apt)}
                      title={`Edit appointment for ${apt.patientName}`}
                      aria-label={`Edit appointment for ${apt.patientName}`}
                      data-testid={`edit-apt-${apt.id}`}
                    >
                      <Edit2 size={17} />
                    </button>
                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => onDelete(apt)}
                      title={`Delete appointment for ${apt.patientName}`}
                      aria-label={`Delete appointment for ${apt.patientName}`}
                      data-testid={`delete-apt-${apt.id}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
