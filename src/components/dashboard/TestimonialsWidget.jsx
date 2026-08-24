import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { Star, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestimonialsWidget() {
  const { testimonials, toggleTestimonialApproval } = useAdminData();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Recent Testimonials</h3>
          <p className="text-xs text-slate-400 font-medium">Patient feedback & ratings</p>
        </div>
        <Link to="/testimonials" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 transition-colors">
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200/60 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{t.name}</h4>
                  <div className="flex items-center text-amber-400 mt-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleTestimonialApproval(t.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full border flex items-center gap-1 transition-all cursor-pointer ${
                  t.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {t.status}
              </button>
            </div>

            <p className="text-xs text-slate-600 italic mt-2.5 leading-relaxed">
              "{t.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
