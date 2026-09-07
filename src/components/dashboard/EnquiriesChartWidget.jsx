import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminData } from '../../context/AdminDataContext';
import { ChevronDown, Calendar, TrendingUp, Check } from 'lucide-react';

const TIMEFRAMES = ['This Month', 'Last 30 Days', 'Last 7 Days', 'This Year'];

export default function EnquiriesChartWidget() {
  const { enquiries = [], appointments = [] } = useAdminData();
  const [timeframe, setTimeframe] = useState('This Month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute dynamic chart data based on timeframe & actual enquiries + appointments
  const dynamicChartData = useMemo(() => {
    const allRecords = [...enquiries, ...appointments];
    const now = new Date();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatDayMonth = (d) => {
      const day = String(d.getDate()).padStart(2, '0');
      const monthStr = months[d.getMonth()];
      return `${day} ${monthStr}`;
    };

    if (timeframe === 'Last 7 Days') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - i);
        const dateKey = formatDayMonth(targetDate);

        const realCount = allRecords.filter(r => {
          const rDate = new Date(r.createdAt || r.date || r.preferredDate || r.timestamp);
          return (
            !isNaN(rDate.getTime()) &&
            rDate.getDate() === targetDate.getDate() &&
            rDate.getMonth() === targetDate.getMonth() &&
            rDate.getFullYear() === targetDate.getFullYear()
          );
        }).length;

        data.push({
          date: dateKey,
          enquiries: realCount,
        });
      }
      return data;
    }

    if (timeframe === 'This Year') {
      const data = [];
      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth();

      for (let m = 0; m <= currentMonthIndex; m++) {
        const monthName = months[m];
        const realCount = allRecords.filter(r => {
          const rDate = new Date(r.createdAt || r.date || r.preferredDate || r.timestamp);
          return (
            !isNaN(rDate.getTime()) &&
            rDate.getMonth() === m &&
            rDate.getFullYear() === currentYear
          );
        }).length;

        data.push({
          date: monthName,
          enquiries: realCount,
        });
      }
      return data;
    }

    // Default for 'This Month' & 'Last 30 Days'
    const data = [];
    const intervalDays = [28, 21, 14, 7, 0];

    intervalDays.forEach((daysAgo) => {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - daysAgo);
      const dateKey = formatDayMonth(targetDate);

      const realCount = allRecords.filter(r => {
        const rDate = new Date(r.createdAt || r.date || r.preferredDate || r.timestamp);
        if (isNaN(rDate.getTime())) return false;
        const diffDays = Math.floor((now.getTime() - rDate.getTime()) / (1000 * 3600 * 24));
        return diffDays >= (daysAgo - 6) && diffDays <= daysAgo;
      }).length;

      data.push({
        date: dateKey,
        enquiries: realCount,
      });
    });

    return data;
  }, [enquiries, appointments, timeframe]);

  // Compute metric summaries
  const peakVal = useMemo(() => Math.max(...dynamicChartData.map(d => d.enquiries), 0), [dynamicChartData]);
  const totalVolume = useMemo(() => dynamicChartData.reduce((acc, curr) => acc + curr.enquiries, 0), [dynamicChartData]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full relative">
      
      {/* Header Row: Title & Interactive Dropdown */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-20">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Enquiries Overview</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <TrendingUp size={11} />
              <span>Live Trends</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {timeframe === 'This Month' && 'Monthly enquiry statistics & trends'}
            {timeframe === 'Last 30 Days' && 'Trailing 30-day enquiry breakdown'}
            {timeframe === 'Last 7 Days' && 'Daily enquiry volume (Last 7 Days)'}
            {timeframe === 'This Year' && `Full year ${new Date().getFullYear()} monthly trends`}
          </p>
        </div>

        {/* Dynamic Interactive Timeframe Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 text-xs font-bold bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Calendar size={13} className="text-blue-600" />
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

      {/* Dynamic Summary Cards Sub-bar */}
      <div className="mt-3 flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Period Total:</span>
          <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{totalVolume} Enquiries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Peak Volume:</span>
          <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{peakVal} / period</span>
        </div>
      </div>

      {/* Dynamic Chart Section */}
      <div className="h-60 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="enquiriesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontSize: '12px',
                padding: '10px 14px',
                boxShadow: '0 15px 30px -5px rgba(0,0,0,0.3)'
              }}
              formatter={(val) => [`${val} Total Submissions`, 'Enquiries & Appointments']}
            />
            <Area
              type="monotone"
              dataKey="enquiries"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#enquiriesGrad)"
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
