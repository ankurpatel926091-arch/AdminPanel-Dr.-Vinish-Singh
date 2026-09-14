import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RotateCw,
  Stethoscope,
  Phone,
  Eye,
  X,
  Plus,
  Edit,
  UserCheck,
  ArrowRight,
  Filter,
  MessageSquare,
  FileText,
} from "lucide-react";

// Default Mock Follow-up Records for Dr. Vinish Kumar Singh
const DEFAULT_FOLLOWUPS = [
  {
    id: "FOL-101",
    patientName: "Rahul Sharma",
    uhid: "UHID-10245",
    age: 34,
    gender: "Male",
    mobile: "9876543210",
    lastVisitDate: "2026-08-30",
    formattedLastVisit: "30 Aug 2026",
    followUpDate: "2026-09-14",
    formattedFollowUp: "14 Sep 2026",
    diagnosis: "Laser Kidney Stone (RIRS) Post-Op Stent Removal Evaluation",
    status: "DUE_TODAY", // DUE_TODAY, UPCOMING, OVERDUE, COMPLETED
    notes: "Advised USG KUB before review. Check DJ stent position.",
  },
  {
    id: "FOL-102",
    patientName: "Priya Verma",
    uhid: "UHID-10246",
    age: 31,
    gender: "Female",
    mobile: "9123456780",
    lastVisitDate: "2026-09-07",
    formattedLastVisit: "07 Sep 2026",
    followUpDate: "2026-09-18",
    formattedFollowUp: "18 Sep 2026",
    diagnosis: "Right Ureteric Calculi Follow-up",
    status: "UPCOMING",
    notes: "Check urine routine culture & stone passage status.",
  },
  {
    id: "FOL-103",
    patientName: "Suresh Kumar",
    uhid: "UHID-10247",
    age: 52,
    gender: "Male",
    mobile: "9988776655",
    lastVisitDate: "2026-09-01",
    formattedLastVisit: "01 Sep 2026",
    followUpDate: "2026-09-10",
    formattedFollowUp: "10 Sep 2026",
    diagnosis: "BPH & LUTS Medication Response Review",
    status: "OVERDUE",
    notes: "Patient missed scheduled visit on 10th Sep. Follow up via call.",
  },
  {
    id: "FOL-104",
    patientName: "Mohit Singh",
    uhid: "UHID-10248",
    age: 28,
    gender: "Male",
    mobile: "9123456789",
    lastVisitDate: "2026-09-05",
    formattedLastVisit: "05 Sep 2026",
    followUpDate: "2026-09-20",
    formattedFollowUp: "20 Sep 2026",
    diagnosis: "Recurrent UTI Post-Antibiotic Response",
    status: "UPCOMING",
    notes: "Repeat urine culture report mandatory.",
  },
  {
    id: "FOL-105",
    patientName: "Rajesh Chandra",
    uhid: "UHID-10240",
    age: 60,
    gender: "Male",
    mobile: "9765432109",
    lastVisitDate: "2026-08-25",
    formattedLastVisit: "25 Aug 2026",
    followUpDate: "2026-09-12",
    formattedFollowUp: "12 Sep 2026",
    diagnosis: "TURP Post-Op 3-Week Clearance Check",
    status: "COMPLETED",
    notes: "Patient reviewed on 12th Sep. Recovery excellent. Prescribed maintenance oral meds.",
  },
  {
    id: "FOL-106",
    patientName: "Amitabh Srivastava",
    uhid: "UHID-10238",
    age: 49,
    gender: "Male",
    mobile: "9811223344",
    lastVisitDate: "2026-09-08",
    formattedLastVisit: "08 Sep 2026",
    followUpDate: "2026-09-14",
    formattedFollowUp: "14 Sep 2026",
    diagnosis: "Microscopic Hematuria USG Review",
    status: "DUE_TODAY",
    notes: "Review USG Abdomen & KUB report for bladder lesion.",
  },
];

