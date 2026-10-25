import React, { useState } from 'react';
import { Provider, Service, TimeSlot } from '../types';
import { getTodayDateString } from '../data/mockData';
import { X, UserPlus, Check, AlertCircle } from 'lucide-react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
  services: Service[];
  slots: TimeSlot[];
  onSubmit: (params: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    providerId: number;
    serviceId: number;
    slotId: number;
    notes?: string;
  }) => { success: boolean; error?: string };
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  providers,
  services,
  slots,
  onSubmit,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [providerId, setProviderId] = useState<number>(providers[0]?.id || 1);
  const [serviceId, setServiceId] = useState<number>(services[0]?.id || 1);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [notes, setNotes] = useState('Walk-in registered at reception desk');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const today = getTodayDateString();
  const availableSlots = slots.filter(
    (s) => s.providerId === providerId && s.date === today && !s.isBooked
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!slotId) {
      setError('Please select an available time slot.');
      return;
    }

    if (!patientName.trim() || !patientPhone.trim()) {
      setError('Please provide patient name and phone number.');
      return;
    }

    const email = patientEmail.trim() || `${patientName.toLowerCase().replace(/\s+/g, '.')}@patient.clinic`;

    const res = onSubmit({
      patientName,
      patientPhone,
      patientEmail: email,
      providerId,
      serviceId,
      slotId,
      notes,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to register appointment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm">Register Walk-in Patient</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g., Jonathan Reed"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@email.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Doctor</label>
                <select
                  value={providerId}
                  onChange={(e) => {
                    setProviderId(Number(e.target.value));
                    setSlotId(null);
                  }}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} (${s.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Today's Slot ({availableSlots.length} available)
              </label>
              {availableSlots.length === 0 ? (
                <p className="text-rose-600 text-xs py-2">
                  No slots open today for this specialist.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSlotId(slot.id)}
                      className={`py-1.5 px-1 rounded-lg text-center font-mono text-xs transition ${
                        slotId === slot.id
                          ? 'bg-teal-600 text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Triage / Visit Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Symptoms or reason for visit"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!slotId}
              className={`px-4 py-2 rounded-xl text-white font-semibold transition ${
                slotId ? 'bg-teal-700 hover:bg-teal-800' : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              Issue Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
