// import React, { useState } from 'react';
// import { Settings as SettingsIcon, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';

// export default function Settings() {
//   const [notifyEmail, setNotifyEmail] = useState('ankurpatel926091@gmail.com');
//   const [saved, setSaved] = useState(false);

//   const handleSave = (e) => {
//     e.preventDefault();
//     setSaved(true);
//     setTimeout(() => setSaved(false), 3000);
//   };

//   return (
//     <div className="space-y-6 max-w-4xl mx-auto">
//       <div>
//         <h1 className="text-2xl font-extrabold text-slate-800">Admin Settings</h1>
//         <p className="text-sm text-slate-500 mt-1">Configure email notifications and system settings</p>
//       </div>

//       {saved && (
//         <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
//           <CheckCircle2 className="w-4 h-4" /> Settings saved successfully!
//         </div>
//       )}

//       <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

//         <div>
//           <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
//             <Bell className="w-4 h-4 text-blue-600" /> Notification Recipient Email
//           </h3>
//           <div className="mt-4">
//             <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notification Email</label>
//             <input
//               type="email"
//               value={notifyEmail}
//               onChange={(e) => setNotifyEmail(e.target.value)}
//               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
//             />
//           </div>
//         </div>

//         <div className="pt-4 border-t border-slate-100 flex justify-end">
//           <button
//             type="submit"
//             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
//           >
//             <Save className="w-4 h-4" /> Save Configuration
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
