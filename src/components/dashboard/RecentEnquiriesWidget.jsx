import React from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../common/StatusBadge';
import { Link } from 'react-router-dom';

export default function RecentEnquiriesWidget() {
  const { enquiries } = useAdminData();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">Recent Contact Enquiries</h3>
        <Link to="/enquiries" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-2">Name</th>
              <th className="py-3 px-2">Phone</th>
              <th className="py-3 px-2">Subject</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {enquiries.slice(0, 5).map((enq) => (
              <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-2 font-bold text-slate-800">{enq.name}</td>
                <td className="py-3 px-2 text-slate-500">{enq.phone}</td>
                <td className="py-3 px-2 text-slate-700 font-semibold">{enq.subject}</td>
                <td className="py-3 px-2">
                  <StatusBadge status={enq.status} />
                </td>
                <td className="py-3 px-2 text-right text-slate-400">{enq.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
