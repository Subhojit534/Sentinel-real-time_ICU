-- ============================================================
-- Sentinel ICU — Full Dummy Data Seed
-- Run this in Supabase SQL Editor or via psql
-- ============================================================

-- ── Hospitals ──────────────────────────────────────────────
INSERT INTO hospitals (id, name) VALUES
  ('hosp-1', 'Metro Health Center'),
  ('hosp-2', 'City General Hospital')
ON CONFLICT (id) DO NOTHING;

-- ── Wards ──────────────────────────────────────────────────
INSERT INTO wards (id, hospital_id, name, total_beds) VALUES
  ('ward-icu-a', 'hosp-1', 'ICU Alpha',   8),
  ('ward-icu-b', 'hosp-1', 'ICU Beta',    8),
  ('ward-icu-c', 'hosp-1', 'ICU Gamma',   10),
  ('ward-icu-d', 'hosp-2', 'Cardiac ICU', 6),
  ('ward-icu-e', 'hosp-2', 'Neuro ICU',   8)
ON CONFLICT (id) DO NOTHING;

-- ── Users (clinicians) ─────────────────────────────────────
INSERT INTO users (id, name, role, hospital_id, ward_id, email, password) VALUES
  ('user-001', 'Dr. Priya Sharma',   'doctor', 'hosp-1', 'ward-icu-a', 'priya.sharma@sentinel.icu',  'Sentinel@ICU2026'),
  ('user-002', 'Dr. Vikram Nair',    'doctor', 'hosp-1', 'ward-icu-b', 'vikram.nair@sentinel.icu',   'Sentinel@ICU2026'),
  ('user-003', 'Dr. Amara Diallo',   'doctor', 'hosp-2', 'ward-icu-d', 'amara.diallo@sentinel.icu',  'Sentinel@ICU2026'),
  ('user-004', 'Nurse Kavita Rao',   'nurse',  'hosp-1', 'ward-icu-a', 'kavita.rao@sentinel.icu',    'Sentinel@ICU2026'),
  ('user-005', 'Nurse James Okafor', 'nurse',  'hosp-1', 'ward-icu-b', 'james.okafor@sentinel.icu',  'Sentinel@ICU2026'),
  ('user-006', 'Nurse Sarah Chen',   'nurse',  'hosp-2', 'ward-icu-d', 'sarah.chen@sentinel.icu',    'Sentinel@ICU2026'),
  ('user-007', 'Admin Sys',          'admin',  'hosp-1', 'ward-icu-a', 'admin@sentinel.icu',         'Sentinel@ICU2026')
ON CONFLICT (id) DO NOTHING;

-- ── Beds ───────────────────────────────────────────────────
INSERT INTO beds (id, ward_id, number, status) VALUES
  -- ICU Alpha (8 beds)
  ('bed-a01', 'ward-icu-a', 'A-01', 'occupied'),
  ('bed-a02', 'ward-icu-a', 'A-02', 'occupied'),
  ('bed-a03', 'ward-icu-a', 'A-03', 'occupied'),
  ('bed-a04', 'ward-icu-a', 'A-04', 'available'),
  ('bed-a05', 'ward-icu-a', 'A-05', 'available'),
  ('bed-a06', 'ward-icu-a', 'A-06', 'maintenance'),
  ('bed-a07', 'ward-icu-a', 'A-07', 'available'),
  ('bed-a08', 'ward-icu-a', 'A-08', 'available'),
  -- ICU Beta (8 beds)
  ('bed-b01', 'ward-icu-b', 'B-01', 'occupied'),
  ('bed-b02', 'ward-icu-b', 'B-02', 'occupied'),
  ('bed-b03', 'ward-icu-b', 'B-03', 'occupied'),
  ('bed-b04', 'ward-icu-b', 'B-04', 'available'),
  ('bed-b05', 'ward-icu-b', 'B-05', 'available'),
  ('bed-b06', 'ward-icu-b', 'B-06', 'reserved'),
  ('bed-b07', 'ward-icu-b', 'B-07', 'available'),
  ('bed-b08', 'ward-icu-b', 'B-08', 'available'),
  -- ICU Gamma (10 beds)
  ('bed-c01', 'ward-icu-c', 'C-01', 'occupied'),
  ('bed-c02', 'ward-icu-c', 'C-02', 'occupied'),
  ('bed-c03', 'ward-icu-c', 'C-03', 'occupied'),
  ('bed-c04', 'ward-icu-c', 'C-04', 'available'),
  ('bed-c05', 'ward-icu-c', 'C-05', 'available'),
  ('bed-c06', 'ward-icu-c', 'C-06', 'available'),
  ('bed-c07', 'ward-icu-c', 'C-07', 'available'),
  ('bed-c08', 'ward-icu-c', 'C-08', 'available'),
  ('bed-c09', 'ward-icu-c', 'C-09', 'maintenance'),
  ('bed-c10', 'ward-icu-c', 'C-10', 'available'),
  -- Cardiac ICU (6 beds)
  ('bed-d01', 'ward-icu-d', 'D-01', 'occupied'),
  ('bed-d02', 'ward-icu-d', 'D-02', 'occupied'),
  ('bed-d03', 'ward-icu-d', 'D-03', 'available'),
  ('bed-d04', 'ward-icu-d', 'D-04', 'available'),
  ('bed-d05', 'ward-icu-d', 'D-05', 'reserved'),
  ('bed-d06', 'ward-icu-d', 'D-06', 'available'),
  -- Neuro ICU (8 beds)
  ('bed-e01', 'ward-icu-e', 'E-01', 'occupied'),
  ('bed-e02', 'ward-icu-e', 'E-02', 'available'),
  ('bed-e03', 'ward-icu-e', 'E-03', 'available'),
  ('bed-e04', 'ward-icu-e', 'E-04', 'available'),
  ('bed-e05', 'ward-icu-e', 'E-05', 'available'),
  ('bed-e06', 'ward-icu-e', 'E-06', 'available'),
  ('bed-e07', 'ward-icu-e', 'E-07', 'available'),
  ('bed-e08', 'ward-icu-e', 'E-08', 'available')
