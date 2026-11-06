import React from 'react';
import AppointmentStatusWidget from '../components/dashboard/AppointmentStatusWidget';
import AppointmentsWidget from '../components/dashboard/AppointmentsWidget';
import EnquiriesChartWidget from '../components/dashboard/EnquiriesChartWidget';
import RecentEnquiriesWidget from '../components/dashboard/RecentEnquiriesWidget';
import { useAdminData } from '../context/AdminDataContext';
import { Mail, Calendar, Image as ImageIcon, BookOpen } from 'lucide-react'; // Added icons for cards

export default function Dashboard() {
  const { stats, enquiries, appointments, galleryItems, blogs } = useAdminData();

  // Dynamic live count calculations
  const enquiriesCount = (enquiries && enquiries.length > 0) ? enquiries.length : stats.enquiries.count;
  const appointmentsCount = (appointments && appointments.length > 0) ? appointments.length : stats.appointments.count;
  const galleryCount = (galleryItems && galleryItems.length > 0) ? galleryItems.length : (stats.galleryImages?.count || 36);
  const blogsCount = (blogs && blogs.length > 0) ? blogs.length : (stats.blogs?.count || 24);

  // Data for Custom Cards (To match your required layout)
  const cardData = [
    { title: "CONTACT ENQUIRIES", value: enquiriesCount, icon: Mail, iconBg: "bg-blue-50", iconColor: "text-blue-500", dotColor: "bg-blue-300" },
    { title: "APPOINTMENTS", value: appointmentsCount, icon: Calendar, iconBg: "bg-green-50", iconColor: "text-green-500", dotColor: "bg-green-300" },
    { title: "GALLERY IMAGES", value: galleryCount, icon: ImageIcon, iconBg: "bg-cyan-50", iconColor: "text-cyan-500", dotColor: "bg-cyan-300" },
    { title: "BLOGS", value: blogsCount, icon: BookOpen, iconBg: "bg-purple-50", iconColor: "text-purple-500", dotColor: "bg-purple-300" },
  ];

  return (
    <div className="space-y-5 font-sans">
      
      {/* 1. Main Banner (Reduced Height) */}
      <div className="bg-gradient-to-r from-[#031B38] via-[#092B57] to-[#1A3B70] rounded-2xl px-5 py-2.5 sm:px-6 sm:py-3 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Left Icon Box */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v3m-1.5-1.5h3" strokeWidth="2" />
            </svg>
          </div>

          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-300 uppercase tracking-wider block mb-0.5">
              HOSPITAL ADMIN PANEL
            </span>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight">
              Welcome back, Administrator
            </h2>
          </div>
        </div>

        {/* Right Hospital Building Vector Graphics */}
        <div className="hidden md:block relative z-10 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <svg className="w-12 h-12 sm:w-14 sm:h-14 text-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            <circle cx="12" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5v3m-1.5-1.5h3" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h1.5m3 0H15M9 15h1.5m3 0H15" strokeWidth="1.2" />
          </svg>
        </div>
      </div>

      {/* 2. Top Stat Cards Grid (Custom Layout: Number shifted to top right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Colored dot top right */}
              <div className={`absolute top-5 right-5 w-2 h-2 rounded-full ${item.dotColor}`} />

              <div className="flex justify-between items-start">
                {/* Left: Icon & Title */}
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg} mb-3`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    {item.title}
                  </p>
                </div>

                {/* Right: Number */}
                <div className="mt-6">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-800">
                    {item.value}
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Row: Appointment Status Overview & Enquiries Overview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
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