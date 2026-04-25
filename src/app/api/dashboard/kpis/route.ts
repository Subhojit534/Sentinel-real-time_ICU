import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // We will run a few aggregate queries to get the KPIs
    const [patientStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_patients,
        SUM(CASE WHEN status IN ('critical', 'code') THEN 1 ELSE 0 END) as critical_patients,
        SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warning_patients
      FROM patients
    `);

    const [alertStats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_active,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as unacknowledged
      FROM alerts
      WHERE status IN ('active', 'acknowledged', 'escalated')
    `);

    const [vitalsStats]: any = await pool.query(`
      SELECT 
        AVG(spo2) as avg_spo2,
        SUM(CASE WHEN spo2 < 94 THEN 1 ELSE 0 END) as low_spo2_count,
        AVG(map) as avg_map,
        SUM(CASE WHEN map < 65 THEN 1 ELSE 0 END) as low_map_count
      FROM vitals_current
    `);

    const [wardStats]: any = await pool.query(`
      SELECT SUM(total_beds) as total_beds
      FROM wards
    `);

    const [aiStats]: any = await pool.query(`
      SELECT COUNT(*) as high_risk_count
      FROM patients
      WHERE ai_risk_score > 50
    `);

    const totalOccupied = patientStats[0].total_patients || 0;
    const totalBeds = wardStats[0].total_beds || 0;

    const data = {
      criticalPatients: patientStats[0].critical_patients || 0,
      activeAlerts: alertStats[0].total_active || 0,
      unacknowledgedAlerts: alertStats[0].unacknowledged || 0,
      avgSpo2: parseFloat(vitalsStats[0].avg_spo2 || '0').toFixed(1),
      lowSpo2Count: vitalsStats[0].low_spo2_count || 0,
      bedOccupancyPct: totalBeds ? Math.round((totalOccupied / totalBeds) * 100) : 0,
      occupiedBeds: totalOccupied,
      totalBeds: totalBeds,
      avgMap: Math.round(vitalsStats[0].avg_map || 0),
      hypotensiveCount: vitalsStats[0].low_map_count || 0,
      highAiRiskCount: aiStats[0].high_risk_count || 0,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
