// File: components/absence/StatusBadge.tsx
import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-yellow-800 border-yellow-200',
    approved: 'bg-emerald-50 text-green-800 border-green-200',
    rejected: 'bg-red-50 text-red-800 border-red-200',
    cancelled: 'bg-slate-50 text-slate-800 border-slate-200'
  };

  const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    cancelled: XCircle
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status as keyof typeof styles]
      }`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
