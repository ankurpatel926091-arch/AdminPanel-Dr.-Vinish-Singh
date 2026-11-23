import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getConsultationsApi } from "../../api/consultationApi";
import {
  Search,
  Filter,
  Eye,
  User,
  Users,
  Calendar,
  Phone,
  Activity,
  FileText,
  X,
  Stethoscope,
  ClipboardList,
  Pill,
  AlertCircle,
  TestTube,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
} from "lucide-react";

const statusStyles = {
  Active: "bg-green-50 text-green-700 border-green-200",
  "Follow-up": "bg-blue-50 text-blue-700 border-blue-200",
  "Under Investigation": "bg-amber-50 text-amber-700 border-amber-200",
};

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <Icon size={18} />
        </div>

        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>

      {children}
    </div>
  );
}

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ✅ NEW: Pagination states
  // Server-Side Pagination & Data State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecordsCount, setTotalRecordsCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summaryStats, setSummaryStats] = useState({ total: 0, prescriptions: 0, investigations: 0 });

  const fetchRecords = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await getConsultationsApi({
        search: debouncedSearch,
        filter: statusFilter,
        page,
        limit: itemsPerPage,
      });

      if (res?.stats) {
        setSummaryStats(res.stats);
      }

      const rawList = res?.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      const total = typeof res?.total === "number" ? res.total : rawList.length;
      setTotalRecordsCount(total);
      setTotalPages(res?.totalPages || Math.max(1, Math.ceil(total / itemsPerPage)));

      const mapped = rawList.map((item, idx) => ({
        id: item.recordKey || item._id || `MR-${idx + 1001}`,
        patientId: item.patientId || "—",
        patientName: item.patientName || "Patient",
        age: item.age || "—",
        gender: item.gender || "—",
        phone: item.mobile || "—",
        bloodGroup: "—",
        visitDate: item.completedAt
          ? new Date(item.completedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
        diagnosis: item.diagnosis || "General Consultation",
        complaint: item.chiefComplaint || "No complaint specified",
        doctor: item.doctorName || "Dr. Vinish Kumar Singh",
        status: item.status === "COMPLETED" ? "Active" : "Under Investigation",
        medicalHistory: item.clinicalNotes ? [item.clinicalNotes] : ["No prior history noted"],
        allergies: ["No known allergies"],
        medications: (item.medicines || [])
          .filter((m) => m && m.name)
          .map(
            (m) =>
              `${m.name} ${m.dosage ? `(${m.dosage})` : ""} ${m.frequency || ""}`.trim()
          ),
        clinicalNotes: item.clinicalNotes || "—",
        investigations: item.investigation
          ? [
              {
                name: item.investigation,
                date: "Prescribed",
                result: "Pending",
                remarks: "Advised in consultation",
              },
            ]
          : [],
        treatmentPlan:
          item.advice || item.followUpInstructions || "Follow prescribed advice.",
      }));
      setRecords(mapped);
    } catch (err) {
      console.warn("Failed to load consultations:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, itemsPerPage, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchRecords(currentPage);
  }, [debouncedSearch, statusFilter, currentPage, itemsPerPage]);

  // Necessary Clinical Stats
  const totalRecords = records.length;
  const prescriptionsCount = useMemo(() => {
    return records.filter((r) => r.medications && r.medications.length > 0)
      .length;
  }, [records]);

  const investigationsCount = useMemo(() => {
    return records.filter(
      (r) => r.investigations && r.investigations.length > 0
    ).length;
  }, [records]);

  // CSV Export Handler
  const exportToCSV = () => {
    const dataToExport =
      filteredRecords.length > 0 ? filteredRecords : records;
    if (!dataToExport || dataToExport.length === 0) return;

    const headers = [
      "Record ID",
      "Patient Name",
      "UHID",
      "Age",
      "Gender",
      "Phone",
      "Visit Date",
      "Diagnosis",
      "Chief Complaint",
      "Doctor",
      "Prescribed Medicines",
      "Investigations Advised",
      "Advice / Treatment Plan",
    ];

    const rows = dataToExport.map((r) => [
      `"${r.id || ""}"`,
      `"${(r.patientName || "").replace(/"/g, '""')}"`,
      `"${r.patientId || ""}"`,
      `"${r.age || ""}"`,
      `"${r.gender || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.visitDate || ""}"`,
      `"${(r.diagnosis || "").replace(/"/g, '""')}"`,
      `"${(r.complaint || "").replace(/"/g, '""')}"`,
      `"${(r.doctor || "").replace(/"/g, '""')}"`,
      `"${(r.medications || []).join("; ").replace(/"/g, '""')}"`,
      `"${(r.investigations || [])
        .map((i) => i.name)
        .join("; ")
        .replace(/"/g, '""')}"`,
      `"${(r.treatmentPlan || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medical-records-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* =========================================================
     ✅ Server-Side Pagination
  ========================================================= */

  const paginatedRecords = records;
  const displayedTotal = totalRecordsCount;
  const effectiveTotalPages = totalPages;
  const startItem = displayedTotal > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, displayedTotal);

  // Safety: agar current page total pages se zyada ho jaye
  useEffect(() => {
    if (currentPage > effectiveTotalPages && effectiveTotalPages > 0) {
      setCurrentPage(effectiveTotalPages);
    }
  }, [effectiveTotalPages, currentPage]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Medical Records
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Patient EMR & Clinical History
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={records.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          title="Export Medical Records to CSV"
        >
          <Download size={15} className="text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Cards - Necessary Clinical Stats (3 cards grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">Total Consultations</p>
              <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {summaryStats.total || totalRecordsCount}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-2.5 sm:p-3 text-blue-600 shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">Prescriptions Issued</p>
              <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {summaryStats.prescriptions}
              </h2>
            </div>

            <div className="rounded-xl bg-indigo-50 p-2.5 sm:p-3 text-indigo-600 shrink-0">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">Investigations Advised</p>
              <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {summaryStats.investigations}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-2.5 sm:p-3 text-amber-600 shrink-0">
              <TestTube className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // ✅ reset page on search
              }}
              placeholder="Search patient, UHID, phone or diagnosis..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // ✅ reset page on filter change
              }}
              className="w-full sm:w-auto min-w-[170px] appearance-none rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer font-medium text-slate-700"
            >
              <option value="All">All Consultations</option>
              <option value="With Prescriptions">With Prescriptions</option>
              <option value="With Investigations">With Investigations</option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Top Pagination & Header Bar */}
        <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium bg-white">
          <div>
            Showing <span className="font-semibold text-slate-700">{startItem}</span> to{" "}
            <span className="font-semibold text-slate-700">{endItem}</span> of{" "}
            <span className="font-semibold text-blue-600">{displayedTotal}</span> records
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1 sm:mr-2">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= effectiveTotalPages || loading}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(effectiveTotalPages, prev + 1))
                }
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Patient
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Visit Date
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Diagnosis
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Doctor
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Prescription
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Investigation
                </th>

                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-500">Loading medical records...</p>
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-blue-50/30"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
                          <User size={15} />
                        </div>

                        <div>
                          <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                            {record.patientName}
                          </p>

                          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                            {record.patientId} • {record.age} yrs •{" "}
                            {record.gender}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Calendar size={13.5} className="text-slate-400 shrink-0" />
                        {record.visitDate}
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <p className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-tight">
                        {record.diagnosis}
                      </p>

                      <p className="mt-0.5 max-w-[240px] truncate text-[11px] text-slate-500 leading-tight">
                        {record.complaint}
                      </p>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <Stethoscope size={13.5} className="text-slate-400 shrink-0" />
                        {record.doctor}
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      {record.medications && record.medications.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                          <Pill size={11} />
                          {record.medications.length}{" "}
                          {record.medications.length > 1
                            ? "Medicines"
                            : "Medicine"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                          Consultation Only
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2.5">
                      {record.investigations && record.investigations.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 max-w-[170px] truncate"
                          title={record.investigations[0].name}
                        >
                          <TestTube size={11} className="shrink-0" />
                          <span className="truncate">{record.investigations[0].name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                          None
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white shadow-xs"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Loader2 size={32} className="mx-auto text-blue-600 animate-spin" />
                    <p className="mt-2 text-sm text-slate-500 font-medium">
                      Loading patient medical records...
                    </p>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <FileText
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No medical records found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Completed patient consultations will appear here automatically.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            ✅ PAGINATION FOOTER
        ===================================================== */}
        {records.length > 0 && (
          <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="font-semibold text-slate-700">{startItem}</span> to{" "}
              <span className="font-semibold text-slate-700">{endItem}</span> of{" "}
              <span className="font-semibold text-blue-600">{displayedTotal}</span> records
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-1 sm:mr-2">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>

                {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= effectiveTotalPages || loading}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(effectiveTotalPages, prev + 1))
                  }
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Record Modal */}
      {selectedRecord &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRecord(null);
            }}
            className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        Medical Record Details
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          selectedRecord.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {selectedRecord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Visit: {selectedRecord.id} • UHID: {selectedRecord.patientId}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Patient Quick Info Card */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {selectedRecord.patientName ? selectedRecord.patientName.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedRecord.patientName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedRecord.age} Years • {selectedRecord.gender}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Phone</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.phone}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Visit Date</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.visitDate}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Blood Group</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.bloodGroup || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Consulting Doctor</span>
                      <span className="font-semibold text-slate-800">{selectedRecord.doctor}</span>
                    </div>
                  </div>
                </div>

                {/* Current Visit & Clinical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chief Complaint & Diagnosis */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      Current Visit
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Chief Complaint</span>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">
                        {selectedRecord.complaint}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Diagnosis</span>
                      <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg mt-0.5 inline-block">
                        {selectedRecord.diagnosis}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Clinical Notes</span>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {selectedRecord.clinicalNotes}
                      </p>
                    </div>
                  </div>

                  {/* Medical History & Allergies */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Medical History & Allergies
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Medical History</span>
                      <div className="mt-1 space-y-1">
                        {selectedRecord.medicalHistory && selectedRecord.medicalHistory.length > 0 ? (
                          selectedRecord.medicalHistory.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No prior history noted</span>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">Allergies</span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {selectedRecord.allergies && selectedRecord.allergies.length > 0 ? (
                          selectedRecord.allergies.map((item, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px]">
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">No allergies recorded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prescribed Medications */}
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                    <Pill className="w-4 h-4 text-purple-600" />
                    Prescriptions & Medications
                  </div>
                  {selectedRecord.medications && selectedRecord.medications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedRecord.medications.map((med, i) => (
                        <div key={i} className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 text-xs text-purple-900 font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span>{med}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No medications recorded for this visit.</p>
                  )}
                </div>

                {/* Investigations (if any) */}
                {selectedRecord.investigations && selectedRecord.investigations.length > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                      <TestTube className="w-4 h-4 text-teal-600" />
                      Investigations Advised
                    </div>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                      {selectedRecord.investigations.map((test, i) => (
                        <div key={i} className="p-2.5 bg-teal-50/30 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{test.name}</span>
                          <span className="text-slate-500">{test.result || test.remarks || "Advised"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment Plan (if any) */}
                {selectedRecord.treatmentPlan && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      Treatment Plan
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedRecord.treatmentPlan}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <p className="text-xs text-slate-400">
                  Hospital Information System • Dr. Vinish Kumar Singh
                </p>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
