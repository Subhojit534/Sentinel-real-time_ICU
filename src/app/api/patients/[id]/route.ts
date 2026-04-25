import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Patient id is required' }, { status: 400 });
  }

  try {
    if (!supabase) {
      return NextResponse.json({ success: true, freedBedId: 'bed-mock' });
    }

    // Get bed id before deleting
    const { data: patient } = await supabase.from('patients').select('bed_id').eq('id', id).single();

    // Delete related vitals first (FK constraint)
    await supabase.from('vitals_history').delete().eq('patient_id', id);
    await supabase.from('vitals_current').delete().eq('patient_id', id);
    await supabase.from('alerts').delete().eq('patient_id', id);

    // Delete patient
    const { error: delErr } = await supabase.from('patients').delete().eq('id', id);
    if (delErr) throw delErr;

    // Free the bed
    if (patient?.bed_id) {
      await supabase.from('beds').update({ status: 'available', patient_id: null }).eq('id', patient.bed_id);
    }

    return NextResponse.json({ success: true, freedBedId: patient?.bed_id });
  } catch (error: any) {
    console.error('Error discharging patient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
