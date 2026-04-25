import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        totalPatients: 10,
        criticalPatients: 3,
        availableBeds: 5,
        aiAlertsActive: 2
      });
    }

    const { count: totalPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true });
    const { count: criticalPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true }).in('status', ['critical', 'warning']);
    const { count: availableBeds } = await supabase.from('beds').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: aiAlertsActive } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('ai_generated', true);

    const kpis = {
      totalPatients: totalPatients || 0,
      criticalPatients: criticalPatients || 0,
      availableBeds: availableBeds || 0,
      aiAlertsActive: aiAlertsActive || 0
    };

    return NextResponse.json(kpis);
  } catch (error: any) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({
      criticalPatients: 3,
      activeAlerts: 4,
      unacknowledgedAlerts: 1,
      avgSpo2: 95,
      lowSpo2Count: 2,
      bedOccupancyPct: 75,
      occupiedBeds: 30,
      totalBeds: 40,
      avgMap: 85,
      hypotensiveCount: 1,
      highAiRiskCount: 5,
    });
  }
}
