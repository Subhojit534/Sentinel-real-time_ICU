'use client';
import React, { useState, useEffect } from 'react';
import { useSimulation } from '@/providers/SimulationProvider';
import type { Alert } from '@/lib/types';
import { AlertSeverityBadge, AlertStatusBadge } from '@/components/ui/StatusBadge';
import { BellRing, ChevronRight, Brain, Clock, X } from 'lucide-react';
import Link from 'next/link';

const CARD   = 'hsl(222,22%,11%)';
const BORDER = 'hsl(220,18%,18%)';
const MUTED  = 'hsl(215,18%,55%)';
const SURFACE = 'hsl(220,20%,8%)';

function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000 / 60);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

const severityBorderColor = (severity: string) => {
  if (severity === 'critical') return '#EF4444';
  if (severity === 'high')     return '#F97316';
  if (severity === 'moderate') return '#F59E0B';
  return 'hsl(220,18%,28%)';
};

export default function LiveAlertSidebar() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { alerts: liveAlerts } = useSimulation();
  const activeAlerts = liveAlerts.filter(a => a.status === 'active' || a.status === 'escalated');

  const visible = activeAlerts.filter((a) => !dismissed.has(a.id));

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: SURFACE, borderLeft: `1px solid ${BORDER}` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2.5">
          <BellRing className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-white">Live Alerts</span>
          {visible.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {visible.length}
            </span>
          )}
        </div>
        <Link href="/alert-management-panel"
          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(16,185,129,0.10)' }}>
              <BellRing className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">No active alerts</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>All patients within normal parameters</p>
          </div>
        ) : (
          visible.map((alert) => (
            <div
              key={alert.id}
              className="mx-3 mb-2 rounded-xl overflow-hidden transition-all duration-150"
              style={{
                backgroundColor: CARD,
                border: `1px solid ${BORDER}`,
                borderLeft: `3px solid ${severityBorderColor(alert.severity)}`,
              }}
            >
              <div className="p-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <AlertSeverityBadge severity={alert.severity} />
                    {alert.aiGenerated && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ backgroundColor: 'rgba(139,92,246,0.10)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.20)' }}>
                        <Brain className="w-2.5 h-2.5" />AI
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                    className="transition-colors p-0.5 flex-shrink-0 hover:text-white"
                    style={{ color: MUTED }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs font-semibold text-white leading-tight">{alert.patientName}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: MUTED }}>
                  {alert.bedId.toUpperCase()} · {alert.wardName}
                </p>

                <div className="mt-2.5 pt-2.5 flex items-center justify-between"
                  style={{ borderTop: `1px solid ${BORDER}` }}>
                  <div>
                    <p className="text-[11px] font-semibold text-white">{alert.type}</p>
                    <p className="text-[10px] font-mono" style={{ color: MUTED }}>
                      {alert.triggerMetric}:{' '}
                      <span className="font-bold" style={{ color: alert.severity === 'critical' ? '#f87171' : '#fbbf24' }}>
                        {alert.triggerValue}
                      </span>
                    </p>
                  </div>
                  <AlertStatusBadge status={alert.status} />
                </div>

                <div className="flex items-center gap-1 text-[10px] mt-2" style={{ color: MUTED }}>
                  <Clock className="w-2.5 h-2.5" />
                  {timeAgo(alert.createdAt)} · {alert.assignedTo.split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Link
          href="/alert-management-panel"
          id="sidebar-open-alert-mgmt"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all duration-150"
          style={{
            backgroundColor: 'rgba(59,130,246,0.10)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          Open Alert Management
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}