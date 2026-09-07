import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { useAdminData } from '../../context/AdminDataContext';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const TIMEFRAMES = ['This Month', 'All Time', 'This Week', 'Today'];

const STATUS_CONFIG = [
  { key: 'Pending', label: 'Pending', color: '#f59e0b', dotBg: 'bg-amber-500' },
  { key: 'Confirmed', label: 'Confirmed', color: '#10b981', dotBg: 'bg-emerald-500' },
  { key: 'Visited', label: 'Visited', color: '#2563eb', dotBg: 'bg-blue-600' },
  { key: 'Missed', label: 'Missed', color: '#f97316', dotBg: 'bg-orange-500' },
  { key: 'Cancelled', label: 'Cancelled', color: '#f43f5e', dotBg: 'bg-rose-500' }
];

// Helper to parse dates in any format reliably
const parseAppointmentDate = (apt) => {
  if (!apt) return null;

  // 1. Try createdAt / timestamp / updatedAt
  if (apt.createdAt) {
    const d = new Date(apt.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (apt.timestamp) {
    const d = new Date(apt.timestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (apt.updatedAt) {
    const d = new Date(apt.updatedAt);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Try parsing apt.date string
  if (apt.date) {
    let d = new Date(apt.date);
    if (!isNaN(d.getTime())) return d;

    // Clean up "Sept" -> "Sep" for standard JS Date parser
    const cleanDateStr = String(apt.date).replace(/Sept/i, 'Sep').trim();
    d = new Date(cleanDateStr);
    if (!isNaN(d.getTime())) return d;

    // Parse DD/MM/YYYY or DD-MM-YYYY
    const parts = cleanDateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
};

export default function AppointmentStatusWidget() {
  const { appointments = [] } = useAdminData();
  const [timeframe, setTimeframe] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter appointments dynamically by selected timeframe
  const filteredAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    if (timeframe === 'All Time') return appointments;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return appointments.filter(apt => {
      const aptDate = parseAppointmentDate(apt);

      // If date parsing fails, default to including it in 'This Month' so no records are lost
      if (!aptDate) {
        return true;
      }

      if (timeframe === 'This Month') {
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
      }

      if (timeframe === 'This Week') {
        const diffDays = Math.floor((now.getTime() - aptDate.getTime()) / (1000 * 3600 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }

      if (timeframe === 'Today') {
        return (
          aptDate.getDate() === now.getDate() &&
          aptDate.getMonth() === now.getMonth() &&
          aptDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [appointments, timeframe]);

  // Compute status counts dynamically from filtered appointments
  const chartData = useMemo(() => {
    return STATUS_CONFIG.map(cfg => {
      const count = filteredAppointments.filter(apt => {
        const statusStr = (apt.status || 'Pending').trim().toLowerCase();
        return statusStr === cfg.key.toLowerCase();
      }).length;

      return {
        status: cfg.label,
        count: count,
        color: cfg.color
      };
    });
  }, [filteredAppointments]);

  // Calculate dynamic max count for Y-Axis scaling
  const maxCount = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.count), 0);
    return Math.max(maxVal + 4, 10);
  }, [chartData]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 w-full relative">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 relative z-20">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">Appointment Status Overview</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Current appointment counts by status</p>
        </div>

        {/* Top-Right Interactive Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 text-xs font-bold bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Calendar size={14} className="text-blue-600" />
            <span>{timeframe}</span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-1.5 z-50 animate-fadeIn">
              {TIMEFRAMES.map((option) => {
                const isSelected = option === timeframe;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setTimeframe(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <Check size={14} className="text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Bar Chart Section */}
      <div className="h-64 sm:h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="12%" margin={{ top: 25, right: 20, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="status"
              stroke="#64748b"
              fontSize={12}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, maxCount]}
            />
            <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={150}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="count" position="top" fill="#1e293b" fontSize={14} fontWeight={800} offset={8} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Below Chart */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-700">
        {STATUS_CONFIG.map(cfg => (
          <div key={cfg.key} className="inline-flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotBg}`} />
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
