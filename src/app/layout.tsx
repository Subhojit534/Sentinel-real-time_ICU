import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import ToasterProvider from '@/components/ToasterProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ProjectSentinel — Decentralized ICU Monitoring Platform',
  description:
    'Real-time ICU patient monitoring with AI-driven deterioration detection, multi-ward alerts, and role-based clinical dashboards for physicians and nurses.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        {children}
        <ToasterProvider />
</body>
    </html>
  );
}