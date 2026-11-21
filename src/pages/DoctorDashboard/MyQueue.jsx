import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  Users,
  UserCheck,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Search,
  RotateCw,
  Stethoscope,
  Phone,
  ShieldAlert,
  Eye,
  X,
  Sparkles,
  Activity,
  FileText,
  MessageSquare,
  ArrowRight,
  User,
} from "lucide-react";
import { normalizeQueueItem } from "../../utils/staticAppointmentFlow";
import {
  getTodayQueueApi,
  updateQueueStatusApi,
  callNextPatientApi,
} from "../../api/queueApi";

export default function MyQueue() {
  const navigate = useNavigate();

  // Helper to normalize status for comparison
  const normalizeStatus = (st) => {
    const s = String(st || "").toUpperCase();
    if (
      ["WAITING", "CHECKED_IN", "CHECKED-IN", "IN_QUEUE", "PENDING_QUEUE"].includes(
        s,
      )
    ) {
      return "WAITING";
    }
    if (s === "IN_CONSULTATION" || s === "CONSULTING") return "IN_CONSULTATION";
    if (s === "COMPLETED") return "COMPLETED";
    if (s === "SKIPPED" || s === "CANCELLED") return "SKIPPED";
    return s || "WAITING";
  };

  // Helper to extract clean clinical complaint without cashier billing details
  const getCleanComplaint = (notes, dept) => {
    if (!notes) return dept || "General Urology Consultation";
    const cleaned = String(notes)
      .replace(/\.?\s*Bill:.*$/i, "")
      .replace(/^Diagnosis:\s*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    return cleaned || dept || "General Urology Consultation";
  };

  const [queue, setQueue] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQueueFromDB = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await getTodayQueueApi();
      if (Array.isArray(data)) {
        // Enforce cabin exclusivity: Only 1 patient can be IN_CONSULTATION at any time!
        let activeFound = false;
        const reversed = [...data].reverse();
        const cleanedReversed = reversed.map((item) => {
          const norm = normalizeQueueItem(item);
          const st = String(norm.status || "").toUpperCase();
          if (st === "IN_CONSULTATION" || st === "CONSULTING") {
            if (!activeFound) {
              activeFound = true;
              return { ...norm, status: "Consulting" };
            } else {
              return { ...norm, status: "Completed" };
            }
          }
          return norm;
        });
        const normalized = cleanedReversed.reverse();
        setQueue(normalized);
      }
      if (isManual) {
        toast.success("OPD queue refreshed successfully!");
      }
    } catch (e) {
      console.warn("Failed to load queue from database", e);
      if (isManual) {
        toast.error("Failed to refresh queue");
      }
    } finally {
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
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

    // Smart Polling: every 30s only when tab is actively visible
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchQueueFromDB();
      }
    }, 30000);

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

  // Statistics
  const stats = useMemo(() => {
    const total = queue.length;
    const waiting = queue.filter((q) => normalizeStatus(q.status) === "WAITING").length;
    const inConsultation = queue.filter((q) => normalizeStatus(q.status) === "IN_CONSULTATION").length;
    const emergency = queue.filter(
      (q) => (String(q.priority).toUpperCase() === "EMERGENCY" || String(q.priority).toUpperCase() === "HIGH") && normalizeStatus(q.status) !== "COMPLETED"
    ).length;
    const completed = queue.filter((q) => normalizeStatus(q.status) === "COMPLETED").length;
    const skipped = queue.filter((q) => normalizeStatus(q.status) === "SKIPPED").length;

    return { total, waiting, inConsultation, emergency, completed, skipped };
  }, [queue]);

  // Currently In Consultation Patient
  const currentConsultation = useMemo(() => {
    return queue.find((q) => normalizeStatus(q.status) === "IN_CONSULTATION") || null;
  }, [queue]);

  // Next Waiting Patient
  const nextWaitingPatient = useMemo(() => {
    const waitingList = queue.filter((q) => normalizeStatus(q.status) === "WAITING");
    if (waitingList.length === 0) return null;

    const emergency = waitingList.find((q) => String(q.priority).toUpperCase() === "EMERGENCY");
    if (emergency) return emergency;

    const high = waitingList.find((q) => String(q.priority).toUpperCase() === "HIGH");
    if (high) return high;

    return waitingList[0];
  }, [queue]);

  // Filtered & Sorted Queue List (In Room / Consult first, Waiting next, Completed at bottom)
  const filteredQueue = useMemo(() => {
    const list = queue.filter((item) => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const name = String(item.patientName || "").toLowerCase();
      const id = String(item.patientId || "").toLowerCase();
      const token = String(item.tokenNumber || "").toLowerCase();
      const mobile = String(item.mobile || "");
      const notes = String(item.notes || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        id.includes(query) ||
        token.includes(query) ||
        mobile.includes(query) ||
        notes.includes(query);

      const itemStatus = normalizeStatus(item.status);
      const matchesStatus = statusFilter === "ALL" || itemStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const statusRank = {
      IN_CONSULTATION: 1,
      WAITING: 2,
      SKIPPED: 3,
      COMPLETED: 4,
    };

    return [...list].sort((a, b) => {
      const stA = normalizeStatus(a.status);
      const stB = normalizeStatus(b.status);
      const rankA = statusRank[stA] || 5;
      const rankB = statusRank[stB] || 5;

      if (rankA !== rankB) return rankA - rankB;

      // When both are WAITING, prioritize Emergency / High priority
      if (stA === "WAITING" && stB === "WAITING") {
        const pA = String(a.priority || "").toUpperCase();
        const pB = String(b.priority || "").toUpperCase();
        const prioRank = (p) => (p === "EMERGENCY" ? 1 : p === "HIGH" ? 2 : 3);
        const diff = prioRank(pA) - prioRank(pB);
        if (diff !== 0) return diff;
      }

      return 0;
    });
  }, [queue, debouncedSearchQuery, statusFilter]);

  // ACTIONS (MongoDB Sync)
  const handleResetDefaultQueue = async () => {
    try {
      await fetchQueueFromDB();
      toast.success("Doctor queue refreshed successfully!");
    } catch (e) {
      console.warn("Refresh queue error", e);
    }
  };

  const handleCallNextPatient = async () => {
    if (currentConsultation) {
      toast.info("Complete the current consultation before calling the next patient.");
      return;
    }

    if (!nextWaitingPatient) {
      toast.info("No waiting patients in your queue!");
      return;
    }

    try {
      const res = await callNextPatientApi();
      await fetchQueueFromDB();
      if (res?.success) {
        toast.success(
          `Called Token ${nextWaitingPatient.tokenNumber} (${nextWaitingPatient.patientName}) into your consultation room!`,
          { icon: "🩺" }
        );
      }
    } catch (e) {
      toast.error("Failed to call next patient.");
    }
  };

  const handleStartConsultation = async (id) => {
    if (currentConsultation && currentConsultation.id !== id) {
      toast.info("Complete the current consultation before starting another patient.");
      return;
    }

    try {
      await updateQueueStatusApi(id, { status: "Consulting" });
      await fetchQueueFromDB();
      const pt = queue.find((q) => q.id === id || q._id === id);
      toast.success(`Started consultation for Token ${pt?.tokenNumber || id}`);
    } catch (e) {
      toast.error("Failed to start consultation.");
    }
  };

  const handleOpenConsultation = (id) => {
    const pt = queue.find((q) => q.id === id || q._id === id);
    if (!pt) {
      toast.error("Patient not found in the current queue.");
      return;
    }

    try {
      sessionStorage.setItem("dr_vinish_active_consultation", JSON.stringify(pt));
      navigate("/doctor/consultation", { state: { patient: pt } });
    } catch (error) {
      console.error("Unable to open the patient consultation:", error);
      toast.error("Unable to open this patient's consultation.");
    }
  };

  const handleSkipPatient = async (id) => {
    try {
      await updateQueueStatusApi(id, { status: "Skipped" });
      await fetchQueueFromDB();
      toast.warn("Patient marked as Skipped / Lab Hold");
    } catch (e) {
      toast.error("Failed to skip patient.");
    }
  };

  const handleRecallPatient = async (id) => {
    try {
      await updateQueueStatusApi(id, { status: "Waiting" });
      await fetchQueueFromDB();
      toast.success("Patient recalled back to Waiting Queue");
    } catch (e) {
      toast.error("Failed to recall patient.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-blue-900/40">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Stethoscope className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                My Patient Queue
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCallNextPatient}
              disabled={!nextWaitingPatient}
              className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg transition-all duration-200 ${
                nextWaitingPatient
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-950/50 ring-1 ring-emerald-400/30 hover:scale-[1.02]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Call Next Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid - 3 Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Waiting */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block truncate">
              Waiting in Queue
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
              {stats.waiting}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Consulted */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block truncate">
              Consulted Today
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
              {stats.completed}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Today */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              Total OPD Today
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 block">
              {stats.total}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Token, Patient Name, UHID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: `All (${stats.total})` },
            { id: "WAITING", label: `Waiting (${stats.waiting})` },
            { id: "IN_CONSULTATION", label: `In Room (${stats.inConsultation})` },
            { id: "COMPLETED", label: `Completed (${stats.completed})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Queue Cards & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">Today's Patient Tokens</h2>
          <button
            onClick={() => fetchQueueFromDB(true)}
            disabled={isRefreshing}
            title="Refresh OPD Queue"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs transition disabled:opacity-60 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No patients found for this view.</p>
              {statusFilter === "WAITING" && stats.waiting === 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All queue tokens for today are already inside the cabin or consulted. Creating a new paid bill in Billing will automatically add waiting tokens here.
                  </p>
                  <button
                    onClick={handleResetDefaultQueue}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Reset Demo Waiting Patients
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredQueue.map((item) => {
              const currentStatus = normalizeStatus(item.status);
              const isCurrent = currentStatus === "IN_CONSULTATION";
              const isEmergency = item.priority === "EMERGENCY";

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                    isCurrent
                      ? "bg-blue-50/50 border-l-4 border-l-blue-600 ring-1 ring-blue-100"
                      : isEmergency
                      ? "bg-rose-50/30 border-l-4 border-l-rose-500"
                      : ""
                  }`}
                >
                  {/* Token & Patient Brief */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`min-w-[54px] px-2.5 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0 whitespace-nowrap tracking-tight ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isEmergency
                          ? "bg-rose-600 text-white animate-pulse"
                          : item.priority === "HIGH"
                          ? "bg-amber-500 text-white"
                          : currentStatus === "COMPLETED"
                          ? "bg-slate-200 text-slate-600"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {item.tokenNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">
                          {item.patientName}
                        </h4>
                        <span className="text-xs text-slate-500 font-normal">
                          ({item.gender},{" "}
                          {item.age !== '' && item.age != null
                            ? `${item.age} yrs`
                            : 'Age not provided'})
                        </span>

                        {isEmergency && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 uppercase">
                            🚨 Emergency
                          </span>
                        )}
                        {item.priority === "HIGH" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                            ⚡ High Priority
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-700">{item.patientId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.mobile}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">Check-in: {item.checkInTime}</span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                          <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                          {getCleanComplaint(item.notes, item.department)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2.5 border-t md:border-t-0 pt-2 md:pt-0 shrink-0">
                    {currentStatus === "WAITING" && (
                      <>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Waiting
                        </span>
                        <button
                          onClick={() => handleStartConsultation(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start
                        </button>
                      </>
                    )}

                    {currentStatus === "IN_CONSULTATION" && (
                      <>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                          In Room
                        </span>
                        <button
                          onClick={() => handleOpenConsultation(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Consult & Prescribe
                        </button>
                      </>
                    )}

                    {currentStatus === "SKIPPED" && (
                      <>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Skipped
                        </span>
                        <button
                          onClick={() => handleRecallPatient(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Recall
                        </button>
                      </>
                    )}

                    {currentStatus === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Completed
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedPatientModal(item)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="View Vitals & Notes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal for Patient Details */}
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
                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                  {selectedPatientModal.status}
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

            {/* Modal Body */}
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
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 font-medium block">Vitals</span>
                    <span className="font-semibold text-slate-800 text-xs truncate block">
                      {selectedPatientModal.vitals || "Normal / Not recorded"}
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

              {/* Chief Complaints Box */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100/80">
                <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider flex items-center gap-1.5 mb-1.5">
                  Chief Complaint / Reason
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
