import React, { useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import AppointmentsWidget from '../components/dashboard/AppointmentsWidget';
import EnquiriesChartWidget from '../components/dashboard/EnquiriesChartWidget';
import RecentEnquiriesWidget from '../components/dashboard/RecentEnquiriesWidget';
import TestimonialsWidget from '../components/dashboard/TestimonialsWidget';
import { useAdminData } from '../context/AdminDataContext';
import { Calendar, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const { stats } = useAdminData();
  const [dateRange, setDateRange] = useState('18 May 2025 - 18 June 2025');

  return (
    <div className="space-y-8">
      {/* Top Welcome Header & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Welcome back, Dr. Vinish Singh <span className="animate-bounce inline-block">👋</span>
          </h1>
          
          <p className="text-sm text-slate-500 font-medium mt-1">
            Here's what's happening with your website today.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="relative self-start md:self-auto">
          <button className="flex items-center gap-2.5 bg-white border border-slate-200 shadow-2xs hover:border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-all">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{dateRange}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Top 5 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <StatCard
          title="Testimonials"
          value={stats.testimonials.count}
          change={stats.testimonials.change}
          type="testimonials"
        />
        <StatCard
          title="Treatments"
          value={stats.treatments.count}
          change={stats.treatments.change}
          type="treatments"
        />
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
