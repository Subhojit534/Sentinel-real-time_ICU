'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { PatientStatusBadge } from '@/components/ui/StatusBadge';
import NEWS2Badge from '@/components/ui/NEWS2Badge';
import AIRiskBadge from '@/components/ui/AIRiskBadge';
import { generatePatientPDF } from '@/lib/generatePatientPDF';
import { getSession } from '@/lib/session';
import {
  Users, Search, User, Calendar, Stethoscope,
  Heart, Droplets, Activity, ChevronRight, X,
  ClipboardList, Brain, FileDown, CheckSquare, Square,
  Loader2,
} from 'lucide-react';
import type { Patient } from '@/lib/types';

const CARD    = 'hsl(222,22%,11%)';
const BORDER  = 'hsl(220,18%,18%)';
const MUTED   = 'hsl(215,18%,55%)';
const SURFACE = 'hsl(220,20%,8%)';

function PatientDetailPanel({ patient, onClose, onExportSingle }: {
  patient: Patient;
  onClose: () => void;
  onExportSingle: (p: Patient) => void;
}) {
  const v = patient.vitals;
  const vitals = [
    { label: 'Heart Rate', value: `${v.hr} bpm`,          alert: v.hr > 110 || v.hr < 50,   color: '#EF4444' },
    { label: 'SpO₂',       value: `${v.spo2}%`,           alert: v.spo2 < 94,                color: '#3B82F6' },
    { label: 'Syst. BP',   value: `${v.sbp} mmHg`,        alert: v.sbp < 90 || v.sbp > 160, color: '#F59E0B' },
    { label: 'Temp',       value: `${v.temp}°C`,           alert: v.temp > 38.5 || v.temp < 36, color: '#8B5CF6' },
    { label: 'Resp. Rate', value: `${v.rr} /min`,          alert: v.rr > 25 || v.rr < 10,   color: '#06B6D4' },
    { label: 'MAP',        value: `${v.map} mmHg`,         alert: v.map < 65,                color: '#10B981' },
  ];

  return (
    <aside className="w-96 flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: SURFACE, borderLeft: `1px solid ${BORDER}` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${BORDER}` }}>
        <h3 className="text-sm font-bold text-white">Patient Details</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExportSingle(patient)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA' }}
            title="Export this patient as PDF"
          >
            <FileDown className="w-3 h-3" />
            PDF
          </button>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:text-white"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: MUTED }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* Identity */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
              style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA' }}>
              {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-base font-bold text-white">{patient.name}</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                {patient.age} years · {patient.gender === 'M' ? 'Male' : 'Female'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PatientStatusBadge status={patient.status} />
            <NEWS2Badge score={patient.news2} />
            <AIRiskBadge score={patient.aiRiskScore} />
          </div>
        </div>

        {/* Clinical info */}
        <div className="px-5 py-4 space-y-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest font-mono" style={{ color: MUTED }}>Clinical Info</p>
          {[
            { icon: ClipboardList, label: 'Diagnosis',  value: patient.diagnosis },
            { icon: Calendar,      label: 'Admitted',   value: patient.admissionDate },
            { icon: User,          label: 'Bed',        value: `${patient.bedId.toUpperCase()} · ${patient.wardId.replace('ward-icu-', 'ICU ').toUpperCase()}` },
            { icon: Stethoscope,   label: 'Physician',  value: patient.attendingPhysician },
            { icon: Heart,         label: 'Primary Nurse',value: patient.primaryNurse },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: MUTED }} />
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
                <p className="text-xs font-semibold text-white mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current vitals */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest font-mono mb-3" style={{ color: MUTED }}>Current Vitals</p>
          <div className="grid grid-cols-2 gap-2">
            {vitals.map(({ label, value, alert, color }) => (
              <div key={label} className="p-2.5 rounded-xl"
                style={{
                  backgroundColor: alert ? `${color}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${alert ? `${color}35` : BORDER}`,
                }}>
                <p className="text-[9px] uppercase tracking-wider font-medium mb-1" style={{ color: MUTED }}>{label}</p>
                <p className="text-sm font-bold font-mono tabular-nums" style={{ color: alert ? color : 'white' }}>
                  {value}
                </p>
                {alert && <p className="text-[9px] mt-0.5 font-semibold" style={{ color }}>ABNORMAL</p>}
              </div>
            ))}
          </div>
        </div>

        {/* AI risk */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest font-mono mb-3" style={{ color: MUTED }}>AI Risk Assessment</p>
          <div className="p-3.5 rounded-xl"
            style={{
              backgroundColor: patient.aiRiskScore >= 70 ? 'rgba(239,68,68,0.08)' : patient.aiRiskScore >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${patient.aiRiskScore >= 70 ? 'rgba(239,68,68,0.2)' : patient.aiRiskScore >= 40 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
            }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-white">Deterioration Risk</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold tabular-nums"
                style={{ color: patient.aiRiskScore >= 70 ? '#f87171' : patient.aiRiskScore >= 40 ? '#fbbf24' : '#34d399' }}>
                {patient.aiRiskScore}%
              </span>
              <span className="text-xs" style={{ color: MUTED }}>within 4 hours</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${patient.aiRiskScore}%`,
                  backgroundColor: patient.aiRiskScore >= 70 ? '#EF4444' : patient.aiRiskScore >= 40 ? '#F59E0B' : '#10B981',
                }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

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
    const interval = setInterval(fetchPatients, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      p.name.toLowerCase().includes(q) ||
      p.diagnosis.toLowerCase().includes(q) ||
      p.bedId.toLowerCase().includes(q) ||
      p.attendingPhysician.toLowerCase().includes(q);
    return matchSearch &&
      (statusFilter === 'all' || p.status === statusFilter) &&
      (wardFilter === 'all' || p.wardId === wardFilter);
  });

  const ORDER: Record<string, number> = { critical: 0, code: 0, warning: 1, watch: 2, stable: 3 };
  const sorted = [...filtered].sort((a, b) => (ORDER[a.status] ?? 4) - (ORDER[b.status] ?? 4));

  const statusCounts = {
    critical: patients.filter((p) => p.status === 'critical' || p.status === 'code').length,
    warning:  patients.filter((p) => p.status === 'warning').length,
    watch:    patients.filter((p) => p.status === 'watch').length,
    stable:   patients.filter((p) => p.status === 'stable').length,
  };

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === sorted.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(sorted.map(p => p.id)));
    }
  };

  const handleExport = async (patientsToExport: Patient[]) => {
    setExporting(true);
    try {
      const session = getSession();
      const reporter = session?.name || 'Sentinel ICU Clinician';
      await generatePatientPDF(patientsToExport, reporter);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const selectedPatients = patients.filter(p => checkedIds.has(p.id));

  if (loading) {
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
      <div className="flex h-full">
        <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-5 space-y-5 max-w-screen-2xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Patients</h1>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                  {patients.length} patients across all wards
                </p>
              </div>

              {/* PDF Export toolbar */}
              <div className="flex items-center gap-2">
                {checkedIds.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.25)' }}>
                    <span className="text-xs font-semibold text-blue-400">{checkedIds.size} selected</span>
                    <button
                      onClick={() => setCheckedIds(new Set())}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors ml-1"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <button
                  id="btn-export-pdf"
                  onClick={() => checkedIds.size > 0 ? handleExport(selectedPatients) : handleExport(sorted)}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
                  style={{
                    backgroundColor: checkedIds.size > 0 ? 'rgba(59,130,246,0.85)' : 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.35)',
                    color: checkedIds.size > 0 ? '#fff' : '#60A5FA',
                    opacity: exporting ? 0.6 : 1,
                  }}
                >
                  {exporting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <FileDown className="w-4 h-4" />}
                  {exporting
                    ? 'Generating PDF…'
                    : checkedIds.size > 0
                      ? `Export ${checkedIds.size} Patient${checkedIds.size > 1 ? 's' : ''}`
                      : 'Export All'}
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Critical', count: statusCounts.critical, color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.20)',   left: '#EF4444' },
                { label: 'Warning',  count: statusCounts.warning,  color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.20)',  left: '#F59E0B' },
                { label: 'Watch',    count: statusCounts.watch,    color: '#60A5FA', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.20)',  left: '#3B82F6' },
                { label: 'Stable',   count: statusCounts.stable,   color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.20)',  left: '#10B981' },
              ].map((s) => (
                <div key={s.label} onClick={() => setStatusFilter(s.label.toLowerCase())}
                  className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-150 hover:opacity-90"
                  style={{
                    backgroundColor: s.bg,
                    borderTopWidth: '1px', borderRightWidth: '1px',
                    borderBottomWidth: '1px', borderLeftWidth: '4px',
                    borderStyle: 'solid',
                    borderTopColor: s.border, borderRightColor: s.border,
                    borderBottomColor: s.border, borderLeftColor: s.left,
                  }}>
                  <p className="text-3xl font-bold text-white tabular-nums">{s.count}</p>
                  <p className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters + Select All */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 flex-1 min-w-[240px] max-w-sm"
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTED }} />
                <input type="text" placeholder="Search name, diagnosis, bed, physician..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder:text-gray-500 outline-none w-full" />
              </div>

              <div className="flex items-center gap-1 rounded-xl p-1 border" style={{ backgroundColor: CARD, borderColor: BORDER }}>
                {['all', 'critical', 'warning', 'watch', 'stable'].map((s) => {
                  const active = statusFilter === s;
                  return (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all"
                      style={{
                        backgroundColor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                        color: active ? '#60A5FA' : MUTED,
                        border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                      }}>
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  );
                })}
              </div>

              <select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)}
                className="text-xs rounded-xl px-3 py-2 outline-none"
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: 'hsl(210,30%,94%)' }}>
                <option value="all">All Wards</option>
                <option value="ward-icu-a">ICU Alpha</option>
                <option value="ward-icu-b">ICU Beta</option>
                <option value="ward-icu-c">ICU Gamma</option>
                <option value="ward-icu-d">Cardiac ICU</option>
              </select>

              {/* Select All toggle */}
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: MUTED }}
              >
                {checkedIds.size === sorted.length && sorted.length > 0
                  ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  : <Square className="w-3.5 h-3.5" />}
                {checkedIds.size === sorted.length && sorted.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Patient cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((patient) => {
                const isCritical = patient.status === 'critical' || patient.status === 'code';
                const borderLeft = isCritical ? '3px solid #EF4444' : patient.status === 'warning' ? '3px solid #F59E0B' : patient.status === 'watch' ? '3px solid #3B82F6' : '3px solid transparent';
                const isSelected = selectedPatient?.id === patient.id;
                const isChecked = checkedIds.has(patient.id);

                return (
                  <div key={patient.id}
                    onClick={() => setSelectedPatient(isSelected ? null : patient)}
                    className="rounded-2xl border p-4 cursor-pointer transition-all duration-150 relative"
                    style={{
                      backgroundColor: isSelected ? 'rgba(59,130,246,0.06)' : CARD,
                      borderTopWidth: '1px', borderRightWidth: '1px',
                      borderBottomWidth: '1px', borderLeftWidth: '3px',
                      borderStyle: 'solid',
                      borderTopColor:    isChecked ? 'rgba(59,130,246,0.5)' : isSelected ? 'rgba(59,130,246,0.3)' : BORDER,
                      borderRightColor:  isChecked ? 'rgba(59,130,246,0.5)' : isSelected ? 'rgba(59,130,246,0.3)' : BORDER,
                      borderBottomColor: isChecked ? 'rgba(59,130,246,0.5)' : isSelected ? 'rgba(59,130,246,0.3)' : BORDER,
                      borderLeftColor:   isCritical ? '#EF4444' : patient.status === 'warning' ? '#F59E0B' : patient.status === 'watch' ? '#3B82F6' : 'transparent',
                    }}>

                    {/* Checkbox */}
                    <button
                      onClick={(e) => toggleCheck(patient.id, e)}
                      className="absolute top-3 right-3 p-0.5 rounded transition-all z-10"
                      title={isChecked ? 'Deselect for PDF' : 'Select for PDF'}
                    >
                      {isChecked
                        ? <CheckSquare className="w-4 h-4 text-blue-400" />
                        : <Square className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" style={{ color: MUTED }} />}
                    </button>

                    <div className="flex items-start justify-between gap-2 mb-3 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA' }}>
                          {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{patient.name}</p>
                          <p className="text-[10px] truncate" style={{ color: MUTED }}>
                            {patient.age}y · {patient.gender} · {patient.bedId.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: MUTED }} />
                    </div>

                    <p className="text-xs font-medium text-white mb-3 truncate">{patient.diagnosis}</p>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <PatientStatusBadge status={patient.status} />
                      <NEWS2Badge score={patient.news2} />
                      <AIRiskBadge score={patient.aiRiskScore} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                      {[
                        { icon: Heart,    label: 'HR',   value: `${patient.vitals.hr}`, unit: 'bpm',  alert: patient.vitals.hr > 110 || patient.vitals.hr < 50 },
                        { icon: Droplets, label: 'SpO₂', value: `${patient.vitals.spo2}`, unit: '%',  alert: patient.vitals.spo2 < 94 },
                        { icon: Activity, label: 'MAP',  value: `${patient.vitals.map}`, unit: 'mmHg',alert: patient.vitals.map < 65 },
                      ].map(({ icon: Icon, label, value, unit, alert }) => (
                        <div key={label} className="text-center">
                          <p className="text-[9px] uppercase font-medium mb-0.5" style={{ color: MUTED }}>{label}</p>
                          <p className="text-sm font-bold font-mono tabular-nums" style={{ color: alert ? '#f87171' : 'white' }}>
                            {value}<span className="text-[9px] ml-0.5" style={{ color: MUTED }}>{unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                      <Stethoscope className="w-3 h-3 flex-shrink-0" style={{ color: MUTED }} />
                      <p className="text-[10px] truncate" style={{ color: MUTED }}>{patient.attendingPhysician}</p>
                    </div>
                  </div>
                );
              })}

              {sorted.length === 0 && (
                <div className="col-span-3 flex flex-col items-center justify-center py-20">
                  <Users className="w-10 h-10 mb-4" style={{ color: MUTED }} />
                  <p className="text-sm font-semibold text-white">No patients match this filter</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>Try clearing the search or status filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedPatient && (
          <PatientDetailPanel
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onExportSingle={(p) => handleExport([p])}
          />
        )}
      </div>
    </AppLayout>
  );
}
