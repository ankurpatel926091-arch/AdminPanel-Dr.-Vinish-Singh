import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  Search,
  CalendarDays,
  Clock,
  User,
  Phone,
  Stethoscope,
  Eye,
  Play,
  CheckCircle2,
  Users,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { getAdminAppointmentsApi } from "../../api/appointmentApi";
import { getTodayQueueApi, updateQueueStatusApi } from "../../api/queueApi";
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

const TodaysAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch real appointments & queue from database
  const fetchTodaysAppointments = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const [allAppointments, todayQueue] = await Promise.all([
        getAdminAppointmentsApi().catch((err) => {
          console.warn("Failed to fetch appointments:", err);
          return [];
        }),
        getTodayQueueApi().catch((err) => {
          console.warn("Failed to fetch queue:", err);
          return [];
        }),
      ]);

      const aptList = Array.isArray(allAppointments)
        ? allAppointments
        : Array.isArray(allAppointments?.data)
          ? allAppointments.data
          : [];

      const queueList = Array.isArray(todayQueue) ? todayQueue : [];

      // Filter appointments for today
      const todaysBookedApts = aptList.filter((apt) =>
        isToday(apt.date, apt.createdAt),
      );

      const mergedList = [];
      const matchedQueueIds = new Set();

      // Process today's booked appointments
      todaysBookedApts.forEach((apt) => {
        const matchedQueue = queueList.find((q) => {
          if (q.appointment && String(q.appointment) === String(apt._id))
            return true;
          if (apt.visitId && q.visitId && q.visitId === apt.visitId)
            return true;
          if (
            apt.phone &&
            q.mobile &&
            q.mobile.replace(/\D/g, "") === apt.phone.replace(/\D/g, "")
          )
            return true;
          if (
            apt.name &&
            q.patientName &&
            q.patientName.trim().toLowerCase() === apt.name.trim().toLowerCase()
          )
            return true;
          return false;
        });

        if (matchedQueue) {
          matchedQueueIds.add(matchedQueue._id || matchedQueue.id);
        }

        // In Today's OPD Queue, strictly show patients who have an active queue record or are completed (Strict Pre-Billing: Option 1)
        if (!matchedQueue && apt.status !== "Visited") {
          return;
        }

        let qStatus = "Not Checked-in";
        if (matchedQueue) {
          const queueStatus = String(matchedQueue.status || "")
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_");
          if (["CONSULTING", "IN_CONSULTATION"].includes(queueStatus))
            qStatus = "In Consultation";
          else if (
            ["WAITING", "CHECKED_IN", "IN_QUEUE", "PENDING_QUEUE"].includes(
              queueStatus,
            )
          )
            qStatus = "Waiting";
          else if (
            ["COMPLETED", "VISITED", "CONSULTATION_COMPLETED"].includes(
              queueStatus,
            )
          )
            qStatus = "Completed";
          else if (["SKIPPED", "CANCELLED", "MISSED"].includes(queueStatus))
            qStatus = "Skipped";
          else qStatus = matchedQueue.status;
        } else if (apt.status === "Visited") {
          qStatus = "Completed";
        }

        const tokenNum =
          matchedQueue?.tokenNumber ||
          (apt.tokenNumber ? String(apt.tokenNumber).padStart(2, "0") : "—");
        const checkIn = matchedQueue?.checkInTime || apt.checkInAt || null;

        mergedList.push({
          appointmentId:
            apt.visitId ||
            (apt._id ? `APT-${apt._id.slice(-4).toUpperCase()}` : "APT-0000"),
          rawId: apt._id,
          tokenNumber: tokenNum,
          patientName: apt.name,
          patientId: apt.visitId
            ? `UHID-${apt.visitId.replace(/\D/g, "") || "1001"}`
            : apt._id
              ? `UHID-${apt._id.slice(-4).toUpperCase()}`
              : "UHID-1001",
          age: apt.age || 35,
          gender: apt.gender || "Male",
          mobile: apt.phone || "—",
          appointmentTime: apt.time || "11:00 AM",
          checkInTime: checkIn,
          queueStatus: qStatus,
          appointmentStatus: apt.status || "Confirmed",
          doctor: "Dr. Vinish Kumar Singh",
          department: "Urology",
          clinic:
            typeof apt.clinic === "object"
              ? apt.clinic?.name
              : "Rudraksh IVF & Urology Centre",
          problem: apt.problem || "General Consultation",
          queueId: matchedQueue ? matchedQueue._id || matchedQueue.id : null,
          rawAppointment: apt,
        });
      });

      // Collect existing patient keys in mergedList to prevent duplicates
      const seenPatientKeys = new Set();
      mergedList.forEach((item) => {
        const phone = item.mobile ? String(item.mobile).replace(/\D/g, "").slice(-10) : "";
        const name = item.patientName ? item.patientName.trim().toLowerCase() : "";
        if (phone && phone.length === 10) seenPatientKeys.add(phone);
        else if (name) seenPatientKeys.add(name);
      });

      // Also include any walk-in queue patients not matched to booked appointments
      queueList.forEach((q) => {
        const qId = q._id || q.id;
        const qPhone = q.mobile ? String(q.mobile).replace(/\D/g, "").slice(-10) : "";
        const qName = q.patientName ? q.patientName.trim().toLowerCase() : "";
        const qKey = qPhone && qPhone.length === 10 ? qPhone : qName;

        if (!matchedQueueIds.has(qId) && (!qKey || !seenPatientKeys.has(qKey))) {
          if (qKey) seenPatientKeys.add(qKey);
          let qStatus = "Waiting";
          if (q.status === "Consulting") qStatus = "In Consultation";
          else if (q.status === "Waiting") qStatus = "Waiting";
          else if (q.status === "Completed") qStatus = "Completed";
          else if (q.status === "Skipped") qStatus = "Skipped";
          else qStatus = q.status;

          mergedList.push({
            appointmentId: q.visitId || `OPD-${q.tokenNumber}`,
            rawId: qId,
            tokenNumber: String(q.tokenNumber || "—").padStart(2, "0"),
            patientName: q.patientName,
            patientId:
              q.patientId ||
              (q.visitId
                ? `UHID-${q.visitId.replace(/\D/g, "")}`
                : "UHID-WALKIN"),
            age: q.age || 35,
            gender: q.gender || "Male",
            mobile: q.mobile || "—",
            appointmentTime: q.checkInTime || "Walk-in",
            checkInTime: q.checkInTime || "—",
            queueStatus: qStatus,
            appointmentStatus: "Walk-in OPD",
            doctor: q.doctorName || "Dr. Vinish Kumar Singh",
            department: q.department || "Urology",
            clinic: q.clinic || "Rudraksh IVF & Urology Centre",
            problem: q.notes || "General Consultation",
            queueId: qId,
            rawQueue: q,
          });
        }
      });

      // Sort by token if available
      mergedList.sort((a, b) => {
        const numA = parseInt(a.tokenNumber, 10);
        const numB = parseInt(b.tokenNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;
        return 0;
      });

      setAppointments(mergedList);
      if (showToast) toast.success("Today's appointments refreshed");
    } catch (err) {
      console.error("Error fetching today's appointments:", err);
      toast.error("Could not load today's appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaysAppointments();
    const interval = setInterval(() => {
      fetchTodaysAppointments();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchTodaysAppointments]);

  // Handle Starting Consultation
  const handleStartConsultation = async (appointment) => {
    try {
      if (appointment.queueId) {
        await updateQueueStatusApi(appointment.queueId, {
          status: "Consulting",
        });
      }

      const patientForConsultation = {
        id: appointment.queueId || appointment.rawId,
        patientName: appointment.patientName,
        patientId: appointment.patientId,
        age: appointment.age,
        gender: appointment.gender,
        visitId: appointment.appointmentId,
        tokenNumber: appointment.tokenNumber,
        appointmentDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        appointmentTime: appointment.appointmentTime,
        phone: appointment.mobile,
        clinic: appointment.clinic,
        problem: appointment.problem,
      };

      localStorage.setItem(
        CURRENT_CONSULTATION_STORAGE_KEY,
        JSON.stringify(patientForConsultation),
      );

      toast.success(`Starting consultation for ${appointment.patientName}`);
      navigate("/doctor/consultation", {
        state: { patient: patientForConsultation },
      });
    } catch (err) {
      console.error("Start consultation error:", err);
      navigate("/doctor/consultation", { state: { patient: appointment } });
    }
  };

  // ---------------------------------------
  // Filter
  // ---------------------------------------
  const filteredAppointments = useMemo(() => {
    const searchText = (debouncedSearch || "").toLowerCase().trim();

    return appointments.filter((appointment) => {
      const patientName = String(appointment.patientName || "").toLowerCase();
      const patientId = String(appointment.patientId || "").toLowerCase();
      const appointmentId = String(
        appointment.appointmentId || "",
      ).toLowerCase();
      const tokenNumber = String(appointment.tokenNumber || "").toLowerCase();

      const matchesSearch =
        !searchText ||
        patientName.includes(searchText) ||
        patientId.includes(searchText) ||
        appointmentId.includes(searchText) ||
        tokenNumber.includes(searchText);

      const matchesStatus =
        statusFilter === "All" || appointment.queueStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, debouncedSearch, statusFilter]);

  // ---------------------------------------
  // Status Styling
  // ---------------------------------------
  const getStatusClass = (status) => {
    switch (status) {
      case "Waiting":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "In Consultation":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Completed":
        return "bg-green-50 text-green-700 border-green-200";

      case "Not Checked-in":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Today's Appointments
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live OPD Schedule & Queue
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchTodaysAppointments(true)}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 text-xs sm:text-sm font-semibold transition disabled:opacity-50 shadow-xs cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin text-blue-600" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />

            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Today's OPD</p>

              <h2 className="text-2xl font-bold text-slate-800 mt-1">
                {appointments.length}
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Waiting</p>

              <h2 className="text-2xl font-bold text-amber-600 mt-1">
                {
                  appointments.filter((item) => item.queueStatus === "Waiting")
                    .length
                }
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Current */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">In Consultation</p>

              <h2 className="text-2xl font-bold text-blue-600 mt-1">
                {
                  appointments.filter(
                    (item) => item.queueStatus === "In Consultation",
                  ).length
                }
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Completed</p>

              <h2 className="text-2xl font-bold text-green-600 mt-1">
                {
                  appointments.filter(
                    (item) => item.queueStatus === "Completed",
                  ).length
                }
              </h2>
            </div>

            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, UHID, appointment ID or token..."
              className="
                w-full
                pl-10
                pr-4
                py-2 sm:py-2.5
                rounded-lg
                border
                border-slate-200
                text-xs sm:text-sm
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-500/10
              "
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              px-3 sm:px-4
              py-2 sm:py-2.5
              rounded-lg
              border
              border-slate-200
              bg-white
              text-xs sm:text-sm
              outline-none
              focus:border-blue-500
              cursor-pointer
            "
          >
            <option value="All">All Patients</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>         
          </select>
        </div>
      </div>

      {/* ================= APPOINTMENT TABLE ================= */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">
                Today's OPD Queue
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Patients assigned to Dr. Vinish Kumar Singh
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {filteredAppointments.length} Patients
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Token
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Patient
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Patient ID
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Appointment
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Check-in
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Queue Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
                    <p className="text-sm font-medium text-slate-600">
                      Loading today's OPD appointments...
                    </p>
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment, idx) => (
                  <tr
                    key={appointment.rawId || appointment.appointmentId || idx}
                    className="hover:bg-slate-50 transition"
                  >
                    {/* Token */}
                    <td className="px-5 py-4">
                      <div
                        className="
                        inline-flex
                        items-center
                        justify-center
                        min-w-[48px]
                        px-2.5
                        py-1.5
                        rounded-lg
                        bg-blue-50
                        text-blue-700
                        font-bold
                        text-xs
                        sm:text-sm
                        whitespace-nowrap
                        tracking-tight
                      "
                      >
                        #{appointment.tokenNumber}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="
                          w-9
                          h-9
                          rounded-full
                          bg-slate-100
                          flex
                          items-center
                          justify-center
                        "
                        >
                          <User className="w-4 h-4 text-slate-500" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {appointment.patientName}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {appointment.age} Years • {appointment.gender}
                          </p>

                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {appointment.mobile}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Patient ID */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {appointment.patientId}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {appointment.appointmentId}
                      </p>
                    </td>

                    {/* Appointment Time */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />

                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {appointment.appointmentTime}
                          </p>

                          <p className="text-xs text-slate-400">
                            Appointment Time
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Check-in */}
                    <td className="px-5 py-4">
                      {appointment.checkInTime ? (
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {appointment.checkInTime}
                          </p>

                          <p className="text-xs text-green-600 mt-1">
                            Checked-in
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not Checked-in
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`
                          inline-flex
                          px-2.5
                          py-1
                          rounded-full
                          border
                          text-xs
                          font-semibold
                          ${getStatusClass(appointment.queueStatus)}
                        `}
                      >
                        {appointment.queueStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedPatient(appointment)}
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-2
                            rounded-lg
                            text-sm
                            font-medium
                            text-blue-600
                            hover:bg-blue-50
                          "
                        >
                          <Eye size={16} />
                          View
                        </button>

                        {appointment.queueStatus === "Waiting" && (
                          <button
                            onClick={() => handleStartConsultation(appointment)}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-3
                              py-2
                              rounded-lg
                              bg-blue-600
                              text-white
                              text-sm
                              font-medium
                              hover:bg-blue-700
                              transition
                              shadow-sm
                            "
                          >
                            <Play size={15} />
                            Start
                          </button>
                        )}

                        {appointment.queueStatus === "In Consultation" && (
                          <button
                            onClick={() => handleStartConsultation(appointment)}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-3
                              py-2
                              rounded-lg
                              bg-emerald-600
                              text-white
                              text-sm
                              font-medium
                              hover:bg-emerald-700
                              transition
                              shadow-sm
                            "
                          >
                            <Stethoscope size={15} />
                            Resume
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />

                    <p className="text-sm font-medium text-slate-600">
                      No appointments found
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      No patients match the selected filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PATIENT DETAILS MODAL ================= */}
      {selectedPatient && (
        <div
          className="
          fixed
          inset-0
          z-[100]
          bg-black/50
          flex
          items-center
          justify-center
          p-4
        "
        >
          <div
            className="
            bg-white
            w-full
            max-w-2xl
            rounded-2xl
            shadow-2xl
            overflow-hidden
          "
          >
            {/* Modal Header */}
            <div
              className="
              flex
              items-center
              justify-between
              px-6
              py-4
              border-b
              border-slate-200
            "
            >
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Patient Details
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {selectedPatient.appointmentId}
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="
                  w-8
                  h-8
                  rounded-lg
                  hover:bg-slate-100
                  text-slate-500
                  text-xl
                "
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-400">Patient Name</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.patientName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Patient ID / UHID</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.patientId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Age / Gender</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.age} Years / {selectedPatient.gender}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Mobile</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.mobile}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Token Number</p>

                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    #{selectedPatient.tokenNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Appointment Time</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.appointmentTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Check-in Time</p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.checkInTime || "Not Checked-in"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Queue Status</p>

                  <span
                    className={`
                      inline-flex
                      mt-1
                      px-2.5
                      py-1
                      rounded-full
                      border
                      text-xs
                      font-semibold
                      ${getStatusClass(selectedPatient.queueStatus)}
                    `}
                  >
                    {selectedPatient.queueStatus}
                  </span>
                </div>

                {selectedPatient.problem && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-400">
                      Chief Complaint / Condition
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {selectedPatient.problem}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="
              px-6
              py-4
              bg-slate-50
              border-t
              border-slate-200
              flex
              items-center
              justify-between
            "
            >
              <div>
                {(selectedPatient.queueStatus === "Waiting" ||
                  selectedPatient.queueStatus === "In Consultation") && (
                  <button
                    onClick={() => {
                      const pt = selectedPatient;
                      setSelectedPatient(null);
                      handleStartConsultation(pt);
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      px-4
                      py-2
                      rounded-lg
                      bg-blue-600
                      text-white
                      text-sm
                      font-medium
                      hover:bg-blue-700
                      transition
                    "
                  >
                    <Play size={15} />
                    {selectedPatient.queueStatus === "In Consultation"
                      ? "Resume Consultation"
                      : "Start Consultation"}
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="
                  px-4
                  py-2
                  rounded-lg
                  bg-slate-800
                  text-white
                  text-sm
                  font-medium
                  hover:bg-slate-900
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysAppointments;
