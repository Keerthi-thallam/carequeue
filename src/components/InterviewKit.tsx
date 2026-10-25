import React, { useState } from 'react';
import { CONCURRENCY_SQL_EXPLANATION, REACT_MYSQL_CODE_SNIPPET, MYSQL_DDL_SCRIPT, REST_API_SPEC } from '../data/mysqlSchema';
import { dbStore } from '../services/dbStore';
import { SqlExecutionResult } from '../types';
import {
  Database,
  Terminal,
  Layers,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  Play,
  Server,
  Smartphone,
  LayoutDashboard,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const InterviewKit: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'schema' | 'sql_runner' | 'concurrency' | 'react_code' | 'interview_answers'>('architecture');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // SQL Runner state
  const [sqlInput, setSqlInput] = useState<string>('SELECT * FROM appointments;');
  const [sqlResult, setSqlResult] = useState<SqlExecutionResult | null>(() =>
    dbStore.executeSql('SELECT * FROM appointments;')
  );

  const handleCopySql = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleRunSql = (queryToRun?: string) => {
    const q = queryToRun || sqlInput;
    const res = dbStore.executeSql(q);
    setSqlResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Portfolio & Interview Accelerator
              </span>
              <span className="text-xs text-slate-500">• Production Architecture</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Full-Stack Technical Blueprint & MySQL Architecture
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Use this section during technical interviews to explain system design, relational database
              schema, concurrency locking, and why React + MySQL was the optimal choice.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopySql(MYSQL_DDL_SCRIPT)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied SQL!' : 'Copy schema.sql'}</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeSection === 'architecture'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>

          <button
            onClick={() => setActiveSection('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeSection === 'schema'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MySQL Schema (DDL)</span>
          </button>

          <button
            onClick={() => setActiveSection('sql_runner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeSection === 'sql_runner'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live SQL Console</span>
          </button>

          <button
            onClick={() => setActiveSection('concurrency')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeSection === 'concurrency'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Concurrency & Locks (Interview Q&A)</span>
          </button>

          <button
            onClick={() => setActiveSection('react_code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeSection === 'react_code'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>React & Node.js Code</span>
          </button>

          <button
            onClick={() => setActiveSection('interview_answers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
              activeSection === 'interview_answers'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interview Talking Points</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SYSTEM ARCHITECTURE */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Full-Stack React + MySQL System Topology
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              How the React Patient Portal, React Staff Admin, Node.js REST API, and MySQL relational
              database interact.
            </p>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch text-center text-xs">
              {/* Client Layer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  1. React Client Applications
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-left">
                    <div className="flex items-center space-x-2 font-bold text-slate-900">
                      <Smartphone className="w-4 h-4 text-teal-600" />
                      <span>Patient Web Portal</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Online doctor booking, live slot reservation, digital token pass, kiosk QR code.
                    </p>
                    <span className="inline-block mt-2 text-[10px] bg-teal-50 text-teal-700 font-mono px-1.5 py-0.5 rounded">
                      React 19 / TypeScript
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-left">
                    <div className="flex items-center space-x-2 font-bold text-slate-900">
                      <LayoutDashboard className="w-4 h-4 text-teal-600" />
                      <span>Staff Admin Portal</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Receptionist agenda, live token caller, status triage workflows, operational stats.
                    </p>
                    <span className="inline-block mt-2 text-[10px] bg-teal-50 text-teal-700 font-mono px-1.5 py-0.5 rounded">
                      React 19 / Tailwind
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">HTTPS JSON Payloads</div>
              </div>

              {/* API Layer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  2. Central REST API
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-left space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span>Node.js / Express Service</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    - Unified validation & JWT auth<br />
                    - Database connection pool (<code className="font-mono text-indigo-600">mysql2</code>)<br />
                    - Business logic: slot availability & token generator<br />
                    - Transactional locking executor
                  </p>
                  <span className="inline-block text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded">
                    Hosted on Render / Railway
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">TCP / Port 3306 (SSL)</div>
              </div>

              {/* Database Layer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  3. Relational Storage
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-left space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <Database className="w-4 h-4 text-teal-600" />
                    <span>MySQL 8.0 InnoDB</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    - ACID Transactions (<code className="font-mono text-teal-700">FOR UPDATE</code>)<br />
                    - Strict Foreign Key integrity<br />
                    - Unique composite indexes on (provider, date, time)<br />
                    - Normalized schema (3NF)
                  </p>
                  <span className="inline-block text-[10px] bg-teal-50 text-teal-700 font-mono px-1.5 py-0.5 rounded">
                    Hosted on Aiven / TiDB Cloud
                  </span>
                </div>

                <div className="text-[11px] text-emerald-600 font-medium">ACID Compliant</div>
              </div>
            </div>
          </div>

          {/* REST API Endpoints Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Unified REST API Specification</h4>
              <p className="text-xs text-slate-500">Shared endpoints serving the React Patient Portal and Staff Admin Dashboard</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Endpoint</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Client Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REST_API_SPEC.map((api, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            api.method === 'GET'
                              ? 'bg-blue-50 text-blue-700'
                              : api.method === 'POST'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {api.method}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-900 font-medium">{api.endpoint}</td>
                      <td className="py-2.5 px-4 text-slate-600">{api.description}</td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">{api.usedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MYSQL SCHEMA DDL */}
      {activeSection === 'schema' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-teal-400">schema.sql</span>
                <p className="text-xs text-slate-400">
                  Production DDL ready to execute in MySQL Workbench, phpMyAdmin, or Railway
                </p>
              </div>
              <button
                onClick={() => handleCopySql(MYSQL_DDL_SCRIPT)}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-[480px] leading-relaxed">
              <code>{MYSQL_DDL_SCRIPT}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 3: LIVE SQL RUNNER */}
      {activeSection === 'sql_runner' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Interactive SQL Query Console</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Execute queries live against the clinic's in-memory relational tables to test schema queries.
              </p>
            </div>

            {/* Quick preset queries */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 self-center text-[11px]">Preset Queries:</span>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM appointments;');
                  handleRunSql('SELECT * FROM appointments;');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] transition"
              >
                SELECT * FROM appointments
              </button>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM providers;');
                  handleRunSql('SELECT * FROM providers;');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] transition"
              >
                SELECT * FROM providers
              </button>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM time_slots;');
                  handleRunSql('SELECT * FROM time_slots;');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] transition"
              >
                SELECT * FROM time_slots
              </button>
              <button
                onClick={() => {
                  setSqlInput('SELECT * FROM services;');
                  handleRunSql('SELECT * FROM services;');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono text-[11px] transition"
              >
                SELECT * FROM services
              </button>
            </div>

            {/* Query Editor Bar */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  placeholder="Enter SQL query (e.g., SELECT * FROM appointments;)"
                  className="w-full bg-slate-900 text-teal-300 font-mono text-xs px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => handleRunSql()}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Query</span>
              </button>
            </div>

            {/* Execution Meta */}
            {sqlResult && (
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Query completed in{' '}
                  <strong className="text-slate-800 font-mono">{sqlResult.executionTimeMs} ms</strong>
                </span>
                <span>
                  Returned <strong className="text-slate-800 font-mono">{sqlResult.rowCount}</strong> rows
                </span>
              </div>
            )}

            {/* Results Table */}
            {sqlResult && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border-b border-slate-200">
                      <tr>
                        {sqlResult.columns.map((col, idx) => (
                          <th key={idx} className="py-2 px-3">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                      {sqlResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {sqlResult.columns.map((col, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                              {row[col] !== undefined && row[col] !== null ? String(row[col]) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: CONCURRENCY & RACE CONDITIONS */}
      {activeSection === 'concurrency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-amber-700">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Interview Goldmine: Handling Booking Race Conditions
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              In technical interviews, senior engineers will always ask:
              <br />
              <em className="text-slate-800 font-semibold">
                "What happens if two patients on your React web app hit 'Book 10:00 AM' at the exact same millisecond?"
              </em>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                <h4 className="font-bold text-rose-800 mb-1">Naive Approach (Bug-Prone)</h4>
                <p className="text-rose-700 leading-relaxed">
                  App executes <code className="font-mono bg-rose-100 px-1 rounded">SELECT is_booked FROM slots WHERE id=1;</code>, sees it's 0, then runs an <code className="font-mono bg-rose-100 px-1 rounded">INSERT</code>.
                  Both concurrent requests read 0 before either has inserted, resulting in two patients showing up for the exact same slot.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <h4 className="font-bold text-emerald-800 mb-1">CareQueue Solution (Production Safe)</h4>
                <p className="text-emerald-700 leading-relaxed">
                  Using MySQL InnoDB Row-Level Exclusive Lock (<code className="font-mono bg-emerald-100 px-1 rounded font-bold">SELECT ... FOR UPDATE</code>) inside a transaction. The first request locks the row; the second request waits or instantly receives a clean 409 Conflict.
                </p>
              </div>
            </div>

            {/* Concurrency SQL Script */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                <code>{CONCURRENCY_SQL_EXPLANATION}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: REACT & NODE.JS FULL-STACK CODE */}
      {activeSection === 'react_code' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-mono text-teal-400">
                  Full-Stack Architecture: Node.js Express Controller + React Custom Hook
                </span>
                <p className="text-xs text-slate-400">
                  Production TypeScript implementation with mysql2/promise connection pooling & ACID transaction rollback
                </p>
              </div>
              <button
                onClick={() => handleCopySql(REACT_MYSQL_CODE_SNIPPET)}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-[500px] leading-relaxed">
              <code>{REACT_MYSQL_CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 6: INTERVIEW TALKING POINTS */}
      {activeSection === 'interview_answers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-base">
              Key React + MySQL Interview Questions & Strong Answers
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  1. "Why choose React for both the patient portal and the clinical queue dashboard?"
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Strong Answer:</strong> "React provides component-driven reusability between the public patient booking interface and the high-density clinic administration board. Features like reactive hooks, instant state updates without full page reloads, and responsive desktop/mobile layouts give patients an app-like booking experience in their browser while giving medical receptionists zero-latency queue manipulation and live token callouts."
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  2. "Why MySQL rather than MongoDB or Firebase for healthcare appointments?"
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Strong Answer:</strong> "Healthcare appointments are inherently relational and transaction-critical. We have strict 1:N relations (1 Doctor to many 30-min Slots, 1 Patient to many Appointments) and a strict 1:1 constraint (1 Slot can belong to at most 1 active Appointment). MySQL with InnoDB provides ACID compliance, foreign key constraints that prevent orphan bookings, and pessimistic row locks (SELECT ... FOR UPDATE) to prevent double-booking."
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  3. "How do you manage state and transaction integrity between React and MySQL?"
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Strong Answer:</strong> "In React, we use modular custom hooks (such as useAppointmentBooking) with optimistic UI updates and structured error boundaries. On the Node.js/Express backend, we manage database connections via a mysql2/promise connection pool with configurable limits, executing all multi-step booking operations within explicit transactions wrapped in try/catch/rollback blocks."
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">
                  4. "What indexing strategy did you design for MySQL performance?"
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Strong Answer:</strong> "We added a composite unique index on time_slots (provider_id, slot_date, start_time) to enforce physical schedule boundaries at the database level, composite index on appointments (appointment_date, status) to make daily clinic queue queries sub-millisecond, and an index on patients (phone, email) for instant patient lookups."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
