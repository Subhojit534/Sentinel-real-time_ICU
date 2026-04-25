'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { VitalReading } from '@/lib/types';

interface Props {
  trend: VitalReading[];
  metric: string;
}

function getDataKey(metric: string): keyof VitalReading {
  const m = metric.toLowerCase();
  if (m.includes('hr') || m.includes('heart')) return 'hr';
  if (m.includes('spo2') || m.includes('oxygen')) return 'spo2';
  if (m.includes('sbp') || m.includes('systolic') || m.includes('bp')) return 'sbp';
  if (m.includes('map')) return 'map';
  if (m.includes('temp')) return 'temp';
  if (m.includes('rr') || m.includes('resp')) return 'rr';
  return 'hr';
}

function getThreshold(key: keyof VitalReading): { low?: number; high?: number } {
  const thresholds: Partial<Record<keyof VitalReading, { low?: number; high?: number }>> = {
    hr: { low: 50, high: 110 },
    spo2: { low: 94 },
    sbp: { low: 90, high: 160 },
    map: { low: 70, high: 100 },
    temp: { low: 36.1, high: 38.5 },
    rr: { low: 10, high: 25 },
  };
  return thresholds[key] ?? {};
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function MiniTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(222,47%,8%)] border border-border rounded px-2 py-1 shadow-xl">
      <p className="text-[10px] font-mono text-muted-foreground">{label}</p>
      <p className="text-xs font-bold font-mono text-foreground tabular-nums">{payload[0].value}</p>
    </div>
  );
}

export default function AlertVitalsMiniChart({ trend, metric }: Props) {
  const dataKey = getDataKey(metric);
  const threshold = getThreshold(dataKey);
  const recentTrend = trend.slice(-12);

  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={recentTrend} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
        <XAxis
          dataKey="time"
          tick={{ fill: 'hsl(215,20%,45%)', fontSize: 9, fontFamily: 'monospace' }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fill: 'hsl(215,20%,45%)', fontSize: 9, fontFamily: 'monospace' }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip content={<MiniTooltip />} />
        {threshold.high !== undefined && (
          <ReferenceLine y={threshold.high} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
        )}
        {threshold.low !== undefined && (
          <ReferenceLine y={threshold.low} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
        )}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#06b6d4"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: '#06b6d4' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}