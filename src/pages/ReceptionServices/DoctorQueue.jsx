import React, { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Users,
  Clock,
  Play,
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

// Default Initial Queue Data (Receptionist Flow)
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
    clinic: "Rudraksh IVF & Urology Centre",
    checkInTime: "09:30 AM",
    status: "Consulting",
    priority: "Normal",
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
    clinic: "Rudraksh IVF & Urology Centre",
    checkInTime: "09:45 AM",
    status: "Waiting",
    priority: "Urgent",
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
    department: "Urology",
    clinic: "Rudraksh IVF & Urology Centre",
    checkInTime: "10:00 AM",
    status: "Waiting",
    priority: "Normal",
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
    clinic: "Rudraksh IVF & Urology Centre",
    checkInTime: "10:12 AM",
    status: "Waiting",
    priority: "Normal",
    startTime: null,
  },
  {
    id: "Q-105",
    tokenNumber: "T-005",
    patientId: "UHID-10240",
    patientName: "Rajesh Chandra",
    age: 60,
    gender: "Male",
    mobile: "9765432109",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",
    clinic: "Rudraksh IVF & Urology Centre",
    checkInTime: "09:00 AM",
    status: "Completed",
    priority: "Normal",
    startTime: "09:30 AM",
    endTime: "09:52 AM",
  },
];

export default function DoctorQueue() {
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_vinish_doctor_queue");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize status names if coming from older schema
        return parsed.map((item) => {
          let st = item.status;
          if (st === "IN_CONSULTATION") st = "Consulting";
          else if (st === "WAITING") st = "Waiting";
          else if (st === "COMPLETED") st = "Completed";
          else if (st === "SKIPPED" || st === "CANCELLED") st = "Cancelled";
          return { ...item, status: st };
        });
      }
    } catch (e) {
      console.warn("Failed to load queue from storage", e);
    }
    return DEFAULT_QUEUE;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [doctorFilter, setDoctorFilter] = useState("ALL");
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // Sync state with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("dr_vinish_doctor_queue", JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to save queue state", e);
    }
  }, [queue]);

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

  // Unique doctors list
  const doctorList = useMemo(() => {
    const list = Array.from(new Set(queue.map((q) => q.doctorName).filter(Boolean)));
    return list.length > 0 ? list : ["Dr. Vinish Kumar Singh"];
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
        item.mobile.includes(query);

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesDoctor = doctorFilter === "ALL" || item.doctorName === doctorFilter;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [queue, searchQuery, statusFilter, doctorFilter]);

  // Operational Actions
  const handleCallNextPatient = () => {
    if (!nextWaitingPatient) {
      toast.info("No waiting patients in queue!");
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === "Consulting") {
          return { ...item, status: "Completed", endTime: nowStr };
        }
        if (item.id === nextWaitingPatient.id) {
          return { ...item, status: "Consulting", startTime: nowStr };
        }
        return item;
      })
    );

    toast.success(
      `Called Token ${nextWaitingPatient.tokenNumber} (${nextWaitingPatient.patientName}) to Doctor Consultation.`
    );
  };

  const handleCallSpecificPatient = (id) => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === "Consulting" && item.id !== id) {
          return { ...item, status: "Completed", endTime: nowStr };
        }
        if (item.id === id) {
          return { ...item, status: "Consulting", startTime: nowStr };
        }
        return item;
      })
    );

    const pt = queue.find((q) => q.id === id);
    toast.success(`Token ${pt?.tokenNumber || ""} (${pt?.patientName || ""}) is now Consulting.`);
  };

  const handleFinishConsultation = (id) => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Completed", endTime: nowStr } : item
      )
    );

    const pt = queue.find((q) => q.id === id);
    toast.success(`Consultation finished for Token ${pt?.tokenNumber || id}`);
  };

  const handleRefresh = () => {
    toast.info("Queue refreshed");
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
          {/* 3. Call Next Patient Button */}
          <button
            onClick={handleCallNextPatient}
            disabled={!nextWaitingPatient}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow transition ${
              nextWaitingPatient
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Call Next Patient
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Queue"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Current Consultation Banner */}
      {currentConsulting ? (
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow">
              {currentConsulting.tokenNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
                  Currently Consulting
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Started: {currentConsulting.startTime}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {currentConsulting.patientName}{" "}
                <span className="text-xs font-normal text-slate-300">
                  ({currentConsulting.gender}, {currentConsulting.age} yrs)
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {currentConsulting.patientId} • Doctor: {currentConsulting.doctorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              onClick={() => setSelectedPatientModal(currentConsulting)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              View Details
            </button>
            <button
              onClick={() => handleFinishConsultation(currentConsulting.id)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish Consultation
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            No patient currently consulting. Click <strong className="text-blue-600">Call Next Patient</strong> to invite the next token.
          </span>
        </div>
      )}

      {/* 4. Basic Queue Summary (Only 3 cards: Total Patients, Waiting, Completed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Patients
            </span>
            <span className="text-3xl font-black text-slate-800 mt-1 block">
              {summary.total}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Waiting */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
              Waiting Patients
            </span>
            <span className="text-3xl font-black text-amber-700 mt-1 block">
              {summary.waiting}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-3xl font-black text-emerald-700 mt-1 block">
              {summary.completed}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 5. Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Patient Name, UHID, Token #, Mobile..."
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
            <option value="Consulting">Consulting</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Doctor Filter */}
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Doctors</option>
            {doctorList.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
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
                  <th className="py-3 px-4 text-right">Actions</th>
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
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-extrabold text-xs ${
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Consulting
                          </span>
                        )}
                        {item.status === "Waiting" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Waiting
                          </span>
                        )}
                        {item.status === "Completed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                        {item.status === "Cancelled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* 7. Actions (Receptionist Level) */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Call Patient */}
                          {item.status === "Waiting" && (
                            <button
                              onClick={() => handleCallSpecificPatient(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                              title="Call Patient into Consultation"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Call Patient
                            </button>
                          )}

                          {/* Finish Consultation */}
                          {item.status === "Consulting" && (
                            <button
                              onClick={() => handleFinishConsultation(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                              title="Finish Consultation"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Finish
                            </button>
                          )}

                          {/* View Details Modal */}
                          <button
                            onClick={() => setSelectedPatientModal(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="View Patient Details"
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

      {/* Patient Details Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                  {selectedPatientModal.tokenNumber}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedPatientModal.patientName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedPatientModal.patientId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Age / Gender:</span>
                <span className="font-semibold">{selectedPatientModal.age} yrs / {selectedPatientModal.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-semibold">{selectedPatientModal.mobile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold">{selectedPatientModal.doctorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Check-in Time:</span>
                <span className="font-semibold">{selectedPatientModal.checkInTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Priority:</span>
                <span className="font-semibold text-amber-700">{selectedPatientModal.priority || "Normal"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-blue-700">{selectedPatientModal.status}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-200 transition"
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
