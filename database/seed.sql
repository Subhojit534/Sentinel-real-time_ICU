USE sentinel_icu;

-- Hospitals
INSERT IGNORE INTO hospitals (id, name) VALUES 
('hosp-1', 'City General Hospital'),
('hosp-2', 'Metro Health Center');

-- Wards
INSERT IGNORE INTO wards (id, hospital_id, name, total_beds) VALUES 
('ward-icu-a', 'hosp-1', 'ICU Alpha', 8),
('ward-icu-b', 'hosp-1', 'ICU Beta', 8),
('ward-icu-c', 'hosp-1', 'ICU Gamma', 10),
('ward-icu-d', 'hosp-2', 'Cardiac ICU', 6),
('ward-icu-e', 'hosp-2', 'Neuro ICU', 8);

-- Users
INSERT IGNORE INTO users (id, name, role, hospital_id, ward_id, email) VALUES 
('user-001', 'Dr. Priya Sharma', 'doctor', 'hosp-1', 'ward-icu-a', 'priya.sharma@sentinel.icu'),
('user-002', 'Dr. Vikram Nair', 'doctor', 'hosp-1', 'ward-icu-b', 'vikram.nair@sentinel.icu'),
('user-003', 'Nurse Kavita Rao', 'nurse', 'hosp-1', 'ward-icu-a', 'kavita.rao@sentinel.icu'),
('user-004', 'Nurse James Okafor', 'nurse', 'hosp-1', 'ward-icu-b', 'james.okafor@sentinel.icu'),
('user-005', 'Admin Sys', 'admin', 'hosp-1', 'ward-icu-a', 'admin@sentinel.icu');

-- Patients
INSERT IGNORE INTO patients (id, name, age, gender, bed_id, ward_id, admission_date, diagnosis, status, news2, ai_risk_score, attending_physician, primary_nurse) VALUES 
('pt-001', 'Arjun Mehta', 67, 'M', 'bed-a01', 'ward-icu-a', '2026-04-22', 'Septic Shock', 'critical', 11, 88, 'Dr. Priya Sharma', 'Nurse Kavita Rao'),
('pt-002', 'Margaret O''Sullivan', 74, 'F', 'bed-a02', 'ward-icu-a', '2026-04-23', 'ARDS / COVID-19', 'critical', 10, 82, 'Dr. Priya Sharma', 'Nurse James Okafor'),
('pt-003', 'Ravi Krishnamurthy', 55, 'M', 'bed-a03', 'ward-icu-a', '2026-04-24', 'Acute MI — Post-PCI', 'warning', 7, 61, 'Dr. Vikram Nair', 'Nurse Kavita Rao'),
('pt-004', 'Elena Vasquez', 49, 'F', 'bed-b01', 'ward-icu-b', '2026-04-21', 'Traumatic Brain Injury', 'warning', 6, 55, 'Dr. Vikram Nair', 'Nurse Sarah Chen'),
('pt-005', 'Oluwaseun Adeyemi', 38, 'M', 'bed-b02', 'ward-icu-b', '2026-04-25', 'Diabetic Ketoacidosis', 'watch', 4, 38, 'Dr. Amara Diallo', 'Nurse James Okafor'),
('pt-006', 'Sunita Patel', 62, 'F', 'bed-b03', 'ward-icu-b', '2026-04-23', 'Pulmonary Embolism', 'watch', 5, 44, 'Dr. Amara Diallo', 'Nurse Sarah Chen'),
('pt-007', 'Thomas Andreessen', 71, 'M', 'bed-c01', 'ward-icu-c', '2026-04-20', 'CHF Exacerbation', 'stable', 3, 22, 'Dr. Priya Sharma', 'Nurse Kavita Rao'),
('pt-008', 'Fatima Al-Rashidi', 44, 'F', 'bed-c02', 'ward-icu-c', '2026-04-24', 'Post-Op Liver Resection', 'stable', 2, 18, 'Dr. Vikram Nair', 'Nurse James Okafor'),
('pt-009', 'Dmitri Volkov', 58, 'M', 'bed-c03', 'ward-icu-c', '2026-04-22', 'GI Bleed — Post-Endoscopy', 'stable', 2, 15, 'Dr. Amara Diallo', 'Nurse Sarah Chen'),
('pt-010', 'Ananya Krishnan', 29, 'F', 'bed-d01', 'ward-icu-d', '2026-04-25', 'Eclampsia — Post-Partum', 'warning', 8, 70, 'Dr. Priya Sharma', 'Nurse Kavita Rao');

