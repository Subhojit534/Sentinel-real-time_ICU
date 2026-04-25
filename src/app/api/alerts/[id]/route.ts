import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes, escalationLevel } = body;

    if (!status && !notes && escalationLevel === undefined) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    let query = 'UPDATE alerts SET ';
    const queryParams: any[] = [];
    const updates: string[] = [];

    if (status) {
      updates.push('status = ?');
      queryParams.push(status);
      
      if (status === 'acknowledged') {
        updates.push('acknowledged_at = NOW()');
      } else if (status === 'resolved') {
        updates.push('resolved_at = NOW()');
      }
    }

    if (notes) {
      updates.push('notes = ?');
      queryParams.push(notes);
    }

    if (escalationLevel !== undefined) {
      updates.push('escalation_level = ?');
      queryParams.push(escalationLevel);
    }

    query += updates.join(', ') + ' WHERE id = ?';
    queryParams.push(id);

    const [result]: any = await pool.query(query, queryParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Alert updated successfully' });
  } catch (error: any) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
