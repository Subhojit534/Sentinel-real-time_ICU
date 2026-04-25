'use client';
import React, { useState, useMemo } from 'react';
import { MOCK_ALERTS } from '@/lib/mockData';
import type { Alert, AlertSeverity, AlertStatus } from '@/lib/types';
import { AlertSeverityBadge, AlertStatusBadge } from '@/components/ui/StatusBadge';
import NEWS2Badge from '@/components/ui/NEWS2Badge';
import AlertDetailDrawer from './AlertDetailDrawer';
import AlertStatsBar from './AlertStatsBar';
import {
  BellRing, Brain, Clock, ChevronUp, ChevronDown,
  Search, RefreshCw, CheckCheck, ArrowUpCircle, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const CARD    = 'hsl(222,22%,11%)';
const BORDER  = 'hsl(220,18%,18%)';
const SURFACE = 'hsl(220,20%,8%)';
const MUTED   = 'hsl(215,18%,55%)';

type SortKey = 'createdAt' | 'severity' | 'news2' | 'escalationLevel' | 'patientName';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<AlertSeverity, number> = { critical: 4, high: 3, moderate: 2, low: 1 };

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000 / 60);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const rowLeftBorder = (severity: AlertSeverity) => {
  if (severity === 'critical') return '3px solid #EF4444';
  if (severity === 'high')     return '3px solid #F97316';
  if (severity === 'moderate') return '3px solid #F59E0B';
  return '3px solid transparent';
};

