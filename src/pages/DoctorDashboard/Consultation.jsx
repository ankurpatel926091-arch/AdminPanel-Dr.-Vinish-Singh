import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Calendar,
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
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { updateQueueStatusApi } from "../../api/queueApi";
import {
  saveConsultationApi,
  getPatientConsultationsApi,
  getConsultationByRecordKeyApi,
} from "../../api/consultationApi";
import {
  markAppointmentVisited,
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
  if (locationPatient) {
    try {
      sessionStorage.setItem("dr_vinish_active_consultation", JSON.stringify(locationPatient));
    } catch (e) {}
    return locationPatient;
  }

  try {
    const sessionPatient = JSON.parse(
      sessionStorage.getItem("dr_vinish_active_consultation") || "null"
    );
    if (sessionPatient) return sessionPatient;
  } catch (error) {
    console.warn("Unable to load current consultation patient:", error);
  }

  return {
    patientName: "",
    patientId: "",
    age: "",
    gender: "",
    visitId: "—",
    tokenNumber: "—",
    appointmentDate: "—",
    appointmentTime: "—",
  };
};

export default function Consultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = getCurrentPatient(location.state?.patient);
  const currentPatient = {
    ...patient,
    name: patient.patientName || patient.name || "",
    patientId: patient.patientId || "",
    visitId: patient.visitId || "—",
    token: patient.tokenNumber || patient.token || "—",
    appointmentDate: patient.appointmentDate || patient.date || "—",
    appointmentTime: patient.appointmentTime || patient.time || "—",
  };
  const recordKey = String(
    currentPatient.visitId !== "—"
      ? currentPatient.visitId
      : currentPatient.appointmentId || currentPatient.id || currentPatient.patientId || ""
  );
  const [consultation, setConsultation] = useState(EMPTY_CONSULTATION);
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [isSaved, setIsSaved] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [previousHistory, setPreviousHistory] = useState([]);

  // Fetch Patient Consultation History from MongoDB
  useEffect(() => {
    let isMounted = true;
    if (currentPatient.patientId) {
      getPatientConsultationsApi(currentPatient.patientId)
        .then((records) => {
          if (!isMounted) return;
          const history = records
            .filter(
              (rec) =>
                rec.status === "COMPLETED" &&
                rec.recordKey !== recordKey
            )
            .map((rec) => ({
              date: rec.completedAt
                ? new Date(rec.completedAt).toLocaleDateString("en-IN")
                : "Previous visit",
              diagnosis: rec.diagnosis || "Consultation completed",
              prescription:
                rec.medicines
                  ?.filter((m) => m?.name)
                  .map((m) => m.name)
                  .join(", ") || "No medicines recorded",
              notes: rec.clinicalNotes || rec.advice || "",
            }));
          setPreviousHistory(history);
        })
        .catch((err) => console.warn("Failed to fetch patient history:", err));
    }
    return () => {
      isMounted = false;
    };
  }, [currentPatient.patientId, recordKey]);

  // Load existing draft or completed consultation for this visit from MongoDB
  useEffect(() => {
    let isMounted = true;
    if (recordKey && recordKey !== "—") {
      getConsultationByRecordKeyApi(recordKey)
        .then((record) => {
          if (!isMounted) return;
          if (record) {
            setConsultation({
              chiefComplaint: record.chiefComplaint || "",
              clinicalNotes: record.clinicalNotes || "",
              bp: record.vitals?.bp || "",
              pulse: record.vitals?.pulse || "",
              temperature: record.vitals?.temperature || "",
              spo2: record.vitals?.spo2 || "",
              weight: record.vitals?.weight || "",
              height: record.vitals?.height || "",
              diagnosis: record.diagnosis || "",
              investigation: record.investigation || "",
              advice: record.advice || "",
              followUpDate: record.followUpDate ? String(record.followUpDate).split("T")[0] : "",
              followUpInstructions: record.followUpInstructions || "",
            });
            setMedicines(
              record.medicines?.length ? record.medicines : [{ ...EMPTY_MEDICINE }]
            );
            setIsSaved(true);
          } else {
            setConsultation(EMPTY_CONSULTATION);
            setMedicines([{ ...EMPTY_MEDICINE }]);
            setIsSaved(false);
          }
        })
        .catch((err) => console.warn("Failed to fetch record:", err));
    }
    return () => {
      isMounted = false;
    };
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

  const persistConsultation = async (status) => {
    const payload = {
      recordKey,
      patient: currentPatient,
      consultation,
      medicines: medicines.filter((m) => m && m.name && m.name.trim()),
      status,
    };
    return await saveConsultationApi(payload);
  };

  const handleSaveDraft = async () => {
    try {
      await persistConsultation("DRAFT");
      setIsSaved(true);
      toast.success("Consultation draft saved successfully.");
    } catch (error) {
      console.error("Unable to save consultation draft:", error);
      toast.error("Unable to save consultation draft.");
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      await persistConsultation("COMPLETED");

      // 1. Mark appointment visited if exists
      const targetAptId = currentPatient.appointmentId || currentPatient.appointment?._id || currentPatient.appointment;
      if (targetAptId) {
        markAppointmentVisited(targetAptId);
      }

      // 2. Update MongoDB queue status via API
      const qId = currentPatient._id || currentPatient.id;
      if (qId && !String(qId).startsWith("DEMO") && !String(qId).startsWith("Q-")) {
        await updateQueueStatusApi(qId, { status: "Completed" }).catch((err) =>
          console.warn("Queue status API update:", err.message)
        );
      }

      // 3. Clear session storage active consultation
      sessionStorage.removeItem("dr_vinish_active_consultation");
      localStorage.removeItem("dr_vinish_current_consultation_patient");

      setIsSaved(true);
      toast.success("Consultation completed successfully!");
      setShowPrescriptionModal(true);
    } catch (error) {
      console.error("Unable to complete consultation:", error);
      toast.error("Unable to save the completed consultation.");
    }
  };

  const handlePrintPrescription = () => {
    window.print();
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

        {!currentPatient.name && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-amber-900 font-medium">
                No active patient selected for consultation. Please start or select a patient from your OPD Queue.
              </p>
            </div>
            <button
              onClick={() => navigate("/doctor/my-queue")}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
            >
              Open OPD Queue
            </button>
          </div>
        )}

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

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            <InfoItem
              icon={Hash}
              label="Token Number"
              value={currentPatient.token}
            />

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

      {/* Prescription Slip Preview & Print Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[95vh]">
            {/* Modal Action Header (Hidden during Print) */}
            <div className="no-print p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Prescription Slip Preview (Rx)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPrescription}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    navigate("/doctor/my-queue");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition active:scale-95"
                >
                  Done & Go to Queue →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    navigate("/doctor/my-queue");
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white" id="printable-prescription">
              {/* Doctor & Clinic Letterhead */}
              <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Dr. Vinish Kumar Singh
                  </h1>
                  <p className="text-xs font-semibold text-blue-800 mt-0.5">
                    M.S. (Surgery), M.Ch. (Urology)
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    Senior Consultant Urologist, Andrologist & Laser Surgeon
                  </p>
                </div>

                <div className="sm:text-right text-xs text-slate-600">
                  <p className="font-bold text-slate-800 text-sm">
                    Rudraksh IVF & Urology Centre
                  </p>
                  <p>1/795, Ratan Khand, Sharda Nagar, Lucknow</p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    Helpline: +91 72759 81480
                  </p>
                </div>
              </div>

              {/* Patient Demographics Bar */}
              <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                  <span className="font-bold text-slate-800 text-sm">{currentPatient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Gender</span>
                  <span className="font-semibold text-slate-700">
                    {currentPatient.age ? `${currentPatient.age} Yrs` : "—"} / {currentPatient.gender || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">UHID / Token</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {currentPatient.patientId || "—"} ({currentPatient.token})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Date</span>
                  <span className="font-semibold text-slate-700">
                    {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Vitals (Only if entered) */}
              {(consultation.bp || consultation.pulse || consultation.weight || consultation.spo2 || consultation.temperature) && (
                <div className="mb-4 text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 bg-slate-50/60 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700">Vitals:</span>
                  {consultation.bp && <span>BP: <b>{consultation.bp} mmHg</b></span>}
                  {consultation.pulse && <span>Pulse: <b>{consultation.pulse} bpm</b></span>}
                  {consultation.temperature && <span>Temp: <b>{consultation.temperature} °F</b></span>}
                  {consultation.spo2 && <span>SpO2: <b>{consultation.spo2}%</b></span>}
                  {consultation.weight && <span>Weight: <b>{consultation.weight} kg</b></span>}
                </div>
              )}

              {/* Chief Complaints & Diagnosis */}
              {(consultation.chiefComplaint || consultation.diagnosis) && (
                <div className="mb-4 space-y-1.5 text-xs">
                  {consultation.chiefComplaint && (
                    <p className="text-slate-700">
                      <span className="font-bold text-slate-800">Chief Complaint:</span> {consultation.chiefComplaint}
                    </p>
                  )}
                  {consultation.diagnosis && (
                    <p className="text-slate-800 text-sm">
                      <span className="font-black text-blue-950 uppercase tracking-wide text-xs">Diagnosis:</span>{" "}
                      <span className="font-bold text-blue-900">{consultation.diagnosis}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Rx Medicines Table */}
              <div className="my-5">
                <div className="flex items-center gap-1.5 mb-2 font-black text-slate-900 text-base">
                  <span className="text-blue-600 font-serif text-xl italic font-bold">℞</span>
                  <span>Prescription (Medicines)</span>
                </div>

                {medicines.filter((m) => m.name && m.name.trim()).length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                          <th className="py-2 px-3 font-bold w-8 text-center">#</th>
                          <th className="py-2 px-3 font-bold">Medicine Name</th>
                          <th className="py-2 px-3 font-bold">Dosage</th>
                          <th className="py-2 px-3 font-bold">Frequency</th>
                          <th className="py-2 px-3 font-bold">Duration</th>
                          <th className="py-2 px-3 font-bold">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {medicines
                          .filter((m) => m.name && m.name.trim())
                          .map((med, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-center">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                              <td className="py-2.5 px-3 text-slate-700">{med.dosage || "—"}</td>
                              <td className="py-2.5 px-3 text-slate-700">{med.frequency || "—"}</td>
                              <td className="py-2.5 px-3 text-slate-700">{med.duration || "—"}</td>
                              <td className="py-2.5 px-3 text-slate-600 italic">{med.instructions || "After food"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                    No oral medicines prescribed for this visit.
                  </p>
                )}
              </div>

              {/* Advice */}
              {consultation.advice && (
                <div className="my-4 text-xs">
                  <p className="font-bold text-slate-800 mb-1">General Advice & Dietary Instructions:</p>
                  <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {consultation.advice}
                  </p>
                </div>
              )}

              {/* Follow-up */}
              {consultation.followUpDate && (
                <div className="my-4 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Next Follow-up Visit:</span>{" "}
                    <span className="font-semibold">{consultation.followUpDate}</span>
                  </div>
                  {consultation.followUpInstructions && (
                    <span className="text-slate-600 italic">{consultation.followUpInstructions}</span>
                  )}
                </div>
              )}

              {/* Doctor Signature Block */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                <p className="text-[11px] italic">
                  * Valid for OPD reference. Keep this slip safe for next consultation.
                </p>
                <div className="text-right">
                  <div className="h-10"></div>
                  <p className="font-bold text-slate-900 text-sm">Dr. Vinish Kumar Singh</p>
                  <p className="text-[11px] text-slate-500">Consultant Urologist & Andrologist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-prescription, #printable-prescription * {
            visibility: visible !important;
          }
          #printable-prescription {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
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