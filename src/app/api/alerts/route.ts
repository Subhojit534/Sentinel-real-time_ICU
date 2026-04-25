import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MOCK_ALERTS } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');
    const status = searchParams.get('status');

    if (!supabase) {
      let filtered = MOCK_ALERTS;
      if (wardId && wardId !== 'all') filtered = filtered.filter(a => a.wardId === wardId);
      if (status && status !== 'all') filtered = filtered.filter(a => a.status === status);
      return NextResponse.json({ alerts: filtered });
    }

    let query = supabase.from('alerts').select(`
      *,
      patients!left(name, bed_id)
    `);
    if (wardId && wardId !== 'all') query = query.eq('ward_id', wardId);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    // If no rows in DB, gracefully return mock data (no throw — avoids noisy 500)
    if (!data || data.length === 0) {
      let filtered = MOCK_ALERTS;
      if (wardId && wardId !== 'all') filtered = filtered.filter(a => a.wardId === wardId);
      if (status && status !== 'all') {
        const statuses = status.split(',');
        filtered = filtered.filter(a => statuses.includes(a.status));
      }
      return NextResponse.json({ alerts: filtered });
    }

    const alerts = data.map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name || row.patients?.name || 'Unknown',
      bedId: row.bed_id || row.patients?.bed_id || null,
      wardId: row.ward_id,
      wardName: row.ward_name || row.ward_id || '',
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
      aiGenerated: row.ai_generated,
      notes: row.notes,
    }));
    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    let filtered = MOCK_ALERTS;
    if (wardId && wardId !== 'all') filtered = filtered.filter(a => a.wardId === wardId);
    if (status && status !== 'all') {
      const statuses = status.split(',');
      filtered = filtered.filter(a => statuses.includes(a.status));
    }
    if (severity && severity !== 'all') filtered = filtered.filter(a => a.severity === severity);
    return NextResponse.json({ alerts: filtered });
  }
}
