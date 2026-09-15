import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { toast } from 'react-toastify';
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  Hourglass,
  Plus,
  Search,
  Building2,
  Phone,
  UserCheck,
  Calendar,
  X,
  Send,
  Eye,
  RotateCw,
  Layers,
  Activity,
  FileText
} from 'lucide-react';

const CLINICS = [
  { id: 1, name: 'Rudraksh IVF & Urology Centre (Sharda Nagar)', timings: 'Morning: 10:00 AM - 03:00 PM' },
  { id: 2, name: 'Dr. Shilpi Maternity & Urology Centre (Pakkabag)', timings: 'Evening: 03:00 PM - 07:00 PM' }
];

export default function OpdManagement() {
  const { appointments, addAppointment, updateAppointmentStatus } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form State for New Token
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    age: '',
    gender: 'Male',
    doctor: 'Dr. Vinish Kumar Singh',
    clinic: CLINICS[0].name,
    speciality: 'General Urology Consultation',
  });

  // Filter OPD queue list
  const opdList = (appointments || []).filter((apt) => {
    const matchesSearch =
      (apt.patientName || apt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.uhid || apt.token || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.phone || '').includes(searchTerm);

    const matchesClinic = selectedClinic === 'All' || (apt.clinic || '').includes(selectedClinic);
    const matchesStatus = selectedStatus === 'All' || (apt.status || 'Pending').toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesClinic && matchesStatus;
  });

  // Counters
  const totalOpd = opdList.length;
  const waitingCount = opdList.filter((item) => item.status === 'Waiting' || item.status === 'Pending').length;
  const consultingCount = opdList.filter((item) => item.status === 'Consulting' || item.status === 'In Progress').length;
  const completedCount = opdList.filter((item) => item.status === 'Completed' || item.status === 'Visited').length;

  const currentConsulting = opdList.find((item) => item.status === 'Consulting') || opdList[0];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.phone) {
      toast.error('Please fill patient name and phone number');
      return;
    }

    const newToken = `T-${String(opdList.length + 1).padStart(3, '0')}`;
    const newRecord = {
      id: Date.now(),
      token: newToken,
      patientName: formData.patientName,
      phone: formData.phone,
      ageGender: `${formData.age || '30'} yrs / ${formData.gender}`,
      uhid: `UHID-${Math.floor(10000 + Math.random() * 90000)}`,
      doctor: formData.doctor,
      clinic: formData.clinic,
      speciality: formData.speciality,
      status: 'Waiting',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB'),
    };

    if (addAppointment) {
      addAppointment(newRecord);
    }
    toast.success(`OPD Token ${newToken} generated successfully!`);
    setShowAddModal(false);
    setFormData({
      patientName: '',
      phone: '',
      age: '',
      gender: 'Male',
      doctor: 'Dr. Vinish Kumar Singh',
      clinic: CLINICS[0].name,
      speciality: 'General Urology Consultation',
    });
  };

  const handleStatusChange = (id, newStatus) => {
    if (updateAppointmentStatus) {
      updateAppointmentStatus(id, newStatus);
    }
    toast.info(`OPD Patient status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl border border-blue-800/40 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              OPD OPERATIONS & QUEUE
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-blue-400" />
            OPD Management
          </h1>
          <p className="text-sm text-slate-300">
            Operationally monitor OPD patient tokens, live doctor queues, and consultation statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New OPD Check-in
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total OPD Patients</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalOpd}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-amber-600 tracking-wider">Waiting Queue</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{waitingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Hourglass className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-indigo-600 tracking-wider">In Consultation</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{consultingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Completed OPD</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* OPD Shift Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLINICS.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">{c.timings}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient Name, UHID, Token #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Queue Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="Consulting">Consulting</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* OPD Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Today's OPD Queue List ({opdList.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">TOKEN #</th>
                <th className="p-4">PATIENT NAME</th>
                <th className="p-4">UHID / PHONE</th>
                <th className="p-4">DOCTOR</th>
                <th className="p-4">CHECK-IN TIME</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opdList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    No OPD patients found matching criteria.
                  </td>
                </tr>
              ) : (
                opdList.map((item, idx) => {
                  const status = item.status || 'Waiting';
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-600 text-white font-black rounded-lg text-xs shadow-sm">
                          {item.token || `T-${String(idx + 1).padStart(3, '0')}`}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-sm">{item.patientName || item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.ageGender || '32 yrs / Male'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700">{item.uhid || 'UHID-10293'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.phone || '+91 9876543210'}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {item.doctor || 'Dr. Vinish Kumar Singh'}
                      </td>
                      <td className="p-4 font-semibold text-slate-500">
                        {item.checkInTime || '10:30 AM'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            status === 'Consulting'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : status === 'Completed' || status === 'Visited'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'Completed')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors"
                            >
                              Finish OPD
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPatient(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Patient Info"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New OPD Check-in Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                New OPD Token Check-in
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ankur Patel"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Age / Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-1/2 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-1/2 px-2 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">OPD Centre / Clinic</label>
                <select
                  value={formData.clinic}
                  onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {CLINICS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.timings})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Generate OPD Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Drawer / Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">OPD Patient Details</h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="font-bold text-blue-900 text-base">{selectedPatient.patientName || selectedPatient.name}</span>
                <span className="px-2.5 py-1 bg-blue-600 text-white font-extrabold text-xs rounded-lg">{selectedPatient.token || 'T-001'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div><span className="font-bold">UHID:</span> {selectedPatient.uhid || 'UHID-10293'}</div>
                <div><span className="font-bold">Phone:</span> {selectedPatient.phone || '9876543210'}</div>
                <div><span className="font-bold">Doctor:</span> {selectedPatient.doctor || 'Dr. Vinish Kumar Singh'}</div>
                <div><span className="font-bold">Status:</span> {selectedPatient.status || 'Waiting'}</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-800 text-white font-semibold text-xs rounded-xl"
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
