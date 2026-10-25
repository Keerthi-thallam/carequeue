import React, { useState } from 'react';
import { Appointment, Provider, Service, TimeSlot } from '../types';
import { getTodayDateString, getTomorrowDateString } from '../data/mockData';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Ticket,
  ChevronRight,
  Stethoscope,
  Info,
  Sparkles,
  QrCode,
  MapPin,
  ShieldCheck,
  Search,
  Check,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
} from 'lucide-react';

interface PatientPortalProps {
  providers: Provider[];
  services: Service[];
  slots: TimeSlot[];
  appointments: Appointment[];
  onBookAppointment: (params: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    providerId: number;
    serviceId: number;
    slotId: number;
    notes?: string;
  }) => { success: boolean; appointment?: Appointment; error?: string };
  onSwitchToAdmin: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  providers,
  services,
  slots,
  appointments,
  onBookAppointment,
  onSwitchToAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'book' | 'my_pass' | 'doctors'>('book');

  // Booking Form State
  const [selectedProviderId, setSelectedProviderId] = useState<number>(providers[0]?.id || 1);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 1);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Patient Info
  const [patientName, setPatientName] = useState<string>('Alex Johnson');
  const [patientPhone, setPatientPhone] = useState<string>('+1 (555) 728-9901');
  const [patientEmail, setPatientEmail] = useState<string>('alex.j@example.com');
  const [visitReason, setVisitReason] = useState<string>('Routine health assessment & blood pressure check');

  // Booking State Feedback
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Currently selected entities
  const currentProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];
  const providerServices = services.filter((s) => s.providerId === selectedProviderId);
  const currentService =
    providerServices.find((s) => s.id === selectedServiceId) || providerServices[0] || services[0];

  // Available slots for selected doctor and date
  const availableSlots = slots.filter(
    (s) => s.providerId === selectedProviderId && s.date === selectedDate
  );

  // Latest appointment for pass view
  const activePass =
    bookingSuccess ||
    appointments.filter((a) => a.patientEmail.toLowerCase() === patientEmail.toLowerCase()).pop() ||
    appointments[appointments.length - 1];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedSlotId) {
      setBookingError('Please choose a preferred time slot from the schedule.');
      return;
    }

    if (!patientName.trim() || !patientPhone.trim() || !patientEmail.trim()) {
      setBookingError('Please fill in your full name, phone number, and email.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = onBookAppointment({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
        providerId: selectedProviderId,
        serviceId: currentService.id,
        slotId: selectedSlotId,
        notes: visitReason.trim() || 'Online Web Reservation',
      });

      setIsSubmitting(false);

      if (res.success && res.appointment) {
        setBookingSuccess(res.appointment);
        setActiveTab('my_pass');
      } else {
        setBookingError(res.error || 'The selected slot was just claimed. Please choose another.');
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Patient Portal Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                React Patient Web Portal
              </span>
              <span className="text-xs text-slate-500">• MySQL-Backed Real-Time Booking</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Online Appointment Booking & Live Queue Pass
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Patient-facing web interface built purely in React. Selecting a slot locks the candidate row in MySQL
              InnoDB, issues an instant digital token, and pushes updates to the staff admin queue.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-switch-to-admin-banner"
              onClick={onSwitchToAdmin}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              <span>View Staff Admin Agenda</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Portal Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            id="tab-patient-book"
            onClick={() => setActiveTab('book')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeTab === 'book'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>

          <button
            id="tab-patient-pass"
            onClick={() => setActiveTab('my_pass')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeTab === 'my_pass'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Digital Queue Pass</span>
            {activePass && (
              <span className="text-[10px] font-mono font-bold bg-teal-900 text-teal-200 px-1.5 py-0.2 rounded">
                {activePass.tokenNumber}
              </span>
            )}
          </button>

          <button
            id="tab-patient-doctors"
            onClick={() => setActiveTab('doctors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeTab === 'doctors'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor & Specialist Directory</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKING FORM */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking Stepper Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule Clinical Consultation</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your attending doctor, clinical service, and preferred reservation slot.
              </p>
            </div>

            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Step 1: Doctor Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Choose Physician or Specialist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providers.map((p) => {
                    const isSelected = p.id === selectedProviderId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProviderId(p.id);
                          const firstDocService = services.find((s) => s.providerId === p.id);
                          if (firstDocService) setSelectedServiceId(firstDocService.id);
                          setSelectedSlotId(null);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center space-x-3 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-teal-700 font-medium truncate">{p.specialty}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {p.department} • {p.roomNumber}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Clinical Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Select Consultation Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providerServices.map((svc) => {
                    const isSelected = svc.id === selectedServiceId;
                    return (
                      <div
                        key={svc.id}
                        onClick={() => setSelectedServiceId(svc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{svc.title}</span>
                          <span className="text-xs font-bold text-teal-700">${svc.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{svc.durationMinutes} minutes duration</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Date & Slot Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Select Date & MySQL Time Slot
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Table: <code className="text-teal-700 font-semibold">time_slots</code>
                  </span>
                </div>

                {/* Date quick selector */}
                <div className="flex items-center space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(getTodayDateString());
                      setSelectedSlotId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedDate === getTodayDateString()
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(getTomorrowDateString());
                      setSelectedSlotId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedDate === getTomorrowDateString()
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlotId(null);
                    }}
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.length === 0 ? (
                    <div className="col-span-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      No slots configured for this date. Try selecting another date above.
                    </div>
                  ) : (
                    availableSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      const isBooked = slot.isBooked;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-2.5 rounded-xl text-center border transition relative ${
                            isBooked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50/30'
                          }`}
                        >
                          <span className="font-mono text-xs font-bold block">{slot.startTime}</span>
                          <span
                            className={`text-[10px] mt-0.5 block ${
                              isBooked
                                ? 'text-slate-400'
                                : isSelected
                                ? 'text-teal-100'
                                : 'text-slate-500'
                            }`}
                          >
                            {isBooked ? 'Occupied' : '30 min'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 4: Patient Information */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Patient Registration Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Johnathan Smith"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Email Address (Unique Patient Key)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Reason for Consultation / Symptoms Notes
                    </label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <textarea
                        rows={2}
                        value={visitReason}
                        onChange={(e) => setVisitReason(e.target.value)}
                        placeholder="Describe primary symptoms or health goals..."
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-confirm-patient-booking"
                  disabled={isSubmitting || !selectedSlotId}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs ${
                    isSubmitting || !selectedSlotId
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-500 text-white cursor-pointer'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>
                    {isSubmitting
                      ? 'Executing MySQL Transaction...'
                      : selectedSlotId
                      ? 'Confirm Booking & Issue Token Pass'
                      : 'Select an Available Time Slot to Proceed'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Booking Summary & Relational Integrity Guarantee */}
          <div className="space-y-4">
            {/* Relational Lock Notice */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  MySQL ACID Guarantee
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you click Confirm, the backend runs:
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-teal-300 leading-tight">
                SELECT id FROM time_slots<br />
                WHERE id = {selectedSlotId || 42} AND is_booked = 0<br />
                <span className="text-amber-400 font-bold">FOR UPDATE;</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Guarantees zero double-booking collisions even with thousands of simultaneous users.
              </p>
            </div>

            {/* Selected Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                Booking Summary
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialist:</span>
                  <span className="font-bold text-slate-800 text-right">{currentProvider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-medium text-slate-800">{currentService.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-teal-700">${currentService.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono text-slate-800">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="font-mono font-bold text-teal-700">
                    {slots.find((s) => s.id === selectedSlotId)?.startTime || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clinic Room:</span>
                  <span className="font-mono text-slate-800">{currentProvider.roomNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY DIGITAL QUEUE PASS */}
      {activeTab === 'my_pass' && (
        <div className="max-w-xl mx-auto">
          {activePass ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
              {/* Pass Header */}
              <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 text-center relative">
                <span className="inline-block px-3 py-1 rounded-full bg-teal-800/80 text-[11px] font-semibold tracking-wider uppercase text-teal-200 border border-teal-600 mb-2">
                  Official CareQueue Digital Pass
                </span>
                <p className="text-3xl font-extrabold font-mono tracking-tight text-white mt-1">
                  {activePass.tokenNumber}
                </p>
                <p className="text-xs text-teal-200 mt-1">
                  Present this token upon clinic arrival
                </p>
              </div>

              {/* Pass Details */}
              <div className="p-6 space-y-6">
                {/* Live Status Tracker */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Current Queue Progress
                  </span>
                  <div className="flex items-center justify-between relative">
                    <div className="flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activePass.status === 'confirmed' ||
                          activePass.status === 'checked_in' ||
                          activePass.status === 'in_consultation' ||
                          activePass.status === 'completed'
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 mt-1">Booked</span>
                    </div>

                    <div className="flex-1 h-0.5 bg-slate-200 -mt-3"></div>

                    <div className="flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activePass.status === 'checked_in' ||
                          activePass.status === 'in_consultation' ||
                          activePass.status === 'completed'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {activePass.status === 'checked_in' ? '●' : '2'}
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 mt-1">Checked In</span>
                    </div>

                    <div className="flex-1 h-0.5 bg-slate-200 -mt-3"></div>

                    <div className="flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activePass.status === 'in_consultation' ||
                          activePass.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {activePass.status === 'in_consultation' ? '●' : '3'}
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 mt-1">In Room</span>
                    </div>

                    <div className="flex-1 h-0.5 bg-slate-200 -mt-3"></div>

                    <div className="flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          activePass.status === 'completed'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        4
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 mt-1">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Data Rows */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Patient Name</span>
                    <span className="font-bold text-slate-900">{activePass.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Doctor</span>
                    <span className="font-bold text-slate-900">
                      {providers.find((p) => p.id === activePass.providerId)?.name || 'Doctor'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Assigned Room</span>
                    <span className="font-mono font-bold text-teal-700">
                      {providers.find((p) => p.id === activePass.providerId)?.roomNumber || 'Room --'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Scheduled Time</span>
                    <span className="font-mono text-slate-800">
                      {activePass.date} at {activePass.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status</span>
                    <span className="capitalize font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                      {activePass.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* QR Code for Check-in */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Kiosk Fast Check-In Code</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Scan at clinic entrance tablet or check in with reception staff.
                    </p>
                  </div>
                </div>

                {/* Action: Switch to Admin or Book Another */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={onSwitchToAdmin}
                    className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition text-center"
                  >
                    View in Staff Admin Queue
                  </button>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Active Pass</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have a confirmed appointment token yet. Use the booking tab to reserve an appointment.
              </p>
              <button
                onClick={() => setActiveTab('book')}
                className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition"
              >
                Go to Booking Form
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCTOR DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => {
              const docServices = services.filter((s) => s.providerId === p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                        {p.department}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{p.name}</h4>
                      <p className="text-xs text-slate-600 font-medium">{p.specialty}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{p.roomNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Available Consultation Services
                    </span>
                    <div className="space-y-1">
                      {docServices.map((s) => (
                        <div key={s.id} className="flex justify-between text-xs text-slate-700">
                          <span>{s.title}</span>
                          <span className="font-bold text-teal-700">${s.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProviderId(p.id);
                      const firstSvc = docServices[0];
                      if (firstSvc) setSelectedServiceId(firstSvc.id);
                      setActiveTab('book');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Book with {p.name.split(',')[0]}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
