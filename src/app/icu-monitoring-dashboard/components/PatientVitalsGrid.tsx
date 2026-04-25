'use client';
import React, { useState } from 'react';
import { api } from '@/lib/api';
import { PatientStatusBadge } from '@/components/ui/StatusBadge';
import NEWS2Badge from '@/components/ui/NEWS2Badge';
import AIRiskBadge from '@/components/ui/AIRiskBadge';
import { ChevronRight, Activity } from 'lucide-react';
import type { Patient } from '@/lib/types';

const SURFACE = 'hsl(220,20%,8%)';
const CARD = 'hsl(222,22%,11%)';
const BORDER = 'hsl(220,18%,18%)';
const MUTED = 'hsl(215,18%,55%)';

interface VitalPillProps {
  value: string;
  unit: string;
  alert: boolean;
}
function VitalPill({ value, unit, alert }: VitalPillProps) {
  return (
    <span
      className="inline-flex items-baseline gap-0.5 px-2 py-0.5 rounded-md text-xs font-mono font-semibold tabular-nums"
      style={{
        backgroundColor: alert ? 'rgba(239,68,68,0.10)' : 'transparent',
        color: alert ? '#f87171' : 'hsl(210,30%,94%)',
      }}
    >
      {value}
      <span className="text-[9px] font-sans font-normal" style={{ color: alert ? 'rgba(248,113,113,0.7)' : MUTED }}>
        {unit}
      </span>
    </span>
  );
}

interface PatientVitalsGridProps {
  onSelectPatient: (id: string) => void;
}

const rowLeftBorder = (p: Patient) => {
  if (p.status === 'critical' || p.status === 'code') return '3px solid #EF4444';
  if (p.status === 'warning') return '3px solid #F59E0B';
  if (p.status === 'watch')   return '3px solid #3B82F6';
  return '3px solid transparent';
};

export default function PatientVitalsGrid({ onSelectPatient }: PatientVitalsGridProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter]     = useState<string>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.patients.list();
        setPatients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = patients.filter((p) => {
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    const wardOk   = wardFilter === 'all' || p.wardId === wardFilter;
    return statusOk && wardOk;
  });

  const ORDER: Record<string, number> = { critical: 0, code: 0, warning: 1, watch: 2, stable: 3 };
  const sorted = [...filtered].sort((a, b) => (ORDER[a.status] ?? 4) - (ORDER[b.status] ?? 4));

  if (loading) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl w-full"></div>;
  }

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Patient Vitals — Live</h2>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>{sorted.length} patients · sorted by acuity</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status filters */}
          <div className="flex items-center gap-1 rounded-xl p-1 border"
            style={{ backgroundColor: CARD, borderColor: BORDER }}>
            {(['all', 'critical', 'warning', 'watch', 'stable'] as const).map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={`filter-${s}`}
                  onClick={() => setStatusFilter(s)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 capitalize"
                  style={{
                    backgroundColor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                    color: active ? '#60A5FA' : MUTED,
                    border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                  }}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
          {/* Ward filter */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none"
            style={{ backgroundColor: CARD, borderColor: BORDER, border: `1px solid ${BORDER}`, color: 'hsl(210,30%,94%)' }}
          >
            <option value="all">All Wards</option>
            <option value="ward-icu-a">ICU Alpha</option>
            <option value="ward-icu-b">ICU Beta</option>
            <option value="ward-icu-c">ICU Gamma</option>
            <option value="ward-icu-d">Cardiac ICU</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
        {/* Head */}
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          {[
            { label: 'Status',   w: 'w-28' },
            { label: 'Patient',  w: 'w-44' },
            { label: 'Bed',      w: 'w-28' },
            { label: 'HR',       w: 'w-20' },
            { label: 'SpO₂',    w: 'w-20' },
            { label: 'BP',       w: 'w-24' },
            { label: 'Temp',     w: 'w-18' },
            { label: 'RR',       w: 'w-16' },
            { label: 'NEWS2',    w: 'w-18' },
            { label: 'AI Risk',  w: 'w-20' },
            { label: '',         w: 'w-8' },
          ].map(({ label, w }, i) => (
            <span key={`th-${i}`} className={`${w} text-[10px] font-semibold uppercase tracking-wider font-mono flex-shrink-0`}
              style={{ color: MUTED }}>
              {label}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="divide-y" style={{ borderColor: BORDER }}>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Activity className="w-8 h-8 mb-3" style={{ color: MUTED }} />
              <p className="text-sm font-semibold text-white">No patients match this filter</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Adjust the ward or status filter above</p>
            </div>
          ) : (
            sorted.map((patient, idx) => {
              const isCritical = patient.status === 'critical' || patient.status === 'code';
              return (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex items-center gap-2 px-5 py-3.5 cursor-pointer transition-all duration-100"
                  style={{
                    borderLeft: rowLeftBorder(patient),
                    paddingLeft: '17px',
                    backgroundColor: idx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      isCritical ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.025)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      idx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent';
                  }}
                >
                  {/* Status */}
                  <div className="w-28 flex-shrink-0 flex items-center gap-1.5">
                    <PatientStatusBadge status={patient.status} />
                  </div>

                  {/* Patient */}
                  <div className="w-44 flex-shrink-0 min-w-0">
                    <p className="text-sm font-semibold text-white truncate leading-tight">{patient.name}</p>
                    <p className="text-[10px] truncate" style={{ color: MUTED }}>
                      {patient.age}y · {patient.gender} · {patient.diagnosis}
                    </p>
                  </div>

                  {/* Bed */}
                  <div className="w-28 flex-shrink-0">
                    <p className="text-xs font-mono font-medium text-white">{patient.bedId.toUpperCase()}</p>
                    <p className="text-[10px]" style={{ color: MUTED }}>
                      {patient.attendingPhysician.split(' ').slice(0, 2).join(' ')}
                    </p>
                  </div>

                  {/* HR */}
                  <div className="w-20 flex-shrink-0">
                    <VitalPill value={String(patient.vitals.hr)} unit="bpm"
                      alert={patient.vitals.hr > 110 || patient.vitals.hr < 50} />
                  </div>

                  {/* SpO2 */}
                  <div className="w-20 flex-shrink-0">
                    <VitalPill value={`${patient.vitals.spo2}%`} unit="" alert={patient.vitals.spo2 < 94} />
                  </div>

                  {/* BP */}
                  <div className="w-24 flex-shrink-0">
                    <VitalPill value={`${patient.vitals.sbp}/${patient.vitals.dbp}`} unit="mmHg"
                      alert={patient.vitals.sbp < 90 || patient.vitals.sbp > 160} />
                  </div>

                  {/* Temp */}
                  <div className="w-18 flex-shrink-0">
                    <VitalPill value={`${patient.vitals.temp}°`} unit="C"
                      alert={patient.vitals.temp > 38.5 || patient.vitals.temp < 36} />
                  </div>

                  {/* RR */}
                  <div className="w-16 flex-shrink-0">
                    <VitalPill value={String(patient.vitals.rr)} unit="/min"
                      alert={patient.vitals.rr > 25 || patient.vitals.rr < 10} />
                  </div>

                  {/* NEWS2 */}
                  <div className="w-18 flex-shrink-0">
                    <NEWS2Badge score={patient.news2} />
                  </div>

                  {/* AI Risk */}
                  <div className="w-20 flex-shrink-0">
                    <AIRiskBadge score={patient.aiRiskScore} />
                  </div>

                  {/* Arrow */}
                  <div className="w-8 flex-shrink-0 flex justify-end">
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: MUTED }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}