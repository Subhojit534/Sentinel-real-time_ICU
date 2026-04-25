'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { PatientStatusBadge } from '@/components/ui/StatusBadge';
import {
  BedDouble,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
  X,
  UserPlus,
  LogOut,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

const CARD = 'hsl(222,22%,11%)';
const BORDER = 'hsl(220,18%,18%)';
const MUTED = 'hsl(215,18%,55%)';
const SURFACE = 'hsl(220,20%,8%)';

type BedStatus =
  | 'occupied_critical'
  | 'occupied_warning'
  | 'occupied_stable'
  | 'available'
  | 'maintenance';

function getBedStatus(s?: string): BedStatus {
  if (!s) return 'available';
  if (s === 'critical' || s === 'code') return 'occupied_critical';
  if (s === 'warning') return 'occupied_warning';
  return 'occupied_stable';
}

const bedColor: Record<BedStatus, { bg: string; border: string; label: string }> = {
  occupied_critical: { bg: 'rgba(239,68,68,0.15)', border: '#EF4444', label: 'Critical' },
  occupied_warning: { bg: 'rgba(245,158,11,0.12)', border: '#F59E0B', label: 'Warning' },
  occupied_stable: { bg: 'rgba(16,185,129,0.10)', border: '#10B981', label: 'Stable' },
  available: { bg: 'rgba(255,255,255,0.03)', border: BORDER, label: 'Available' },
  maintenance: { bg: 'rgba(148,163,184,0.08)', border: '#64748B', label: 'Maintenance' },
};

/* ─── Modal backdrop ─────────────────────────────────────────────────────── */
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: 'hsl(222,22%,13%)', borderColor: BORDER }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Allocate Bed Modal ─────────────────────────────────────────────────── */
function AllocateModal({
  bed,
  wards,
  onClose,
  onSuccess,
}: {
  bed: any;
  wards: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('M');
  const [diagnosis, setDiag] = useState('');
  const [status, setStatus] = useState('stable');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !diagnosis.trim()) return;
    setSaving(true);
    setErr('');
    try {
      await api.patients.allocate({
        name: name.trim(),
        age: age ? parseInt(age) : 40,
        gender,
        bedId: bed.bedId,
        wardId: bed.wardId,
        diagnosis: diagnosis.trim(),
        status,
      });
      setDone(true);
      onSuccess();
      setTimeout(onClose, 1400);
    } catch (e: any) {
      setErr(e.message || 'Failed to allocate');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%',
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
  } as React.CSSProperties;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <UserPlus className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Allocate Bed</p>
            <p className="text-[11px]" style={{ color: MUTED }}>
              {bed.wardName} · BED {String(bed.bedNum).padStart(2, '0')}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" style={{ color: MUTED }} />
        </button>
      </div>

      {done ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <p className="text-sm font-semibold text-white">Patient Allocated!</p>
          <p className="text-xs" style={{ color: MUTED }}>
            Bed has been assigned in MySQL.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {err && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400"
              style={{
                backgroundColor: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {err}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Patient Name *
            </label>
            <input
              style={inp}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Smith"
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
                Age
              </label>
              <input
                style={inp}
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="40"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
                Gender
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ ...inp, appearance: 'none', paddingRight: 32 }}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: MUTED }}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Diagnosis *
            </label>
            <input
              style={inp}
              value={diagnosis}
              onChange={(e) => setDiag(e.target.value)}
              placeholder="e.g. Acute MI"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Initial Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...inp, appearance: 'none', paddingRight: 32 }}
              >
                <option value="stable">Stable</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: MUTED }}
              />
            </div>
          </div>
          <div className="pt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: MUTED,
                border: `1px solid ${BORDER}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: saving ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.85)',
                color: '#fff',
                border: '1px solid rgba(59,130,246,0.4)',
              }}
            >
              {saving ? 'Saving to DB…' : 'Allocate Bed'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ─── Discharge Modal ────────────────────────────────────────────────────── */
function DischargeModal({
  bed,
  onClose,
  onSuccess,
}: {
  bed: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('recovered');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed.patient?.id) {
      setErr('No patient ID found on this bed.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      await api.patients.discharge(bed.patient.id);
      setDone(true);
      onSuccess();
      setTimeout(onClose, 1400);
    } catch (e: any) {
      setErr(e.message || 'Failed to discharge');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%',
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
  } as React.CSSProperties;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Discharge Patient</p>
            <p className="text-[11px]" style={{ color: MUTED }}>
              {bed.patient?.name} · {bed.wardName} BED {String(bed.bedNum).padStart(2, '0')}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" style={{ color: MUTED }} />
        </button>
      </div>

      {done ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <p className="text-sm font-semibold text-white">Patient Discharged!</p>
          <p className="text-xs" style={{ color: MUTED }}>
            Removed from MySQL. Bed is now available.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400"
              style={{
                backgroundColor: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {err}
            </div>
          )}
          {/* Patient info summary */}
          <div
            className="rounded-xl p-3 border"
            style={{ backgroundColor: SURFACE, borderColor: BORDER }}
          >
            <p className="text-xs font-semibold text-white">
              {bed.patient?.name ?? 'Unknown Patient'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>
              {bed.patient?.diagnosis ?? '—'}
            </p>
            <div className="flex gap-3 mt-2 text-[11px] font-mono" style={{ color: MUTED }}>
              <span>
                NEWS2: <span className="text-white font-bold">{bed.patient?.news2 ?? '—'}</span>
              </span>
              <span>
                HR: <span className="text-white font-bold">{bed.patient?.vitals?.hr ?? '—'}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Discharge Reason
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ ...inp, appearance: 'none', paddingRight: 32 }}
              >
                <option value="recovered">Recovered / Treatment Complete</option>
                <option value="transferred">Transferred to Another Ward</option>
                <option value="home">Discharged Home</option>
                <option value="deceased">Deceased</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: MUTED }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Discharge summary notes…"
              style={{ ...inp, resize: 'none' }}
            />
          </div>

          <div className="pt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: MUTED,
                border: `1px solid ${BORDER}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: saving ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.85)',
                color: '#fff',
                border: '1px solid rgba(239,68,68,0.35)',
              }}
            >
              {saving ? 'Deleting from DB…' : 'Confirm Discharge'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function BedManagementPage() {
  const [wardFilter, setWardFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wards, setWards] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocateBed, setAllocateBed] = useState<any>(null);
  const [dischargeBed, setDischargeBed] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [w, p, b] = await Promise.all([
        api.wards.list(),
        api.patients.list(),
        fetch('/api/beds')
          .then((r) => r.json())
          .then((d) => d.beds || []),
      ]);
      setWards(w);
      setPatients(p);
      setBeds(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  // Build bed list from actual DB beds, enriched with patient data
  const allBeds =
    beds.length > 0
      ? beds.map((bed: any) => {
          const ward = wards.find((w: any) => w.id === bed.ward_id);
          const patient = patients.find((p: any) => p.bedId === bed.id);
          const bedStatus: BedStatus =
            bed.status === 'maintenance'
              ? 'maintenance'
              : bed.status === 'available'
                ? 'available'
                : getBedStatus(patient?.status);
          return {
            wardId: bed.ward_id,
            wardName: ward?.name ?? bed.ward_id,
            bedId: bed.id,
            bedNum: bed.number,
            patient,
            status: bedStatus,
          };
        })
      : // Fallback: generate from wards+patients if beds API not available
        wards.flatMap((ward) =>
          Array.from({ length: ward.totalBeds }, (_, i) => {
            const wardPats = patients.filter((p) => p.wardId === ward.id);
            const patient = i < wardPats.length ? wardPats[i] : undefined;
            const status: BedStatus =
              i < ward.occupiedBeds
                ? getBedStatus(
                    patient?.status ?? (i < ward.criticalPatients ? 'critical' : 'stable')
                  )
                : 'available';
            return {
              wardId: ward.id,
              wardName: ward.name,
              bedId: `bed-${ward.id}-${i + 1}`,
              bedNum: i + 1,
              patient,
              status,
            };
          })
        );

  const filteredBeds = allBeds.filter((b) => {
    if (wardFilter !== 'all' && b.wardId !== wardFilter) return false;
    if (statusFilter === 'available' && b.status !== 'available') return false;
    if (statusFilter === 'critical' && b.status !== 'occupied_critical') return false;
    if (statusFilter === 'occupied' && b.status === 'available') return false;
    return true;
  });

  const stats = {
    total: allBeds.length,
    occupied: allBeds.filter((b) => b.status !== 'available').length,
    available: allBeds.filter((b) => b.status === 'available').length,
    critical: allBeds.filter((b) => b.status === 'occupied_critical').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-pulse h-8 w-32 bg-white/10 rounded-lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto scrollbar-thin">
        <div className="px-6 py-5 max-w-screen-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Bed Management</h1>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                {stats.total} beds across {wards.length} wards · real-time occupancy
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-allocate-bed"
                onClick={() => {
                  const first = allBeds.find((b) => b.status === 'available');
                  if (first) setAllocateBed(first);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  color: '#60A5FA',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.15)';
                }}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Allocate Bed
              </button>

              <button
                id="btn-discharge-patient"
                onClick={() => {
                  const first = allBeds.find((b) => b.status !== 'available' && b.patient);
                  if (first) setDischargeBed(first);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.22)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.12)';
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Discharge Patient
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Total Beds',
                value: stats.total,
                icon: BedDouble,
                color: '#60A5FA',
                bg: 'rgba(59,130,246,0.10)',
                border: 'rgba(59,130,246,0.20)',
              },
              {
                label: 'Occupied',
                value: stats.occupied,
                icon: Users,
                color: '#fbbf24',
                bg: 'rgba(245,158,11,0.10)',
                border: 'rgba(245,158,11,0.20)',
              },
              {
                label: 'Available',
                value: stats.available,
                icon: CheckCircle2,
                color: '#34d399',
                bg: 'rgba(16,185,129,0.10)',
                border: 'rgba(16,185,129,0.20)',
              },
              {
                label: 'Critical Beds',
                value: stats.critical,
                icon: AlertTriangle,
                color: '#f87171',
                bg: 'rgba(239,68,68,0.10)',
                border: 'rgba(239,68,68,0.20)',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-4 p-4 rounded-2xl border"
                  style={{ backgroundColor: CARD, borderColor: BORDER }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
                    <p className="text-xs" style={{ color: MUTED }}>
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4" style={{ color: MUTED }} />
            <div
              className="flex items-center gap-1 rounded-xl p-1 border"
              style={{ backgroundColor: CARD, borderColor: BORDER }}
            >
              {['all', 'available', 'occupied', 'critical'].map((f) => {
                const active = statusFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      backgroundColor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                      color: active ? '#60A5FA' : MUTED,
                      border: active ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                    }}
                  >
                    {f === 'all' ? 'All Beds' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                );
              })}
            </div>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="text-xs rounded-xl px-3 py-2 outline-none"
              style={{
                backgroundColor: CARD,
                border: `1px solid ${BORDER}`,
                color: 'hsl(210,30%,94%)',
              }}
            >
              <option value="all">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ward sections */}
          {wards
            .filter((w) => wardFilter === 'all' || w.id === wardFilter)
            .map((ward) => {
              const wardBeds = filteredBeds.filter((b) => b.wardId === ward.id);
              if (wardBeds.length === 0) return null;
              const pct = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);

              return (
                <div
                  key={ward.id}
                  className="rounded-2xl border overflow-hidden"
                  style={{ backgroundColor: CARD, borderColor: BORDER }}
                >
                  {/* Ward header */}
                  <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ backgroundColor: SURFACE, borderColor: BORDER }}
                  >
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4" style={{ color: MUTED }} />
                      <h2 className="text-sm font-bold text-white">{ward.name}</h2>
                      {ward.criticalPatients > 0 && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-red-400"
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.25)',
                          }}
                        >
                          {ward.criticalPatients} CRITICAL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white">
                        {ward.occupiedBeds}/{ward.totalBeds} beds
                      </span>
                      <div
                        className="w-32 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              pct >= 90 ? '#EF4444' : pct >= 75 ? '#F59E0B' : '#10B981',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono" style={{ color: MUTED }}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Bed grid */}
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {wardBeds.map((bed) => {
                      const style = bedColor[bed.status];
                      const isOccupied = bed.status !== 'available';

                      return (
                        <div
                          key={`${bed.wardId}-${bed.bedNum}`}
                          className="rounded-xl p-3 border transition-all duration-150 group"
                          style={{
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (isOccupied) setDischargeBed(bed);
                            else setAllocateBed(bed);
                          }}
                          title={isOccupied ? 'Click to discharge' : 'Click to allocate'}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold font-mono text-white">
                              BED {String(bed.bedNum).padStart(2, '0')}
                            </span>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: style.border }}
                            />
                          </div>

                          {isOccupied && bed.patient ? (
                            <>
                              <p className="text-xs font-semibold text-white leading-tight truncate">
                                {bed.patient.name}
                              </p>
                              <p className="text-[10px] mt-0.5 truncate" style={{ color: MUTED }}>
                                {bed.patient.diagnosis}
                              </p>
                              <div className="mt-2">
                                <PatientStatusBadge status={bed.patient.status} />
                              </div>
                              <div
                                className="flex items-center justify-between mt-2 text-[10px] font-mono"
                                style={{ color: MUTED }}
                              >
                                <span>
                                  NEWS2:{' '}
                                  <span className="text-white font-bold">{bed.patient.news2}</span>
                                </span>
                                <span>
                                  HR:{' '}
                                  <span className="text-white font-bold">
                                    {bed.patient.vitals.hr}
                                  </span>
                                </span>
                              </div>
                              {/* Discharge hint */}
                              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
                                  <LogOut className="w-3 h-3" /> Discharge
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-3">
                              <BedDouble className="w-5 h-5 mb-1" style={{ color: style.border }} />
                              <p
                                className="text-[10px] font-semibold"
                                style={{ color: style.border }}
                              >
                                {style.label}
                              </p>
                              {/* Allocate hint */}
                              <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-semibold text-blue-400 flex items-center gap-1">
                                  <UserPlus className="w-3 h-3" /> Allocate
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Legend */}
          <div className="flex items-center gap-6 pb-2">
            {Object.entries(bedColor)
              .filter(([k]) => k !== 'maintenance')
              .map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: MUTED }}
                >
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: val.border }} />
                  {val.label}
                </div>
              ))}
            <span className="text-[11px] ml-auto" style={{ color: MUTED }}>
              Click any bed card to allocate or discharge
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {allocateBed && (
        <AllocateModal
          bed={allocateBed}
          wards={wards}
          onClose={() => setAllocateBed(null)}
          onSuccess={fetchData}
        />
      )}
      {dischargeBed && (
        <DischargeModal
          bed={dischargeBed}
          onClose={() => setDischargeBed(null)}
          onSuccess={fetchData}
        />
      )}
    </AppLayout>
  );
}
