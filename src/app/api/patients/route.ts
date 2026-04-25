import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MOCK_PATIENTS, MOCK_ALERTS, MOCK_WARDS } from '@/lib/mockData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');
    const status = searchParams.get('status');

    if (!supabase) {
      console.warn('Supabase not configured, returning mock patients');
      let filtered = MOCK_PATIENTS;
      if (wardId && wardId !== 'all') {
        filtered = filtered.filter(p => p.wardId === wardId);
      }
      if (status && status !== 'all') {
        filtered = filtered.filter(p => p.status === status);
      }
      return NextResponse.json({ patients: filtered });
    }

    // Use left join so patients without vitals_current still appear
    let query = supabase.from('patients').select(`
      *,
      vitals_current!left(*)
    `);

    if (wardId && wardId !== 'all') {
      query = query.eq('ward_id', wardId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      // Supabase has no patient rows yet — silently return mock data
      let filtered = MOCK_PATIENTS;
      if (wardId && wardId !== 'all') filtered = filtered.filter(p => p.wardId === wardId);
      if (status && status !== 'all') filtered = filtered.filter(p => p.status === status);
      return NextResponse.json({ patients: filtered });
    }

    const patients = data.map((row: any) => {
      // vitals_current comes back as an object (one-to-one) or null
      const vc = Array.isArray(row.vitals_current)
        ? row.vitals_current[0]
        : row.vitals_current;

      // Generate a 24-point trend from current vitals for chart rendering
      const now = Date.now();
      const trend = vc ? Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (23 - i) * 3600000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        hr:   Math.round(vc.hr   + (Math.random() - 0.5) * 14),
        spo2: Math.min(100, Math.max(85, Math.round(vc.spo2 + (Math.random() - 0.5) * 4))),
        sbp:  Math.round(vc.sbp  + (Math.random() - 0.5) * 18),
        dbp:  Math.round(vc.dbp  + (Math.random() - 0.5) * 10),
        temp: parseFloat((vc.temp + (Math.random() - 0.4) * 0.8).toFixed(1)),
        rr:   Math.round(vc.rr   + (Math.random() - 0.5) * 6),
        map:  Math.round(vc.map  + (Math.random() - 0.5) * 10),
      })) : [];

      return {
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
        vitals: vc || null,
        trend,
      };
    });

    return NextResponse.json({ patients });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    // Fallback to mock data if fetch fails (e.g., Supabase unreachable)
    console.warn('Supabase fetch failed, returning mock patients');
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');
    const status = searchParams.get('status');
    let filtered = MOCK_PATIENTS;
    if (wardId && wardId !== 'all') filtered = filtered.filter(p => p.wardId === wardId);
    if (status && status !== 'all') filtered = filtered.filter(p => p.status === status);
    return NextResponse.json({ patients: filtered });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, gender, bedId, wardId, diagnosis, status, attendingPhysician, primaryNurse } = body;

    if (!supabase) {
      return NextResponse.json({ success: true, patientId: `pat-${crypto.randomUUID().slice(0, 8)}` });
    }

    const patientId = `pt-${crypto.randomUUID().slice(0, 8)}`;

    // Insert patient
    const { error: patErr } = await supabase.from('patients').insert({
      id: patientId,
      name,
      age: age || 40,
      gender: gender || 'M',
      bed_id: bedId,
      ward_id: wardId,
      admission_date: new Date().toISOString().split('T')[0],
      diagnosis,
      status: status || 'stable',
      news2: 0,
      ai_risk_score: 0,
      attending_physician: attendingPhysician || 'Dr. Priya Sharma',
      primary_nurse: primaryNurse || 'Nurse Kavita Rao',
    });
    if (patErr) throw patErr;

    // Insert default vitals
    await supabase.from('vitals_current').insert({
      patient_id: patientId,
      hr: 80, spo2: 97, sbp: 120, dbp: 78, temp: 36.8, rr: 16, map: 92,
    });

    // Mark bed as occupied
    await supabase.from('beds').update({ status: 'occupied', patient_id: patientId }).eq('id', bedId);

    return NextResponse.json({ success: true, patientId });
  } catch (error: any) {
    console.error('Error allocating patient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
