import React from 'react';
import { Mail, Calendar, Star, Stethoscope, Image as ImageIcon, ArrowUpRight, Minus } from 'lucide-react';

const iconMap = {
  enquiries: { icon: Mail, bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200' },
  appointments: { icon: Calendar, bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-200' },
  testimonials: { icon: Star, bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-200' },
  treatments: { icon: Stethoscope, bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-200' },
  galleryImages: { icon: ImageIcon, bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-200' }
};

export default function StatCard({ title, value, change, type }) {
  const config = iconMap[type] || iconMap.enquiries;
  const Icon = config.icon;
  const isPositive = change && change.includes('+');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center ${config.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">{value}</h3>
      </div>

      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold">
        {change === 'No change' ? (
          <span className="text-slate-400 flex items-center gap-0.5">
            <Minus className="w-3 h-3" /> No change
          </span>
        ) : (
          <span className="text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {change} <span className="text-slate-400 font-normal">from last month</span>
          </span>
        )}
      </div>
    </div>
  );
}
