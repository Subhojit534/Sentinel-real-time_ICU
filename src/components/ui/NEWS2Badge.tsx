import React from 'react';

interface NEWS2BadgeProps {
  score: number;
  className?: string;
}

export default function NEWS2Badge({ score, className = '' }: NEWS2BadgeProps) {
  const getConfig = (s: number) => {
    if (s >= 7)
      return {
        label: `NEWS2 ${s}`,
        classes: 'bg-red-500/20 text-red-300 border border-red-500/40',
        ring: 'bg-red-400',
      };
    if (s >= 5)
      return {
        label: `NEWS2 ${s}`,
        classes: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
        ring: 'bg-orange-400',
      };
    if (s >= 3)
      return {
        label: `NEWS2 ${s}`,
        classes: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
        ring: null,
      };
    return {
      label: `NEWS2 ${s}`,
      classes: 'bg-slate-700/50 text-slate-400 border border-slate-600/30',
      ring: null,
    };
  };
  const { label, classes, ring } = getConfig(score);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold ${classes} ${className}`}
    >
      {ring && <span className={`w-1.5 h-1.5 rounded-full ${ring} animate-pulse`} />}
      {label}
    </span>
  );
}
