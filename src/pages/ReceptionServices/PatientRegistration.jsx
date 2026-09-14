import React, { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Eye,
  X,
  Edit,
  CheckCircle2,
  UserRound,
  AlertCircle,
  Clock,
  Hash,
  Users,
  Printer,
  Copy,
  Building2,
} from "lucide-react";

/* =====================================================
   Mock Patient Data
   Replace this with API data later
===================================================== */

const initialPatients = [
  {
    patientId: "UHID-10245",
    firstName: "Rahul",
    lastName: "Sharma",
    dateOfBirth: "1992-05-14",
    age: 34,
    gender: "Male",
    mobile: "9876543210",
    email: "rahul.sharma@gmail.com",
    address: "Lucknow, Uttar Pradesh",
    emergencyContact: "9876501234",
    status: "Active",
    createdAt: "12 Sep 2026",
  },

  {
    patientId: "UHID-10246",
    firstName: "Priya",
    lastName: "Verma",
    dateOfBirth: "1995-08-20",
    age: 31,
    gender: "Female",
    mobile: "9123456780",
    email: "priya.verma@gmail.com",
    address: "Alambagh, Lucknow",
    emergencyContact: "9988776655",
    status: "Active",
    createdAt: "11 Sep 2026",
  },

  {
    patientId: "UHID-10247",
    firstName: "Suresh",
    lastName: "Kumar",
    dateOfBirth: "1987-02-10",
    age: 39,
    gender: "Male",
    mobile: "9988776655",
    email: "suresh.kumar@gmail.com",
    address: "Kanpur Road, Lucknow",
    emergencyContact: "9876543211",
    status: "Active",
    createdAt: "10 Sep 2026",
  },

  {
    patientId: "UHID-10248",
    firstName: "Mohit",
    lastName: "Singh",
    dateOfBirth: "1990-11-03",
    age: 35,
    gender: "Male",
    mobile: "9123456789",
    email: "mohit.singh@gmail.com",
    address: "Gomti Nagar, Lucknow",
    emergencyContact: "9000001122",
    status: "Inactive",
    createdAt: "08 Sep 2026",
  },
];

/* =====================================================
   Empty Form
===================================================== */

const emptyForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  mobile: "",
  email: "",
  address: "",
  emergencyContact: "",
};

/* =====================================================
   Main Component
===================================================== */

