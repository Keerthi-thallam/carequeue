# CareQueue — Clinical Appointment & Queue Management System

> **Stack:** React 19 + TypeScript + Tailwind CSS + MySQL Relational Database Architecture (InnoDB)

CareQueue is a healthcare appointment scheduling and live clinic queue management application. It is engineered with a strict **relational MySQL database architecture**, featuring a patient booking web portal, a staff reception queue desk, and an interactive in-app SQL console.

---

## 🚀 Key Modules & Capabilities

### 1. Patient Web Portal (`src/components/PatientPortal.tsx`)
- **Doctor & Specialty Directory:** Browse physicians by department (Cardiology, Dermatology, General Medicine, Pediatrics, Orthopedics) with room assignments.
- **Service Selection:** Choose consultation types with defined durations and fees.
- **Dynamic Slot Reservation:** Live 30-minute booking slots synced with database records.
- **Digital Queue Pass & Token:** Generates sequential tokens (e.g., `A-108`), estimated wait times, room numbers, and a fast check-in kiosk QR badge.
- **ACID Collision Detection:** Alerts the patient immediately if a slot was claimed by a concurrent booking transaction.

### 2. Staff Admin Queue Dashboard (`src/components/AdminDashboard.tsx`)
- **Live Token Caller:** One-click paging to call the next waiting patient into the doctor's consultation room.
- **Queue State Machine:** Transitions appointments across lifecycle states:
  $$\text{Confirmed} \longrightarrow \text{Checked In} \longrightarrow \text{In Consultation} \longrightarrow \text{Completed / No Show}$$
- **Operational Metrics:** Real-time counters for waiting patients, active consultations, total daily appointments, and average wait time.
- **Walk-in Booking Modal:** Receptionist intake form that atomically creates a patient record and reserves a slot.

### 3. MySQL Architecture & SQL Runner (`src/components/InterviewKit.tsx`)
- **Interactive SQL Runner:** An in-browser query console allowing you to run live queries (`SELECT * FROM appointments;`, `SELECT * FROM time_slots;`) against the active relational store with real-time execution timing.
- **Production MySQL DDL (`src/data/mysqlSchema.ts`):** Complete copy-ready SQL schema with InnoDB engine settings, foreign keys, and composite unique indexes.
- **Race Condition Guide:** Deep-dive into MySQL row-level exclusive locks (`SELECT ... FOR UPDATE`) preventing double-booking during high-traffic spikes.
- **Full-Stack Controller Snippet:** Production TypeScript code demonstrating `mysql2/promise` connection pooling, ACID transaction rollback, and React custom hooks.

---

## 🗄️ Relational Database Schema (MySQL)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   departments   │ 1───N │    providers    │ 1───N │   time_slots    │
│ (Cardio, Neuro) │       │ (Dr. Chen, etc) │       │ (30-min blocks) │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │ 1
┌─────────────────┐                                          │
│    patients     │ 1                                        │ 1
│ (Contact Info)  │───┐                                      │
└─────────────────┘   │ N                                    ▼
                      └───► ┌─────────────────────────────────────────┐
                            │              appointments               │
                            │ (token_number, status, slot_id, notes)  │
                            └─────────────────────────────────────────┘
```

### Table Definitions

| Table | Description | Primary Key | Key Constraints / Indexes |
|---|---|---|---|
| **`departments`** | Clinical departments | `id` | `name` UNIQUE |
| **`providers`** | Physicians & room assignments | `id` | FK `department_id` REFERENCES `departments(id)` |
| **`services`** | Clinical consultation offerings | `id` | FK `provider_id` REFERENCES `providers(id)` |
| **`time_slots`** | 30-min reservation slots | `id` | UNIQUE `(provider_id, slot_date, start_time)` |
| **`patients`** | Registered patients | `id` | `email` UNIQUE, INDEX on `phone` |
| **`appointments`** | Booked visits & queue tokens | `id` | UNIQUE `token_number`, INDEX `(appointment_date, status)` |

---

## 🔒 Concurrency & Double-Booking Prevention

When multiple patients attempt to book the same doctor's slot at the exact same millisecond, a standard `SELECT` followed by `INSERT` produces double-booking bugs. 

CareQueue solves this using **Pessimistic Row-Level Exclusive Locking (`FOR UPDATE`)** inside an atomic MySQL transaction:

```sql
START TRANSACTION;

-- Lock the candidate slot row exclusively:
SELECT id, is_booked 
FROM time_slots 
WHERE id = 42 AND is_booked = 0 
FOR UPDATE;

-- If slot was already booked by a concurrent thread, rollback immediately:
-- Application check: if (slotRows.length === 0) { ROLLBACK; return 409 Conflict; }

-- Claim the slot:
UPDATE time_slots SET is_booked = 1 WHERE id = 42;

-- Insert appointment record:
INSERT INTO appointments (
  token_number, patient_id, provider_id, service_id, slot_id, appointment_date, status, notes
) VALUES (
  'A-108', 5, 1, 1, 42, CURDATE(), 'confirmed', 'Booked via React Patient Portal'
);

COMMIT;
```

---

## 🛠️ Project Structure

```
├── index.html                   # Entry HTML with synced metadata
├── metadata.json                # Project configuration & permissions
├── package.json                 # Dependencies & build scripts
├── README.md                    # Project documentation (this file)
└── src/
    ├── main.tsx                 # React DOM root entry
    ├── App.tsx                  # Top-level state coordinator & tab router
    ├── types.ts                 # TypeScript interfaces, enums, and data models
    ├── components/
    │   ├── Navbar.tsx           # Global navigation with queue counters
    │   ├── PatientPortal.tsx    # Patient-facing appointment booking & token pass
    │   ├── AdminDashboard.tsx   # Staff queue station, caller, & agenda table
    │   ├── InterviewKit.tsx     # Architecture viewer, DDL script, & SQL Runner
    │   └── NewAppointmentModal.tsx # Reception walk-in intake dialog
    ├── data/
    │   ├── mockData.ts          # Seed data for doctors, services, and initial slots
    │   └── mysqlSchema.ts       # Production SQL DDL script, query samples, & API spec
    └── services/
        └── dbStore.ts           # In-memory relational store & SQL query executor
```

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Open in browser:
# http://localhost:3000
```

### Production Build & Linting

```bash
# Type check with TypeScript
npm run lint

# Build production bundle into /dist
npm run build
```

---

## 🎯 Interview Quick-Reference Guide

1. **Why MySQL instead of a NoSQL document store (MongoDB/Firestore)?**
   - Healthcare scheduling is inherently relational: doctors, time slots, and patient appointments have strict 1:N and 1:1 constraints. Foreign keys ensure orphan appointments cannot exist, and InnoDB ACID transactions prevent slot collision anomalies.
2. **How does the SQL Console connect to the React UI?**
   - The interactive SQL runner targets the application's unified relational state. Any booking made in the Patient Portal or any status change in the Staff Admin updates the relational tables in real time, queryable immediately with `SELECT * FROM appointments;`.
3. **What is the index strategy?**
   - `time_slots(provider_id, slot_date, start_time)` has a composite unique constraint to physically prevent overlapping slots.
   - `appointments(appointment_date, status)` has a composite index to ensure daily queue queries (`status = 'checked_in'`) execute in sub-millisecond time.
