'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Settings, User, Bell, Shield, Globe, Moon, Monitor,
  Save, LogOut, ChevronRight, Check, Hospital, Wifi, Brain,
} from 'lucide-react';
import { getSession, clearSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
const CARD    = 'hsl(222,22%,11%)';
const BORDER  = 'hsl(220,18%,18%)';
const MUTED   = 'hsl(215,18%,55%)';
const SURFACE = 'hsl(220,20%,8%)';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center flex-shrink-0 w-10 h-5 rounded-full transition-all duration-200"
      style={{ backgroundColor: checked ? 'hsl(217,91%,60%)' : BORDER }}
    >
      <span className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? '22px' : '3px' }} />
    </button>
  );
}

const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',        icon: Shield },
  { id: 'display',       label: 'Display',         icon: Monitor },
  { id: 'system',        label: 'System',          icon: Hospital },
];


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  // Load user from session
  const [name, setName]          = useState('Loading...');
  const [email, setEmail]        = useState('');
  const [role, setRole]          = useState('doctor');
  const [specialization, setSpecialization] = useState('Intensive Care Medicine');
  const [licenseNumber, setLicenseNumber]   = useState('—');
  const [hospitalName, setHospitalName]     = useState('—');

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    setName(s.name);
    setEmail(s.email);
    setRole(s.role);

    // Fetch license number + hospital name from DB
    if (!supabase) return;
    supabase
      .from('users')
      .select('license_number, hospital_id, hospitals(name)')
      .eq('email', s.email)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.license_number) setLicenseNumber(data.license_number);
        const hosp = (data as any).hospitals;
        if (hosp?.name) setHospitalName(hosp.name);
      });
  }, []);

  // Notification settings
  const [notifs, setNotifs] = useState({
    criticalAlerts: true,
    highAlerts: true,
    moderateAlerts: false,
    lowAlerts: false,
    aiPredictions: true,
    shiftReminders: true,
    systemUpdates: false,
    emailNotifs: true,
    smsNotifs: false,
  });

  // Display settings
  const [display, setDisplay] = useState({
    compactMode: false,
    highContrast: false,
    showAIRisk: true,
    autoRefresh: true,
    refreshInterval: '30',
  });

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    backgroundColor: SURFACE,
    border: `1px solid ${BORDER}`,
    color: 'hsl(210,30%,94%)',
    borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    transition: 'border-color 150ms',
  };

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold" style={{ color: MUTED }}>{label}</label>
        {children}
      </div>
    );
  }

  function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
      <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: CARD, borderColor: BORDER }}>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {desc && <p className="text-xs mt-0.5" style={{ color: MUTED }}>{desc}</p>}
        </div>
        {children}
      </div>
    );
  }

  function NotifRow({ label, desc, k }: { label: string; desc?: string; k: keyof typeof notifs }) {
    return (
      <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {desc && <p className="text-xs mt-0.5" style={{ color: MUTED }}>{desc}</p>}
        </div>
        <ToggleSwitch checked={notifs[k]} onChange={(v) => setNotifs((n) => ({ ...n, [k]: v }))} />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto scrollbar-thin">
        <div className="px-6 py-5 max-w-4xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>Manage your account and application preferences</p>
            </div>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{
                backgroundColor: saved ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                border: saved ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(59,130,246,0.3)',
                color: saved ? '#34d399' : '#60A5FA',
              }}>
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 rounded-2xl p-1.5 border overflow-x-auto"
            style={{ backgroundColor: CARD, borderColor: BORDER }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: active ? SURFACE : 'transparent',
                    color: active ? 'white' : MUTED,
                    border: active ? `1px solid ${BORDER}` : '1px solid transparent',
                  }}>
                  <Icon className="w-4 h-4" style={{ color: active ? '#60A5FA' : MUTED }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <Section title="Personal Information" desc="Update your name, contact details, and professional info">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '2px solid rgba(59,130,246,0.3)', color: '#60A5FA' }}>
                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="text-xs mt-0.5 capitalize px-2 py-0.5 rounded-md inline-block"
                      style={{ backgroundColor: 'rgba(59,130,246,0.10)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.20)' }}>
                      {role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name">
                    <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Email">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
                  </Field>
                  <Field label="Specialization">
                    <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="License / Registration No.">
                    <input
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. MCI-2019-12345"
                      style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.04em' }}
                    />
                  </Field>
                  <Field label="Role">
                    <input value={role.charAt(0).toUpperCase() + role.slice(1)} disabled
                      style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                  </Field>
                  <Field label="Hospital">
                    <input value={hospitalName} disabled
                      style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                  </Field>
                </div>
              </Section>

              <Section title="Danger Zone" desc="Irreversible actions for your account">
                <div className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold text-red-400">Sign Out of Sentinel</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>You will need to log in again to access the dashboard</p>
                  </div>
                  <button
                    onClick={() => { clearSession(); window.location.href = '/sign-up-login-screen'; }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </Section>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <Section title="Alert Notifications" desc="Configure which alerts you receive">
                <div className="-my-2">
                  <NotifRow label="Critical Alerts" desc="Immediate notification for life-threatening events" k="criticalAlerts" />
                  <NotifRow label="High Severity Alerts" desc="Urgent clinical events requiring prompt action" k="highAlerts" />
                  <NotifRow label="Moderate Alerts" desc="Important but non-urgent clinical events" k="moderateAlerts" />
                  <NotifRow label="Low Severity Alerts" desc="Informational alerts for trend monitoring" k="lowAlerts" />
                  <NotifRow label="AI Predictions" desc="Proactive alerts from the AI deterioration model" k="aiPredictions" />
                </div>
              </Section>

              <Section title="System Notifications">
                <div className="-my-2">
                  <NotifRow label="Shift Reminders" desc="Notifications 30 minutes before shift start/end" k="shiftReminders" />
                  <NotifRow label="System Updates" desc="App updates, maintenance windows, and new features" k="systemUpdates" />
                </div>
              </Section>

              <Section title="Delivery Channels">
                <div className="-my-2">
                  <NotifRow label="Email Notifications" desc={`Sent to ${email}`} k="emailNotifs" />
                  <NotifRow label="SMS Notifications" desc={`Sent to ${phone}`} k="smsNotifs" />
                </div>
              </Section>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <Section title="Authentication" desc="Manage your login security settings">
                <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>Add an extra layer of security with 2FA</p>
                  </div>
                  <ToggleSwitch checked={twoFactor} onChange={setTwoFactor} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: MUTED }}>Session Timeout (minutes)</label>
                  <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 outline-none"
                    style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, color: 'hsl(210,30%,94%)' }}>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="120">2 hours</option>
                    <option value="480">8 hours (shift)</option>
                  </select>
                </div>
              </Section>

              <Section title="Change Password">
                <div className="space-y-3">
                  {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
                    <Field key={label} label={label}>
                      <input type="password" placeholder="••••••••" style={inputStyle} />
                    </Field>
                  ))}
                  <button onClick={handleSave}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-blue-400 transition-all hover:opacity-80"
                    style={{ backgroundColor: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.25)' }}>
                    Update Password
                  </button>
                </div>
              </Section>

              <Section title="Active Sessions" desc="Devices currently logged into your account">
                {[
                  { device: 'Chrome · Windows 11', location: 'Mumbai, India', active: true, time: 'Current session' },
                  { device: 'Safari · iPhone 15', location: 'Mumbai, India', active: false, time: '2 hours ago' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-3" style={{ borderBottom: i === 0 ? `1px solid ${BORDER}` : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.active ? '#10B981' : MUTED }} />
                      <div>
                        <p className="text-sm font-medium text-white">{s.device}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>{s.location} · {s.time}</p>
                      </div>
                    </div>
                    {!s.active && (
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                    )}
                  </div>
                ))}
              </Section>
            </div>
          )}

          {/* Display tab */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              <Section title="Interface Preferences">
                {[
                  { key: 'compactMode',   label: 'Compact Mode',       desc: 'Reduce spacing for more information density' },
                  { key: 'highContrast',  label: 'High Contrast',      desc: 'Increase contrast for better readability' },
                  { key: 'showAIRisk',    label: 'Show AI Risk Scores', desc: 'Display AI deterioration probability on patient cards' },
                  { key: 'autoRefresh',   label: 'Auto-Refresh Data',  desc: 'Automatically refresh vitals and alerts' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{desc}</p>
                    </div>
                    <ToggleSwitch
                      checked={display[key as keyof typeof display] as boolean}
                      onChange={(v) => setDisplay((d) => ({ ...d, [key]: v }))}
                    />
                  </div>
                ))}

                {display.autoRefresh && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" style={{ color: MUTED }}>Refresh Interval</label>
                    <select value={display.refreshInterval}
                      onChange={(e) => setDisplay((d) => ({ ...d, refreshInterval: e.target.value }))}
                      className="w-full text-sm rounded-xl px-3 py-2 outline-none"
                      style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, color: 'hsl(210,30%,94%)' }}>
                      <option value="10">Every 10 seconds</option>
                      <option value="30">Every 30 seconds</option>
                      <option value="60">Every 60 seconds</option>
                      <option value="300">Every 5 minutes</option>
                    </select>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* System tab */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <Section title="System Information" desc="Read-only system details and integration status">
                <div className="space-y-3">
                  {[
                    { label: 'Application Version', value: 'v2.4.1 (Build 2026.04.25)', icon: Monitor },
                    { label: 'Hospital',             value: 'City General Hospital · ID: hosp-1', icon: Hospital },
                    { label: 'Data Connection',      value: 'WebSocket connected · Latency 12ms', icon: Wifi, ok: true },
                    { label: 'AI Model Version',     value: 'Sentinel-AI v3.2 · Updated 2026-04-20', icon: Brain },
                    { label: 'Region',               value: 'Asia South (Mumbai)', icon: Globe },
                  ].map(({ label, value, icon: Icon, ok }) => (
                    <div key={label} className="flex items-center gap-3 py-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: ok ? '#10B981' : MUTED }} />
                      <div className="flex-1">
                        <p className="text-xs font-medium" style={{ color: MUTED }}>{label}</p>
                        <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                      </div>
                      {ok && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Support">
                {[
                  { label: 'Documentation',          href: '#', desc: 'User guide and technical reference' },
                  { label: 'Report a Bug',            href: '#', desc: 'Submit an issue to the engineering team' },
                  { label: 'Request a Feature',       href: '#', desc: 'Suggest improvements to the platform' },
                  { label: 'Contact ICT Support',     href: '#', desc: 'Hospital IT helpdesk — ext. 4000' },
                ].map(({ label, desc }) => (
                  <button key={label} className="w-full flex items-center justify-between py-3 hover:text-white transition-colors"
                    style={{ borderBottom: `1px solid ${BORDER}`, color: MUTED }}>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                ))}
              </Section>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
