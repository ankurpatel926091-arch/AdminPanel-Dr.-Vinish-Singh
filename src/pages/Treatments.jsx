import React from 'react';
import { Stethoscope, Plus, CheckCircle, ArrowRight } from 'lucide-react';

const treatmentsList = [
  { id: 1, name: 'Kidney Stone Treatment', category: 'Endourology', details: 'RIRS, PCNL, URSL & ESWL laser stone removal treatments.' },
  { id: 2, name: 'Prostate Surgery (BPH)', category: 'Prostate Care', details: 'HOLEP Laser Prostate Surgery & Bipolar TURP procedure.' },
  { id: 3, name: 'Urethral Stricture Surgery', category: 'Reconstructive Urology', details: 'Urethroplasty & Anastomotic Stricture repairs.' },
  { id: 4, name: 'Urology Cancer Care', category: 'Uro-Oncology', details: 'Kidney, Bladder, Prostate & Testicular cancer surgeries.' },
  { id: 5, name: 'Laparoscopic Kidney Surgery', category: 'Minimally Invasive', details: 'Laparoscopic Radical & Partial Nephrectomy.' },
  { id: 6, name: 'Andrology & Male Infertility', category: 'Andrology', details: 'Microscopic Varicocelectomy, Erectile Dysfunction & TESA.' }
];

export default function Treatments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Urology Treatments</h1>
          <p className="text-sm text-slate-500 mt-1">Specialized procedures and surgical treatments</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all">
          <Plus className="w-4 h-4" /> Add Treatment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {treatmentsList.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {t.category}
                </span>
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.details}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Published
              </span>
              <button className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                Edit <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
