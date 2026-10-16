import React from 'react';
import { AppointmentStatus } from '@/types/appointment';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = (s: AppointmentStatus) => {
    switch (s) {
      case 'Scheduled':
        return 'status-badge scheduled';
      case 'Confirmed':
        return 'status-badge confirmed';
      case 'Completed':
        return 'status-badge completed';
      case 'Cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge';
    }
  };

  return (
    <span className={getBadgeClass(status)} data-testid={`status-badge-${status.toLowerCase()}`}>
      <span className="badge-dot" aria-hidden="true" />
      {status}
    </span>
  );
};
