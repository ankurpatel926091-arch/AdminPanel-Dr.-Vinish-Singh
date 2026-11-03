import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Calendar,
  Clock,
  Hash,
  HeartPulse,
  FileText,
  Stethoscope,
  ClipboardList,
  Pill,
  MessageSquare,
  Save,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import {
  CURRENT_CONSULTATION_STORAGE_KEY,
  DOCTOR_QUEUE_STORAGE_KEY,
  markAppointmentVisited,
  readStoredArray,
  saveQueue,
  SHARED_QUEUE_STORAGE_KEY,
  CONSULTATIONS_STORAGE_KEY,
} from "../../utils/staticAppointmentFlow";

const EMPTY_CONSULTATION = {
  chiefComplaint: "",
  clinicalNotes: "",
  bp: "",
  pulse: "",
  temperature: "",
  spo2: "",
  weight: "",
  height: "",
  diagnosis: "",
  investigation: "",
  advice: "",
  followUpDate: "",
  followUpInstructions: "",
};

const EMPTY_MEDICINE = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  route: "",
  instructions: "",
};

const getCurrentPatient = (locationPatient) => {
  if (locationPatient) return locationPatient;

  try {
    const savedPatient = JSON.parse(
      localStorage.getItem(CURRENT_CONSULTATION_STORAGE_KEY) || "null"
    );
    if (savedPatient && savedPatient.status !== "COMPLETED") return savedPatient;

    const sharedQueue = JSON.parse(
      localStorage.getItem(SHARED_QUEUE_STORAGE_KEY) || "[]"
    );
    const queue =
      Array.isArray(sharedQueue) && sharedQueue.length
        ? sharedQueue
        : JSON.parse(localStorage.getItem(DOCTOR_QUEUE_STORAGE_KEY) || "[]");
    const activePatient = Array.isArray(queue)
      ? queue.find((item) => item.status === "IN_CONSULTATION")
      : null;
    if (activePatient) return activePatient;
  } catch (error) {
    console.warn("Unable to load current consultation patient:", error);
  }

  return {
    id: "DEMO-CONSULTATION",
    patientName: "Rahul Sharma",
    patientId: "UHID-10245",
    age: 42,
    gender: "Male",
    visitId: "V-20052",
    tokenNumber: "18",
    appointmentDate: "12 Sep 2026",
    appointmentTime: "10:30 AM",
  };
};

