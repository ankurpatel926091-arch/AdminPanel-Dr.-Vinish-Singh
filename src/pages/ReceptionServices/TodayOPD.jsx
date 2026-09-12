import React, { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  Filter,
  Clock,
  User,
  Phone,
  Stethoscope,
  CheckCircle2,
  CircleDollarSign,
  Users,
  Eye,
  UserCheck,
  X,
  MapPin,
  AlertCircle,
} from "lucide-react";

/* =========================
   Mock Today's OPD Data
========================= */

const opdData = [
  {
    id: "A-10025",
    visitId: "V-20052",
    token: 1,
    patientName: "Rahul Sharma",
    patientId: "UHID-10245",
    age: 42,
    gender: "Male",
    phone: "+91 9876543210",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    appointmentTime: "10:00 AM",
    checkInTime: "09:48 AM",
    status: "Checked-in",
    priority: false,
  },
  {
    id: "A-10026",
    visitId: "V-20053",
    token: 2,
    patientName: "Amit Verma",
    patientId: "UHID-10246",
    age: 36,
    gender: "Male",
    phone: "+91 9123456780",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    appointmentTime: "10:30 AM",
    checkInTime: "10:12 AM",
    status: "Waiting for Doctor",
    priority: true,
  },
  {
    id: "A-10027",
    visitId: "V-20054",
    token: 3,
    patientName: "Suresh Kumar",
    patientId: "UHID-10247",
    age: 58,
    gender: "Male",
    phone: "+91 9988776655",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "Ajanta Hospital",
    appointmentTime: "11:00 AM",
    checkInTime: "10:42 AM",
    status: "In Consultation",
    priority: false,
  },
  {
    id: "A-10028",
    visitId: null,
    token: null,
    patientName: "Mohit Singh",
    patientId: "UHID-10248",
    age: 29,
    gender: "Male",
    phone: "+91 9001122334",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Andrology",
    hospital: "Ajanta Hospital",
    appointmentTime: "11:30 AM",
    checkInTime: null,
    status: "Confirmed",
    priority: false,
  },
  {
    id: "A-10029",
    visitId: null,
    token: null,
    patientName: "Neha Gupta",
    patientId: "UHID-10249",
    age: 34,
    gender: "Female",
    phone: "+91 9011223344",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    appointmentTime: "12:00 PM",
    checkInTime: null,
    status: "Pending Confirmation",
    priority: false,
  },
  {
    id: "A-10030",
    visitId: "V-20055",
    token: 4,
    patientName: "Rakesh Yadav",
    patientId: "UHID-10250",
    age: 47,
    gender: "Male",
    phone: "+91 9887766554",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    appointmentTime: "12:30 PM",
    checkInTime: "12:10 PM",
    status: "Completed",
    priority: false,
  },
  {
    id: "A-10031",
    visitId: null,
    token: null,
    patientName: "Vikas Singh",
    patientId: "UHID-10251",
    age: 40,
    gender: "Male",
    phone: "+91 9877654321",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "Ajanta Hospital",
    appointmentTime: "01:00 PM",
    checkInTime: null,
    status: "No-show",
    priority: false,
  },
];

/* =========================
   Status Styles
========================= */

const statusStyles = {
  "Pending Confirmation":
    "bg-amber-50 text-amber-700 border-amber-200",

  Confirmed:
    "bg-blue-50 text-blue-700 border-blue-200",

  "Checked-in":
    "bg-indigo-50 text-indigo-700 border-indigo-200",

  "Waiting for Doctor":
    "bg-purple-50 text-purple-700 border-purple-200",

  "In Consultation":
    "bg-orange-50 text-orange-700 border-orange-200",

  Completed:
    "bg-green-50 text-green-700 border-green-200",

  "No-show":
    "bg-red-50 text-red-700 border-red-200",
};

/* =========================
   Main Component
========================= */

