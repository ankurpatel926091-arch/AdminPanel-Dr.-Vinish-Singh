import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  getTodayQueueApi,
  updateQueueStatusApi,
} from "../../api/queueApi";
import {
  Users,
  Clock,
  CheckCircle2,
  Search,
  RotateCw,
  Stethoscope,
  Phone,
  Eye,
  X,
  XCircle,
  User,
  AlertCircle,
  CheckSquare,
} from "lucide-react";

// Initial Queue Data (Loaded dynamically from MongoDB Database)
const DEFAULT_QUEUE = [];

// Helper to remove billing/charge info from clinical notes
const getCleanComplaint = (notes, dept) => {
  if (!notes) return dept || "General Urology Consultation";
  const cleaned = String(notes)
    .replace(/\.?\s*Bill:.*$/i, "")
    .replace(/^Diagnosis:\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
  return cleaned || dept || "General Urology Consultation";
};

export default function DoctorQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueueFromDB = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTodayQueueApi();
      if (Array.isArray(data)) {
        // Enforce cabin exclusivity: Only 1 patient can be in Consulting at any time!
        let activeFound = false;
        const reversed = [...data].reverse();
        const cleanedReversed = reversed.map((item) => {
          let st = item.status;
          if (st === "IN_CONSULTATION" || st === "Consulting" || st === "CONSULTING") {
            if (!activeFound) {
              activeFound = true;
              st = "Consulting";
            } else {
              st = "Completed";
            }
          } else if (st === "WAITING") st = "Waiting";
          else if (st === "COMPLETED") st = "Completed";
          else if (st === "SKIPPED" || st === "CANCELLED") st = "Cancelled";
          return { ...item, status: st || "Waiting" };
        });
        const normalized = cleanedReversed.reverse();
        setQueue(normalized);
      }
    } catch (e) {
      console.warn("Failed to load queue from database", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount
    fetchQueueFromDB();

    // Instant fetch when tab regains focus or becomes visible
    const handleFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        fetchQueueFromDB();
      }
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    // Smart Polling: every 45s only when tab is actively visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchQueueFromDB();
      }
    }, 45000);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
      clearInterval(interval);
    };
  }, [fetchQueueFromDB]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // Basic Queue Summary (Total, Waiting, Completed)
  const summary = useMemo(() => {
    const total = queue.length;
    const waiting = queue.filter((q) => q.status === "Waiting").length;
    const completed = queue.filter((q) => q.status === "Completed").length;
    return { total, waiting, completed };
  }, [queue]);

  // Currently Consulting Patient
  const currentConsulting = useMemo(() => {
    return queue.find((q) => q.status === "Consulting") || null;
  }, [queue]);

  // Next Waiting Patient (Urgent patients first, then token order)
  const nextWaitingPatient = useMemo(() => {
    const waitingList = queue.filter((q) => q.status === "Waiting");
    if (waitingList.length === 0) return null;

    const urgent = waitingList.find((q) => q.priority === "Urgent");
    return urgent || waitingList[0];
  }, [queue]);

  // Filtered & Sorted Queue List (Consulting first, then Waiting, then Completed)
  const filteredQueue = useMemo(() => {
    const list = queue.filter((item) => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.patientName.toLowerCase().includes(query) ||
        item.patientId.toLowerCase().includes(query) ||
        item.tokenNumber.toLowerCase().includes(query) ||
        item.mobile.includes(query);

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const statusOrder = { Consulting: 1, Waiting: 2, Completed: 3, Cancelled: 4 };
    return [...list].sort((a, b) => {
      const orderA = statusOrder[a.status] || 5;
      const orderB = statusOrder[b.status] || 5;
      if (orderA !== orderB) return orderA - orderB;
      if (a.priority === "Urgent" && b.priority !== "Urgent") return -1;
      if (b.priority === "Urgent" && a.priority !== "Urgent") return 1;
      return 0;
    });
  }, [queue, debouncedSearchQuery, statusFilter]);

  const handleRefresh = async () => {
    await fetchQueueFromDB();
    toast.success("Doctor queue refreshed successfully!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <Clock className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            Doctor Queue Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Operationally monitor patients eligible for the doctor's queue and manage token flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition shadow-xs disabled:opacity-50"
            title="Refresh Queue"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span className="text-xs font-semibold hidden sm:inline">
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Current Consultation Banner */}
      {currentConsulting ? (
        <div className="bg-gradient-to-r from-[#071d49] via-[#0b2b68] to-[#0a1f46] rounded-2xl p-3 sm:p-4 text-white shadow-md border border-blue-700/50 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Top Row: Live Status + Time + Details Button */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-blue-800/60">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                In Consultation
              </span>
              {currentConsulting.startTime && (
                <span className="text-[11px] text-blue-200/80 font-mono truncate">
                  Started {currentConsulting.startTime}
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedPatientModal(currentConsulting)}
              className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1 border border-blue-400/30 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-blue-300" />
              <span>Details</span>
            </button>
          </div>

          {/* Main Info: Token Number + Patient Details */}
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white font-black text-sm sm:text-base flex items-center justify-center shadow-inner tracking-tight border border-blue-400/30 shrink-0">
              {currentConsulting.tokenNumber}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {currentConsulting.patientName}
                </h3>
                {(currentConsulting.gender || currentConsulting.age) && (
                  <span className="text-xs text-blue-200/70 font-medium">
                    ({[currentConsulting.gender, currentConsulting.age ? `${currentConsulting.age} yrs` : null].filter(Boolean).join(", ")})
                  </span>
                )}
              </div>
              {currentConsulting.patientId && (
                <p className="text-[11px] text-blue-300/80 font-mono mt-0.5 truncate">
                  {currentConsulting.patientId}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            No patient currently consulting. Waiting for doctor to call the next patient from consultation room.
          </span>
        </div>
      )}

      {/* 4. Basic Queue Summary (Only 3 cards: Total Patients, Waiting, Completed) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              Total
            </span>
            <span className="text-lg sm:text-3xl font-black text-slate-800 mt-0.5 sm:mt-1 block">
              {summary.total}
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-100 text-slate-600 shrink-0">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 2: Waiting */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-amber-200 bg-amber-50/20 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider block truncate">
              Waiting
            </span>
            <span className="text-lg sm:text-3xl font-black text-amber-700 mt-0.5 sm:mt-1 block">
              {summary.waiting}
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block truncate">
              Completed
            </span>
            <span className="text-lg sm:text-3xl font-black text-emerald-700 mt-0.5 sm:mt-1 block">
              {summary.completed}
            </span>
          </div>
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 5. Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Patient Name, UHID, Token #, Mobile..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Status</option>
            <option value="Waiting">Waiting</option>
            <option value="Consulting">In Consultation</option>
            <option value="Completed">Completed</option>
            {/* <option value="Cancelled">Cancelled</option> */}
          </select>
        </div>
      </div>

      {/* 6. Patient Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">Patient Queue List</h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredQueue.length} Patients listed
          </span>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No patients found in queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">UHID / ID</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Check-in Time</th>
                  <th className="py-3 px-4">Queue Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQueue.map((item) => {
                  const isConsulting = item.status === "Consulting";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isConsulting ? "bg-blue-50/50 font-medium" : ""
                      }`}
                    >
                      {/* Token # */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center justify-center min-w-[50px] px-2 py-1 rounded-lg font-extrabold text-xs whitespace-nowrap tracking-tight ${
                            isConsulting
                              ? "bg-blue-600 text-white"
                              : item.priority === "Urgent"
                              ? "bg-amber-500 text-white"
                              : "bg-slate-800 text-white"
                          }`}
                        >
                          {item.tokenNumber}
                        </span>
                      </td>

                      {/* Patient Name */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.patientName}
                        {item.priority === "Urgent" && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Urgent
                          </span>
                        )}
                      </td>

                      {/* UHID */}
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {item.patientId}
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3 px-4 text-slate-600">
                        {item.age} yrs / {item.gender}
                      </td>

                      {/* Doctor */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.doctorName}
                      </td>

                      {/* Check-in Time */}
                      <td className="py-3 px-4 text-slate-600">
                        {item.checkInTime}
                      </td>

                      {/* Queue Status */}
                      <td className="py-3 px-4">
                        {item.status === "Consulting" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            In Consultation
                          </span>
                        )}
                        {item.status === "Waiting" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Waiting
                          </span>
                        )}
                        {item.status === "Completed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                        {/* {item.status === "Cancelled" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Cancelled
                          </span>
                        )} */}
                      </td>

                      {/* Actions (Monitor View) */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedPatientModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                          title="View Patient Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {selectedPatientModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-[58px] px-2.5 h-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0 whitespace-nowrap tracking-tight">
                  {selectedPatientModal.tokenNumber}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate">
                    {selectedPatientModal.patientName}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 truncate">
                    {selectedPatientModal.patientId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedPatientModal.status === "In Cabin" || selectedPatientModal.status === "Consulting"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : selectedPatientModal.status === "Waiting"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {selectedPatientModal.status === "Consulting" ? "In Consultation" : selectedPatientModal.status}
                </span>
                <button
                  onClick={() => setSelectedPatientModal(null)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - 2x2 Clean Info Grid */}
            <div className="py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-medium block">Age & Gender</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {selectedPatientModal.age ? `${selectedPatientModal.age} yrs` : "N/A"} • {selectedPatientModal.gender || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-medium block">Mobile</span>
                    <span className="font-semibold text-slate-800 text-xs truncate block">
                      {selectedPatientModal.mobile || "Not available"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-medium block">Doctor</span>
                    <span className="font-semibold text-slate-800 text-xs truncate block">
                      {selectedPatientModal.doctorName || "Dr. Vinish Kumar Singh"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-medium block">Check-in Time</span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {selectedPatientModal.checkInTime || "Today"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Reason / Diagnosis Box */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100/80">
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider flex items-center gap-1.5 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Chief Complaint / Department
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {getCleanComplaint(selectedPatientModal.notes, selectedPatientModal.department)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
