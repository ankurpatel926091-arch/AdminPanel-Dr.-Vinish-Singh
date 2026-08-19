import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, X, Check, Stethoscope, Shield, Scissors, Activity, HeartPulse, RefreshCw, EyeOff } from 'lucide-react';

const ICON_MAP = {
  Stethoscope,
  Shield,
  Scissors,
  Activity,
  HeartPulse,
  RefreshCw,
  Layers
};

export default function Services() {
  const { services, addService, updateService, toggleServiceStatus, deleteService } = useAdminData();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    icon: 'Stethoscope',
    highlights: '',
    active: true
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      icon: 'Stethoscope',
      highlights: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title || '',
      subtitle: service.subtitle || '',
      description: service.description || '',
      icon: service.icon || 'Stethoscope',
      highlights: (service.highlights || []).join('\n'),
      active: service.active ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const highlightsArray = formData.highlights
      .split('\n')
      .map(h => h.trim())
      .filter(Boolean);

    if (editingId) {
      updateService(editingId, {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        highlights: highlightsArray,
        active: formData.active
      });
    } else {
      addService({
        id: Date.now(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || 'Clinical Speciality Service',
        description: formData.description.trim() || 'Comprehensive diagnosis and surgical treatment.',
        icon: formData.icon,
        highlights: highlightsArray.length > 0 ? highlightsArray : ['Comprehensive Clinical Evaluation', 'Advanced Procedure Care'],
        active: formData.active
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteService(id);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Medical Services</h1>
          <p className="text-sm text-slate-500 mt-1">Manage core urology clinical services offered to patients</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Services Grid matching Reference Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {services.map(service => {
          const IconComp = ICON_MAP[service.icon] || Layers;
          return (
            <div key={service.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal(service)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800">{service.title}</h3>
                  {service.subtitle && (
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{service.subtitle}</p>
                  )}
                  {service.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{service.description}</p>
                  )}
                </div>

                {/* Highlights List if present */}
                {service.highlights && service.highlights.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    service.active
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      : 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Click to toggle status"
                >
                  {service.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active on Website
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" /> Draft / Hidden
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No medical services added yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "+ Add New Service" to create your first clinical service</p>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {editingId ? 'Edit Medical Service' : 'Add New Medical Service'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configure specialty details displayed on the website
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Kidney Stone Treatment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Laser Lithotripsy, RIRS & PCNL procedures."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="Stethoscope">Stethoscope</option>
                    <option value="Shield">Shield</option>
                    <option value="Scissors">Scissors</option>
                    <option value="Activity">Activity</option>
                    <option value="HeartPulse">Heart Pulse</option>
                    <option value="RefreshCw">Refresh / Transplant</option>
                    <option value="Layers">Layers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Website Status
                  </label>
                  <select
                    value={formData.active ? 'active' : 'draft'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="active">Active on Website</option>
                    <option value="draft">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of clinical service..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Key Highlights (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="Stitchless Laser RIRS & PCNL&#10;Bladder Stone Surgery"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
