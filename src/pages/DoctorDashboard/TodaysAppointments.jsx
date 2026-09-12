import React, { useMemo, useState } from "react";
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
} from "lucide-react";

const TodaysAppointments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ---------------------------------------
  // Temporary data
  // Replace this with API data later
  // ---------------------------------------
  const appointments = [
    {
      appointmentId: "APT-1001",
      tokenNumber: "01",
      patientName: "Rahul Kumar",
      patientId: "UHID-1001",
      age: 32,
      gender: "Male",
      mobile: "+91 9876543210",
      appointmentTime: "10:00 AM",
      checkInTime: "09:48 AM",
      queueStatus: "Waiting",
      appointmentStatus: "Confirmed",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
    },
    {
      appointmentId: "APT-1002",
      tokenNumber: "02",
      patientName: "Amit Sharma",
      patientId: "UHID-1002",
      age: 45,
      gender: "Male",
      mobile: "+91 9123456780",
      appointmentTime: "10:30 AM",
      checkInTime: "10:12 AM",
      queueStatus: "In Consultation",
      appointmentStatus: "Confirmed",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
    },
    {
      appointmentId: "APT-1003",
      tokenNumber: "03",
      patientName: "Priya Singh",
      patientId: "UHID-1003",
      age: 29,
      gender: "Female",
      mobile: "+91 9988776655",
      appointmentTime: "11:00 AM",
      checkInTime: "10:42 AM",
      queueStatus: "Waiting",
      appointmentStatus: "Confirmed",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Andrology",
    },
    {
      appointmentId: "APT-1004",
      tokenNumber: "04",
      patientName: "Suresh Verma",
      patientId: "UHID-1004",
      age: 51,
      gender: "Male",
      mobile: "+91 9001122334",
      appointmentTime: "11:30 AM",
      checkInTime: "11:15 AM",
      queueStatus: "Completed",
      appointmentStatus: "Confirmed",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
    },
    {
      appointmentId: "APT-1005",
      tokenNumber: "05",
      patientName: "Neha Gupta",
      patientId: "UHID-1005",
      age: 36,
      gender: "Female",
      mobile: "+91 9876123456",
      appointmentTime: "12:00 PM",
      checkInTime: null,
      queueStatus: "Not Checked-in",
      appointmentStatus: "Confirmed",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
    },
  ];

  // ---------------------------------------
  // Filter
  // ---------------------------------------
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        appointment.patientName.toLowerCase().includes(searchText) ||
        appointment.patientId.toLowerCase().includes(searchText) ||
        appointment.appointmentId.toLowerCase().includes(searchText) ||
        appointment.tokenNumber.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.queueStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

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
    <div className="p-4 md:p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Today's Appointments
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View today's OPD appointments and patient queue
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
          <CalendarDays className="w-4 h-4 text-blue-600" />

          <span className="text-sm font-medium text-slate-700">
            12 September 2026
          </span>
        </div>

      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs text-slate-500">
                Today's OPD
              </p>

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
              <p className="text-xs text-slate-500">
                Waiting
              </p>

              <h2 className="text-2xl font-bold text-amber-600 mt-1">
                {
                  appointments.filter(
                    (item) => item.queueStatus === "Waiting"
                  ).length
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
              <p className="text-xs text-slate-500">
                In Consultation
              </p>

              <h2 className="text-2xl font-bold text-blue-600 mt-1">
                {
                  appointments.filter(
                    (item) =>
                      item.queueStatus === "In Consultation"
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
              <p className="text-xs text-slate-500">
                Completed
              </p>

              <h2 className="text-2xl font-bold text-green-600 mt-1">
                {
                  appointments.filter(
                    (item) => item.queueStatus === "Completed"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
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
                py-2.5
                rounded-lg
                border
                border-slate-200
                text-sm
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
              px-4
              py-2.5
              rounded-lg
              border
              border-slate-200
              bg-white
              text-sm
              outline-none
              focus:border-blue-500
            "
          >
            <option value="All">All Patients</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">
              In Consultation
            </option>
            <option value="Completed">Completed</option>
            <option value="Not Checked-in">
              Not Checked-in
            </option>
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

              {filteredAppointments.length > 0 ? (

                filteredAppointments.map((appointment) => (

                  <tr
                    key={appointment.appointmentId}
                    className="hover:bg-slate-50 transition"
                  >

                    {/* Token */}
                    <td className="px-5 py-4">

                      <div className="
                        w-10
                        h-10
                        rounded-lg
                        bg-blue-50
                        text-blue-700
                        flex
                        items-center
                        justify-center
                        font-bold
                      ">
                        #{appointment.tokenNumber}
                      </div>

                    </td>

                    {/* Patient */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="
                          w-9
                          h-9
                          rounded-full
                          bg-slate-100
                          flex
                          items-center
                          justify-center
                        ">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-slate-800">
                            {appointment.patientName}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {appointment.age} Years •{" "}
                            {appointment.gender}
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
                          ${getStatusClass(
                            appointment.queueStatus
                          )}
                        `}
                      >
                        {appointment.queueStatus}
                      </span>

                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            setSelectedPatient(appointment)
                          }
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
                            "
                          >
                            <Play size={15} />
                            Start
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
                    className="px-5 py-12 text-center"
                  >

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

        <div className="
          fixed
          inset-0
          z-[100]
          bg-black/50
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            bg-white
            w-full
            max-w-2xl
            rounded-2xl
            shadow-2xl
            overflow-hidden
          ">

            {/* Modal Header */}
            <div className="
              flex
              items-center
              justify-between
              px-6
              py-4
              border-b
              border-slate-200
            ">

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
                  <p className="text-xs text-slate-400">
                    Patient Name
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.patientName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Patient ID / UHID
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.patientId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Age / Gender
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.age} Years /{" "}
                    {selectedPatient.gender}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Mobile
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.mobile}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Token Number
                  </p>

                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    #{selectedPatient.tokenNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Appointment Time
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.appointmentTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Check-in Time
                  </p>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedPatient.checkInTime || "Not Checked-in"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Queue Status
                  </p>

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
                      ${getStatusClass(
                        selectedPatient.queueStatus
                      )}
                    `}
                  >
                    {selectedPatient.queueStatus}
                  </span>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="
              px-6
              py-4
              bg-slate-50
              border-t
              border-slate-200
              flex
              justify-end
            ">

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