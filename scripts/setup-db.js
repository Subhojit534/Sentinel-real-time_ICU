const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('Connecting to MySQL...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`User: ${process.env.DB_USER}`);
  
  if (!process.env.DB_PASSWORD) {
    console.warn('\n⚠️ WARNING: DB_PASSWORD in .env is empty. If you have a password, this will fail!\n');
  }

  try {
    // Connect without database first to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Allow executing entire files
    });

    console.log('Connected successfully!');

    // Read and execute schema
    console.log('\nExecuting schema.sql...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('Schema executed successfully.');

    // Read and execute seed
    console.log('\nExecuting seed.sql...');
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('Seed executed successfully.');

    // Generate 24h vitals history for 10 patients
    console.log('\nGenerating 24-hour vitals history...');
    await connection.query('USE sentinel_icu;');
    
    const [patients] = await connection.query('SELECT id FROM patients');
    
    for (const pt of patients) {
      let baseHr = 80 + Math.random() * 30;
      let baseSpo2 = 94 + Math.random() * 5;
      let baseSbp = 110 + Math.random() * 30;
      
      const vitalsHistory = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const recordedAt = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        const hr = Math.round(baseHr + (Math.random() - 0.5) * 18);
        const spo2 = Math.round(Math.max(85, Math.min(100, baseSpo2 + (Math.random() - 0.5) * 4)));
        const sbp = Math.round(baseSbp + (Math.random() - 0.5) * 20);
        const dbp = Math.round(sbp * 0.6 + (Math.random() - 0.5) * 8);
        const temp = parseFloat((36.5 + (Math.random() - 0.4) * 1.8).toFixed(1));
        const rr = Math.round(14 + (Math.random() - 0.5) * 8);
        const map = Math.round((sbp + 2 * dbp) / 3);
        
        vitalsHistory.push([
          pt.id,
          recordedAt,
          hr, spo2, sbp, dbp, temp, rr, map
        ]);
      }
      
      await connection.query(
        'INSERT INTO vitals_history (patient_id, recorded_at, hr, spo2, sbp, dbp, temp, rr, map) VALUES ?',
        [vitalsHistory]
      );
    }
    console.log('Vitals history generated successfully.');

    await connection.end();
    console.log('\n✅ Database setup complete!');

  } catch (error) {
    console.error('\n❌ ERROR setting up database:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n👉 Action Required: Open .env and set your correct MySQL DB_PASSWORD.');
    }
    process.exit(1);
  }
}

setupDatabase();
