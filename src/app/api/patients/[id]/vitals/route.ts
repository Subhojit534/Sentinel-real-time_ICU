import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MOCK_PATIENTS } from '@/lib/mockData';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!supabase) {
      // Return a mocked trend for the demo
      const now = Date.now();
      const mockTrend = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now - (23 - i) * 3600000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        hr: 80 + Math.random() * 20,
        spo2: 95 + Math.random() * 4,
        sbp: 120 + Math.random() * 10,
        dbp: 80 + Math.random() * 10,
        temp: 36.5 + Math.random() * 1,
        rr: 16 + Math.random() * 4,
        map: 93 + Math.random() * 5
      }));
      return NextResponse.json({ trend: mockTrend });
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '24';
    const rangeHours = parseInt(rangeParam);
    const since = new Date(Date.now() - rangeHours * 3600000);

    const { data, error } = await supabase
      .from('vitals_history')
      .select('*')
      .eq('patient_id', id)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Empty data');

    const trend = data.map((row: any) => ({
      time: new Date(row.recorded_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      hr: row.hr,
      spo2: row.spo2,
      sbp: row.sbp,
      dbp: row.dbp,
      temp: row.temp,
      rr: row.rr,
      map: row.map,
    }));

    return NextResponse.json({ trend });
  } catch (error: any) {
    console.error('Error fetching vitals trend:', error);
    const mockPatient = MOCK_PATIENTS.find(p => p.id === id) || MOCK_PATIENTS[0];
    return NextResponse.json({ trend: mockPatient.trend || [] });
  }
}
