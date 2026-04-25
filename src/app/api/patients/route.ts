import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');
    const status = searchParams.get('status');

    let query = `
      SELECT p.*, 
             vc.hr, vc.spo2, vc.sbp, vc.dbp, vc.temp, vc.rr, vc.map, vc.updated_at
      FROM patients p
      LEFT JOIN vitals_current vc ON p.id = vc.patient_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (wardId && wardId !== 'all') {
      query += ` AND p.ward_id = ?`;
      params.push(wardId);
    }
    
    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    const [rows]: any = await pool.query(query, params);

    const patients = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      bedId: row.bed_id,
      wardId: row.ward_id,
      admissionDate: row.admission_date,
      diagnosis: row.diagnosis,
      status: row.status,
      news2: row.news2,
      aiRiskScore: row.ai_risk_score,
      attendingPhysician: row.attending_physician,
      primaryNurse: row.primary_nurse,
      vitals: {
        hr: row.hr,
        spo2: row.spo2,
        sbp: row.sbp,
        dbp: row.dbp,
        temp: row.temp,
        rr: row.rr,
        map: row.map,
        updatedAt: row.updated_at
      }
    }));

    return NextResponse.json({ patients });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
