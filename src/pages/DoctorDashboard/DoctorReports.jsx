import React, { useState, useMemo } from "react";
import { useAdminData } from "../../context/AdminDataContext";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCw,
  Search,
  Filter,
  Printer,
  Download,
  Stethoscope,
  UserCheck,
  CalendarCheck,
  FileText,
  ChevronRight,
  ArrowUpRight,
  User,
  Activity,
  AlertCircle,
} from "lucide-react";

// Mock Consultation Report Data for Dr. Vinish Kumar Singh
const MOCK_PATIENT_REPORTS = [
  {
    id: "REP-101",
    patientName: "Rahul Sharma",
    uhid: "UHID-10245",
    visitDate: "2026-09-14",
    formattedVisitDate: "14 Sep 2026",
    consultationType: "Follow-up",
    diagnosis: "Laser Kidney Stone (RIRS) Post-Op",
    status: "Completed",
    followUpDate: "2026-09-28",
    formattedFollowUpDate: "28 Sep 2026",
    gender: "Male",
    age: 34,
  },
  {
    id: "REP-102",
    patientName: "Priya Verma",
    uhid: "UHID-10246",
    visitDate: "2026-09-14",
    formattedVisitDate: "14 Sep 2026",
    consultationType: "First Visit",
    diagnosis: "Acute Right Renal Colic / Ureteric Stone",
    status: "Pending",
    followUpDate: "2026-09-21",
    formattedFollowUpDate: "21 Sep 2026",
    gender: "Female",
    age: 31,
  },
  {
    id: "REP-103",
    patientName: "Suresh Kumar",
    uhid: "UHID-10247",
    visitDate: "2026-09-14",
    formattedVisitDate: "14 Sep 2026",
    consultationType: "First Visit",
    diagnosis: "Prostate Enlargement (BPH) & LUTS",
    status: "Completed",
    followUpDate: "2026-09-30",
    formattedFollowUpDate: "30 Sep 2026",
    gender: "Male",
    age: 52,
  },
  {
    id: "REP-104",
    patientName: "Mohit Singh",
    uhid: "UHID-10248",
    visitDate: "2026-09-13",
    formattedVisitDate: "13 Sep 2026",
    consultationType: "Follow-up",
    diagnosis: "Recurrent UTI & Cystitis",
    status: "Completed",
    followUpDate: "2026-09-20",
    formattedFollowUpDate: "20 Sep 2026",
    gender: "Male",
    age: 28,
  },
  {
    id: "REP-105",
    patientName: "Sunita Gupta",
    uhid: "UHID-10249",
    visitDate: "2026-09-12",
    formattedVisitDate: "12 Sep 2026",
    consultationType: "First Visit",
    diagnosis: "Nephrolithiasis Evaluation",
    status: "Cancelled",
    followUpDate: null,
    formattedFollowUpDate: "-",
    gender: "Female",
    age: 45,
  },
  {
    id: "REP-106",
    patientName: "Rajesh Chandra",
    uhid: "UHID-10240",
    visitDate: "2026-09-11",
    formattedVisitDate: "11 Sep 2026",
    consultationType: "Follow-up",
    diagnosis: "TURP Post-Op Clearance",
    status: "Completed",
    followUpDate: "2026-09-25",
    formattedFollowUpDate: "25 Sep 2026",
    gender: "Male",
    age: 60,
  },
  {
    id: "REP-107",
    patientName: "Amitabh Srivastava",
    uhid: "UHID-10238",
    visitDate: "2026-09-10",
    formattedVisitDate: "10 Sep 2026",
    consultationType: "First Visit",
    diagnosis: "Microscopic Hematuria Investigation",
    status: "Completed",
    followUpDate: "2026-09-24",
    formattedFollowUpDate: "24 Sep 2026",
    gender: "Male",
    age: 49,
  },
];

