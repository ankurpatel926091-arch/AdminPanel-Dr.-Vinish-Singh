import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Calendar as CalendarIcon,
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
  XCircle,
  ChevronLeft,
  ChevronRight
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

export default function Appointments() {
  const { appointments, addAppointment, updateAppointmentStatus, deleteAppointment } = useAdminData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Add Appointment Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    centre: HOSPITAL_CENTRES[0],
    problem: SPECIALITY_CONDITIONS[0],
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    message: '',
    status: 'Confirmed'
  });

  const filtered = appointments.filter(apt => {
    const matchesFilter = filter === 'All' || (apt.status || '').toLowerCase() === filter.toLowerCase();
    const matchesSearch = (apt.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (apt.phone || '').includes(search) ||
                          (apt.problem || '').toLowerCase().includes(search.toLowerCase()) ||
                          (apt.centre || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
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
      centre: formData.centre,
      problem: formData.problem,
      date: formattedDate,
      time: formData.time,
      message: formData.message.trim(),
      status: formData.status
    };

    addAppointment(newAptObj);

    setFormData({
      name: '',
      phone: '',
      centre: HOSPITAL_CENTRES[0],
      problem: SPECIALITY_CONDITIONS[0],
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
      message: '',
      status: 'Confirmed'
    });
    setShowAddModal(false);
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
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

          {/* Add Appointment Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 min-w-fit transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Add Appointment</span>
          </button>
        </div>
      </div>

      {/* ================= 2. FILTER PILLS BAR ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Pending', 'Confirmed', 'Missed', 'Cancelled'].map(tab => {
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

      {/* ================= 3. APPOINTMENTS TABLE CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-3 text-center w-12">#</th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Clinic / Hospital</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 max-w-[220px]">Reason / Condition</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Action</th>
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

                    {/* Patient Name */}
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {apt.name}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 text-slate-600 font-semibold whitespace-nowrap">
                      {apt.phone}
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
                    <td className="py-4 px-4 font-medium text-slate-800 max-w-[220px]">
                      {apt.problem}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>

                    {/* 4 Action Buttons in Soft Container Grid */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-grid grid-cols-2 gap-1.5 justify-center items-center p-1 bg-slate-50/80 rounded-2xl border border-slate-100/80">
                        {/* Top Left: 1. Pending Button (Amber Hourglass) */}
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'Pending')}
                          title="Mark as Pending"
                          className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <Hourglass className="w-4 h-4 text-amber-600" strokeWidth={2} />
                        </button>

                        {/* Top Right: 2. Confirmed Button (Emerald Checkmark) */}
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                          title="Mark as Confirmed"
                          className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                        </button>

                        {/* Bottom Left: 3. Missed Button (Blue Phone) */}
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'Missed')}
                          title="Mark as Missed"
                          className="w-8 h-8 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <Phone className="w-4 h-4 text-sky-600" strokeWidth={2} />
                        </button>

                        {/* Bottom Right: 4. Cancelled Button (Red X Circle) */}
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                          title="Mark as Cancelled"
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center shadow-2xs hover:scale-105 transition-all cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} entries
            </div>

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
          {/* Pending Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center">
              <Hourglass className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-800">Pending</span>
          </div>

          {/* Confirmed Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            </div>
            <span className="font-bold text-slate-800">Confirmed</span>
          </div>

          {/* Missed Guide */}
          <div className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-sky-50 border border-sky-200/60 text-sky-600 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" strokeWidth={2} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Patient Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Hospital Centre <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.centre}
                  onChange={(e) => setFormData({ ...formData, centre: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  required
                >
                  {HOSPITAL_CENTRES.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Speciality / Condition
                </label>
                <select
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
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
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
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
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
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
    </div>
  );
}
