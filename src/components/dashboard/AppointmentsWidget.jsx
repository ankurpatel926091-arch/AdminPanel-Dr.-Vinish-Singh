import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import {
  Calendar as CalendarIcon,
  CalendarX,
  CalendarCheck,
  Clock,
  Mail,
  MapPin,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  RotateCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

/* ── helpers (same logic as Appointments.jsx) ─────────────────────── */
const getEmail = (apt) => {
  if (apt.email?.trim()) return apt.email.trim();
  const m = (apt.message || '').match(/Email:\s*([^\s|]+)/i);
  return m && m[1] !== 'N/A' ? m[1].trim() : '';
};

const getConsultType = (apt) => {
  const msg = (apt.message || '').toLowerCase();
  if (msg.includes('follow')) return 'Follow-up';
  const t = (apt.consultationType || '').toLowerCase();
  if (t.includes('follow')) return 'Follow-up';
  return 'First Visit';
};

const getClinicDisplay = (apt) => {
  if (apt.clinic?.name) return { name: apt.clinic.name, loc: apt.clinic.address || apt.clinic.city || '' };
  const raw = apt.centre || (typeof apt.clinic === 'string' ? apt.clinic : '');
  if (!raw) return { name: '—', loc: '' };
  if (raw.includes('Rudraksh')) return { name: 'Rudraksh IVF & Urology', loc: '(Sharda Nagar)' };
  if (raw.includes('Shilpi')) return { name: 'Dr. Shilpi Maternity & Urology', loc: '(Pakkabag)' };
  const clean = raw.replace(/^[🌅🌇🌆]\s*/, '').trim();
  const parts = clean.split('(');
  return { name: parts[0]?.trim() || clean, loc: parts[1] ? `(${parts[1]}` : '' };
};

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  const cfg = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    visited:   'bg-blue-50   text-blue-700   border-blue-200',
    pending:   'bg-amber-50  text-amber-700  border-amber-200',
    missed:    'bg-orange-50 text-orange-700 border-orange-200',
    cancelled: 'bg-rose-50   text-rose-700   border-rose-200',
  }[s] || 'bg-slate-50 text-slate-600 border-slate-200';
  const dot = {
    confirmed: 'bg-emerald-500', visited: 'bg-blue-500', pending: 'bg-amber-500',
    missed: 'bg-orange-500', cancelled: 'bg-rose-500',
  }[s] || 'bg-slate-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${cfg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status || '—'}
    </span>
  );
};

