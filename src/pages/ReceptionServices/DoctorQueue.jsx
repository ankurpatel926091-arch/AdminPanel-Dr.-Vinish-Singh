import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Users,
  Clock,
  UserCheck,
  Stethoscope,
  RefreshCw,
  ChevronDown,
  Eye,
  ArrowUp,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";

const DoctorQueue = () => {
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("All Doctors");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Mock queue data
  // Replace this with API data later
  const [queueData, setQueueData] = useState([
    {
      id: 1,
      token: "T-001",
      patientName: "Rahul Kumar",
      uhid: "UHID1021",
      age: 32,
      gender: "Male",
      mobile: "9876543210",
      doctor: "Dr. Vinish Kumar",
      department: "Urology",
      appointmentTime: "10:00 AM",
      checkInTime: "09:48 AM",
      queueStatus: "Waiting",
      priority: false,
      paymentStatus: "Paid",
    },
    {
      id: 2,
      token: "T-002",
      patientName: "Amit Singh",
      uhid: "UHID1022",
      age: 45,
      gender: "Male",
      mobile: "9123456780",
      doctor: "Dr. Vinish Kumar",
      department: "Urology",
      appointmentTime: "10:15 AM",
      checkInTime: "10:02 AM",
      queueStatus: "Waiting",
      priority: true,
      paymentStatus: "Paid",
    },
    {
      id: 3,
      token: "T-003",
      patientName: "Neha Sharma",
      uhid: "UHID1023",
      age: 28,
      gender: "Female",
      mobile: "9988776655",
      doctor: "Dr. Vinish Kumar",
      department: "Andrology",
      appointmentTime: "10:30 AM",
      checkInTime: "10:18 AM",
      queueStatus: "In Consultation",
      priority: false,
      paymentStatus: "Paid",
    },
    {
      id: 4,
      token: "T-004",
      patientName: "Suresh Yadav",
      uhid: "UHID1024",
      age: 51,
      gender: "Male",
      mobile: "9876501234",
      doctor: "Dr. Anjali Verma",
      department: "Nephrology",
      appointmentTime: "10:45 AM",
      checkInTime: "10:31 AM",
      queueStatus: "Waiting",
      priority: false,
      paymentStatus: "Paid",
    },
    {
      id: 5,
      token: "T-005",
      patientName: "Priya Gupta",
      uhid: "UHID1025",
      age: 36,
      gender: "Female",
      mobile: "9001122334",
      doctor: "Dr. Anjali Verma",
      department: "Nephrology",
      appointmentTime: "11:00 AM",
      checkInTime: "10:42 AM",
      queueStatus: "Completed",
      priority: false,
      paymentStatus: "Paid",
    },
    {
      id: 6,
      token: "T-006",
      patientName: "Mohit Verma",
      uhid: "UHID1026",
      age: 40,
      gender: "Male",
      mobile: "9112233445",
      doctor: "Dr. Vinish Kumar",
      department: "Urology",
      appointmentTime: "11:15 AM",
      checkInTime: "10:55 AM",
      queueStatus: "Waiting",
      priority: false,
      paymentStatus: "Paid",
    },
  ]);

  const filteredQueue = useMemo(() => {
    return queueData.filter((patient) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        patient.patientName.toLowerCase().includes(searchText) ||
        patient.uhid.toLowerCase().includes(searchText) ||
        patient.token.toLowerCase().includes(searchText) ||
        patient.mobile.includes(search);

      const matchesDoctor =
        doctorFilter === "All Doctors" ||
        patient.doctor === doctorFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        patient.queueStatus === statusFilter;

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        patient.department === departmentFilter;

      return (
        matchesSearch &&
        matchesDoctor &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [
    queueData,
    search,
    doctorFilter,
    statusFilter,
    departmentFilter,
  ]);

  const waitingCount = queueData.filter(
    (item) => item.queueStatus === "Waiting"
  ).length;

  const consultationCount = queueData.filter(
    (item) => item.queueStatus === "In Consultation"
  ).length;

  const completedCount = queueData.filter(
    (item) => item.queueStatus === "Completed"
  ).length;

  const priorityCount = queueData.filter(
    (item) => item.priority
  ).length;

  const updateQueueStatus = (id, status) => {
    setQueueData((prev) =>
      prev.map((patient) =>
        patient.id === id
          ? { ...patient, queueStatus: status }
          : patient
      )
    );
  };

  const moveToTop = (id) => {
    setQueueData((prev) => {
      const patient = prev.find((item) => item.id === id);
      const remaining = prev.filter((item) => item.id !== id);

      return patient ? [patient, ...remaining] : prev;
    });
  };

  const resetFilters = () => {
    setSearch("");
    setDoctorFilter("All Doctors");
    setStatusFilter("All Status");
    setDepartmentFilter("All Departments");
  };

  const statusStyle = {
    Waiting: "bg-amber-50 text-amber-700 border-amber-200",
    "In Consultation":
      "bg-blue-50 text-blue-700 border-blue-200",
    Completed:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Doctor Queue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage checked-in patients waiting for doctor consultation
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh Queue
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Waiting</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {waitingCount}
              </h2>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                In Consultation
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {consultationCount}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Stethoscope size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {completedCount}
              </h2>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Priority Patients</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {priorityCount}
              </h2>
            </div>

            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <UserCheck size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Queue Information */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex gap-3">
          <div className="mt-0.5 text-blue-600">
            <Users size={20} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-800">
              Queue Eligibility
            </h3>

            <p className="mt-1 text-sm text-blue-700">
              Only patients who are checked-in and have completed
              the required OPD payment are eligible for the doctor
              queue.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />

          <h2 className="font-semibold text-slate-800">
            Search & Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {/* Search */}
          <div className="relative xl:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search patient, UHID, token or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Doctor */}
          <div className="relative">
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>All Doctors</option>
              <option>Dr. Vinish Kumar</option>
              <option>Dr. Anjali Verma</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Department */}
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value)
              }
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>All Departments</option>
              <option>Urology</option>
              <option>Andrology</option>
              <option>Nephrology</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>All Status</option>
              <option>Waiting</option>
              <option>In Consultation</option>
              <option>Completed</option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Reset Filters
        </button>
      </div>

      {/* Queue Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Today's Doctor Queue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredQueue.length} patient
              {filteredQueue.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Queue order: Appointment → Check-in → Token
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Token
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  UHID
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Appointment
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Check-in
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredQueue.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-12 text-center"
                  >
                    <Users
                      size={35}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-medium text-slate-600">
                      No patients found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    {/* Token */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {patient.token}
                        </span>

                        {patient.priority && (
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                            Priority
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {patient.patientName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {patient.age} yrs • {patient.gender}
                        </p>
                      </div>
                    </td>

                    {/* UHID */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {patient.uhid}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {patient.mobile}
                      </p>
                    </td>

                    {/* Doctor */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {patient.doctor}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {patient.department}
                      </p>
                    </td>

                    {/* Appointment */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">
                        {patient.appointmentTime}
                      </p>
                    </td>

                    {/* Check-in */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">
                        {patient.checkInTime}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                          statusStyle[patient.queueStatus]
                        }`}
                      >
                        {patient.queueStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedPatient(patient)
                          }
                          title="View Patient"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                        >
                          <Eye size={16} />
                        </button>

                        {patient.queueStatus === "Waiting" && (
                          <>
                            <button
                              onClick={() =>
                                updateQueueStatus(
                                  patient.id,
                                  "In Consultation"
                                )
                              }
                              title="Start Consultation"
                              className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                            >
                              <PlayCircle size={16} />
                            </button>

                            {patient.priority && (
                              <button
                                onClick={() =>
                                  moveToTop(patient.id)
                                }
                                title="Move to Top"
                                className="rounded-lg border border-purple-200 bg-purple-50 p-2 text-purple-600 transition hover:bg-purple-100"
                              >
                                <ArrowUp size={16} />
                              </button>
                            )}
                          </>
                        )}

                        {patient.queueStatus ===
                          "In Consultation" && (
                          <button
                            onClick={() =>
                              updateQueueStatus(
                                patient.id,
                                "Completed"
                              )
                            }
                            title="Mark Completed"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Patient Queue Details
                </h2>

                <p className="text-xs text-slate-500">
                  Token {selectedPatient.token}
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <div className="mb-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <UserCheck size={22} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {selectedPatient.patientName}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {selectedPatient.age} years •{" "}
                      {selectedPatient.gender}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="UHID"
                  value={selectedPatient.uhid}
                />

                <InfoItem
                  label="Token"
                  value={selectedPatient.token}
                />

                <InfoItem
                  label="Doctor"
                  value={selectedPatient.doctor}
                />

                <InfoItem
                  label="Department"
                  value={selectedPatient.department}
                />

                <InfoItem
                  label="Appointment"
                  value={selectedPatient.appointmentTime}
                />

                <InfoItem
                  label="Check-in"
                  value={selectedPatient.checkInTime}
                />

                <InfoItem
                  label="Payment"
                  value={selectedPatient.paymentStatus}
                />

                <InfoItem
                  label="Queue Status"
                  value={selectedPatient.queueStatus}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 px-5 py-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
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

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
};

export default DoctorQueue;