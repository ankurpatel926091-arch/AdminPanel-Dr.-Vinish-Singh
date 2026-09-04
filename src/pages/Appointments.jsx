import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { toast } from 'react-toastify';
import {
  Calendar as CalendarIcon,
  CalendarX,
  CalendarCheck,
  Search,
  Plus,
  Clock,
  Building2,
  Stethoscope,
  X,
  Send,
  Hourglass,
  CheckCircle2,
  Phone,
  Mail,
  XCircle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RotateCw,
  Layers
} from 'lucide-react';

const HOSPITAL_CENTRES = [
  '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 03 PM)',
  '🌆 Evening OPD: Dr. Shilpi Maternity & Urology Centre (Pakkabag, 03 PM - 07 PM)'
];

const SPECIALITY_CONDITIONS = [
  'Laser Kidney Stones (RIRS / PCNL)',
  'Prostate Care & Enlargement (BPH / TURP)',
  'Urine Leakage & UTI Infection',
  'Kidney Health Followup',
  'General Urology Consultation',
  'Kidney Stone Consultation',
  'Male Infertility Consultation'
];

const formatClinicDisplay = (fullString) => {
  if (!fullString) return { name: 'Rudraksh IVF & Urology', loc: '(Sharda Nagar)' };
  if (fullString.includes('Rudraksh')) {
    return { name: 'Rudraksh IVF & Urology', loc: '(Sharda Nagar)' };
  }
  if (fullString.includes('Shilpi')) {
    return { name: 'Dr. Shilpi Maternity & Urology', loc: '(Pakkabag)' };
  }
  if (fullString.includes('Apollomedics')) {
    return { name: 'Apollomedics Hospital', loc: '(LDA Colony)' };
  }
  if (fullString.includes('Chandan')) {
    return { name: 'Chandan Hospital', loc: '(Faizabad Road)' };
  }
  const clean = fullString.replace(/^[🌅🌇🌆]\s*/, '').trim();
  const parts = clean.split('(');
  return {
    name: parts[0]?.trim() || clean,
    loc: parts[1] ? `(${parts[1]}` : ''
  };
};

const getAppointmentConsultationType = (apt) => {
  if (!apt) return 'First Visit';

  const msg = (apt.message || '').toLowerCase();
  if (msg.includes('type: follow') || msg.includes('follow-up') || msg.includes('followup')) {
    return 'Follow-up';
  }
  if (msg.includes('type: first') || msg.includes('first visit')) {
    return 'First Visit';
  }

  const typeStr = (apt.consultationType || '').toLowerCase();
  if (typeStr.includes('follow')) {
    return 'Follow-up';
  }

  return 'First Visit';
};

const getAppointmentEmail = (apt) => {
  if (!apt) return '';
  if (apt.email && apt.email.trim()) return apt.email.trim();
  const msg = apt.message || '';
  const match = msg.match(/Email:\s*([^\s|]+)/i);
  if (match && match[1] && match[1] !== 'N/A') {
    return match[1].trim();
  }
  return '';
};

const cleanNotesMessage = (msg) => {
  if (!msg) return '';
  if (msg.includes('Notes:')) {
    const parts = msg.split('Notes:');
    const realNotes = parts[parts.length - 1].trim();
    if (realNotes && realNotes !== 'N/A' && realNotes !== 'Appointment booking request from website') {
      return realNotes;
    }
    return '';
  }
  if (!msg.includes('|')) return msg.trim();
  return '';
};

