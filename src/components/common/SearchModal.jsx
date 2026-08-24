import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Calendar, Mail, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'View Contact Enquiries', path: '/enquiries', icon: Mail },
    { label: 'Manage Appointments', path: '/appointments', icon: Calendar },
    { label: 'Doctor Profile Settings', path: '/profile', icon: User },
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search enquiries, appointments, patients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-slate-800 placeholder-slate-400 bg-transparent text-sm focus:outline-hidden"
            autoFocus
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Navigation
          </div>
          <div className="space-y-1">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(link.path);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{link.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