export default function Consultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = getCurrentPatient(location.state?.patient);
  const currentPatient = {
    ...patient,
    name: patient.patientName || patient.name || "Patient",
    patientId: patient.patientId || "",
    visitId: patient.visitId || "—",
    token: patient.tokenNumber || patient.token || "—",
    appointmentDate: patient.appointmentDate || patient.date || "—",
    appointmentTime: patient.appointmentTime || patient.time || "—",
  };
  const recordKey = String(
    currentPatient.visitId !== "—"
      ? currentPatient.visitId
      : currentPatient.appointmentId || currentPatient.id || currentPatient.patientId
  );
  const [consultation, setConsultation] = useState(EMPTY_CONSULTATION);
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [isSaved, setIsSaved] = useState(false);
  const previousHistory = useMemo(
    () =>
      readStoredArray(CONSULTATIONS_STORAGE_KEY)
        .filter(
          (record) =>
            record.status === "CONSULTATION_COMPLETED" &&
            String(record.patient?.patientId || "") === String(currentPatient.patientId) &&
            record.recordKey !== recordKey
        )
        .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))
        .map((record) => ({
          date: record.completedAt
            ? new Date(record.completedAt).toLocaleDateString("en-IN")
            : "Previous visit",
          diagnosis: record.consultation?.diagnosis || "Consultation completed",
          prescription:
            record.medicines
              ?.filter((medicine) => medicine.name)
              .map((medicine) => medicine.name)
              .join(", ") || "No medicines recorded",
          notes: record.consultation?.clinicalNotes || record.consultation?.advice || "",
        })),
    [currentPatient.patientId, recordKey]
  );

  useEffect(() => {
    const savedRecord = readStoredArray(CONSULTATIONS_STORAGE_KEY).find(
      (record) => record.recordKey === recordKey
    );
    setConsultation(savedRecord?.consultation || EMPTY_CONSULTATION);
    setMedicines(savedRecord?.medicines?.length ? savedRecord.medicines : [{ ...EMPTY_MEDICINE }]);
    setIsSaved(Boolean(savedRecord));
  }, [recordKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setConsultation((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsSaved(false);
  };

  const handleMedicineChange = (index, field, value) => {
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

    setIsSaved(false);
  };

  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { ...EMPTY_MEDICINE },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;

    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    try {
      persistConsultation("DRAFT");
      setIsSaved(true);
      toast.success("Consultation draft saved.");
    } catch (error) {
      console.error("Unable to save consultation draft:", error);
      toast.error("Unable to save the consultation draft.");
    }
  };

  const handleCompleteConsultation = () => {
    try {
      persistConsultation("CONSULTATION_COMPLETED");
      const queue = readStoredArray(SHARED_QUEUE_STORAGE_KEY);
      const doctorQueue = queue.length ? queue : readStoredArray(DOCTOR_QUEUE_STORAGE_KEY);
      const updatedQueue = doctorQueue.map((item) =>
        String(item.visitId || item.appointmentId || item.id) ===
        String(currentPatient.visitId || currentPatient.appointmentId || currentPatient.id)
          ? {
              ...item,
              status: "COMPLETED",
              endTime: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : item
      );
      saveQueue(updatedQueue);
      markAppointmentVisited(currentPatient.appointmentId);
      localStorage.setItem(
        CURRENT_CONSULTATION_STORAGE_KEY,
        JSON.stringify({ ...currentPatient, status: "COMPLETED" })
      );
      setIsSaved(true);
      toast.success("Consultation completed and appointment marked as visited.");
      navigate("/doctor/my-queue");
    } catch (error) {
      console.error("Unable to complete consultation:", error);
      toast.error("Unable to save the completed consultation.");
    }
  };

  const persistConsultation = (status) => {
    const records = readStoredArray(CONSULTATIONS_STORAGE_KEY);
    const record = {
      recordKey,
      patient: currentPatient,
      consultation,
      medicines,
      status,
      updatedAt: new Date().toISOString(),
      ...(status === "CONSULTATION_COMPLETED"
        ? { completedAt: new Date().toISOString() }
        : {}),
    };
    const updatedRecords = [
      record,
      ...records.filter((existing) => existing.recordKey !== recordKey),
    ];
    localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(updatedRecords));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Consultation
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Review patient history and record the current consultation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* Patient Header */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Patient Information
              </h2>

              <p className="text-xs text-slate-500">
                Current OPD consultation
              </p>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <InfoItem
              icon={User}
              label="Patient Name"
              value={currentPatient.name}
            />

            <InfoItem
              icon={Hash}
              label="Patient ID / UHID"
              value={currentPatient.patientId}
            />

            <InfoItem
              icon={User}
              label="Age / Gender"
              value={`${currentPatient.age !== '' && currentPatient.age != null
                ? `${currentPatient.age} Years`
                : 'Not provided'} / ${currentPatient.gender || "—"}`}
            />

            <InfoItem
              icon={Hash}
              label="Visit ID"
              value={currentPatient.visitId}
            />

            <InfoItem
              icon={Hash}
              label="Token Number"
              value={currentPatient.token}
            />

            <InfoItem
              icon={Calendar}
              label="Appointment Date"
              value={currentPatient.appointmentDate}
            />

            <InfoItem
              icon={Clock}
              label="Appointment Time"
              value={currentPatient.appointmentTime}
            />
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Patient History */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm xl:col-span-1">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Patient History
                  </h2>

                  <p className="text-xs text-slate-500">
                    Previous consultations
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Allergies */}
              <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                <p className="text-xs font-semibold text-red-500 uppercase">
                  Allergies
                </p>

                <p className="text-sm font-medium text-slate-700 mt-1">
                  No known allergies
                </p>
              </div>

              {/* Medical History */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Previous Visits
                </h3>

                <div className="space-y-3">
                  {previousHistory.map((item, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-blue-600">
                          {item.date}
                        </span>

                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          Previous Visit
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-800 mt-2">
                        {item.diagnosis}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        Prescription: {item.prescription}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {item.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Current Consultation */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm xl:col-span-2">

            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Current Consultation
                  </h2>

                  <p className="text-xs text-slate-500">
                    Clinical examination and consultation details
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-6">

              {/* Chief Complaint */}
              <FormField
                label="Chief Complaint"
                icon={MessageSquare}
              >
                <textarea
                  name="chiefComplaint"
                  value={consultation.chiefComplaint}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter patient's chief complaint..."
                  className="input-field resize-none"
                />
              </FormField>

              {/* Vitals */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HeartPulse className="w-4 h-4 text-red-500" />

                  <h3 className="text-sm font-bold text-slate-700">
                    Vitals
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                  <Input
                    label="Blood Pressure"
                    name="bp"
                    value={consultation.bp}
                    onChange={handleChange}
                    placeholder="120/80"
                  />

                  <Input
                    label="Pulse"
                    name="pulse"
                    value={consultation.pulse}
                    onChange={handleChange}
                    placeholder="72 bpm"
                  />

                  <Input
                    label="Temperature"
                    name="temperature"
                    value={consultation.temperature}
                    onChange={handleChange}
                    placeholder="98.6 °F"
                  />

                  <Input
                    label="SpO2"
                    name="spo2"
                    value={consultation.spo2}
                    onChange={handleChange}
                    placeholder="98%"
                  />

                  <Input
                    label="Weight"
                    name="weight"
                    value={consultation.weight}
                    onChange={handleChange}
                    placeholder="70 kg"
                  />

                  <Input
                    label="Height"
                    name="height"
                    value={consultation.height}
                    onChange={handleChange}
                    placeholder="170 cm"
                  />

                </div>
              </div>

              {/* Clinical Notes */}
              <FormField
                label="Clinical Notes / Examination"
                icon={FileText}
              >
                <textarea
                  name="clinicalNotes"
                  value={consultation.clinicalNotes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter clinical examination findings and notes..."
                  className="input-field resize-none"
                />
              </FormField>

              {/* Diagnosis */}
              <FormField
                label="Diagnosis"
                icon={Stethoscope}
              >
                <textarea
                  name="diagnosis"
                  value={consultation.diagnosis}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter diagnosis..."
                  className="input-field resize-none"
                />
              </FormField>

              {/* Investigation */}
              <FormField
                label="Investigation"
                icon={ClipboardList}
              >
                <textarea
                  name="investigation"
                  value={consultation.investigation}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter required investigations..."
                  className="input-field resize-none"
                />
              </FormField>

              {/* Prescription */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">

                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />

                    <h3 className="text-sm font-bold text-slate-700">
                      Prescription
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={addMedicine}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                  </button>
                </div>

                <div className="space-y-4">

                  {medicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-slate-700">
                          Medicine {index + 1}
                        </p>

                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            title="Remove medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <Input
                          label="Medicine Name"
                          value={medicine.name}
                          onChange={(e) =>
                            handleMedicineChange(
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
                            handleMedicineChange(
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
                            handleMedicineChange(
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
                            handleMedicineChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 5 Days"
                        />

                        <Input
                          label="Route"
                          value={medicine.route}
                          onChange={(e) =>
                            handleMedicineChange(
                              index,
                              "route",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Oral"
                        />

                        <Input
                          label="Instructions"
                          value={medicine.instructions}
                          onChange={(e) =>
                            handleMedicineChange(
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
              <FormField
                label="Advice"
                icon={MessageSquare}
              >
                <textarea
                  name="advice"
                  value={consultation.advice}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter general advice for the patient..."
                  className="input-field resize-none"
                />
              </FormField>

              {/* Follow Up */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-purple-600" />

                  <h3 className="text-sm font-bold text-slate-700">
                    Follow-up
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <Input
                    label="Follow-up Date"
                    type="date"
                    name="followUpDate"
                    value={consultation.followUpDate}
                    onChange={handleChange}
                  />

                  <Input
                    label="Follow-up Instructions"
                    name="followUpInstructions"
                    value={consultation.followUpInstructions}
                    onChange={handleChange}
                    placeholder="Enter follow-up instructions"
                  />

                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Consultation
                </button>

              </div>

            </div>
          </section>
        </div>
      </div>

      {/* Component Styles */}
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

/* ---------------------------
   Reusable Components
---------------------------- */

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        {label}
      </label>

      {children}
    </div>
  );
}

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