export default function TodayOPD() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState(null);

  /* =========================
     Filter Data
  ========================= */

  const filteredData = useMemo(() => {
    return opdData.filter((patient) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        patient.patientName.toLowerCase().includes(searchText) ||
        patient.patientId.toLowerCase().includes(searchText) ||
        patient.id.toLowerCase().includes(searchText) ||
        patient.phone.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        patient.status === statusFilter;

      const matchesDoctor =
        doctorFilter === "All" ||
        patient.doctor === doctorFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        patient.department === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDoctor &&
        matchesDepartment
      );
    });
  }, [
    search,
    statusFilter,
    doctorFilter,
    departmentFilter,
  ]);

  /* =========================
     Stats
  ========================= */

  const totalPatients = opdData.length;

  const checkedIn = opdData.filter(
    (item) =>
      item.status === "Checked-in" ||
      item.status === "Waiting for Doctor" ||
      item.status === "In Consultation"
  ).length;

  const waiting = opdData.filter(
    (item) => item.status === "Waiting for Doctor"
  ).length;

  const completed = opdData.filter(
    (item) => item.status === "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* =========================
          Header
      ========================= */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Today's OPD
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage today's appointments, check-ins and OPD queue.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Calendar
            size={18}
            className="text-blue-600"
          />

          <span className="text-sm font-medium text-slate-700">
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* =========================
          Stats Cards
      ========================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Today's Appointments
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {totalPatients}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={22} />
            </div>

          </div>
        </div>

        {/* Checked In */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Checked-in
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {checkedIn}
              </h2>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <UserCheck size={22} />
            </div>

          </div>
        </div>

        {/* Waiting */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Waiting for Doctor
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {waiting}
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Clock size={22} />
            </div>

          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Completed
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {completed}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>

          </div>
        </div>

      </div>

      {/* =========================
          Search & Filters
      ========================= */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-blue-600"
          />

          <h2 className="font-semibold text-slate-800">
            Search & Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

          {/* Search */}
          <div className="relative lg:col-span-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Patient name, UHID, phone..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Doctor */}
          <select
            value={doctorFilter}
            onChange={(e) =>
              setDoctorFilter(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Doctors</option>
            <option value="Dr. Vinish Kumar Singh">
              Dr. Vinish Kumar Singh
            </option>
          </select>

          {/* Department */}
          <select
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Departments</option>
            <option value="Urology">Urology</option>
            <option value="Andrology">Andrology</option>
            <option value="Nephrology">Nephrology</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Status</option>
            <option value="Pending Confirmation">
              Pending Confirmation
            </option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-in">Checked-in</option>
            <option value="Waiting for Doctor">
              Waiting for Doctor
            </option>
            <option value="In Consultation">
              In Consultation
            </option>
            <option value="Completed">Completed</option>
            <option value="No-show">No-show</option>
          </select>

        </div>
      </div>

      {/* =========================
          OPD Table
      ========================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-800">
              Today's OPD Queue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredData.length} patient
              {filteredData.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Live Queue
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Token
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Appointment
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor / Department
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check-in
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

              {filteredData.length > 0 ? (
                filteredData.map((patient) => (

                  <tr
                    key={patient.id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Token */}
                    <td className="px-5 py-4">

                      {patient.token ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 font-bold text-blue-600">
                          {patient.token}
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}

                    </td>

                    {/* Patient */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <User size={18} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">

                            <p className="font-semibold text-slate-800">
                              {patient.patientName}
                            </p>

                            {patient.priority && (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                Priority
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {patient.patientId} •{" "}
                            {patient.age} yrs •{" "}
                            {patient.gender}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Appointment */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock
                          size={16}
                          className="text-blue-500"
                        />

                        {patient.appointmentTime}
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {patient.id}
                      </p>

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
                            {patient.doctor}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {patient.department}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={12} />
                            {patient.hospital}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Check In */}
                    <td className="px-5 py-4">

                      {patient.checkInTime ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2
                            size={16}
                            className="text-green-500"
                          />

                          {patient.checkInTime}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not checked-in
                        </span>
                      )}

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                          statusStyles[patient.status]
                        }`}
                      >
                        {patient.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">

                      <div className="flex items-center justify-center gap-2">

                        {/* View */}
                        <button
                          onClick={() =>
                            setSelectedPatient(patient)
                          }
                          title="View Patient"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Check-in */}
                        {patient.status === "Confirmed" && (
                          <button
                            title="Check-in Patient"
                            className="rounded-lg border border-green-200 bg-green-50 p-2 text-green-600 transition hover:bg-green-100"
                          >
                            <UserCheck size={17} />
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-14 text-center"
                  >

                    <Users
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No OPD patients found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* =========================
          Patient Details Modal
      ========================= */}

      {selectedPatient && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Patient Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedPatient.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5">

              {/* Patient Basic Info */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <User size={27} />
                  </div>

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedPatient.patientName}
                      </h3>

                      {selectedPatient.priority && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                          Priority Patient
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPatient.patientId} •{" "}
                      {selectedPatient.age} years •{" "}
                      {selectedPatient.gender}
                    </p>

                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${
                      statusStyles[selectedPatient.status]
                    }`}
                  >
                    {selectedPatient.status}
                  </span>

                </div>

                {/* Details Grid */}
                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

                  <div className="flex items-center gap-3">
                    <Phone
                      size={17}
                      className="text-blue-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Mobile
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {selectedPatient.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar
                      size={17}
                      className="text-blue-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Appointment
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {selectedPatient.appointmentTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Stethoscope
                      size={17}
                      className="text-blue-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Doctor
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {selectedPatient.doctor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin
                      size={17}
                      className="text-blue-500"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Hospital
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {selectedPatient.hospital}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* OPD Information */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                <div className="mb-4 flex items-center gap-2">
                  <Clock
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-800">
                    OPD Information
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Token
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-800">
                      {selectedPatient.token || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Appointment
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPatient.appointmentTime}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Check-in
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPatient.checkInTime || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Visit ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPatient.visitId || "Not created"}
                    </p>
                  </div>

                </div>

              </div>

              {/* Operational Note */}
              <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Receptionist Access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Receptionist can manage appointment,
                    check-in and queue operations. Clinical
                    diagnosis and prescription should be handled
                    by the doctor.
                  </p>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">

              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>

              {selectedPatient.status === "Confirmed" && (
                <button
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <UserCheck size={16} />
                  Check-in Patient
                </button>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}