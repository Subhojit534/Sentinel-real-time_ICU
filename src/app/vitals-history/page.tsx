'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Activity, Heart, Droplets, Thermometer, Wind, ChevronDown } from 'lucide-react';
import { PatientStatusBadge } from '@/components/ui/StatusBadge';
import NEWS2Badge from '@/components/ui/NEWS2Badge';

const CARD    = 'hsl(222,22%,11%)';
const BORDER  = 'hsl(220,18%,18%)';
const MUTED   = 'hsl(215,18%,55%)';
const SURFACE = 'hsl(220,20%,8%)';

const VITAL_CONFIGS = [
  { key: 'hr',   label: 'Heart Rate',  unit: 'bpm',  color: '#EF4444', icon: Heart,        low: 50,  high: 110, refLow: 60,  refHigh: 100 },
  { key: 'spo2', label: 'SpO₂',        unit: '%',    color: '#3B82F6', icon: Droplets,     low: 85,  high: 100, refLow: 94,  refHigh: 100 },
  { key: 'sbp',  label: 'Syst. BP',    unit: 'mmHg', color: '#F59E0B', icon: Activity,     low: 70,  high: 180, refLow: 90,  refHigh: 140 },
  { key: 'temp', label: 'Temperature', unit: '°C',   color: '#8B5CF6', icon: Thermometer,  low: 35,  high: 40,  refLow: 36.1,refHigh: 37.2 },
  { key: 'rr',   label: 'Resp. Rate',  unit: '/min', color: '#06B6D4', icon: Wind,         low: 8,   high: 35,  refLow: 12,  refHigh: 20 },
  { key: 'map',  label: 'MAP',         unit: 'mmHg', color: '#10B981', icon: Activity,     low: 55,  high: 130, refLow: 70,  refHigh: 100 },
] as const;

interface CTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}
function CTooltip({ active, payload, label }: CTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs shadow-2xl" style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
      <p className="font-mono mb-1.5" style={{ color: MUTED }}>{label}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
            <span style={{ color: MUTED }}>{e.name}</span>
          </div>
          <span className="font-bold font-mono text-white">{e.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function VitalsHistoryPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h'>('24h');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const pts = await api.patients.list();
        setPatients(pts);
        if (pts.length > 0) {
          setSelectedPatient(pts[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    const fetchTrend = async () => {
      try {
        const hours = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : 24;
        const trend = await api.patients.getVitalsTrend(selectedPatient.id, hours);
        setTrendData(trend);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrend();
    const interval = setInterval(fetchTrend, 30000);
    return () => clearInterval(interval);
  }, [selectedPatient, timeRange]);

  const rangePoints = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : 24;

  if (loading || !selectedPatient) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse h-8 w-32 bg-white/10 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto scrollbar-thin">
        <div className="px-6 py-5 max-w-screen-2xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Vitals History</h1>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>24-hour historical vitals · per patient</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time range */}
              <div className="flex items-center gap-1 rounded-xl p-1 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                {(['6h', '12h', '24h'] as const).map((r) => {
                  const active = timeRange === r;
                  return (
                    <button key={r} onClick={() => setTimeRange(r)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                        color: active ? '#60A5FA' : MUTED,
                        border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                      }}>
                      {r}
                    </button>
                  );
                })}
              </div>

              {/* Patient picker */}
              <div className="relative">
                <select
                  value={selectedPatient.id}
                  onChange={(e) => setSelectedPatient(patients.find((p) => p.id === e.target.value)!)}
                  className="text-xs rounded-xl pl-3 pr-8 py-2 outline-none appearance-none"
                  style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: 'hsl(210,30%,94%)', minWidth: 200 }}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.bedId.toUpperCase()}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: MUTED }} />
              </div>
            </div>
          </div>

          {/* Patient summary bar */}
          <div className="flex items-center gap-5 p-4 rounded-2xl border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
              style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA' }}>
              {selectedPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white">{selectedPatient.name}</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                {selectedPatient.age}y · {selectedPatient.gender} · {selectedPatient.diagnosis} · {selectedPatient.bedId.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <PatientStatusBadge status={selectedPatient.status} />
              <NEWS2Badge score={selectedPatient.news2} />
              <div className="text-xs px-3 py-1.5 rounded-xl border" style={{ color: MUTED, borderColor: BORDER, backgroundColor: SURFACE }}>
                Attending: <span className="text-white font-medium">{selectedPatient.attendingPhysician}</span>
              </div>
            </div>
          </div>

          {/* Current vitals snapshot */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {VITAL_CONFIGS.map((v) => {
              const val = selectedPatient.vitals[v.key as keyof typeof selectedPatient.vitals] as number;
              const isAlert = val < v.refLow || val > v.refHigh;
              const Icon = v.icon;
              return (
                <div key={v.key} className="p-3.5 rounded-2xl transition-all"
                  style={{
                    backgroundColor: isAlert ? `${v.color}10` : CARD,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isAlert ? `${v.color}50` : BORDER,
                    borderLeftWidth: '3px',
                    borderLeftColor: isAlert ? v.color : 'transparent',
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: v.color }} />
                    {isAlert && <span className="text-[9px] font-bold" style={{ color: v.color }}>ALERT</span>}
                  </div>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: isAlert ? v.color : 'white' }}>
                    {val}{v.key === 'temp' ? '' : ''}
                  </p>
                  <p className="text-[10px] font-medium text-white mt-0.5">{v.label}</p>
                  <p className="text-[9px] font-mono mt-0.5" style={{ color: MUTED }}>{v.unit} · norm {v.refLow}–{v.refHigh}</p>
                </div>
              );
            })}
          </div>

          {/* Trend charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {VITAL_CONFIGS.map((v) => (
              <div key={v.key} className="rounded-2xl p-5 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${v.color}20` }}>
                      <v.icon className="w-3.5 h-3.5" style={{ color: v.color }} />
                    </div>
                    <p className="text-sm font-semibold text-white">{v.label}</p>
                  </div>
                  <span className="text-xs font-mono" style={{ color: MUTED }}>
                    Normal: {v.refLow}–{v.refHigh} {v.unit}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${v.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={v.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={v.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: MUTED, fontSize: 9, fontFamily: 'monospace' }} tickLine={false} axisLine={false} interval={rangePoints <= 6 ? 0 : 3} />
                    <YAxis domain={[v.low, v.high]} tick={{ fill: MUTED, fontSize: 9 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CTooltip />} />
                    <ReferenceLine y={v.refLow}  stroke={v.color} strokeDasharray="4 4" strokeOpacity={0.4} />
                    <ReferenceLine y={v.refHigh} stroke={v.color} strokeDasharray="4 4" strokeOpacity={0.4} />
                    <Area type="monotone" dataKey={v.key as string} name={`${v.label} (${v.unit})`}
                      stroke={v.color} strokeWidth={2}
                      fill={`url(#grad-${v.key})`}
                      dot={false} activeDot={{ r: 3, fill: v.color, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
