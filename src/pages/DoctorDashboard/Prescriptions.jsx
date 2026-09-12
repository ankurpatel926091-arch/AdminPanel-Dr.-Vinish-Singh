import React, { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  X,
  Pill,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function Prescriptions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [prescriptions, setPrescriptions] = useState([
    {
      prescriptionId: "RX-1001",
      visitId: "V-20052",
      patientId: "UHID-10245",
      patientName: "Rahul Sharma",
      age: 42,
      gender: "Male",
      visitDate: "12 Sep 2026",
      diagnosis: "Kidney Stone",
      status: "FINAL",
      followUpDate: "26 Sep 2026",
      medicines: [
        {
          name: "Tamsulosin",
          dosage: "0.4 mg",
          frequency: "1-0-0",
          duration: "10 Days",
          route: "Oral",
          instructions: "After dinner",
        },
      ],
      generalAdvice:
        "Drink plenty of water and avoid strenuous physical activity.",
    },
    {
      prescriptionId: "RX-1002",
      visitId: "V-20048",
      patientId: "UHID-10231",
      patientName: "Amit Verma",
      age: 35,
      gender: "Male",
      visitDate: "10 Sep 2026",
      diagnosis: "Urinary Tract Infection",
      status: "FINAL",
      followUpDate: "17 Sep 2026",
      medicines: [
        {
          name: "Antibiotic",
          dosage: "500 mg",
          frequency: "1-0-1",
          duration: "5 Days",
          route: "Oral",
          instructions: "After food",
        },
      ],
      generalAdvice: "Maintain adequate hydration.",
    },
    {
      prescriptionId: "RX-1003",
      visitId: "V-20041",
      patientId: "UHID-10220",
      patientName: "Sandeep Yadav",
      age: 51,
      gender: "Male",
      visitDate: "08 Sep 2026",
      diagnosis: "Prostate Symptoms",
      status: "DRAFT",
      followUpDate: "",
      medicines: [
        {
          name: "Medicine Name",
          dosage: "",
          frequency: "",
          duration: "",
          route: "Oral",
          instructions: "",
        },
      ],
      generalAdvice: "",
    },
  ]);

  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    visitId: "",
    visitDate: "",
    diagnosis: "",
    generalAdvice: "",
    followUpDate: "",
  });

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "Oral",
      instructions: "",
    },
  ]);

  const filteredPrescriptions = prescriptions.filter((item) => {
    const value = search.toLowerCase();

    const matchesSearch =
      item.patientName.toLowerCase().includes(value) ||
      item.patientId.toLowerCase().includes(value) ||
      item.prescriptionId.toLowerCase().includes(value) ||
      item.visitId.toLowerCase().includes(value);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openView = (prescription) => {
    setSelectedPrescription(prescription);
    setShowView(true);
  };

  const openCreate = () => {
    setFormData({
      patientName: "",
      patientId: "",
      visitId: "",
      visitDate: "",
      diagnosis: "",
      generalAdvice: "",
      followUpDate: "",
    });

    setMedicines([
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "Oral",
        instructions: "",
      },
    ]);

    setShowForm(true);
  };

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "Oral",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;

    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((medicine, i) =>
        i === index
          ? {
              ...medicine,
              [field]: value,
            }
          : medicine
      )
    );
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const savePrescription = (status) => {
    const newPrescription = {
      prescriptionId: `RX-${1000 + prescriptions.length + 1}`,
      visitId: formData.visitId || "V-NEW",
      patientId: formData.patientId || "UHID-NEW",
      patientName: formData.patientName || "New Patient",
      age: 0,
      gender: "N/A",
      visitDate: formData.visitDate,
      diagnosis: formData.diagnosis,
      status,
      followUpDate: formData.followUpDate,
      medicines,
      generalAdvice: formData.generalAdvice,
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);

    setShowForm(false);
  };

  const getStatusStyle = (status) => {
    if (status === "FINAL") {
      return "bg-green-50 text-green-600 border-green-100";
    }

    return "bg-orange-50 text-orange-600 border-orange-100";
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Prescriptions
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Create, review and manage patient prescriptions
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            New Prescription
          </button>

        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, UHID, visit or prescription ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-blue-500"
            >
              <option value="All">All Prescriptions</option>
              <option value="FINAL">Final</option>
              <option value="DRAFT">Draft</option>
            </select>

          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Prescription
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Patient
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Visit Date
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Diagnosis
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Medicines
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Status
                  </th>

                  <th className="text-center px-5 py-4 text-xs font-bold uppercase text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((item) => (

                    <tr
                      key={item.prescriptionId}
                      className="hover:bg-slate-50/70"
                    >

                      {/* Prescription */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-sm text-slate-800">
                          {item.prescriptionId}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Visit: {item.visitId}
                        </p>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {item.patientName}
                            </p>

                            <p className="text-xs text-slate-500">
                              {item.patientId}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {item.visitDate}
                        </div>

                      </td>

                      {/* Diagnosis */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {item.diagnosis || "—"}
                        </span>
                      </td>

                      {/* Medicines */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Pill className="w-4 h-4 text-green-600" />

                          <span className="text-sm font-semibold text-slate-700">
                            {item.medicines.length}{" "}
                            {item.medicines.length === 1
                              ? "Medicine"
                              : "Medicines"}
                          </span>

                        </div>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {item.status === "FINAL" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}

                          {item.status}
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-1">

                          <button
                            onClick={() => openView(item)}
                            title="View Prescription"
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            title="Edit Prescription"
                            disabled={item.status === "FINAL"}
                            className={`p-2 rounded-lg ${
                              item.status === "FINAL"
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            title="Download"
                            className="p-2 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            title="Print"
                            className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>
                    <td
                      colSpan="7"
                      className="text-center px-5 py-16"
                    >
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />

                      <p className="text-sm font-semibold text-slate-600">
                        No prescriptions found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search or filter
                      </p>
                    </td>
                  </tr>

                )}

              </tbody>

            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredPrescriptions.length}
              </span>{" "}
              prescriptions
            </p>
          </div>

        </div>
      </div>

      {/* Create Prescription Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  New Prescription
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Create prescription for the current OPD visit
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="p-5 space-y-6">

              {/* Patient Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-600" />

                  <h3 className="font-bold text-sm text-slate-700">
                    Patient Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <Input
                    label="Patient Name"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleFormChange}
                    placeholder="Patient name"
                  />

                  <Input
                    label="Patient ID / UHID"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleFormChange}
                    placeholder="UHID"
                  />

                  <Input
                    label="Visit ID"
                    name="visitId"
                    value={formData.visitId}
                    onChange={handleFormChange}
                    placeholder="Visit ID"
                  />

                  <Input
                    label="Visit Date"
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleFormChange}
                  />

                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Diagnosis
                </label>

                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter diagnosis..."
                  className="input-field resize-none"
                />
              </div>

              {/* Medicines */}
              <div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />

                    <h3 className="font-bold text-sm text-slate-700">
                      Medicines
                    </h3>
                  </div>

                  <button
                    onClick={addMedicine}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                  </button>

                </div>

                <div className="space-y-4">

                  {medicines.map((medicine, index) => (

                    <div
                      key={index}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >

                      <div className="flex items-center justify-between mb-4">

                        <p className="text-sm font-bold text-slate-700">
                          Medicine {index + 1}
                        </p>

                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <Input
                          label="Medicine Name"
                          value={medicine.name}
                          onChange={(e) =>
                            updateMedicine(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Medicine name"
                        />

                        <Input
                          label="Dosage"
                          value={medicine.dosage}
                          onChange={(e) =>
                            updateMedicine(
                              index,
                              "dosage",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 500 mg"
                        />

                        <Input
                          label="Frequency"
                          value={medicine.frequency}
                          onChange={(e) =>
                            updateMedicine(
                              index,
                              "frequency",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 1-0-1"
                        />

                        <Input
                          label="Duration"
                          value={medicine.duration}
                          onChange={(e) =>
                            updateMedicine(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 5 Days"
                        />

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                            Route
                          </label>

                          <select
                            value={medicine.route}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "route",
                                e.target.value
                              )
                            }
                            className="input-field bg-white"
                          >
                            <option value="Oral">Oral</option>
                            <option value="IV">IV</option>
                            <option value="IM">IM</option>
                            <option value="Topical">Topical</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <Input
                          label="Instructions"
                          value={medicine.instructions}
                          onChange={(e) =>
                            updateMedicine(
                              index,
                              "instructions",
                              e.target.value
                            )
                          }
                          placeholder="After food / Before food"
                        />

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              {/* Advice */}
              <div>

                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  General Advice
                </label>

                <textarea
                  name="generalAdvice"
                  value={formData.generalAdvice}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter advice for the patient..."
                  className="input-field resize-none"
                />

              </div>

              {/* Follow Up */}
              <div>

                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-purple-600" />

                  <h3 className="font-bold text-sm text-slate-700">
                    Follow-up
                  </h3>
                </div>

                <Input
                  label="Follow-up Date"
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleFormChange}
                />

              </div>

              {/* Doctor Information */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                <p className="text-xs uppercase font-bold text-blue-500">
                  Doctor
                </p>

                <p className="text-sm font-bold text-slate-800 mt-1">
                  Dr. Vinish Kumar Singh
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Urologist & Andrologist
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Registration No: XXXXXXXX
                </p>

              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">

                <button
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={() => savePrescription("DRAFT")}
                  className="px-5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100"
                >
                  Save Draft
                </button>

                <button
                  onClick={() => savePrescription("FINAL")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finalize Prescription
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {showView && selectedPrescription && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="border-b border-slate-200 p-5 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Prescription
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {selectedPrescription.prescriptionId}
                </p>
              </div>

              <button
                onClick={() => setShowView(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <div className="p-6">

              {/* Hospital / Doctor */}
              <div className="text-center border-b border-slate-200 pb-5">

                <h2 className="text-xl font-bold text-slate-800">
                  Hospital Name
                </h2>

                <p className="text-sm font-semibold text-slate-700 mt-2">
                  Dr. Vinish Kumar Singh
                </p>

                <p className="text-xs text-slate-500">
                  Urologist & Andrologist
                </p>

                <p className="text-xs text-slate-500">
                  Registration No: XXXXXXXX
                </p>

              </div>

              {/* Patient */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-200">

                <Info label="Patient" value={selectedPrescription.patientName} />

                <Info label="Patient ID" value={selectedPrescription.patientId} />

                <Info label="Visit ID" value={selectedPrescription.visitId} />

                <Info label="Visit Date" value={selectedPrescription.visitDate} />

              </div>

              {/* Diagnosis */}
              <div className="py-5 border-b border-slate-200">

                <p className="text-xs uppercase font-bold text-slate-400">
                  Diagnosis
                </p>

                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {selectedPrescription.diagnosis || "—"}
                </p>

              </div>

              {/* Medicines */}
              <div className="py-5">

                <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-5 h-5 text-green-600" />

                  <h3 className="font-bold text-slate-800">
                    Medicines
                  </h3>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">

                      <thead>
                        <tr className="bg-slate-50">

                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                            Medicine
                          </th>

                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                            Dosage
                          </th>

                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                            Frequency
                          </th>

                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                            Duration
                          </th>

                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-500">
                            Route / Instructions
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {selectedPrescription.medicines.map(
                          (medicine, index) => (

                            <tr key={index}>

                              <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                {medicine.name}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-600">
                                {medicine.dosage || "—"}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-600">
                                {medicine.frequency || "—"}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-600">
                                {medicine.duration || "—"}
                              </td>

                              <td className="px-4 py-3 text-sm text-slate-600">
                                <div>{medicine.route}</div>

                                <div className="text-xs text-slate-400 mt-1">
                                  {medicine.instructions || "—"}
                                </div>
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>
                  </div>

                </div>

              </div>

              {/* Advice */}
              <div className="border-t border-slate-200 pt-5">

                <p className="text-xs uppercase font-bold text-slate-400">
                  Advice
                </p>

                <p className="text-sm text-slate-600 mt-2 leading-6">
                  {selectedPrescription.generalAdvice || "No advice added."}
                </p>

              </div>

              {/* Follow Up */}
              <div className="mt-5">

                <p className="text-xs uppercase font-bold text-slate-400">
                  Follow-up Date
                </p>

                <p className="text-sm font-semibold text-slate-700 mt-1">
                  {selectedPrescription.followUpDate || "No follow-up scheduled"}
                </p>

              </div>

              {/* Signature */}
              <div className="flex justify-end mt-12">

                <div className="text-center">
                  <div className="border-b border-slate-300 w-48 mb-2"></div>

                  <p className="text-sm font-bold text-slate-700">
                    Dr. Vinish Kumar Singh
                  </p>

                  <p className="text-xs text-slate-500">
                    Doctor Signature / E-Signature
                  </p>
                </div>

              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-200">

                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Input Styles */}
      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.75rem;
          padding: 0.7rem 0.85rem;
          font-size: 0.875rem;
          color: rgb(30 41 59);
          background: white;
          outline: none;
          transition: all 0.2s;
        }

        .input-field:focus {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }

        .input-field::placeholder {
          color: rgb(148 163 184);
        }
      `}</style>
    </div>
  );
}

/* -----------------------------
   Reusable Components
------------------------------ */

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-700 mt-1">
        {value || "—"}
      </p>
    </div>
  );
}