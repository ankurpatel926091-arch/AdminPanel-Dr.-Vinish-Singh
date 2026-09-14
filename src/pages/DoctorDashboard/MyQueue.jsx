import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

// Default Doctor Queue Initial State if localStorage is empty
const DEFAULT_QUEUE = [
  {
    id: "Q-101",
    tokenNumber: "T-001",
    patientId: "UHID-10245",
    patientName: "Rahul Sharma",
    age: 34,
    gender: "Male",
    mobile: "9876543210",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",
    clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",
    checkInTime: "09:30 AM",
    estimatedTime: "10:00 AM",
    status: "IN_CONSULTATION",
    priority: "NORMAL",
    vitals: "BP: 124/82, Temp: 98.4°F, Pulse: 74 bpm",
    notes: "Follow-up for Laser Kidney Stone (RIRS) post-op evaluation.",
    startTime: "09:55 AM",
  },
  {
    id: "Q-102",
    tokenNumber: "T-002",
    patientId: "UHID-10246",
    patientName: "Priya Verma",
    age: 31,
    gender: "Female",
    mobile: "9123456780",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",
    clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",
    checkInTime: "09:45 AM",
    estimatedTime: "10:15 AM",
    status: "WAITING",
    priority: "EMERGENCY",
    vitals: "BP: 138/90, Temp: 99.1°F, Pulse: 88 bpm",
    notes: "Severe right flank pain, acute renal colic evaluation.",
    startTime: null,
  },
  {
    id: "Q-103",
    tokenNumber: "T-003",
    patientId: "UHID-10247",
    patientName: "Suresh Kumar",
    age: 52,
    gender: "Male",
    mobile: "9988776655",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Andrology & Urology",
    clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",
    checkInTime: "10:00 AM",
    estimatedTime: "10:30 AM",
    status: "WAITING",
    priority: "HIGH",
    vitals: "BP: 130/85, Temp: 98.6°F, Pulse: 78 bpm",
    notes: "Elderly patient with BPH urinary frequency complaints.",
    startTime: null,
  },
  {
    id: "Q-104",
    tokenNumber: "T-004",
    patientId: "UHID-10248",
    patientName: "Mohit Singh",
    age: 28,
    gender: "Male",
    mobile: "9123456789",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",
    clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",
    checkInTime: "10:12 AM",
    estimatedTime: "10:45 AM",
    status: "WAITING",
    priority: "NORMAL",
    vitals: "BP: 120/80, Temp: 98.2°F, Pulse: 72 bpm",
    notes: "Routine check-up & ultrasound report review.",
    startTime: null,
  },
  {
    id: "Q-105",
    tokenNumber: "T-005",
    patientId: "UHID-10249",
    patientName: "Sunita Gupta",
    age: 45,
    gender: "Female",
    mobile: "9811223344",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",
    clinic: "Dr. Shilpi Maternity & Urology Centre (Pakkabag)",
    checkInTime: "10:25 AM",
    estimatedTime: "11:00 AM",
    status: "SKIPPED",
    priority: "NORMAL",
    vitals: "BP: 122/78, Temp: 98.4°F, Pulse: 76 bpm",
    notes: "Sent for lab blood test & urine routine check before consultation.",
    startTime: null,
  },
  {
    id: "Q-106",
    tokenNumber: "T-000",
    patientId: "UHID-10240",
    patientName: "Rajesh Chandra",
    age: 60,
    gender: "Male",
    mobile: "9765432109",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",
    clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",
    checkInTime: "09:00 AM",
    estimatedTime: "09:30 AM",
    status: "COMPLETED",
    priority: "NORMAL",
    vitals: "BP: 126/82, Temp: 98.6°F, Pulse: 70 bpm",
    notes: "Prescription issued, advised follow-up after 2 weeks.",
    startTime: "09:30 AM",
    endTime: "09:52 AM",
  },
];

