import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Stethoscope,
  KeyRound,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import doctorPhoto from '../assets/doctor.jpg';

export default function Login() {
  const [email, setEmail] = useState('admin@drvinish.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-950 flex items-center justify-center p-3 sm:p-4 lg:p-6 font-sans overflow-y-auto lg:overflow-hidden relative select-none">
      {/* Decorative Ambient Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Micro Grid Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />

      {/* Main Container Box */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800/40 my-auto relative z-10 backdrop-blur-xl">
        
        {/* Left Dark Blue Executive Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0B1E3B] via-[#07152B] to-[#040C19] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Watermark Graphic */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
            <svg className="w-96 h-96 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6v12M6 12h12" />
            </svg>
          </div>

          <div className="relative z-10 text-center">
            {/* Doctor Circular Avatar */}
            <div className="relative inline-block mx-auto mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-blue-400/40 p-1.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-600 shadow-2xl shadow-blue-500/20 relative group">
                <img
                  src={doctorPhoto}
                  alt="Dr. Vinish Kumar Singh"
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-[#07152B]">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Verified Administrator
            </div>

            {/* Doctor Info */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dr. Vinish Kumar Singh
            </h2>
            <p className="text-blue-400 font-semibold text-xs sm:text-sm mt-0.5">
              Urologist & Andrologist
            </p>

            {/* Doctor Quote Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-inner max-w-xs mx-auto">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Dedicated to providing advanced urological care with compassion and excellence."
              </p>
            </div>
          </div>

          {/* Bottom Security Highlights */}
          <div className="relative z-10 mt-5 grid grid-cols-3 gap-2 text-center border-t border-slate-800/80 pt-4">
            <div className="flex flex-col items-center group cursor-default">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1.5 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">Secure Access</span>
            </div>

            <div className="flex flex-col items-center group cursor-default">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1.5 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 shadow-sm">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">Protected Data</span>
            </div>

            <div className="flex flex-col items-center group cursor-default">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1.5 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Right White Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between bg-white">
          <div>
            {/* Top Emblem Logo */}
            <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-2.5 shadow-lg shadow-blue-600/25 p-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                Welcome Back!
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sign in to your admin portal dashboard
              </p>
              <div className="w-10 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-2"></div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all duration-200 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all duration-200 shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  Remember me
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Demo: Contact system developer to reset admin password.'); }} 
                  className="text-blue-600 font-semibold hover:text-indigo-600 transition-colors hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-200 group"
              >
                <Lock className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Login to Dashboard</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
              </button>
            </form>

            {/* Social / Security Key Options */}
            <div className="mt-4 sm:mt-5 max-w-md mx-auto">
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  or continue with
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-2.5">
                <button 
                  onClick={handleSubmit} 
                  className="flex items-center justify-center py-2 px-4 border border-slate-200 rounded-xl hover:bg-blue-50/60 hover:border-blue-200 transition-all duration-200 shadow-2xs group"
                  title="Sign in with Google"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </button>

                <button 
                  onClick={handleSubmit}
                  className="flex items-center justify-center py-2 px-4 border border-slate-200 rounded-xl hover:bg-blue-50/60 hover:border-blue-200 transition-all duration-200 shadow-2xs group"
                  title="Sign in with Microsoft"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                </button>

                <button 
                  onClick={handleSubmit}
                  className="flex items-center justify-center py-2 px-4 border border-slate-200 rounded-xl hover:bg-blue-50/60 hover:border-blue-200 transition-all duration-200 shadow-2xs group"
                  title="Sign in with Security Passkey"
                >
                  <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-slate-400 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              256-Bit SSL Encrypted
            </div>
            <span className="text-slate-300">•</span>
            <span>© 2024 Dr. Vinish Kumar Singh. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
