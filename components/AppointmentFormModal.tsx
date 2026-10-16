import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Appointment,
  AppointmentFormData,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  DEFAULT_DOCTORS,
  FormValidationErrors,
} from '@/types/appointment';
import { validateAppointmentForm } from '@/lib/validation';
import { X, AlertCircle } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  initialAppointment?: Appointment | null;
  availableDoctors: string[];
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialAppointment,
  availableDoctors,
}) => {
  const isEditing = Boolean(initialAppointment);
  const patientInputRef = useRef<HTMLInputElement>(null);

  // Combine default doctors with dynamically discovered ones
  const allDoctorOptions = useMemo(() => {
    return Array.from(
      new Set([...DEFAULT_DOCTORS, ...availableDoctors])
    ).sort();
  }, [availableDoctors]);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    appointmentDate: '',
    appointmentTime: '',
    doctor: allDoctorOptions[0] || 'Dr. Sarah Jenkins (Cardiology)',
    appointmentType: 'General Consultation',
    status: 'Scheduled',
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isCustomDoctor, setIsCustomDoctor] = useState(false);
  const [customDoctorName, setCustomDoctorName] = useState('');

  // Pre-fill form when editing or resetting when opening for creation
  useEffect(() => {
    if (isOpen) {
      if (initialAppointment) {
        const isKnownDoctor = allDoctorOptions.includes(initialAppointment.doctor);
        setFormData({
          patientName: initialAppointment.patientName,
          appointmentDate: initialAppointment.appointmentDate,
          appointmentTime: initialAppointment.appointmentTime,
          doctor: initialAppointment.doctor,
          appointmentType: initialAppointment.appointmentType,
          status: initialAppointment.status,
        });

        if (!isKnownDoctor && initialAppointment.doctor) {
          setIsCustomDoctor(true);
          setCustomDoctorName(initialAppointment.doctor);
        } else {
          setIsCustomDoctor(false);
          setCustomDoctorName('');
        }
      } else {
        // Reset for new creation
        const todayStr = new Date().toISOString().split('T')[0];
        setFormData({
          patientName: '',
          appointmentDate: todayStr,
          appointmentTime: '09:00',
          doctor: allDoctorOptions[0] || 'Dr. Sarah Jenkins (Cardiology)',
          appointmentType: 'General Consultation',
          status: 'Scheduled',
        });
        setIsCustomDoctor(false);
        setCustomDoctorName('');
      }
      setErrors({});

      // Focus the patient name input when modal opens
      setTimeout(() => {
        patientInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialAppointment, allDoctorOptions]);

  // Handle Escape key to dismiss dialog
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

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for field once user starts correcting it
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDoctorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomDoctor(true);
      handleInputChange('doctor', customDoctorName);
    } else {
      setIsCustomDoctor(false);
      handleInputChange('doctor', val);
    }
  };

  const handleCustomDoctorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDoctorName(val);
    handleInputChange('doctor', val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateAppointmentForm(formData);

    if (!validation.isValid || !validation.sanitizedData) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(validation.sanitizedData);
  };

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
        aria-labelledby="modal-form-title"
        data-testid="appointment-form-modal"
      >
        <div className="modal-header">
          <h2 id="modal-form-title" className="modal-title">
            {isEditing ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            type="button"
            className="action-btn"
            onClick={onClose}
            aria-label="Close dialog"
            data-testid="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-grid">
              {/* Patient Name */}
              <div className="form-group full-width">
                <label htmlFor="patient-name-input" className="form-label">
                  Patient Full Name <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  ref={patientInputRef}
                  type="text"
                  id="patient-name-input"
                  className={`form-input ${errors.patientName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Johnathan Doe"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  aria-invalid={Boolean(errors.patientName)}
                  aria-describedby={errors.patientName ? 'patient-name-error' : undefined}
                  data-testid="input-patient-name"
                  required
                />
                {errors.patientName && (
                  <span
                    id="patient-name-error"
                    className="form-error"
                    role="alert"
                    data-testid="error-patient-name"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {errors.patientName}
                  </span>
                )}
              </div>

              {/* Doctor Name */}
              <div className="form-group full-width">
                <label htmlFor="doctor-select" className="form-label">
                  Assigned Doctor <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="doctor-select"
                  className={`form-select ${errors.doctor ? 'is-invalid' : ''}`}
                  value={isCustomDoctor ? '__CUSTOM__' : formData.doctor}
                  onChange={handleDoctorSelect}
                  aria-invalid={Boolean(errors.doctor)}
                  data-testid="select-doctor"
                  required
                >
                  {allDoctorOptions.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Other / Enter Custom Specialist...</option>
                </select>

                {isCustomDoctor && (
                  <input
                    type="text"
                    id="custom-doctor-input"
                    className={`form-input ${errors.doctor ? 'is-invalid' : ''}`}
                    placeholder="Enter doctor's full name & specialty"
                    value={customDoctorName}
                    onChange={handleCustomDoctorChange}
                    style={{ marginTop: '0.5rem' }}
                    aria-label="Custom doctor name"
                    data-testid="input-custom-doctor"
                    required
                  />
                )}

                {errors.doctor && (
                  <span
                    id="doctor-error"
                    className="form-error"
                    role="alert"
                    data-testid="error-doctor"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {errors.doctor}
                  </span>
                )}
              </div>

              {/* Appointment Date */}
              <div className="form-group">
                <label htmlFor="appointment-date-input" className="form-label">
                  Appointment Date <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  type="date"
                  id="appointment-date-input"
                  className={`form-input ${errors.appointmentDate ? 'is-invalid' : ''}`}
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  aria-invalid={Boolean(errors.appointmentDate)}
                  aria-describedby={errors.appointmentDate ? 'date-error' : undefined}
                  data-testid="input-appointment-date"
                  required
                />
                {errors.appointmentDate && (
                  <span
                    id="date-error"
                    className="form-error"
                    role="alert"
                    data-testid="error-appointment-date"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {errors.appointmentDate}
                  </span>
                )}
              </div>

              {/* Appointment Time */}
              <div className="form-group">
                <label htmlFor="appointment-time-input" className="form-label">
                  Appointment Time <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  type="time"
                  id="appointment-time-input"
                  className={`form-input ${errors.appointmentTime ? 'is-invalid' : ''}`}
                  value={formData.appointmentTime}
                  onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                  aria-invalid={Boolean(errors.appointmentTime)}
                  aria-describedby={errors.appointmentTime ? 'time-error' : undefined}
                  data-testid="input-appointment-time"
                  required
                />
                {errors.appointmentTime && (
                  <span
                    id="time-error"
                    className="form-error"
                    role="alert"
                    data-testid="error-appointment-time"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {errors.appointmentTime}
                  </span>
                )}
              </div>

              {/* Appointment Type */}
              <div className="form-group">
                <label htmlFor="appointment-type-select" className="form-label">
                  Appointment Type <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="appointment-type-select"
                  className={`form-select ${errors.appointmentType ? 'is-invalid' : ''}`}
                  value={formData.appointmentType}
                  onChange={(e) => handleInputChange('appointmentType', e.target.value)}
                  aria-invalid={Boolean(errors.appointmentType)}
                  data-testid="select-appointment-type"
                  required
                >
                  {APPOINTMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.appointmentType && (
                  <span
                    id="type-error"
                    className="form-error"
                    role="alert"
                    data-testid="error-appointment-type"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {errors.appointmentType}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="appointment-status-select" className="form-label">
                  Status <span className="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="appointment-status-select"
                  className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  aria-invalid={Boolean(errors.status)}
                  data-testid="select-appointment-status"
                  required
                >
                  {APPOINTMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <span
                    id="status-error"
                    className="form-error"
                    role="alert"
                    data-testid="error-appointment-status"
                  >
                    <AlertCircle size={13} aria-hidden="true" />
                    {errors.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              data-testid="form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              data-testid="form-submit-btn"
            >
              {isEditing ? 'Save Changes' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
