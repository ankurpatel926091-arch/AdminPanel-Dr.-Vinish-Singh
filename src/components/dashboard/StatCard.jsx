import React from 'react';
import { Mail, Calendar, Star, Stethoscope, Image as ImageIcon, ArrowUpRight, Minus } from 'lucide-react';

const iconMap = {
  enquiries: { icon: Mail, bg: 'bg-blue-500/10 text-blue-600 border-blue-200/60', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  appointments: { icon: Calendar, bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  testimonials: { icon: Star, bg: 'bg-purple-500/10 text-purple-600 border-purple-200/60', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  treatments: { icon: Stethoscope, bg: 'bg-amber-500/10 text-amber-600 border-amber-200/60', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  galleryImages: { icon: ImageIcon, bg: 'bg-sky-500/10 text-sky-600 border-sky-200/60', badge: 'bg-sky-50 text-sky-700 border-sky-200' }
};

export default function StatCard({ title, value, change, type }) {
  const config = iconMap[type] || iconMap.enquiries;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl ${config.bg} border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>

        {change && change !== 'No change' && (
          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-extrabold tracking-tight">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {change}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1 group-hover:text-blue-600 transition-colors">
          {value}
        </h3>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
        {change === 'No change' ? (
          <span className="flex items-center gap-1 text-slate-400">
            <Minus className="w-3 h-3" /> Stable activity
          </span>
        ) : (
          <span><strong className="text-emerald-600 font-bold">+{change}</strong> vs last month</span>
        )}
      </div>
    </div>
  );
}
