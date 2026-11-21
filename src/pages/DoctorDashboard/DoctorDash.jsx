import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Clock3,
  Users,
  CheckCircle2,
  UserRound,
  Eye,
  Activity,
  Stethoscope,
  FileText,
  BarChart2,
  RefreshCw,
  Play,
  ArrowRight,
  Phone,
  Clock,
  Sparkles,
  X,
  UserCheck,
} from "lucide-react";
import {
  getTodayQueueApi,
  updateQueueStatusApi,
  callNextPatientApi,
} from "../../api/queueApi";
import { getAdminAppointmentsApi } from "../../api/appointmentApi";
import { CURRENT_CONSULTATION_STORAGE_KEY } from "../../utils/staticAppointmentFlow";

const isToday = (dateStr, createdAt) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  if (createdAt) {
    const cDate = new Date(createdAt);
    if (
      !isNaN(cDate.getTime()) &&
      cDate.getFullYear() === year &&
      cDate.getMonth() === month &&
      cDate.getDate() === day
    ) {
      return true;
    }
  }

  if (!dateStr) return false;

  const ymd = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (typeof dateStr === "string" && dateStr.includes(ymd)) return true;

  const pDate = new Date(dateStr);
  if (!isNaN(pDate.getTime())) {
    if (
      pDate.getFullYear() === year &&
      pDate.getMonth() === month &&
      pDate.getDate() === day
    ) {
      return true;
    }
  }

  const dayStr = String(day).padStart(2, "0");
  const monthShort = now
    .toLocaleString("en-US", { month: "short" })
    .toLowerCase();
  const lower = String(dateStr).toLowerCase();
  if (
    lower.includes(String(year)) &&
    lower.includes(monthShort) &&
    (lower.includes(dayStr) || lower.includes(String(day)))
  ) {
    return true;
  }

  return false;
};

const normalizeQueueStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getQueueStatusCategory = (status) => {
  const normalized = normalizeQueueStatus(status);

  if (
    ["waiting", "checked_in", "checkedin", "in_queue", "pending_queue"].includes(
      normalized,
    )
  ) {
    return "waiting";
  }

  if (
    ["consulting", "in_consultation", "consultation"].includes(normalized)
  ) {
    return "consulting";
  }

  if (
    ["completed", "visited", "consultation_completed"].includes(normalized)
  ) {
    return "completed";
  }

  return "other";
};

