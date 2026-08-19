import React, { useState } from 'react';
import { User, Award, Clock, Save, Camera, CheckCircle2 } from 'lucide-react';
import doctorPhoto from '../assets/doctor.jpg';

export default function DoctorProfile() {
  const [profile, setProfile] = useState({
    name: 'Dr. Vinish Kumar Singh',
    title: 'Senior Urologist & Andrologist',
    degrees: 'MBBS, MS (General Surgery), MCh (Urology)',
    experience: '12+ Years Experience',
    bio: 'Dr. Vinish Kumar Singh is a renowned Senior Urologist & Andrologist specializing in Laser Kidney Stone Surgeries (RIRS/PCNL), Advanced Laparoscopic Urology, and Male Infertility treatments.',
    consultationFee: '₹800',
    opdHours: 'Mon - Sat: 10:00 AM - 05:00 PM'
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Doctor Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage doctor bio, qualifications, and consultation timing shown on website</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Doctor Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Doctor Photo Header */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative">
            <img
              src={doctorPhoto}
              alt="Dr. Vinish Singh"
              loading="lazy"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/20 shadow-md"
            />
            <button type="button" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800">{profile.name}</h3>
            <p className="text-xs text-blue-600 font-semibold">{profile.title}</p>
            <p className="text-xs text-slate-400 mt-1">{profile.degrees}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Doctor Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specialization Title</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Medical Degrees</label>
            <input
              type="text"
              value={profile.degrees}
              onChange={(e) => setProfile({ ...profile, degrees: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience</label>
            <input
              type="text"
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Biography & Overview</label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}
