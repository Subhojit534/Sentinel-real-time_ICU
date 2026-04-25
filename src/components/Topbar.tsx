'use client';
import React, { useState } from 'react';
import { Bell, Search, Activity, Shield } from 'lucide-react';
import Link from 'next/link';

const WARDS = [
  { id: 'all',        label: 'All Wards' },
  { id: 'ward-icu-a', label: 'ICU Alpha' },
  { id: 'ward-icu-b', label: 'ICU Beta' },
  { id: 'ward-icu-c', label: 'ICU Gamma' },
  { id: 'ward-icu-d', label: 'Cardiac ICU' },
];

function LiveClock() {
  const [time, setTime] = React.useState(() => new Date().toLocaleTimeString('en-GB'));
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString('en-GB')), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-blue-400 tabular-nums">{time}</span>;
}

export default function Topbar() {
  const [wardFilter, setWardFilter] = useState('all');

  return (
    <header className="h-14 border-b border-[hsl(220,18%,18%)] flex items-center px-5 gap-4 flex-shrink-0"
      style={{ backgroundColor: 'hsl(220,20%,8%)' }}>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 w-64 border"
        style={{ backgroundColor: 'hsl(222,22%,11%)', borderColor: 'hsl(220,18%,18%)' }}>
        <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          id="topbar-search"
          placeholder="Search patient, bed, ward..."
          className="bg-transparent text-xs text-white placeholder:text-gray-500 outline-none w-full"
        />
        <kbd className="text-[9px] text-gray-500 px-1.5 py-0.5 rounded border border-gray-700 font-mono flex-shrink-0"
          style={{ backgroundColor: 'hsl(220,20%,8%)' }}>⌘K</kbd>
      </div>

      {/* Ward filter pills */}
      <div className="flex items-center gap-1 rounded-xl p-1 border"
        style={{ backgroundColor: 'hsl(222,22%,11%)', borderColor: 'hsl(220,18%,18%)' }}>
        {WARDS.map((w) => {
          const active = wardFilter === w.id;
          return (
            <button
              key={w.id}
              id={`ward-filter-${w.id}`}
              onClick={() => setWardFilter(w.id)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
              style={{
                backgroundColor: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: active ? 'hsl(217,91%,60%)' : 'hsl(215,18%,55%)',
                border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}
            >
              {w.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-emerald-500 font-medium">LIVE</span>
        <LiveClock />
      </div>

      {/* System status */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
        style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
        <Activity className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs text-emerald-500 font-medium">All Systems Nominal</span>
      </div>

      {/* Alerts bell */}
      <Link href="/alert-management-panel" id="topbar-alerts-bell"
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
        <Bell className="w-4 h-4 text-gray-400" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </Link>

      <div className="w-px h-5 bg-[hsl(220,18%,18%)]" />

      {/* User */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-white leading-none">Dr. Priya Sharma</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <Shield className="w-2.5 h-2.5 text-blue-400" />
            <p className="text-[10px] text-blue-400 font-medium">Doctor</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <span className="text-xs font-bold text-blue-400">PS</span>
        </div>
      </div>
    </header>
  );
}