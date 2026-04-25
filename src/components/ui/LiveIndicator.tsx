'use client';
import React, { useState, useEffect } from 'react';

interface LiveIndicatorProps {
  className?: string;
}

export default function LiveIndicator({ className = '' }: LiveIndicatorProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-xs font-mono text-green-400 tracking-wider">LIVE</span>
      {time && <span className="text-xs font-mono text-slate-500">{time}</span>}
    </div>
  );
}