const DoctorDash = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [callingNext, setCallingNext] = useState(false);

  // Fetch real data from Backend APIs
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      setLoading(true);
      const [queueData, appointmentsData] = await Promise.all([
        getTodayQueueApi().catch((err) => {
          console.warn("Fetch queue error:", err);
          return [];
        }),
        getAdminAppointmentsApi().catch((err) => {
          console.warn("Fetch appointments error:", err);
          return [];
        }),
      ]);

      const queueList = Array.isArray(queueData) ? queueData : [];
      setQueue(queueList);

      const aptList = Array.isArray(appointmentsData)
        ? appointmentsData
        : Array.isArray(appointmentsData?.data)
          ? appointmentsData.data
          : [];

      // Count appointments scheduled for today
      const todaysApts = aptList.filter((apt) => {
        if (!isToday(apt.date, apt.createdAt)) return false;

        const status = String(apt.status || "")
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_");

        return !["cancelled", "canceled", "missed", "no_show", "skipped"].includes(
          status,
        );
      });
      setAppointmentsCount(todaysApts.length);

      if (isManualRefresh) {
        toast.success("Dashboard refreshed successfully!");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (isManualRefresh) {
        toast.error("Unable to refresh dashboard. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 20 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Derived KPI metrics from real live queue
  const waitingPatients = useMemo(
    () =>
      queue.filter(
        (item) => getQueueStatusCategory(item.status) === "waiting",
      ),
    [queue]
  );

  const consultingPatients = useMemo(
    () =>
      queue.filter(
        (item) => getQueueStatusCategory(item.status) === "consulting",
      ),
    [queue]
  );

  const completedPatients = useMemo(
    () =>
      queue.filter((item) => {
        if (getQueueStatusCategory(item.status) !== "completed") return false;

        const itemDate =
          item.createdAt ||
          item.checkInAt ||
          item.appointmentDate ||
          item.date ||
          null;

        return !itemDate || isToday(itemDate, itemDate);
      }),
    [queue]
  );

  // Active current patient inside the doctor's cabin
  const currentPatient = consultingPatients[0] || null;
  const nextWaitingPatient = waitingPatients[0] || null;

  // Handle starting / continuing consultation
  const handleStartConsultation = async (patientItem) => {
    try {
      const qId = patientItem._id || patientItem.id;
      if (qId && (patientItem.status || "").toLowerCase() !== "consulting") {
        await updateQueueStatusApi(qId, { status: "Consulting" }).catch((e) =>
          console.warn("Status update warning:", e.message)
        );
      }

      const patientForConsultation = {
        id: qId,
        patientName: patientItem.patientName,
        patientId: patientItem.patientId || `UHID-${patientItem.tokenNumber || "1001"}`,
        age: patientItem.age || 35,
        gender: patientItem.gender || "Male",
        visitId: patientItem.visitId || patientItem.appointment || "VIS-001",
        tokenNumber: patientItem.tokenNumber || "—",
        appointmentDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        appointmentTime: patientItem.checkInTime || "Now",
        phone: patientItem.mobile || "",
        clinic: patientItem.clinic || "Rudraksh IVF & Urology Centre",
        problem: patientItem.notes || "General Consultation",
      };

      localStorage.setItem(
        CURRENT_CONSULTATION_STORAGE_KEY,
        JSON.stringify(patientForConsultation)
      );
      sessionStorage.setItem(
        "dr_vinish_active_consultation",
        JSON.stringify(patientForConsultation)
      );

      toast.success(`Starting consultation for ${patientItem.patientName}...`);
      navigate("/doctor/consultation", {
        state: { patient: patientForConsultation },
      });
    } catch (err) {
      console.error("Start consultation error:", err);
      navigate("/doctor/consultation", { state: { patient: patientItem } });
    }
  };

  // Handle calling next waiting patient
  const handleCallNext = async () => {
    if (!nextWaitingPatient) {
      toast.info("No waiting patients in queue!");
      return;
    }
    setCallingNext(true);
    try {
      const res = await callNextPatientApi();
      if (res?.success) {
        toast.success(
          `Token ${nextWaitingPatient.tokenNumber} (${nextWaitingPatient.patientName}) called for consultation!`
        );
        handleStartConsultation(nextWaitingPatient);
      } else {
        // Fallback start direct
        handleStartConsultation(nextWaitingPatient);
      }
    } catch (err) {
      console.warn("Call next API error:", err);
      handleStartConsultation(nextWaitingPatient);
    } finally {
      setCallingNext(false);
    }
  };

  // KPI Statistics Cards Data
  const stats = [
    {
      title: "Today's Appointments",
      value: appointmentsCount,
      icon: CalendarDays,
      description: "Scheduled consultations today",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      borderHover: "hover:border-blue-300",
      onClick: () => navigate("/doctor/todays-appointments"),
    },
    {
      title: "Waiting Patients",
      value: waitingPatients.length,
      icon: Clock3,
      description: "Checked-in & waiting in queue",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      borderHover: "hover:border-amber-300",
      onClick: () => navigate("/doctor/my-queue"),
    },
    {
      title: "In Consultation",
      value: consultingPatients.length,
      icon: Stethoscope,
      description: "Currently in doctor's cabin",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      borderHover: "hover:border-purple-300",
      onClick: () => {
        if (currentPatient) {
          handleStartConsultation(currentPatient);
        } else {
          toast.info("No patient currently in consultation.");
        }
      },
    },
    {
      title: "Completed Today",
      value: completedPatients.length,
      icon: CheckCircle2,
      description: "Consultations completed today",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderHover: "hover:border-emerald-300",
      onClick: () => navigate("/doctor/reports"),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ================= 1. HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Doctor Dashboard
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-medium">
            Dr. Vinish Kumar Singh • Senior Consultant Urologist & Laser Surgeon
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin text-blue-600" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-xs">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 2. LIVE STATISTICS CARDS (2x2 on mobile, 4 on desktop) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              onClick={item.onClick}
              className={`bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group ${item.borderHover}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-1">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                    {item.title}
                  </p>
                  <h2 className="text-lg sm:text-3xl font-extrabold text-slate-800 mt-1 sm:mt-2 tracking-tight group-hover:text-blue-600 transition-colors">
                    {loading ? (
                      <span className="inline-block w-6 sm:w-8 h-6 sm:h-8 rounded bg-slate-100 animate-pulse" />
                    ) : (
                      item.value
                    )}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= 3. CURRENT PATIENT CABIN + QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Patient in Consultation */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                  Consultation Room (Cabin 1)
                </h2>
                <p className="text-xs text-slate-500">
                  {currentPatient
                    ? "Patient actively in consultation"
                    : "No patient currently inside the cabin"}
                </p>
              </div>
            </div>

            {currentPatient ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Consultation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                Cabin Ready
              </span>
            )}
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center">
            {currentPatient ? (
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <UserRound className="w-7 h-7" />
                </div>

                {/* Patient Details */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {currentPatient.patientName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {currentPatient.age || 35} yrs • {currentPatient.gender || "Male"} •{" "}
                        <span className="text-slate-700 font-semibold">
                          {currentPatient.mobile || "No phone"}
                        </span>
                      </p>
                    </div>

                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold tracking-wide">
                      Token #{currentPatient.tokenNumber || "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">UHID / Visit ID</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {currentPatient.patientId || currentPatient.visitId || "UHID-WALKIN"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Check-in Time</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {currentPatient.checkInTime || "Today"}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">Hospital / Clinic</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 truncate">
                        {currentPatient.clinic || "Rudraksh IVF Centre"}
                      </p>
                    </div>
                  </div>

                  {currentPatient.notes && (
                    <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3">
                      <p className="text-[11px] font-bold text-amber-700 uppercase">Chief Complaint / Reason</p>
                      <p className="text-xs text-amber-900 font-medium mt-0.5">
                        {currentPatient.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      onClick={() => handleStartConsultation(currentPatient)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 active:scale-95 transition shadow-sm"
                    >
                      <Activity className="w-4 h-4" />
                      Continue Consultation
                    </button>

                    <button
                      onClick={() => setSelectedPatientModal(currentPatient)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Ready for Next Patient
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {nextWaitingPatient
                      ? `Token #${nextWaitingPatient.tokenNumber} (${nextWaitingPatient.patientName}) is waiting next in queue.`
                      : "No patients currently waiting in queue. Arriving patients will appear here once checked in."}
                  </p>
                </div>

                {nextWaitingPatient && (
                  <div className="pt-2">
                    <button
                      onClick={handleCallNext}
                      disabled={callingNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 active:scale-95 transition shadow-sm disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      {callingNext ? "Calling..." : `Call Token #${nextWaitingPatient.tokenNumber} to Cabin`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              Quick Actions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Doctor shortcuts & services
            </p>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-center">
            {/* 1. Today's Appointments */}
            <button
              onClick={() => navigate("/doctor/todays-appointments")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 text-blue-900 border border-blue-100 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    Today's Appointments
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    View schedule & slots
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-200/60 text-blue-800 text-[11px] font-bold">
                {appointmentsCount}
              </span>
            </button>

            {/* 2. Live OPD Queue */}
            <button
              onClick={() => navigate("/doctor/my-queue")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 border border-amber-100 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                    My OPD Queue
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Call & manage tokens
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900 text-[11px] font-bold">
                {waitingPatients.length} waiting
              </span>
            </button>

            {/* 3. Medical Records */}
            <button
              onClick={() => navigate("/doctor/medical-records")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50/80 hover:bg-purple-100/90 text-purple-900 border border-purple-100 transition group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    OPD Records 
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Patient history & Rx
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

           
          </div>
        </div>
      </div>

      {/* ================= 4. REAL TODAY'S OPD QUEUE TABLE ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/40">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              Today's Live OPD Queue
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Patients checked in at reception and waiting for consultation
            </p>
          </div>

          <button
            onClick={() => navigate("/doctor/my-queue")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition self-start sm:self-auto"
          >
            <span>Open Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="text-left px-5 py-3">Token</th>
                <th className="text-left px-5 py-3">Patient</th>
                <th className="text-left px-5 py-3">UHID / Visit ID</th>
                <th className="text-left px-5 py-3">Check-in</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs font-medium">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 text-blue-500 animate-spin" />
                    Loading today's queue...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs font-medium">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No patients checked in yet today.
                  </td>
                </tr>
              ) : (
                queue.map((patient) => {
                  const status = (patient.status || "").toLowerCase();
                  const isConsulting = status === "consulting" || status === "in_consultation";
                  const isWaiting = status === "waiting";
                  const isCompleted = status === "completed";

                  return (
                    <tr
                      key={patient._id || patient.id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Token */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-black tracking-tight">
                          #{patient.tokenNumber || "—"}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <UserRound className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800">
                              {patient.patientName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              {patient.age || 35} yrs • {patient.gender || "Male"} •{" "}
                              {patient.mobile || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* UHID / Visit ID */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-semibold text-slate-700">
                          {patient.patientId || patient.visitId || "UHID-WALKIN"}
                        </p>
                        {patient.clinic && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {patient.clinic}
                          </p>
                        )}
                      </td>

                      {/* Check-in */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.checkInTime || "Today"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {isConsulting ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Consulting
                          </span>
                        ) : isWaiting ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            Waiting
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium capitalize">
                            {patient.status || "In Queue"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedPatientModal(patient)}
                            title="View Patient Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isWaiting && (
                            <button
                              onClick={() => handleStartConsultation(patient)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Consult</span>
                            </button>
                          )}

                          {isConsulting && (
                            <button
                              onClick={() => handleStartConsultation(patient)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>In Progress</span>
                            </button>
                          )}
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

      {/* ================= 5. PATIENT DETAILS MODAL ================= */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Patient Summary
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {selectedPatientModal.patientName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedPatientModal.age || 35} yrs • {selectedPatientModal.gender || "Male"}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                  Token #{selectedPatientModal.tokenNumber || "—"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Mobile Number</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedPatientModal.mobile || "—"}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">UHID / ID</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedPatientModal.patientId || selectedPatientModal.visitId || "—"}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Check-in Time</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedPatientModal.checkInTime || "Today"}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Queue Status</p>
                  <p className="font-bold text-blue-600 mt-0.5 capitalize">{selectedPatientModal.status || "Waiting"}</p>
                </div>
              </div>

              {selectedPatientModal.notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <p className="text-amber-800 font-bold uppercase text-[10px]">Notes / Diagnosis</p>
                  <p className="text-amber-950 font-medium mt-0.5">{selectedPatientModal.notes}</p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    const pt = selectedPatientModal;
                    setSelectedPatientModal(null);
                    handleStartConsultation(pt);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Start Consultation</span>
                </button>
                <button
                  onClick={() => setSelectedPatientModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDash;
