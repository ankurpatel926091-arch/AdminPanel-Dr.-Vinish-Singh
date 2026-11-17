import React, { useEffect, useMemo, useState } from "react";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getConsultationsApi } from "../../api/consultationApi";
import {
  Search,
  Filter,
  Eye,
  User,
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getConsultationsApi()
      .then((data) => {
        if (!isMounted) return;
        const mapped = (data || []).map((item, idx) => ({
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
      })
      .catch((err) => console.warn("Failed to load consultations:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchText = debouncedSearch.toLowerCase();

      const matchesSearch =
        record.patientName.toLowerCase().includes(searchText) ||
        record.patientId.toLowerCase().includes(searchText) ||
        record.phone.includes(searchText) ||
        record.diagnosis.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, debouncedSearch, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Medical Records
        </h1>

        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
          Patient EMR & Clinical History
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Records</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {records.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileText size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Cases</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {records.filter((r) => r.status === "Active").length}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Activity size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Follow-up</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {records.filter((r) => r.status === "Follow-up").length}
              </h2>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Calendar size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Under Investigation</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {records.filter((r) => r.status === "Under Investigation").length}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <TestTube size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, UHID, phone or diagnosis..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <Filter
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-w-[190px] appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-8 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Under Investigation">
                Under Investigation
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visit Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Diagnosis
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <User size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {record.patientName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {record.patientId} • {record.age} yrs •{" "}
                            {record.gender}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={16} />
                        {record.visitDate}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {record.diagnosis}
                      </p>

                      <p className="mt-1 max-w-[250px] truncate text-xs text-slate-500">
                        {record.complaint}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Stethoscope size={16} />
                        {record.doctor}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                          statusStyles[record.status] ||
                          "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                      >
                        <Eye size={16} />
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
      </div>

      {/* View Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Medical Record
                </h2>

                <p className="text-sm text-slate-500">
                  {selectedRecord.id} • {selectedRecord.patientId}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={21} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5">
              {/* Patient Header */}
              <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <User size={30} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedRecord.patientName}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedRecord.patientId} •{" "}
                        {selectedRecord.age} years •{" "}
                        {selectedRecord.gender}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`h-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      statusStyles[selectedRecord.status]
                    }`}
                  >
                    {selectedRecord.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
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