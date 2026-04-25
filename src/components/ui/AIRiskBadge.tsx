import React from 'react';
import { Brain } from 'lucide-react';

interface AIRiskBadgeProps {
  score: number; // 0–100
  className?: string;
}

export default function AIRiskBadge({ score, className = '' }: AIRiskBadgeProps) {
  const getConfig = (s: number) => {
    if (s >= 75)
      return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/25', label: `${s}% risk` };
    if (s >= 50)
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/25',
        label: `${s}% risk`,
      };
    if (s >= 30)
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/25',
        label: `${s}% risk`,
      };
    return {
      color: 'text-slate-400',
      bg: 'bg-slate-700/30 border-slate-600/25',
      label: `${s}% risk`,
    };
  };
  const { color, bg, label } = getConfig(score);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${bg} ${color} ${className}`}
    >
      <Brain className="w-3 h-3" />
      {label}
    </span>
  );
}
