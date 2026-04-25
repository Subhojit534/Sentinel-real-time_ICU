import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    let query = `
      SELECT a.*, p.name as patient_name, w.name as ward_name, p.bed_id 
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      JOIN wards w ON a.ward_id = w.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (wardId && wardId !== 'all') {
      query += ` AND a.ward_id = ?`;
      params.push(wardId);
    }
    
    if (status && status !== 'all') {
      // Allow multiple statuses separated by comma (e.g. active,escalated)
      const statuses = status.split(',');
      query += ` AND a.status IN (?)`;
      params.push(statuses);
    }

    if (severity && severity !== 'all') {
      query += ` AND a.severity = ?`;
      params.push(severity);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [rows]: any = await pool.query(query, params);

    const alerts = rows.map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      bedId: row.bed_id,
      wardId: row.ward_id,
      wardName: row.ward_name,
      type: row.type,
      triggerMetric: row.trigger_metric,
      triggerValue: row.trigger_value,
      normalRange: row.normal_range,
      news2: row.news2,
      severity: row.severity,
      status: row.status,
      createdAt: row.created_at,
      acknowledgedAt: row.acknowledged_at,
      resolvedAt: row.resolved_at,
      assignedTo: row.assigned_to,
      escalationLevel: row.escalation_level,
      notes: row.notes,
      aiGenerated: !!row.ai_generated
    }));

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
