import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminData } from '../../context/AdminDataContext';
import { ChevronDown } from 'lucide-react';

export default function EnquiriesChartWidget() {
  const { chartData } = useAdminData();
  const [timeframe, setTimeframe] = useState('This Month');

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Enquiries Overview</h3>
          <p className="text-xs text-slate-400 font-medium">Monthly enquiry statistics & trends</p>
        </div>

        <div className="relative">
          <button className="flex items-center gap-2 text-xs font-bold bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/60 transition-all cursor-pointer">
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              formatter={(val) => [`${val} Enquiries`, 'Total']}
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