-- Vitals Current
INSERT IGNORE INTO vitals_current (patient_id, hr, spo2, sbp, dbp, temp, rr, map) VALUES 
('pt-001', 118, 88, 82, 48, 38.9, 28, 59),
('pt-002', 104, 91, 95, 58, 38.4, 26, 70),
('pt-003', 92, 94, 108, 68, 37.2, 20, 81),
('pt-004', 78, 96, 148, 92, 37.6, 18, 111),
('pt-005', 102, 97, 118, 72, 37.1, 22, 87),
('pt-006', 96, 95, 122, 76, 37.4, 21, 91),
('pt-007', 72, 97, 132, 82, 36.8, 16, 99),
('pt-008', 68, 98, 118, 74, 36.6, 14, 89),
('pt-009', 74, 98, 124, 78, 36.7, 15, 93),
('pt-010', 108, 93, 162, 104, 38.1, 24, 123);

-- Alerts
INSERT IGNORE INTO alerts (id, patient_id, ward_id, type, trigger_metric, trigger_value, normal_range, news2, severity, status, created_at, acknowledged_at, resolved_at, assigned_to, escalation_level, notes, ai_generated) VALUES 
('alert-001', 'pt-001', 'ward-icu-a', 'Hemodynamic Instability', 'MAP', '59 mmHg', '70–100 mmHg', 11, 'critical', 'active', '2026-04-25 05:10:00', NULL, NULL, 'Dr. Priya Sharma', 3, 'AI prediction: 88% probability of septic shock deterioration within 2h. Norepinephrine dose adjustment recommended.', 1),
('alert-002', 'pt-001', 'ward-icu-a', 'Hypoxemia', 'SpO2', '88%', '≥94%', 11, 'critical', 'acknowledged', '2026-04-25 04:48:00', '2026-04-25 04:52:00', NULL, 'Nurse Kavita Rao', 2, 'FiO2 increased to 0.8. ABG ordered.', 0),
('alert-003', 'pt-002', 'ward-icu-a', 'Respiratory Deterioration', 'RR', '26 /min', '12–20 /min', 10, 'critical', 'escalated', '2026-04-25 05:22:00', NULL, NULL, 'Dr. Priya Sharma', 3, 'SBAR: Situation — RR 26, SpO2 91% on CPAP 10cmH2O. Background — ARDS Day 3. Assessment — CPAP failure likely. Recommendation — Consider intubation.', 1),
('alert-004', 'pt-003', 'ward-icu-a', 'Cardiac Arrhythmia', 'HR', '92 bpm (irregular)', '60–100 bpm regular', 7, 'high', 'active', '2026-04-25 05:15:00', NULL, NULL, 'Dr. Vikram Nair', 1, 'New AF detected post-PCI. Rate control initiated.', 1),
('alert-005', 'pt-004', 'ward-icu-b', 'Hypertensive Crisis', 'SBP', '148 mmHg', '90–140 mmHg', 6, 'high', 'acknowledged', '2026-04-25 04:30:00', '2026-04-25 04:35:00', NULL, 'Dr. Vikram Nair', 1, 'Labetalol 10mg IV given. Repeat BP in 15 min.', 0),
('alert-006', 'pt-005', 'ward-icu-b', 'Tachycardia', 'HR', '102 bpm', '60–100 bpm', 4, 'moderate', 'active', '2026-04-25 05:28:00', NULL, NULL, 'Nurse James Okafor', 1, '', 0),
('alert-007', 'pt-006', 'ward-icu-b', 'Hypoxemia', 'SpO2', '95%', '≥96%', 5, 'moderate', 'resolved', '2026-04-25 03:10:00', '2026-04-25 03:14:00', '2026-04-25 04:00:00', 'Nurse Sarah Chen', 0, 'O2 therapy increased. Resolved.', 0),
('alert-008', 'pt-010', 'ward-icu-d', 'Hypertensive Emergency', 'MAP', '123 mmHg', '70–100 mmHg', 8, 'high', 'active', '2026-04-25 05:30:00', NULL, NULL, 'Dr. Priya Sharma', 2, 'AI: Eclampsia recurrence risk 70% within 4h. MgSO4 protocol review recommended.', 1),
('alert-009', 'pt-010', 'ward-icu-d', 'Tachypnea', 'RR', '24 /min', '12–20 /min', 8, 'moderate', 'active', '2026-04-25 05:31:00', NULL, NULL, 'Nurse Kavita Rao', 1, '', 0),
('alert-010', 'pt-007', 'ward-icu-c', 'Fluid Overload Risk', 'HR', '72 bpm (trending up)', '60–80 bpm', 3, 'low', 'resolved', '2026-04-25 02:00:00', '2026-04-25 02:05:00', '2026-04-25 03:30:00', 'Nurse Kavita Rao', 0, 'Diuretic dose adjusted. Resolved.', 1),
('alert-011', 'pt-008', 'ward-icu-c', 'Temp Spike', 'Temp', '38.2°C', '36.1–37.2°C', 2, 'low', 'acknowledged', '2026-04-25 04:15:00', '2026-04-25 04:20:00', NULL, 'Nurse James Okafor', 0, 'Blood cultures drawn. Antipyretics given.', 0);

-- Note: vitals_history generates 240 records, we can seed them via a script later or you can use the dummy data generation script I will write.
