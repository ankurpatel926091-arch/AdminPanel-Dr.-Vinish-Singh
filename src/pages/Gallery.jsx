import React, { useState } from 'react';
import { Image as ImageIcon, Video, Upload, Trash2, Eye, Plus, X, Check, FileUp, Link2, Play, CheckCircle2, EyeOff } from 'lucide-react';
import doctorPhoto from '../assets/doctor.jpg';

const CATEGORIES = [
  'All',
  'Photos',
  'Videos',
  'Surgical Setup',
  'Doctor & Care',
  'Clinic Facilities'
];

const sampleGallery = [
  {
    id: 1,
    title: 'Dr. Vinish Kumar Singh - Senior Urologist',
    category: 'Doctor & Care',
    type: 'photo',
    url: doctorPhoto,
    active: true
  },
  {
    id: 2,
    title: 'Advanced Endourology Laser OT Setup',
    category: 'Surgical Setup',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 3,
    title: 'State-of-the-Art Operation Theatre',
    category: 'Surgical Setup',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 4,
    title: 'Patient OPD Consultation Room',
    category: 'Clinic Facilities',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 5,
    title: 'Laser RIRS Kidney Stone Procedure Demo',
    category: 'Videos',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 6,
    title: 'Modern Reception & Patient Lounge',
    category: 'Clinic Facilities',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600',
    active: true
  }
];

export default function Gallery() {
  const [activeTab, setActiveTab] = useState('All');
  const [gallery, setGallery] = useState(sampleGallery);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Form State
  const [uploadSource, setUploadSource] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Photos');
  const [newType, setNewType] = useState('photo');
  const [newUrl, setNewUrl] = useState('');
  const [newActive, setNewActive] = useState(true);

  const filtered = gallery.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Photos') return item.type === 'photo' || item.category === 'Photos';
    if (activeTab === 'Videos') return item.type === 'video' || item.category === 'Videos';
    return item.category === activeTab;
  });

  const getCategoryCount = (categoryName) => {
    if (categoryName === 'All') return gallery.length;
    if (categoryName === 'Photos') return gallery.filter(item => item.type === 'photo' || item.category === 'Photos').length;
    if (categoryName === 'Videos') return gallery.filter(item => item.type === 'video' || item.category === 'Videos').length;
    return gallery.filter(item => item.category === categoryName).length;
  };

  const toggleGalleryStatus = (id) => {
    setGallery(prev => prev.map(img => img.id === id ? { ...img, active: !img.active } : img));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (!newTitle) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setNewTitle(nameWithoutExt);
    }

    if (file.type.startsWith('video/')) {
      setNewType('video');
      setNewCategory('Videos');
    } else {
      setNewType('photo');
      if (newCategory === 'Videos') setNewCategory('Photos');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let mediaUrl = '';
    if (uploadSource === 'file') {
      if (!filePreviewUrl) {
        alert('Please select a local file to upload.');
        return;
      }
      mediaUrl = filePreviewUrl;
    } else {
      mediaUrl = newUrl.trim() || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600';
    }

    const newItem = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      type: newType,
      url: mediaUrl,
      active: newActive,
      isLocal: uploadSource === 'file',
      fileName: selectedFile?.name || ''
    };

    setGallery([newItem, ...gallery]);

    // Reset Form
    setNewTitle('');
    setNewUrl('');
    setSelectedFile(null);
    setFilePreviewUrl('');
    setNewCategory('Photos');
    setNewType('photo');
    setNewActive(true);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      setGallery(prev => prev.filter(img => img.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Photo & Video Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">Manage clinical photos, surgery setups, videos and facility media</p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setUploadSource('file');
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" /> Upload New Media
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {CATEGORIES.map(tab => {
          const count = getCategoryCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab === 'Photos' && <ImageIcon className="w-3.5 h-3.5" />}
              {tab === 'Videos' && <Video className="w-3.5 h-3.5" />}
              <span>{tab}</span>
              <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-extrabold ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(img => (
          <div key={img.id} className={`group relative bg-white rounded-2xl overflow-hidden border shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
            img.active ? 'border-slate-200/80' : 'border-amber-200/70 bg-amber-50/20'
          }`}>
            <div className="h-48 overflow-hidden bg-slate-900 relative">
              {img.type === 'video' && img.url.startsWith('data:video') ? (
                <video src={img.url} className="w-full h-full object-cover" muted />
              ) : (
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
              )}

              {/* Category Pill */}
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-900/80 backdrop-blur-xs text-white border border-white/20 uppercase tracking-wider">
                {img.category}
              </span>

              {/* Media Type Icon Badge */}
              <span className="absolute top-3 right-3 p-1.5 rounded-full bg-blue-600 text-white shadow-md">
                {img.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
              </span>

              {/* Play icon overlay for videos */}
              {img.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg border border-white/40">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                </div>
              )}

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPreviewMedia(img)}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="p-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3.5 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 truncate" title={img.title}>
                  {img.title}
                </h4>
                {img.isLocal && (
                  <span className="text-[10px] font-semibold text-emerald-600 block truncate mt-0.5">
                    Device File: {img.fileName}
                  </span>
                )}
              </div>

              {/* Interactive Clickable Active / Inactive Status Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleGalleryStatus(img.id)}
                  className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    img.active
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                  title="Click to toggle website visibility status"
                >
                  {img.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active on Website</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Inactive / Hidden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No media found in "{activeTab}"</p>
          <p className="text-xs text-slate-400 mt-1">Upload new photos or videos to this category</p>
        </div>
      )}

      {/* Upload Modal with Local File Support & Active Status */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-fadeIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-1">Upload New Media</h3>
            <p className="text-xs text-slate-500 mb-4">Choose a local photo or video file from your computer</p>

            {/* Source Switcher Tabs */}
            <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadSource('file')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  uploadSource === 'file'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadSource('url')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  uploadSource === 'url'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Web Image / URL</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              {/* File Input Drag & Drop Area */}
              {uploadSource === 'file' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Local Photo / Video
                  </label>
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50/80 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center relative group">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {filePreviewUrl ? (
                      <div className="w-full space-y-2">
                        {newType === 'video' ? (
                          <video src={filePreviewUrl} controls className="h-36 w-full object-contain rounded-xl bg-black" />
                        ) : (
                          <img src={filePreviewUrl} alt="Preview" className="h-36 w-full object-contain rounded-xl" />
                        )}
                        <span className="text-xs font-semibold text-blue-600 block truncate">
                          {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <span className="text-[10px] text-slate-400 block">Click to change file</span>
                      </div>
                    ) : (
                      <div className="py-4 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">Click to browse or drop file here</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, WEBP, MP4, MOV, WEBM</p>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Media Image / Video URL
                  </label>
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Paste image or video thumbnail URL"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title / Caption
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Laser Urology OT Setup"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="Photos">Photos</option>
                    <option value="Videos">Videos</option>
                    <option value="Surgical Setup">Surgical Setup</option>
                    <option value="Doctor & Care">Doctor & Care</option>
                    <option value="Clinic Facilities">Clinic Facilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Media Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newActive ? 'active' : 'inactive'}
                    onChange={(e) => setNewActive(e.target.value === 'active')}
                    className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Preview Lightbox Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewMedia(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 text-white bg-slate-900/80 p-2 rounded-full z-10 hover:bg-slate-900 shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="h-80 sm:h-[450px] rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.title} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{previewMedia.title}</h3>
                <span className="text-xs text-blue-600 font-semibold">{previewMedia.category} • {previewMedia.type.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