ON CONFLICT (id) DO NOTHING;

-- ── Patients ───────────────────────────────────────────────
INSERT INTO patients (id, name, age, gender, bed_id, ward_id, admission_date, diagnosis, status, news2, ai_risk_score, attending_physician, primary_nurse) VALUES
  ('pt-001', 'Arjun Mehta',          67, 'M', 'bed-a01', 'ward-icu-a', '2026-04-22', 'Septic Shock',              'critical', 11, 88, 'Dr. Priya Sharma',  'Nurse Kavita Rao'),
  ('pt-002', 'Margaret O''Sullivan', 74, 'F', 'bed-a02', 'ward-icu-a', '2026-04-23', 'ARDS / COVID-19',           'critical', 10, 82, 'Dr. Priya Sharma',  'Nurse James Okafor'),
  ('pt-003', 'Ravi Krishnamurthy',   55, 'M', 'bed-a03', 'ward-icu-a', '2026-04-24', 'Acute MI — Post-PCI',      'warning',   7, 61, 'Dr. Vikram Nair',   'Nurse Kavita Rao'),
  ('pt-004', 'Elena Vasquez',        49, 'F', 'bed-b01', 'ward-icu-b', '2026-04-21', 'Traumatic Brain Injury',   'warning',   6, 55, 'Dr. Vikram Nair',   'Nurse Sarah Chen'),
  ('pt-005', 'Oluwaseun Adeyemi',    38, 'M', 'bed-b02', 'ward-icu-b', '2026-04-25', 'Diabetic Ketoacidosis',    'watch',     4, 38, 'Dr. Amara Diallo',  'Nurse James Okafor'),
  ('pt-006', 'Sunita Patel',         62, 'F', 'bed-b03', 'ward-icu-b', '2026-04-23', 'Pulmonary Embolism',       'watch',     5, 44, 'Dr. Amara Diallo',  'Nurse Sarah Chen'),
  ('pt-007', 'Thomas Andreessen',    71, 'M', 'bed-c01', 'ward-icu-c', '2026-04-20', 'CHF Exacerbation',         'stable',    3, 22, 'Dr. Priya Sharma',  'Nurse Kavita Rao'),
  ('pt-008', 'Fatima Al-Rashidi',    44, 'F', 'bed-c02', 'ward-icu-c', '2026-04-24', 'Post-Op Liver Resection',  'stable',    2, 18, 'Dr. Vikram Nair',   'Nurse James Okafor'),
  ('pt-009', 'Dmitri Volkov',        58, 'M', 'bed-c03', 'ward-icu-c', '2026-04-22', 'GI Bleed — Post-Endoscopy','stable',    2, 15, 'Dr. Amara Diallo',  'Nurse Sarah Chen'),
  ('pt-010', 'Ananya Krishnan',      29, 'F', 'bed-d01', 'ward-icu-d', '2026-04-25', 'Eclampsia — Post-Partum',  'warning',   8, 70, 'Dr. Priya Sharma',  'Nurse Kavita Rao'),
  ('pt-011', 'Carlos Mendoza',       65, 'M', 'bed-d02', 'ward-icu-d', '2026-04-24', 'STEMI — Post-Cath',        'watch',     5, 42, 'Dr. Amara Diallo',  'Nurse Sarah Chen'),
  ('pt-012', 'Yuki Tanaka',          52, 'F', 'bed-e01', 'ward-icu-e', '2026-04-23', 'Ischemic Stroke',          'warning',   7, 58, 'Dr. Vikram Nair',   'Nurse James Okafor')
