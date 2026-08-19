import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { Star, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestimonialsWidget() {
  const { testimonials, toggleTestimonialApproval } = useAdminData();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">Recent Testimonials</h3>
        <Link to="/testimonials" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{t.name}</h4>
                  <div className="flex items-center text-amber-400 mt-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleTestimonialApproval(t.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border flex items-center gap-1 transition-all ${
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
