import React, { useMemo, useState, useEffect, useCallback } from "react";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  Loader2,
  Activity,
  User,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getPatientsApi, registerPatientApi } from "../../api/patientApi";
import { toast } from "react-toastify";

const emptyPatient = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "Male",
  mobile: "",
  email: "",
  address: "",
  emergencyContact: "",
  status: "Active",
};

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [genderFilter, setGenderFilter] = useState("All");

  // Server-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  // Fetch real patients from MongoDB via Backend API
  const fetchPatients = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await getPatientsApi({
        search: debouncedSearch,
        gender: genderFilter,
        page,
        limit: pageSize,
      });

      if (res && res.data && Array.isArray(res.data)) {
        setPatients(res.data);
        const total = res.total ?? res.data.length;
        setTotalPatients(total);
        setTotalPages(res.totalPages || Math.ceil(total / pageSize) || 1);
      } else if (Array.isArray(res)) {
        setPatients(res);
        setTotalPatients(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients list");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genderFilter, pageSize, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, genderFilter]);

  useEffect(() => {
    fetchPatients(currentPage);
  }, [debouncedSearch, genderFilter, currentPage, pageSize]);

  // Reset Filters
  const resetFilters = () => {
    setSearch("");
    setGenderFilter("All");
    setCurrentPage(1);
  };

  // Export Patients to CSV (fetches full matching set from backend)
  const exportToCSV = async () => {
    try {
      toast.info("Preparing full patients list for export...");
      const fullRes = await getPatientsApi({
        search: debouncedSearch,
        gender: genderFilter,
      });
      const dataToExport = Array.isArray(fullRes) ? fullRes : (fullRes?.data || patients);

      if (!dataToExport || dataToExport.length === 0) {
        toast.warning("No patient records to export");
        return;
      }

      const headers = [
        "UHID",
        "Patient Name",
        "Age",
        "Gender",
        "Mobile",
        "Email",
        "Total OPD Visits",
        "Registration Date",
        "Latest Consultation / Problem",
        "Address",
        "Emergency Contact",
      ];

      const rows = dataToExport.map((p) => {
        const fullName = (
          p.name || `${p.firstName || ""} ${p.lastName || ""}`
        ).trim() || "Patient";
        return [
          `"${p.uhid || ""}"`,
          `"${fullName.replace(/"/g, '""')}"`,
          `"${p.age || ""}"`,
          `"${p.gender || ""}"`,
          `"${p.mobile || ""}"`,
          `"${p.email || ""}"`,
          `"${p.totalVisits || 1}"`,
          `"${p.registeredOn || ""}"`,
          `"${(p.latestProblem || "").replace(/"/g, '""')}"`,
          `"${(p.address || "").replace(/"/g, '""')}"`,
          `"${p.emergencyContact || p.mobile || ""}"`,
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Dr_Vinish_Patients_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${dataToExport.length} patient records to CSV`);
    } catch (err) {
      toast.error("Failed to export patients CSV");
    }
  };

  // Save or Register Patient
  const handleSavePatient = async (e) => {
    e.preventDefault();

    if (!editingPatient.firstName && !editingPatient.name) {
      toast.warning("Please enter patient name");
      return;
    }

    if (!editingPatient.mobile) {
      toast.warning("Please enter mobile number");
      return;
    }

    // New patient registration in Database
    if (!editingPatient.id) {
      setSaving(true);
      try {
        const calculatedAge = editingPatient.dob
          ? new Date().getFullYear() - new Date(editingPatient.dob).getFullYear()
          : (editingPatient.age || 35);

        const res = await registerPatientApi({
          firstName: editingPatient.firstName,
          lastName: editingPatient.lastName,
          name: `${editingPatient.firstName || ""} ${editingPatient.lastName || ""}`.trim(),
          mobile: editingPatient.mobile,
          email: editingPatient.email,
          age: calculatedAge,
          gender: editingPatient.gender || "Male",
          address: editingPatient.address,
          emergencyContact: editingPatient.emergencyContact,
          dob: editingPatient.dob,
        });

        if (res?.success && res?.data) {
          toast.success("Patient registered in database successfully!");
          setPatients((prev) => [res.data, ...prev]);
          setEditingPatient(null);
        } else {
          toast.error(res?.message || "Failed to register patient");
        }
      } catch (err) {
        console.error("Save Patient error:", err);
        toast.error("Failed to register patient in database");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Update existing locally
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === editingPatient.id
          ? {
              ...patient,
              ...editingPatient,
              age: editingPatient.dob
                ? new Date().getFullYear() -
                  new Date(editingPatient.dob).getFullYear()
                : (patient.age || 30),
            }
          : patient
      )
    );

    toast.success("Patient updated");
    setEditingPatient(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Patients Directory
            </h1>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold text-blue-700">
              {totalPatients} Registered Patients
            </span>
          </div>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">
            Comprehensive database of registered clinic patients and OPD consultation history
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            disabled={patients.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50"
            title="Export Patients to CSV"
          >
            <Download size={15} className="text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchPatients}
            disabled={loading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin text-blue-600" : "text-slate-500"}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, UHID, mobile or email..."
              className="w-full rounded-lg border border-slate-300 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Gender */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-white">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Patient List
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{totalPatients > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{" "}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalPatients)}</span> of{" "}
              <span className="font-semibold text-blue-600">{totalPatients}</span> patients
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-slate-700 px-1 whitespace-nowrap">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-semibold">UHID</th>
                <th className="px-3 py-2.5 font-semibold">Patient</th>
                <th className="px-3 py-2.5 font-semibold">Age / Gender</th>
                <th className="px-3 py-2.5 font-semibold">Mobile</th>
                <th className="px-3 py-2.5 font-semibold">Email</th>
                <th className="px-3 py-2.5 font-semibold">Total Visits</th>
                <th className="px-3 py-2.5 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Loader2
                      size={36}
                      className="mx-auto mb-3 animate-spin text-blue-600"
                    />
                    <p className="font-medium text-slate-700">
                      Loading patients from database...
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Syncing real OPD appointments and billing records
                    </p>
                  </td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((patient) => {
                  const pFirst = patient.firstName || "";
                  const pLast = patient.lastName || "";
                  const fullName = (patient.name || `${pFirst} ${pLast}`).trim() || "Patient";
                  const initialFirst = (pFirst?.[0] || patient.name?.[0] || "P").toUpperCase();
                  const initialLast = (pLast?.[0] || "").toUpperCase();

                  return (
                    <tr
                      key={patient.id || patient.uhid || fullName}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-2.5">
                        <span className="text-sm font-semibold text-blue-600">
                          {patient.uhid || "—"}
                        </span>
                        {patient.visitId && (
                          <span className="block text-[10px] text-slate-400">
                            {patient.visitId}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                            {initialFirst}{initialLast}
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {fullName}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              Registered: {patient.registeredOn || "Recent"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <p className="text-xs font-medium text-slate-700">
                          {patient.age ? `${patient.age} Yrs` : "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {patient.gender || "Not specified"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-slate-700">
                        {patient.mobile || "—"}
                      </td>

                      <td className="px-3 py-2.5 text-xs text-slate-500">
                        {patient.email || "—"}
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          <Activity size={12} />
                          {patient.totalVisits || 1} {patient.totalVisits > 1 ? "visits" : "visit"}
                        </span>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            title="View Patient Details"
                            className="rounded-md border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() =>
                              setEditingPatient({ ...patient })
                            }
                            title="Edit Patient"
                            className="rounded-md border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
                          >
                            <Edit size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <User
                      size={40}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-medium text-slate-600">
                      No patients found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 bg-white">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{totalPatients > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{" "}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalPatients)}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalPatients}</span> patients
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-slate-700 px-2">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Patient Modal */}
      {selectedPatient && (
        <Modal
          title="Patient Details"
          onClose={() => setSelectedPatient(null)}
        >
          <div className="mb-5 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
              {(selectedPatient.firstName?.[0] || selectedPatient.name?.[0] || "P").toUpperCase()}
              {(selectedPatient.lastName?.[0] || "").toUpperCase()}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {(selectedPatient.name || `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`).trim()}
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-600">
                  {selectedPatient.uhid || "—"}
                </span>
                {selectedPatient.visitId && (
                  <span className="text-xs text-slate-400">
                    ({selectedPatient.visitId})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<Calendar size={17} />}
              label="Date of Birth"
              value={selectedPatient.dob || "—"}
            />

            <InfoItem
              label="Age / Gender"
              value={`${selectedPatient.age || "—"} Years / ${selectedPatient.gender || "—"}`}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="Mobile"
              value={selectedPatient.mobile || "—"}
            />

            <InfoItem
              icon={<Mail size={17} />}
              label="Email"
              value={selectedPatient.email || "—"}
            />

            <InfoItem
              icon={<MapPin size={17} />}
              label="Address"
              value={selectedPatient.address || "—"}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="Emergency Contact"
              value={selectedPatient.emergencyContact || selectedPatient.mobile || "—"}
            />

            <InfoItem
              icon={<Activity size={17} />}
              label="Total OPD Visits"
              value={`${selectedPatient.totalVisits || 1} Visit(s)`}
            />

            <InfoItem
              label="Latest Diagnosis / Reason"
              value={selectedPatient.latestProblem || "General Urology Consultation"}
            />

            <InfoItem
              label="Registration Date"
              value={selectedPatient.registeredOn || "—"}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSelectedPatient(null)}
              className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <Modal
          title={
            editingPatient.id
              ? "Edit Patient"
              : "Register New Patient"
          }
          onClose={() => setEditingPatient(null)}
        >
          <form onSubmit={handleSavePatient}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                value={editingPatient.firstName}
                onChange={(value) =>
                  setEditingPatient({
                    ...editingPatient,
                    firstName: value,
                  })
                }
                required
              />

              <Input
                label="Last Name"
                value={editingPatient.lastName}
                onChange={(value) =>
                  setEditingPatient({
                    ...editingPatient,
                    lastName: value,
                  })
                }
                required
              />

              <Input
                label="Date of Birth"
                type="date"
                value={editingPatient.dob}
                onChange={(value) =>
                  setEditingPatient({
                    ...editingPatient,
                    dob: value,
                  })
                }
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Gender
                </label>

                <select
                  value={editingPatient.gender}
                  onChange={(e) =>
                    setEditingPatient({
                      ...editingPatient,
                      gender: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <Input
                label="Mobile Number"
                value={editingPatient.mobile}
                onChange={(value) =>
                  setEditingPatient({
                    ...editingPatient,
                    mobile: value,
                  })
                }
                required
              />

              <Input
                label="Email"
                type="email"
                value={editingPatient.email}
                onChange={(value) =>
                  setEditingPatient({
                    ...editingPatient,
                    email: value,
                  })
                }
              />

              <Input
                label="Emergency Contact"
                value={editingPatient.emergencyContact}
                onChange={(value) =>
                  setEditingPatient({
                    ...editingPatient,
                    emergencyContact: value,
                  })
                }
                required
              />

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  rows="3"
                  value={editingPatient.address}
                  onChange={(e) =>
                    setEditingPatient({
                      ...editingPatient,
                      address: e.target.value,
                    })
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="Enter patient address"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setEditingPatient(null)}
                className="w-full sm:w-auto rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingPatient.id
                  ? (saving ? "Updating..." : "Update Patient")
                  : (saving ? "Registering..." : "Register Patient")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

/* =========================
   Reusable Components
========================= */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-lg border border-slate-200 p-2.5 sm:p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        {icon}
        {label}
      </div>

      <p className="break-words text-xs sm:text-sm font-medium text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
};

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs sm:text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2.5 sm:p-4 backdrop-blur-xs">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4 sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3.5 sm:p-5">{children}</div>
      </div>
    </div>
  );
};

export default Patient;