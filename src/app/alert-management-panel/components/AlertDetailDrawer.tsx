'use client';
import React, { useState } from 'react';
import type { Alert, AlertStatus } from '@/lib/types';
import { AlertSeverityBadge, AlertStatusBadge } from '@/components/ui/StatusBadge';
import NEWS2Badge from '@/components/ui/NEWS2Badge';
import {
  X,
  Brain,
  User,
  CheckCheck,
  ArrowUpCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import AlertVitalsMiniChart from './AlertVitalsMiniChart';
import { MOCK_PATIENTS } from '@/lib/mockData';

const CARD = 'hsl(222,22%,11%)';
const BORDER = 'hsl(220,18%,18%)';
const SURFACE = 'hsl(220,20%,8%)';
const MUTED = 'hsl(215,18%,55%)';

interface Props {
  alert: Alert;
  onClose: () => void;
  onStatusChange: (alertId: string, status: AlertStatus) => void;
}

const ESCALATION_STEPS = [
  { level: 0, label: 'Alert Generated', color: '#64748B' },
  { level: 1, label: 'Nurse Notified', color: '#3B82F6' },
  { level: 2, label: 'Attending Physician', color: '#F59E0B' },
  { level: 3, label: 'Senior Registrar', color: '#F97316' },
  { level: 4, label: 'ICU Consultant', color: '#EF4444' },
];

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000 / 60);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-3 font-mono"
        style={{ color: MUTED }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export default function AlertDetailDrawer({ alert, onClose, onStatusChange }: Props) {
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const patient = MOCK_PATIENTS.find((p) => p.id === alert.patientId);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    toast.success('Note added to alert record');
    setNoteText('');
    setShowNoteInput(false);
  };

  const isCritical = alert.severity === 'critical';

  return (
    <aside
      className="w-96 flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: SURFACE, borderLeft: `1px solid ${BORDER}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div>
          <p className="text-[10px] font-mono tracking-wider" style={{ color: MUTED }}>
            {alert.id.toUpperCase()}
          </p>
          <h3 className="text-sm font-bold text-white mt-0.5">{alert.type}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:text-white"
          style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: MUTED }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Patient */}
        <Section title="Patient">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{
                backgroundColor: isCritical ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.10)',
                color: isCritical ? '#fca5a5' : '#60A5FA',
                border: `1px solid ${isCritical ? 'rgba(239,68,68,0.20)' : 'rgba(59,130,246,0.20)'}`,
              }}
            >
              {alert.patientName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{alert.patientName}</p>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: MUTED }}>
                {alert.bedId.toUpperCase()} · {alert.wardName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <AlertSeverityBadge severity={alert.severity} />
            <AlertStatusBadge status={alert.status} />
            <NEWS2Badge score={alert.news2} />
            {alert.aiGenerated && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  backgroundColor: 'rgba(139,92,246,0.10)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.20)',
                }}
              >
                <Brain className="w-3 h-3" />
                AI Generated
              </span>
            )}
          </div>
        </Section>

        {/* Trigger detail */}
        <Section title="Trigger Detail">
          <div
            className="rounded-xl p-3.5"
            style={{
              border: `1px solid ${isCritical ? 'rgba(239,68,68,0.20)' : 'rgba(245,158,11,0.15)'}`,
              backgroundColor: isCritical ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: MUTED }}>
                {alert.triggerMetric}
              </p>
              <p
                className="text-2xl font-bold font-mono tabular-nums"
                style={{ color: isCritical ? '#f87171' : '#fbbf24' }}
              >
                {alert.triggerValue}
              </p>
            </div>
            <div className="flex items-center justify-between text-[10px]" style={{ color: MUTED }}>
              <span>
                Normal range: <span className="text-white font-mono">{alert.normalRange}</span>
              </span>
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400">Out of range</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Vitals mini chart */}
        {patient && (
          <Section title="Vitals Context — 24h">
            <AlertVitalsMiniChart trend={patient.trend} metric={alert.triggerMetric} />
          </Section>
        )}

        {/* Clinical notes */}
        {alert.notes && (
          <Section title="Clinical Notes (SBAR)">
            <div
              className="rounded-xl p-3.5"
              style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
            >
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
                {alert.notes}
              </p>
            </div>
          </Section>
        )}

        {/* Escalation chain */}
        <Section title="Escalation Chain">
          <div className="space-y-2">
            {ESCALATION_STEPS.map((step, i) => {
              const isReached = step.level <= alert.escalationLevel;
              const isCurrent = step.level === alert.escalationLevel;
              return (
                <div key={`esc-${step.level}`} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all"
                      style={{
                        backgroundColor: isReached ? step.color : 'transparent',
                        color: isReached ? 'white' : MUTED,
                        border: isReached ? 'none' : `1px solid ${BORDER}`,
                        outline: isCurrent ? `2px solid rgba(59,130,246,0.4)` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {step.level}
                    </div>
                    {i < ESCALATION_STEPS.length - 1 && (
                      <div
                        className="w-0.5 h-4 mt-1"
                        style={{ backgroundColor: isReached ? step.color : BORDER }}
                      />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className="text-xs font-medium"
                      style={{ color: isReached ? 'white' : MUTED }}
                    >
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-[10px] text-blue-400 mt-0.5">Current level</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Activity Timeline */}
        <Section title="Activity Timeline">
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-white">Alert triggered</p>
                <p className="text-[10px] font-mono" style={{ color: MUTED }}>
                  {new Date(alert.createdAt).toLocaleTimeString('en-GB')} ·{' '}
                  {timeAgo(alert.createdAt)}
                </p>
              </div>
            </div>
            {alert.acknowledgedAt && (
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">
                    Acknowledged by {alert.assignedTo}
                  </p>
                  <p className="text-[10px] font-mono" style={{ color: MUTED }}>
                    {new Date(alert.acknowledgedAt).toLocaleTimeString('en-GB')} ·{' '}
                    {timeAgo(alert.acknowledgedAt)}
                  </p>
                </div>
              </div>
            )}
            {alert.resolvedAt && (
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-white">Resolved</p>
                  <p className="text-[10px] font-mono" style={{ color: MUTED }}>
                    {new Date(alert.resolvedAt).toLocaleTimeString('en-GB')} ·{' '}
                    {timeAgo(alert.resolvedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Assignment */}
        <Section title="Assignment">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'rgba(59,130,246,0.10)',
                border: '1px solid rgba(59,130,246,0.20)',
              }}
            >
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{alert.assignedTo}</p>
              <p className="text-[10px]" style={{ color: MUTED }}>
                Primary responder · Escalation Lvl {alert.escalationLevel}
              </p>
            </div>
          </div>
        </Section>

        {/* Add note */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest font-mono"
              style={{ color: MUTED }}
            >
              Add Note
            </p>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {showNoteInput ? 'Cancel' : 'Add'}
            </button>
          </div>
          {showNoteInput && (
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter SBAR note or clinical observation..."
                rows={3}
                className="w-full text-xs text-white placeholder:text-gray-500 outline-none resize-none rounded-xl px-3 py-2.5 transition-colors"
                style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}
              />
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="w-full py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-xl"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.10)',
                  border: '1px solid rgba(59,130,246,0.20)',
                }}
              >
                Save Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="p-4 flex-shrink-0 space-y-2" style={{ borderTop: `1px solid ${BORDER}` }}>
        {alert.status === 'active' && (
          <button
            onClick={() => onStatusChange(alert.id, 'acknowledged')}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-all duration-150 active:scale-[0.99] rounded-xl"
            style={{
              backgroundColor: 'rgba(245,158,11,0.10)',
              border: '1px solid rgba(245,158,11,0.20)',
            }}
          >
            <CheckCheck className="w-4 h-4" />
            Acknowledge Alert
          </button>
        )}
        {(alert.status === 'active' || alert.status === 'acknowledged') && (
          <button
            onClick={() => onStatusChange(alert.id, 'escalated')}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-all duration-150 active:scale-[0.99] rounded-xl"
            style={{
              backgroundColor: 'rgba(139,92,246,0.10)',
              border: '1px solid rgba(139,92,246,0.20)',
            }}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Escalate to Next Level
          </button>
        )}
        {alert.status !== 'resolved' && (
          <button
            onClick={() => onStatusChange(alert.id, 'resolved')}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-all duration-150 active:scale-[0.99] rounded-xl"
            style={{
              backgroundColor: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.20)',
            }}
          >
            <XCircle className="w-4 h-4" />
            Mark Resolved
          </button>
        )}
        {alert.status === 'resolved' && (
          <div
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
            style={{
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <XCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Alert Resolved</span>
          </div>
        )}
      </div>
    </aside>
  );
}
