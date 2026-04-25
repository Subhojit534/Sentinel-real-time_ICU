import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MOCK_WARDS } from '@/lib/mockData';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ wards: MOCK_WARDS });
    }

    // Fetch wards and patients together so we can compute occupancy live
    const [wardsRes, patientsRes] = await Promise.all([
      supabase.from('wards').select('*'),
      supabase.from('patients').select('id, ward_id, status'),
    ]);

    if (wardsRes.error) throw wardsRes.error;
    if (!wardsRes.data || wardsRes.data.length === 0) throw new Error('Empty data');

    const patients = patientsRes.data || [];

    const wards = wardsRes.data.map((row: any) => {
      const wardPatients = patients.filter((p: any) => p.ward_id === row.id);
      return {
        id: row.id,
        name: row.name,
        hospitalId: row.hospital_id,
        totalBeds: row.total_beds,
        occupiedBeds: wardPatients.length,
        criticalPatients: wardPatients.filter((p: any) => p.status === 'critical').length,
      };
    });

    return NextResponse.json({ wards });
  } catch (error: any) {
    console.error('Error fetching wards:', error);
    return NextResponse.json({ wards: MOCK_WARDS });
  }
}
