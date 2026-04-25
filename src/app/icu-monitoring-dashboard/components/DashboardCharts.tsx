'use client';
import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_PATIENTS, WARD_ALERT_FREQUENCY, MOCK_WARDS } from '@/lib/mockData';
import { ArrowLeft, Heart, Droplets, Activity } from 'lucide-react';

const CARD   = 'hsl(222,22%,11%)';
const BORDER = 'hsl(220,18%,18%)';
const MUTED  = 'hsl(215,18%,55%)';
const SURFACE = 'hsl(220,20%,8%)';

interface DashboardChartsProps {
  patientId: string;
  onBack: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-2xl min-w-[160px]"
      style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
      <p className="text-[10px] mb-2 font-mono" style={{ color: MUTED }}>{label}</p>
      {payload.map((entry) => (
        <div key={`tt-${entry.name}`} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[11px] font-medium" style={{ color: MUTED }}>{entry.name}</span>
          </div>
          <span className="text-xs font-bold font-mono tabular-nums text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

const VITAL_TABS = [
  { id: 'hr',   label: 'Heart Rate', unit: 'bpm',  color: '#EF4444', icon: Heart },
  { id: 'spo2', label: 'SpO₂',      unit: '%',    color: '#3B82F6', icon: Droplets },
  { id: 'map',  label: 'MAP',        unit: 'mmHg', color: '#10B981', icon: Activity },
] as const;

export default function DashboardCharts({ patientId, onBack }: DashboardChartsProps) {
  const [activeVital, setActiveVital] = useState<'hr' | 'spo2' | 'map'>('hr');

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === patientId) || MOCK_PATIENTS[0];
  const trendData = selectedPatient.trend;
  const activeTab = VITAL_TABS.find(t => t.id === activeVital)!;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          id="charts-back-btn"
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: MUTED }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-white">{selectedPatient.name}</h2>
          <p className="text-xs" style={{ color: MUTED }}>{selectedPatient.bedId.toUpperCase()} · {selectedPatient.diagnosis}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Vitals trend */}
        <div className="lg:col-span-2 rounded-2xl p-5 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Vitals Trend</h3>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>24-hour history · {selectedPatient.bedId.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl p-1 border"
              style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              {VITAL_TABS.map((t) => {
                const Icon = t.icon;
                const isActive = activeVital === t.id;
                return (
                  <button
                    key={`vtab-${t.id}`}
                    onClick={() => setActiveVital(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? CARD : 'transparent',
                      color: isActive ? 'white' : MUTED,
                      border: isActive ? `1px solid ${BORDER}` : '1px solid transparent',
                    }}
                  >
                    <Icon className="w-3 h-3" style={{ color: isActive ? t.color : MUTED }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={activeTab.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={activeTab.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: MUTED, fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: MUTED, fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={activeVital} name={`${activeTab.label} (${activeTab.unit})`}
                stroke={activeTab.color} strokeWidth={2} fill="url(#areaGrad)"
                dot={false} activeDot={{ r: 4, fill: activeTab.color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts by Ward */}
        <div className="rounded-2xl p-5 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
          <h3 className="text-sm font-semibold text-white mb-1">Alerts by Ward</h3>
          <p className="text-xs mb-5" style={{ color: MUTED }}>Last 12 hours · by severity</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WARD_ALERT_FREQUENCY} layout="vertical" margin={{ top: 0, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="ward" type="category" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={68} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="critical" name="Critical" stackId="a" fill="#EF4444" />
              <Bar dataKey="high"     name="High"     stackId="a" fill="#F97316" />
              <Bar dataKey="moderate" name="Moderate" stackId="a" fill="#F59E0B" />
              <Bar dataKey="low"      name="Low"      stackId="a" fill="#64748B" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ward bed map */}
      <div className="rounded-2xl p-5 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Ward Bed Availability</h3>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>5 wards · real-time capacity</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: MUTED }}>
            {[
              { color: '#EF4444', label: 'Critical' },
              { color: 'rgba(245,158,11,0.6)', label: 'Occupied' },
              { color: 'rgba(16,185,129,0.4)', label: 'Available' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {MOCK_WARDS.map((ward: any) => {
            const pct = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
            const hasCritical = ward.criticalPatients > 0;
            return (
              <div key={ward.id} className="rounded-xl p-4 border"
                style={{
                  borderColor: hasCritical ? 'rgba(239,68,68,0.2)' : BORDER,
                  backgroundColor: hasCritical ? 'rgba(239,68,68,0.04)' : SURFACE,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-white truncate">{ward.name}</p>
                  {hasCritical && (
                    <span className="text-[9px] font-bold text-red-400 px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {ward.criticalPatients} CRIT
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold tabular-nums text-white">{ward.occupiedBeds}</span>
                  <span className="text-sm" style={{ color: MUTED }}>/ {ward.totalBeds}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 mb-2.5">
                  {Array.from({ length: ward.totalBeds }, (_, i) => {
                    const occupied = (i + 1) <= ward.occupiedBeds;
                    const critical = occupied && (i + 1) <= ward.criticalPatients;
                    return (
                      <div key={`bed-${ward.id}-${i}`} className="h-2.5 rounded-sm"
                        style={{ backgroundColor: critical ? 'rgba(239,68,68,0.8)' : occupied ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.25)' }} />
                    );
                  })}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 90 ? '#EF4444' : pct >= 75 ? '#F59E0B' : '#10B981'
                    }} />
                </div>
                <p className="text-[10px] mt-1.5 font-mono" style={{ color: MUTED }}>{pct}% occupied</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}