ON CONFLICT (id) DO NOTHING;

-- ── Link patients to beds ──────────────────────────────────
UPDATE beds SET patient_id = 'pt-001' WHERE id = 'bed-a01';
UPDATE beds SET patient_id = 'pt-002' WHERE id = 'bed-a02';
UPDATE beds SET patient_id = 'pt-003' WHERE id = 'bed-a03';
UPDATE beds SET patient_id = 'pt-004' WHERE id = 'bed-b01';
UPDATE beds SET patient_id = 'pt-005' WHERE id = 'bed-b02';
UPDATE beds SET patient_id = 'pt-006' WHERE id = 'bed-b03';
UPDATE beds SET patient_id = 'pt-007' WHERE id = 'bed-c01';
UPDATE beds SET patient_id = 'pt-008' WHERE id = 'bed-c02';
UPDATE beds SET patient_id = 'pt-009' WHERE id = 'bed-c03';
UPDATE beds SET patient_id = 'pt-010' WHERE id = 'bed-d01';
UPDATE beds SET patient_id = 'pt-011' WHERE id = 'bed-d02';
UPDATE beds SET patient_id = 'pt-012' WHERE id = 'bed-e01';

-- ── Vitals Current ─────────────────────────────────────────
INSERT INTO vitals_current (patient_id, hr, spo2, sbp, dbp, temp, rr, map) VALUES
  ('pt-001', 118, 88,  82,  48, 38.9, 28, 59),
  ('pt-002', 104, 91,  95,  58, 38.4, 26, 70),
  ('pt-003',  92, 94, 108,  68, 37.2, 20, 81),
  ('pt-004',  78, 96, 148,  92, 37.6, 18,111),
  ('pt-005', 102, 97, 118,  72, 37.1, 22, 87),
  ('pt-006',  96, 95, 122,  76, 37.4, 21, 91),
  ('pt-007',  72, 97, 132,  82, 36.8, 16, 99),
  ('pt-008',  68, 98, 118,  74, 36.6, 14, 89),
  ('pt-009',  74, 98, 124,  78, 36.7, 15, 93),
  ('pt-010', 108, 93, 162, 104, 38.1, 24,123),
  ('pt-011',  88, 96, 128,  80, 37.0, 18, 96),
  ('pt-012',  84, 95, 138,  86, 37.3, 19,103)
ON CONFLICT (patient_id) DO UPDATE SET
  hr = EXCLUDED.hr, spo2 = EXCLUDED.spo2, sbp = EXCLUDED.sbp,
  dbp = EXCLUDED.dbp, temp = EXCLUDED.temp, rr = EXCLUDED.rr, map = EXCLUDED.map,
  updated_at = now();

