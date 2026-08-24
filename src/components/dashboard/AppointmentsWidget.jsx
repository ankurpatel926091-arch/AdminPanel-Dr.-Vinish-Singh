import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import { User, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppointmentsWidget() {
  const { appointments } = useAdminData();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Upcoming Appointments</h3>
            <p className="text-xs text-slate-400 font-medium">Scheduled patient consultations</p>
          </div>
          <Link to="/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 transition-colors">
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 space-y-2.5">
          {appointments.slice(0, 5).map((apt) => (
            <div 
              key={apt.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-blue-50/40 border border-slate-100/80 hover:border-blue-200/60 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{apt.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{apt.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                    {apt.date}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{apt.time}</div>
                </div>

                <StatusBadge status={apt.status} />
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link 
          to="/appointments"
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all duration-200 text-slate-700 shadow-2xs"
        >
          View All Appointments
        </Link>
      </div>
    </div>
  );
}
