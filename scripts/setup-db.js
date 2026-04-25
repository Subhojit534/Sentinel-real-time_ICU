const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('Connecting to PostgreSQL...');
  
  if (!process.env.DB_PASSWORD) {
    console.warn('\n⚠️ WARNING: DB_PASSWORD in .env is empty. If you have a password, this will fail!\n');
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    // Read and execute schema
    console.log('\nExecuting supabase_schema.sql...');
    const schemaPath = path.join(__dirname, '../database/supabase_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Schema executed successfully.');

    // Seed some mock data if needed
    console.log('\nChecking for mock data to insert...');
    // We can run insert statements here if we want, but since Supabase acts as our PostgreSQL DB,
    // the application will gracefully fall back to mock data until the DB has data.
    
    // As a simple seed, we can insert the hospitals and wards if they don't exist
    await client.query(`
      INSERT INTO hospitals (id, name) VALUES ('hosp-1', 'Metro Health Center') ON CONFLICT (id) DO NOTHING;
      INSERT INTO hospitals (id, name) VALUES ('hosp-2', 'City General') ON CONFLICT (id) DO NOTHING;
      
      INSERT INTO wards (id, hospital_id, name, total_beds) VALUES ('ward-icu-a', 'hosp-1', 'ICU Alpha', 8) ON CONFLICT (id) DO NOTHING;
      INSERT INTO wards (id, hospital_id, name, total_beds) VALUES ('ward-icu-b', 'hosp-1', 'ICU Beta', 8) ON CONFLICT (id) DO NOTHING;
      INSERT INTO wards (id, hospital_id, name, total_beds) VALUES ('ward-icu-c', 'hosp-1', 'ICU Gamma', 10) ON CONFLICT (id) DO NOTHING;
      INSERT INTO wards (id, hospital_id, name, total_beds) VALUES ('ward-icu-d', 'hosp-2', 'Cardiac ICU', 6) ON CONFLICT (id) DO NOTHING;
      INSERT INTO wards (id, hospital_id, name, total_beds) VALUES ('ward-icu-e', 'hosp-2', 'Neuro ICU', 8) ON CONFLICT (id) DO NOTHING;

      -- Beds
      INSERT INTO beds (id, ward_id, number, status) VALUES ('bed-a01', 'ward-icu-a', 'A-01', 'occupied') ON CONFLICT (id) DO NOTHING;
      INSERT INTO beds (id, ward_id, number, status) VALUES ('bed-a02', 'ward-icu-a', 'A-02', 'occupied') ON CONFLICT (id) DO NOTHING;
      INSERT INTO beds (id, ward_id, number, status) VALUES ('bed-a03', 'ward-icu-a', 'A-03', 'occupied') ON CONFLICT (id) DO NOTHING;

      -- Patients
      INSERT INTO patients (id, name, age, gender, bed_id, ward_id, admission_date, diagnosis, status, news2, ai_risk_score, attending_physician, primary_nurse) 
      VALUES ('pt-001', 'Arjun Mehta', 67, 'M', 'bed-a01', 'ward-icu-a', '2026-04-22', 'Septic Shock', 'critical', 11, 88, 'Dr. Priya Sharma', 'Nurse Kavita Rao') ON CONFLICT (id) DO NOTHING;
      
      INSERT INTO patients (id, name, age, gender, bed_id, ward_id, admission_date, diagnosis, status, news2, ai_risk_score, attending_physician, primary_nurse) 
      VALUES ('pt-002', 'Margaret O''Sullivan', 74, 'F', 'bed-a02', 'ward-icu-a', '2026-04-23', 'ARDS / COVID-19', 'critical', 10, 82, 'Dr. Priya Sharma', 'Nurse James Okafor') ON CONFLICT (id) DO NOTHING;

      INSERT INTO patients (id, name, age, gender, bed_id, ward_id, admission_date, diagnosis, status, news2, ai_risk_score, attending_physician, primary_nurse) 
      VALUES ('pt-003', 'Ravi Krishnamurthy', 55, 'M', 'bed-a03', 'ward-icu-a', '2026-04-24', 'Acute MI — Post-PCI', 'warning', 7, 61, 'Dr. Vikram Nair', 'Nurse Kavita Rao') ON CONFLICT (id) DO NOTHING;

      -- Link patients to beds
      UPDATE beds SET patient_id = 'pt-001' WHERE id = 'bed-a01';
      UPDATE beds SET patient_id = 'pt-002' WHERE id = 'bed-a02';
      UPDATE beds SET patient_id = 'pt-003' WHERE id = 'bed-a03';

      -- Vitals Current
      INSERT INTO vitals_current (patient_id, hr, spo2, sbp, dbp, temp, rr, map) 
      VALUES ('pt-001', 118, 88, 82, 48, 38.9, 28, 59) ON CONFLICT (patient_id) DO NOTHING;
      
      INSERT INTO vitals_current (patient_id, hr, spo2, sbp, dbp, temp, rr, map) 
      VALUES ('pt-002', 104, 91, 95, 58, 38.4, 26, 70) ON CONFLICT (patient_id) DO NOTHING;

      INSERT INTO vitals_current (patient_id, hr, spo2, sbp, dbp, temp, rr, map) 
      VALUES ('pt-003', 92, 94, 108, 68, 37.2, 20, 81) ON CONFLICT (patient_id) DO NOTHING;

      -- Alerts
      INSERT INTO alerts (id, patient_id, ward_id, type, trigger_metric, trigger_value, normal_range, news2, severity, status, assigned_to, escalation_level, notes, ai_generated) 
      VALUES ('alert-001', 'pt-001', 'ward-icu-a', 'Hemodynamic Instability', 'MAP', '59 mmHg', '70–100 mmHg', 11, 'critical', 'active', 'Dr. Priya Sharma', 3, 'AI prediction: 88% probability of septic shock deterioration within 2h.', true) ON CONFLICT (id) DO NOTHING;

      INSERT INTO alerts (id, patient_id, ward_id, type, trigger_metric, trigger_value, normal_range, news2, severity, status, assigned_to, escalation_level, notes, ai_generated) 
      VALUES ('alert-002', 'pt-002', 'ward-icu-a', 'Respiratory Deterioration', 'RR', '26 /min', '12–20 /min', 10, 'critical', 'escalated', 'Dr. Priya Sharma', 3, 'SBAR: Situation — RR 26, SpO2 91% on CPAP 10cmH2O. Assessment — CPAP failure likely.', true) ON CONFLICT (id) DO NOTHING;
    `);

    // Generate 24h vitals history for 3 patients
    console.log('Generating 24-hour vitals history...');
    
    const patients = [
      { id: 'pt-001', baseHr: 110, baseSpo2: 87, baseSbp: 82 },
      { id: 'pt-002', baseHr: 100, baseSpo2: 91, baseSbp: 95 },
      { id: 'pt-003', baseHr: 88, baseSpo2: 94, baseSbp: 108 }
    ];
    
    for (const pt of patients) {
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        const recordedAt = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        const hr = Math.round(pt.baseHr + (Math.random() - 0.5) * 18);
        const spo2 = Math.round(Math.max(85, Math.min(100, pt.baseSpo2 + (Math.random() - 0.5) * 4)));
        const sbp = Math.round(pt.baseSbp + (Math.random() - 0.5) * 20);
        const dbp = Math.round(sbp * 0.6 + (Math.random() - 0.5) * 8);
        const temp = parseFloat((36.5 + (Math.random() - 0.4) * 1.8).toFixed(1));
        const rr = Math.round(14 + (Math.random() - 0.5) * 8);
        const map = Math.round((sbp + 2 * dbp) / 3);
        
        // We use INSERT since vitals_history uses a serial ID
        await client.query(
          'INSERT INTO vitals_history (patient_id, recorded_at, hr, spo2, sbp, dbp, temp, rr, map) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [pt.id, recordedAt.toISOString(), hr, spo2, sbp, dbp, temp, rr, map]
        );
      }
    }

    console.log('Basic seed data executed successfully.');

    await client.end();
    console.log('\n✅ Database setup complete!');

  } catch (error) {
    console.error('\n❌ ERROR setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
