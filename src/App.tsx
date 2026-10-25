/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, AppointmentStatus } from './types';
import { dbStore } from './services/dbStore';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { PatientPortal } from './components/PatientPortal';
import { InterviewKit } from './components/InterviewKit';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { CheckCircle, Info, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('admin');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Store reactive snapshot trigger
  const [storeTick, setStoreTick] = useState(0);

  useEffect(() => {
    const unsubscribe = dbStore.subscribe(() => {
      setStoreTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const providers = dbStore.getProviders();
  const services = dbStore.getServices();
  const slots = dbStore.getSlots();
  const appointments = dbStore.getAppointments();
  const queueStats = dbStore.getQueueStats();
  const currentPatient = dbStore.getCurrentPatient();
  const nextInQueue = dbStore.getNextInQueue();

  const handleCallNext = () => {
    const res = dbStore.callNextPatient();
    if (res.success && res.appointment) {
      showNotification(`Called ${res.appointment.tokenNumber} (${res.appointment.patientName}) into room.`, 'success');
    } else {
      showNotification(res.message, 'info');
    }
  };

  const handleUpdateStatus = (id: number, status: AppointmentStatus) => {
    const success = dbStore.updateAppointmentStatus(id, status);
    if (success) {
      const app = appointments.find((a) => a.id === id);
      const label = status.replace('_', ' ');
      showNotification(`Token ${app?.tokenNumber || ''} marked as ${label}.`, 'info');
    }
  };

  const handleBookFromPatientPortal = (params: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    providerId: number;
    serviceId: number;
    slotId: number;
    notes?: string;
  }) => {
    const res = dbStore.bookAppointment(params);
    if (res.success && res.appointment) {
      showNotification(
        `New appointment booked: Token ${res.appointment.tokenNumber} for ${res.appointment.patientName}. MySQL slot reserved!`,
        'success'
      );
    }
    return res;
  };

  const handleBookFromModal = (params: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    providerId: number;
    serviceId: number;
    slotId: number;
    notes?: string;
  }) => {
    const res = dbStore.bookAppointment(params);
    if (res.success && res.appointment) {
      showNotification(
        `Walk-in registered: Token ${res.appointment.tokenNumber} for ${res.appointment.patientName}.`,
        'success'
      );
    }
    return res;
  };

  const handleResetData = () => {
    dbStore.resetDatabase();
    showNotification('Database reset to initial clinical seed state.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Persistent Global Clinic Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAppointment={() => setIsModalOpen(true)}
        onResetData={handleResetData}
        waitingCount={queueStats.checkedInWaiting}
      />

      {/* Real-time Event Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-center justify-between space-x-3 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-teal-500/40'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {notification.type === 'success' ? (
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'admin' && (
          <AdminDashboard
            appointments={appointments}
            providers={providers}
            services={services}
            queueStats={queueStats}
            currentPatient={currentPatient}
            nextInQueue={nextInQueue}
            onCallNext={handleCallNext}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewModal={() => setIsModalOpen(true)}
            onSwitchToPatientPortal={() => setActiveTab('patient_portal')}
          />
        )}

        {activeTab === 'patient_portal' && (
          <PatientPortal
            providers={providers}
            services={services}
            slots={slots}
            appointments={appointments}
            onBookAppointment={handleBookFromPatientPortal}
            onSwitchToAdmin={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'mysql_architecture' && <InterviewKit />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">CareQueue</span>
            <span>—</span>
            <span>Full-Stack React + MySQL Relational Database Architecture</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-teal-700 font-medium transition"
            >
              Staff Admin Portal
            </button>
            <button
              onClick={() => setActiveTab('patient_portal')}
              className="hover:text-teal-700 font-medium transition"
            >
              Patient Portal
            </button>
            <button
              onClick={() => setActiveTab('mysql_architecture')}
              className="hover:text-teal-700 font-medium transition"
            >
              MySQL Schema & Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Walk-in Patient Modal */}
      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        providers={providers}
        services={services}
        slots={slots}
        onSubmit={handleBookFromModal}
      />
    </div>
  );
}
