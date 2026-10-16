import React, { useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { X, Edit2, Trash2 } from 'lucide-react';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onEdit,
  onDelete,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
        data-testid="appointment-details-modal"
      >
        <div className="modal-header">
          <h2 id="details-modal-title" className="modal-title">
            Appointment Details
          </h2>
          <button
            type="button"
            className="action-btn"
            onClick={onClose}
            aria-label="Close details"
            data-testid="details-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="details-item full">
              <span className="details-item-label">Patient Name</span>
              <span className="details-item-value" style={{ fontSize: '1.125rem' }}>
                {appointment.patientName}
              </span>
            </div>

            <div className="details-item">
              <span className="details-item-label">Status</span>
              <div>
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            <div className="details-item">
              <span className="details-item-label">Appointment Type</span>
              <div>
                <span className="type-tag">{appointment.appointmentType}</span>
              </div>
            </div>

            <div className="details-item full">
              <span className="details-item-label">Assigned Healthcare Specialist</span>
              <span className="details-item-value">{appointment.doctor}</span>
            </div>

            <div className="details-item">
              <span className="details-item-label">Appointment Date</span>
              <span className="details-item-value">
                {formatDate(appointment.appointmentDate)}
              </span>
            </div>

            <div className="details-item">
              <span className="details-item-label">Appointment Time</span>
              <span className="details-item-value">
                {formatTime(appointment.appointmentTime)}
              </span>
            </div>

            <div className="details-item full">
              <span className="details-item-label">System Record ID</span>
              <span
                className="details-item-value"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                }}
              >
                {appointment.id}
              </span>
            </div>

            <div className="details-item">
              <span className="details-item-label">Record Created</span>
              <span className="details-item-value" style={{ fontSize: '0.8125rem' }}>
                {formatDateTime(appointment.createdAt)}
              </span>
            </div>

            <div className="details-item">
              <span className="details-item-label">Last Updated</span>
              <span className="details-item-value" style={{ fontSize: '0.8125rem' }}>
                {formatDateTime(appointment.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              onEdit(appointment);
            }}
            data-testid="details-edit-btn"
          >
            <Edit2 size={16} aria-hidden="true" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onClose();
              onDelete(appointment);
            }}
            data-testid="details-delete-btn"
          >
            <Trash2 size={16} aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
