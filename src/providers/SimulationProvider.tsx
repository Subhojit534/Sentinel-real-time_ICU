'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import type { Patient, Alert } from '@/lib/types';
import { toast } from 'sonner';

interface SimulationContextType {
  patients: Patient[];
  alerts: Alert[];
  loading: boolean;
}

const SimulationContext = createContext<SimulationContextType>({ patients: [], alerts: [], loading: true });

export const useSimulation = () => useContext(SimulationContext);

export default function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [pts, alts] = await Promise.all([
          api.patients.list(),
          api.alerts.list()
        ]);
        setPatients(pts);
        setAlerts(alts);
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel('icu_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals_current' }, (payload: any) => {
        setPatients(prev => prev.map(p => {
          if (p.id === payload.new.patient_id) {
            return { ...p, vitals: { ...p.vitals, ...payload.new } };
          }
          return p;
        }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload: any) => {
        const newAlert = payload.new as Alert;
        setAlerts(prev => [newAlert, ...prev]);
        if (newAlert.severity === 'critical') {
          toast.error(`CRITICAL ALERT: ${newAlert.type} detected for patient in ${newAlert.wardId}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Local Simulation Engine (Runs if we are in demo mode)
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(() => {
      setPatients(prev => {
        let alertsToCreate: Alert[] = [];

        const updatedPatients = prev.map(p => {
          if (!p.vitals) return p;

          // Simulate slight variations
          const newHr = p.vitals.hr + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
          const newSpo2 = Math.min(100, Math.max(80, p.vitals.spo2 + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)));
          const newSbp = p.vitals.sbp + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);

          // Calculate AI Risk Score (Threshold Rules)
          let riskScore = p.aiRiskScore;
          if (newHr > 120) riskScore = Math.min(100, riskScore + 5);
          if (newSpo2 < 90) riskScore = Math.min(100, riskScore + 8);
          if (newHr < 50) riskScore = Math.min(100, riskScore + 5);

          // Trend detection (Predictive logic)
          if (newHr > p.vitals.hr && newHr > 110) {
            riskScore = Math.min(100, riskScore + 2);
          }

          let newStatus = p.status;
          if (riskScore > 80) newStatus = 'critical';
          else if (riskScore > 50) newStatus = 'warning';
          else if (riskScore > 30) newStatus = 'watch';
          else newStatus = 'stable';

          // Generate Alerts locally for the demo
          if (newStatus === 'critical' && p.status !== 'critical') {
            const newAlert: Alert = {
              id: `alert-sim-${crypto.randomUUID()}`,
              patientId: p.id,
              patientName: p.name,
              bedId: p.bedId,
              wardId: p.wardId,
              wardName: p.wardId, // simplified
              type: 'Predictive Deterioration',
              triggerMetric: newHr > 120 ? 'HR' : 'SpO2',
              triggerValue: newHr > 120 ? `${newHr} bpm` : `${newSpo2}%`,
              normalRange: newHr > 120 ? '60-100 bpm' : '>=94%',
              news2: p.news2 + 2,
              severity: 'critical',
              status: 'active',
              createdAt: new Date().toISOString(),
              assignedTo: p.attendingPhysician,
              escalationLevel: 3,
              aiGenerated: true,
              notes: 'Patient likely to deteriorate in next 3-5 minutes based on trending vitals.'
            };
            alertsToCreate.push(newAlert);
          }

          return {
            ...p,
            status: newStatus as Patient['status'],
            aiRiskScore: riskScore,
            vitals: {
              ...p.vitals,
              hr: newHr,
              spo2: newSpo2,
              sbp: newSbp,
              updatedAt: new Date().toISOString()
            }
          };
        });

        if (alertsToCreate.length > 0) {
          setAlerts(prevAlerts => [...alertsToCreate, ...prevAlerts]);
          alertsToCreate.forEach(a => {
            toast.error(`Alert sent to doctor: ${a.patientName} (${a.triggerMetric} dropping)`, {
              description: 'Patient likely to deteriorate in next 3-5 minutes'
            });
          });
        }

        return updatedPatients;
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [loading]);

  return (
    <SimulationContext.Provider value={{ patients, alerts, loading }}>
      {children}
    </SimulationContext.Provider>
  );
}
