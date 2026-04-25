'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import SimulationProvider from '@/providers/SimulationProvider';

const LOGIN_PATHS = ['/sign-up-login-screen'];

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = LOGIN_PATHS.some((p) => pathname?.startsWith(p));

  if (isAuthPage) {
    // On auth pages: no simulation, no toast notifications
    return <>{children}</>;
  }

  return (
    <SimulationProvider>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(222,22%,11%)',
            border: '1px solid hsl(220,18%,18%)',
            color: 'hsl(210,30%,94%)',
          },
        }}
      />
    </SimulationProvider>
  );
}
