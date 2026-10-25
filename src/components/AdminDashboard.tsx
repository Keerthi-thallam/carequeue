import React, { useState } from 'react';
import { Appointment, AppointmentStatus, Provider, QueueStats, Service } from '../types';
import {
  Users,
  Clock,
  CheckCircle,
  Megaphone,
  UserCheck,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Stethoscope,
  Calendar,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  appointments: Appointment[];
  providers: Provider[];
  services: Service[];
  queueStats: QueueStats;
  currentPatient: Appointment | null;
  nextInQueue: Appointment | null;
  onCallNext: () => void;
  onUpdateStatus: (id: number, status: AppointmentStatus) => void;
  onOpenNewModal: () => void;
  onSwitchToPatientPortal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  appointments,
  providers,
  services,
  queueStats,
  currentPatient,
  nextInQueue,
  onCallNext,
  onUpdateStatus,
  onOpenNewModal,
  onSwitchToPatientPortal,
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    if (selectedProviderId !== 'all' && app.providerId !== selectedProviderId) return false;
    if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = app.patientName.toLowerCase().includes(q);
      const matchToken = app.tokenNumber.toLowerCase().includes(q);
      const matchPhone = app.patientPhone.includes(q);
      if (!matchName && !matchToken && !matchPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_consultation':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            In Consultation
          </span>
        );
      case 'checked_in':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Waiting in Queue
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Confirmed
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            Cancelled
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            No Show
          </span>
        );
      default:
        return null;
    }
  };

  const getProviderName = (id: number) => {
    return providers.find((p) => p.id === id)?.name || 'Unknown Provider';
  };

  const getProviderRoom = (id: number) => {
    return providers.find((p) => p.id === id)?.roomNumber || 'Room --';
  };

  const getServiceTitle = (id: number) => {
    return services.find((s) => s.id === id)?.title || 'Medical Consultation';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-time Live Queue Station */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Active Serving Box */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-slate-700 pb-5 lg:pb-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border-2 border-teal-500/50 flex flex-col items-center justify-center text-teal-300">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">Serving</span>
                <span className="text-xl font-mono font-extrabold tracking-tight">
                  {currentPatient ? currentPatient.tokenNumber : '--'}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white">
                    {currentPatient ? currentPatient.patientName : 'No Active Patient in Room'}
                  </h2>
                  {currentPatient && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentPatient
                    ? `${getServiceTitle(currentPatient.serviceId)} • ${getProviderRoom(currentPatient.providerId)} (${getProviderName(currentPatient.providerId)})`
                    : 'Call the next checked-in patient from the waiting queue to begin consultation.'}
                </p>
                {currentPatient?.notes && (
                  <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                    "{currentPatient.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions for Current Patient */}
            {currentPatient && (
              <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
                <button
                  id="btn-mark-completed"
                  onClick={() => onUpdateStatus(currentPatient.id, 'completed')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
                <button
                  id="btn-mark-noshow"
                  onClick={() => onUpdateStatus(currentPatient.id, 'no_show')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition"
                  title="Mark as No Show"
                >
                  No Show
                </button>
              </div>
            )}
          </div>

          {/* Next Up & Call Station */}
          <div className="flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Up Next in Queue
              </span>
              <span className="text-xs text-teal-400 font-mono font-medium">
                {queueStats.checkedInWaiting} Waiting
              </span>
            </div>

            {nextInQueue ? (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold font-mono text-teal-300">
                      {nextInQueue.tokenNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-200">
                      {nextInQueue.patientName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Checked in at {nextInQueue.checkInTime || nextInQueue.time}
                  </span>
                </div>
                <span className="text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
                  Ready
                </span>
              </div>
            ) : (
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
                Waiting lounge is clear. Next scheduled check-ins will populate here.
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                id="btn-call-next"
                onClick={onCallNext}
                disabled={!nextInQueue}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-sm ${
                  nextInQueue
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Call Next Token</span>
              </button>

              <button
                id="btn-test-patient-portal-link"
                onClick={onSwitchToPatientPortal}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-medium border border-slate-700 transition flex items-center space-x-1 shrink-0"
                title="Open Patient Portal to book an appointment"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Patient Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Total</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{queueStats.totalToday}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Scheduled appointments</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Waiting in Clinic</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">{queueStats.checkedInWaiting}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Physically checked-in</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Consultations Done</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{queueStats.completedToday}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Discharged today</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Queue Wait</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{queueStats.avgWaitMinutes} min</p>
          <span className="text-[11px] text-teal-700 font-medium mt-0.5 block">Within target &lt; 20m</span>
        </div>
      </div>

      {/* Main Appointments Schedule & Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar / Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Daily Appointment Schedule & Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live relational feed synced with MySQL <code className="text-slate-700 font-mono">appointments</code> table.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-patient"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, token, phone..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-48 sm:w-56"
              />
            </div>

            {/* Doctor Filter */}
            <select
              id="filter-provider"
              value={selectedProviderId}
              onChange={(e) =>
                setSelectedProviderId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Doctors</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="checked_in">Waiting in Queue</option>
              <option value="in_consultation">In Consultation</option>
              <option value="confirmed">Confirmed (Scheduled)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              id="btn-add-walkin"
              onClick={onOpenNewModal}
              className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
            >
              <span>+ New Walk-in</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Info</th>
                <th className="py-3 px-4">Doctor & Room</th>
                <th className="py-3 px-4">Slot Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Visit Notes</th>
                <th className="py-3 px-4 text-right">Staff Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    {/* Token */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-800 border border-slate-200">
                        {app.tokenNumber}
                      </span>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.patientName}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" />
                          {app.patientPhone}
                        </span>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{getProviderName(app.providerId)}</p>
                      <span className="text-[11px] text-slate-500">{getProviderRoom(app.providerId)}</span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{app.time}</div>
                      {app.checkInTime && (
                        <span className="text-[10px] text-amber-700 block">
                          In: {app.checkInTime}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 truncate" title={app.notes}>
                        {app.notes || '—'}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {getServiceTitle(app.serviceId)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {app.status === 'confirmed' && (
                          <button
                            id={`btn-checkin-${app.id}`}
                            onClick={() => onUpdateStatus(app.id, 'checked_in')}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-medium transition"
                            title="Patient arrived at clinic"
                          >
                            Check In
                          </button>
                        )}

                        {app.status === 'checked_in' && (
                          <button
                            id={`btn-call-${app.id}`}
                            onClick={() => onUpdateStatus(app.id, 'in_consultation')}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded text-[11px] font-medium transition"
                          >
                            Call into Room
                          </button>
                        )}

                        {app.status === 'in_consultation' && (
                          <button
                            id={`btn-done-${app.id}`}
                            onClick={() => onUpdateStatus(app.id, 'completed')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-medium transition"
                          >
                            Discharge
                          </button>
                        )}

                        {app.status !== 'completed' && app.status !== 'cancelled' && (
                          <button
                            id={`btn-cancel-${app.id}`}
                            onClick={() => onUpdateStatus(app.id, 'cancelled')}
                            className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-[11px] transition"
                            title="Cancel appointment & release slot"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
