import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function RecentEnquiriesWidget() {
  const { enquiries } = useAdminData();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Recent Contact Enquiries</h3>
          <p className="text-xs text-slate-400 font-medium">Website visitor enquiries & messages</p>
        </div>
        <Link to="/enquiries" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 transition-colors">
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50/60">
              <th className="py-2.5 px-3 rounded-l-lg">Name</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Subject</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right rounded-r-lg">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {enquiries.slice(0, 5).map((enq) => (
              <tr key={enq.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                <td className="py-3 px-3 font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{enq.name}</td>
                <td className="py-3 px-3 text-slate-500 font-medium">{enq.phone}</td>
                <td className="py-3 px-3 text-slate-700 font-semibold max-w-xs truncate">{enq.subject}</td>
                <td className="py-3 px-3">
                  <StatusBadge status={enq.status} />
                </td>
                <td className="py-3 px-3 text-right text-slate-400 font-medium">{enq.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