export default function Appointments() {
  const { appointments, addAppointment, updateAppointmentStatus, deleteAppointment } = useAdminData();
  const [filter, setFilter] = useState('All');
  const [consultationTypeFilter, setConsultationTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewAppointment, setViewAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleDeleteAppointment = (apt) => {
    if (window.confirm(`Are you sure you want to delete the appointment for "${apt.name}"?`)) {
      deleteAppointment(apt.id);
      toast.success(`Appointment for "${apt.name}" deleted successfully!`);
      if (viewAppointment && (viewAppointment.id === apt.id || viewAppointment._id === apt.id)) {
        setViewAppointment(null);
      }
    }
  };

  // Add Appointment Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consultationType: 'First Visit',
    centre: HOSPITAL_CENTRES[0],
    problem: SPECIALITY_CONDITIONS[0],
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    message: '',
    status: 'Confirmed'
  });

  const filtered = appointments.filter(apt => {
    const matchesFilter = filter === 'All' || (apt.status || '').toLowerCase() === filter.toLowerCase();
    const aptType = getAppointmentConsultationType(apt);
    const matchesType = consultationTypeFilter === 'All' || aptType.toLowerCase() === consultationTypeFilter.toLowerCase();
    const aptEmail = getAppointmentEmail(apt);
    const matchesSearch = (apt.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (apt.phone || '').includes(search) ||
                          aptEmail.toLowerCase().includes(search.toLowerCase()) ||
                          (apt.problem || '').toLowerCase().includes(search.toLowerCase()) ||
                          (apt.centre || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesType && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in patient name and phone number.');
      return;
    }

    let formattedDate = formData.date;
    try {
      const d = new Date(formData.date);
      formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      formattedDate = formData.date;
    }

    const newAptObj = {
      id: Date.now(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      consultationType: formData.consultationType || 'First Visit',
      centre: formData.centre,
      problem: formData.problem,
      date: formattedDate,
      time: formData.time,
      message: formData.message.trim() ? `Type: ${formData.consultationType} | Email: ${formData.email.trim() || 'N/A'} | ${formData.message.trim()}` : `Type: ${formData.consultationType} | Email: ${formData.email.trim() || 'N/A'}`,
      status: formData.status
    };

    addAppointment(newAptObj);
    toast.success('Appointment created successfully!');

    setFormData({
      name: '',
      phone: '',
      email: '',
      consultationType: 'First Visit',
      centre: HOSPITAL_CENTRES[0],
      problem: SPECIALITY_CONDITIONS[0],
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
      message: '',
      status: 'Confirmed'
    });
    setShowAddModal(false);
  };

  const handleStatusChange = (aptId, newStatus) => {
    updateAppointmentStatus(aptId, newStatus);
    if (newStatus === 'Confirmed') {
      toast.success(`Appointment Confirmed! Confirmation email sent to patient.`);
    } else if (newStatus === 'Cancelled') {
      toast.info(`Appointment Cancelled! Cancellation email sent to patient.`);
    } else if (newStatus === 'Visited') {
      toast.success(`Appointment marked as Visited!`);
    } else {
      toast.info(`Appointment status changed to ${newStatus}`);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Confirmed</span>
        </span>
      );
    }
    if (s === 'visited') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>Visited</span>
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Cancelled</span>
        </span>
      );
    }
    if (s === 'missed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Missed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Pending</span>
      </span>
    );
  };

  const getConsultationTypeBadge = (apt) => {
    const type = getAppointmentConsultationType(apt);
    if (type === 'Follow-up') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-extrabold whitespace-nowrap shadow-2xs">
          <RotateCw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Follow-up</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-extrabold whitespace-nowrap shadow-2xs">
        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>First Visit</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ================= 1. PAGE HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Patient Appointments</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Schedule and manage hospital &amp; clinic consultations</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Search Input Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patient, phone, condition..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* ================= 2. FILTER PILLS BAR ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Filters (Left) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Pending', 'Confirmed', 'Visited', 'Missed', 'Cancelled'].map(tab => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2 text-xs font-extrabold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Consultation Type Filter (Right) */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Consultation Type:</span>
          <button
            type="button"
            onClick={() => {
              setConsultationTypeFilter('All');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              consultationTypeFilter === 'All'
                ? 'bg-white border-2 border-slate-900 text-blue-700 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>All Types</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setConsultationTypeFilter('First Visit');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              consultationTypeFilter === 'First Visit'
                ? 'bg-emerald-50 border-2 border-slate-900 text-emerald-800 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>First Visit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setConsultationTypeFilter('Follow-up');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              consultationTypeFilter === 'Follow-up'
                ? 'bg-purple-50 border-2 border-slate-900 text-purple-800 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Follow-up</span>
          </button>
        </div>
      </div>

      {/* ================= 3. APPOINTMENTS TABLE CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1280px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-3 text-center w-12">#</th>
                <th className="py-3.5 px-4 text-center min-w-[180px]">Action</th>
                <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                <th className="py-3.5 px-4 min-w-[180px]">Patient Name</th>
                <th className="py-3.5 px-4 min-w-[130px]">Phone</th>
                <th className="py-3.5 px-4 min-w-[135px]">Consultation Type</th>
                <th className="py-3.5 px-4 min-w-[220px]">Clinic / Hospital</th>
                <th className="py-3.5 px-4 min-w-[120px]">Date</th>
                <th className="py-3.5 px-4 min-w-[100px]">Time</th>
                <th className="py-3.5 px-4 min-w-[220px]">Reason / Condition</th>
                <th className="py-3.5 px-4 text-center min-w-[180px]">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedAppointments.map((apt, index) => {
                const clinic = formatClinicDisplay(apt.centre);
                const globalIdx = startIndex + index + 1;

                return (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Index */}
                    <td className="py-4 pl-6 pr-3 text-center font-bold text-slate-400">
                      {globalIdx}
                    </td>

                    {/* 4 Action Buttons in Soft Horizontal Bar */}
                    <td className="py-3 px-4 text-center whitespace-nowrap min-w-[180px]">
                      <div className="inline-flex items-center justify-center gap-1.5 p-1.5 bg-slate-50/80 rounded-2xl border border-slate-100/80">
                        {/* 1. Confirmed Button (Emerald Checkmark) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                          title="Mark as Confirmed"
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        </button>

                        {/* 2. Visited Button (Blue CalendarCheck) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'Visited')}
                          title="Mark as Visited"
                          className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4 text-blue-600" strokeWidth={2} />
                        </button>

                        {/* 3. Missed Button (CalendarX) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'Missed')}
                          title="Mark as Missed"
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <CalendarX className="w-4 h-4 text-rose-600" strokeWidth={2} />
                        </button>

                        {/* 4. Cancelled Button (Red X Circle) */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                          title="Mark as Cancelled"
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2} />
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>

                    {/* Patient Name & Gmail */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{apt.name}</div>
                      {getAppointmentEmail(apt) && (
                        <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>{getAppointmentEmail(apt)}</span>
                        </div>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 text-slate-600 font-semibold whitespace-nowrap">
                      {apt.phone}
                    </td>

                    {/* Consultation Type Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getConsultationTypeBadge(apt)}
                    </td>

                    {/* Clinic / Hospital */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{clinic.name}</div>
                      {clinic.loc && <div className="text-[11px] text-slate-500">{clinic.loc}</div>}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-slate-700 font-semibold">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{apt.date}</span>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{apt.time}</span>
                      </div>
                    </td>

                    {/* Reason / Condition */}
                    <td className="py-4 px-4 font-semibold text-slate-800 min-w-[220px]">
                      {apt.problem}
                    </td>

                    {/* Manage Column (View Details & Delete) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap min-w-[180px]">
                      <div className="inline-flex items-center justify-center gap-2">
                        {/* View Details Pill Button */}
                        <button
                          type="button"
                          onClick={() => setViewAppointment(apt)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs border border-blue-100/80 transition-all cursor-pointer shadow-2xs hover:scale-102"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Details</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(apt)}
                          title="Delete Appointment"
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">No appointments found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filter or search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        {filtered.length > 0 && (
          <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} appointments
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ================= 4. ACTION ICONS GUIDE BOTTOM BANNER ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2 text-slate-500 font-extrabold">
          <span className="text-slate-400">↔</span>
          <span>Action Icons Guide:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Confirmed Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-800">Confirmed</span>
          </div>

          {/* Visited Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-800">Visited</span>
          </div>

          {/* Missed Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center">
              <CalendarX className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-800">Missed</span>
          </div>

          {/* Cancelled Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-800">Cancelled</span>
          </div>
        </div>
      </div>

      {/* ================= 5. ADD APPOINTMENT MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                Select hospital centre and submit request for direct OPD confirmation.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Patient Name"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gmail / Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Gmail / Email Address"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Consultation Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.consultationType}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="First Visit">First Visit</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Hospital Centre <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.centre}
                    onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                    required
                  >
                    {HOSPITAL_CENTRES.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Speciality / Condition
                </label>
                <select
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  {SPECIALITY_CONDITIONS.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
                  >
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:20 AM">11:20 AM</option>
                    <option value="12:15 PM">12:15 PM</option>
                    <option value="01:45 PM">01:45 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Visited">Visited</option>
                    <option value="Missed">Missed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe symptoms or query..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Appointment Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 5. VIEW APPOINTMENT DETAILS MODAL ================= */}
      {viewAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-fadeIn">
            <button
              onClick={() => setViewAppointment(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Clean Light Card matching Reference Photo 2 */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 mb-5 mt-2">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-left">
                {/* Patient Name */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Patient Name:</div>
                  <div className="text-sm font-extrabold text-slate-900">{viewAppointment.name}</div>
                </div>

                {/* Phone */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Phone:</div>
                  <div className="text-sm font-extrabold text-slate-900">{viewAppointment.phone}</div>
                </div>

                {/* Gmail / Email */}
                {getAppointmentEmail(viewAppointment) ? (
                  <div className="col-span-2 sm:col-span-1">
                    <div className="text-xs font-semibold text-slate-400 mb-1">Gmail / Email:</div>
                    <div className="text-xs sm:text-sm font-bold text-blue-600 break-all">{getAppointmentEmail(viewAppointment)}</div>
                  </div>
                ) : null}

                {/* Subject / Treatment */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Subject / Treatment:</div>
                  <div className="text-xs sm:text-sm font-extrabold text-blue-600">{viewAppointment.problem}</div>
                </div>

                {/* Date & Time */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Date & Time:</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800">
                    {viewAppointment.date} {viewAppointment.time ? `• ${viewAppointment.time}` : ''}
                  </div>
                </div>

                {/* Consultation Type */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Consultation Type:</div>
                  <div className="text-xs font-extrabold text-slate-800">{getAppointmentConsultationType(viewAppointment)}</div>
                </div>
              </div>
            </div>

            {/* Message Content Box matching Reference Photo 2 */}
            <div className="space-y-2 mb-6 text-left">
              <div className="text-xs font-bold text-slate-700">Message Content:</div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed min-h-[60px]">
                {cleanNotesMessage(viewAppointment.message) || (
                  <span className="text-slate-400 italic">No additional message provided.</span>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDeleteAppointment(viewAppointment)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs border border-rose-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setViewAppointment(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
