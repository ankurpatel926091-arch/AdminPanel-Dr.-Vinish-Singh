import React, { useMemo, useState } from "react";
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
} from "lucide-react";

/* =========================================================
   Mock Appointment Data
   Replace this with API data later
========================================================= */

const initialAppointments = [
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

    appointmentDate: "12 Sep 2026",
    appointmentTime: "10:00 AM",

    status: "CONFIRMED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
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

    appointmentDate: "12 Sep 2026",
    appointmentTime: "10:30 AM",

    status: "CONFIRMED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
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

    appointmentDate: "12 Sep 2026",
    appointmentTime: "11:00 AM",

    status: "CONFIRMED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
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

    appointmentDate: "12 Sep 2026",
    appointmentTime: "11:30 AM",

    status: "CHECKED_IN",

    visitId: "VIS-5001",
    tokenNumber: 1,
    checkInAt: "09:42 AM",
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

    appointmentDate: "12 Sep 2026",
    appointmentTime: "12:00 PM",

    status: "NO_SHOW",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
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

    appointmentDate: "12 Sep 2026",
    appointmentTime: "12:30 PM",

    status: "CANCELLED",

    visitId: null,
    tokenNumber: null,
    checkInAt: null,
  },
];

/* =========================================================
   Status Styles
========================================================= */

const statusStyles = {
  CONFIRMED:
    "border-blue-200 bg-blue-50 text-blue-700",

  CHECKED_IN:
    "border-green-200 bg-green-50 text-green-700",

  NO_SHOW:
    "border-red-200 bg-red-50 text-red-700",

  CANCELLED:
    "border-slate-200 bg-slate-100 text-slate-500",

  BILLING_PENDING:
    "border-amber-200 bg-amber-50 text-amber-700",

  PAYMENT_COMPLETED:
    "border-green-200 bg-green-50 text-green-700",
};

/* =========================================================
   Main Component
========================================================= */

