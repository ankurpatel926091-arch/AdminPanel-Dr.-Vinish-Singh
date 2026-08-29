import React from 'react';
import { Mail, Calendar, Image as ImageIcon, BookOpen } from 'lucide-react';

const cardConfig = {
  enquiries: {
    icon: Mail,
    iconBg: 'bg-blue-50/90 border-blue-100 text-blue-600',
    dotBg: 'bg-blue-300/70',
    bottomLineBg: 'bg-blue-600',
    waveBg: 'from-blue-100/40 via-blue-50/20 to-transparent'
  },
  appointments: {
    icon: Calendar,
    iconBg: 'bg-emerald-50/90 border-emerald-100 text-emerald-600',
    dotBg: 'bg-emerald-300/70',
    bottomLineBg: 'bg-emerald-500',
    waveBg: 'from-emerald-100/40 via-emerald-50/20 to-transparent'
  },
  galleryImages: {
    icon: ImageIcon,
    iconBg: 'bg-sky-50/90 border-sky-100 text-sky-600',
    dotBg: 'bg-sky-300/70',
    bottomLineBg: 'bg-sky-500',
    waveBg: 'from-sky-100/40 via-sky-50/20 to-transparent'
  },
  blogs: {
    icon: BookOpen,
    iconBg: 'bg-purple-50/90 border-purple-100 text-purple-600',
    dotBg: 'bg-purple-300/70',
    bottomLineBg: 'bg-purple-600',
    waveBg: 'from-purple-100/40 via-purple-50/20 to-transparent'
  }
};

export default function StatCard({ title, value, type }) {
  const config = cardConfig[type] || cardConfig.enquiries;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-[26px] p-6 border border-slate-200/70 shadow-2xs hover:shadow-md transition-shadow duration-200 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Soft Wave Graphic in Bottom-Right Corner matching reference image */}
      <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tl ${config.waveBg} pointer-events-none`} />

      <div>
        {/* Top Header: Large Rounded Square Icon & Circular Accent Dot */}
        <div className="flex items-start justify-between">
          <div className={`w-14 h-14 rounded-2xl ${config.iconBg} border flex items-center justify-center shadow-2xs`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className={`w-3.5 h-3.5 rounded-full ${config.dotBg} mt-1`} />
        </div>

        {/* Title Text */}
        <div className="mt-6">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
        </div>

        {/* Dotted Separator Line */}
        <div className="border-b border-dashed border-slate-200/90 my-3" />

        {/* Big Stat Count Number */}
        <div className="relative z-10">
          <h3 className="text-4xl sm:text-[42px] font-black text-slate-900 tracking-tight leading-none">
            {value}
          </h3>
        </div>
      </div>

      {/* Solid Colored Bottom Edge Accent Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3.5px] ${config.bottomLineBg}`} />
    </div>
  );
}
