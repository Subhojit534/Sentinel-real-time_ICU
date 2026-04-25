-- Supabase Schema for Sentinel ICU Monitoring System

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Wards
CREATE TABLE IF NOT EXISTS wards (
    id TEXT PRIMARY KEY,
    hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_beds INTEGER NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin')),
    hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
    ward_id TEXT REFERENCES wards(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    password TEXT,
    license_number TEXT
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F', 'Other')),
    bed_id TEXT NOT NULL,
    ward_id TEXT REFERENCES wards(id) ON DELETE CASCADE,
    admission_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('stable', 'watch', 'warning', 'critical', 'code')),
    news2 INTEGER NOT NULL,
    ai_risk_score INTEGER NOT NULL,
    attending_physician TEXT NOT NULL,
    primary_nurse TEXT NOT NULL
);

-- Vitals Current
CREATE TABLE IF NOT EXISTS vitals_current (
    patient_id TEXT PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
    hr INTEGER NOT NULL,
    spo2 INTEGER NOT NULL,
    sbp INTEGER NOT NULL,
    dbp INTEGER NOT NULL,
    temp NUMERIC(4,1) NOT NULL,
    rr INTEGER NOT NULL,
    map INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Vitals History (Trends)
CREATE TABLE IF NOT EXISTS vitals_history (
    id SERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hr INTEGER NOT NULL,
    spo2 INTEGER NOT NULL,
    sbp INTEGER NOT NULL,
    dbp INTEGER NOT NULL,
    temp NUMERIC(4,1) NOT NULL,
    rr INTEGER NOT NULL,
    map INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vitals_history_patient_time ON vitals_history (patient_id, recorded_at);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    ward_id TEXT NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    trigger_metric TEXT NOT NULL,
    trigger_value TEXT NOT NULL,
    normal_range TEXT NOT NULL,
    news2 INTEGER NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
    status TEXT NOT NULL CHECK (status IN ('active', 'acknowledged', 'escalated', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    assigned_to TEXT NOT NULL,
    escalation_level INTEGER NOT NULL,
    notes TEXT,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE
);

-- Beds
CREATE TABLE IF NOT EXISTS beds (
    id TEXT PRIMARY KEY,
    ward_id TEXT NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('occupied', 'available', 'maintenance', 'reserved')) DEFAULT 'available',
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL
);

-- Setup Realtime publications
-- Setup Realtime publications (can be done via Supabase Dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE patients;
-- ALTER PUBLICATION supabase_realtime ADD TABLE vitals_current;
-- ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE beds;

-- Grant API access to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