/* ── Widget ───────────────────────────────────────────────────────── */
export default function AppointmentsWidget() {
  const { appointments, updateAppointmentStatus } = useAdminData();

  const handleStatus = (apt, newStatus) => {
    if ((apt.status || '').toLowerCase() === 'visited') {
      toast.warn('Visited appointment status cannot be changed.');
      return;
    }
    updateAppointmentStatus(apt.id || apt._id, newStatus);
    toast.success(`Marked as ${newStatus}`);
  };

  const cols = [
    { label: '#',                  w: 'w-10'  },
    { label: 'Action',             w: 'w-36'  },
    { label: 'Status',             w: 'w-28'  },
    { label: 'Patient Name',       w: 'w-48'  },
    { label: 'Phone',              w: 'w-32'  },
    { label: 'Consultation Type',  w: 'w-36'  },
    { label: 'Clinic / Hospital',  w: 'w-52'  },
    { label: 'Date',               w: 'w-32'  },
    { label: 'Time',               w: 'w-28'  },
    { label: 'Reason / Condition', w: 'w-52'  },
    { label: 'Manage',             w: 'w-32'  },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Upcoming Appointments</h3>
          <p className="text-xs text-slate-400 font-medium">Scheduled patient consultations</p>
        </div>
        <Link
          to="/admin/appointments"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-xs" style={{ minWidth: '1080px' }}>
          {/* Table Head */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {cols.map((c) => (
                <th
                  key={c.label}
                  className={`${c.w} py-2.5 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-50">
            {appointments.slice(0, 7).map((apt, idx) => {
              const isVisited = (apt.status || '').toLowerCase() === 'visited';
              const email = getEmail(apt);
              const consultType = getConsultType(apt);
              const clinic = getClinicDisplay(apt);

              const btnBase = 'w-7 h-7 rounded-xl flex items-center justify-center border shadow-2xs transition-all';
              const btnActive = 'hover:scale-105 cursor-pointer';
              const btnDisabled = 'cursor-not-allowed opacity-40 grayscale-[50%]';

              return (
                <tr key={apt.id || idx} className="hover:bg-blue-50/30 transition-colors group">

                  {/* # */}
                  <td className="py-3 px-3 text-center font-bold text-slate-400 whitespace-nowrap">
                    {idx + 1}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 p-1 rounded-xl border ${isVisited ? 'bg-slate-100/60 border-slate-200/60' : 'bg-slate-50 border-slate-100'}`}>
                      <button
                        type="button"
                        disabled={isVisited}
                        onClick={() => handleStatus(apt, 'Confirmed')}
                        title="Mark Confirmed"
                        className={`${btnBase} bg-emerald-50 border-emerald-100 text-emerald-600 ${isVisited ? btnDisabled : `${btnActive} hover:bg-emerald-100`}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        disabled={isVisited}
                        onClick={() => handleStatus(apt, 'Visited')}
                        title="Mark Visited"
                        className={`${btnBase} bg-blue-50 border-blue-100 text-blue-600 ${isVisited ? btnDisabled : `${btnActive} hover:bg-blue-100`}`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        disabled={isVisited}
                        onClick={() => handleStatus(apt, 'Missed')}
                        title="Mark Missed"
                        className={`${btnBase} bg-rose-50 border-rose-100 text-rose-500 ${isVisited ? btnDisabled : `${btnActive} hover:bg-rose-100`}`}
                      >
                        <CalendarX className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        disabled={isVisited}
                        onClick={() => handleStatus(apt, 'Cancelled')}
                        title="Mark Cancelled"
                        className={`${btnBase} bg-rose-50 border-rose-100 text-rose-500 ${isVisited ? btnDisabled : `${btnActive} hover:bg-rose-100`}`}
                      >
                        <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={apt.status} />
                  </td>

                  {/* Patient Name + Email */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{apt.name}</p>
                    {email && (
                      <p className="text-[10px] text-blue-500 flex items-center gap-0.5 mt-0.5">
                        <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                        {email}
                      </p>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-3 text-slate-600 font-semibold whitespace-nowrap">
                    {apt.phone}
                  </td>

                  {/* Consultation Type */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {consultType === 'Follow-up' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        <RotateCw className="w-2.5 h-2.5" />
                        Follow-up
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                        <UserCheck className="w-2.5 h-2.5" />
                        First Visit
                      </span>
                    )}
                  </td>

                  {/* Clinic / Hospital */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p className="font-semibold text-slate-800 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-rose-400 flex-shrink-0" />
                      {clinic.name}
                    </p>
                    {clinic.loc && (
                      <p className="text-[10px] text-slate-400 pl-3.5">{clinic.loc}</p>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                      <CalendarIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {apt.date}
                    </div>
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {apt.time}
                    </div>
                  </td>

                  {/* Reason / Condition */}
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {apt.problem || <span className="text-slate-300">—</span>}
                  </td>

                  {/* Manage */}
                  <td className="py-3 px-3 whitespace-nowrap text-center">
                    <Link
                      to="/appointments"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-[11px] border border-blue-100 transition-all shadow-2xs hover:scale-105"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={11} className="py-10 text-center text-slate-400 text-xs">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex justify-center bg-slate-50/50 flex-shrink-0">
        <Link
          to="/admin/appointments"
          className="py-1.5 px-5 bg-slate-100 hover:bg-blue-600 hover:text-white font-bold text-xs rounded-lg inline-flex items-center justify-center transition-all duration-200 text-slate-700"
        >
          View All Appointments
        </Link>
      </div>
    </div>
  );
}
