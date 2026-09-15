import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  X,
  Hash,
  Ticket,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  RefreshCw,
  ClipboardCheck,
  Receipt,
  CheckSquare,
  Sparkles,
} from "lucide-react";

/* =========================================================
   Mock Appointment Data
========================================================= */

const defaultAppointments = [
  {
    appointmentId: "APT-1001",
    patientId: "UHID-10245",
    patientName: "Rahul Sharma",
    age: 34,
    gender: "Male",
    mobile: "9876543210",
    email: "rahul.sharma@gmail.com",
    address: "Lucknow, Uttar Pradesh",

    doctorId: "DOC-001",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",

    appointmentDate: "15 Sep 2026",
    appointmentTime: "10:00 AM",

    status: "CONFIRMED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
    checkedInBy: null,
  },

  {
    appointmentId: "APT-1002",
    patientId: "UHID-10246",
    patientName: "Priya Verma",
    age: 31,
    gender: "Female",
    mobile: "9123456780",
    email: "priya.verma@gmail.com",
    address: "Alambagh, Lucknow",

    doctorId: "DOC-001",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",

    appointmentDate: "15 Sep 2026",
    appointmentTime: "10:30 AM",

    status: "CONFIRMED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
    checkedInBy: null,
  },

  {
    appointmentId: "APT-1003",
    patientId: "UHID-10247",
    patientName: "Suresh Kumar",
    age: 39,
    gender: "Male",
    mobile: "9988776655",
    email: "suresh.kumar@gmail.com",
    address: "Kanpur Road, Lucknow",

    doctorId: "DOC-002",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Andrology",

    appointmentDate: "15 Sep 2026",
    appointmentTime: "11:00 AM",

    status: "CONFIRMED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
    checkedInBy: null,
  },

  {
    appointmentId: "APT-1004",
    patientId: "UHID-10248",
    patientName: "Mohit Singh",
    age: 35,
    gender: "Male",
    mobile: "9123456789",
    email: "mohit.singh@gmail.com",
    address: "Gomti Nagar, Lucknow",

    doctorId: "DOC-001",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",

    appointmentDate: "15 Sep 2026",
    appointmentTime: "11:30 AM",

    status: "CHECKED_IN",

    visitId: "VIS-5001",
    tokenNumber: 1,
    checkInAt: "09:42 AM",
    checkedInBy: "REC-101 (Administrator)",
  },

  {
    appointmentId: "APT-1005",
    patientId: "UHID-10249",
    patientName: "Amit Gupta",
    age: 42,
    gender: "Male",
    mobile: "9000011223",
    email: "amit.gupta@gmail.com",
    address: "Indira Nagar, Lucknow",

    doctorId: "DOC-002",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Andrology",

    appointmentDate: "15 Sep 2026",
    appointmentTime: "12:00 PM",

    status: "NO_SHOW",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
    checkedInBy: null,
  },

  {
    appointmentId: "APT-1006",
    patientId: "UHID-10250",
    patientName: "Vikas Singh",
    age: 37,
    gender: "Male",
    mobile: "9111122233",
    email: "vikas.singh@gmail.com",
    address: "Aliganj, Lucknow",

    doctorId: "DOC-001",
    doctorName: "Dr. Vinish Kumar Singh",
    department: "Urology",

    appointmentDate: "15 Sep 2026",
    appointmentTime: "12:30 PM",

    status: "CANCELLED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
    checkedInBy: null,
  },
];

/* =========================================================
   Status Styles
========================================================= */

const statusStyles = {
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  CHECKED_IN: "border-green-200 bg-green-50 text-green-700",
  NO_SHOW: "border-red-200 bg-red-50 text-red-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-500",
  BILLING_PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PAYMENT_COMPLETED: "border-green-200 bg-green-50 text-green-700",
};

/* =========================================================
   Main Component
========================================================= */

