export const MYSQL_DDL_SCRIPT = `-- CareQueue: Clinical Appointment & Token Queue System
-- Engine: MySQL 8.0+ / MariaDB (InnoDB Storage Engine)
-- Character Set: utf8mb4 / utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS carequeue_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE carequeue_db;

-- 1. Providers / Doctors Table
CREATE TABLE IF NOT EXISTS providers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  room_number VARCHAR(30) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_provider_dept (department),
  INDEX idx_provider_active (is_active)
) ENGINE=InnoDB;

-- 2. Services Catalog
CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_service_provider (provider_id)
) ENGINE=InnoDB;

-- 3. Time Slots (Granular 30-min inventory per provider)
CREATE TABLE IF NOT EXISTS time_slots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  provider_id INT UNSIGNED NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked TINYINT(1) DEFAULT 0,
  version INT UNSIGNED DEFAULT 1, -- Optimistic lock support
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_slots_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_provider_slot (provider_id, slot_date, start_time),
  INDEX idx_slot_search (provider_id, slot_date, is_booked)
) ENGINE=InnoDB;

-- 4. Patients / Users Table
CREATE TABLE IF NOT EXISTS patients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_patient_phone (phone)
) ENGINE=InnoDB;

-- 5. Appointments & Queue Tokens
CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  token_number VARCHAR(20) NOT NULL,
  patient_id INT UNSIGNED NOT NULL,
  provider_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  slot_id INT UNSIGNED NOT NULL UNIQUE, -- 1-to-1 slot enforcement
  appointment_date DATE NOT NULL,
  status ENUM('confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'confirmed',
  check_in_time DATETIME NULL,
  consultation_start DATETIME NULL,
  consultation_end DATETIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_app_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_app_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_app_slot
    FOREIGN KEY (slot_id) REFERENCES time_slots(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_app_date_status (appointment_date, status),
  INDEX idx_app_token (token_number)
) ENGINE=InnoDB;
`;

export const CONCURRENCY_SQL_EXPLANATION = `
-- ========================================================================
-- CRITICAL INTERVIEW CONCEPT: Preventing Double-Booking Race Conditions
-- ========================================================================
-- When two patients on the React web portal hit 'Book 10:00 AM' at the exact same millisecond,
-- a naive SELECT followed by INSERT causes slot collisions.
-- Here is how CareQueue handles it using a Row-Level Exclusive Lock in MySQL:

START TRANSACTION;

-- 1. Lock the candidate slot row exclusively for this connection:
SELECT id, is_booked 
FROM time_slots 
WHERE id = 42 AND is_booked = 0 
FOR UPDATE;

-- 2. If the slot was already snatched by an earlier concurrent transaction,
--    the SELECT returns 0 rows. In application code (Node.js/Express):
--    if (!slot) { ROLLBACK; return res.status(409).json({ error: 'Slot already reserved' }); }

-- 3. Mark the slot as reserved:
UPDATE time_slots 
SET is_booked = 1 
WHERE id = 42;

-- 4. Insert the appointment record with generated token:
INSERT INTO appointments (
  token_number, patient_id, provider_id, service_id, slot_id, appointment_date, status, notes
) VALUES (
  'A-108', 5, 1, 1, 42, CURDATE(), 'confirmed', 'Booked via React Patient Portal'
);

-- 5. Commit releasing locks atomically:
COMMIT;
`;

