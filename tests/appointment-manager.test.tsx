import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/components/Dashboard';
import { INITIAL_DEMO_APPOINTMENTS } from '@/lib/storage';

describe('CarePoint Dashboard Component Integration Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders dashboard with CarePoint branding, summary cards, and demo appointments', async () => {
    render(<Dashboard />);

    // Branding
    expect(screen.getByText('CarePoint')).toBeInTheDocument();
    expect(screen.getByText('Patient Appointment Management System')).toBeInTheDocument();

    // Summary cards
    expect(screen.getByTestId('summary-card-total')).toBeInTheDocument();
    expect(screen.getByTestId('summary-total-count')).toHaveTextContent(
      String(INITIAL_DEMO_APPOINTMENTS.length)
    );

    // Initial appointments in table and card views
    expect(screen.getAllByText('Eleanor Vance')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Marcus Sterling')[0]).toBeInTheDocument();
  });

  it('validates required fields and shows inline errors when creating an appointment', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    // Open modal
    const newBtn = screen.getByTestId('new-appointment-button');
    await user.click(newBtn);

    expect(screen.getByTestId('appointment-form-modal')).toBeInTheDocument();

    // Clear patient name and submit
    const patientInput = screen.getByTestId('input-patient-name');
    await user.clear(patientInput);

    const submitBtn = screen.getByTestId('form-submit-btn');
    await user.click(submitBtn);

    // Should display validation error
    expect(screen.getByTestId('error-patient-name')).toBeInTheDocument();
    expect(screen.getByTestId('error-patient-name')).toHaveTextContent(
      /required and cannot be empty/i
    );

    // Modal should stay open
    expect(screen.getByTestId('appointment-form-modal')).toBeInTheDocument();
  });

  it('successfully creates a new appointment and updates table and summary cards', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    // Open modal
    await user.click(screen.getByTestId('new-appointment-button'));

    // Fill valid inputs
    const patientInput = screen.getByTestId('input-patient-name');
    await user.clear(patientInput);
    await user.type(patientInput, 'Rosalind Franklin');

    const dateInput = screen.getByTestId('input-appointment-date');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-11-20');

    const timeInput = screen.getByTestId('input-appointment-time');
    await user.clear(timeInput);
    await user.type(timeInput, '11:30');

    // Submit form
    await user.click(screen.getByTestId('form-submit-btn'));

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('appointment-form-modal')).not.toBeInTheDocument();
    });

    // Check table for new patient
    expect(screen.getAllByText('Rosalind Franklin')[0]).toBeInTheDocument();

    // Check summary count incremented
    expect(screen.getByTestId('summary-total-count')).toHaveTextContent(
      String(INITIAL_DEMO_APPOINTMENTS.length + 1)
    );

    // Check success toast
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByText(/Appointment Created/i)).toBeInTheDocument();
  });

  it('allows editing an existing appointment and updates values', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    // Find edit button for first demo appointment (apt-demo-01: Eleanor Vance)
    const editBtn = screen.getByTestId('edit-apt-apt-demo-01');
    await user.click(editBtn);

    expect(screen.getByTestId('appointment-form-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();

    // Update patient name
    const patientInput = screen.getByTestId('input-patient-name');
    expect(patientInput).toHaveValue('Eleanor Vance');
    await user.clear(patientInput);
    await user.type(patientInput, 'Eleanor Vance-Crain');

    // Save
    await user.click(screen.getByTestId('form-submit-btn'));

    await waitFor(() => {
      expect(screen.queryByTestId('appointment-form-modal')).not.toBeInTheDocument();
    });

    expect(screen.getAllByText('Eleanor Vance-Crain')[0]).toBeInTheDocument();
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByText(/Appointment Updated/i)).toBeInTheDocument();
  });

  it('opens delete confirmation and cancels deletion without removing the appointment', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    const deleteBtn = screen.getByTestId('delete-apt-apt-demo-01');
    await user.click(deleteBtn);

    // Confirmation dialog should be visible identifying patient
    expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    // Click Cancel
    const cancelBtn = screen.getByTestId('cancel-delete-btn');
    await user.click(cancelBtn);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByTestId('delete-confirm-modal')).not.toBeInTheDocument();
    });

    // Appointment should still exist
    expect(screen.getAllByText('Eleanor Vance')[0]).toBeInTheDocument();
  });

  it('confirms appointment deletion and removes it from table and storage', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    const deleteBtn = screen.getByTestId('delete-apt-apt-demo-01');
    await user.click(deleteBtn);

    expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();

    // Confirm deletion
    const confirmBtn = screen.getByTestId('confirm-delete-btn');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-confirm-modal')).not.toBeInTheDocument();
    });

    // Should no longer appear in the document
    expect(screen.queryByText('Eleanor Vance')).not.toBeInTheDocument();

    // Summary count decrements
    expect(screen.getByTestId('summary-total-count')).toHaveTextContent(
      String(INITIAL_DEMO_APPOINTMENTS.length - 1)
    );

    // Deletion toast notification
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();
  });

  it('filters appointments dynamically using search input', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'Marcus');

    // Only Marcus Sterling should be visible
    expect(screen.getAllByText('Marcus Sterling')[0]).toBeInTheDocument();
    expect(screen.queryByText('Eleanor Vance')).not.toBeInTheDocument();

    // Clear search
    const clearBtn = screen.getByTestId('clear-search-btn');
    await user.click(clearBtn);

    // All should be visible again
    expect(screen.getAllByText('Marcus Sterling')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Eleanor Vance')[0]).toBeInTheDocument();
  });

  it('filters appointments by status dropdown', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    const statusSelect = screen.getByTestId('status-filter');
    await user.selectOptions(statusSelect, 'Completed');

    // Sophia Ramirez and Maya Lin are completed in initial demo
    expect(screen.getAllByText('Sophia Ramirez')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Maya Lin')[0]).toBeInTheDocument();

    // Eleanor Vance (Confirmed) should not be visible
    expect(screen.queryByText('Eleanor Vance')).not.toBeInTheDocument();
  });

  it('resets demo data to initial 8 appointments when requested', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    // Delete an appointment first
    const deleteBtn = screen.getByTestId('delete-apt-apt-demo-01');
    await user.click(deleteBtn);
    await user.click(screen.getByTestId('confirm-delete-btn'));

    await waitFor(() => {
      expect(screen.queryByText('Eleanor Vance')).not.toBeInTheDocument();
    });

    // Click Reset Demo Data
    const resetBtn = screen.getByTestId('reset-demo-data-btn');
    await user.click(resetBtn);

    expect(screen.getByTestId('reset-confirm-modal')).toBeInTheDocument();

    // Confirm reset
    const confirmResetBtn = screen.getByTestId('confirm-reset-btn');
    await user.click(confirmResetBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('reset-confirm-modal')).not.toBeInTheDocument();
    });

    // Eleanor Vance should be restored
    expect(screen.getAllByText('Eleanor Vance')[0]).toBeInTheDocument();
    expect(screen.getByTestId('summary-total-count')).toHaveTextContent(
      String(INITIAL_DEMO_APPOINTMENTS.length)
    );
  });
});