export default function CheckIn() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem("dr_vinish_checkin_appointments");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Error loading appointments from localStorage", e);
    }
    return defaultAppointments;
  });

  const [search, setSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);

  // Demographic & identity verification state
  const [identityVerified, setIdentityVerified] = useState(true);
  const [demographicsVerified, setDemographicsVerified] = useState(true);

  // Sync state to localStorage for persistence across pages
  useEffect(() => {
    try {
      localStorage.setItem("dr_vinish_checkin_appointments", JSON.stringify(appointments));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Failed to persist checkin appointments", e);
    }
  }, [appointments]);

  /* =========================================================
     1. Search Appointment / Patient
     (Search using Appointment ID, UHID, mobile or patient name)
  ========================================================= */

  const filteredAppointments = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return appointments;

    return appointments.filter((appointment) => {
      const aptId = (appointment.appointmentId || "").toLowerCase();
      const patientId = (appointment.patientId || "").toLowerCase();
      const name = (appointment.patientName || "").toLowerCase();
      const mobile = (appointment.mobile || "").toLowerCase();

      return (
        aptId.includes(value) ||
        patientId.includes(value) ||
        name.includes(value) ||
        mobile.includes(value)
      );
    });
  }, [appointments, search]);

  /* =========================================================
     Today's Statistics
  ========================================================= */

  const totalAppointments = appointments.length;

  const confirmedCount = appointments.filter(
    (item) => item.status === "CONFIRMED"
  ).length;

  const checkedInCount = appointments.filter(
    (item) => item.status === "CHECKED_IN"
  ).length;

  const notEligibleCount = appointments.filter(
    (item) => item.status === "CANCELLED" || item.status === "NO_SHOW"
  ).length;

  /* =========================================================
     2. Verify Patient Identity & Open Check-in Modal
  ========================================================= */

  const openCheckIn = (appointment) => {
    setCheckInSuccess(null);
    setIdentityVerified(true);
    setDemographicsVerified(true);
    setSelectedAppointment(appointment);
    setShowCheckInModal(true);
  };

  /* =========================================================
     3. Create Visit ID
  ========================================================= */

  const generateVisitId = () => {
    const nextNum = 5000 + appointments.length + 1;
    return `VIS-${nextNum}`;
  };

  /* =========================================================
     4. Generate Token According to Queue Rules
  ========================================================= */

  const generateToken = (doctorId) => {
    const checkedInTokens = appointments
      .filter((item) => item.tokenNumber && (!doctorId || item.doctorId === doctorId))
      .map((item) => item.tokenNumber);

    if (!checkedInTokens.length) {
      const allTokens = appointments
        .filter((item) => item.tokenNumber)
        .map((item) => item.tokenNumber);
      return allTokens.length ? Math.max(...allTokens) + 1 : 1;
    }

    return Math.max(...checkedInTokens) + 1;
  };

  /* =========================================================
     Store Check-in Timestamp & Receptionist/User ID
  ========================================================= */

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getLoggedInUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || user.username || "REC-101 (Administrator)";
      }
    } catch (e) {}
    return "REC-101 (Administrator)";
  };

  /* =========================================================
     5. Mark Appointment / Visit as CHECKED_IN
  ========================================================= */

  const handleCheckIn = () => {
    if (!selectedAppointment) return;

    if (
      selectedAppointment.status === "CANCELLED" ||
      selectedAppointment.status === "NO_SHOW"
    ) {
      return;
    }

    if (selectedAppointment.status === "CHECKED_IN") {
      return;
    }

    const visitId = generateVisitId();
    const tokenNumber = generateToken(selectedAppointment.doctorId);
    const checkInAt = getCurrentTime();
    const checkedInBy = getLoggedInUser();

    const updatedAppointments = appointments.map((appointment) =>
      appointment.appointmentId === selectedAppointment.appointmentId
        ? {
            ...appointment,
            status: "CHECKED_IN",
            visitId,
            tokenNumber,
            checkInAt,
            checkedInBy,
          }
        : appointment
    );

    setAppointments(updatedAppointments);

    const successData = {
      visitId,
      tokenNumber,
      patientName: selectedAppointment.patientName,
      patientId: selectedAppointment.patientId,
      appointmentId: selectedAppointment.appointmentId,
      doctorName: selectedAppointment.doctorName,
      department: selectedAppointment.department,
      checkedInBy,
      checkInAt,
    };

    setCheckInSuccess(successData);

    setSelectedAppointment((prev) => ({
      ...prev,
      status: "CHECKED_IN",
      visitId,
      tokenNumber,
      checkInAt,
      checkedInBy,
    }));

    // Add to Doctor Queue in localStorage
    try {
      const existingQueueStr = localStorage.getItem("dr_vinish_queue");
      const existingQueue = existingQueueStr ? JSON.parse(existingQueueStr) : [];
      const newQueueItem = {
        id: `Q-${Date.now()}`,
        tokenNumber: `T-${String(tokenNumber).padStart(3, "0")}`,
        visitId,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        age: selectedAppointment.age,
        gender: selectedAppointment.gender,
        mobile: selectedAppointment.mobile,
        doctorName: selectedAppointment.doctorName,
        department: selectedAppointment.department,
        clinic: "Rudraksh IVF & Urology Centre",
        checkInTime: checkInAt,
        status: "Waiting",
        priority: "Normal",
        startTime: null,
      };
      localStorage.setItem("dr_vinish_queue", JSON.stringify([newQueueItem, ...existingQueue]));
    } catch (e) {}
  };

  /* =========================================================
     6. Proceed to OPD Billing
  ========================================================= */

  const proceedToBilling = (apt) => {
    const targetApt = apt || selectedAppointment;
    closeModal();
    navigate("/admin/billing", {
      state: {
        appointment: targetApt,
        visitId: targetApt?.visitId,
        patientId: targetApt?.patientId,
        patientName: targetApt?.patientName,
        doctorName: targetApt?.doctorName,
      },
    });
  };

  /* =========================================================
     Close Modal
  ========================================================= */

  const closeModal = () => {
    setShowCheckInModal(false);
    setSelectedAppointment(null);
    setCheckInSuccess(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Check-in</h1>
          <p className="mt-1 text-sm text-slate-500">
            Verify patient details and create today's OPD visit.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <ClipboardCheck size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-slate-700">
            Today's OPD Check-in
          </span>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <StatCard
          title="Today's Appointments"
          value={totalAppointments}
          icon={Calendar}
          iconClass="bg-blue-50 text-blue-600"
        />

        {/* Confirmed */}
        <StatCard
          title="Ready for Check-in"
          value={confirmedCount}
          icon={UserCheck}
          iconClass="bg-amber-50 text-amber-600"
        />

        {/* Checked In */}
        <StatCard
          title="Checked-in"
          value={checkedInCount}
          icon={CheckCircle2}
          iconClass="bg-green-50 text-green-600"
        />

        {/* Not Eligible */}
        <StatCard
          title="Not Eligible"
          value={notEligibleCount}
          icon={AlertCircle}
          iconClass="bg-red-50 text-red-600"
        />
      </div>

      {/* =====================================================
          SEARCH PANEL
          1. Search appointment/patient using Appointment ID, UHID, mobile or patient name.
      ===================================================== */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">
              Find Appointment / Patient
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Search using Appointment ID, UHID, mobile number or patient name.
          </p>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Appointment ID, UHID, mobile or patient name..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          APPOINTMENT TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">Today's Appointments</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredAppointments.length} appointment
              {filteredAppointments.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <button
            onClick={() => setSearch("")}
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:flex"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Appointment
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Appointment Time
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => {
                  const canCheckIn = appointment.status === "CONFIRMED";
                  const alreadyChecked = appointment.status === "CHECKED_IN";
                  const blocked =
                    appointment.status === "CANCELLED" ||
                    appointment.status === "NO_SHOW";

                  return (
                    <tr
                      key={appointment.appointmentId}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Appointment */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {appointment.appointmentId}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Hash size={12} />
                          {appointment.patientId}
                        </p>
                        {alreadyChecked && appointment.visitId && (
                          <p className="mt-1 text-xs font-medium text-blue-600">
                            Visit: {appointment.visitId}
                          </p>
                        )}
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {appointment.patientName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {appointment.age} yrs • {appointment.gender}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <Phone size={12} />
                              {appointment.mobile}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <Stethoscope
                            size={17}
                            className="mt-0.5 text-blue-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {appointment.doctorName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {appointment.department}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {appointment.appointmentTime}
                            </p>
                            {alreadyChecked && (
                              <p className="mt-1 text-xs text-green-600">
                                Check-in: {appointment.checkInAt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
                            statusStyles[appointment.status] ||
                            "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {appointment.status}
                        </span>

                        {alreadyChecked && appointment.tokenNumber && (
                          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-600">
                            <Ticket size={12} />
                            Token #{appointment.tokenNumber}
                          </p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {canCheckIn && (
                            <button
                              onClick={() => openCheckIn(appointment)}
                              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                            >
                              <UserCheck size={15} />
                              Check-in
                            </button>
                          )}

                          {alreadyChecked && (
                            <>
                              <button
                                onClick={() => openCheckIn(appointment)}
                                className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                                title="View Check-in Details"
                              >
                                <CheckCircle2 size={14} />
                                Details
                              </button>

                              <button
                                onClick={() => proceedToBilling(appointment)}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                                title="Proceed to OPD Billing"
                              >
                                <Receipt size={14} />
                                Billing
                                <ArrowRight size={13} />
                              </button>
                            </>
                          )}

                          {blocked && (
                            <button
                              disabled
                              className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400"
                            >
                              <AlertCircle size={15} />
                              Not Eligible
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <Search size={40} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-medium text-slate-600">
                      No appointment found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try Appointment ID, UHID, mobile or patient name.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          CHECK-IN & VERIFICATION MODAL
      ===================================================== */}

      {showCheckInModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Patient Check-in</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Appointment: {selectedAppointment.appointmentId} • UHID: {selectedAppointment.patientId}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5">
              {/* Success View */}
              {checkInSuccess ? (
                <div>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 size={32} />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-green-800">
                      Check-in Successful!
                    </h3>

                    <p className="mt-1 text-sm text-green-700">
                      <span className="font-semibold">{checkInSuccess.patientName}</span> is checked in for today's OPD.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {/* Visit ID */}
                      <div className="rounded-lg border border-green-200 bg-white p-3 text-left shadow-xs">
                        <p className="text-xs font-medium text-slate-400">Visit ID</p>
                        <p className="mt-1 text-base font-bold text-slate-900">
                          {checkInSuccess.visitId}
                        </p>
                      </div>

                      {/* Token */}
                      <div className="rounded-lg border border-green-200 bg-white p-3 text-left shadow-xs">
                        <p className="text-xs font-medium text-slate-400">Token Number</p>
                        <p className="mt-1 text-base font-bold text-blue-600">
                          #{checkInSuccess.tokenNumber}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="rounded-lg border border-green-200 bg-white p-3 text-left shadow-xs">
                        <p className="text-xs font-medium text-slate-400">Check-in Time</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {checkInSuccess.checkInAt}
                        </p>
                      </div>

                      {/* Receptionist */}
                      <div className="rounded-lg border border-green-200 bg-white p-3 text-left shadow-xs">
                        <p className="text-xs font-medium text-slate-400">Receptionist ID</p>
                        <p className="mt-1 text-xs font-bold text-slate-800 truncate" title={checkInSuccess.checkedInBy}>
                          {checkInSuccess.checkedInBy}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 6: Proceed to OPD billing */}
                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <Receipt size={22} className="shrink-0 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-900">
                          Step 6: Proceed to OPD Billing
                        </p>
                        <p className="mt-0.5 text-xs text-blue-700 leading-relaxed">
                          Patient is checked in. Next step is to proceed to OPD billing to complete fee collection and generate invoice.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => proceedToBilling(selectedAppointment)}
                      className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition shadow-md"
                    >
                      <Receipt size={16} />
                      Proceed to OPD Billing
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 2: Verify Patient Identity and Demographic Details */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User size={26} />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">
                          {selectedAppointment.patientName}
                        </h3>

                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Hash size={12} />
                            {selectedAppointment.patientId}
                          </span>
                          <span>{selectedAppointment.age} years</span>
                          <span>{selectedAppointment.gender}</span>
                          <span className="font-semibold text-blue-600">{selectedAppointment.mobile}</span>
                        </div>
                      </div>

                      <span className="self-start rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>

                  {/* Demographic & Identity Verification Panel */}
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={18} className="text-blue-600" />
                        <h3 className="font-semibold text-slate-800">
                          Verify Identity & Demographic Details
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Step 2 of 6</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <VerificationItem
                        icon={Phone}
                        label="Mobile Number"
                        value={selectedAppointment.mobile}
                      />
                      <VerificationItem
                        icon={Calendar}
                        label="Appointment Date"
                        value={selectedAppointment.appointmentDate}
                      />
                      <VerificationItem
                        icon={Clock}
                        label="Appointment Time"
                        value={selectedAppointment.appointmentTime}
                      />
                      <VerificationItem
                        icon={Stethoscope}
                        label="Assigned Doctor"
                        value={`${selectedAppointment.doctorName} (${selectedAppointment.department})`}
                      />
                      <VerificationItem
                        icon={MapPin}
                        label="Address / Location"
                        value={selectedAppointment.address}
                      />
                      <VerificationItem
                        icon={Hash}
                        label="Appointment ID"
                        value={selectedAppointment.appointmentId}
                      />
                    </div>

                    {/* Checkboxes for Receptionist Verification */}
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={identityVerified}
                          onChange={(e) => setIdentityVerified(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Patient photo & identity verified with receptionist desk</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={demographicsVerified}
                          onChange={(e) => setDemographicsVerified(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Patient contact & demographic information matches record</span>
                      </label>
                    </div>
                  </div>

                  {/* Live Generation Preview */}
                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                      <Sparkles size={14} className="text-blue-600" />
                      Automatic Creation Preview
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                      <div>
                        <span className="text-slate-400 block">Visit ID</span>
                        <span className="font-bold text-slate-800">{generateVisitId()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Queue Token</span>
                        <span className="font-bold text-blue-600">#{generateToken(selectedAppointment.doctorId)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Check-in Time</span>
                        <span className="font-bold text-slate-800">{getCurrentTime()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Receptionist ID</span>
                        <span className="font-bold text-slate-800 truncate block">{getLoggedInUser()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Already Checked-in Warning / Info */}
                  {selectedAppointment.status === "CHECKED_IN" && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            Patient Already Checked-in
                          </p>
                          <p className="mt-1 text-xs text-green-700">
                            Visit ID: {selectedAppointment.visitId} • Token #{selectedAppointment.tokenNumber}
                            {selectedAppointment.checkInAt && <> • Time: {selectedAppointment.checkInAt}</>}
                            {selectedAppointment.checkedInBy && <> • By: {selectedAppointment.checkedInBy}</>}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              {checkInSuccess ? (
                <>
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => proceedToBilling(selectedAppointment)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <Receipt size={16} />
                    Proceed to OPD Billing
                  </button>
                </>
              ) : selectedAppointment.status === "CHECKED_IN" ? (
                <>
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => proceedToBilling(selectedAppointment)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Receipt size={16} />
                    Proceed to OPD Billing
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCheckIn}
                    disabled={!identityVerified || !demographicsVerified}
                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition ${
                      identityVerified && demographicsVerified
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    <UserCheck size={17} />
                    Confirm Check-in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Stat Card
========================================================= */

function StatCard({ title, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{value}</h2>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Verification Item
========================================================= */

function VerificationItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-blue-600" />
        <p className="text-xs text-slate-400">{label}</p>
      </div>
      <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}