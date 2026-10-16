import React, { useEffect, useRef } from 'react';
import { Appointment } from '@/types/appointment';
import { formatDate, formatTime } from '@/lib/utils';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointmentId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus cancel button by default to avoid accidental deletion
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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
        className="modal-content modal-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        data-testid="delete-confirm-modal"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden="true"
            >
              <AlertTriangle size={18} />
            </div>
            <h2 id="delete-dialog-title" className="modal-title">
              Delete Appointment
            </h2>
          </div>
          <button
            type="button"
            className="action-btn"
            onClick={onClose}
            aria-label="Cancel deletion"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p id="delete-dialog-desc" style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the scheduled appointment for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{appointment.patientName}</strong>?
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginTop: '1rem',
              border: '1px solid var(--border-color)',
              fontSize: '0.8125rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Doctor: </span>
              <strong>{appointment.doctor}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Date & Time: </span>
              <strong>
                {formatDate(appointment.appointmentDate)} at{' '}
                {formatTime(appointment.appointmentTime)}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Type: </span>
              <span>{appointment.appointmentType}</span>
            </div>
          </div>

          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-danger)',
              marginTop: '1rem',
            }}
          >
            This action cannot be undone. The record will be permanently removed from storage.
          </p>
        </div>

        <div className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            data-testid="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(appointment.id)}
            data-testid="confirm-delete-btn"
          >
            Delete Appointment
          </button>
        </div>
      </div>
    </div>
  );
};
