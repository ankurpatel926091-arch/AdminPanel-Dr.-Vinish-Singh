import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../../utils/auth';
import { logoutAdmin } from '../../services/authService';
import { useAdminData } from '../../context/AdminDataContext';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  Mail,
  Calendar,
  Layers,
  Stethoscope,
  Image as ImageIcon,
  Star,
  User,
  UserPlus,
  CheckSquare,
  Users,
  MapPin,
  FileText,
  CreditCard,
  BarChart2,
  BookOpen,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import doctorPhoto from '../../assets/doctor.jpg';

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  const user = getUser();
  const { stats, appointments } = useAdminData();
  const navigate = useNavigate();

  const enquiryCount = stats?.enquiries?.count ?? 0;
  const appointmentCount = (appointments && appointments.length >= 0) ? appointments.length : (stats?.appointments?.count ?? 0);

  const mainNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/enquiries', label: 'Contact Enquiries', icon: Mail, badge: enquiryCount },
    { path: '/admin/appointments', label: 'Appointments', icon: Calendar, badge: appointmentCount },
    { path: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
    { path: '/admin/clinics', label: 'Clinics', icon: MapPin },
    { path: '/admin/blogs', label: 'Blogs', icon: BookOpen },
  ];

  const receptionNavItems = [
    { path: '/admin/today-opd', label: "Today's OPD", icon: Stethoscope },
    { path: '/admin/patient-registration', label: 'Patient Registration', icon: UserPlus },
    { path: '/admin/check-in', label: 'Check-in', icon: CheckSquare },
    { path: '/admin/billing', label: 'Billing', icon: FileText },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/doctor-queue', label: 'Doctor Queue', icon: Users },
    { path: '/admin/patients', label: 'Patients', icon: User },
    { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    try { await logoutAdmin(); } catch (_) {}
    clearAuth();
    toast.info('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 bg-[#07152B] text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64
      `}>
        {/* Top Header */}
        <div>
          <div className={`flex items-center justify-between p-4 border-b border-slate-800/80 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-lg flex-shrink-0">
                <Stethoscope className="w-6 h-6 text-blue-400" />
              </div>
              <div className={isCollapsed ? 'lg:hidden' : 'block'}>
                <h1 className="font-bold text-white text-sm sm:text-base tracking-tight leading-none truncate">
                  {user?.name || 'Dr. Vinish Kumar Singh'}
                </h1>
                <p className="text-[11px] text-blue-400 font-semibold mt-1 truncate capitalize">
                  {role === 'admin' ? 'Administrator Portal' : 'Doctor Portal'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)] notification-scrollbar">
            {/* MAIN MENU Section */}
            <div>
              <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Main Menu
              </div>
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin'}
                      title={item.label}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) => `
                        flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold' 
                          : 'text-slate-200 hover:text-white hover:bg-slate-800/80'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                        <span className={isCollapsed ? 'lg:hidden' : 'block'}>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge !== null && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/20 ${isCollapsed ? 'lg:hidden' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.badge !== undefined && item.badge !== null && isCollapsed && (
                        <span className="hidden lg:block absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400"></span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* RECEPTION SERVICES Section */}
            <div>
              <div className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Reception Services
              </div>
              <div className="space-y-1">
                {receptionNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) => `
                        flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold' 
                          : 'text-slate-200 hover:text-white hover:bg-slate-800/80'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-300 group-hover:text-white transition-transform group-hover:scale-110 flex-shrink-0" />
                        <span className={isCollapsed ? 'lg:hidden' : 'block'}>{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050f20]">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center ${isCollapsed ? 'lg:justify-center' : ''} gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-rose-400 hover:bg-rose-500/10 transition-colors`}
          >
            <LogOut className="w-5 h-5 text-slate-300 flex-shrink-0" />
            <span className={isCollapsed ? 'lg:hidden' : 'block'}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