export default function CheckIn() {
  const [appointments, setAppointments] = useState(
    initialAppointments
  );

  const [search, setSearch] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [showCheckInModal, setShowCheckInModal] =
    useState(false);

  const [checkInSuccess, setCheckInSuccess] =
    useState(null);

  /* =========================================================
     Search Appointment / Patient
  ========================================================= */

  const filteredAppointments = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return appointments;
    }

    return appointments.filter((appointment) => {
      return (
        appointment.appointmentId
          .toLowerCase()
          .includes(value) ||
        appointment.patientId
          .toLowerCase()
          .includes(value) ||
        appointment.patientName
          .toLowerCase()
          .includes(value) ||
        appointment.mobile.includes(value)
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
    (item) =>
      item.status === "CANCELLED" ||
      item.status === "NO_SHOW"
  ).length;

  /* =========================================================
     Open Check-in
  ========================================================= */

  const openCheckIn = (appointment) => {
    setCheckInSuccess(null);
    setSelectedAppointment(appointment);
    setShowCheckInModal(true);
  };

  /* =========================================================
     Generate Visit ID
  ========================================================= */

  const generateVisitId = () => {
    return `VIS-${5000 + appointments.length + 1}`;
  };

  /* =========================================================
     Generate Token
  ========================================================= */

  const generateToken = () => {
    const checkedInTokens = appointments
      .filter((item) => item.tokenNumber)
      .map((item) => item.tokenNumber);

    if (!checkedInTokens.length) {
      return 1;
    }

    return Math.max(...checkedInTokens) + 1;
  };

  /* =========================================================
     Current Time
  ========================================================= */

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     Confirm Check-in
  ========================================================= */

  const handleCheckIn = () => {
    if (!selectedAppointment) return;

    /*
      Business rule:
      Cancelled / No-show appointment cannot be checked in.
    */

    if (
      selectedAppointment.status === "CANCELLED" ||
      selectedAppointment.status === "NO_SHOW"
    ) {
      return;
    }

    /*
      Already checked-in appointment should not
      create another Visit.
    */

    if (
      selectedAppointment.status === "CHECKED_IN"
    ) {
      return;
    }

    const visitId = generateVisitId();
    const tokenNumber = generateToken();
    const checkInAt = getCurrentTime();

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.appointmentId ===
        selectedAppointment.appointmentId
          ? {
              ...appointment,
              status: "CHECKED_IN",
              visitId,
              tokenNumber,
              checkInAt,
            }
          : appointment
      )
    );

    setCheckInSuccess({
      visitId,
      tokenNumber,
      patientName:
        selectedAppointment.patientName,
    });

    setSelectedAppointment((prev) => ({
      ...prev,
      status: "CHECKED_IN",
      visitId,
      tokenNumber,
      checkInAt,
    }));
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
          <h1 className="text-2xl font-bold text-slate-900">
            Check-in
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Verify patient details and create today's
            OPD visit.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">

          <ClipboardCheck
            size={18}
            className="text-blue-600"
          />

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
      ===================================================== */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-3">

          <div className="flex items-center gap-2">

            <Search
              size={18}
              className="text-blue-600"
            />

            <h2 className="font-semibold text-slate-800">
              Find Appointment / Patient
            </h2>

          </div>

          <p className="mt-1 text-xs text-slate-500">
            Search using Appointment ID, UHID, mobile
            number or patient name.
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
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Appointment ID, UHID, mobile or patient name..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      {/* =====================================================
          APPOINTMENT TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>

            <h2 className="font-semibold text-slate-800">
              Today's Appointments
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredAppointments.length} appointment
              {filteredAppointments.length !== 1
                ? "s"
                : ""} found
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

                filteredAppointments.map(
                  (appointment) => {

                    const canCheckIn =
                      appointment.status ===
                      "CONFIRMED";

                    const alreadyChecked =
                      appointment.status ===
                      "CHECKED_IN";

                    const blocked =
                      appointment.status ===
                        "CANCELLED" ||
                      appointment.status ===
                        "NO_SHOW";

                    return (
                      <tr
                        key={
                          appointment.appointmentId
                        }
                        className="transition hover:bg-slate-50"
                      >

                        {/* Appointment */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-800">
                            {
                              appointment.appointmentId
                            }
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Hash size={12} />
                            {appointment.patientId}
                          </p>

                        </td>

                        {/* Patient */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <User size={18} />
                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">
                                {
                                  appointment.patientName
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {appointment.age} yrs
                                {" • "}
                                {
                                  appointment.gender
                                }
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                <Phone size={12} />
                                {
                                  appointment.mobile
                                }
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
                                {
                                  appointment.doctorName
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  appointment.department
                                }
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Time */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <Clock
                              size={16}
                              className="text-slate-400"
                            />

                            <div>

                              <p className="text-sm font-medium text-slate-700">
                                {
                                  appointment.appointmentTime
                                }
                              </p>

                              {alreadyChecked && (
                                <p className="mt-1 text-xs text-green-600">
                                  Check-in:{" "}
                                  {
                                    appointment.checkInAt
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
                              statusStyles[
                                appointment.status
                              ] ||
                              "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {
                              appointment.status
                            }
                          </span>

                          {alreadyChecked &&
                            appointment.tokenNumber && (
                              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600">
                                <Ticket
                                  size={12}
                                />
                                Token #
                                {
                                  appointment.tokenNumber
                                }
                              </p>
                            )}

                        </td>

                        {/* Action */}

                        <td className="px-5 py-4">

                          <div className="flex justify-center">

                            {canCheckIn && (
                              <button
                                onClick={() =>
                                  openCheckIn(
                                    appointment
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                <UserCheck
                                  size={15}
                                />
                                Check-in
                              </button>
                            )}

                            {alreadyChecked && (
                              <button
                                onClick={() =>
                                  openCheckIn(
                                    appointment
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                              >
                                <CheckCircle2
                                  size={15}
                                />
                                Checked-in
                              </button>
                            )}

                            {blocked && (
                              <button
                                disabled
                                className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400"
                              >
                                <AlertCircle
                                  size={15}
                                />
                                Not Eligible
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="px-5 py-14 text-center"
                  >

                    <Search
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No appointment found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try Appointment ID, UHID, mobile
                      or patient name.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          CHECK-IN MODAL
      ===================================================== */}

      {showCheckInModal &&
        selectedAppointment && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Modal Header */}

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <UserCheck size={20} />
                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Patient Check-in
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        selectedAppointment.appointmentId
                      }
                    </p>

                  </div>

                </div>

                <button
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Modal Content */}

              <div className="overflow-y-auto p-5">

                {/* Success */}

                {checkInSuccess ? (

                  <div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2
                          size={30}
                        />
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-green-800">
                        Check-in Successful
                      </h3>

                      <p className="mt-1 text-sm text-green-700">
                        {
                          checkInSuccess.patientName
                        }{" "}
                        has been checked in
                        successfully.
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <div className="rounded-lg border border-green-200 bg-white p-4">

                          <p className="text-xs text-slate-400">
                            Visit ID
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {
                              checkInSuccess.visitId
                            }
                          </p>

                        </div>

                        <div className="rounded-lg border border-green-200 bg-white p-4">

                          <p className="text-xs text-slate-400">
                            Token Number
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            #
                            {
                              checkInSuccess.tokenNumber
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Next Step */}

                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <ArrowRight
                        size={20}
                        className="shrink-0 text-blue-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-blue-800">
                          Next Step
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700">
                          Proceed to OPD billing. After
                          the required payment is completed,
                          the patient can become eligible
                          for the doctor's queue.
                        </p>

                      </div>

                    </div>

                  </div>

                ) : (

                  <>

                    {/* Patient Identity */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <User size={28} />
                        </div>

                        <div className="flex-1">

                          <h3 className="text-xl font-bold text-slate-900">
                            {
                              selectedAppointment.patientName
                            }
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">

                            <span className="flex items-center gap-1">
                              <Hash
                                size={13}
                              />
                              {
                                selectedAppointment.patientId
                              }
                            </span>

                            <span>
                              {
                                selectedAppointment.age
                              }{" "}
                              years
                            </span>

                            <span>
                              {
                                selectedAppointment.gender
                              }
                            </span>

                          </div>

                        </div>

                        <span className="self-start rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                          {
                            selectedAppointment.status
                          }
                        </span>

                      </div>

                    </div>

                    {/* Verification */}

                    <div className="mt-5">

                      <div className="mb-3 flex items-center gap-2">

                        <ShieldCheck
                          size={18}
                          className="text-blue-600"
                        />

                        <h3 className="font-semibold text-slate-800">
                          Verify Patient Details
                        </h3>

                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        <VerificationItem
                          icon={Phone}
                          label="Mobile"
                          value={
                            selectedAppointment.mobile
                          }
                        />

                        <VerificationItem
                          icon={Calendar}
                          label="Appointment Date"
                          value={
                            selectedAppointment.appointmentDate
                          }
                        />

                        <VerificationItem
                          icon={Clock}
                          label="Appointment Time"
                          value={
                            selectedAppointment.appointmentTime
                          }
                        />

                        <VerificationItem
                          icon={Stethoscope}
                          label="Doctor"
                          value={
                            selectedAppointment.doctorName
                          }
                        />

                        <VerificationItem
                          icon={MapPin}
                          label="Address"
                          value={
                            selectedAppointment.address
                          }
                        />

                        <VerificationItem
                          icon={Hash}
                          label="Appointment ID"
                          value={
                            selectedAppointment.appointmentId
                          }
                        />

                      </div>

                    </div>

                    {/* Warning */}

                    <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-amber-600"
                      />

                      <div>

                        <p className="text-sm font-semibold text-amber-800">
                          Verification Required
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700">
                          Confirm the patient's identity
                          and demographic details before
                          creating the OPD Visit.
                        </p>

                      </div>

                    </div>

                    {/* Existing Visit */}

                    {selectedAppointment.status ===
                      "CHECKED_IN" && (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

                        <div className="flex items-center gap-3">

                          <CheckCircle2
                            size={20}
                            className="text-green-600"
                          />

                          <div>

                            <p className="text-sm font-semibold text-green-800">
                              Patient Already Checked-in
                            </p>

                            <p className="mt-1 text-xs text-green-700">
                              Visit ID:{" "}
                              {
                                selectedAppointment.visitId
                              }{" "}
                              • Token #
                              {
                                selectedAppointment.tokenNumber
                              }
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

                  <button
                    onClick={closeModal}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Done
                  </button>

                ) : selectedAppointment.status ===
                  "CHECKED_IN" ? (

                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Close
                  </button>

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
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </h2>

        </div>

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          <Icon size={22} />
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   Verification Item
========================================================= */

function VerificationItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">

      <div className="flex items-center gap-2">

        <Icon
          size={16}
          className="text-blue-600"
        />

        <p className="text-xs text-slate-400">
          {label}
        </p>

      </div>

      <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
        {value || "-"}
      </p>

    </div>
  );
}