import React from 'react';
import { MapPin, Phone, Clock, Plus, Building2 } from 'lucide-react';

const clinics = [
  { id: 1, name: 'Apollo Hospital & Urology Clinic', city: 'Lucknow', address: 'Sector B, Bargawan, LDA Colony, Kanpur Road, Lucknow, UP', phone: '+91 98765 43210', timings: '10:00 AM - 02:00 PM (Mon-Sat)' },
  { id: 2, name: 'Vinish Urology Super Specialty Center', city: 'Lucknow', address: 'Hazratganj Main Road, Lucknow, UP', phone: '+91 97654 32101', timings: '04:00 PM - 07:00 PM (Mon-Sat)' }
];

export default function Clinics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Clinic Locations</h1>
          <p className="text-sm text-slate-500 mt-1">OPD practice locations and consultation hours</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all">
          <Plus className="w-4 h-4" /> Add Clinic Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clinics.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{c.name}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{c.city}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{c.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{c.timings}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
