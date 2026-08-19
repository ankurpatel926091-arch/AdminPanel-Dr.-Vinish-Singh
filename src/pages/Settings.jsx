import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [web3Key, setWeb3Key] = useState('c0ecd988-cfdf-4e23-9944-cfa4332eb163');
  const [notifyEmail, setNotifyEmail] = useState('ankurpatel926091@gmail.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Admin Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure Web3Forms keys, email notifications, and security</p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key className="w-4 h-4 text-blue-600" /> Web3Forms Integration Key
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Used to send contact form submissions directly from website to doctor email</p>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Access Key</label>
            <input
              type="text"
              value={web3Key}
              onChange={(e) => setWeb3Key(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-blue-600" /> Notification Recipient Email
          </h3>
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notification Email</label>
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
