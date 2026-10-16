import React from 'react';
import { Appointment } from '@/types/appointment';
import { formatDate, formatTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { Calendar, Clock, User, Stethoscope, Eye, Edit2, Trash2 } from 'lucide-react';

interface AppointmentCardsProps {
  appointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}

export const AppointmentCards: React.FC<AppointmentCardsProps> = ({
  appointments,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  if (appointments.length === 0) {
    return null; // Empty state is already rendered by AppointmentTable container
  }

  return (
    <div className="cards-container" data-testid="appointment-cards-container">
      {appointments.map((apt) => (
        <article
          key={apt.id}
          className="appointment-card"
          data-testid={`appointment-card-${apt.id}`}
        >
          <div className="card-header-row">
            <div>
              <h3 className="card-patient-name">{apt.patientName}</h3>
              <span className="type-tag" style={{ marginTop: '0.25rem' }}>
                {apt.appointmentType}
              </span>
            </div>
            <StatusBadge status={apt.status} />
          </div>

          <div className="card-info-grid">
            <div className="card-info-item">
              <Calendar size={14} className="text-muted" aria-hidden="true" />
              <span>{formatDate(apt.appointmentDate)}</span>
            </div>
            <div className="card-info-item">
              <Clock size={14} className="text-muted" aria-hidden="true" />
              <span>{formatTime(apt.appointmentTime)}</span>
            </div>
            <div className="card-info-item" style={{ gridColumn: '1 / -1' }}>
              <Stethoscope size={14} className="text-muted" aria-hidden="true" />
              <span>{apt.doctor}</span>
            </div>
          </div>

          <div className="card-actions-row">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDetails(apt)}
              aria-label={`View details for ${apt.patientName}`}
            >
              <Eye size={14} aria-hidden="true" />
              <span>Details</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(apt)}
              aria-label={`Edit appointment for ${apt.patientName}`}
            >
              <Edit2 size={14} aria-hidden="true" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--color-danger)' }}
              onClick={() => onDelete(apt)}
              aria-label={`Delete appointment for ${apt.patientName}`}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};
