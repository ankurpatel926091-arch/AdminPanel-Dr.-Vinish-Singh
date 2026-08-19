import React from 'react';

export default function StatusBadge({ status }) {
  let badgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';

  const normalized = (status || '').toLowerCase();

  if (normalized === 'confirmed' || normalized === 'approved' || normalized === 'replied') {
    badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'pending') {
    badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'cancelled' || normalized === 'rejected') {
    badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalized === 'new') {
    badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'read') {
    badgeStyles = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 ${badgeStyles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        normalized === 'confirmed' || normalized === 'approved' || normalized === 'replied' ? 'bg-emerald-500' :
        normalized === 'pending' ? 'bg-amber-500' :
        normalized === 'cancelled' || normalized === 'rejected' ? 'bg-rose-500' :
        normalized === 'new' ? 'bg-blue-500' : 'bg-sky-500'
      }`}></span>
      {status}
    </span>
  );
}
