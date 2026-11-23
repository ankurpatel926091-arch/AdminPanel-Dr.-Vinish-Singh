import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import { Calendar as CalendarIcon, ChevronRight, Mail, MapPin, Stethoscope, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppointmentsWidget() {
  const { appointments } = useAdminData();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Upcoming Appointments</h3>
          <p className="text-xs text-slate-400 font-medium">Scheduled patient consultations</p>
        </div>
        <Link to="/admin/All-Appointments" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors">
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container - Responsive Scroll on Mobile */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-[780px]">
          {/* Table Header - Fixed column widths for perfect alignment */}
          <div className="grid grid-cols-[36px_minmax(140px,1fr)_140px_110px_105px_minmax(140px,1fr)_115px] items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>#</span>
            <span>Patient</span>
            <span>Date & Time</span>
            <span>Phone</span>
            <span>Type</span>
            <span>Clinic</span>
            <span className="text-right">Status</span>
          </div>

          {/* Table Rows */}
          <div className="flex-1 divide-y divide-slate-50 overflow-auto">
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-medium text-xs">
                No upcoming appointments found.
              </div>
            ) : (
              appointments.slice(0, 6).map((apt, idx) => {
                const clinicName = apt.clinic?.name || (typeof apt.clinic === 'string' ? apt.clinic : '—');
                const clinicAddress = apt.clinic?.address || apt.clinic?.city || '';
                const consultType = apt.consultationType || apt.type || null;

                return (
                  <div
                    key={apt.id || apt._id || idx}
                    className="grid grid-cols-[36px_minmax(140px,1fr)_140px_110px_105px_minmax(140px,1fr)_115px] items-center gap-4 px-6 py-3 hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  >
                  {/* S.No */}
                  <span className="text-xs font-bold text-slate-500">{idx + 1}</span>

                  {/* Patient Name + Email */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate transition-colors">
                      {apt.name}
                    </p>
                    {apt.email ? (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                        <Mail className="w-3 h-3 flex-shrink-0 text-slate-400" />
                        {apt.email}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-0.5">Walk-in / Direct</p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{apt.date || "—"}</span>
                    </p>
                    {apt.time && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 pl-5 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{apt.time}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <p className="text-xs font-semibold text-slate-700 truncate">{apt.phone || "—"}</p>

                  {/* Consultation Type */}
                  <div className="flex justify-start">
                    {consultType ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 whitespace-nowrap">
                        <Stethoscope className="w-3 h-3 shrink-0" />
                        {consultType}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </div>

                  {/* Clinic / Hospital */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate">{clinicName}</span>
                    </p>
                    {clinicAddress && (
                      <p className="text-[10px] text-slate-400 pl-4.5 mt-0.5 line-clamp-1" title={clinicAddress}>
                        {clinicAddress}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex justify-end">
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 py-4 border-t border-slate-100 flex justify-center bg-slate-50/50">
        <Link
          to="/admin/All-Appointments"
          className="py-2 px-6 bg-slate-100 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg inline-flex items-center justify-center transition-all duration-200 text-slate-700 shadow-sm"
        >
          View All Appointments
        </Link>
      </div>
    </div>
  );
}