export default function AlertPanel() {
  const [search,         setSearch]         = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter,   setStatusFilter]   = useState<string>('all');
  const [wardFilter,     setWardFilter]     = useState<string>('all');
  const [aiFilter,       setAiFilter]       = useState(false);
  const [sortKey,        setSortKey]        = useState<SortKey>('createdAt');
  const [sortDir,        setSortDir]        = useState<SortDir>('desc');
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [selectedAlert,  setSelectedAlert]  = useState<Alert | null>(MOCK_ALERTS[0]);
  const [alerts,         setAlerts]         = useState<Alert[]>(MOCK_ALERTS);
  const [drawerOpen,     setDrawerOpen]     = useState(true);

  const wards = Array.from(new Set(MOCK_ALERTS.map((a) => a.wardId))).map((id) => ({
    id, name: MOCK_ALERTS.find((a) => a.wardId === id)?.wardName ?? id,
  }));

  const filtered = useMemo(() => {
    let result = alerts.filter((a) => {
      const matchSearch = !search ||
        a.patientName.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.bedId.toLowerCase().includes(search.toLowerCase()) ||
        a.assignedTo.toLowerCase().includes(search.toLowerCase());
      return matchSearch &&
        (severityFilter === 'all' || a.severity === severityFilter) &&
        (statusFilter   === 'all' || a.status   === statusFilter) &&
        (wardFilter     === 'all' || a.wardId   === wardFilter) &&
        (!aiFilter || a.aiGenerated);
    });
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'createdAt')     cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === 'severity') cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      else if (sortKey === 'news2')    cmp = a.news2 - b.news2;
      else if (sortKey === 'escalationLevel') cmp = a.escalationLevel - b.escalationLevel;
      else if (sortKey === 'patientName')     cmp = a.patientName.localeCompare(b.patientName);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [alerts, search, severityFilter, statusFilter, wardFilter, aiFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((a) => a.id)));
  };
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkAcknowledge = () => {
    setAlerts((prev) => prev.map((a) =>
      selectedIds.has(a.id) && a.status === 'active'
        ? { ...a, status: 'acknowledged' as AlertStatus, acknowledgedAt: new Date().toISOString() } : a
    ));
    toast.success(`${selectedIds.size} alert${selectedIds.size > 1 ? 's' : ''} acknowledged`);
    setSelectedIds(new Set());
  };

  const bulkResolve = () => {
    setAlerts((prev) => prev.map((a) =>
      selectedIds.has(a.id)
        ? { ...a, status: 'resolved' as AlertStatus, resolvedAt: new Date().toISOString() } : a
    ));
    toast.success(`${selectedIds.size} alert${selectedIds.size > 1 ? 's' : ''} resolved`);
    setSelectedIds(new Set());
  };

  const handleStatusChange = (alertId: string, newStatus: AlertStatus) => {
    setAlerts((prev) => prev.map((a) =>
      a.id === alertId
        ? {
            ...a, status: newStatus,
            acknowledgedAt: newStatus === 'acknowledged' ? new Date().toISOString() : a.acknowledgedAt,
            resolvedAt:     newStatus === 'resolved'     ? new Date().toISOString() : a.resolvedAt,
          }
        : a
    ));
    if (selectedAlert?.id === alertId) {
      setSelectedAlert((prev) => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Alert ${newStatus}`);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'desc'
        ? <ChevronDown className="w-3 h-3 text-blue-400" />
        : <ChevronUp className="w-3 h-3 text-blue-400" />
    ) : (
      <ChevronDown className="w-3 h-3 opacity-30" style={{ color: MUTED }} />
    );

  const selectStyle = {
    backgroundColor: CARD,
    borderColor: BORDER,
    border: `1px solid ${BORDER}`,
    color: 'hsl(210,30%,94%)',
  };

  return (
    <div className="flex flex-col h-full">

      {/* Page header */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0 space-y-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Alert Management</h1>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>
              {filtered.length} alert{filtered.length !== 1 ? 's' : ''} · {alerts.filter((a) => a.status === 'active').length} active
            </p>
          </div>
          <button
            onClick={() => toast.info('Alerts refreshed')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 hover:text-white"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}`, color: MUTED }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <AlertStatsBar alerts={alerts} />

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 flex-1 min-w-[200px] max-w-xs"
            style={{ backgroundColor: CARD, border: `1px solid ${BORDER}` }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTED }} />
            <input
              id="alert-search"
              type="text"
              placeholder="Patient, alert type, bed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-white placeholder:text-gray-500 outline-none w-full"
            />
          </div>

          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none" style={selectStyle}>
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none" style={selectStyle}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          <select value={wardFilter} onChange={(e) => setWardFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none" style={selectStyle}>
            <option value="all">All Wards</option>
            {wards.map((w) => (
              <option key={`ward-opt-${w.id}`} value={w.id}>{w.name}</option>
            ))}
          </select>

          <button
            onClick={() => setAiFilter(!aiFilter)}
            id="alert-ai-filter"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
            style={{
              backgroundColor: aiFilter ? 'rgba(139,92,246,0.10)' : CARD,
              border: aiFilter ? '1px solid rgba(139,92,246,0.25)' : `1px solid ${BORDER}`,
              color: aiFilter ? '#a78bfa' : MUTED,
            }}
          >
            <Brain className="w-3.5 h-3.5" />
            AI Alerts Only
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 overflow-auto scrollbar-thin">

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 flex items-center gap-3 px-6 py-2.5"
              style={{ backgroundColor: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
              <span className="text-xs font-semibold text-blue-400">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={bulkAcknowledge}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-amber-400 hover:text-amber-300 transition-all"
                  style={{ backgroundColor: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
                  <CheckCheck className="w-3.5 h-3.5" />Acknowledge
                </button>
                <button onClick={bulkResolve}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-emerald-400 hover:text-emerald-300 transition-all"
                  style={{ backgroundColor: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)' }}>
                  <XCircle className="w-3.5 h-3.5" />Resolve
                </button>
                <button onClick={() => setSelectedIds(new Set())}
                  className="text-xs px-2 py-1 hover:text-white transition-colors" style={{ color: MUTED }}>
                  Clear
                </button>
              </div>
            </div>
          )}

          <table className="w-full text-sm border-collapse min-w-[920px]">
            <thead>
              <tr className="sticky top-0 z-10" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: SURFACE }}>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-blue-500 w-3.5 h-3.5 cursor-pointer" />
                </th>
                {[
                  { label: 'Severity', k: 'severity' as SortKey },
                  { label: 'Patient',  k: 'patientName' as SortKey },
                ].map(({ label, k }) => (
                  <th key={k} className="px-3 py-3 text-left">
                    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-colors" style={{ color: MUTED }}>
                      {label} <SortIcon k={k} />
                    </button>
                  </th>
                ))}
                {['Bed / Ward', 'Alert Type', 'Trigger'].map((label) => (
                  <th key={label} className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{label}</th>
                ))}
                <th className="px-3 py-3 text-left">
                  <button onClick={() => toggleSort('news2')} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-colors" style={{ color: MUTED }}>
                    NEWS2 <SortIcon k="news2" />
                  </button>
                </th>
                {['Status', 'Assigned To'].map((label) => (
                  <th key={label} className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{label}</th>
                ))}
                <th className="px-3 py-3 text-left">
                  <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider hover:text-white transition-colors" style={{ color: MUTED }}>
                    Time <SortIcon k="createdAt" />
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <BellRing className="w-8 h-8" style={{ color: MUTED }} />
                      <p className="text-sm font-semibold text-white">No alerts match your filters</p>
                      <p className="text-xs" style={{ color: MUTED }}>Try clearing the severity, status, or ward filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((alert, idx) => {
                  const isSelected = selectedIds.has(alert.id);
                  const isActive   = selectedAlert?.id === alert.id;
                  return (
                    <tr
                      key={alert.id}
                      onClick={() => { setSelectedAlert(alert); setDrawerOpen(true); }}
                      className="cursor-pointer transition-all duration-100"
                      style={{
                        borderBottom: `1px solid rgba(255,255,255,0.05)`,
                        borderLeft: rowLeftBorder(alert.severity),
                        paddingLeft: '17px',
                        backgroundColor: isActive
                          ? 'rgba(59,130,246,0.05)'
                          : idx % 2 === 1
                            ? 'rgba(255,255,255,0.01)'
                            : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.025)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor =
                          idx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent';
                      }}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(alert.id)} className="accent-blue-500 w-3.5 h-3.5 cursor-pointer" />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <AlertSeverityBadge severity={alert.severity} />
                          {alert.aiGenerated && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{ backgroundColor: 'rgba(139,92,246,0.10)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.20)' }}>
                              <Brain className="w-2.5 h-2.5" />AI
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-sm font-semibold text-white whitespace-nowrap">{alert.patientName}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs font-mono text-white">{alert.bedId.toUpperCase()}</p>
                        <p className="text-[10px]" style={{ color: MUTED }}>{alert.wardName}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs font-medium text-white whitespace-nowrap">{alert.type}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs font-bold font-mono tabular-nums"
                          style={{ color: alert.severity === 'critical' ? '#f87171' : alert.severity === 'high' ? '#fb923c' : '#fbbf24' }}>
                          {alert.triggerMetric}: {alert.triggerValue}
                        </p>
                        <p className="text-[10px]" style={{ color: MUTED }}>Normal: {alert.normalRange}</p>
                      </td>
                      <td className="px-3 py-3.5"><NEWS2Badge score={alert.news2} /></td>
                      <td className="px-3 py-3.5"><AlertStatusBadge status={alert.status} /></td>
                      <td className="px-3 py-3.5">
                        <p className="text-xs whitespace-nowrap" style={{ color: MUTED }}>{alert.assignedTo}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1 text-[10px] whitespace-nowrap font-mono" style={{ color: MUTED }}>
                          <Clock className="w-3 h-3" />{timeAgo(alert.createdAt)}
                        </div>
                      </td>
                      <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          {alert.status === 'active' && (
                            <button onClick={() => handleStatusChange(alert.id, 'acknowledged')} title="Acknowledge"
                              className="p-1.5 rounded-lg transition-all hover:bg-amber-500/10 hover:text-amber-400" style={{ color: MUTED }}>
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(alert.status === 'active' || alert.status === 'acknowledged') && (
                            <button onClick={() => handleStatusChange(alert.id, 'escalated')} title="Escalate"
                              className="p-1.5 rounded-lg transition-all hover:bg-violet-500/10 hover:text-violet-400" style={{ color: MUTED }}>
                              <ArrowUpCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {alert.status !== 'resolved' && (
                            <button onClick={() => handleStatusChange(alert.id, 'resolved')} title="Resolve"
                              className="p-1.5 rounded-lg transition-all hover:bg-emerald-500/10 hover:text-emerald-400" style={{ color: MUTED }}>
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Detail drawer */}
        {drawerOpen && selectedAlert && (
          <AlertDetailDrawer
            alert={selectedAlert}
            onClose={() => setDrawerOpen(false)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}