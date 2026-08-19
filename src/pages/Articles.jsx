import React from 'react';
import { FileText, Plus, Calendar, ArrowRight } from 'lucide-react';

const articles = [
  { id: 1, title: 'Preventing Kidney Stones: 5 Proven Tips from a Urologist', category: 'Kidney Health', date: '10 May 2025', readTime: '5 min read' },
  { id: 2, title: 'Understanding Prostate Health in Men Over 50', category: 'Prostate Care', date: '02 May 2025', readTime: '4 min read' },
  { id: 3, title: 'Benefits of Minimally Invasive Laser Surgery (RIRS)', category: 'Surgeries', date: '20 Apr 2025', readTime: '6 min read' }
];

export default function Articles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Health Articles & Blogs</h1>
          <p className="text-sm text-slate-500 mt-1">Publish urology education articles for patients</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all">
          <Plus className="w-4 h-4" /> Create New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map(art => (
          <div key={art.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {art.category}
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-3 leading-snug">{art.title}</h3>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {art.date}
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