export default function MyQueue() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_vinish_doctor_queue");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load queue from storage", e);
    }
    return DEFAULT_QUEUE;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // Sync state with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("dr_vinish_doctor_queue", JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to save queue state", e);
    }
  }, [queue]);

  // Statistics
  const stats = useMemo(() => {
    const total = queue.length;
    const waiting = queue.filter((q) => q.status === "WAITING").length;
    const inConsultation = queue.filter((q) => q.status === "IN_CONSULTATION").length;
    const emergency = queue.filter(
      (q) => (q.priority === "EMERGENCY" || q.priority === "HIGH") && q.status !== "COMPLETED"
    ).length;
    const completed = queue.filter((q) => q.status === "COMPLETED").length;
    const skipped = queue.filter((q) => q.status === "SKIPPED").length;

    return { total, waiting, inConsultation, emergency, completed, skipped };
  }, [queue]);

  // Currently In Consultation Patient
  const currentConsultation = useMemo(() => {
    return queue.find((q) => q.status === "IN_CONSULTATION") || null;
  }, [queue]);

  // Next Waiting Patient
  const nextWaitingPatient = useMemo(() => {
    const waitingList = queue.filter((q) => q.status === "WAITING");
    if (waitingList.length === 0) return null;

    const emergency = waitingList.find((q) => q.priority === "EMERGENCY");
    if (emergency) return emergency;

    const high = waitingList.find((q) => q.priority === "HIGH");
    if (high) return high;

    return waitingList[0];
  }, [queue]);

  // Filtered Queue List
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.patientName.toLowerCase().includes(query) ||
        item.patientId.toLowerCase().includes(query) ||
        item.tokenNumber.toLowerCase().includes(query) ||
        item.mobile.includes(query) ||
        item.notes.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queue, searchQuery, statusFilter]);

  // ACTIONS
  const handleCallNextPatient = () => {
    if (!nextWaitingPatient) {
      toast.info("No waiting patients in your queue!");
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === "IN_CONSULTATION") {
          return { ...item, status: "COMPLETED", endTime: nowStr };
        }
        if (item.id === nextWaitingPatient.id) {
          return { ...item, status: "IN_CONSULTATION", startTime: nowStr };
        }
        return item;
      })
    );

    toast.success(
      `Called Token ${nextWaitingPatient.tokenNumber} (${nextWaitingPatient.patientName}) into your consultation room!`,
      { icon: "🩺" }
    );
  };

  const handleStartConsultation = (id) => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === "IN_CONSULTATION" && item.id !== id) {
          return { ...item, status: "COMPLETED", endTime: nowStr };
        }
        if (item.id === id) {
          return { ...item, status: "IN_CONSULTATION", startTime: nowStr };
        }
        return item;
      })
    );

    const pt = queue.find((q) => q.id === id);
    toast.success(`Started consultation for Token ${pt?.tokenNumber || id}`);
  };

  const handleCompleteConsultation = (id, openPrescription = false) => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "COMPLETED", endTime: nowStr } : item
      )
    );

    const pt = queue.find((q) => q.id === id);
    toast.success(`Consultation completed for Token ${pt?.tokenNumber || id}`);

    if (openPrescription) {
      navigate("/doctor/consultation");
    }
  };

  const handleSkipPatient = (id) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "SKIPPED" } : item
      )
    );
    toast.warn("Patient marked as Skipped / Lab Hold");
  };

  const handleRecallPatient = (id) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "WAITING" } : item
      )
    );
    toast.success("Patient recalled back to Waiting Queue");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl border border-blue-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse text-blue-400" />
                Doctor's OPD Room Queue
              </span>
              <span className="text-xs text-slate-400">
                Dr. Vinish Kumar Singh • Today's Queue
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-2 text-white tracking-tight flex items-center gap-2">
              <Stethoscope className="w-7 h-7 text-blue-400" />
              My Patient Queue
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              View and manage your active patient room, call next tokens in order of urgency, record vitals, and proceed to consultation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCallNextPatient}
              disabled={!nextWaitingPatient}
              className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all duration-200 ${
                nextWaitingPatient
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-950/50 ring-2 ring-emerald-400/30 hover:scale-[1.02]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              Call Next Patient
            </button>
          </div>
        </div>

        {/* Current Patient Banner */}
        {currentConsultation ? (
          <div className="mt-5 p-4 rounded-xl bg-blue-900/40 border border-blue-400/30 backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg ring-2 ring-blue-300/40">
                {currentConsultation.tokenNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wide">
                    Inside Cabin
                  </span>
                  <span className="text-xs text-blue-200 font-mono">
                    Started at {currentConsultation.startTime}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {currentConsultation.patientName}{" "}
                  <span className="text-xs text-slate-300 font-normal">
                    ({currentConsultation.gender}, {currentConsultation.age} yrs)
                  </span>
                </h3>
                <p className="text-xs text-blue-200">
                  {currentConsultation.patientId} • Phone: {currentConsultation.mobile}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setSelectedPatientModal(currentConsultation)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                Vitals & Notes
              </button>
              <button
                onClick={() => handleCompleteConsultation(currentConsultation.id, true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <MessageSquare className="w-4 h-4" />
                Consult & Prescribe
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your consultation room is currently empty. Click <strong className="text-emerald-400 font-semibold">Call Next Patient</strong> to bring in the next waiting token.
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Waiting in Queue
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats.waiting}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Priority Cases
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stats.emergency}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Skipped / Lab Hold
            </span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">
              {stats.skipped}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Consulted Today
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats.completed}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Token, Patient Name, UHID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["ALL", "WAITING", "IN_CONSULTATION", "SKIPPED", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? `All (${stats.total})` : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Queue Cards & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">Today's Patient Tokens</h2>
          <span className="text-xs text-slate-500 font-medium">
            Order: Emergency ➔ High Priority ➔ Token Number
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No patients found for this view.</p>
            </div>
          ) : (
            filteredQueue.map((item) => {
              const isCurrent = item.status === "IN_CONSULTATION";
              const isEmergency = item.priority === "EMERGENCY";

              return (
                <div
                  key={item.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                    isCurrent
                      ? "bg-blue-50/40 border-l-4 border-l-blue-600"
                      : isEmergency
                      ? "bg-rose-50/30 border-l-4 border-l-rose-500"
                      : ""
                  }`}
                >
                  {/* Token & Patient Brief */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-sm shrink-0 ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isEmergency
                          ? "bg-rose-600 text-white animate-pulse"
                          : item.priority === "HIGH"
                          ? "bg-amber-500 text-white"
                          : item.status === "COMPLETED"
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
                          ({item.gender}, {item.age} yrs)
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

                      {item.notes && (
                        <p className="text-xs text-slate-600 mt-1 italic line-clamp-1">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0">
                    <div className="text-right">
                      {item.status === "IN_CONSULTATION" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                          In Room
                        </span>
                      )}
                      {item.status === "WAITING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Waiting
                        </span>
                      )}
                      {item.status === "SKIPPED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Lab Hold
                        </span>
                      )}
                      {item.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Done
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.status === "WAITING" && (
                        <button
                          onClick={() => handleStartConsultation(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start
                        </button>
                      )}

                      {item.status === "IN_CONSULTATION" && (
                        <button
                          onClick={() => handleCompleteConsultation(item.id, true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Consult
                        </button>
                      )}

                      {item.status === "SKIPPED" && (
                        <button
                          onClick={() => handleRecallPatient(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          Recall
                        </button>
                      )}

                      {item.status === "WAITING" && (
                        <button
                          onClick={() => handleSkipPatient(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                        >
                          Hold/Lab
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedPatientModal(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                        title="View Vitals & Notes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal for Patient Details */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base">
                  {selectedPatientModal.tokenNumber}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedPatientModal.patientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedPatientModal.patientId} • {selectedPatientModal.gender}, {selectedPatientModal.age} yrs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-blue-600 block text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Patient Vitals
                </span>
                <p className="font-semibold text-slate-800">{selectedPatientModal.vitals || "No vitals recorded"}</p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="text-amber-700 block text-[10px] uppercase font-bold mb-1">Chief Complaints / History</span>
                <p className="text-slate-800">{selectedPatientModal.notes || "Standard OPD checkup"}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