export default function PatientRegistration() {
  const [patients, setPatients] = useState(initialPatients);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [editingPatientId, setEditingPatientId] = useState(null);

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [registeredSuccessData, setRegisteredSuccessData] =
    useState(null);

  /* =====================================================
     Search Patients
  ===================================================== */

  const filteredPatients = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return patients;

    return patients.filter((patient) => {
      const fullName =
        `${patient.firstName} ${patient.lastName}`.toLowerCase();

      return (
        fullName.includes(value) ||
        patient.patientId
          .toLowerCase()
          .includes(value) ||
        patient.mobile.includes(value) ||
        (patient.email || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [patients, search]);

  /* =====================================================
     Handle Form Change
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormError("");
  };

  /* =====================================================
     Open Registration Form
  ===================================================== */

  const openRegistration = () => {
    setEditingPatientId(null);
    setFormData(emptyForm);
    setFormError("");
    setSuccessMessage("");
    setRegisteredSuccessData(null);
    setShowForm(true);
  };

  /* =====================================================
     Open Edit Patient Form
  ===================================================== */

  const openEditPatient = (patient) => {
    setEditingPatientId(patient.patientId);
    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      dateOfBirth: patient.dateOfBirth || "",
      age: patient.age || "",
      gender: patient.gender || "",
      mobile: patient.mobile || "",
      email: patient.email || "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
    });
    setFormError("");
    setSuccessMessage("");
    setShowForm(true);
  };

  /* =====================================================
     Calculate Age
  ===================================================== */

  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : "";
  };

  /* =====================================================
     Date of Birth Change
  ===================================================== */

  const handleDobChange = (e) => {
    const dob = e.target.value;

    setFormData((prev) => ({
      ...prev,
      dateOfBirth: dob,
      age: calculateAge(dob),
    }));
  };

  /* =====================================================
     Submit Registration / Edit
  ===================================================== */

  const handleSubmit = (e) => {
    e.preventDefault();

    /* Required Fields */
    if (!formData.firstName.trim()) {
      setFormError("Please enter Patient First Name.");
      return;
    }
    if (!formData.lastName.trim()) {
      setFormError("Please enter Patient Last Name.");
      return;
    }
    if (!formData.gender) {
      setFormError("Please select Gender (Male, Female, or Other).");
      return;
    }
    if (!formData.mobile.trim()) {
      setFormError("Please enter Mobile Number.");
      return;
    }

    /* Mobile Validation & Sanitization */
    const cleanMobile = formData.mobile.trim().replace(/^(\+91|0)+/, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      setFormError(
        "Please enter a valid 10-digit mobile number (without leading 0 or +91)."
      );
      return;
    }

    /* Duplicate Mobile Check */
    const duplicatePatient = patients.find(
      (patient) =>
        patient.mobile === cleanMobile &&
        patient.patientId !== editingPatientId
    );

    if (duplicatePatient) {
      setFormError(
        `Another patient already exists with mobile number ${cleanMobile} (${duplicatePatient.patientId}). Please check patient details.`
      );
      return;
    }

    if (editingPatientId) {
      /* Update existing patient */

      setPatients((prev) =>
        prev.map((patient) =>
          patient.patientId === editingPatientId
            ? {
                ...patient,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                dateOfBirth: formData.dateOfBirth,
                age: formData.age,
                gender: formData.gender,
                mobile: cleanMobile,
                email: formData.email.trim(),
                address: formData.address.trim(),
                emergencyContact:
                  formData.emergencyContact.trim(),
              }
            : patient
        )
      );

      /* Also update selectedPatient if currently open in View modal */
      if (selectedPatient && selectedPatient.patientId === editingPatientId) {
        setSelectedPatient((prev) => ({
          ...prev,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          age: formData.age,
          gender: formData.gender,
          mobile: cleanMobile,
          email: formData.email.trim(),
          address: formData.address.trim(),
          emergencyContact: formData.emergencyContact.trim(),
        }));
      }

      setSuccessMessage(
        `Patient profile updated successfully (${editingPatientId}).`
      );

      setFormData(emptyForm);

      setTimeout(() => {
        setShowForm(false);
        setEditingPatientId(null);
        setSuccessMessage("");
      }, 1500);

    } else {

      /* Generate Mock UHID */

      const nextNumber =
        10245 + patients.length + 1;

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const calculatedAgeValue = formData.age || calculateAge(formData.dateOfBirth) || "-";

      const newPatient = {
        patientId: `UHID-${nextNumber}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        age: calculatedAgeValue,
        gender: formData.gender,
        mobile: cleanMobile,
        email: formData.email.trim(),
        address: formData.address.trim() || "-",
        emergencyContact:
          formData.emergencyContact.trim() || "-",
        status: "Active",
        createdAt: formattedDate,
        registrationDateTime: `${formattedDate}, ${formattedTime}`,
        patientType: "New Patient",
      };

      setPatients((prev) => [
        newPatient,
        ...prev,
      ]);

      setFormData(emptyForm);
      setShowForm(false);
      setEditingPatientId(null);
      setSuccessMessage("");
      setRegisteredSuccessData(newPatient);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Patient Registration
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Register new patients and verify existing
            patient profiles.
          </p>
        </div>

        <button
          onClick={openRegistration}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Register Patient
        </button>

      </div>

      {/* =====================================================
          INFO CARDS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Patients
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {patients.length}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={22} />
            </div>

          </div>

        </div>

        {/* Active */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Active Patients
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {
                  patients.filter(
                    (p) => p.status === "Active"
                  ).length
                }
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>

          </div>

        </div>

        {/* New Today */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Today's Registrations
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                0
              </h2>
            </div>

            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <UserPlus size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          SEARCH EXISTING PATIENT
      ===================================================== */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-3 flex items-center gap-2">

          <ShieldCheck
            size={18}
            className="text-blue-600"
          />

          <div>
            <h2 className="font-semibold text-slate-800">
              Search Existing Patient
            </h2>

            <p className="text-xs text-slate-500">
              Search by UHID, mobile number, patient name
              or email to avoid duplicate profiles.
            </p>
          </div>

        </div>

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search UHID, patient name, mobile or email..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      {/* =====================================================
          PATIENT TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-800">
              Patient Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPatients.length} patient
              {filteredPatients.length !== 1
                ? "s"
                : ""} found
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
            <ShieldCheck size={14} />
            Verified patient profiles
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  UHID
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Age / Gender
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mobile
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredPatients.length > 0 ? (

                filteredPatients.map((patient) => (

                  <tr
                    key={patient.patientId}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Patient */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <User size={18} />
                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            {patient.firstName}{" "}
                            {patient.lastName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Registered{" "}
                            {patient.createdAt}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* UHID */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <Hash
                          size={15}
                          className="text-blue-500"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                          {patient.patientId}
                        </span>

                      </div>

                    </td>

                    {/* Age Gender */}
                    <td className="px-5 py-4">

                      <p className="text-sm font-medium text-slate-700">
                        {patient.age || "-"} years
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {patient.gender}
                      </p>

                    </td>

                    {/* Mobile */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <Phone
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="text-sm text-slate-700">
                          {patient.mobile}
                        </span>

                      </div>

                    </td>

                    {/* Address */}
                    <td className="max-w-[220px] px-5 py-4">

                      <div className="flex items-start gap-2">

                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <span className="truncate text-sm text-slate-600">
                          {patient.address || "-"}
                        </span>

                      </div>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                          patient.status ===
                          "Active"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >

                        {patient.status ===
                          "Active" && (
                          <CheckCircle2
                            size={13}
                          />
                        )}

                        {patient.status}

                      </span>

                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-1.5">

                        <button
                          onClick={() =>
                            setSelectedPatient(
                              patient
                            )
                          }
                          title="View Patient Details"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            openEditPatient(
                              patient
                            )
                          }
                          title="Edit Patient Demographics"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-amber-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Edit size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="px-5 py-14 text-center"
                  >

                    <UserRound
                      size={42}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No patient found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try searching with another UHID,
                      name or mobile number.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          REGISTRATION MODAL
      ===================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  {editingPatientId ? <Edit size={20} /> : <UserPlus size={20} />}
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {editingPatientId
                      ? `Edit Patient Demographics (${editingPatientId})`
                      : "Register New Patient"}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {editingPatientId
                      ? "Update demographic and contact details"
                      : "Create a permanent patient profile"}
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >

              <div className="p-5">

                {/* Error */}

                {formError && (

                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">

                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <p className="text-sm text-red-700">
                      {formError}
                    </p>

                  </div>

                )}

                {/* Success */}

                {successMessage && (

                  <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">

                    <CheckCircle2
                      size={18}
                      className="text-green-600"
                    />

                    <p className="text-sm font-medium text-green-700">
                      {successMessage}
                    </p>

                  </div>

                )}

                {/* =================================================
                    Basic Information
                ================================================= */}

                <div className="mb-6">

                  <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">

                    <User
                      size={18}
                      className="text-blue-600"
                    />

                    <h3 className="font-semibold text-slate-800">
                      Basic Information
                    </h3>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* First Name */}

                    <FormInput
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />

                    {/* Last Name */}

                    <FormInput
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />

                    {/* DOB */}

                    <div>

                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Date of Birth
                      </label>

                      <div className="relative">

                        <Calendar
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="dateOfBirth"
                          value={
                            formData.dateOfBirth
                          }
                          onChange={
                            handleDobChange
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />

                      </div>

                    </div>

                    {/* Age */}

                    <div>

                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Age
                      </label>

                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Age"
                        min="0"
                        max="120"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    {/* Gender */}

                    <div>

                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Gender{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">
                          Select gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    Contact Information
                ================================================= */}

                <div className="mb-6">

                  <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">

                    <Phone
                      size={18}
                      className="text-blue-600"
                    />

                    <h3 className="font-semibold text-slate-800">
                      Contact Information
                    </h3>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Mobile */}

                    <FormInput
                      label="Mobile Number"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      type="tel"
                      required
                    />

                    {/* Email */}

                    <FormInput
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="patient@example.com"
                      type="email"
                    />

                    {/* Address */}

                    <div className="md:col-span-2">

                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Address
                      </label>

                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Enter complete address"
                        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    {/* Emergency */}

                    <FormInput
                      label="Emergency Contact"
                      name="emergencyContact"
                      value={
                        formData.emergencyContact
                      }
                      onChange={handleChange}
                      placeholder="Emergency contact number"
                      type="tel"
                    />

                  </div>

                </div>

                {/* =================================================
                    Verification Note
                ================================================= */}

                <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-blue-800">
                      Patient Verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Before creating a new profile, verify
                      that the patient does not already exist
                      using UHID or verified mobile number.
                      This helps prevent duplicate patient
                      records.
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  Footer
              ================================================= */}

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingPatientId ? (
                    <>
                      <Edit size={17} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Register Patient
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          PATIENT DETAILS MODAL
      ===================================================== */}

      {selectedPatient && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>

                <h2 className="font-bold text-slate-900">
                  Patient Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedPatient.patientId}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedPatient(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Patient Profile */}

            <div className="p-5">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <User size={28} />
                  </div>

                  <div className="flex-1">

                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedPatient.firstName}{" "}
                      {selectedPatient.lastName}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">

                      <span className="flex items-center gap-1">
                        <Hash size={14} />
                        {selectedPatient.patientId}
                      </span>

                      <span>
                        {selectedPatient.age} years
                      </span>

                      <span>
                        {selectedPatient.gender}
                      </span>

                    </div>

                  </div>

                  <span className="inline-flex items-center gap-1 self-start rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                    <CheckCircle2 size={13} />
                    {selectedPatient.status}
                  </span>

                </div>

              </div>

              {/* Details */}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  icon={Phone}
                  label="Mobile"
                  value={selectedPatient.mobile}
                />

                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={
                    selectedPatient.email || "-"
                  }
                />

                <DetailItem
                  icon={Calendar}
                  label="Date of Birth"
                  value={
                    selectedPatient.dateOfBirth ||
                    "-"
                  }
                />

                <DetailItem
                  icon={Clock}
                  label="Registered On"
                  value={selectedPatient.createdAt}
                />

                <DetailItem
                  icon={MapPin}
                  label="Address"
                  value={
                    selectedPatient.address ||
                    "-"
                  }
                />

                <DetailItem
                  icon={Phone}
                  label="Emergency Contact"
                  value={
                    selectedPatient.emergencyContact ||
                    "-"
                  }
                />

              </div>

              {/* Footer Info */}

              <div className="mt-5 flex gap-3 rounded-xl border border-slate-200 bg-white p-4">

                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-xs leading-5 text-slate-500">
                  Patient demographic information can be
                  viewed by authorized receptionist users.
                  Clinical diagnosis, prescription and
                  consultation information should not be
                  modified from this receptionist module.
                </p>

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">

              <button
                onClick={() => {
                  const patientToEdit = selectedPatient;
                  setSelectedPatient(null);
                  openEditPatient(patientToEdit);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-xs"
              >
                <Edit size={16} />
                Edit Demographics
              </button>

              <button
                onClick={() =>
                  setSelectedPatient(null)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          SUCCESS CONFIRMATION & REGISTRATION SLIP MODAL
      ===================================================== */}

      {registeredSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-emerald-950 text-base">
                    Patient Registered Successfully
                  </h2>
                  <p className="text-xs text-emerald-700 font-medium">
                    Permanent UHID generated: <span className="font-bold font-mono">{registeredSuccessData.patientId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRegisteredSuccessData(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Registration Slip Area */}
            <div className="p-6 overflow-y-auto" id="printable-registration-slip">
              {/* Slip Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                {/* Clinic Branding Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-md">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        Rudraksh IVF & Urology Centre
                      </h3>
                      <p className="text-xs font-bold text-blue-600">
                        Dr. Vinish Kumar Singh
                      </p>
                      <p className="text-[11px] text-slate-500">
                        M.S., M.Ch. (Urology) • Senior Consultant Urologist & Andrologist
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold text-xs">
                      PATIENT REGISTRATION SLIP
                    </span>
                  </div>
                </div>

                {/* UHID Highlight Box */}
                <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white p-4 shadow-inner">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Patient ID / UHID Number
                    </span>
                    <span className="text-xl font-black font-mono tracking-wide text-blue-400">
                      {registeredSuccessData.patientId}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Patient Category
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                      {registeredSuccessData.patientType || "New Patient"}
                    </span>
                  </div>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-700 pt-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{registeredSuccessData.firstName} {registeredSuccessData.lastName}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                    <span className="font-semibold text-slate-900">{registeredSuccessData.age} years / {registeredSuccessData.gender}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Mobile Number</span>
                    <span className="font-semibold text-slate-900">{registeredSuccessData.mobile}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Date & Time</span>
                    <span className="font-semibold text-slate-900">{registeredSuccessData.registrationDateTime || registeredSuccessData.createdAt}</span>
                  </div>

                  <div className="col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Address</span>
                    <span className="font-semibold text-slate-900">{registeredSuccessData.address || "-"}</span>
                  </div>
                </div>

                {/* Slip Footnote */}
                <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>Please present this UHID slip during all future OPD consultations & billing.</span>
                  <span className="font-mono text-slate-400">Reception Desk</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setRegisteredSuccessData(null);
                  openRegistration();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <UserPlus size={16} />
                Register Another Patient
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
                >
                  <Printer size={16} />
                  Print Registration Slip
                </button>

                <button
                  type="button"
                  onClick={() => setRegisteredSuccessData(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-registration-slip, #printable-registration-slip * {
            visibility: visible !important;
          }
          #printable-registration-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}

/* =====================================================
   Reusable Form Input
===================================================== */

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}

/* =====================================================
   Patient Detail Item
===================================================== */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">

      <div className="flex items-center gap-2">

        <Icon
          size={16}
          className="text-blue-600"
        />

        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
}