import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, escalationLevel } = body;

    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Alert updated successfully (Mock)' });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (notes) updates.notes = notes;
    if (escalationLevel !== undefined) updates.escalation_level = escalationLevel;

    if (status === 'acknowledged') updates.acknowledged_at = new Date().toISOString();
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const { error } = await supabase.from('alerts').update(updates).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Alert updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
