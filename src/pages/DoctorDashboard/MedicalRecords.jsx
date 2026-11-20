import React, { useEffect, useMemo, useState, useCallback } from "react";
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

  const fetchRecords = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await getConsultationsApi({
        search: debouncedSearch,
        page,
        limit: itemsPerPage,
      });

      const rawList = res?.data && Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      const total = res?.total ?? rawList.length;
      setTotalRecordsCount(total);
      setTotalPages(res?.totalPages || Math.ceil(total / itemsPerPage) || 1);

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
  }, [debouncedSearch, itemsPerPage, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchRecords(currentPage);
  }, [debouncedSearch, currentPage, itemsPerPage]);

  // Necessary Clinical Stats
  const totalRecords = records.length;
  const uniquePatients = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      const key = (
        r.patientId && r.patientId !== "—" ? r.patientId : r.patientName
      )
        .toLowerCase()
        .trim();
      if (key) set.add(key);
    });
    return set.size;
  }, [records]);

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

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchText = debouncedSearch.toLowerCase();

      const matchesSearch =
        record.patientName.toLowerCase().includes(searchText) ||
        record.patientId.toLowerCase().includes(searchText) ||
        record.phone.includes(searchText) ||
        record.diagnosis.toLowerCase().includes(searchText) ||
        record.complaint.toLowerCase().includes(searchText);

      let matchesStatus = true;
      if (statusFilter === "With Rx") {
        matchesStatus =
          record.medications && record.medications.length > 0;
      } else if (statusFilter === "With Tests") {
        matchesStatus =
          record.investigations && record.investigations.length > 0;
      } else if (statusFilter !== "All") {
        matchesStatus = record.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [records, debouncedSearch, statusFilter]);

  /* =========================================================
     ✅ Server-Side Pagination
  ========================================================= */

  const paginatedRecords = filteredRecords;

  // Reset to page 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Safety: agar current page total pages se zyada ho jaye
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

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

      {/* Summary Cards - Necessary Clinical Stats (2x2 on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500 truncate">Total Consultations</p>
              <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold text-slate-900">
                {totalRecords}
              </h2>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-blue-50 p-2 sm:p-3 text-blue-600 shrink-0">
              <FileText className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500 truncate">Unique Patients</p>
              <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold text-slate-900">
                {uniquePatients}
              </h2>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-emerald-50 p-2 sm:p-3 text-emerald-600 shrink-0">
              <Users className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500 truncate">Prescriptions Issued</p>
              <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold text-slate-900">
                {prescriptionsCount}
              </h2>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-indigo-50 p-2 sm:p-3 text-indigo-600 shrink-0">
              <Pill className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500 truncate">Investigations Advised</p>
              <h2 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold text-slate-900">
                {investigationsCount}
              </h2>
            </div>

            <div className="rounded-lg sm:rounded-xl bg-amber-50 p-2 sm:p-3 text-amber-600 shrink-0">
              <TestTube className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
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
              <option value="With Rx">With Prescriptions</option>
              <option value="With Tests">With Investigations</option>
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

                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
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
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <Loader2 size={32} className="mx-auto text-blue-600 animate-spin" />
                    <p className="mt-2 text-sm text-slate-500 font-medium">
                      Loading patient medical records...
                    </p>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
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
            ✅ NEW: PAGINATION FOOTER
        ===================================================== */}
        {records.length > 0 && (
          <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Showing {totalRecordsCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * itemsPerPage, totalRecordsCount)} of{" "}
              {totalRecordsCount} records
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center transition-all ${
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
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* View Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2.5 sm:p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4 sticky top-0 z-10">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Medical Record
                </h2>

                <p className="text-xs sm:text-sm text-slate-500">
                  {selectedRecord.id} • {selectedRecord.patientId}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-3.5 sm:p-5">
              {/* Patient Header */}
              <div className="mb-4 sm:mb-5 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:gap-5 md:flex-row">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shrink-0">
                      <User className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div>
                      <h2 className="text-base sm:text-xl font-bold text-slate-900">
                        {selectedRecord.patientName}
                      </h2>

                      <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                        {selectedRecord.patientId} •{" "}
                        {selectedRecord.age} years •{" "}
                        {selectedRecord.gender}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`h-fit self-start rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold ${
                      statusStyles[selectedRecord.status]
                    }`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>

                <div className="mt-3.5 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 border-t border-slate-100 pt-3.5 sm:pt-5 lg:grid-cols-4">
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={selectedRecord.phone}
                  />

                  <InfoItem
                    icon={Calendar}
                    label="Visit Date"
                    value={selectedRecord.visitDate}
                  />

                  <InfoItem
                    icon={Activity}
                    label="Blood Group"
                    value={selectedRecord.bloodGroup}
                  />

                  <InfoItem
                    icon={Stethoscope}
                    label="Doctor"
                    value={selectedRecord.doctor}
                  />
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Current Visit */}
                <Section icon={ClipboardList} title="Current Visit">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Chief Complaint
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedRecord.complaint}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Diagnosis
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedRecord.diagnosis}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Clinical Notes
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {selectedRecord.clinicalNotes}
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Medical History */}
                <Section icon={Activity} title="Medical History">
                  <div className="space-y-3">
                    {selectedRecord.medicalHistory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Allergies */}
                <Section icon={AlertCircle} title="Allergies">
                  <div className="space-y-2">
                    {selectedRecord.allergies.length > 0 ? (
                      selectedRecord.allergies.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No allergies recorded.
                      </p>
                    )}
                  </div>
                </Section>

                {/* Current Medication */}
                <Section icon={Pill} title="Current Medications">
                  {selectedRecord.medications.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRecord.medications.map((medicine, index) => (
                        <div
                          key={index}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                        >
                          {medicine}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No medications recorded.
                    </p>
                  )}
                </Section>

                {/* Investigations */}
                <div className="lg:col-span-2">
                  <Section icon={TestTube} title="Investigations">
                    {selectedRecord.investigations.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px]">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                Test
                              </th>

                              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                Date
                              </th>

                              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                Result
                              </th>

                              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                Remarks
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {selectedRecord.investigations.map(
                              (test, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-3 text-sm font-medium text-slate-800">
                                    {test.name}
                                  </td>

                                  <td className="px-3 py-3 text-sm text-slate-600">
                                    {test.date}
                                  </td>

                                  <td className="px-3 py-3 text-sm text-slate-700">
                                    {test.result}
                                  </td>

                                  <td className="px-3 py-3 text-sm text-slate-500">
                                    {test.remarks}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No investigations recorded.
                      </p>
                    )}
                  </Section>
                </div>

                {/* Treatment Plan */}
                <div className="lg:col-span-2">
                  <Section icon={Stethoscope} title="Treatment Plan">
                    <p className="text-sm leading-6 text-slate-700">
                      {selectedRecord.treatmentPlan}
                    </p>
                  </Section>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-white px-5 py-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
