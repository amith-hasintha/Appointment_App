import React, { useEffect, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
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

  if (!isOpen) return null;

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
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-desc"
        data-testid="reset-confirm-modal"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden="true"
            >
              <RotateCcw size={18} />
            </div>
            <h2 id="reset-dialog-title" className="modal-title">
              Reset Demo Data
            </h2>
          </div>
          <button
            type="button"
            className="action-btn"
            onClick={onClose}
            aria-label="Cancel reset"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p id="reset-dialog-desc" style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to restore the application to the original fictional demo dataset?
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              lineHeight: 1.5,
            }}
          >
            Any custom appointments created or modified during your session will be replaced with
            the initial set of 8 sample appointments.
          </p>
        </div>

        <div className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            data-testid="cancel-reset-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            data-testid="confirm-reset-btn"
          >
            Restore Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};
