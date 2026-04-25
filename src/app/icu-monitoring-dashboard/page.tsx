'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KPIBentoGrid from './components/KPIBentoGrid';
import PatientVitalsGrid from './components/PatientVitalsGrid';
import DashboardCharts from './components/DashboardCharts';
import LiveAlertSidebar from './components/LiveAlertSidebar';
import { RefreshCw } from 'lucide-react';

const MUTED = 'hsl(215,18%,55%)';

function LiveClock() {
  const [time, setTime] = React.useState(() => new Date().toLocaleTimeString('en-GB'));
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-blue-400 tabular-nums">{time}</span>;
}

export default function ICUMonitoringDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          <div className="px-6 py-5 space-y-5 max-w-screen-2xl mx-auto">

            {selectedPatientId ? (
              <div>
                <DashboardCharts
                  patientId={selectedPatientId}
                  onBack={() => setSelectedPatientId(null)}
                />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Page header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">ICU Monitoring Dashboard</h1>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                      Real-time patient vitals across 5 wards · 40 beds monitored
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
                    <RefreshCw className="w-3 h-3" />
                    <span>Last sync:</span>
                    <LiveClock />
                  </div>
                </div>

                <KPIBentoGrid />
                <PatientVitalsGrid onSelectPatient={setSelectedPatientId} />
              </div>
            )}

          </div>
        </div>

        {/* Live alert sidebar */}
        <LiveAlertSidebar />
      </div>
    </AppLayout>
  );
}