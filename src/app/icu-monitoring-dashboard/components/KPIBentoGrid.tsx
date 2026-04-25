'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  AlertTriangle, HeartPulse, Droplets,
  BedDouble, Activity, Brain,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

export default function KPIBentoGrid() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const kpis = await api.dashboard.kpis();
        setData(kpis);
      } catch (err) {
        console.error('Failed to load KPIs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
    const interval = setInterval(fetchKPIs, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return <div className="animate-pulse h-24 bg-white/5 rounded-2xl w-full"></div>;
  }

  const KPI_DATA = [
    {
      id: 'kpi-critical',
      label: 'Critical Patients',
      value: data.criticalPatients.toString(),
      sub: 'Require immediate intervention',
      icon: AlertTriangle,
      trend: 'Live', trendDir: 'flat', trendBad: true,
      leftBorder: '4px solid #EF4444', valueCls: 'text-red-400',
      iconBg: 'rgba(239,68,68,0.10)', iconColor: '#EF4444', cardBg: 'rgba(239,68,68,0.05)',
    },
    {
      id: 'kpi-alerts',
      label: 'Active Alerts',
      value: data.activeAlerts.toString(),
      sub: `${data.unacknowledgedAlerts} unacknowledged`,
      icon: HeartPulse,
      trend: 'Live', trendDir: 'flat', trendBad: true,
      leftBorder: '4px solid #F97316', valueCls: 'text-orange-400',
      iconBg: 'rgba(249,115,22,0.10)', iconColor: '#F97316', cardBg: 'rgba(249,115,22,0.05)',
    },
    {
      id: 'kpi-spo2',
      label: 'Avg SpO₂',
      value: `${data.avgSpo2}%`,
      sub: `${data.lowSpo2Count} patients below threshold`,
      icon: Droplets,
      trend: 'Live', trendDir: 'flat', trendBad: data.lowSpo2Count > 0,
      leftBorder: '4px solid transparent', valueCls: 'text-white',
      iconBg: 'rgba(59,130,246,0.10)', iconColor: '#60A5FA', cardBg: 'transparent',
    },
    {
      id: 'kpi-beds',
      label: 'Bed Occupancy',
      value: `${data.bedOccupancyPct}%`,
      sub: `${data.occupiedBeds} of ${data.totalBeds} beds occupied`,
      icon: BedDouble,
      trend: 'Live', trendDir: 'flat', trendBad: false,
      leftBorder: '4px solid transparent', valueCls: 'text-white',
      iconBg: 'rgba(148,163,184,0.10)', iconColor: '#94A3B8', cardBg: 'transparent',
    },
    {
      id: 'kpi-map',
      label: 'Avg MAP',
      value: `${data.avgMap} mmHg`,
      sub: `${data.hypotensiveCount} patient hypotensive`,
      icon: Activity,
      trend: 'Live', trendDir: 'flat', trendBad: false,
      leftBorder: '4px solid transparent', valueCls: 'text-white',
      iconBg: 'rgba(16,185,129,0.10)', iconColor: '#10B981', cardBg: 'transparent',
    },
    {
      id: 'kpi-ai',
      label: 'AI Watch List',
      value: data.highAiRiskCount.toString(),
      sub: 'Deterioration risk >50%',
      icon: Brain,
      trend: 'Live', trendDir: 'flat', trendBad: false,
      leftBorder: '4px solid transparent', valueCls: 'text-violet-400',
      iconBg: 'rgba(139,92,246,0.10)', iconColor: '#8B5CF6', cardBg: 'rgba(139,92,246,0.05)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {KPI_DATA.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon =
          kpi.trendDir === 'up' ? TrendingUp :
          kpi.trendDir === 'down' ? TrendingDown : Minus;
        const trendColor = kpi.trendBad ? '#f87171' : kpi.trendDir === 'up' ? '#34d399' : 'hsl(215,18%,55%)';

        return (
          <div
            key={kpi.id}
            className="relative flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-150"
            style={{
              backgroundColor: `hsl(222,22%,11%)`,
              background: kpi.cardBg !== 'transparent'
                ? `linear-gradient(135deg, ${kpi.cardBg}, hsl(222,22%,11%))`
                : 'hsl(222,22%,11%)',
              borderColor: 'hsl(220,18%,18%)',
              borderLeft: kpi.leftBorder,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: kpi.iconBg, borderColor: kpi.iconBg }}>
                <Icon className="w-4 h-4" style={{ color: kpi.iconColor }} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium font-mono"
                style={{ color: trendColor }}>
                <TrendIcon className="w-3 h-3" />
                <span>{kpi.trend}</span>
              </div>
            </div>

            <div>
              <p className={`text-3xl font-bold tabular-nums leading-none ${kpi.valueCls}`}>
                {kpi.value}
              </p>
              <p className="text-xs font-semibold text-white mt-1.5 leading-tight">
                {kpi.label}
              </p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'hsl(215,18%,55%)' }}>
                {kpi.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}