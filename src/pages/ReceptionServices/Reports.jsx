import React, { useMemo, useState } from "react";
import {
  Calendar,
  Search,
  Download,
  Printer,
  FileText,
  Users,
  UserCheck,
  CheckCircle,
  XCircle,
  IndianRupee,
  Clock,
  CreditCard,
  Stethoscope,
  RefreshCw,
  Filter,
} from "lucide-react";

/* =========================================================
   MOCK DATA
========================================================= */

const appointmentData = [
  {
    id: 1,
    date: "2026-09-12",
    appointmentId: "APT-1001",
    patient: "Rahul Sharma",
    uhid: "UHID-10001",
    doctor: "Dr. Vinish Kumar",
    time: "10:00 AM",
    status: "Completed",
  },
  {
    id: 2,
    date: "2026-09-12",
    appointmentId: "APT-1002",
    patient: "Priya Verma",
    uhid: "UHID-10002",
    doctor: "Dr. Vinish Kumar",
    time: "10:30 AM",
    status: "Checked-In",
  },
  {
    id: 3,
    date: "2026-09-12",
    appointmentId: "APT-1003",
    patient: "Amit Singh",
    uhid: "UHID-10003",
    doctor: "Dr. Vinish Kumar",
    time: "11:00 AM",
    status: "Waiting",
  },
  {
    id: 4,
    date: "2026-09-12",
    appointmentId: "APT-1004",
    patient: "Neha Gupta",
    uhid: "UHID-10004",
    doctor: "Dr. Vinish Kumar",
    time: "11:30 AM",
    status: "Cancelled",
  },
  {
    id: 5,
    date: "2026-09-11",
    appointmentId: "APT-1005",
    patient: "Vikas Yadav",
    uhid: "UHID-10005",
    doctor: "Dr. Vinish Kumar",
    time: "12:00 PM",
    status: "No-Show",
  },
  {
    id: 6,
    date: "2026-09-11",
    appointmentId: "APT-1006",
    patient: "Anjali Singh",
    uhid: "UHID-10006",
    doctor: "Dr. Vinish Kumar",
    time: "12:30 PM",
    status: "Completed",
  },
];

const opdData = [
  {
    id: 1,
    date: "2026-09-12",
    visitId: "VIS-5001",
    token: "T-01",
    patient: "Rahul Sharma",
    uhid: "UHID-10001",
    doctor: "Dr. Vinish Kumar",
    checkIn: "09:52 AM",
    status: "Completed",
  },
  {
    id: 2,
    date: "2026-09-12",
    visitId: "VIS-5002",
    token: "T-02",
    patient: "Priya Verma",
    uhid: "UHID-10002",
    doctor: "Dr. Vinish Kumar",
    checkIn: "10:22 AM",
    status: "Waiting",
  },
  {
    id: 3,
    date: "2026-09-12",
    visitId: "VIS-5003",
    token: "T-03",
    patient: "Amit Singh",
    uhid: "UHID-10003",
    doctor: "Dr. Vinish Kumar",
    checkIn: "10:48 AM",
    status: "Waiting",
  },
];

const paymentData = [
  {
    id: 1,
    date: "2026-09-12",
    receiptId: "REC-7001",
    patient: "Rahul Sharma",
    visitId: "VIS-5001",
    amount: 800,
    mode: "UPI",
    status: "Paid",
  },
  {
    id: 2,
    date: "2026-09-12",
    receiptId: "REC-7002",
    patient: "Priya Verma",
    visitId: "VIS-5002",
    amount: 800,
    mode: "Cash",
    status: "Paid",
  },
  {
    id: 3,
    date: "2026-09-12",
    receiptId: "REC-7003",
    patient: "Amit Singh",
    visitId: "VIS-5003",
    amount: 1000,
    mode: "Card",
    status: "Paid",
  },
  {
    id: 4,
    date: "2026-09-11",
    receiptId: "REC-7004",
    patient: "Anjali Singh",
    visitId: "VIS-5004",
    amount: 800,
    mode: "Online",
    status: "Paid",
  },
];