// Mock Upcoming Follow-ups List
const MOCK_UPCOMING_FOLLOWUPS = [
  {
    id: "FOL-201",
    patientName: "Mohit Singh",
    uhid: "UHID-10248",
    lastVisit: "13 Sep 2026",
    followUpDate: "20 Sep 2026",
    status: "Upcoming",
    diagnosis: "Recurrent UTI Checkup",
  },
  {
    id: "FOL-202",
    patientName: "Priya Verma",
    uhid: "UHID-10246",
    lastVisit: "14 Sep 2026",
    followUpDate: "21 Sep 2026",
    status: "Upcoming",
    diagnosis: "USG KUB Review",
  },
  {
    id: "FOL-203",
    patientName: "Rajesh Chandra",
    uhid: "UHID-10240",
    lastVisit: "11 Sep 2026",
    followUpDate: "25 Sep 2026",
    status: "Upcoming",
    diagnosis: "TURP Recovery Follow-up",
  },
  {
    id: "FOL-204",
    patientName: "Rahul Sharma",
    uhid: "UHID-10245",
    lastVisit: "14 Sep 2026",
    followUpDate: "28 Sep 2026",
    status: "Upcoming",
    diagnosis: "Stent Removal Evaluation",
  },
];

// Daily Consultations Trend Data
const CONSULTATION_TREND_DATA = [
  { date: "08 Sep", consultations: 14, completed: 12 },
  { date: "09 Sep", consultations: 18, completed: 16 },
  { date: "10 Sep", consultations: 15, completed: 14 },
  { date: "11 Sep", consultations: 22, completed: 20 },
  { date: "12 Sep", consultations: 19, completed: 17 },
  { date: "13 Sep", consultations: 16, completed: 15 },
  { date: "14 Sep", consultations: 12, completed: 8 },
];

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export default function DoctorReports() {
  const adminData = useAdminData();
  const realAppointments = adminData?.appointments || [];

  // State Filters
  const [dateRange, setDateRange] = useState("THIS_WEEK"); // 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Refresh Action
  const handleRefresh = () => {
    if (adminData?.fetchEnquiries) {
      adminData.fetchEnquiries();
    }
    toast.info("OPD reports refreshed", { icon: "🔄" });
  };

  // Export CSV Action
  const handleExportCSV = () => {
    try {
      const headers = [
        "Patient Name",
        "UHID",
        "Visit Date",
        "Consultation Type",
        "Diagnosis",
        "Status",
        "Follow-up Date",
      ];
      const rows = MOCK_PATIENT_REPORTS.map((r) => [
        r.patientName,
        r.uhid,
        r.formattedVisitDate,
        r.consultationType,
        `"${r.diagnosis}"`,
        r.status,
        r.formattedFollowUpDate,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Doctor_Consultation_Report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Consultation report downloaded successfully!");
    } catch (e) {
      toast.error("Export failed: " + e.message);
    }
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Summary Metrics Calculation
  const metrics = useMemo(() => {
    const totalPatients = MOCK_PATIENT_REPORTS.length;
    const todaysConsultations = MOCK_PATIENT_REPORTS.filter(
      (r) => r.visitDate === "2026-09-14"
    ).length;
    const completedConsultations = MOCK_PATIENT_REPORTS.filter(
      (r) => r.status === "Completed"
    ).length;
    const followUpPatients = MOCK_PATIENT_REPORTS.filter(
      (r) => r.consultationType === "Follow-up"
    ).length;

    return {
      totalPatients,
      todaysConsultations,
      completedConsultations,
      followUpPatients,
    };
  }, []);

  // Status Breakdown for Pie Chart
  const statusPieData = useMemo(() => {
    const completed = MOCK_PATIENT_REPORTS.filter(
      (r) => r.status === "Completed"
    ).length;
    const pending = MOCK_PATIENT_REPORTS.filter(
      (r) => r.status === "Pending"
    ).length;
    const cancelled = MOCK_PATIENT_REPORTS.filter(
      (r) => r.status === "Cancelled"
    ).length;

    return [
      { name: "Completed", value: completed },
      { name: "Pending", value: pending },
      { name: "Cancelled", value: cancelled },
    ];
  }, []);

  // Filtered Patient Table
  const filteredReports = useMemo(() => {
    return MOCK_PATIENT_REPORTS.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.patientName.toLowerCase().includes(q) ||
        item.uhid.toLowerCase().includes(q) ||
        item.diagnosis.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      const matchesType =
        typeFilter === "ALL" || item.consultationType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <Stethoscope className="w-4 h-4" />
            <span>Dr. Vinish Kumar Singh • Doctor OPD Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Consultation & OPD Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View and analyze your OPD consultation activity, patient visit history, and follow-up schedules.
          </p>
        </div>

        {/* Header Actions: Print, Export, Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Report
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Reports"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Date Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            Date Period:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "TODAY", label: "Today" },
              { id: "THIS_WEEK", label: "This Week" },
              { id: "THIS_MONTH", label: "This Month" },
              { id: "CUSTOM", label: "Custom Range" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setDateRange(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  dateRange === btn.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateRange === "CUSTOM" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        )}
      </div>

      {/* 2. Summary Cards (4 Doctor-Focused Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Patients
            </span>
            <span className="text-3xl font-black text-slate-800 mt-1 block">
              {metrics.totalPatients}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Recorded in selected period
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today's Consultations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Today's Consultations
            </span>
            <span className="text-3xl font-black text-blue-600 mt-1 block">
              {metrics.todaysConsultations}
            </span>
            <span className="text-[11px] text-blue-500 font-medium mt-0.5 block">
              Scheduled for OPD today
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Completed Consultations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              {metrics.completedConsultations}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Finished & Prescribed
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Follow-up Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Follow-up Patients
            </span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">
              {metrics.followUpPatients}
            </span>
            <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">
              Returning OPD consultations
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4 & 5. OPD Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: OPD Consultation Trend (Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-sm sm:text-base">
                OPD Consultation Volume
              </h2>
              <p className="text-xs text-slate-500">
                Number of consultations conducted per day
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
              Weekly Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONSULTATION_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
                  itemStyle={{ color: "#38BDF8" }}
                />
                <Bar dataKey="consultations" fill="#2563EB" radius={[6, 6, 0, 0]} name="Total OPD" />
                <Bar dataKey="completed" fill="#10B981" radius={[6, 6, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Consultation Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              Consultation Status Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Status distribution for selected period
            </p>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px", color: "#FFF", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Completed Consultations
              </span>
              <span className="font-bold text-slate-800">
                {statusPieData[0].value}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Pending / In Queue
              </span>
              <span className="font-bold text-slate-800">
                {statusPieData[1].value}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                Cancelled / No-show
              </span>
              <span className="font-bold text-slate-800">
                {statusPieData[2].value}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Patient Consultation Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              Patient Consultation History
            </h2>
            <p className="text-xs text-slate-500">
              Detailed list of consultations and diagnoses
            </p>
          </div>

          {/* Table Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, UHID, diagnosis..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Visit Types</option>
              <option value="First Visit">First Visit</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              No consultation records match your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">UHID</th>
                  <th className="py-3 px-4">Visit Date</th>
                  <th className="py-3 px-4">Visit Type</th>
                  <th className="py-3 px-4">Diagnosis / Main Complaint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Follow-up Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {row.patientName}
                      <span className="text-[11px] font-normal text-slate-500 block">
                        {row.gender}, {row.age} yrs
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {row.uhid}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {row.formattedVisitDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          row.consultationType === "Follow-up"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {row.consultationType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {row.diagnosis}
                    </td>
                    <td className="py-3 px-4">
                      {row.status === "Completed" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      )}
                      {row.status === "Pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                      {row.status === "Cancelled" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {row.formattedFollowUpDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Upcoming Follow-up Report Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-600" />
              Upcoming Follow-up Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Patients scheduled to return for consultation checkups
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800">
            {MOCK_UPCOMING_FOLLOWUPS.length} Upcoming
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_UPCOMING_FOLLOWUPS.map((fol) => (
            <div
              key={fol.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">{fol.uhid}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {fol.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">
                  {fol.patientName}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                  {fol.diagnosis}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] flex justify-between text-slate-500">
                <span>Last: {fol.lastVisit}</span>
                <span className="font-bold text-blue-700">Due: {fol.followUpDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}