import React, { useState } from "react";
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

export default function Consultation() {
  const [consultation, setConsultation] = useState({
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
  });

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "",
      instructions: "",
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  // Temporary patient data
  // Later this data will come from Today's Appointments / Doctor Queue API
  const patient = {
    name: "Rahul Sharma",
    patientId: "UHID-10245",
    age: 42,
    gender: "Male",
    visitId: "V-20052",
    token: "18",
    appointmentDate: "12 Sep 2026",
    appointmentTime: "10:30 AM",
  };

  // Temporary previous history
  const previousHistory = [
    {
      date: "15 Aug 2026",
      diagnosis: "Kidney Stone",
      prescription: "Tamsulosin 0.4mg",
      notes: "Mild flank pain reported.",
    },
    {
      date: "20 Jun 2026",
      diagnosis: "UTI",
      prescription: "Antibiotic course",
      notes: "Symptoms improved after treatment.",
    },
  ];

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
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;

    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    console.log("Consultation Draft:", {
      patient,
      consultation,
      medicines,
    });

    setIsSaved(true);
  };

  const handleCompleteConsultation = () => {
    const consultationData = {
      patient,
      consultation,
      medicines,
      status: "CONSULTATION_COMPLETED",
      completedAt: new Date().toISOString(),
    };

    console.log("Completed Consultation:", consultationData);

    setIsSaved(true);

    alert("Consultation completed successfully.");
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
              value={patient.name}
            />

            <InfoItem
              icon={Hash}
              label="Patient ID / UHID"
              value={patient.patientId}
            />

            <InfoItem
              icon={User}
              label="Age / Gender"
              value={`${patient.age} Years / ${patient.gender}`}
            />

            <InfoItem
              icon={Hash}
              label="Visit ID"
              value={patient.visitId}
            />

            <InfoItem
              icon={Hash}
              label="Token Number"
              value={patient.token}
            />

            <InfoItem
              icon={Calendar}
              label="Appointment Date"
              value={patient.appointmentDate}
            />

            <InfoItem
              icon={Clock}
              label="Appointment Time"
              value={patient.appointmentTime}
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