-- ── Vitals History (24h trend per patient) ─────────────────
-- pt-001: Septic Shock (deteriorating trend)
INSERT INTO vitals_history (patient_id, recorded_at, hr, spo2, sbp, dbp, temp, rr, map) VALUES
  ('pt-001', now() - interval '23 hours', 88, 97, 110, 70, 37.2, 16, 83),
  ('pt-001', now() - interval '22 hours', 92, 96, 105, 68, 37.5, 17, 80),
  ('pt-001', now() - interval '21 hours', 96, 95,  98, 62, 37.8, 18, 74),
  ('pt-001', now() - interval '20 hours', 98, 94,  94, 60, 38.0, 19, 71),
  ('pt-001', now() - interval '19 hours', 101,93,  90, 56, 38.1, 20, 67),
  ('pt-001', now() - interval '18 hours', 104,92,  88, 54, 38.3, 22, 65),
  ('pt-001', now() - interval '17 hours', 106,91,  86, 52, 38.4, 23, 63),
  ('pt-001', now() - interval '16 hours', 108,90,  84, 50, 38.6, 24, 61),
  ('pt-001', now() - interval '15 hours', 110,90,  83, 50, 38.7, 25, 61),
  ('pt-001', now() - interval '14 hours', 112,89,  82, 49, 38.8, 26, 60),
  ('pt-001', now() - interval '13 hours', 113,89,  82, 49, 38.8, 26, 60),
  ('pt-001', now() - interval '12 hours', 114,88,  82, 48, 38.9, 27, 59),
  ('pt-001', now() - interval '11 hours', 115,88,  81, 48, 38.9, 27, 59),
  ('pt-001', now() - interval '10 hours', 116,88,  81, 48, 39.0, 27, 59),
  ('pt-001', now() - interval '9 hours',  116,87,  80, 47, 39.0, 28, 58),
  ('pt-001', now() - interval '8 hours',  117,87,  80, 47, 39.1, 28, 58),
  ('pt-001', now() - interval '7 hours',  117,88,  81, 48, 39.0, 28, 59),
  ('pt-001', now() - interval '6 hours',  118,88,  82, 48, 38.9, 28, 59),
  ('pt-001', now() - interval '5 hours',  119,87,  81, 47, 39.1, 29, 58),
  ('pt-001', now() - interval '4 hours',  120,87,  80, 47, 39.2, 29, 58),
  ('pt-001', now() - interval '3 hours',  119,88,  82, 48, 39.0, 28, 59),
  ('pt-001', now() - interval '2 hours',  118,88,  82, 48, 38.9, 28, 59),
  ('pt-001', now() - interval '1 hour',   118,88,  82, 48, 38.9, 28, 59),
  ('pt-001', now(),                        118,88,  82, 48, 38.9, 28, 59);

