import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import doctorPhoto from '../../assets/doctor.jpg';

export default function Header({ onToggleSidebar, onOpenSearch }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Sidebar Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Doctor Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Doctor Profile Header Badge */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
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
              {/* <div className="py-1">
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
              </div> */}
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
