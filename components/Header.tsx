import React from 'react';
import { Activity, Plus } from 'lucide-react';

interface HeaderProps {
  onNewAppointment: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewAppointment }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-icon-box" aria-hidden="true">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div className="brand-titles">
            <h1 className="brand-title">
              CarePoint
              <span className="brand-badge">Manager</span>
            </h1>
            <p className="brand-subtitle">Patient Appointment Management System</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNewAppointment}
            id="new-appointment-btn"
            data-testid="new-appointment-button"
            aria-label="Create new appointment"
          >
            <Plus size={18} aria-hidden="true" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>
    </header>
  );
};
