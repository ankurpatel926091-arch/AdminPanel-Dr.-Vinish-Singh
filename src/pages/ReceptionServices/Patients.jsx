import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
} from "lucide-react";

// Mock Patient Data
const initialPatients = [
  {
    id: 1,
    uhid: "UHID-10001",
    firstName: "Rahul",
    lastName: "Sharma",
    dob: "1990-05-14",
    age: 36,
    gender: "Male",
    mobile: "9876543210",
    email: "rahul.sharma@gmail.com",
    address: "Aliganj, Lucknow",
    emergencyContact: "9876500001",
    status: "Active",
    registeredOn: "2026-09-01",
  },
  {
    id: 2,
    uhid: "UHID-10002",
    firstName: "Priya",
    lastName: "Verma",
    dob: "1995-08-22",
    age: 31,
    gender: "Female",
    mobile: "9123456780",
    email: "priya.verma@gmail.com",
    address: "Gomti Nagar, Lucknow",
    emergencyContact: "9123400001",
    status: "Active",
    registeredOn: "2026-09-05",
  },
  {
    id: 3,
    uhid: "UHID-10003",
    firstName: "Amit",
    lastName: "Singh",
    dob: "1985-02-10",
    age: 41,
    gender: "Male",
    mobile: "9988776655",
    email: "amit.singh@gmail.com",
    address: "Indira Nagar, Lucknow",
    emergencyContact: "9988700001",
    status: "Active",
    registeredOn: "2026-09-08",
  },
  {
    id: 4,
    uhid: "UHID-10004",
    firstName: "Neha",
    lastName: "Gupta",
    dob: "1998-11-03",
    age: 27,
    gender: "Female",
    mobile: "9001122334",
    email: "neha.gupta@gmail.com",
    address: "Hazratganj, Lucknow",
    emergencyContact: "9001100001",
    status: "Inactive",
    registeredOn: "2026-08-20",
  },
  {
    id: 5,
    uhid: "UHID-10005",
    firstName: "Vikas",
    lastName: "Yadav",
    dob: "1978-07-18",
    age: 48,
    gender: "Male",
    mobile: "9112233445",
    email: "vikas.yadav@gmail.com",
    address: "Mohanlalganj, Lucknow",
    emergencyContact: "9112200001",
    status: "Active",
    registeredOn: "2026-09-10",
  },
];

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
  const [patients, setPatients] = useState(initialPatients);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  // Stats
  const totalPatients = patients.length;

  const activePatients = patients.filter(
    (patient) => patient.status === "Active"
  ).length;

  const today = new Date().toISOString().split("T")[0];

  const todayRegistered = patients.filter(
    (patient) => patient.registeredOn === today
  ).length;

  const inactivePatients = patients.filter(
    (patient) => patient.status === "Inactive"
  ).length;

  // Filter Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName =
        `${patient.firstName} ${patient.lastName}`.toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        fullName.includes(searchValue) ||
        patient.uhid.toLowerCase().includes(searchValue) ||
        patient.mobile.includes(searchValue) ||
        patient.email.toLowerCase().includes(searchValue);

      const matchesGender =
        genderFilter === "All" || patient.gender === genderFilter;

      const matchesStatus =
        statusFilter === "All" || patient.status === statusFilter;

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [patients, search, genderFilter, statusFilter]);

  // Reset Filters
  const resetFilters = () => {
    setSearch("");
    setGenderFilter("All");
    setStatusFilter("All");
  };

  // Save Patient
  const handleSavePatient = (e) => {
    e.preventDefault();

    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === editingPatient.id
          ? {
              ...patient,
              ...editingPatient,
              age: editingPatient.dob
                ? new Date().getFullYear() -
                  new Date(editingPatient.dob).getFullYear()
                : patient.age,
            }
          : patient
      )
    );

    setEditingPatient(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Patients
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and view registered patient information
          </p>
        </div>

        <button
          onClick={() => setEditingPatient({ ...emptyPatient, id: null })}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <UserPlus size={18} />
          Register Patient
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={<Users size={21} />}
        />

        <StatCard
          title="Active Patients"
          value={activePatients}
          icon={<UserCheck size={21} />}
        />

        <StatCard
          title="Registered Today"
          value={todayRegistered}
          icon={<UserPlus size={21} />}
        />

        <StatCard
          title="Inactive Patients"
          value={inactivePatients}
          icon={<UserX size={21} />}
        />
      </div>

      {/* Search & Filters */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, UHID, mobile or email..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Gender */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <Filter size={14} />
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>

      {/* Patient Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="font-semibold text-slate-800">
            Patient List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">UHID</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Age / Gender</th>
                <th className="px-5 py-3 font-semibold">Mobile</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-blue-600">
                        {patient.uhid}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {patient.firstName.charAt(0)}
                          {patient.lastName.charAt(0)}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Registered: {patient.registeredOn}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {patient.age} Years
                      </p>
                      <p className="text-xs text-slate-500">
                        {patient.gender}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {patient.mobile}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {patient.email}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={patient.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          title="View Patient"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            setEditingPatient({ ...patient })
                          }
                          title="Edit Patient"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
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
                    className="px-5 py-12 text-center"
                  >
                    <Users
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
      </div>

      {/* View Patient Modal */}
      {selectedPatient && (
        <Modal
          title="Patient Details"
          onClose={() => setSelectedPatient(null)}
        >
          <div className="mb-5 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
              {selectedPatient.firstName.charAt(0)}
              {selectedPatient.lastName.charAt(0)}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedPatient.firstName}{" "}
                {selectedPatient.lastName}
              </h3>

              <p className="text-sm text-blue-600">
                {selectedPatient.uhid}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<Calendar size={17} />}
              label="Date of Birth"
              value={selectedPatient.dob}
            />

            <InfoItem
              label="Age / Gender"
              value={`${selectedPatient.age} Years / ${selectedPatient.gender}`}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="Mobile"
              value={selectedPatient.mobile}
            />

            <InfoItem
              icon={<Mail size={17} />}
              label="Email"
              value={selectedPatient.email}
            />

            <InfoItem
              icon={<MapPin size={17} />}
              label="Address"
              value={selectedPatient.address}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="Emergency Contact"
              value={selectedPatient.emergencyContact}
            />

            <InfoItem
              label="Registration Date"
              value={selectedPatient.registeredOn}
            />

            <InfoItem
              label="Status"
              value={selectedPatient.status}
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={editingPatient.status}
                  onChange={(e) =>
                    setEditingPatient({
                      ...editingPatient,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

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

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPatient(null)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {editingPatient.id
                  ? "Update Patient"
                  : "Register Patient"}
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

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-800">
            {value}
          </h3>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isActive = status === "Active";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
};

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        {icon}
        {label}
      </div>

      <p className="break-words text-sm font-medium text-slate-700">
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
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Patient;