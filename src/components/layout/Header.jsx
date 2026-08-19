import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Calendar, ChevronDown, User, LogOut, Settings, Mail, Star, ShieldCheck, FileText, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import doctorPhoto from '../../assets/doctor.jpg';

export default function Header({ onToggleSidebar, onOpenSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'New Appointment', text: 'Rahul Verma booked for 20 May 11:20 AM', time: '10 mins ago', unread: true, icon: Calendar, iconBg: 'bg-blue-50 text-blue-600' },
    { id: 2, title: 'New Contact Enquiry', text: 'Kidney Stone question from Amit Kumar', time: '1 hour ago', unread: true, icon: Mail, iconBg: 'bg-emerald-50 text-emerald-600' },
    { id: 3, title: 'New Testimonial', text: '5-star review submitted by Sandeep Gupta', time: '3 hours ago', unread: true, icon: Star, iconBg: 'bg-amber-50 text-amber-600' },
    { id: 4, title: 'System Update', text: 'Admin Panel security patches updated', time: '1 day ago', unread: false, icon: ShieldCheck, iconBg: 'bg-slate-100 text-slate-600' },
    { id: 5, title: 'Monthly Report', text: 'May 2025 patient statistics ready', time: '2 days ago', unread: false, icon: FileText, iconBg: 'bg-indigo-50 text-indigo-600' }
  ]);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notificationsList.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Desktop) */}
        <div 
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-3 bg-slate-100/80 hover:bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm w-80 cursor-pointer border border-slate-200/60 transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-slate-400 text-xs font-medium">Search anything...</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
            Ctrl + K
          </kbd>
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Notification Bell & Doctor Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell Icon */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/60 hover:border-blue-200 transition-all flex items-center justify-center relative group shadow-2xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md shadow-rose-500/30 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown - Responsive positioning */}
          {showNotifications && (
            <div className="fixed sm:absolute top-16 sm:top-full right-3 sm:right-0 mt-1 sm:mt-3 w-[calc(100vw-24px)] max-w-sm sm:max-w-none sm:w-[420px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 py-0 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="max-h-64 sm:max-h-72 overflow-y-auto notification-scrollbar divide-y divide-slate-100/60 pr-1">
                {notificationsList.map(n => {
                  const IconComponent = n.icon;
                  return (
                    <div 
                      key={n.id} 
                      className={`p-3 sm:p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                        n.unread 
                          ? 'bg-gradient-to-r from-blue-50/70 via-blue-50/30 to-transparent hover:bg-blue-50/80' 
                          : 'bg-white hover:bg-slate-50/80'
                      }`}
                      onClick={() => {
                        setNotificationsList(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                      }}
                    >
                      {/* Icon Badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200/50 shadow-2xs mt-0.5 ${n.iconBg}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{n.title}</h4>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-snug mt-0.5 line-clamp-2">
                          {n.text}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
                <span className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">
                  View all system notifications →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300/70 to-transparent mx-1"></div>

        {/* Doctor Profile Header Badge */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-2xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200/80 transition-all duration-200 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md">
                <img
                  src={doctorPhoto}
                  alt="Dr. Vinish Singh"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-extrabold text-slate-800 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                Dr. Vinish Singh
              </div>
              <div className="text-[10px] text-blue-600 font-bold tracking-wider uppercase flex items-center gap-1 mt-0.5">
                <span>Administrator</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-y-0.5 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="fixed sm:absolute top-16 sm:top-full right-3 sm:right-0 mt-1 sm:mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Dr. Vinish Kumar Singh</p>
                <p className="text-[11px] text-slate-400 mt-0.5">admin@drvinish.com</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile Details
                </button>
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
