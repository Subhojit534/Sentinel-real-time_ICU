import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Fallback bed data mirroring the seed.sql
const MOCK_BEDS = [
  // ICU Alpha
  { id: 'bed-a01', ward_id: 'ward-icu-a', number: 'A-01', status: 'occupied' },
  { id: 'bed-a02', ward_id: 'ward-icu-a', number: 'A-02', status: 'occupied' },
  { id: 'bed-a03', ward_id: 'ward-icu-a', number: 'A-03', status: 'occupied' },
  { id: 'bed-a04', ward_id: 'ward-icu-a', number: 'A-04', status: 'available' },
  { id: 'bed-a05', ward_id: 'ward-icu-a', number: 'A-05', status: 'available' },
  { id: 'bed-a06', ward_id: 'ward-icu-a', number: 'A-06', status: 'maintenance' },
  { id: 'bed-a07', ward_id: 'ward-icu-a', number: 'A-07', status: 'available' },
  { id: 'bed-a08', ward_id: 'ward-icu-a', number: 'A-08', status: 'available' },
  // ICU Beta
  { id: 'bed-b01', ward_id: 'ward-icu-b', number: 'B-01', status: 'occupied' },
  { id: 'bed-b02', ward_id: 'ward-icu-b', number: 'B-02', status: 'occupied' },
  { id: 'bed-b03', ward_id: 'ward-icu-b', number: 'B-03', status: 'occupied' },
  { id: 'bed-b04', ward_id: 'ward-icu-b', number: 'B-04', status: 'available' },
  { id: 'bed-b05', ward_id: 'ward-icu-b', number: 'B-05', status: 'available' },
  { id: 'bed-b06', ward_id: 'ward-icu-b', number: 'B-06', status: 'reserved' },
  { id: 'bed-b07', ward_id: 'ward-icu-b', number: 'B-07', status: 'available' },
  { id: 'bed-b08', ward_id: 'ward-icu-b', number: 'B-08', status: 'available' },
  // ICU Gamma
  { id: 'bed-c01', ward_id: 'ward-icu-c', number: 'C-01', status: 'occupied' },
  { id: 'bed-c02', ward_id: 'ward-icu-c', number: 'C-02', status: 'occupied' },
  { id: 'bed-c03', ward_id: 'ward-icu-c', number: 'C-03', status: 'occupied' },
  { id: 'bed-c04', ward_id: 'ward-icu-c', number: 'C-04', status: 'available' },
  { id: 'bed-c05', ward_id: 'ward-icu-c', number: 'C-05', status: 'available' },
  { id: 'bed-c06', ward_id: 'ward-icu-c', number: 'C-06', status: 'available' },
  { id: 'bed-c07', ward_id: 'ward-icu-c', number: 'C-07', status: 'available' },
  { id: 'bed-c08', ward_id: 'ward-icu-c', number: 'C-08', status: 'available' },
  { id: 'bed-c09', ward_id: 'ward-icu-c', number: 'C-09', status: 'maintenance' },
  { id: 'bed-c10', ward_id: 'ward-icu-c', number: 'C-10', status: 'available' },
  // Cardiac ICU
  { id: 'bed-d01', ward_id: 'ward-icu-d', number: 'D-01', status: 'occupied' },
  { id: 'bed-d02', ward_id: 'ward-icu-d', number: 'D-02', status: 'occupied' },
  { id: 'bed-d03', ward_id: 'ward-icu-d', number: 'D-03', status: 'available' },
  { id: 'bed-d04', ward_id: 'ward-icu-d', number: 'D-04', status: 'available' },
  { id: 'bed-d05', ward_id: 'ward-icu-d', number: 'D-05', status: 'reserved' },
  { id: 'bed-d06', ward_id: 'ward-icu-d', number: 'D-06', status: 'available' },
  // Neuro ICU
  { id: 'bed-e01', ward_id: 'ward-icu-e', number: 'E-01', status: 'occupied' },
  { id: 'bed-e02', ward_id: 'ward-icu-e', number: 'E-02', status: 'available' },
  { id: 'bed-e03', ward_id: 'ward-icu-e', number: 'E-03', status: 'available' },
  { id: 'bed-e04', ward_id: 'ward-icu-e', number: 'E-04', status: 'available' },
  { id: 'bed-e05', ward_id: 'ward-icu-e', number: 'E-05', status: 'available' },
  { id: 'bed-e06', ward_id: 'ward-icu-e', number: 'E-06', status: 'available' },
  { id: 'bed-e07', ward_id: 'ward-icu-e', number: 'E-07', status: 'available' },
  { id: 'bed-e08', ward_id: 'ward-icu-e', number: 'E-08', status: 'available' },
];

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ beds: MOCK_BEDS });
    }

    const { data, error } = await supabase
      .from('beds')
      .select('id, ward_id, number, status, patient_id')
      .order('id');

    if (error) throw error;
    if (!data || data.length === 0) return NextResponse.json({ beds: MOCK_BEDS });

    return NextResponse.json({ beds: data });
  } catch (error: any) {
    console.error('Error fetching beds:', error);
    return NextResponse.json({ beds: MOCK_BEDS });
  }
}
