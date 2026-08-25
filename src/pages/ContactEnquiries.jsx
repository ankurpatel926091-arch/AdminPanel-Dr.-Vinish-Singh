import React, { useState, useEffect } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { Mail, Search, Eye, Trash2, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export default function ContactEnquiries() {
  const { enquiries, fetchEnquiries, loadingEnquiries, updateEnquiryStatus, deleteEnquiry } = useAdminData();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filtered = enquiries.filter(item => {
    const matchesFilter = filter === 'All' || item.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.subject.toLowerCase().includes(search.toLowerCase()) ||
                          item.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this contact enquiry?')) {
      deleteEnquiry(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Contact Enquiries</h1>
          <p className="text-sm text-slate-500 mt-1">Manage patient messages and consultation requests</p>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <button
            onClick={fetchEnquiries}
            disabled={loadingEnquiries}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loadingEnquiries ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['All', 'New', 'Read', 'Replied'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loadingEnquiries && filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading contact enquiries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    No contact enquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map(enq => {
                  const itemId = enq._id || enq.id;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-800">{enq.name}</td>
                      <td className="py-4 px-4 text-slate-500">{enq.phone}</td>
                      <td className="py-4 px-4 text-slate-700 font-semibold">{enq.subject}</td>
                      <td className="py-4 px-4 text-slate-400">{enq.date}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={enq.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEnquiry(enq);
                              if (enq.status === 'New') updateEnquiryStatus(itemId, 'Read');
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>
                          <button
                            onClick={() => handleDelete(itemId)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete enquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          title="Enquiry Details"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-semibold">Patient Name:</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedEnquiry.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Phone:</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedEnquiry.phone}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject:</span>
                <p className="font-bold text-blue-600 mt-0.5">{selectedEnquiry.subject}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Date:</span>
                <p className="font-semibold text-slate-700 mt-0.5">{selectedEnquiry.date}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Message Content:</span>
              <p className="p-4 bg-slate-50 rounded-xl text-slate-700 border border-slate-200/80 leading-relaxed font-normal">
                {selectedEnquiry.message}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Mark Status As:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { updateEnquiryStatus(selectedEnquiry.id, 'Read'); setSelectedEnquiry(null); }}
                  className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg font-bold hover:bg-sky-100"
                >
                  Read
                </button>
                <button
                  onClick={() => { updateEnquiryStatus(selectedEnquiry.id, 'Replied'); setSelectedEnquiry(null); }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Mark Replied
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
