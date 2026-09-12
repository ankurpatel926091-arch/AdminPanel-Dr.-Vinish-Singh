import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import { User, Calendar as CalendarIcon, ChevronRight, Mail, MapPin, Stethoscope, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppointmentsWidget() {
  const { appointments } = useAdminData();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Upcoming Appointments</h3>
          <p className="text-xs text-slate-400 font-medium">Scheduled patient consultations</p>
        </div>
        <Link to="/admin/appointments" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 transition-colors">
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[32px_80px_1fr_100px_110px_130px] items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>#</span>
        <span>Status</span>
        <span>Patient</span>
        <span>Phone</span>
        <span>Type</span>
        <span>Clinic</span>
      </div>

      {/* Table Rows */}
      <div className="flex-1 divide-y divide-slate-50 overflow-auto">
        {appointments.slice(0, 6).map((apt, idx) => {
          const clinicName = apt.clinic?.name || (typeof apt.clinic === 'string' ? apt.clinic : '—');
          const clinicAddress = apt.clinic?.address || apt.clinic?.city || '';
          const consultType = apt.consultationType || apt.type || null;

          return (
            <div
              key={apt.id}
              className="grid grid-cols-[32px_80px_1fr_100px_110px_130px] items-center gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors group cursor-pointer"
            >
              {/* S.No */}
              <span className="text-[11px] font-bold text-slate-400">{idx + 1}</span>

              {/* Status */}
              <div>
                <StatusBadge status={apt.status} />
              </div>

              {/* Patient Name + Email */}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate transition-colors">
                  {apt.name}
                </p>
                {apt.email && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                    <Mail className="w-2.5 h-2.5 flex-shrink-0 text-slate-300" />
                    {apt.email}
                  </p>
                )}
                {/* Date + Time */}
                <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                  <CalendarIcon className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
                  {apt.date}
                  {apt.time && (
                    <span className="ml-1 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-300" />
                      {apt.time}
                    </span>
                  )}
                </p>
              </div>

              {/* Phone */}
              <p className="text-[11px] font-semibold text-slate-600 truncate">{apt.phone}</p>

              {/* Consultation Type */}
              <div>
                {consultType ? (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                    <Stethoscope className="w-2.5 h-2.5" />
                    {consultType}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-300">—</span>
                )}
              </div>

              {/* Clinic / Hospital */}
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 truncate flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-rose-400 flex-shrink-0" />
                  {clinicName}
                </p>
                {clinicAddress && (
                  <p className="text-[10px] text-slate-400 truncate pl-3.5">{clinicAddress}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Button */}
      <div className="px-5 py-3 border-t border-slate-100 flex justify-center bg-slate-50/50">
        <Link
          to="/admin/appointments"
          className="py-1.5 px-5 bg-slate-100 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg inline-flex items-center justify-center transition-all duration-200 text-slate-700 shadow-2xs"
        >
          View All Appointments
        </Link>
      </div>
    </div>
  );
}
