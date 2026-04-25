'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  BellRing,
  BedDouble,
  Activity,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { getSession, clearSession, getInitials } from '@/lib/session';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
  group: string;
  exactMatch?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'nav-dashboard',
    label: 'ICU Dashboard',
    href: '/icu-monitoring-dashboard',
    icon: LayoutDashboard,
    group: 'monitor',
    exactMatch: true,
  },
  {
    key: 'nav-alerts',
    label: 'Alert Panel',
    href: '/alert-management-panel',
    icon: BellRing,
    badge: 5,
    group: 'monitor',
    exactMatch: true,
  },
  {
    key: 'nav-beds',
    label: 'Bed Management',
    href: '/bed-management',
    icon: BedDouble,
    group: 'monitor',
    exactMatch: true,
  },
  {
    key: 'nav-vitals',
    label: 'Vitals History',
    href: '/vitals-history',
    icon: Activity,
    group: 'clinical',
    exactMatch: true,
  },
  {
    key: 'nav-patients',
    label: 'Patients',
    href: '/patients',
    icon: Users,
    group: 'clinical',
    exactMatch: true,
  },
  {
    key: 'nav-settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    group: 'system',
    exactMatch: true,
  },
];

const GROUPS = [
  { key: 'group-monitor', id: 'monitor', label: 'Monitoring' },
  { key: 'group-clinical', id: 'clinical', label: 'Clinical' },
  { key: 'group-system', id: 'system', label: 'System' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [activeKey, setActiveKey] = useState<string>(() => {
    if (pathname.startsWith('/alert-management-panel')) return 'nav-alerts';
    if (pathname.startsWith('/bed-management')) return 'nav-beds';
    if (pathname.startsWith('/vitals-history')) return 'nav-vitals';
    if (pathname.startsWith('/patients')) return 'nav-patients';
    if (pathname.startsWith('/settings')) return 'nav-settings';
    return 'nav-dashboard';
  });
  const [user, setUser] = useState({ name: 'Loading...', role: 'doctor', wardId: 'ward-icu-a' });

  useEffect(() => {
    const s = getSession();
    if (s) setUser({ name: s.name, role: s.role, wardId: s.wardId || 'ward-icu-a' });
  }, []);

  const handleNavClick = (key: string) => {
    setActiveKey(key);
  };

  return (
    <aside
      style={{ backgroundColor: 'hsl(220,20%,8%)', borderRight: '1px solid hsl(220,18%,18%)' }}
      className="flex flex-col w-60 h-screen flex-shrink-0"
    >
      {/* Brand */}
      <div
        style={{ borderBottom: '1px solid hsl(220,18%,18%)' }}
        className="flex items-center gap-3 h-16 px-5 flex-shrink-0"
      >
        <AppLogo size={28} />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight leading-none">
            ProjectSentinel
          </span>
          <span
            className="text-[10px] tracking-widest uppercase mt-0.5 font-mono"
            style={{ color: 'hsl(215,18%,55%)' }}
          >
            ICU Monitor
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
        {GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group.id);
          return (
            <div key={group.key} className="mb-6">
              <p
                className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-1.5 font-mono"
                style={{ color: 'hsl(215,15%,38%)' }}
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  // Only the item we explicitly clicked (or matches pathname) is active
                  const isActive =
                    activeKey === item.key ||
                    (item.exactMatch &&
                      pathname === item.href &&
                      activeKey !== 'nav-alerts' &&
                      item.key === 'nav-dashboard') ||
                    (item.exactMatch && pathname === item.href && item.key === 'nav-alerts');

                  // More precise: use activeKey as the source of truth
                  const active = activeKey === item.key;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => handleNavClick(item.key)}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                      style={{
                        borderLeft: active ? '2px solid hsl(217,91%,60%)' : '2px solid transparent',
                        paddingLeft: '10px',
                        backgroundColor: active ? 'rgba(59,130,246,0.10)' : 'transparent',
                        color: active ? 'hsl(217,91%,60%)' : 'hsl(215,18%,55%)',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.backgroundColor =
                            'rgba(255,255,255,0.05)';
                          (e.currentTarget as HTMLElement).style.color = 'hsl(210,30%,94%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'hsl(215,18%,55%)';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid hsl(220,18%,18%)' }} className="p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}
            >
              <span className="text-xs font-bold" style={{ color: 'hsl(217,91%,60%)' }}>
                {getInitials(user.name)}
              </span>
            </div>
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full"
              style={{ border: '2px solid hsl(220,20%,8%)' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] truncate" style={{ color: 'hsl(215,18%,55%)' }}>
              {user.wardId.replace('ward-icu-', 'ICU ').toUpperCase()} ·{' '}
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            clearSession();
            window.location.href = '/sign-up-login-screen';
          }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-all duration-150 text-xs"
          style={{ color: 'hsl(215,18%,55%)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#f87171';
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'hsl(215,18%,55%)';
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
