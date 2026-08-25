import React, { useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import AppointmentsWidget from '../components/dashboard/AppointmentsWidget';
import EnquiriesChartWidget from '../components/dashboard/EnquiriesChartWidget';
import RecentEnquiriesWidget from '../components/dashboard/RecentEnquiriesWidget';
import TestimonialsWidget from '../components/dashboard/TestimonialsWidget';
import { useAdminData } from '../context/AdminDataContext';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { stats } = useAdminData();
  const [dateRange, setDateRange] = useState('18 May 2025 - 18 June 2025');

  return (
    <div className="space-y-8 font-sans">
      {/* Top Welcome Header & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#0B1E3B] via-[#0D264E] to-[#08172F] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Subtle Decorative Backdrop Elements */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Executive Admin Portal</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Welcome back, Dr. Vinish Singh <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Here's what's happening with your website today.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="relative self-start md:self-auto z-10">
          <button className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-md cursor-pointer">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Contact Enquiries"
          value={stats.enquiries.count}
          change={stats.enquiries.change}
          type="enquiries"
        />
        <StatCard
          title="Appointments"
          value={stats.appointments.count}
          change={stats.appointments.change}
          type="appointments"
        />
        {/* <StatCard
          title="Testimonials"
          value={stats.testimonials.count}
          change={stats.testimonials.change}
          type="testimonials"
        /> */}=
        {/* <StatCard
          title="Treatments"
          value={stats.treatments.count}
          change={stats.treatments.change}
          type="treatments"
        /> */}
        <StatCard
          title="Gallery Images"
          value={stats.galleryImages.count}
          change={stats.galleryImages.change}
          type="galleryImages"
        />
      </div>

      {/* Middle Grid Row: Upcoming Appointments & Enquiries Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <AppointmentsWidget />
        </div>
        <div className="lg:col-span-6">
          <EnquiriesChartWidget />
        </div>
      </div>

      {/* Bottom Grid Row: Recent Enquiries Table & Recent Testimonials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <RecentEnquiriesWidget />
        </div>
        <div className="lg:col-span-5">
          <TestimonialsWidget />
        </div>
      </div>
    </div>
  );
}
