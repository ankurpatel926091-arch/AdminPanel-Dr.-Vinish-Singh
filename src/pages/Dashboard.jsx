import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import AppointmentStatusWidget from '../components/dashboard/AppointmentStatusWidget';
import AppointmentsWidget from '../components/dashboard/AppointmentsWidget';
import EnquiriesChartWidget from '../components/dashboard/EnquiriesChartWidget';
import RecentEnquiriesWidget from '../components/dashboard/RecentEnquiriesWidget';
import { useAdminData } from '../context/AdminDataContext';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { stats, enquiries, appointments, galleryItems, blogs } = useAdminData();

  // Dynamic live count calculations
  const enquiriesCount = (enquiries && enquiries.length > 0) ? enquiries.length : stats.enquiries.count;
  const appointmentsCount = (appointments && appointments.length > 0) ? appointments.length : stats.appointments.count;
  const galleryCount = (galleryItems && galleryItems.length > 0) ? galleryItems.length : (stats.galleryImages?.count || 36);
  const blogsCount = (blogs && blogs.length > 0) ? blogs.length : (stats.blogs?.count || 24);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Main Banner */}
      <div className="bg-gradient-to-r from-[#031B38] via-[#092B57] to-[#1A3B70] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          {/* Left Icon Box */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v3m-1.5-1.5h3" strokeWidth="2" />
            </svg>
          </div>

          <div>
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-1">
              HOSPITAL ADMIN PANEL
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Welcome back, Administrator <span className="inline-block">👋</span>
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 font-medium mt-1">
              Here's your hospital operations overview for today.
            </p>
          </div>
        </div>

        {/* Right Hospital Building Vector Graphics */}
        <div className="hidden md:block relative z-10 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <svg className="w-24 h-24 sm:w-28 sm:h-28 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            <circle cx="12" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5v3m-1.5-1.5h3" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h1.5m3 0H15M9 15h1.5m3 0H15" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Contact Enquiries"
          value={enquiriesCount}
          change={stats.enquiries?.change || '+12%'}
          type="enquiries"
        />
        <StatCard
          title="Appointments"
          value={appointmentsCount}
          change={stats.appointments?.change || '+8%'}
          type="appointments"
        />
        <StatCard
          title="Gallery Images"
          value={galleryCount}
          change={stats.galleryImages?.change || '+5%'}
          type="galleryImages"
        />
        <StatCard
          title="Blogs"
          value={blogsCount}
          change={stats.blogs?.change || '+10%'}
          type="blogs"
        />
      </div>

      {/* Top Row: Appointment Status Overview & Enquiries Overview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div>
          <AppointmentStatusWidget />
        </div>
        <div>
          <EnquiriesChartWidget />
        </div>
      </div>

      {/* Full-width Upcoming Appointments */}
      <div className="w-full">
        <AppointmentsWidget />
      </div>

      {/* Bottom Grid Row: Recent Enquiries Table (Full Width) */}
      <div className="w-full">
        <RecentEnquiriesWidget />
      </div>
    </div>
  );
}
