import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '24'; // hours
    const rangeHours = parseInt(rangeParam);

    // Fetch vitals history for the given patient, ordered by time
    const query = `
      SELECT recorded_at as time, hr, spo2, sbp, dbp, temp, rr, map
      FROM vitals_history
      WHERE patient_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY recorded_at ASC
    `;
    
    const [rows]: any = await pool.query(query, [id, rangeHours]);

    const trend = rows.map((row: any) => ({
      time: new Date(row.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      hr: row.hr,
      spo2: row.spo2,
      sbp: row.sbp,
      dbp: row.dbp,
      temp: parseFloat(row.temp),
      rr: row.rr,
      map: row.map
    }));

    return NextResponse.json({ trend });
  } catch (error: any) {
    console.error('Error fetching vitals history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