export const REACT_MYSQL_CODE_SNIPPET = `// ============================================================================
// PART 1: Node.js / Express Backend Route with mysql2/promise Connection Pool
// server/controllers/appointmentController.ts
// ============================================================================
import { Request, Response } from 'express';
import mysql from 'mysql2/promise';

// MySQL Connection Pool with InnoDB engine support
export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'carequeue_user',
  password: process.env.DB_PASSWORD || 'secret',
  database: 'carequeue_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

export async function bookAppointmentHandler(req: Request, res: Response) {
  const { providerId, serviceId, slotId, patientName, phone, email, notes } = req.body;
  const connection = await dbPool.getConnection();

  try {
    // 1. Begin atomic ACID Transaction
    await connection.beginTransaction();

    // 2. Pessimistic Row Lock: Prevent concurrent double-booking
    const [slotRows]: any = await connection.execute(
      'SELECT id, is_booked, slot_date, start_time FROM time_slots WHERE id = ? AND is_booked = 0 FOR UPDATE',
      [slotId]
    );

    if (slotRows.length === 0) {
      await connection.rollback();
      return res.status(409).json({
        error: 'CONFLICT_SLOT_TAKEN',
        message: 'This time slot was just claimed by another patient. Please choose another.'
      });
    }

    const slot = slotRows[0];

    // 3. Upsert patient record
    let patientId: number;
    const [existingPatient]: any = await connection.execute(
      'SELECT id FROM patients WHERE email = ?',
      [email]
    );

    if (existingPatient.length > 0) {
      patientId = existingPatient[0].id;
    } else {
      const [insertPatient]: any = await connection.execute(
        'INSERT INTO patients (full_name, phone, email) VALUES (?, ?, ?)',
        [patientName, phone, email]
      );
      patientId = insertPatient.insertId;
    }

    // 4. Generate daily sequential token (e.g., A-108)
    const tokenNumber = \`A-\${100 + Math.floor(Math.random() * 900)}\`;

    // 5. Reserve slot and create appointment
    await connection.execute('UPDATE time_slots SET is_booked = 1 WHERE id = ?', [slotId]);

    const [appResult]: any = await connection.execute(
      \`INSERT INTO appointments 
        (token_number, patient_id, provider_id, service_id, slot_id, appointment_date, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)\`,
      [tokenNumber, patientId, providerId, serviceId, slotId, slot.slot_date, notes || 'Booked online']
    );

    // 6. Commit transaction and release locks
    await connection.commit();

    return res.status(201).json({
      success: true,
      appointmentId: appResult.insertId,
      tokenNumber,
      date: slot.slot_date,
      time: slot.start_time
    });
  } catch (error) {
    await connection.rollback();
    console.error('MySQL Transaction Error:', error);
    return res.status(500).json({ error: 'DATABASE_TRANSACTION_FAILED' });
  } finally {
    connection.release();
  }
}

// ============================================================================
// PART 2: React Client Hook (TypeScript) with Live State & Toast Feedback
// src/hooks/useAppointmentBooking.ts
// ============================================================================
import { useState } from 'react';

interface BookingParams {
  providerId: number;
  serviceId: number;
  slotId: number;
  patientName: string;
  phone: string;
  email: string;
  notes?: string;
}

export function useAppointmentBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookSlot = async (params: BookingParams) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { bookSlot, isSubmitting, error };
}
`;

export const REST_API_SPEC = [
  {
    method: 'GET',
    endpoint: '/api/providers',
    description: 'Returns all active clinic doctors, specialties, and their room assignments.',
    usedBy: 'React Patient Portal & React Admin',
  },
  {
    method: 'GET',
    endpoint: '/api/slots?providerId=1&date=YYYY-MM-DD',
    description: 'Returns available 30-min booking slots for a chosen doctor and date.',
    usedBy: 'React Patient Portal',
  },
  {
    method: 'POST',
    endpoint: '/api/appointments/book',
    description: 'Atomically creates an appointment and claims the slot using MySQL transaction locking.',
    usedBy: 'React Patient Portal & React Staff Modal',
  },
  {
    method: 'GET',
    endpoint: '/api/queue/today',
    description: 'Returns live queue tokens, current consultation, and wait-time statistics.',
    usedBy: 'React Admin Board & Patient Digital Pass',
  },
  {
    method: 'PATCH',
    endpoint: '/api/appointments/:id/status',
    description: 'Updates status: checked_in -> in_consultation -> completed | no_show.',
    usedBy: 'React Admin Staff Portal',
  },
];
