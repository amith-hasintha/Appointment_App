'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Appointment,
  AppointmentFilters,
  AppointmentFormData,
} from '@/types/appointment';
import {
  getStoredAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  resetToDemoData,
} from '@/lib/storage';
import {
  calculateSummary,
  filterAndSortAppointments,
  getUniqueDoctors,
} from '@/lib/utils';

import { Header } from './Header';
import { SummaryCards } from './SummaryCards';
import { SearchAndFilter } from './SearchAndFilter';
import { AppointmentTable } from './AppointmentTable';
import { AppointmentCards } from './AppointmentCards';
import { AppointmentFormModal } from './AppointmentFormModal';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ResetConfirmModal } from './ResetConfirmModal';
import { ToastContainer, ToastNotification } from './Toast';
import { RotateCcw, ShieldCheck } from 'lucide-react';

const INITIAL_FILTERS: AppointmentFilters = {
  searchQuery: '',
  status: 'ALL',
  type: 'ALL',
  doctor: 'ALL',
  startDate: '',
  endDate: '',
  sortBy: 'appointmentDate',
  sortOrder: 'asc',
};

export const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filters, setFilters] = useState<AppointmentFilters>(INITIAL_FILTERS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Load from localStorage on mount (prevents SSR hydration divergence)
  useEffect(() => {
    const loaded = getStoredAppointments();
    setAppointments(loaded);
    setIsClientReady(true);
  }, []);

  const addToast = useCallback(
    (type: ToastNotification['type'], title: string, message?: string) => {
      const newToast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type,
        title,
        message,
        duration: 4000,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Summary statistics
  const summary = useMemo(() => calculateSummary(appointments), [appointments]);

  // Unique list of doctors
  const availableDoctors = useMemo(() => getUniqueDoctors(appointments), [appointments]);

  // Filtered & sorted view
  const filteredAppointments = useMemo(
    () => filterAndSortAppointments(appointments, filters),
    [appointments, filters]
  );

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingAppointment(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsModal = (apt: Appointment) => {
    setViewingAppointment(apt);
  };

  const handleOpenDeleteModal = (apt: Appointment) => {
    setDeletingAppointment(apt);
  };

  const handleFormSubmit = (data: AppointmentFormData) => {
    if (editingAppointment) {
      // Edit existing
      const updated = updateAppointment(editingAppointment.id, data);
      if (updated) {
        setAppointments((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        addToast(
          'success',
          'Appointment Updated',
          `Changes saved for ${updated.patientName}.`
        );
      } else {
        addToast('error', 'Update Failed', 'Appointment record was not found.');
      }
    } else {
      // Create new
      const created = createAppointment(data);
      setAppointments((prev) => [created, ...prev]);
      addToast(
        'success',
        'Appointment Created',
        `Scheduled ${created.patientName} for ${created.appointmentDate}.`
      );
    }

    setIsFormModalOpen(false);
    setEditingAppointment(null);
  };

  const handleConfirmDelete = (appointmentId: string) => {
    const aptToDelete = appointments.find((a) => a.id === appointmentId);
    const success = deleteAppointment(appointmentId);

    if (success) {
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      addToast(
        'info',
        'Appointment Deleted',
        aptToDelete
          ? `The record for ${aptToDelete.patientName} has been removed.`
          : 'Appointment deleted successfully.'
      );
    } else {
      addToast('error', 'Delete Failed', 'The record could not be found.');
    }

    setDeletingAppointment(null);
  };

  const handleConfirmReset = () => {
    const demoData = resetToDemoData();
    setAppointments(demoData);
    setFilters(INITIAL_FILTERS);
    setIsResetModalOpen(false);
    addToast(
      'info',
      'Demo Data Restored',
      '8 sample medical appointments have been reset.'
    );
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.doctor !== 'ALL' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  const handleClearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="app-wrapper">
      <main className="main-content">
        <Header onNewAppointment={handleOpenCreateModal} />

        <div className="dashboard-container">
          {/* Summary Cards */}
          <SummaryCards summary={summary} />

          {/* Search, Filters, and Sorting Toolbar */}
          <SearchAndFilter
            filters={filters}
            onFilterChange={setFilters}
            availableDoctors={availableDoctors}
            totalAppointmentsCount={appointments.length}
            filteredAppointmentsCount={filteredAppointments.length}
          />

          {/* Desktop Data Table */}
          <AppointmentTable
            appointments={filteredAppointments}
            onViewDetails={handleOpenDetailsModal}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onClearFilters={handleClearAllFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Responsive Mobile / Tablet Card View */}
          <AppointmentCards
            appointments={filteredAppointments}
            onViewDetails={handleOpenDetailsModal}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />

          {/* Footer & Demo Reset */}
          <footer className="dashboard-footer">
            <div className="footer-demo-notice">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>
                CarePoint Clinical Demo System — All records are fictional and stored locally
                in this browser.
              </span>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsResetModalOpen(true)}
                data-testid="reset-demo-data-btn"
                aria-label="Reset to fictional demo dataset"
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </footer>
        </div>

        {/* Create / Edit Appointment Modal */}
        <AppointmentFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingAppointment(null);
          }}
          onSubmit={handleFormSubmit}
          initialAppointment={editingAppointment}
          availableDoctors={availableDoctors}
        />

        {/* View Details Modal */}
        <AppointmentDetailsModal
          isOpen={Boolean(viewingAppointment)}
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={Boolean(deletingAppointment)}
          appointment={deletingAppointment}
          onClose={() => setDeletingAppointment(null)}
          onConfirm={handleConfirmDelete}
        />

        {/* Reset Demo Confirmation Modal */}
        <ResetConfirmModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </main>
    </div>
  );
};
