import React, { useMemo, useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import useDebouncedValue from "../../hooks/useDebouncedValue";

import { useLocation } from "react-router-dom";

import { toast } from "react-toastify";

import { useAdminData } from "../../context/AdminDataContext";

import {
  Search,
  Filter,
  Receipt,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
  WalletCards,
  User,
  Stethoscope,
  Calendar,
  X,
  IndianRupee,
  Lock,
  RotateCcw,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Activity,
  Phone,
  FilePlus,
  Printer,
  ChevronDown,
  Pencil,
} from "lucide-react";

/* =========================================

   Storage Key & Master Presets

========================================= */

const STORAGE_KEY = "dr_vinish_hospital_opd_bills_v2";

const UROLOGY_CONDITIONS = [
  "Kidney Stones (Renal Calculi)",

  "Prostate Enlargement (BPH)",

  "Urinary Tract Infection (UTI)",

  "Urethral Stricture",

  "Male Infertility & Andrology",

  "Hematuria (Blood in Urine)",

  "Overactive Bladder / Incontinence",

  "General Urology Consultation",

  "Other / Custom",
];

const STANDARD_SERVICES = [
  { name: "OPD Consultation", amount: 1000 },

  { name: "Follow-up Consultation", amount: 500 },

  { name: "Ultrasound KUB (Kidney, Ureter, Bladder)", amount: 800 },

  { name: "Uroflowmetry (UFM)", amount: 600 },

  { name: "Urine Routine & Microscopy", amount: 250 },

  { name: "Urine Culture & Sensitivity", amount: 600 },

  { name: "Foley Catheterization / Removal", amount: 500 },

  { name: "DJ Stent Removal / Minor Procedure", amount: 2500 },

  { name: "Wound Dressing / Minor Care", amount: 300 },

  { name: "Custom Service", amount: 0 },
];

const CLINIC_CENTRES = [
  "Rudraksh IVF & Urology Centre (Sharda Nagar)",

  "Dr. Shilpi Maternity & Urology Centre (Pakkabag)",
];

/* =========================================

   Initial Mock Billing Data

========================================= */

const initialBills = [
  {
    billId: "BILL-1001",

    visitId: "V-20052",

    patientId: "UHID-10245",

    patientName: "Rahul Sharma",

    phone: "9876543210",

    age: 42,

    gender: "Male",

    doctor: "Dr. Vinish Kumar Singh",

    department: "Urology",

    hospital: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

    visitDate: "12 Sep 2026",

    diagnosis: "Kidney Stones (Renal Calculi)",

    consultationFee: 1000,

    services: [
      { name: "OPD Consultation", amount: 1000 },

      { name: "Ultrasound KUB", amount: 800 },
    ],

    discount: 0,

    totalAmount: 1800,

    paidAmount: 1800,

    dueAmount: 0,

    paymentMode: "UPI",

    paymentStatus: "Paid",

    invoiceStatus: "Paid",
  },

  {
    billId: "BILL-1002",

    visitId: "V-20053",

    patientId: "UHID-10246",

    patientName: "Amit Verma",

    phone: "9834567890",

    age: 36,

    gender: "Male",

    doctor: "Dr. Vinish Kumar Singh",

    department: "Urology",

    hospital: "Dr. Shilpi Maternity & Urology Centre (Pakkabag)",

    visitDate: "12 Sep 2026",

    diagnosis: "Urinary Tract Infection (UTI)",

    consultationFee: 1000,

    services: [
      { name: "OPD Consultation", amount: 1000 },

      { name: "Urine Routine", amount: 250 },
    ],

    discount: 100,

    totalAmount: 1150,

    paidAmount: 0,

    dueAmount: 1150,

    paymentMode: null,

    paymentStatus: "Pending",

    invoiceStatus: "Unpaid",
  },

  {
    billId: "BILL-1003",

    visitId: "V-20054",

    patientId: "UHID-10247",

    patientName: "Suresh Kumar",

    phone: "9721098765",

    age: 58,

    gender: "Male",

    doctor: "Dr. Vinish Kumar Singh",

    department: "Urology",

    hospital: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

    visitDate: "12 Sep 2026",

    diagnosis: "Prostate Enlargement (BPH)",

    consultationFee: 1200,

    services: [
      { name: "OPD Consultation", amount: 1200 },

      { name: "USG Prostate", amount: 900 },
    ],

    discount: 0,

    totalAmount: 2100,

    paidAmount: 1000,

    dueAmount: 1100,

    paymentMode: "Cash",

    paymentStatus: "Partial",

    invoiceStatus: "Partial",
  },

  {
    billId: "BILL-1004",

    visitId: "V-20055",

    patientId: "UHID-10248",

    patientName: "Mohit Singh",

    phone: "9918234567",

    age: 29,

    gender: "Male",

    doctor: "Dr. Vinish Kumar Singh",

    department: "Andrology",

    hospital: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

    visitDate: "11 Sep 2026",

    diagnosis: "Male Infertility & Andrology",

    consultationFee: 1200,

    services: [{ name: "OPD Consultation", amount: 1200 }],

    discount: 200,

    totalAmount: 1000,

    paidAmount: 1000,

    dueAmount: 0,

    paymentMode: "Card",

    paymentStatus: "Paid",

    invoiceStatus: "Paid",
  },

  {
    billId: "BILL-1005",

    visitId: "V-20056",

    patientId: "UHID-10249",

    patientName: "Rakesh Yadav",

    phone: "9450123456",

    age: 47,

    gender: "Male",

    doctor: "Dr. Vinish Kumar Singh",

    department: "Urology",

    hospital: "Dr. Shilpi Maternity & Urology Centre (Pakkabag)",

    visitDate: "11 Sep 2026",

    diagnosis: "Hematuria / Recurrent UTI",

    consultationFee: 1000,

    services: [
      { name: "OPD Consultation", amount: 1000 },

      { name: "Urine Culture", amount: 600 },
    ],

    discount: 0,

    totalAmount: 1600,

    paidAmount: 0,

    dueAmount: 1600,

    paymentMode: null,

    paymentStatus: "Pending",

    invoiceStatus: "Unpaid",
  },
];

/* =========================================

   Status Styles

========================================= */

const paymentStatusStyles = {
  Paid: "bg-green-50 text-green-700 border-green-200",

  Pending: "bg-amber-50 text-amber-700 border-amber-200",

  Partial: "bg-blue-50 text-blue-700 border-blue-200",
};

/* =========================================

   Main Component

========================================= */

export default function Billing() {
  const location = useLocation();

  const adminData = useAdminData();

  const appointments = adminData?.appointments || [];

  // Persisted Bills

  const [bills, setBills] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not parse saved bills:", e);
    }

    return initialBills;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
    } catch (e) {
      console.warn("Could not save bills:", e);
    }
  }, [bills]);

  // Search & Filter

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search);

  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state

  const [selectedBill, setSelectedBill] = useState(null);

  const [paymentBill, setPaymentBill] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Collect Payment state

  const [paymentMode, setPaymentMode] = useState("UPI");

  const [paymentAmount, setPaymentAmount] = useState("");

  // Create Bill Form State

  const defaultBillForm = {
    selectedAppointmentId: "",

    patientId: "",

    patientName: "",

    phone: "",

    age: "",

    gender: "Male",

    source: "Walk-in",

    doctor: "Dr. Vinish Kumar Singh",

    department: "Urology",

    hospital: CLINIC_CENTRES[0],

    diagnosis: UROLOGY_CONDITIONS[0],

    customDiagnosis: "",

    services: [{ name: "OPD Consultation", amount: 1000 }],

    discount: 0,

    paidAmount: 1000,

    paymentMode: "Cash",

    notes: "",
  };

  const [newBillForm, setNewBillForm] = useState(defaultBillForm);

  // Patient Autocomplete / Search state

  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const patientSearchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        patientSearchRef.current &&
        !patientSearchRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];

    const q = String(patientSearchQuery || "")
      .toLowerCase()
      .trim();

    return appointments.filter((apt) => {
      if (!apt) return false;

      const name = String(apt.patientName || apt.name || "").toLowerCase();

      const phone = String(apt.phone || "").toLowerCase();

      const id = String(
        apt.patientId || apt.uhid || apt.token || apt.appointmentId || "",
      ).toLowerCase();

      const source = String(apt.source || "").toLowerCase();

      if (!q) return true;

      return (
        name.includes(q) ||
        phone.includes(q) ||
        id.includes(q) ||
        source.includes(q)
      );
    });
  }, [appointments, patientSearchQuery]);

  const selectAppointmentPatient = (apt) => {
    if (!apt) return;

    const aptClinic =
      typeof apt.clinic === "object" ? apt.clinic?.name : apt.clinic;

    const isOnline =
      apt.source === "Online" ||
      apt.source === "online" ||
      (!apt.source && apt.email);

    setNewBillForm((prev) => ({
      ...prev,

      selectedAppointmentId: String(apt.id || apt._id || ""),

      patientId:
        apt.patientId ||
        apt.uhid ||
        `UHID-${Math.floor(10000 + Math.random() * 90000)}`,

      patientName: String(apt.patientName || apt.name || ""),

      phone: String(apt.phone || ""),

      age: apt.age || 35,

      gender: apt.gender || "Male",

      source: isOnline ? "Online" : "Walk-in",

      hospital: aptClinic || CLINIC_CENTRES[0],

      diagnosis: apt.speciality || UROLOGY_CONDITIONS[0],
    }));

    setPatientSearchQuery(String(apt.patientName || apt.name || ""));

    setIsSearchOpen(false);
  };

  /* Calculations for New Bill */

  const formSubtotal = useMemo(() => {
    return newBillForm.services.reduce(
      (sum, s) => sum + (Number(s.amount) || 0),

      0,
    );
  }, [newBillForm.services]);

  const formDiscount = Math.max(0, Number(newBillForm.discount) || 0);

  const formTotalAmount = Math.max(0, formSubtotal - formDiscount);

  const formPaidAmount = Math.max(0, Number(newBillForm.paidAmount) || 0);

  const formDueAmount = Math.max(0, formTotalAmount - formPaidAmount);

  // Auto-sync Paid Amount with Total Net Amount when services or discount change
  const prevFormTotalRef = useRef(formTotalAmount);
  useEffect(() => {
    setNewBillForm((prev) => {
      const currentPaid = Number(prev.paidAmount);
      if (
        currentPaid === prevFormTotalRef.current ||
        currentPaid > formTotalAmount ||
        prev.paidAmount === "" ||
        prev.paidAmount === undefined
      ) {
        return { ...prev, paidAmount: formTotalAmount };
      }
      return prev;
    });
    prevFormTotalRef.current = formTotalAmount;
  }, [formTotalAmount]);

  /* Handle incoming state from Check-in flow */

  useEffect(() => {
    if (location.state) {
      const { appointment, visitId, patientId, patientName, autoOpenPayment } =
        location.state;

      const query =
        visitId ||
        patientId ||
        patientName ||
        appointment?.visitId ||
        appointment?.patientId;

      if (query) {
        setSearch(query);
      }

      const targetVisitId = visitId || appointment?.visitId;

      if (targetVisitId) {
        const existing = bills.find((b) => b.visitId === targetVisitId);

        if (existing) {
          if (autoOpenPayment && existing.dueAmount > 0) {
            setPaymentBill(existing);

            setPaymentAmount(existing.dueAmount.toString());

            setPaymentMode("Cash");
          }
        } else {
          const generatedBillId = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

          const newBill = {
            billId: generatedBillId,

            visitId: targetVisitId,

            patientId: patientId || appointment?.patientId || "UHID-10245",

            patientName: patientName || appointment?.patientName || "Patient",

            phone: appointment?.phone || appointment?.mobile || "",

            age: appointment?.age || 34,

            gender: appointment?.gender || "Male",

            doctor: appointment?.doctorName || "Dr. Vinish Kumar Singh",

            department: appointment?.department || "Urology",

            hospital:
              appointment?.clinic ||
              "Rudraksh IVF & Urology Centre (Sharda Nagar)",

            visitDate: appointment?.appointmentDate || "Today",

            diagnosis:
              appointment?.speciality || "General Urology Consultation",

            consultationFee: 1000,

            services: [{ name: "OPD Consultation", amount: 1000 }],

            discount: 0,

            totalAmount: 1000,

            paidAmount: 0,

            dueAmount: 1000,

            paymentMode: null,

            paymentStatus: "Pending",

            invoiceStatus: "Unpaid",
          };

          setBills((prev) => [newBill, ...prev]);

          if (autoOpenPayment) {
            setPaymentBill(newBill);

            setPaymentAmount("1000");

            setPaymentMode("Cash");
          }
        }
      }
    }
  }, [location.state]);

  /* =========================================

     Filter Bills

  ========================================= */

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const searchText = debouncedSearch.toLowerCase();

      const matchesSearch =
        bill.billId.toLowerCase().includes(searchText) ||
        bill.visitId.toLowerCase().includes(searchText) ||
        bill.patientName.toLowerCase().includes(searchText) ||
        bill.patientId.toLowerCase().includes(searchText) ||
        (bill.diagnosis && bill.diagnosis.toLowerCase().includes(searchText)) ||
        (bill.phone && bill.phone.includes(searchText));

      const matchesStatus =
        statusFilter === "All" || bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, debouncedSearch, statusFilter]);

  /* =========================================

     Statistics

  ========================================= */

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid",
  ).length;

  const partialBills = bills.filter(
    (bill) => bill.paymentStatus === "Partial",
  ).length;

  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "Pending" || bill.paymentStatus === "Partial",
  ).length;

  const totalDue = bills.reduce((sum, bill) => sum + bill.dueAmount, 0);

  const totalCollected = bills.reduce((sum, bill) => sum + bill.paidAmount, 0);

  /* =========================================

     New Bill Handlers

  ========================================= */

  const handlePatientSelect = (appointmentId) => {
    const selected = appointments.find(
      (a) => String(a.id || a._id) === String(appointmentId),
    );

    if (selected) {
      setNewBillForm((prev) => ({
        ...prev,

        selectedAppointmentId: appointmentId,

        patientName: selected.patientName || selected.name || "",

        phone: selected.phone || "",

        age: selected.age || 35,

        gender: selected.gender || "Male",

        hospital: selected.clinic || CLINIC_CENTRES[0],

        diagnosis: selected.speciality || UROLOGY_CONDITIONS[0],
      }));
    }
  };

  const handleAddServiceRow = () => {
    setNewBillForm((prev) => ({
      ...prev,

      services: [...prev.services, { name: "OPD Consultation", amount: 1000 }],
    }));
  };

  const handleRemoveServiceRow = (index) => {
    if (newBillForm.services.length <= 1) {
      toast.warning("At least one service is required.");

      return;
    }

    setNewBillForm((prev) => ({
      ...prev,

      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setNewBillForm((prev) => {
      const updated = [...prev.services];

      updated[index] = { ...updated[index], [field]: value };

      return { ...prev, services: updated };
    });
  };

  const handlePresetServiceSelect = (index, presetName) => {
    const preset = STANDARD_SERVICES.find((s) => s.name === presetName);

    if (preset) {
      setNewBillForm((prev) => {
        const updated = [...prev.services];

        updated[index] = {
          name: preset.name === "Custom Service" ? "" : preset.name,

          amount: preset.amount,
        };

        return { ...prev, services: updated };
      });
    }
  };

  /* =========================================

     Auto-add Patient to Doctor Queue on Payment

  ========================================= */

  const addPatientToDoctorQueue = (bill) => {
    try {
      const queueKey = "dr_vinish_doctor_queue";

      const existingStr = localStorage.getItem(queueKey);

      let existingQueue = [];

      if (existingStr) {
        try {
          const parsed = JSON.parse(existingStr);

          if (Array.isArray(parsed)) existingQueue = parsed;
        } catch (e) {
          console.warn("Error parsing existing queue", e);
        }
      }

      // If storage was empty, seed with initial mock queue so existing patients aren't wiped

      if (existingQueue.length === 0) {
        existingQueue = [
          {
            id: "Q-101",

            tokenNumber: "T-001",

            patientId: "UHID-10245",

            patientName: "Rahul Sharma",

            age: 34,

            gender: "Male",

            mobile: "9876543210",

            doctorName: "Dr. Vinish Kumar Singh",

            department: "Urology",

            clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

            checkInTime: "09:30 AM",

            estimatedTime: "10:00 AM",

            status: "IN_CONSULTATION",

            priority: "NORMAL",

            notes:
              "Follow-up for Laser Kidney Stone (RIRS) post-op evaluation.",

            startTime: "09:55 AM",
          },

          {
            id: "Q-102",

            tokenNumber: "T-002",

            patientId: "UHID-10246",

            patientName: "Priya Verma",

            age: 31,

            gender: "Female",

            mobile: "9123456780",

            doctorName: "Dr. Vinish Kumar Singh",

            department: "Urology",

            clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

            checkInTime: "09:45 AM",

            estimatedTime: "10:15 AM",

            status: "WAITING",

            priority: "EMERGENCY",

            notes: "Severe right flank pain, acute renal colic evaluation.",

            startTime: null,
          },

          {
            id: "Q-103",

            tokenNumber: "T-003",

            patientId: "UHID-10247",

            patientName: "Suresh Kumar",

            age: 52,

            gender: "Male",

            mobile: "9988776655",

            doctorName: "Dr. Vinish Kumar Singh",

            department: "Andrology & Urology",

            clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

            checkInTime: "10:00 AM",

            estimatedTime: "10:30 AM",

            status: "WAITING",

            priority: "HIGH",

            notes: "Elderly patient with BPH urinary frequency complaints.",

            startTime: null,
          },

          {
            id: "Q-104",

            tokenNumber: "T-004",

            patientId: "UHID-10248",

            patientName: "Mohit Singh",

            age: 28,

            gender: "Male",

            mobile: "9123456789",

            doctorName: "Dr. Vinish Kumar Singh",

            department: "Urology",

            clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

            checkInTime: "10:12 AM",

            estimatedTime: "10:45 AM",

            status: "WAITING",

            priority: "NORMAL",

            notes: "Routine check-up & ultrasound report review.",

            startTime: null,
          },

          {
            id: "Q-105",

            tokenNumber: "T-005",

            patientId: "UHID-10249",

            patientName: "Sunita Gupta",

            age: 45,

            gender: "Female",

            mobile: "9811223344",

            doctorName: "Dr. Vinish Kumar Singh",

            department: "Urology",

            clinic: "Dr. Shilpi Maternity & Urology Centre (Pakkabag)",

            checkInTime: "10:25 AM",

            estimatedTime: "11:00 AM",

            status: "SKIPPED",

            priority: "NORMAL",

            notes:
              "Sent for lab blood test & urine routine check before consultation.",

            startTime: null,
          },

          {
            id: "Q-106",

            tokenNumber: "T-000",

            patientId: "UHID-10240",

            patientName: "Rajesh Chandra",

            age: 60,

            gender: "Male",

            mobile: "9765432109",

            doctorName: "Dr. Vinish Kumar Singh",

            department: "Urology",

            clinic: "Rudraksh IVF & Urology Centre (Sharda Nagar)",

            checkInTime: "09:00 AM",

            estimatedTime: "09:30 AM",

            status: "COMPLETED",

            priority: "NORMAL",

            notes: "Prescription issued, advised follow-up after 2 weeks.",

            startTime: "09:30 AM",

            endTime: "09:52 AM",
          },
        ];
      }

      // Check if this specific bill is already active in doctor queue today

      const existingItem = existingQueue.find(
        (item) => item.billId && item.billId === bill.billId,
      );

      if (existingItem) {
        return existingItem.tokenNumber || null;
      }

      // Calculate next sequential token number (e.g. T-006, T-007)

      let nextNum = existingQueue.length + 1;

      const tokens = existingQueue

        .map((item) => {
          const match = String(item.tokenNumber || "").match(/\d+/);

          return match ? parseInt(match[0], 10) : 0;
        })

        .filter((n) => !isNaN(n));

      if (tokens.length > 0) {
        nextNum = Math.max(...tokens) + 1;
      }

      const tokenNumber = `T-${String(nextNum).padStart(3, "0")}`;

      const now = new Date();

      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",

        minute: "2-digit",

        hour12: true,
      });

      const queueItem = {
        id: `Q-${Math.floor(100 + Math.random() * 900)}`,

        tokenNumber,

        patientId:
          bill.patientId || `UHID-${Math.floor(10000 + Math.random() * 90000)}`,

        patientName: bill.patientName,

        age: Number(bill.age) || 35,

        gender: bill.gender || "Male",

        mobile: bill.phone || "",

        doctorName: bill.doctor || "Dr. Vinish Kumar Singh",

        department: bill.department || "Urology",

        clinic: bill.hospital || "Rudraksh IVF & Urology Centre (Sharda Nagar)",

        checkInTime: timeFormatted,

        estimatedTime: "Today",

        status: "WAITING",

        priority: "NORMAL",

        notes: `Diagnosis: ${bill.diagnosis || "General"}. Bill: ${bill.billId
          } Paid (₹${bill.paidAmount || bill.totalAmount})`,

        billId: bill.billId,

        visitId: bill.visitId,

        startTime: null,
      };

      const updatedQueue = [queueItem, ...existingQueue];

      localStorage.setItem(queueKey, JSON.stringify(updatedQueue));

      localStorage.setItem("dr_vinish_queue", JSON.stringify(updatedQueue));

      window.dispatchEvent(new Event("storage"));

      return tokenNumber;
    } catch (err) {
      console.warn("Failed to add patient to doctor queue:", err);

      return null;
    }
  };

  // Manual Trigger to Send / View Bill in Doctor Queue

  const handleSendToDoctorQueue = (bill) => {
    const token = addPatientToDoctorQueue(bill);

    if (token) {
      setBills((prev) =>
        prev.map((b) =>
          b.billId === bill.billId ? { ...b, tokenNumber: token } : b,
        ),
      );

      toast.success(
        `Patient ${bill.patientName} added to Doctor Queue with Token ${token}!`,

        { autoClose: 4000 },
      );
    } else {
      toast.error("Could not add patient to Doctor Queue.");
    }
  };

  const handleCreateBill = (e) => {
    e.preventDefault();

    if (!newBillForm.patientName.trim()) {
      toast.error("Please enter patient name.");

      return;
    }

    if (
      newBillForm.services.some((s) => !s.name.trim() || Number(s.amount) < 0)
    ) {
      toast.error("Each service must have a valid name and amount.");

      return;
    }

    const finalDiagnosis =
      newBillForm.diagnosis === "Other / Custom"
        ? newBillForm.customDiagnosis.trim() || "General Urology Consultation"
        : newBillForm.diagnosis;

    const now = new Date();

    const dateFormatted = now.toLocaleDateString("en-GB", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });

    const billNumber = Math.floor(1000 + Math.random() * 9000);

    const billId = `BILL-${billNumber}`;

    const visitId = `V-${Math.floor(20000 + Math.random() * 90000)}`;

    const patientId = `UHID-${Math.floor(10000 + Math.random() * 90000)}`;

    const paymentStatus =
      formDueAmount === 0 ? "Paid" : formPaidAmount > 0 ? "Partial" : "Pending";

    const createdBill = {
      billId,

      visitId,

      patientId,

      patientName: newBillForm.patientName.trim(),

      phone: newBillForm.phone.trim(),

      age: Number(newBillForm.age) || 35,

      gender: newBillForm.gender,

      doctor: newBillForm.doctor,

      department: newBillForm.department,

      hospital: newBillForm.hospital,

      visitDate: dateFormatted,

      diagnosis: finalDiagnosis,

      consultationFee: newBillForm.services[0]?.amount || 1000,

      services: newBillForm.services.map((s) => ({
        name: s.name.trim(),

        amount: Number(s.amount) || 0,
      })),

      discount: formDiscount,

      totalAmount: formTotalAmount,

      paidAmount: formPaidAmount,

      dueAmount: formDueAmount,

      paymentMode: formPaidAmount > 0 ? newBillForm.paymentMode : null,

      paymentStatus,

      invoiceStatus: paymentStatus,

      notes: newBillForm.notes?.trim() || "",
    };

    // If bill is Paid or Partial, automatically push to Doctor Queue

    let assignedToken = null;

    if (paymentStatus === "Paid" || paymentStatus === "Partial") {
      assignedToken = addPatientToDoctorQueue(createdBill);

      if (assignedToken) {
        createdBill.tokenNumber = assignedToken;
      }
    }

    setBills((prev) => [createdBill, ...prev]);

    if (assignedToken) {
      toast.success(
        `Bill ${billId} generated! Patient added to Doctor Queue with Token ${assignedToken}`,

        { autoClose: 4500 },
      );
    } else {
      toast.success(`Bill ${billId} generated successfully!`);
    }

    setShowCreateModal(false);

    // Reset Form

    setNewBillForm(defaultBillForm);

    // Open view modal for preview & printing

    setSelectedBill(createdBill);
  };

  /* =========================================

     Edit Bill Handlers

  ========================================= */

  const [editingBill, setEditingBill] = useState(null);

  const [editFormData, setEditFormData] = useState(null);

  const handleOpenEdit = (bill) => {
    setEditingBill(bill);

    setEditFormData({
      billId: bill.billId,

      visitId: bill.visitId,

      patientId: bill.patientId,

      patientName: bill.patientName || "",

      phone: bill.phone || "",

      age: bill.age || 35,

      gender: bill.gender || "Male",

      doctor: bill.doctor || "Dr. Vinish Kumar Singh",

      hospital: bill.hospital || CLINIC_CENTRES[0],

      department: bill.department || "Urology",

      visitDate: bill.visitDate,

      diagnosis: bill.diagnosis || UROLOGY_CONDITIONS[0],

      customDiagnosis: "",

      services:
        bill.services && bill.services.length > 0
          ? bill.services.map((s) => ({ name: s.name, amount: s.amount }))
          : [{ name: "OPD Consultation", amount: 1000 }],

      discount: bill.discount || 0,

      paidAmount: bill.paidAmount || 0,

      paymentMode: bill.paymentMode || "Cash",

      notes: bill.notes || "",
    });
  };

  const editSubtotal = useMemo(() => {
    if (!editFormData?.services) return 0;

    return editFormData.services.reduce(
      (sum, s) => sum + (Number(s.amount) || 0),

      0,
    );
  }, [editFormData?.services]);

  const editDiscount = Math.max(0, Number(editFormData?.discount) || 0);

  const editTotalAmount = Math.max(0, editSubtotal - editDiscount);

  const editPaidAmount = Math.max(0, Number(editFormData?.paidAmount) || 0);

  const editDueAmount = Math.max(0, editTotalAmount - editPaidAmount);

  // Auto-sync Edit Bill Paid Amount
  const prevEditTotalRef = useRef(editTotalAmount);
  useEffect(() => {
    if (!editFormData) return;
    setEditFormData((prev) => {
      if (!prev) return prev;
      const currentPaid = Number(prev.paidAmount);
      if (
        currentPaid === prevEditTotalRef.current ||
        currentPaid > editTotalAmount
      ) {
        return { ...prev, paidAmount: editTotalAmount };
      }
      return prev;
    });
    prevEditTotalRef.current = editTotalAmount;
  }, [editTotalAmount]);

  const handleEditAddService = () => {
    setEditFormData((prev) => ({
      ...prev,

      services: [...prev.services, { name: "OPD Consultation", amount: 1000 }],
    }));
  };

  const handleEditRemoveService = (index) => {
    if (editFormData.services.length <= 1) {
      toast.warning("At least one service is required.");

      return;
    }

    setEditFormData((prev) => ({
      ...prev,

      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleEditServiceChange = (index, field, value) => {
    setEditFormData((prev) => {
      const updated = [...prev.services];

      updated[index] = { ...updated[index], [field]: value };

      return { ...prev, services: updated };
    });
  };

  const handleEditPresetServiceSelect = (index, presetName) => {
    const preset = STANDARD_SERVICES.find((s) => s.name === presetName);

    if (preset) {
      setEditFormData((prev) => {
        const updated = [...prev.services];

        updated[index] = {
          name: preset.name === "Custom Service" ? "" : preset.name,

          amount: preset.amount,
        };

        return { ...prev, services: updated };
      });
    }
  };

  const handleSaveEditBill = (e) => {
    e.preventDefault();

    if (!editFormData.patientName.trim()) {
      toast.error("Please enter patient name.");

      return;
    }

    if (
      editFormData.services.some((s) => !s.name.trim() || Number(s.amount) < 0)
    ) {
      toast.error("Each service must have a valid name and amount.");

      return;
    }

    const finalDiagnosis =
      editFormData.diagnosis === "Other / Custom"
        ? editFormData.customDiagnosis.trim() || "General Urology Consultation"
        : editFormData.diagnosis;

    const paymentStatus =
      editDueAmount === 0 ? "Paid" : editPaidAmount > 0 ? "Partial" : "Pending";

    const updated = {
      ...editingBill,

      patientName: editFormData.patientName.trim(),

      phone: editFormData.phone.trim(),

      age: Number(editFormData.age) || 35,

      gender: editFormData.gender,

      hospital: editFormData.hospital,

      diagnosis: finalDiagnosis,

      services: editFormData.services.map((s) => ({
        name: s.name.trim(),

        amount: Number(s.amount) || 0,
      })),

      discount: editDiscount,

      totalAmount: editTotalAmount,

      paidAmount: editPaidAmount,

      dueAmount: editDueAmount,

      paymentMode: editPaidAmount > 0 ? editFormData.paymentMode : null,

      paymentStatus,

      invoiceStatus: paymentStatus,

      notes: editFormData.notes?.trim() || "",
    };

    setBills((prev) =>
      prev.map((b) => (b.billId === editingBill.billId ? updated : b)),
    );

    toast.success(`Bill ${editingBill.billId} updated successfully!`);

    setEditingBill(null);

    setEditFormData(null);
  };

  /* =========================================

     Collect Payment Handler

  ========================================= */

  const handleCollectPayment = () => {
    if (!paymentBill) return;

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount.");

      return;
    }

    if (amount > paymentBill.dueAmount) {
      toast.error("Payment amount cannot be greater than due amount.");

      return;
    }

    let assignedToken = null;

    setBills((prev) =>
      prev.map((bill) => {
        if (bill.billId !== paymentBill.billId) {
          return bill;
        }

        const newPaidAmount = bill.paidAmount + amount;

        const newDueAmount = bill.totalAmount - newPaidAmount;

        const newStatus = newDueAmount === 0 ? "Paid" : "Partial";

        const updated = {
          ...bill,

          paidAmount: newPaidAmount,

          dueAmount: newDueAmount,

          paymentMode,

          paymentStatus: newStatus,

          invoiceStatus: newStatus,
        };

        assignedToken = addPatientToDoctorQueue(updated);

        if (assignedToken) {
          updated.tokenNumber = assignedToken;
        }

        return updated;
      }),
    );

    if (assignedToken) {
      toast.success(
        `Payment of ₹${amount.toLocaleString(
          "en-IN",
        )} collected! Token ${assignedToken} added to Doctor Queue.`,

        { autoClose: 4500 },
      );
    } else {
      toast.success(`Payment of ₹${amount.toLocaleString("en-IN")} collected!`);
    }

    setPaymentBill(null);

    setPaymentAmount("");

    setPaymentMode("UPI");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* =========================================

          Header

      ========================================= */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Billing & Payment
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage OPD bills, patient invoices, payments and receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Calendar size={18} className="text-blue-600" />

            <span className="text-sm font-medium text-slate-700">
              Today's Billing
            </span>
          </div>

          <button
            onClick={() => {
              setNewBillForm(defaultBillForm);

              setPatientSearchQuery("");

              setIsSearchOpen(false);

              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={18} />

            <span>Create New Bill</span>
          </button>
        </div>
      </div>

      {/* =========================================

          Stats

      ========================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Bills */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Bills</p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {totalBills}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileText size={22} />
            </div>
          </div>
        </div>

        {/* Paid */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Paid Bills</p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {paidBills}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        {/* Pending */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending / Due</p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {pendingBills}
              </h2>
              {partialBills > 0 && (
                <p className="text-[11px] font-medium text-amber-600 mt-0.5">
                  ({pendingBills - partialBills} Unpaid • {partialBills} Partial)
                </p>
              )}
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Due */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Due</p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                ₹{totalDue.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <IndianRupee size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================

          Collection Summary

      ========================================= */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Today's Collection</p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              ₹{totalCollected.toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <Banknote size={18} />
            Payment Collection
          </div>
        </div>
      </div>

      {/* =========================================

          Search & Filter

      ========================================= */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Search */}

          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Bill ID, Visit ID, patient name, UHID, or diagnosis..."
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
              className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All Payment Status</option>

              <option value="Paid">Paid</option>

              <option value="Partial">Partial</option>

              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================

          Billing Table

      ========================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">OPD Bills</h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredBills.length} bill
              {filteredBills.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <Lock size={14} />
            Paid invoices are protected
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bill / Visit
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor & Clinic
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paid
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Due
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
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.billId}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Bill */}

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {bill.billId}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {bill.visitId}
                      </p>
                    </td>

                    {/* Patient */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <User size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {bill.patientName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <Stethoscope
                          size={17}
                          className="mt-0.5 shrink-0 text-blue-500"
                        />

                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {bill.doctor}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                            {bill.hospital || bill.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total */}

                    <td className="px-5 py-4 text-right">
                      <p className="font-semibold text-slate-800">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* Paid */}

                    <td className="px-5 py-4 text-right">
                      <p className="font-medium text-green-600">
                        ₹{bill.paidAmount.toLocaleString("en-IN")}
                      </p>

                      {bill.paymentMode && (
                        <p className="mt-1 text-xs text-slate-400">
                          {bill.paymentMode}
                        </p>
                      )}
                    </td>

                    {/* Due */}

                    <td className="px-5 py-4 text-right">
                      <p
                        className={`font-semibold ${bill.dueAmount > 0 ? "text-red-600" : "text-slate-400"
                          }`}
                      >
                        ₹{bill.dueAmount.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${paymentStatusStyles[bill.paymentStatus]
                          }`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View */}

                        <button
                          onClick={() => setSelectedBill(bill)}
                          title="View Bill Details"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Edit */}

                        <button
                          onClick={() => handleOpenEdit(bill)}
                          title="Edit Bill"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil size={17} />
                        </button>

                        {/* Send / Push to Doctor Queue */}

                        <button
                          onClick={() => handleSendToDoctorQueue(bill)}
                          title={
                            bill.tokenNumber
                              ? `Token: ${bill.tokenNumber} (Click to re-sync in Queue)`
                              : "Send to Doctor Queue"
                          }
                          className={`rounded-lg border p-2 transition flex items-center gap-1.5 ${bill.tokenNumber
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs"
                              : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                            }`}
                        >
                          <Stethoscope size={16} />

                          {bill.tokenNumber && (
                            <span className="text-[11px] font-bold">
                              {bill.tokenNumber}
                            </span>
                          )}
                        </button>

                        {/* Payment */}

                        {bill.dueAmount > 0 && (
                          <button
                            onClick={() => {
                              setPaymentBill(bill);

                              setPaymentAmount(bill.dueAmount.toString());
                            }}
                            title="Collect Payment"
                            className="rounded-lg border border-green-200 bg-green-50 p-2 text-green-600 transition hover:bg-green-100"
                          >
                            <CreditCard size={17} />
                          </button>
                        )}

                        {/* Receipt */}

                        {bill.paymentStatus === "Paid" && (
                          <button
                            onClick={() => setSelectedBill(bill)}
                            title="Receipt / Print"
                            className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Receipt size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-14 text-center">
                    <FileText size={40} className="mx-auto text-slate-300" />

                    <p className="mt-3 font-medium text-slate-600">
                      No bills found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================

          Create New Bill Modal

      ========================================= */}

      {showCreateModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs cursor-pointer"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 sm:px-5 sm:py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                    <FilePlus size={16} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      Create New OPD Bill
                    </h2>

                    <p className="text-[11px] text-slate-500">
                      Enter patient details, diagnosis, services & payment
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Body */}

              <form
                onSubmit={handleCreateBill}
                className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3"
              >
                {/* Section 1: Patient Selection & Basic Info */}

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Patient Details
                    </span>

                    {newBillForm.source && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${newBillForm.source === "Online"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                      >
                        {newBillForm.source === "Online"
                          ? "🌐 Online Booking"
                          : "🏥 Walk-in"}
                      </span>
                    )}
                  </div>

                  {/* Patient Search from Queue / Appointments - Always Visible */}

                  <div ref={patientSearchRef} className="relative mb-3.5">
                    <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Search Patient (Queue & Appointments)</span>

                      <span className="text-[11px] font-normal text-slate-400">
                        {filteredAppointments.length} patient(s) found
                      </span>
                    </label>

                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={patientSearchQuery}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value);

                          setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onClick={() => setIsSearchOpen(true)}
                        placeholder="Type patient name, phone number, or ID..."
                        className="w-full rounded-lg border border-blue-200 bg-white py-2 pl-9 pr-9 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      {patientSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setPatientSearchQuery("");

                            setNewBillForm((prev) => ({
                              ...prev,

                              selectedAppointmentId: "",

                              patientName: "",

                              phone: "",

                              age: "",

                              source: "Walk-in",
                            }));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown List */}

                    {isSearchOpen && (
                      <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl">
                        {filteredAppointments.length > 0 ? (
                          <div className="divide-y divide-slate-100">
                            {filteredAppointments.map((apt, index) => {
                              const name = String(
                                apt.patientName || apt.name || "Unknown",
                              );

                              const isOnline =
                                apt.source === "Online" ||
                                apt.source === "online" ||
                                (!apt.source && apt.email);

                              const uhid =
                                apt.patientId ||
                                apt.uhid ||
                                (apt.appointmentId
                                  ? `#${apt.appointmentId}`
                                  : null);

                              const phone = String(apt.phone || "N/A");

                              const clinic =
                                typeof apt.clinic === "object"
                                  ? apt.clinic?.name
                                  : apt.clinic || "Rudraksh Centre";

                              const aptKey =
                                apt.id || apt._id || `apt-${index}-${name}`;

                              const isSelected =
                                String(apt.id || apt._id || "") ===
                                String(newBillForm.selectedAppointmentId || "");

                              return (
                                <button
                                  key={aptKey}
                                  type="button"
                                  onClick={() => selectAppointmentPatient(apt)}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${isSelected
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-800">
                                        {name}
                                      </span>

                                      {isOnline ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                          🌐 Online
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                          🏥 Walk-in
                                        </span>
                                      )}

                                      {uhid && (
                                        <span className="text-[10px] font-mono font-medium text-slate-400">
                                          {uhid}
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                      Phone: {phone} •{" "}
                                      {String(apt.gender || "Male")},{" "}
                                      {String(apt.age || "N/A")} yrs •{" "}
                                      {String(clinic)}
                                    </p>
                                  </div>

                                  {isSelected && (
                                    <CheckCircle2
                                      size={16}
                                      className="shrink-0 text-blue-600"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-500">
                            No appointment found matching "{patientSearchQuery}"
                          </div>
                        )}

                        {/* Direct Walk-in Entry Action */}

                        <button
                          type="button"
                          onClick={() => {
                            setNewBillForm((prev) => ({
                              ...prev,

                              selectedAppointmentId: "",

                              patientName:
                                patientSearchQuery.trim() ||
                                prev.patientName ||
                                "",

                              source: "Walk-in",
                            }));

                            setIsSearchOpen(false);
                          }}
                          className="mt-1 w-full flex items-center justify-between p-2.5 bg-blue-50/70 hover:bg-blue-100/90 text-blue-700 text-xs font-semibold rounded-lg transition border-t border-blue-100"
                        >
                          <span className="flex items-center gap-1.5">
                            <Plus size={14} className="stroke-[2.5]" />

                            <span>
                              + Direct Walk-in Entry{" "}
                              {patientSearchQuery
                                ? `("${patientSearchQuery}")`
                                : ""}
                            </span>
                          </span>

                          <span className="text-[10px] font-medium text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                            Manual Fill
                          </span>
                        </button>
                      </div>
                    )}

                    {newBillForm.selectedAppointmentId && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          Selected: {newBillForm.patientName} (
                          {newBillForm.phone || "No Phone"})
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setPatientSearchQuery("");

                            setNewBillForm((prev) => ({
                              ...prev,

                              selectedAppointmentId: "",

                              patientName: "",

                              phone: "",

                              age: "",

                              source: "Walk-in",
                            }));
                          }}
                          className="text-[11px] text-green-800 underline hover:text-green-900"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
                    <div className="sm:col-span-2">
                      <label className="mb-0.5 block text-[11px] font-semibold text-slate-600">
                        Patient Full Name{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={newBillForm.patientName}
                        onChange={(e) =>
                          setNewBillForm((prev) => ({
                            ...prev,

                            patientName: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 block text-[11px] font-semibold text-slate-600">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        placeholder="10-digit mobile"
                        value={newBillForm.phone}
                        onChange={(e) =>
                          setNewBillForm((prev) => ({
                            ...prev,

                            phone: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-0.5 block text-[11px] font-semibold text-slate-600">
                          Age
                        </label>

                        <input
                          type="number"
                          placeholder="Yrs"
                          value={newBillForm.age}
                          onChange={(e) =>
                            setNewBillForm((prev) => ({
                              ...prev,

                              age: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-0.5 block text-[11px] font-semibold text-slate-600">
                          Gender
                        </label>

                        <select
                          value={newBillForm.gender}
                          onChange={(e) =>
                            setNewBillForm((prev) => ({
                              ...prev,

                              gender: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        >
                          <option value="Male">Male</option>

                          <option value="Female">Female</option>

                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Clinic & Diagnosis */}

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    2. Clinic, Doctor & Diagnosis
                  </span>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-0.5 block text-[11px] font-semibold text-slate-600">
                        Clinic / Hospital Branch
                      </label>

                      <select
                        value={newBillForm.hospital}
                        onChange={(e) =>
                          setNewBillForm((prev) => ({
                            ...prev,

                            hospital: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      >
                        {CLINIC_CENTRES.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-0.5 block text-[11px] font-semibold text-slate-600">
                        Consultant Doctor
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={newBillForm.doctor}
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>

                    {/* Diagnosis */}

                    <div className="sm:col-span-2">
                      <label className="mb-0.5 block text-[11px] font-semibold text-blue-900">
                        Diagnosis / Reason for Visit{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <select
                          value={newBillForm.diagnosis}
                          onChange={(e) =>
                            setNewBillForm((prev) => ({
                              ...prev,

                              diagnosis: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                        >
                          {UROLOGY_CONDITIONS.map((cond, i) => (
                            <option key={i} value={cond}>
                              {cond}
                            </option>
                          ))}
                        </select>

                        {newBillForm.diagnosis === "Other / Custom" && (
                          <input
                            type="text"
                            required
                            placeholder="Type custom disease or condition..."
                            value={newBillForm.customDiagnosis}
                            onChange={(e) =>
                              setNewBillForm((prev) => ({
                                ...prev,

                                customDiagnosis: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Bill Items / Services */}

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        3. Services & Particulars
                      </span>

                      <p className="text-[11px] text-slate-400">
                        Add consultation, tests, ultrasound, or procedure
                        charges
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddServiceRow}
                      className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Plus size={13} />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newBillForm.services.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:flex-row sm:items-center"
                      >
                        {/* Preset selector */}

                        <div className="sm:w-1/3">
                          <select
                            onChange={(e) =>
                              handlePresetServiceSelect(index, e.target.value)
                            }
                            defaultValue=""
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="" disabled>
                              -- Quick Select Service --
                            </option>

                            {STANDARD_SERVICES.map((std, i) => (
                              <option key={i} value={std.name}>
                                {std.name}{" "}
                                {std.amount > 0 ? `(₹${std.amount})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Service Name */}

                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Service name (e.g. OPD Consultation)"
                            value={item.name}
                            onChange={(e) =>
                              handleServiceChange(index, "name", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Amount */}

                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) =>
                              handleServiceChange(
                                index,

                                "amount",

                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-5 pr-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Remove Button */}

                        <button
                          type="button"
                          onClick={() => handleRemoveServiceRow(index)}
                          className="self-end rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 sm:self-center"
                          title="Remove service"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Calculation & Payment Details */}

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    4. Billing Summary & Payment
                  </span>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* Summary Box */}

                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal:</span>

                        <span className="font-semibold text-slate-700">
                          ₹{formSubtotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Discount:</span>

                        <div className="relative w-24">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={newBillForm.discount}
                            onChange={(e) =>
                              setNewBillForm((prev) => ({
                                ...prev,

                                discount: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-slate-200 py-1 pl-5 pr-2 text-right text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-1.5 flex justify-between text-xs font-bold text-slate-900">
                        <span>Total Net Amount:</span>

                        <span className="text-blue-700">
                          ₹{formTotalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Payment Input Box */}

                    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="text-[11px] font-medium text-slate-600">
                            Paid Amount
                          </label>

                          <div className="flex gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() =>
                                setNewBillForm((prev) => ({
                                  ...prev,

                                  paidAmount: formTotalAmount,
                                }))
                              }
                              className="text-blue-600 hover:underline"
                            >
                              Full Paid
                            </button>

                            <span>•</span>

                            <button
                              type="button"
                              onClick={() =>
                                setNewBillForm((prev) => ({
                                  ...prev,

                                  paidAmount: 0,
                                }))
                              }
                              className="text-red-600 hover:underline"
                            >
                              Unpaid (₹0)
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            max={formTotalAmount}
                            value={newBillForm.paidAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              const num = Number(val);
                              setNewBillForm((prev) => ({
                                ...prev,
                                paidAmount: val === "" ? "" : num > formTotalAmount ? formTotalAmount : Math.max(0, num),
                              }));
                            }}
                            className="w-full rounded-lg border border-slate-200 py-1.5 pl-6 pr-2.5 text-xs font-bold text-green-700 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Due display */}

                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Balance Due:</span>

                        <span
                          className={
                            formDueAmount > 0
                              ? "text-red-600"
                              : "text-slate-400"
                          }
                        >
                          ₹{formDueAmount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Payment Mode */}

                      {formPaidAmount > 0 && (
                        <div>
                          <label className="mb-0.5 block text-[11px] font-medium text-slate-600">
                            Payment Mode
                          </label>

                          <div className="grid grid-cols-4 gap-1">
                            {["Cash", "UPI", "Card", "Online"].map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() =>
                                  setNewBillForm((prev) => ({
                                    ...prev,

                                    paymentMode: mode,
                                  }))
                                }
                                className={`rounded-md py-1 text-[11px] font-medium border transition ${newBillForm.paymentMode === mode
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer inside form */}

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
                  >
                    <CheckCircle2 size={15} />

                    <span>Generate & Save Bill</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,

          document.body,
        )}

      {/* =========================================

          Edit Bill Modal

      ========================================= */}

      {editingBill &&
        editFormData &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs cursor-pointer"
            onClick={() => {
              setEditingBill(null);
              setEditFormData(null);
            }}
          >
            <div
              className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                    <Pencil size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Edit Bill ({editingBill.billId})
                    </h2>

                    <p className="text-xs text-slate-500">
                      Modify patient details, diagnosis, services & amounts
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingBill(null);

                    setEditFormData(null);
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form Body */}

              <form
                onSubmit={handleSaveEditBill}
                className="flex-1 overflow-y-auto p-6 space-y-6"
              >
                {/* Section 1: Patient Details */}

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. Patient Details
                  </span>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Patient Full Name{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        required
                        value={editFormData.patientName}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,

                            patientName: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,

                            phone: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Age
                        </label>

                        <input
                          type="number"
                          value={editFormData.age}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,

                              age: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Gender
                        </label>

                        <select
                          value={editFormData.gender}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,

                              gender: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="Male">Male</option>

                          <option value="Female">Female</option>

                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Clinic & Diagnosis */}

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Clinic, Doctor & Diagnosis
                  </span>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Clinic / Hospital Branch
                      </label>

                      <select
                        value={editFormData.hospital}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,

                            hospital: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {CLINIC_CENTRES.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Consultant Doctor
                      </label>

                      <input
                        type="text"
                        readOnly
                        value={editFormData.doctor}
                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>

                    {/* Diagnosis */}

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-blue-900">
                        Diagnosis / Reason for Visit{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <select
                          value={
                            UROLOGY_CONDITIONS.includes(editFormData.diagnosis)
                              ? editFormData.diagnosis
                              : "Other / Custom"
                          }
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,

                              diagnosis: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          {UROLOGY_CONDITIONS.map((cond, i) => (
                            <option key={i} value={cond}>
                              {cond}
                            </option>
                          ))}
                        </select>

                        {(editFormData.diagnosis === "Other / Custom" ||
                          !UROLOGY_CONDITIONS.includes(
                            editFormData.diagnosis,
                          )) && (
                            <input
                              type="text"
                              required
                              placeholder="Type custom disease or condition..."
                              value={
                                editFormData.diagnosis === "Other / Custom"
                                  ? editFormData.customDiagnosis
                                  : editFormData.diagnosis
                              }
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,

                                  customDiagnosis: e.target.value,

                                  diagnosis: "Other / Custom",
                                }))
                              }
                              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Bill Items / Services */}

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        3. Services & Particulars
                      </span>

                      <p className="text-xs text-slate-400">
                        Edit services or add new items
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleEditAddService}
                      className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editFormData.services.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center"
                      >
                        {/* Preset selector */}

                        <div className="sm:w-1/3">
                          <select
                            onChange={(e) =>
                              handleEditPresetServiceSelect(
                                index,
                                e.target.value,
                              )
                            }
                            defaultValue=""
                            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="" disabled>
                              -- Quick Select Service --
                            </option>

                            {STANDARD_SERVICES.map((std, i) => (
                              <option key={i} value={std.name}>
                                {std.name}{" "}
                                {std.amount > 0 ? `(₹${std.amount})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Service Name */}

                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Service name (e.g. OPD Consultation)"
                            value={item.name}
                            onChange={(e) =>
                              handleEditServiceChange(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Amount */}

                        <div className="relative w-32">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            required
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) =>
                              handleEditServiceChange(
                                index,

                                "amount",

                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Remove Button */}

                        <button
                          type="button"
                          onClick={() => handleEditRemoveService(index)}
                          className="self-end rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 sm:self-center"
                          title="Remove service"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Calculation & Payment Details */}

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    4. Billing Summary & Payment
                  </span>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Summary Box */}

                    <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-3.5">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal:</span>

                        <span className="font-semibold text-slate-700">
                          ₹{editSubtotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Discount:</span>

                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={editFormData.discount}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,

                                discount: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-slate-200 py-1 pl-5 pr-2 text-right text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
                        <span>Total Net Amount:</span>

                        <span className="text-blue-700">
                          ₹{editTotalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Payment Input Box */}

                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-slate-600">
                            Paid Amount
                          </label>

                          <div className="flex gap-1.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() =>
                                setEditFormData((prev) => ({
                                  ...prev,

                                  paidAmount: editTotalAmount,
                                }))
                              }
                              className="text-blue-600 hover:underline"
                            >
                              Full Paid
                            </button>

                            <span>•</span>

                            <button
                              type="button"
                              onClick={() =>
                                setEditFormData((prev) => ({
                                  ...prev,

                                  paidAmount: 0,
                                }))
                              }
                              className="text-red-600 hover:underline"
                            >
                              Unpaid (₹0)
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            max={editTotalAmount}
                            value={editFormData.paidAmount}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,

                                paidAmount: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-slate-200 py-2 pl-7 pr-3 text-sm font-bold text-green-700 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Due display */}

                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Balance Due:</span>

                        <span
                          className={
                            editDueAmount > 0
                              ? "text-red-600"
                              : "text-slate-400"
                          }
                        >
                          ₹{editDueAmount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Payment Mode */}

                      {editPaidAmount > 0 && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Payment Mode
                          </label>

                          <div className="grid grid-cols-4 gap-1.5">
                            {["Cash", "UPI", "Card", "Online"].map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() =>
                                  setEditFormData((prev) => ({
                                    ...prev,

                                    paymentMode: mode,
                                  }))
                                }
                                className={`rounded-md py-1 text-xs font-medium border transition ${editFormData.paymentMode === mode
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBill(null);

                      setEditFormData(null);
                    }}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
                  >
                    <CheckCircle2 size={18} />

                    <span>Update & Save Bill</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* =========================================

          View Bill Modal

      ========================================= */}

      {selectedBill && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 cursor-pointer"
          onClick={() => setSelectedBill(null)}
        >
          <div
            className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl cursor-default animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3">
              <div className="flex items-center gap-2">
                <Receipt className="text-blue-600" size={18} />
                <h2 className="text-sm font-bold text-slate-800">
                  OPD Payment Receipt Slip
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${selectedBill.paymentStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                    }`}
                >
                  {selectedBill.paymentStatus === "Paid"
                    ? "✓ Paid"
                    : "Pending Due"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
              <div
                id="printable-billing-receipt"
                className="mx-auto max-w-xl rounded-xl border border-slate-300 bg-white p-6 shadow-sm text-slate-800 font-sans"
              >
                {/* 1. Hospital & Doctor Letterhead */}
                <div className="border-b-2 border-slate-800 pb-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Stethoscope className="text-blue-600" size={24} />
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                      Dr. Vinish Kumar Singh
                    </h1>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-blue-700">
                    M.B.B.S., M.S. (Gen. Surgery), M.Ch. (Urology)
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">
                    Senior Consultant Urologist, Andrologist & Uro-Oncologist
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {selectedBill.hospital ||
                      "Rudraksh IVF & Urology Centre (Sharda Nagar)"}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Appointments & Helpline: +91 72759 81480, +91 86048 91955
                  </p>
                </div>

                {/* 2. Receipt Badge & Meta Bar */}
                <div className="my-3 flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 px-3.5 py-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      OPD PAYMENT RECEIPT
                    </span>
                    <p className="text-[11px] font-mono text-slate-500">
                      Receipt No:{" "}
                      <strong className="text-slate-900">
                        {selectedBill.billId}
                      </strong>{" "}
                      • Visit ID: {selectedBill.visitId}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Queue Token
                    </span>
                    <span className="inline-block rounded-md bg-blue-600 text-white px-2.5 py-0.5 text-xs font-extrabold tracking-wide">
                      {selectedBill.tokenNumber
                        ? selectedBill.tokenNumber
                        : "Token Active"}
                    </span>
                  </div>
                </div>

                {/* 3. Patient Details (Clean 2-Column Info) */}
                <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 p-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">
                      Patient Name:
                    </span>{" "}
                    <strong className="text-slate-900 text-sm font-bold block">
                      {selectedBill.patientName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">
                      UHID / ID:
                    </span>{" "}
                    <span className="font-mono font-semibold text-slate-800 block">
                      {selectedBill.patientId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">
                      Age / Gender:
                    </span>{" "}
                    <span className="font-medium text-slate-800 block">
                      {selectedBill.age || "N/A"} Yrs /{" "}
                      {selectedBill.gender || "Male"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Phone:</span>{" "}
                    <span className="font-medium text-slate-800 block">
                      {selectedBill.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">
                      Date & Time:
                    </span>{" "}
                    <span className="font-medium text-slate-800 block">
                      {selectedBill.visitDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">
                      Payment Mode:
                    </span>{" "}
                    <span className="inline-block font-bold text-blue-700 bg-blue-50 px-1.5 rounded border border-blue-200">
                      {selectedBill.paymentMode || "Cash"}
                    </span>
                  </div>
                </div>

                {/* 4. Payment & Services Breakdown */}
                <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 w-10">#</th>
                        <th className="py-2 px-3">Service / Particulars</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedBill.services &&
                        selectedBill.services.length > 0 ? (
                        selectedBill.services.map((service, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 text-slate-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {service.name}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                              ₹
                              {Number(service.amount || 0).toLocaleString(
                                "en-IN",
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-2 px-3 text-slate-400 font-mono">
                            1
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            OPD Consultation
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                            ₹
                            {Number(
                              selectedBill.totalAmount || 1000,
                            ).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 5. Summary & Total Paid Calculation */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium">
                      ₹
                      {(
                        selectedBill.services?.reduce(
                          (sum, s) => sum + (Number(s.amount) || 0),
                          0,
                        ) ||
                        selectedBill.totalAmount ||
                        0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {Number(selectedBill.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount Given</span>
                      <span className="font-mono">
                        - ₹
                        {Number(selectedBill.discount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Net Amount</span>
                    <span className="font-mono">
                      ₹
                      {Number(selectedBill.totalAmount || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50/80 p-2 rounded border border-emerald-200">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Amount Received ({selectedBill.paymentMode || "Cash"})
                    </span>
                    <span className="font-mono text-base">
                      ₹
                      {Number(
                        selectedBill.paidAmount ||
                        selectedBill.totalAmount ||
                        0,
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {Number(selectedBill.dueAmount) > 0 && (
                    <div className="flex justify-between text-red-600 font-bold pt-1">
                      <span>Balance Outstanding Due</span>
                      <span className="font-mono">
                        ₹
                        {Number(selectedBill.dueAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
              <p className="text-xs text-slate-500">
                Receipt ready to print for patient.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
                >
                  <Printer size={15} />
                  <span>Print Receipt Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Stylesheet for Official OPD Receipt */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-billing-receipt, #printable-billing-receipt * {
            visibility: visible !important;
          }
          #printable-billing-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px 24px !important;
            border: 1px solid #cbd5e1 !important;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* =========================================

          Payment Modal

      ========================================= */}

      {paymentBill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">Collect Payment</h2>

                <p className="mt-1 text-xs text-slate-500">
                  {paymentBill.billId} • {paymentBill.patientName}
                </p>
              </div>

              <button
                onClick={() => {
                  setPaymentBill(null);

                  setPaymentAmount("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Payment Content */}

            <div className="p-5">
              {/* Due */}

              <div className="mb-5 rounded-xl bg-red-50 p-4">
                <p className="text-sm text-red-600">Outstanding Amount</p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  ₹{paymentBill.dueAmount.toLocaleString("en-IN")}
                </p>
              </div>

              {/* Amount */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Amount
              </label>

              <div className="relative mb-5">
                <IndianRupee
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={paymentBill.dueAmount}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Payment Mode */}

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Mode
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {/* Cash */}

                <button
                  type="button"
                  onClick={() => setPaymentMode("Cash")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${paymentMode === "Cash"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Banknote size={19} />
                  Cash
                </button>

                {/* Card */}

                <button
                  type="button"
                  onClick={() => setPaymentMode("Card")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${paymentMode === "Card"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <CreditCard size={19} />
                  Card
                </button>

                {/* UPI */}

                <button
                  type="button"
                  onClick={() => setPaymentMode("UPI")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${paymentMode === "UPI"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Smartphone size={19} />
                  UPI
                </button>

                {/* Online */}

                <button
                  type="button"
                  onClick={() => setPaymentMode("Online")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${paymentMode === "Online"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <WalletCards size={19} />
                  Online
                </button>

                {/* Other */}

                <button
                  type="button"
                  onClick={() => setPaymentMode("Other")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${paymentMode === "Other"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Receipt size={19} />
                  Other
                </button>
              </div>

              {/* Note */}

              <div className="mt-5 rounded-lg bg-slate-50 p-3">
                <p className="text-xs leading-5 text-slate-500">
                  Successful payment will record receipt and update billing
                  balances.
                </p>
              </div>
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentBill(null);

                  setPaymentAmount("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCollectPayment}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <CheckCircle2 size={16} />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
