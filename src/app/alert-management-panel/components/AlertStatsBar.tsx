import React from 'react';
import type { Alert } from '@/lib/types';
import { AlertTriangle, CheckCircle2, Clock, ArrowUpCircle } from 'lucide-react';

const BORDER = 'hsl(220,18%,18%)';
const MUTED = 'hsl(215,18%,55%)';

interface AlertStatsBarProps {
  alerts: Alert[];
}

export default function AlertStatsBar({ alerts }: AlertStatsBarProps) {
  const active = alerts.filter((a) => a.status === 'active').length;
  const acknowledged = alerts.filter((a) => a.status === 'acknowledged').length;
  const escalated = alerts.filter((a) => a.status === 'escalated').length;
  const resolved = alerts.filter((a) => a.status === 'resolved').length;
  const critical = alerts.filter((a) => a.severity === 'critical').length;

  const stats = [
    {
      key: 'stat-active',
      label: 'Active',
      value: active,
      icon: AlertTriangle,
      color: '#f87171',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
    },
    {
      key: 'stat-escalated',
      label: 'Escalated',
      value: escalated,
      icon: ArrowUpCircle,
      color: '#a78bfa',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
    },
    {
      key: 'stat-acknowledged',
      label: 'Acknowledged',
      value: acknowledged,
      icon: Clock,
      color: '#fbbf24',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
    },
    {
      key: 'stat-resolved',
      label: 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: '#34d399',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
    },
    {
      key: 'stat-critical',
      label: 'Critical Severity',
      value: critical,
      icon: AlertTriangle,
      color: '#fca5a5',
      bg: 'rgba(239,68,68,0.10)',
      border: 'rgba(239,68,68,0.25)',
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
            <span
              className="text-xl font-bold tabular-nums font-mono leading-none"
              style={{ color: s.color }}
            >
              {s.value}
            </span>
            <span className="text-xs font-medium" style={{ color: MUTED }}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
