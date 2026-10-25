import React from 'react';
import { ActiveTab } from '../types';
import { Activity, Smartphone, LayoutDashboard, Database, RotateCcw, PlusCircle, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewAppointment: () => void;
  onResetData: () => void;
  waitingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAppointment,
  onResetData,
  waitingCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinic Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CareQueue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-medium">
                  Full-Stack Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Clinic Queue & Appointment System (React + MySQL Architecture)
              </p>
            </div>
          </div>

          {/* Center: Navigation Switcher */}
          <nav className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              id="tab-react-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Staff Admin</span>
              {waitingCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'admin' ? 'bg-teal-800 text-teal-100' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {waitingCount} waiting
                </span>
              )}
            </button>

            <button
              id="tab-patient-portal"
              onClick={() => setActiveTab('patient_portal')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'patient_portal'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Patient Portal</span>
              <span className="hidden md:inline-block text-[10px] text-teal-300 bg-teal-900/50 px-1 rounded">
                React Web
              </span>
            </button>

            <button
              id="tab-mysql-architecture"
              onClick={() => setActiveTab('mysql_architecture')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'mysql_architecture'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>MySQL & Architecture</span>
              <span className="hidden md:inline-block text-[10px] bg-amber-500/20 text-amber-300 px-1.5 rounded border border-amber-500/30">
                SQL Console
              </span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-fast-walkin"
              onClick={onOpenNewAppointment}
              className="hidden sm:inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
              title="Fast register walk-in patient"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Walk-in</span>
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Reset to Initial Seed Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