const doctorData = [
  {
    id: 1,
    doctor: "Dr. Vinish Kumar",
    appointments: 25,
    checkedIn: 21,
    completed: 18,
    cancelled: 2,
    noShow: 2,
  },
  {
    id: 2,
    doctor: "Dr. Rajesh Sharma",
    appointments: 18,
    checkedIn: 15,
    completed: 13,
    cancelled: 1,
    noShow: 2,
  },
  {
    id: 3,
    doctor: "Dr. Priya Singh",
    appointments: 14,
    checkedIn: 12,
    completed: 10,
    cancelled: 1,
    noShow: 1,
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Reports = () => {
  const [dateRange, setDateRange] = useState("Today");
  const [search, setSearch] = useState("");
  const [activeReport, setActiveReport] = useState("Appointments");

  const [fromDate, setFromDate] = useState("2026-09-12");
  const [toDate, setToDate] = useState("2026-09-12");

  /* -------------------------------------------------------
     FILTER APPOINTMENTS
  ------------------------------------------------------- */

  const filteredAppointments = useMemo(() => {
    return appointmentData.filter((item) => {
      const value = search.toLowerCase();

      return (
        item.patient.toLowerCase().includes(value) ||
        item.uhid.toLowerCase().includes(value) ||
        item.appointmentId.toLowerCase().includes(value) ||
        item.doctor.toLowerCase().includes(value)
      );
    });
  }, [search]);

  /* -------------------------------------------------------
     FILTER OPD
  ------------------------------------------------------- */

  const filteredOPD = useMemo(() => {
    return opdData.filter((item) => {
      const value = search.toLowerCase();

      return (
        item.patient.toLowerCase().includes(value) ||
        item.uhid.toLowerCase().includes(value) ||
        item.visitId.toLowerCase().includes(value) ||
        item.token.toLowerCase().includes(value)
      );
    });
  }, [search]);

  /* -------------------------------------------------------
     FILTER PAYMENTS
  ------------------------------------------------------- */

  const filteredPayments = useMemo(() => {
    return paymentData.filter((item) => {
      const value = search.toLowerCase();

      return (
        item.patient.toLowerCase().includes(value) ||
        item.receiptId.toLowerCase().includes(value) ||
        item.visitId.toLowerCase().includes(value) ||
        item.mode.toLowerCase().includes(value)
      );
    });
  }, [search]);

  /* -------------------------------------------------------
     SUMMARY
  ------------------------------------------------------- */

  const totalAppointments = appointmentData.length;

  const checkedIn = appointmentData.filter(
    (item) => item.status === "Checked-In"
  ).length;

  const completed = appointmentData.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelledNoShow = appointmentData.filter(
    (item) =>
      item.status === "Cancelled" || item.status === "No-Show"
  ).length;

  const totalRevenue = paymentData.reduce(
    (total, item) => total + item.amount,
    0
  );

  const pendingPayments = 3;

  /* -------------------------------------------------------
     RESET
  ------------------------------------------------------- */

  const resetFilters = () => {
    setDateRange("Today");
    setSearch("");
    setFromDate("2026-09-12");
    setToDate("2026-09-12");
  };

  /* -------------------------------------------------------
     CSV EXPORT
  ------------------------------------------------------- */

  const exportCSV = () => {
    let data = [];

    if (activeReport === "Appointments") {
      data = filteredAppointments;
    } else if (activeReport === "OPD") {
      data = filteredOPD;
    } else if (activeReport === "Payments") {
      data = filteredPayments;
    } else {
      data = doctorData;
    }

    if (!data.length) return;

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
      headers
        .map((header) => `"${row[header]}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeReport.toLowerCase()}-report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and analyze operational reports
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Printer size={17} />
            Print Report
          </button>
        </div>
      </div>

      {/* =====================================================
          DATE FILTER
      ====================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar size={18} className="text-blue-600" />
            Report Period
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <div className="flex flex-wrap gap-2">
              {[
                "Today",
                "Yesterday",
                "This Week",
                "This Month",
                "Custom",
              ].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    dateRange === range
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {dateRange === "Custom" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />

                <span className="hidden items-center text-slate-400 sm:flex">
                  to
                </span>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            )}

            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        <StatCard
          title="Appointments"
          value={totalAppointments}
          icon={<Calendar size={20} />}
        />

        <StatCard
          title="Checked-In"
          value={checkedIn}
          icon={<UserCheck size={20} />}
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={<CheckCircle size={20} />}
        />

        <StatCard
          title="Cancelled / No-Show"
          value={cancelledNoShow}
          icon={<XCircle size={20} />}
        />

        <StatCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<IndianRupee size={20} />}
        />

        <StatCard
          title="Pending Payments"
          value={pendingPayments}
          icon={<Clock size={20} />}
        />
      </div>

      {/* =====================================================
          REPORT TABS
      ====================================================== */}

      <div className="mb-4 flex flex-wrap gap-2">
        <ReportTab
          active={activeReport === "Appointments"}
          onClick={() => setActiveReport("Appointments")}
          icon={<Calendar size={17} />}
          label="Appointments"
        />

        <ReportTab
          active={activeReport === "OPD"}
          onClick={() => setActiveReport("OPD")}
          icon={<Users size={17} />}
          label="OPD / Check-In"
        />

        <ReportTab
          active={activeReport === "Payments"}
          onClick={() => setActiveReport("Payments")}
          icon={<CreditCard size={17} />}
          label="Payments"
        />

        <ReportTab
          active={activeReport === "Doctors"}
          onClick={() => setActiveReport("Doctors")}
          icon={<Stethoscope size={17} />}
          label="Doctor Wise"
        />
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeReport === "Appointments"
                ? "Search patient, UHID, appointment ID or doctor..."
                : activeReport === "OPD"
                ? "Search patient, UHID, visit ID or token..."
                : activeReport === "Payments"
                ? "Search patient, receipt ID, visit ID or payment mode..."
                : "Search doctor..."
            }
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* =====================================================
          APPOINTMENT REPORT
      ====================================================== */}

      {activeReport === "Appointments" && (
        <ReportCard
          title="Appointment Report"
          icon={<Calendar size={19} />}
          count={filteredAppointments.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <TableHead
                columns={[
                  "Date",
                  "Appointment ID",
                  "Patient",
                  "UHID",
                  "Doctor",
                  "Time",
                  "Status",
                ]}
              />

              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.date}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-blue-600">
                      {item.appointmentId}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {item.patient}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.uhid}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.doctor}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.time}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}

      {/* =====================================================
          OPD REPORT
      ====================================================== */}

      {activeReport === "OPD" && (
        <ReportCard
          title="OPD / Check-In Report"
          icon={<Users size={19} />}
          count={filteredOPD.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <TableHead
                columns={[
                  "Date",
                  "Visit ID",
                  "Token",
                  "Patient",
                  "UHID",
                  "Doctor",
                  "Check-In",
                  "Status",
                ]}
              />

              <tbody className="divide-y divide-slate-100">
                {filteredOPD.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.date}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-blue-600">
                      {item.visitId}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        {item.token}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {item.patient}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.uhid}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.doctor}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.checkIn}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}

      {/* =====================================================
          PAYMENT REPORT
      ====================================================== */}

      {activeReport === "Payments" && (
        <ReportCard
          title="Payment Report"
          icon={<CreditCard size={19} />}
          count={filteredPayments.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <TableHead
                columns={[
                  "Date",
                  "Receipt ID",
                  "Patient",
                  "Visit ID",
                  "Amount",
                  "Payment Mode",
                  "Status",
                ]}
              />

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.date}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-blue-600">
                      {item.receiptId}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {item.patient}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.visitId}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                      ₹{item.amount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {item.mode}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}

      {/* =====================================================
          DOCTOR WISE REPORT
      ====================================================== */}

      {activeReport === "Doctors" && (
        <ReportCard
          title="Doctor Wise Report"
          icon={<Stethoscope size={19} />}
          count={doctorData.length}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <TableHead
                columns={[
                  "Doctor",
                  "Appointments",
                  "Checked-In",
                  "Completed",
                  "Cancelled",
                  "No-Show",
                  "Completion %",
                ]}
              />

              <tbody className="divide-y divide-slate-100">
                {doctorData.map((item) => {
                  const percentage =
                    item.appointments > 0
                      ? Math.round(
                          (item.completed / item.appointments) * 100
                        )
                      : 0;

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                            DR
                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {item.doctor}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.appointments}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.checkedIn}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-emerald-600">
                        {item.completed}
                      </td>

                      <td className="px-5 py-4 text-sm text-red-500">
                        {item.cancelled}
                      </td>

                      <td className="px-5 py-4 text-sm text-orange-500">
                        {item.noShow}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-medium text-slate-600">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}

      {/* =====================================================
          INFO NOTE
      ====================================================== */}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <FileText
          size={19}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <h3 className="text-sm font-semibold text-blue-800">
            Report Information
          </h3>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            These reports are intended for operational use such as
            appointments, OPD check-in, payments and doctor-wise
            activity. Clinical diagnosis and prescription information
            is not included in receptionist reports.
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-800">
            {value}
          </h3>
        </div>

        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   REPORT TAB
========================================================= */

const ReportTab = ({
  active,
  onClick,
  icon,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

/* =========================================================
   REPORT CARD
========================================================= */

const ReportCard = ({
  title,
  icon,
  count,
  children,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-600">{icon}</span>

          <h2 className="font-semibold text-slate-800">
            {title}
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {count} Records
        </span>
      </div>

      {children}
    </div>
  );
};

/* =========================================================
   TABLE HEAD
========================================================= */

const TableHead = ({ columns }) => {
  return (
    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
      <tr>
        {columns.map((column) => (
          <th
            key={column}
            className="px-5 py-3 font-semibold"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-600",
    "Checked-In": "bg-blue-50 text-blue-600",
    Waiting: "bg-orange-50 text-orange-600",
    Paid: "bg-emerald-50 text-emerald-600",
    Cancelled: "bg-red-50 text-red-600",
    "No-Show": "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
};

export default Reports;