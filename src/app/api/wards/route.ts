import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        w.id, w.hospital_id, w.name, w.total_beds,
        h.name as hospital_name,
        (SELECT COUNT(*) FROM patients p WHERE p.ward_id = w.id) as occupied_beds,
        (SELECT COUNT(*) FROM patients p WHERE p.ward_id = w.id AND p.status IN ('critical', 'code')) as critical_patients
      FROM wards w
      JOIN hospitals h ON w.hospital_id = h.id
    `;
    const [rows]: any = await pool.query(query);

    const wards = rows.map((row: any) => ({
      id: row.id,
      hospitalId: row.hospital_id,
      hospitalName: row.hospital_name,
      name: row.name,
      totalBeds: row.total_beds,
      occupiedBeds: row.occupied_beds,
      criticalPatients: row.critical_patients
    }));

    return NextResponse.json({ wards });
  } catch (error: any) {
    console.error('Error fetching wards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
