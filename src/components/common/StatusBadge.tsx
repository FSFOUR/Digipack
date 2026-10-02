import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  // Status mapping
  let bg = 'bg-neutral-100 text-neutral-800 border-neutral-300';
  let dot = 'bg-neutral-500';

  if (
    normalized === 'ACTIVE' ||
    normalized === 'APPROVED' ||
    normalized === 'COMPLETED' ||
    normalized === 'DELIVERED' ||
    normalized === 'PAID' ||
    normalized === 'SUFFICIENT' ||
    normalized === 'READY_FOR_PRODUCTION' ||
    normalized === 'RUNNING'
  ) {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dot = 'bg-emerald-600';
  } else if (
    normalized === 'PENDING' ||
    normalized === 'IN_PRODUCTION' ||
    normalized === 'IN PRODUCTION' ||
    normalized === 'PARTIAL' ||
    normalized === 'STARTED' ||
    normalized === 'FOLLOW-UP' ||
    normalized === 'READY' ||
    normalized === 'LOADING' ||
    normalized === 'IN_TRANSIT'
  ) {
    bg = 'bg-amber-50 text-amber-900 border-amber-200';
    dot = 'bg-amber-500';
  } else if (
    normalized === 'REJECTED' ||
    normalized === 'CANCELLED' ||
    normalized === 'OVERDUE' ||
    normalized === 'SHORTAGE' ||
    normalized === 'PURCHASE_REQUIRED' ||
    normalized === 'BREAKDOWN' ||
    normalized === 'SUSPENDED' ||
    normalized === 'REWORK' ||
    normalized === 'REWORK_REQUIRED' ||
    normalized === 'BLOCKED' ||
    normalized === 'LOW STOCK' ||
    normalized === 'REORDER REQUIRED'
  ) {
    bg = 'bg-rose-50 text-rose-800 border-rose-200';
    dot = 'bg-rose-600';
  } else if (
    normalized === 'IDLE' ||
    normalized === 'MAINTENANCE' ||
    normalized === 'DRAFT' ||
    normalized === 'NEW'
  ) {
    bg = 'bg-blue-50 text-blue-800 border-blue-200';
    dot = 'bg-blue-500';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded border ${bg} ${padding} tracking-wide whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
