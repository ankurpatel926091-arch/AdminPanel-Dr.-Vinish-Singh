import React, { useMemo, useState } from "react";
import {
  Search,
  Calendar,
  User,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AllAppointments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Temporary data
  // Later API se replace kar dena
  const appointments = [
    {
      id: "APT-1001",
      token: "01",
      patientName: "Rahul Sharma",
      patientId: "UHID-1001",
      mobile: "9876543210",
      age: 42,
      gender: "Male",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
      date: "2026-09-12",
      time: "10:00 AM",
      status: "Confirmed",
      checkInStatus: "Checked-in",
    },
    {
      id: "APT-1002",
      token: "02",
      patientName: "Amit Verma",
      patientId: "UHID-1002",
      mobile: "9876543211",
      age: 35,
      gender: "Male",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Andrology",
      date: "2026-09-12",
      time: "10:30 AM",
      status: "Waiting for Doctor",
      checkInStatus: "Checked-in",
    },
    {
      id: "APT-1003",
      token: "03",
      patientName: "Priya Singh",
      patientId: "UHID-1003",
      mobile: "9876543212",
      age: 29,
      gender: "Female",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
      date: "2026-09-13",
      time: "11:00 AM",
      status: "Confirmed",
      checkInStatus: "Not Checked-in",
    },
    {
      id: "APT-1004",
      token: "04",
      patientName: "Sandeep Yadav",
      patientId: "UHID-1004",
      mobile: "9876543213",
      age: 51,
      gender: "Male",
      doctor: "Dr. Vinish Kumar Singh",
      department: "Urology",
      date: "2026-09-14",
      time: "11:30 AM",
      status: "Completed",
      checkInStatus: "Checked-in",
    },
  ];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        appointment.patientName.toLowerCase().includes(searchValue) ||
        appointment.patientId.toLowerCase().includes(searchValue) ||
        appointment.mobile.includes(searchValue) ||
        appointment.id.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      const matchesDate =
        !dateFilter || appointment.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [search, statusFilter, dateFilter]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-50 text-blue-600";

      case "Waiting for Doctor":
        return "bg-orange-50 text-orange-600";

      case "Completed":
        return "bg-green-50 text-green-600";

      case "Cancelled":
        return "bg-red-50 text-red-600";

      case "No Show":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getCheckInClass = (status) => {
    return status === "Checked-in"
      ? "bg-green-50 text-green-600"
      : "bg-slate-100 text-slate-500";
  };

  return (
    <div className="p-6 md:p-8 min-h-full bg-slate-50">

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              All Appointments
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              View and manage your assigned patient appointments
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{filteredAppointments.length} Appointments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search patient, ID or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waiting for Doctor">
              Waiting for Doctor
            </option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>

          {/* Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Appointment
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Patient
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Doctor / Department
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Date & Time
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Status
                </th>

                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Check-in
                </th>

                <th className="text-center px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (

                  <tr
                    key={appointment.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >

                    {/* Appointment */}
                    <td className="px-5 py-4">

                      <div className="font-semibold text-slate-800 text-sm">
                        {appointment.id}
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        Token #{appointment.token}
                      </div>

                    </td>

                    {/* Patient */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {appointment.patientName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {appointment.patientId}
                          </p>

                          <p className="text-xs text-slate-400">
                            {appointment.age} yrs • {appointment.gender}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Doctor */}
                    <td className="px-5 py-4">

                      <p className="text-sm font-medium text-slate-700">
                        {appointment.doctor}
                      </p>

                      <p className="text-xs text-blue-600 mt-1">
                        {appointment.department}
                      </p>

                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {appointment.date}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appointment.time}
                      </div>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>

                    </td>

                    {/* Check-in */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getCheckInClass(
                          appointment.checkInStatus
                        )}`}
                      >
                        {appointment.checkInStatus}
                      </span>

                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-center">

                      <button
                        title="View Patient"
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <Calendar className="w-10 h-10 text-slate-300 mb-3" />

                      <h3 className="text-sm font-semibold text-slate-600">
                        No appointments found
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search or filters
                      </p>

                    </div>
                  </td>
                </tr>

              )}

            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">

          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAppointments.length}
            </span>{" "}
            appointments
          </p>

          <div className="flex items-center gap-2">

            <button
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              1
            </button>

            <button
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AllAppointments;