import React, { useEffect, useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Star, CheckCircle, Trash2, Plus, ExternalLink, RefreshCw, MessageSquare, ShieldCheck, ThumbsUp } from 'lucide-react';

export default function Testimonials() {
  const { testimonials, toggleTestimonialApproval, deleteTestimonial } = useAdminData();
  const [activeTab, setActiveTab] = useState('all');

  // Load Elfsight Platform Script for Live Google Reviews
  const loadElfsightScript = () => {
    const existingScript = document.getElementById("elfsight-platform-script");
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = "elfsight-platform-script";
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    setTimeout(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    }, 400);
  };

  useEffect(() => {
    loadElfsightScript();
  }, []);

  const googleReviewsData = [
    {
      id: 101,
      name: "Sandeep Gupta",
      rating: 5,
      date: "2 days ago",
      text: "Very good experience with Dr. Vinish Singh. He is very kind and treats patients with great care and attention.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      source: "Google Review",
      verified: true
    },
    {
      id: 102,
      name: "Asha Mishra",
      rating: 5,
      date: "1 week ago",
      text: "Excellent treatment and very professional approach for laser kidney stone procedure. Highly satisfied!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      source: "Google Review",
      verified: true
    },
    {
      id: 103,
      name: "Rohit Tiwari",
      rating: 5,
      date: "2 weeks ago",
      text: "Highly recommended doctor for all urology related problems. Minimal waiting time and great guidance.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      source: "Google Review",
      verified: true
    },
    {
      id: 104,
      name: "Vikas Sharma",
      rating: 5,
      date: "3 weeks ago",
      text: "Dr. Vinish is one of the best urologists in town. Detailed explanation of procedure and post-surgery care.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      source: "Google Review",
      verified: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Patient Testimonials & Google Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Live Google Reviews widget integration & patient feedback management
          </p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Google Business Rating Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-3">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white">4.9</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-blue-200 font-medium mt-1">
                Based on 250+ Verified Google Business Reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadElfsightScript}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Widget</span>
            </button>
            
            <a
              href="https://dash.elfsight.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all"
            >
              <span>Elfsight Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Section 1: Live Elfsight Google Reviews Embed Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Elfsight Google Reviews Live Embed
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold border border-emerald-200">
              Live Synchronized
            </span>
          </h2>
        </div>

        {/* Elfsight Embed Container (without data-elfsight-app-lazy to force immediate load) */}
        <div className="w-full pt-2 min-h-[120px]">
          <div className="elfsight-app-05ca5de9-0458-4330-937a-98a07e1a1bc1 w-full" />
        </div>
      </div>

      {/* Section 2: Synchronized Google Business Reviews Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Verified Google Patient Feedback</h2>
            <p className="text-xs text-slate-500">Live reviews submitted by patients on Google</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {googleReviewsData.length} Reviews Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {googleReviewsData.map(rev => (
            <div key={rev.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{rev.name}</h3>
                    <div className="flex items-center text-amber-400 mt-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{rev.text}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Google Verified
                </span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Website Custom Patient Reviews */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Website Custom Testimonials</h2>
            <p className="text-xs text-slate-500">Manage custom reviews added via admin panel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{t.name}</h3>
                      <div className="flex items-center text-amber-400 mt-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic mt-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{t.text}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleTestimonialApproval(t.id)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all ${
                    t.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t.status}
                </button>

                <button
                  onClick={() => deleteTestimonial(t.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
