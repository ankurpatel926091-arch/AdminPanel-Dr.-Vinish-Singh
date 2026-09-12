import React from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  CheckCircle2,
  UserRound,
  PhoneCall,
  Eye,
  Activity,
  Stethoscope,
} from "lucide-react";

const DoctorDash = () => {
  // Temporary static data
  // Later API se replace kar sakte ho
  const stats = [
    {
      title: "Today's Appointments",
      value: 12,
      icon: CalendarDays,
      description: "Appointments today",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Waiting Patients",
      value: 4,
      icon: Clock3,
      description: "Waiting in queue",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Current Patient",
      value: 1,
      icon: UserRound,
      description: "In consultation",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Completed",
      value: 7,
      icon: CheckCircle2,
      description: "Consultations completed",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const queuePatients = [
    {
      token: "T-001",
      name: "Rahul Sharma",
      age: 42,
      gender: "Male",
      uhid: "UHID-10234",
      appointmentTime: "10:00 AM",
      checkInTime: "09:48 AM",
      status: "Waiting",
    },
    {
      token: "T-002",
      name: "Amit Verma",
      age: 35,
      gender: "Male",
      uhid: "UHID-10235",
      appointmentTime: "10:30 AM",
      checkInTime: "10:18 AM",
      status: "Waiting",
    },
    {
      token: "T-003",
      name: "Neha Singh",
      age: 29,
      gender: "Female",
      uhid: "UHID-10236",
      appointmentTime: "11:00 AM",
      checkInTime: "10:42 AM",
      status: "Waiting",
    },
    {
      token: "T-004",
      name: "Rajesh Kumar",
      age: 51,
      gender: "Male",
      uhid: "UHID-10237",
      appointmentTime: "11:30 AM",
      checkInTime: "11:05 AM",
      status: "Waiting",
    },
  ];

  const currentPatient = {
    name: "Suresh Yadav",
    age: 46,
    gender: "Male",
    uhid: "UHID-10230",
    token: "T-000",
    appointmentTime: "09:30 AM",
    complaint: "Pain and burning during urination",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Doctor Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Overview of today's OPD and patient queue
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
            <CalendarDays className="w-5 h-5 text-blue-600" />

            <div>
              <p className="text-xs text-slate-400">Today</p>
              <p className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-2">
                    {item.value}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Patient + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Current Patient */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  Current Patient
                </h2>

                <p className="text-xs text-slate-400">
                  Patient currently in consultation
                </p>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
              In Consultation
            </span>
          </div>

          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Patient Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <UserRound className="w-8 h-8 text-blue-600" />
              </div>

              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {currentPatient.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {currentPatient.age} years • {currentPatient.gender}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-blue-600">
                    Token {currentPatient.token}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className="text-xs text-slate-400">UHID</p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentPatient.uhid}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Appointment Time
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {currentPatient.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">
                    Chief Complaint
                  </p>

                  <p className="text-sm text-slate-700">
                    {currentPatient.complaint}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                    <Activity className="w-4 h-4" />
                    Continue Consultation
                  </button>

                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">
                    <Eye className="w-4 h-4" />
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">
              Quick Actions
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Frequently used actions
            </p>
          </div>

          <div className="p-5 space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-left">
              <CalendarDays className="w-5 h-5" />

              <div>
                <p className="text-sm font-semibold">
                  Today's Appointments
                </p>

                <p className="text-xs text-blue-500">
                  View today's schedule
                </p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition text-left">
              <Users className="w-5 h-5" />

              <div>
                <p className="text-sm font-semibold">
                  Open Patient Queue
                </p>

                <p className="text-xs text-orange-500">
                  4 patients waiting
                </p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition text-left">
              <CheckCircle2 className="w-5 h-5" />

              <div>
                <p className="text-sm font-semibold">
                  Completed Visits
                </p>

                <p className="text-xs text-green-500">
                  View today's completed visits
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">
              Today's Patient Queue
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Patients checked-in and waiting for consultation
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
            <Users className="w-4 h-4" />
            View Full Queue
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Token
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Patient
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  UHID
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Appointment
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Check-in
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>

                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {queuePatients.map((patient) => (
                <tr
                  key={patient.uhid}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition"
                >
                  <td className="px-5 py-4">
                    <span className="font-bold text-blue-600">
                      {patient.token}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {patient.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {patient.age} yrs • {patient.gender}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {patient.uhid}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {patient.appointmentTime}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {patient.checkInTime}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                      {patient.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="View Patient"
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        title="Call Patient"
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {queuePatients.map((patient) => (
            <div key={patient.uhid} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <UserRound className="w-5 h-5 text-blue-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {patient.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {patient.age} yrs • {patient.gender}
                    </p>
                  </div>
                </div>

                <span className="font-bold text-blue-600">
                  {patient.token}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-xs text-slate-400">UHID</p>
                  <p className="text-sm text-slate-600">
                    {patient.uhid}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Appointment</p>
                  <p className="text-sm text-slate-600">
                    {patient.appointmentTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Check-in</p>
                  <p className="text-sm text-slate-600">
                    {patient.checkInTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Status</p>

                  <span className="inline-flex mt-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                    {patient.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  View
                </button>

                <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                  <PhoneCall className="w-4 h-4" />
                  Call Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDash;