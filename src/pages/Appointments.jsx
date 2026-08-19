import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import StatusBadge from '../components/common/StatusBadge';
import { Calendar as CalendarIcon, Search, Plus, CheckCircle, XCircle, Clock, Building2, Stethoscope, MessageSquare, Trash2, X, Send } from 'lucide-react';

const HOSPITAL_CENTRES = [
  '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 01 PM)',
  '🌇 Afternoon OPD: Apollomedics Super Speciality Hospital (LDA Colony, 02 PM - 04 PM)',
  '🌆 Evening OPD: Chandan Hospital (Faizabad Road, 05 PM - 07 PM)'
];

const SPECIALITY_CONDITIONS = [
  'Laser Kidney Stones (RIRS / PCNL)',
  'Prostate Care & Enlargement (BPH / TURP)',
  'Urine Leakage & UTI Infection',
  'Male Infertility & Sexual Health',
  'Laparoscopic Kidney Surgery',
  'General Urology Consultation'
];

const cleanHospitalName = (fullString) => {
  if (!fullString) return 'Clinic OPD';
  if (fullString.includes('Rudraksh')) return 'Rudraksh IVF & Urology (Sharda Nagar)';
  if (fullString.includes('Apollomedics')) return 'Apollomedics Hospital (LDA Colony)';
  if (fullString.includes('Chandan')) return 'Chandan Hospital (Faizabad Road)';
  return fullString.replace(/^[🌅🌇🌆]\s*/, '').split('(')[0].trim();
};

export default function Appointments() {
  const { appointments, addAppointment, updateAppointmentStatus, deleteAppointment } = useAdminData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State matching Reference Image 1
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
    const matchesFilter = filter === 'All' || apt.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = (apt.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (apt.phone || '').includes(search) ||
                          (apt.problem || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Patient Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and manage hospital & clinic consultations</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patient, phone, condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 whitespace-nowrap transition-all"
          >
            <Plus className="w-4 h-4" /> Add Appointment
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {['All', 'Pending', 'Confirmed', 'Cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Streamlined Clean Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(apt => (
          <div key={apt.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header: Name, Phone & Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 leading-tight">{apt.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{apt.phone}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>

              {/* Compact Hospital Centre Tag */}
              {apt.centre && (
                <div className="px-3 py-1.5 bg-blue-50/80 rounded-xl border border-blue-100/80 flex items-center gap-2 text-xs font-bold text-blue-900 truncate">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate" title={apt.centre}>{cleanHospitalName(apt.centre)}</span>
                </div>
              )}

              {/* Compact Date, Time & Condition Info */}
              <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-800">{apt.date} • {apt.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-semibold text-blue-600 truncate">{apt.problem}</span>
                </div>

                {apt.message && (
                  <div className="flex items-start gap-1.5 text-slate-500 italic text-[11px] pt-1">
                    <MessageSquare className="w-3 h-3 text-slate-400 shrink-0 mt-0.5 not-italic" />
                    <span className="line-clamp-2">"{apt.message}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* Compact Actions Footer */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              {apt.status !== 'Confirmed' && (
                <button
                  onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                  className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm
                </button>
              )}
              {apt.status !== 'Cancelled' && (
                <button
                  onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                  className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
              <button
                onClick={() => handleDelete(apt.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Appointment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">Add a new patient appointment using the button above</p>
        </div>
      )}

      {/* ================= BOOK APPOINTMENT MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-fadeIn">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                Select your preferred hospital centre and submit your request for direct OPD confirmation.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Full Name"
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
                    placeholder="+91 98765 43210"
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
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
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
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message (Optional)
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
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
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
