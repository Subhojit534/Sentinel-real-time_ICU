import React from 'react';
import type { PatientStatus, AlertSeverity, AlertStatus } from '@/lib/types';

/* ─── Patient Status ─────────────────────────────────────────────── */
interface PatientStatusBadgeProps {
  status: PatientStatus;
  className?: string;
}
export function PatientStatusBadge({ status, className = '' }: PatientStatusBadgeProps) {
  const cfg: Record<PatientStatus, { label: string; bg: string; color: string; border: string }> = {
    stable:   { label: 'Stable',   bg: 'rgba(16,185,129,0.10)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    watch:    { label: 'Watch',    bg: 'rgba(59,130,246,0.10)',  color: '#60A5FA', border: 'rgba(59,130,246,0.25)' },
    warning:  { label: 'Warning',  bg: 'rgba(245,158,11,0.10)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    critical: { label: 'Critical', bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.30)' },
    code:     { label: 'CODE',     bg: '#DC2626',                color: 'white',   border: '#EF4444' },
  };
  const { label, bg, color, border } = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${status === 'code' ? 'animate-blink' : ''} ${className}`}
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      {status === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />}
      {label}
    </span>
  );
}

/* ─── Alert Severity ─────────────────────────────────────────────── */
interface AlertSeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}
export function AlertSeverityBadge({ severity, className = '' }: AlertSeverityBadgeProps) {
  const cfg: Record<AlertSeverity, { label: string; bg: string; color: string; border: string }> = {
    low:      { label: 'Low',      bg: 'rgba(100,116,139,0.10)', color: '#94A3B8', border: 'rgba(100,116,139,0.20)' },
    moderate: { label: 'Moderate', bg: 'rgba(245,158,11,0.10)',  color: '#fbbf24', border: 'rgba(245,158,11,0.20)' },
    high:     { label: 'High',     bg: 'rgba(249,115,22,0.10)',  color: '#fb923c', border: 'rgba(249,115,22,0.20)' },
    critical: { label: 'Critical', bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  };
  const { label, bg, color, border } = cfg[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${className}`}
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  );
}

/* ─── Alert Status ───────────────────────────────────────────────── */
interface AlertStatusBadgeProps {
  status: AlertStatus;
  className?: string;
}
export function AlertStatusBadge({ status, className = '' }: AlertStatusBadgeProps) {
  const cfg: Record<AlertStatus, { label: string; bg: string; color: string; border: string }> = {
    active:       { label: 'Active',       bg: 'rgba(239,68,68,0.10)',  color: '#f87171', border: 'rgba(239,68,68,0.20)' },
    acknowledged: { label: 'Acknowledged', bg: 'rgba(245,158,11,0.10)', color: '#fbbf24', border: 'rgba(245,158,11,0.20)' },
    escalated:    { label: 'Escalated',    bg: 'rgba(139,92,246,0.10)', color: '#a78bfa', border: 'rgba(139,92,246,0.20)' },
    resolved:     { label: 'Resolved',     bg: 'rgba(16,185,129,0.10)', color: '#34d399', border: 'rgba(16,185,129,0.20)' },
  };
  const { label, bg, color, border } = cfg[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${className}`}
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  );
}