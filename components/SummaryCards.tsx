import React from 'react';
import { AppointmentSummary } from '@/types/appointment';
import { CalendarDays, Clock, CheckCircle2, CalendarX2 } from 'lucide-react';

interface SummaryCardsProps {
  summary: AppointmentSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <section className="summary-grid" aria-label="Appointment Statistics">
      {/* 1. Total Appointments */}
      <div className="summary-card" data-testid="summary-card-total">
        <div className="summary-icon-box total" aria-hidden="true">
          <CalendarDays size={26} />
        </div>
        <div className="summary-details">
          <span className="summary-count" data-testid="summary-total-count">
            {summary.total}
          </span>
          <span className="summary-label">Total Appointments</span>
        </div>
      </div>

      {/* 2. Scheduled Appointments */}
      <div className="summary-card" data-testid="summary-card-scheduled">
        <div className="summary-icon-box scheduled" aria-hidden="true">
          <Clock size={26} />
        </div>
        <div className="summary-details">
          <span className="summary-count" data-testid="summary-scheduled-count">
            {summary.scheduled}
          </span>
          <span className="summary-label">Scheduled</span>
        </div>
      </div>

      {/* 3. Completed Appointments */}
      <div className="summary-card" data-testid="summary-card-completed">
        <div className="summary-icon-box completed" aria-hidden="true">
          <CheckCircle2 size={26} />
        </div>
        <div className="summary-details">
          <span className="summary-count" data-testid="summary-completed-count">
            {summary.completed}
          </span>
          <span className="summary-label">Completed</span>
        </div>
      </div>

      {/* 4. Cancelled Appointments */}
      <div className="summary-card" data-testid="summary-card-cancelled">
        <div className="summary-icon-box cancelled" aria-hidden="true">
          <CalendarX2 size={26} />
        </div>
        <div className="summary-details">
          <span className="summary-count" data-testid="summary-cancelled-count">
            {summary.cancelled}
          </span>
          <span className="summary-label">Cancelled</span>
        </div>
      </div>
    </section>
  );
};