export default function FollowUps() {
  const navigate = useNavigate();

  const [followups, setFollowups] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_vinish_patient_followups");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load follow-ups from storage", e);
    }
    return DEFAULT_FOLLOWUPS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedModal, setSelectedModal] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dr_vinish_patient_followups", JSON.stringify(followups));
    } catch (e) {
      console.warn("Failed to save follow-ups state", e);
    }
  }, [followups]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = followups.length;
    const dueToday = followups.filter((f) => f.status === "DUE_TODAY").length;
    const upcoming = followups.filter((f) => f.status === "UPCOMING").length;
    const overdue = followups.filter((f) => f.status === "OVERDUE").length;
    const completed = followups.filter((f) => f.status === "COMPLETED").length;

    return { total, dueToday, upcoming, overdue, completed };
  }, [followups]);

  // Filtered Followups List
  const filteredFollowups = useMemo(() => {
    return followups.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.patientName.toLowerCase().includes(q) ||
        item.uhid.toLowerCase().includes(q) ||
        item.mobile.includes(q) ||
        item.diagnosis.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [followups, searchQuery, statusFilter]);

  // ACTIONS
  const handleMarkCompleted = (id) => {
    setFollowups((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "COMPLETED" } : item
      )
    );
    const pt = followups.find((f) => f.id === id);
    toast.success(`Follow-up marked completed for ${pt?.patientName || id}`);
  };

  const handleOpenReschedule = (item) => {
    setRescheduleModal(item);
    setNewDate(item.followUpDate || "");
    setNewNotes(item.notes || "");
  };

  const handleSaveReschedule = () => {
    if (!rescheduleModal || !newDate) {
      toast.warn("Please select a valid new follow-up date.");
      return;
    }

    const formatted = new Date(newDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const todayStr = new Date().toISOString().slice(0, 10);
    let nextStatus = "UPCOMING";
    if (newDate === todayStr) nextStatus = "DUE_TODAY";
    else if (newDate < todayStr) nextStatus = "OVERDUE";

    setFollowups((prev) =>
      prev.map((item) =>
        item.id === rescheduleModal.id
          ? {
              ...item,
              followUpDate: newDate,
              formattedFollowUp: formatted,
              status: nextStatus,
              notes: newNotes,
            }
          : item
      )
    );

    toast.success(`Follow-up rescheduled to ${formatted} for ${rescheduleModal.patientName}`);
    setRescheduleModal(null);
  };

  const handleStartConsultation = (item) => {
    toast.info(`Starting consultation review for ${item.patientName}`);
    navigate("/doctor/consultation");
  };

  const handleRefresh = () => {
    toast.info("Follow-ups list refreshed");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <CalendarCheck className="w-4 h-4" />
            <span>Dr. Vinish Kumar Singh • OPD Follow-up Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
            Patient Follow-ups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track, manage, and reschedule upcoming patient return visits and post-consultation reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh List"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Due Today */}
        <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-blue-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Due Today
            </span>
            <span className="text-3xl font-black text-blue-700 mt-1 block">
              {stats.dueToday}
            </span>
            <span className="text-[11px] text-blue-600/80 mt-0.5 block font-medium">
              Scheduled for review today
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Upcoming */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Upcoming
            </span>
            <span className="text-3xl font-black text-slate-800 mt-1 block">
              {stats.upcoming}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Scheduled in coming days
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 bg-rose-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
              Overdue
            </span>
            <span className="text-3xl font-black text-rose-700 mt-1 block">
              {stats.overdue}
            </span>
            <span className="text-[11px] text-rose-600/80 mt-0.5 block font-medium">
              Missed scheduled follow-up
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-700">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-3xl font-black text-emerald-700 mt-1 block">
              {stats.completed}
            </span>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block font-medium">
              Follow-up reviews finished
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Patient Name, UHID, Mobile, Diagnosis..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: `All (${stats.total})` },
            { id: "DUE_TODAY", label: `Due Today (${stats.dueToday})` },
            { id: "UPCOMING", label: `Upcoming (${stats.upcoming})` },
            { id: "OVERDUE", label: `Overdue (${stats.overdue})` },
            { id: "COMPLETED", label: `Completed (${stats.completed})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === st.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Follow-up Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">Follow-up Patient Records</h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredFollowups.length} Records listed
          </span>
        </div>

        {filteredFollowups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">
              No follow-up records found matching your filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Last Visit & Diagnosis</th>
                  <th className="py-3 px-4">Scheduled Follow-up</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Advice</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFollowups.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* Patient Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.patientName}
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            ({item.gender}, {item.age}y)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-600">{item.uhid}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {item.mobile}
                          </span>
                        </div>
                      </td>

                      {/* Last Visit & Diagnosis */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="font-medium text-slate-800 line-clamp-2">
                          {item.diagnosis}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Last Visit: {item.formattedLastVisit}
                        </div>
                      </td>

                      {/* Scheduled Follow-up */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.formattedFollowUp}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === "DUE_TODAY" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Due Today
                          </span>
                        )}
                        {item.status === "UPCOMING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Upcoming
                          </span>
                        )}
                        {item.status === "OVERDUE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Overdue
                          </span>
                        )}
                        {item.status === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        )}
                      </td>

                      {/* Notes / Advice */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px]">
                        <p className="line-clamp-2 italic">{item.notes || "-"}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Start Review / Consult */}
                          {item.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleStartConsultation(item)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                              title="Start Consultation Review"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Review
                            </button>
                          )}

                          {/* Reschedule */}
                          {item.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleOpenReschedule(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              title="Reschedule Follow-up Date"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}

                          {/* Mark Complete */}
                          {item.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleMarkCompleted(item.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title="Mark Completed"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Details Modal */}
                          <button
                            onClick={() => setSelectedModal(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="View Patient History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: View Patient Details */}
      {selectedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedModal.patientName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedModal.uhid} • {selectedModal.gender}, {selectedModal.age} yrs
                </p>
              </div>
              <button
                onClick={() => setSelectedModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Diagnosis & Condition</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedModal.diagnosis}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Last Visit</span>
                  <span className="font-semibold text-slate-800">{selectedModal.formattedLastVisit}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Follow-up Due</span>
                  <span className="font-bold text-blue-700">{selectedModal.formattedFollowUp}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-blue-600 text-[10px] uppercase font-bold block mb-1">Doctor Advice & Notes</span>
                <p className="text-blue-950 font-medium">{selectedModal.notes || "No special instructions"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedModal(null)}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reschedule Follow-up Date */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Reschedule Follow-up
              </h3>
              <button
                onClick={() => setRescheduleModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Select a new follow-up date for <strong className="text-slate-900">{rescheduleModal.patientName}</strong>:
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  New Follow-up Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Updated Notes / Advice
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Enter doctor notes or lab instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRescheduleModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
