import React from 'react';
import {
  AppointmentFilters,
  AppointmentStatus,
  AppointmentType,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  SortField,
  SortOrder,
} from '@/types/appointment';
import { Search, X, RotateCcw, ArrowUpDown, Filter } from 'lucide-react';

interface SearchAndFilterProps {
  filters: AppointmentFilters;
  onFilterChange: (filters: AppointmentFilters) => void;
  availableDoctors: string[];
  totalAppointmentsCount: number;
  filteredAppointmentsCount: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFilterChange,
  availableDoctors,
  totalAppointmentsCount,
  filteredAppointmentsCount,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleClearSearch = () => {
    onFilterChange({
      ...filters,
      searchQuery: '',
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      status: e.target.value as AppointmentStatus | 'ALL',
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      type: e.target.value as AppointmentType | 'ALL',
    });
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      doctor: e.target.value,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      endDate: e.target.value,
    });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value as SortField,
    });
  };

  const handleToggleSortOrder = () => {
    onFilterChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      status: 'ALL',
      type: 'ALL',
      doctor: 'ALL',
      startDate: '',
      endDate: '',
      sortBy: 'appointmentDate',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.doctor !== 'ALL' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.status !== 'ALL' ? 1 : 0) +
    (filters.type !== 'ALL' ? 1 : 0) +
    (filters.doctor !== 'ALL' ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0);

  return (
    <section className="filter-section" aria-label="Search and filter appointments">
      {/* 1. Main Search Bar */}
      <div className="filter-row-primary">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by patient, doctor, type, or status..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            id="appointment-search-input"
            data-testid="search-input"
            aria-label="Search appointments"
          />
          {filters.searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search text"
              data-testid="clear-search-btn"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            data-testid="clear-filters-btn"
            aria-label="Clear all applied filters"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset Filters</span>
            <span className="active-filters-badge">{activeFilterCount}</span>
          </button>
        )}
      </div>

      {/* 2. Filter Controls Grid */}
      <div className="filter-controls-grid">
        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="filter-status-select" className="filter-label">
            Status
          </label>
          <select
            id="filter-status-select"
            className="filter-select"
            value={filters.status}
            onChange={handleStatusChange}
            data-testid="status-filter"
          >
            <option value="ALL">All Statuses</option>
            {APPOINTMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Appointment Type Filter */}
        <div className="filter-group">
          <label htmlFor="filter-type-select" className="filter-label">
            Type
          </label>
          <select
            id="filter-type-select"
            className="filter-select"
            value={filters.type}
            onChange={handleTypeChange}
            data-testid="type-filter"
          >
            <option value="ALL">All Types</option>
            {APPOINTMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Filter */}
        <div className="filter-group">
          <label htmlFor="filter-doctor-select" className="filter-label">
            Doctor
          </label>
          <select
            id="filter-doctor-select"
            className="filter-select"
            value={filters.doctor}
            onChange={handleDoctorChange}
            data-testid="doctor-filter"
          >
            <option value="ALL">All Doctors</option>
            {availableDoctors.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Filter */}
        <div className="filter-group">
          <label htmlFor="filter-start-date" className="filter-label">
            From Date
          </label>
          <input
            type="date"
            id="filter-start-date"
            className="filter-date-input"
            value={filters.startDate}
            onChange={handleStartDateChange}
            data-testid="start-date-filter"
          />
        </div>

        {/* End Date Filter */}
        <div className="filter-group">
          <label htmlFor="filter-end-date" className="filter-label">
            To Date
          </label>
          <input
            type="date"
            id="filter-end-date"
            className="filter-date-input"
            value={filters.endDate}
            onChange={handleEndDateChange}
            data-testid="end-date-filter"
          />
        </div>
      </div>

      {/* 3. Results count & Sort Bar */}
      <div className="results-meta-bar" style={{ marginTop: '1.25rem' }}>
        <div className="results-count" data-testid="results-count">
          Showing <strong>{filteredAppointmentsCount}</strong> of{' '}
          <strong>{totalAppointmentsCount}</strong> appointments
          {hasActiveFilters && ' (filtered)'}
        </div>

        <div className="sort-controls">
          <span id="sort-label">Sort by:</span>
          <select
            id="sort-select"
            className="sort-select"
            value={filters.sortBy}
            onChange={handleSortByChange}
            aria-labelledby="sort-label"
            data-testid="sort-by-select"
          >
            <option value="appointmentDate">Appointment Date</option>
            <option value="patientName">Patient Name</option>
            <option value="createdAt">Date Created</option>
          </select>

          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={handleToggleSortOrder}
            title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            aria-label={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            data-testid="sort-order-toggle"
          >
            <ArrowUpDown size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