-- pt-002: ARDS (respiratory deterioration)
INSERT INTO vitals_history (patient_id, recorded_at, hr, spo2, sbp, dbp, temp, rr, map) VALUES
  ('pt-002', now() - interval '23 hours', 80, 97, 120, 78, 37.0, 14, 92),
  ('pt-002', now() - interval '22 hours', 82, 97, 118, 76, 37.2, 15, 90),
  ('pt-002', now() - interval '21 hours', 84, 96, 115, 74, 37.3, 16, 88),
  ('pt-002', now() - interval '20 hours', 86, 96, 112, 72, 37.5, 17, 85),
  ('pt-002', now() - interval '19 hours', 88, 95, 110, 70, 37.6, 18, 83),
  ('pt-002', now() - interval '18 hours', 90, 95, 108, 68, 37.7, 19, 81),
  ('pt-002', now() - interval '17 hours', 92, 94, 105, 66, 37.9, 20, 79),
  ('pt-002', now() - interval '16 hours', 94, 93, 102, 64, 38.0, 21, 77),
  ('pt-002', now() - interval '15 hours', 96, 93, 100, 62, 38.1, 22, 75),
  ('pt-002', now() - interval '14 hours', 98, 92,  98, 60, 38.2, 23, 73),
  ('pt-002', now() - interval '13 hours', 100,92,  96, 60, 38.3, 24, 72),
  ('pt-002', now() - interval '12 hours', 101,91,  95, 58, 38.4, 25, 70),
  ('pt-002', now() - interval '11 hours', 102,91,  95, 58, 38.4, 25, 70),
  ('pt-002', now() - interval '10 hours', 103,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '9 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '8 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '7 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '6 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '5 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '4 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '3 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '2 hours',  104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now() - interval '1 hour',   104,91,  95, 58, 38.4, 26, 70),
  ('pt-002', now(),                        104,91,  95, 58, 38.4, 26, 70);

-- pt-003 through pt-012: stable-ish trend data
INSERT INTO vitals_history (patient_id, recorded_at, hr, spo2, sbp, dbp, temp, rr, map)
SELECT
  p.id,
  now() - (s.i * interval '1 hour'),
  p.base_hr + (random() * 10 - 5)::int,
  LEAST(100, GREATEST(85, p.base_spo2 + (random() * 4 - 2)::int)),
  p.base_sbp + (random() * 20 - 10)::int,
  (p.base_sbp * 0.6 + random() * 8 - 4)::int,
  ROUND((p.base_temp + random() * 0.8 - 0.4)::numeric, 1),
  p.base_rr + (random() * 4 - 2)::int,
  ((p.base_sbp + random() * 20 - 10) * 0.4 + (p.base_sbp * 0.6) * 0.6)::int
FROM (VALUES
  ('pt-003',  92, 94, 108, 37.2, 20),
  ('pt-004',  78, 96, 148, 37.6, 18),
  ('pt-005', 102, 97, 118, 37.1, 22),
  ('pt-006',  96, 95, 122, 37.4, 21),
  ('pt-007',  72, 97, 132, 36.8, 16),
  ('pt-008',  68, 98, 118, 36.6, 14),
  ('pt-009',  74, 98, 124, 36.7, 15),
  ('pt-010', 108, 93, 162, 38.1, 24),
  ('pt-011',  88, 96, 128, 37.0, 18),
  ('pt-012',  84, 95, 138, 37.3, 19)
) AS p(id, base_hr, base_spo2, base_sbp, base_temp, base_rr)
CROSS JOIN generate_series(0, 23) AS s(i);

-- ── Alerts ─────────────────────────────────────────────────
INSERT INTO alerts (id, patient_id, ward_id, type, trigger_metric, trigger_value, normal_range, news2, severity, status, assigned_to, escalation_level, notes, ai_generated) VALUES
  ('alert-001','pt-001','ward-icu-a','Hemodynamic Instability','MAP',   '59 mmHg',      '70–100 mmHg', 11,'critical',    'active',       'Dr. Priya Sharma',  3, 'AI: 88% probability of septic shock deterioration within 2h. Norepinephrine dose adjustment recommended.', true),
  ('alert-002','pt-001','ward-icu-a','Hypoxemia',              'SpO2',  '88%',           '≥94%',        11,'critical',    'acknowledged', 'Nurse Kavita Rao',  2, 'FiO2 increased to 0.8. ABG ordered.',                                                                   false),
  ('alert-003','pt-002','ward-icu-a','Respiratory Deterioration','RR',  '26 /min',       '12–20 /min',  10,'critical',    'escalated',    'Dr. Priya Sharma',  3, 'SBAR: RR 26, SpO2 91% on CPAP 10cmH2O. Assessment — CPAP failure likely. Recommend intubation.',         true),
  ('alert-004','pt-003','ward-icu-a','Cardiac Arrhythmia',     'HR',   '92 bpm (irreg)','60–100 bpm',   7,'high',        'active',       'Dr. Vikram Nair',   1, 'New AF detected post-PCI. Rate control initiated.',                                                      true),
  ('alert-005','pt-004','ward-icu-b','Hypertensive Crisis',    'SBP',  '148 mmHg',      '90–140 mmHg',  6,'high',        'acknowledged', 'Dr. Vikram Nair',   1, 'Labetalol 10mg IV given. Repeat BP in 15 min.',                                                          false),
  ('alert-006','pt-005','ward-icu-b','Tachycardia',            'HR',   '102 bpm',       '60–100 bpm',   4,'moderate',    'active',       'Nurse James Okafor',1, '',                                                                                                       false),
  ('alert-007','pt-006','ward-icu-b','Hypoxemia',              'SpO2', '95%',           '≥96%',         5,'moderate',    'resolved',     'Nurse Sarah Chen',  0, 'O2 therapy increased. Resolved.',                                                                        false),
  ('alert-008','pt-010','ward-icu-d','Hypertensive Emergency', 'MAP',  '123 mmHg',      '70–100 mmHg',  8,'high',        'active',       'Dr. Priya Sharma',  2, 'AI: Eclampsia recurrence risk 70% within 4h. MgSO4 protocol review recommended.',                        true),
  ('alert-009','pt-010','ward-icu-d','Tachypnea',              'RR',   '24 /min',       '12–20 /min',   8,'moderate',    'active',       'Nurse Kavita Rao',  1, '',                                                                                                       false),
  ('alert-010','pt-007','ward-icu-c','Fluid Overload Risk',    'HR',   '72 bpm (trend)','60–80 bpm',    3,'low',         'resolved',     'Nurse Kavita Rao',  0, 'Diuretic dose adjusted. Resolved.',                                                                      true),
  ('alert-011','pt-008','ward-icu-c','Temp Spike',             'Temp', '38.2°C',        '36.1–37.2°C',  2,'low',         'acknowledged', 'Nurse James Okafor',0, 'Blood cultures drawn. Antipyretics given.',                                                               false),
  ('alert-012','pt-012','ward-icu-e','Neurological Decline',   'HR',   '84 bpm (trend)','60–100 bpm',   7,'high',        'active',       'Dr. Vikram Nair',   2, 'AI: GCS trending downward. CT head recommended.',                                                         true)
ON CONFLICT (id) DO NOTHING;
