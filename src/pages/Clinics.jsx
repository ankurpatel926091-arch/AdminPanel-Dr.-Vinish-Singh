import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  MapPin,
  Phone,
  Clock,
  Plus,
  Building2,
  Sun,
  Moon,
  Maximize2,
  X,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles
} from 'lucide-react';

export default function Clinics() {
  const { clinics, addClinic, updateClinic, toggleClinicStatus, deleteClinic } = useAdminData();
  const [search, setSearch] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);

  const initialFormState = {
    name: '',
    tag: 'Morning OPD',
    badgeLabel: 'MORNING CONSULTATION CENTRE',
    city: 'Lucknow',
    address: '',
    phone: '',
    timings: '',
    image: '',
    mapUrl: '',
    embedUrl: '',
    active: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenAddModal = () => {
    setEditingClinic(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEditModal = (clinic) => {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name || '',
      tag: clinic.tag || 'Morning OPD',
      badgeLabel: clinic.badgeLabel || 'CONSULTATION CENTRE',
      city: clinic.city || '',
      address: clinic.address || '',
      phone: clinic.phone || '',
      timings: clinic.timings || '',
      image: clinic.image || '',
      mapUrl: clinic.mapUrl || '',
      embedUrl: clinic.embedUrl || '',
      active: clinic.active !== undefined ? clinic.active : true
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter clinic name');
      return;
    }

    if (editingClinic) {
      updateClinic(editingClinic.id, formData);
    } else {
      addClinic(formData);
    }
    setShowModal(false);
    setFormData(initialFormState);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteClinic(id);
    }
  };

  const filteredClinics = (clinics || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Frontend Aligned Practice Centres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Clinic Locations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage OPD practice locations, consultation hours, contact helplines and Google Map locations</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Clinic Location
        </button>
      </div>

      {/* Search & Filter Bar */}
      {/* <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clinic name, locality or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div> */}

      {/* Grid of Clinic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClinics.map((c) => {
          const isMorning = (c.tag || '').toLowerCase().includes('morning') || (c.badgeLabel || '').toLowerCase().includes('morning');
          return (
            <div
              key={c.id}
              className={`bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                !c.active ? 'opacity-70 bg-slate-50/80' : ''
              }`}
            >
              {/* Image Box */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-100 group">
                {/* Top-Left Badge */}
                <div
                  className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm uppercase tracking-wider border ${
                    isMorning
                      ? 'bg-white/95 text-amber-700 border-amber-200/80'
                      : 'bg-white/95 text-blue-800 border-blue-200/80'
                  }`}
                >
                  {isMorning ? (
                    <Sun size={13} className="text-amber-500 fill-amber-400" />
                  ) : (
                    <Moon size={13} className="text-blue-600 fill-blue-500" />
                  )}
                  <span>{c.badgeLabel || c.tag || 'CONSULTATION CENTRE'}</span>
                </div>

                {/* Top-Right Full Photo Button */}
                {c.image && (
                  <button
                    type="button"
                    onClick={() => setModalImage(c.image)}
                    className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-slate-200"
                  >
                    <Maximize2 size={12} />
                    <span>Full Photo</span>
                  </button>
                )}

                <img
                  src={
                    c.image ||
                    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800'
                  }
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#0f2a4a] leading-snug">
                      {c.mapUrl ? (
                        <a
                          href={c.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{c.name}</span>
                          <ExternalLink size={14} className="text-blue-500 shrink-0 inline" />
                        </a>
                      ) : (
                        <span>{c.name}</span>
                      )}
                    </h3>

                    <button
                      onClick={() => toggleClinicStatus(c.id)}
                      title={c.active ? 'Click to set Inactive' : 'Click to set Active'}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                        c.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {c.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{c.active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  {/* OPD & Helpline Stacks */}
                  <div className="space-y-2 text-xs">
                    {/* OPD Hours Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          OPD CONSULTATION HOURS
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[#0f2a4a]">
                          {c.timings || '10:00 AM - 03:00 PM'}
                        </p>
                      </div>
                    </div>

                    {/* Helpline Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-[#103F7C] flex items-center justify-center shrink-0">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            APPOINTMENTS &amp; HELPLINE
                          </p>
                          <a
                            href={`tel:${(c.phone || '').replace(/\s+/g, '')}`}
                            className="text-xs sm:text-sm font-extrabold text-[#0f2a4a] hover:text-blue-600 transition-colors"
                          >
                            {c.phone || 'N/A'}
                          </a>
                        </div>
                      </div>

                      {c.phone && (
                        <a
                          href={`tel:${c.phone.replace(/\s+/g, '')}`}
                          className="px-3.5 py-1.5 rounded-full bg-[#103F7C] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                        >
                          <Phone size={12} />
                          <span>Call</span>
                        </a>
                      )}
                    </div>

                    {/* Address Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                      <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {c.address || c.city}
                      </p>
                    </div>

                    {/* Embedded Google Map Frame */}
                    {c.embedUrl && (
                      <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 relative mt-2">
                        <iframe
                          title={`${c.name} Google Map Location`}
                          src={c.embedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          className="w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Clinic</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Clinic Location */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    {editingClinic ? 'Edit Clinic Location' : 'Add New Clinic Location'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure clinic details, consultation hours and Google Map links</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rudraksh IVF & Urology Centre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tag / Session</label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="Morning OPD">Morning OPD</option>
                    <option value="Evening OPD">Evening OPD</option>
                    <option value="Afternoon OPD">Afternoon OPD</option>
                    <option value="Full Day OPD">Full Day OPD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Badge Label</label>
                  <input
                    type="text"
                    placeholder="e.g. MORNING CONSULTATION CENTRE"
                    value={formData.badgeLabel}
                    onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">OPD Consultation Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM – 03:00 PM"
                    value={formData.timings}
                    onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 89600 68307"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">City / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Sharda Nagar, Lucknow"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Address</label>
                <textarea
                  rows="2"
                  placeholder="Full street address of the clinic"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Building Image URL</label>
                <input
                  type="text"
                  placeholder="Image URL for clinic building photo"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Google Maps Direct Link (mapUrl)</label>
                <input
                  type="text"
                  placeholder="https://maps.app.goo.gl/..."
                  value={formData.mapUrl}
                  onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Google Maps Embed URL (embedUrl)</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/maps?q=..."
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="activeCheck" className="text-slate-700 font-medium">Clinic is Active & Open for Consultation</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {editingClinic ? 'Save Changes' : 'Create Clinic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white/10 rounded-3xl overflow-hidden p-2 border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            <img
              src={modalImage}
              alt="Clinic Building Full Photo"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
