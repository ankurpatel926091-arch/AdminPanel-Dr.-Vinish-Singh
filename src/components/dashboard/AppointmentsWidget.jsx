import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import { User, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppointmentsWidget() {
  const { appointments } = useAdminData();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Upcoming Appointments</h3>
          <Link to="/appointments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {appointments.slice(0, 5).map((apt) => (
            <div 
              key={apt.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{apt.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{apt.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    {apt.date}
                  </div>
                  <div className="text-[11px] text-slate-400">{apt.time}</div>
                </div>

                <StatusBadge status={apt.status} />
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link 
          to="/appointments"
          className="w-full py-2.5 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs rounded-xl flex items-center justify-center transition-colors"
        >
          View All Appointments
        </Link>
      </div>
    </div>
  );
}
