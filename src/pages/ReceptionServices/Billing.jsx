import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";

import { createPortal } from "react-dom";

import useDebouncedValue from "../../hooks/useDebouncedValue";

import { useLocation } from "react-router-dom";

import { toast } from "react-toastify";

import { useAdminData } from "../../context/AdminDataContext";

import {
  getAdminBillsApi,
  createAdminBillApi,
  updateAdminBillApi,
  deleteAdminBillApi,
  getDailyCollectionSummaryApi,
} from "../../api/billingApi";

import { addToQueueApi } from "../../api/queueApi";

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
  ChevronLeft,
  ChevronRight,
  Pencil,
  ArrowRight,
  Download,
} from "lucide-react";

/* =========================================

   Master Presets

========================================= */

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

   Initial Billing Data (Loaded dynamically from MongoDB Database)

========================================= */

const initialBills = [];

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

  // Persisted Bills from MongoDB Database (with Server-Side Pagination)
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBillsCount, setTotalBillsCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [billingSummary, setBillingSummary] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalDue: 0,
    cashTotal: 0,
    upiTotal: 0,
    cardTotal: 0,
    paidCount: 0,
    pendingCount: 0,
  });
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Date Filtering & Daily History States
  const [datePreset, setDatePreset] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [showDailyHistoryModal, setShowDailyHistoryModal] = useState(false);
  const [dailyHistoryList, setDailyHistoryList] = useState([]);
  const [loadingDailyHistory, setLoadingDailyHistory] = useState(false);

  // Calculate active Date Filter Parameters
  const getDateFilterParams = useCallback(() => {
    const today = new Date();
    const formatYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (datePreset === "today") {
      return { date: formatYMD(today) };
    }
    if (datePreset === "yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { date: formatYMD(y) };
    }
    if (datePreset === "this_week") {
      const past7 = new Date(today);
      past7.setDate(past7.getDate() - 6);
      return { startDate: formatYMD(past7), endDate: formatYMD(today) };
    }
    if (datePreset === "this_month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatYMD(startOfMonth), endDate: formatYMD(today) };
    }
    if (datePreset === "custom" && customDate) {
      return { date: customDate };
    }
    return {};
  }, [datePreset, customDate]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchBillsFromDB = useCallback(async (page = currentPage) => {
    try {
      setLoadingBills(true);
      const dateParams = getDateFilterParams();
      const res = await getAdminBillsApi({
        search: debouncedSearch,
        paymentStatus: statusFilter,
        page,
        limit: pageSize,
        ...dateParams,
      });

      if (res && res.data && Array.isArray(res.data)) {
        setBills(res.data);
        const total = res.total ?? res.data.length;
        setTotalBillsCount(total);
        setTotalPages(res.totalPages || Math.ceil(total / pageSize) || 1);
        if (res.summary) {
          setBillingSummary(res.summary);
        }
      } else if (Array.isArray(res)) {
        setBills(res);
        setTotalBillsCount(res.length);
        setTotalPages(Math.ceil(res.length / pageSize) || 1);
      }
    } catch (e) {
      console.warn("Could not fetch bills from MongoDB:", e);
    } finally {
      setLoadingBills(false);
    }
  }, [debouncedSearch, statusFilter, pageSize, currentPage, getDateFilterParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, datePreset, customDate]);

  useEffect(() => {
    fetchBillsFromDB(currentPage);
  }, [debouncedSearch, statusFilter, datePreset, customDate, currentPage, pageSize]);

  // Modals state
  const [selectedBill, setSelectedBill] = useState(null);

  const [paymentBill, setPaymentBill] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Queue Addition Prompt State
  const [queueConfirmData, setQueueConfirmData] = useState(null);
  const [addingToQueue, setAddingToQueue] = useState(false);

  // Collect Payment state

  const [paymentMode, setPaymentMode] = useState("UPI");

  const [paymentAmount, setPaymentAmount] = useState("");

  // Create Bill Form State

  const defaultBillForm = {
    selectedAppointmentId: "",

    visitId: "",

    tokenNumber: "",

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

      visitId: apt.visitId || "",

      tokenNumber: apt.tokenNumber ? String(apt.tokenNumber).padStart(3, "0") : "",

      patientId:
        apt.patientId ||
        apt.uhid ||
        (apt.visitId ? `UHID-${apt.visitId.replace(/\D/g, "")}` : `UHID-${Math.floor(10000 + Math.random() * 90000)}`),

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
  const processedVisitRef = useRef({});

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
        } else if (!processedVisitRef.current[targetVisitId] && !loadingBills) {
          processedVisitRef.current[targetVisitId] = true;
          const generatedBillId = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

          const newBill = {
            billId: generatedBillId,
            visitId: targetVisitId,
            appointment: appointment?._id || appointment?.id || null,
            patientId: patientId || appointment?.patientId || "UHID-10245",
            patientName: patientName || appointment?.patientName || "Patient",
            phone: appointment?.phone || appointment?.mobile || "",
            age: Number(appointment?.age) || 34,
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

          createAdminBillApi(newBill).then((res) => {
            if (res?.data) {
              setBills((prev) =>
                prev.map((b) => (b.visitId === targetVisitId ? res.data : b)),
              );
            }
          });

          if (autoOpenPayment) {
            setPaymentBill(newBill);
            setPaymentAmount("1000");
            setPaymentMode("Cash");
          }
        }
      }
    }
  }, [location.state, bills, loadingBills]);

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

  // Day-End Settlement Tally Metrics (from DB summary or page fallback)
  const tallyCash = billingSummary.cashTotal || bills.reduce((sum, b) => {
    const mode = String(b.paymentMode || "").toLowerCase();
    return mode === "cash" ? sum + (Number(b.paidAmount) || 0) : sum;
  }, 0);

  const tallyUpi = billingSummary.upiTotal || bills.reduce((sum, b) => {
    const mode = String(b.paymentMode || "").toLowerCase();
    return mode.includes("upi") || mode.includes("online") || mode.includes("gpay") || mode.includes("phonepe")
      ? sum + (Number(b.paidAmount) || 0)
      : sum;
  }, 0);

  const tallyCard = billingSummary.cardTotal || bills.reduce((sum, b) => {
    const mode = String(b.paymentMode || "").toLowerCase();
    return mode.includes("card") ? sum + (Number(b.paidAmount) || 0) : sum;
  }, 0);

  const tallyTotalCollected = billingSummary.totalCollected || (tallyCash + tallyUpi + tallyCard) || totalCollected;
  const tallyTotalDue = billingSummary.totalDue ?? totalDue;

  const cashPercent = tallyTotalCollected > 0 ? Math.round((tallyCash / tallyTotalCollected) * 100) : 0;
  const upiPercent = tallyTotalCollected > 0 ? Math.round((tallyUpi / tallyTotalCollected) * 100) : 0;
  const cardPercent = tallyTotalCollected > 0 ? Math.max(0, 100 - cashPercent - upiPercent) : 0;

  /* =========================================
     Export Bills to CSV for Accounts / CA
  ========================================= */
  const exportToCSV = async () => {
    try {
      toast.info("Preparing full billing report for export...");
      const dateParams = getDateFilterParams();
      const fullRes = await getAdminBillsApi({
        search: debouncedSearch,
        paymentStatus: statusFilter,
        ...dateParams,
      });
      const dataToExport = Array.isArray(fullRes) ? fullRes : (fullRes?.data || bills);

      if (!dataToExport || dataToExport.length === 0) {
        toast.warning("No bills to export");
        return;
      }

      const headers = [
        "Bill ID",
        "Visit ID",
        "Patient Name",
        "UHID",
        "Mobile",
        "Age",
        "Gender",
        "Visit Date",
        "Diagnosis / Reason",
        "Doctor",
        "Hospital / Branch",
        "Total Amount (Rs)",
        "Discount (Rs)",
        "Paid Amount (Rs)",
        "Due Amount (Rs)",
        "Payment Mode",
        "Payment Status",
        "Invoice Status"
      ];

      const rows = dataToExport.map((b) => [
        `"${b.billId || ""}"`,
        `"${b.visitId || ""}"`,
        `"${(b.patientName || "").replace(/"/g, '""')}"`,
        `"${b.patientId || ""}"`,
        `"${b.phone || ""}"`,
        `"${b.age || ""}"`,
        `"${b.gender || ""}"`,
        `"${b.visitDate || ""}"`,
        `"${(b.diagnosis || "").replace(/"/g, '""')}"`,
        `"${(b.doctor || "Dr. Vinish Kumar Singh").replace(/"/g, '""')}"`,
        `"${(b.hospital || "").replace(/"/g, '""')}"`,
        `"${b.totalAmount ?? 0}"`,
        `"${b.discount ?? 0}"`,
        `"${b.paidAmount ?? 0}"`,
        `"${b.dueAmount ?? 0}"`,
        `"${b.paymentMode || "Cash"}"`,
        `"${b.paymentStatus || "Paid"}"`,
        `"${b.invoiceStatus || "Paid"}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `billing-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${dataToExport.length} bills to CSV`);
    } catch (err) {
      toast.error("Failed to export billing CSV");
    }
  };

  // Open Daily Collection History
  const handleOpenDailyHistory = async () => {
    setShowDailyHistoryModal(true);
    setLoadingDailyHistory(true);
    try {
      const res = await getDailyCollectionSummaryApi(30);
      setDailyHistoryList(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch daily history:", err);
      toast.error("Could not fetch daily collection history");
    } finally {
      setLoadingDailyHistory(false);
    }
  };

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

     Auto-add Patient to Doctor Queue on Payment (MongoDB Sync)

  ========================================= */

  const addPatientToDoctorQueue = (bill) => {
    try {
      const tokenNumber =
        bill.tokenNumber || `T-${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        tokenNumber,
        patientId: bill.patientId,
        patientName: bill.patientName,
        age: Number(bill.age) || 35,
        gender: bill.gender || "Male",
        mobile: bill.phone || "",
        doctorName: bill.doctor || "Dr. Vinish Kumar Singh",
        department: bill.department || "Urology",
        clinic: bill.hospital || "Rudraksh IVF & Urology Centre",
        visitId: bill.visitId || "",
        bill: bill._id || null,
        notes: `Diagnosis: ${bill.diagnosis || "General"}. Bill: ${
          bill.billId
        } (₹${bill.paidAmount || bill.totalAmount})`,
      };

      // Save to MongoDB DoctorQueue collection
      addToQueueApi(payload).catch((err) =>
        console.warn("Queue API Error:", err),
      );

      return tokenNumber;
    } catch (err) {
      console.warn("Failed to add patient to doctor queue:", err);
      return null;
    }
  };

  // Manual Trigger to Send / View Bill in Doctor Queue
  const handleSendToDoctorQueue = (bill) => {
    const due = Number(
      bill.dueAmount !== undefined
        ? bill.dueAmount
        : Math.max(0, (Number(bill.totalAmount) || 0) - (Number(bill.paidAmount) || 0))
    );

    // If payment is not fully settled (Due > 0 or Status not Paid)
    if (due > 0 || (bill.paymentStatus && bill.paymentStatus !== "Paid")) {
      toast.warning(
        `Due amount ₹${due.toLocaleString("en-IN")} pending hai! Doctor Queue me bhejne se pehle payment clear karein.`,
        { autoClose: 4500 }
      );
      // Automatically open the Collect Payment modal with this bill and due amount preset!
      setPaymentBill(bill);
      setPaymentAmount(due > 0 ? String(due) : "");
      return;
    }

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

  // Trigger Doctor Queue Confirmation Popup
  const promptQueueAddition = (billObj, paidAmt) => {
    const due = Number(
      billObj.dueAmount !== undefined
        ? billObj.dueAmount
        : Math.max(0, (Number(billObj.totalAmount) || 0) - (Number(billObj.paidAmount) || 0))
    );
    // If due is pending, do not add to doctor queue
    if (due > 0 || (billObj.paymentStatus && billObj.paymentStatus !== "Paid")) {
      return;
    }

    const matchedApt = appointments.find(
      (a) =>
        (billObj.appointment && String(a._id || a.id) === String(billObj.appointment)) ||
        (billObj.visitId && a.visitId && a.visitId === billObj.visitId) ||
        (billObj.phone && a.phone && a.phone.replace(/\D/g, "") === billObj.phone.replace(/\D/g, ""))
    );

    const formattedToken =
      billObj.tokenNumber ||
      (matchedApt?.tokenNumber
        ? `T-${String(matchedApt.tokenNumber).padStart(3, "0")}`
        : undefined);

    const queuePayload = {
      tokenNumber: formattedToken,
      visitId: billObj.visitId || matchedApt?.visitId || "",
      appointment: billObj.appointment || matchedApt?._id || matchedApt?.id || null,
      bill: billObj._id || null,
      patientId: billObj.patientId || matchedApt?.patientId || "",
      patientName: billObj.patientName,
      age: Number(billObj.age) || Number(matchedApt?.age) || 35,
      gender: billObj.gender || matchedApt?.gender || "Male",
      mobile: billObj.phone || matchedApt?.phone || "",
      doctorName: billObj.doctor || "Dr. Vinish Kumar Singh",
      department: billObj.department || "Urology",
      clinic: billObj.hospital || "Rudraksh IVF & Urology Centre",
      status: "Waiting",
      priority: "Normal",
    };

    setQueueConfirmData({
      patientName: billObj.patientName,
      tokenNumber: formattedToken || "Auto",
      visitId: billObj.visitId || matchedApt?.visitId || "",
      patientId: billObj.patientId || matchedApt?.patientId || "",
      amount: paidAmt,
      services: billObj.services || [],
      payload: queuePayload,
    });
  };

  const handleCreateBill = async (e) => {
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

    const matchedApt = appointments.find(
      (a) => String(a._id || a.id) === String(newBillForm.selectedAppointmentId)
    );

    const billNumber = Math.floor(1000 + Math.random() * 9000);
    const billId = `BILL-${billNumber}`;
    const visitId =
      newBillForm.visitId ||
      matchedApt?.visitId ||
      `V-${Math.floor(20000 + Math.random() * 90000)}`;
    const patientId =
      newBillForm.patientId ||
      matchedApt?.patientId ||
      (visitId ? `UHID-${visitId.replace(/\D/g, "")}` : `UHID-${Math.floor(10000 + Math.random() * 90000)}`);
    const tokenNumber =
      newBillForm.tokenNumber ||
      (matchedApt?.tokenNumber ? `T-${String(matchedApt.tokenNumber).padStart(3, "0")}` : undefined);

    const paymentStatus =
      formDueAmount === 0 ? "Paid" : formPaidAmount > 0 ? "Partial" : "Pending";

    const createdBill = {
      billId,
      visitId,
      tokenNumber,
      appointment: newBillForm.selectedAppointmentId || null,
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

    try {
      const res = await createAdminBillApi(createdBill);
      const savedBill = res?.data || createdBill;
      setBills((prev) => [savedBill, ...prev]);
      toast.success(`Bill ${billId} created successfully!`);

      setShowCreateModal(false);
      setNewBillForm(defaultBillForm);
      setSelectedBill(savedBill);

      // Prompt Receptionist: Would you like to add patient to Doctor Queue?
      // Only prompt when payment is completely cleared (no due pending)
      if (formDueAmount === 0 && formPaidAmount > 0) {
        promptQueueAddition(savedBill, formPaidAmount);
      }
    } catch (err) {
      console.error("Save bill error:", err);
      toast.error("Unable to save bill. Please try again.");
    }
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

    updateAdminBillApi(editingBill.billId, updated)
      .then(() => {
        toast.success(`Bill ${editingBill.billId} updated successfully!`);
      })
      .catch((err) => {
        console.error("Update bill error:", err);
        toast.error("Unable to update bill. Please try again.");
      });

    setBills((prev) =>
      prev.map((b) => (b.billId === editingBill.billId ? updated : b)),
    );

    setEditingBill(null);
    setEditFormData(null);
  };

  /* =========================================

     Collect Payment Handler

  ========================================= */

  const handleCollectPayment = async () => {
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

    const newPaidAmount = paymentBill.paidAmount + amount;
    const newDueAmount = paymentBill.totalAmount - newPaidAmount;
    const newStatus = newDueAmount === 0 ? "Paid" : "Partial";

    const updatePayload = {
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
      paymentMode,
      paymentStatus: newStatus,
      invoiceStatus: newStatus,
    };

    const updated = {
      ...paymentBill,
      ...updatePayload,
    };

    try {
      await updateAdminBillApi(paymentBill.billId, updatePayload);
      setBills((prev) =>
        prev.map((bill) => (bill.billId === paymentBill.billId ? updated : bill)),
      );
      toast.success(`Payment of ₹${amount.toLocaleString("en-IN")} recorded successfully!`);

      setPaymentBill(null);
      setPaymentAmount("");
      setPaymentMode("UPI");

      // Prompt Receptionist: Would you like to add patient to Doctor Queue?
      // Only prompt when due is completely 0 (full payment cleared)
      if (newDueAmount === 0 && newPaidAmount > 0) {
        promptQueueAddition(updated, amount);
      } else if (newDueAmount > 0) {
        toast.info(
          `Payment of ₹${amount.toLocaleString("en-IN")} recorded. Remaining due: ₹${newDueAmount.toLocaleString("en-IN")}. Doctor Queue me bhejne ke liye poora payment clear karein.`
        );
      }
    } catch (err) {
      console.error("Payment collection error:", err);
      toast.error("Unable to record payment. Please try again.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* =========================================

          Header

      ========================================= */}

      <div className="flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Billing & Payment
          </h1>

          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Manage OPD bills, patient invoices, payments and receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={exportToCSV}
            disabled={bills.length === 0}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-blue-600 active:scale-95 disabled:opacity-50"
            title="Export Billing Data to CSV for Accounts / CA"
          >
            <Download size={16} className="text-slate-500 sm:w-4 sm:h-4" />
            <span>Export CSV</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 shadow-xs">
            <Calendar size={16} className="text-blue-600 sm:w-4.5 sm:h-4.5" />

            <span className="text-xs sm:text-sm font-medium text-slate-700">
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
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={16} className="sm:w-4.5 sm:h-4.5" />

            <span>Create New Bill</span>
          </button>
        </div>
      </div>

      {/* =========================================

          Stats (2 cols on phone, 4 on desktop)

      ========================================= */}

      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 lg:grid-cols-4">
        {/* Total Bills */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Total Bills</p>
              <h2 className="mt-0.5 text-sm sm:text-xl font-bold text-slate-900">
                {totalBills}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-50 p-1.5 sm:p-2 text-blue-600 shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Paid Bills</p>
              <h2 className="mt-0.5 text-sm sm:text-xl font-bold text-slate-900">
                {paidBills}
              </h2>
            </div>
            <div className="rounded-lg bg-green-50 p-1.5 sm:p-2 text-green-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Pending / Due</p>
              <h2 className="mt-0.5 text-sm sm:text-xl font-bold text-slate-900">
                {pendingBills}
              </h2>
              {partialBills > 0 && (
                <p className="text-[9px] sm:text-[10px] font-medium text-amber-600 mt-0.5 truncate">
                  ({pendingBills - partialBills} Unpaid • {partialBills} Partial)
                </p>
              )}
            </div>
            <div className="rounded-lg bg-amber-50 p-1.5 sm:p-2 text-amber-600 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
        </div>

        {/* Due */}
        <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Total Due</p>
              <h2 className="mt-0.5 text-sm sm:text-xl font-bold text-slate-900">
                ₹{totalDue.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="rounded-lg bg-red-50 p-1.5 sm:p-2 text-red-600 shrink-0">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================

          Daily Cash vs UPI Tally Card (Day-End Settlement)

      ========================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-xs">

        {/* Tally Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs shrink-0">
              <WalletCards size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Day-End Settlement & Cash vs UPI Tally
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} /> {datePreset === "all" ? "All Recorded Time" : datePreset === "today" ? "Today" : datePreset === "yesterday" ? "Yesterday" : datePreset === "this_week" ? "Last 7 Days" : datePreset === "this_month" ? "This Month" : customDate || "Custom Date"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Reception shift reconciliation: match physical cash in drawer with digital bank collections.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleOpenDailyHistory}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition active:scale-95 shadow-2xs cursor-pointer"
              title="View Day-by-Day Historical Collections"
            >
              <Calendar size={13} className="text-blue-600" />
              <span>Daily History</span>
            </button>

            <button
              onClick={() => setShowSettlementModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition active:scale-95 shadow-2xs cursor-pointer"
              title="Print Shift Settlement Handover Slip"
            >
              <Printer size={14} className="text-slate-600" />
              <span>Settlement Slip</span>
            </button>
          </div>
        </div>

        {/* 3-Column Tally Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 my-3.5">
          {/* 1. Cash in Drawer */}
          <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-white p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Banknote size={14} className="text-emerald-600" />
                Cash In Drawer
              </span>
              <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                {cashPercent}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-slate-900">
                ₹{tallyCash.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-emerald-700/90 font-medium">
              Physical cash received at counter (handover amount)
            </p>
          </div>

          {/* 2. UPI & Online */}
          <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/60 to-white p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone size={14} className="text-blue-600" />
                UPI / QR Digital
              </span>
              <span className="rounded-md bg-blue-100/80 px-1.5 py-0.5 text-[10px] font-black text-blue-800">
                {upiPercent}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-slate-900">
                ₹{tallyUpi.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-blue-700/90 font-medium">
              Direct clinic bank credit (GPay, PhonePe, Paytm QR)
            </p>
          </div>

          {/* 3. Total Realized Collection */}
          <div className="rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 to-white p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-indigo-600" />
                Total Settlement
              </span>
              <span className="rounded-md bg-indigo-100/80 px-1.5 py-0.5 text-[10px] font-black text-indigo-800">
                100%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-black text-indigo-950">
                ₹{tallyTotalCollected.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-1 text-[10px] sm:text-[11px] text-indigo-700/90 font-medium">
              Total realized payments collected today
            </p>
          </div>
        </div>

        {/* Visual Progress Split Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Payment Mode Distribution</span>
            <span>
              Cash: ₹{tallyCash.toLocaleString("en-IN")} ({cashPercent}%) • UPI: ₹{tallyUpi.toLocaleString("en-IN")} ({upiPercent}%)
              {tallyCard > 0 && ` • Card: ₹${tallyCard.toLocaleString("en-IN")} (${cardPercent}%)`}
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              style={{ width: `${cashPercent}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Cash: ${cashPercent}%`}
            />
            <div
              style={{ width: `${upiPercent}%` }}
              className="h-full bg-blue-500 transition-all duration-500"
              title={`UPI: ${upiPercent}%`}
            />
            {tallyCard > 0 && (
              <div
                style={{ width: `${cardPercent}%` }}
                className="h-full bg-purple-500 transition-all duration-500"
                title={`Card: ${cardPercent}%`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] sm:text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Cash in Hand
              </span>
              <span className="flex items-center gap-1 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" /> UPI / QR
              </span>
              {tallyCard > 0 && (
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-purple-500 inline-block" /> Card / POS
                </span>
              )}
            </div>

            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <span>Shift Reconciliation:</span>
              <span className="text-emerald-700">✓ Tally Matched</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================

          Search & Filter

      ========================================= */}

      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-2 sm:p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill, patient, UHID..."
              className="w-full h-9 sm:h-10 rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative sm:w-44 shrink-0">
            <Calendar
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
            />

            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 sm:h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs sm:text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date...</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Custom Date Input */}
          {datePreset === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 sm:h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer shrink-0"
            />
          )}

          {/* Status Dropdown */}
          <div className="relative sm:w-44 shrink-0">
            <Filter
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 sm:h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs sm:text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="All">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* =========================================

          Billing Table

      ========================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">OPD Bills</h2>

            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500">
              {filteredBills.length} bill
              {filteredBills.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <Lock size={13} />
            Paid invoices are protected
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex items-center justify-between bg-blue-50/70 px-3 py-1 border-b border-blue-100/80 text-[10px] font-medium text-blue-700 sm:hidden">
          <span>← Swipe horizontally for actions →</span>
          <span className="font-bold">{filteredBills.length} Bills</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-2.5 sm:px-3.5 py-2 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Bill / Visit
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Patient
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Doctor & Clinic
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Total
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Paid
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-right text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Due
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Status
                </th>

                <th className="px-2.5 sm:px-3.5 py-2 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loadingBills ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
                      <p className="text-xs font-medium text-slate-600">
                        Loading bills from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr
                    key={bill.billId}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Bill */}

                    <td className="px-2.5 sm:px-3.5 py-2 whitespace-nowrap">
                      <p className="text-xs sm:text-[13px] font-bold text-slate-800 font-mono tracking-tight whitespace-nowrap">
                        {bill.billId}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                        {bill.visitId}
                      </p>
                    </td>

                    {/* Patient */}

                    <td className="px-2.5 sm:px-3.5 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <User size={13} />
                        </div>

                        <div>
                          <p className="text-xs sm:text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                            {bill.patientName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}

                    <td className="px-2.5 sm:px-3.5 py-2 whitespace-nowrap">
                      <div className="flex items-start gap-1.5">
                        <Stethoscope
                          size={13}
                          className="mt-0.5 shrink-0 text-blue-500"
                        />

                        <div>
                          <p className="text-xs sm:text-[13px] font-medium text-slate-700 whitespace-nowrap">
                            {bill.doctor}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-500 max-w-[140px] truncate whitespace-nowrap">
                            {bill.hospital || bill.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total */}

                    <td className="px-2.5 sm:px-3.5 py-2 text-right whitespace-nowrap">
                      <p className="text-xs sm:text-[13px] font-bold text-slate-800 whitespace-nowrap">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* Paid */}

                    <td className="px-2.5 sm:px-3.5 py-2 text-right whitespace-nowrap">
                      <p className="text-xs sm:text-[13px] font-semibold text-green-600 whitespace-nowrap">
                        ₹{bill.paidAmount.toLocaleString("en-IN")}
                      </p>

                      {bill.paymentMode && (
                        <p className="mt-0.5 text-[10px] text-slate-400 whitespace-nowrap">
                          {bill.paymentMode}
                        </p>
                      )}
                    </td>

                    {/* Due */}

                    <td className="px-2.5 sm:px-3.5 py-2 text-right whitespace-nowrap">
                      <p
                        className={`text-xs sm:text-[13px] font-semibold whitespace-nowrap ${bill.dueAmount > 0 ? "text-red-600" : "text-slate-400"
                          }`}
                      >
                        ₹{bill.dueAmount.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* Status */}

                    <td className="px-2.5 sm:px-3.5 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-semibold whitespace-nowrap ${paymentStatusStyles[bill.paymentStatus]
                          }`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-2.5 sm:px-3.5 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        {/* View */}

                        <button
                          onClick={() => setSelectedBill(bill)}
                          title="View Bill Details"
                          className="rounded-md border border-slate-200 bg-white p-1 sm:p-1.5 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit */}

                        <button
                          onClick={() => handleOpenEdit(bill)}
                          title="Edit Bill"
                          className="rounded-md border border-slate-200 bg-white p-1 sm:p-1.5 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Send / Push to Doctor Queue */}

                        <button
                          onClick={() => handleSendToDoctorQueue(bill)}
                          title={
                            (bill.dueAmount > 0 || (bill.paymentStatus && bill.paymentStatus !== "Paid"))
                              ? `Due: ₹${bill.dueAmount || bill.totalAmount} Pending — Click to Collect Payment`
                              : bill.tokenNumber
                              ? `Token: ${bill.tokenNumber} (Click to re-sync in Queue)`
                              : "Send to Doctor Queue"
                          }
                          className={`rounded-md border p-1 sm:p-1.5 transition flex items-center gap-1 ${
                            (bill.dueAmount > 0 || (bill.paymentStatus && bill.paymentStatus !== "Paid"))
                              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : bill.tokenNumber
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px]"
                              : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                          }`}
                        >
                          <Stethoscope size={13} />

                          {bill.tokenNumber && (
                            <span className="text-[10px] font-bold">
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
                            className="rounded-md border border-green-200 bg-green-50 p-1 sm:p-1.5 text-green-600 transition hover:bg-green-100"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}

                        {/* Receipt */}

                        {bill.paymentStatus === "Paid" && (
                          <button
                            onClick={() => setSelectedBill(bill)}
                            title="Receipt / Print"
                            className="rounded-md border border-blue-200 bg-blue-50 p-1 sm:p-1.5 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Receipt size={14} />
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

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 bg-white">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{totalBillsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{" "}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalBillsCount)}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalBillsCount}</span> bills
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
              disabled={currentPage <= 1 || loadingBills}
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
              disabled={currentPage >= totalPages || loadingBills}
              className="flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs cursor-pointer animate-in fade-in duration-150"
            onClick={() => {
              setEditingBill(null);
              setEditFormData(null);
            }}
          >
            <div
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 cursor-default animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/70 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                    <Pencil size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Edit Bill & Services
                      </h2>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800">
                        #{editingBill.billId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Adjust bill services, pricing, discount, and payment collection
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBill(null);
                    setEditFormData(null);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form Body */}
              <form
                onSubmit={handleSaveEditBill}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
              >
                {/* 1. Patient & Clinic Identity Summary Card (Read-Only) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
                        <User size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block leading-tight">
                          {editFormData.patientName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {editFormData.phone || "No Mobile"} • {editFormData.age} yrs • {editFormData.gender}
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="inline-block rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {editFormData.visitId || editFormData.patientId || "OPD Visit"}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {editingBill.visitDate || "Today"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Stethoscope size={13.5} className="text-slate-400 shrink-0" />
                      <span className="truncate">{editFormData.doctor || "Dr. Vinish Kumar Singh"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Activity size={13.5} className="text-slate-400 shrink-0" />
                      <span className="truncate">{editFormData.diagnosis || "General Consultation"}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Services & Particulars (Editable) */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Services & Particulars
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Add consultation, tests, procedures, or medicines
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleEditAddService}
                      className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <Plus size={13} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {editFormData.services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 transition hover:bg-slate-50"
                      >
                        {/* Preset Quick Select */}
                        <div className="w-full sm:w-1/3">
                          <select
                            onChange={(e) =>
                              handleEditPresetServiceSelect(idx, e.target.value)
                            }
                            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              -- Quick Select Service --
                            </option>
                            {STANDARD_SERVICES.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.name} (₹{s.amount})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Service Name Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Service / Procedure name..."
                            value={service.name}
                            onChange={(e) =>
                              handleEditServiceChange(idx, "name", e.target.value)
                            }
                            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Amount Input */}
                        <div className="w-full sm:w-28 flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                              ₹
                            </span>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="0"
                              value={service.amount}
                              onChange={(e) =>
                                handleEditServiceChange(
                                  idx,
                                  "amount",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-6 pr-2 text-right text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                            />
                          </div>

                          {editFormData.services.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleEditRemoveService(idx)}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              title="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Billing Summary & Payment (Editable) */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
                  <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Billing Summary & Payment
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left: Summary Numbers & Discount */}
                    <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-900">
                          ₹{editSubtotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Discount (₹):</span>
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
                          className="w-24 rounded-md border border-slate-200 bg-white py-1 px-2 text-right text-xs font-semibold outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-200/80 pt-2 font-bold text-slate-900 text-sm">
                        <span>Total Net Amount:</span>
                        <span className="text-blue-600">
                          ₹{editTotalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Right: Payment Collection */}
                    <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700">Paid Amount (₹):</span>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                paidAmount: editTotalAmount,
                              }))
                            }
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Full Paid
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData((prev) => ({
                                ...prev,
                                paidAmount: 0,
                              }))
                            }
                            className="font-bold text-slate-500 hover:underline"
                          >
                            Unpaid
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
                          max={editTotalAmount}
                          value={editFormData.paidAmount}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              paidAmount: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-6 pr-3 text-right text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/70 text-xs">
                        <span className="text-slate-500">Balance Due:</span>
                        <span
                          className={`font-black ${
                            editDueAmount > 0 ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          ₹{editDueAmount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Payment Mode Selector */}
                      {editPaidAmount > 0 && (
                        <div className="pt-1.5">
                          <label className="mb-1 block text-[11px] font-medium text-slate-500">
                            Payment Mode:
                          </label>
                          <div className="grid grid-cols-4 gap-1">
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
                                className={`rounded-md py-1 text-[11px] font-semibold border transition ${
                                  editFormData.paymentMode === mode
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-2xs"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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

                  {/* Notes / Remarks */}
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Optional remarks / bill notes..."
                      value={editFormData.notes}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBill(null);
                      setEditFormData(null);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
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

      {selectedBill &&
        createPortal(
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
        </div>,
        document.body,
      )}

      {/* Print Stylesheet for Official OPD Receipt & Day-End Settlement Sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-billing-receipt, #printable-billing-receipt *,
          #printable-settlement-slip, #printable-settlement-slip * {
            visibility: visible !important;
          }
          #printable-billing-receipt, #printable-settlement-slip {
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

      {paymentBill &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
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
        </div>,
        document.body,
      )}

      {/* =====================================================
          Doctor Queue Confirmation Modal (Post-Billing / Payment)
      ===================================================== */}
      {queueConfirmData &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 cursor-pointer"
            onClick={() => {
              setQueueConfirmData(null);
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 cursor-default animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Gradient Stripe */}
              <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

              <div className="p-5 sm:p-6">
                {/* Header with Icon */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                    <Stethoscope size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 mb-1">
                      <CheckCircle2 size={12} />
                      Billing / Payment Completed
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Add Patient to Doctor Queue?
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Send patient to Dr. Vinish's OPD waiting queue?
                    </p>
                  </div>
                </div>

                {/* Patient Summary Card */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-blue-600 shrink-0" />
                      <span className="text-sm font-bold text-slate-900">
                        {queueConfirmData.patientName}
                      </span>
                    </div>
                    {queueConfirmData.tokenNumber && queueConfirmData.tokenNumber !== "Auto" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-black text-white shadow-xs">
                        #{queueConfirmData.tokenNumber}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        Token: Next in Queue
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Visit / ID:</span>
                      <p className="font-semibold text-slate-700 truncate">
                        {queueConfirmData.visitId || queueConfirmData.patientId || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Amount Paid:</span>
                      <p className="font-semibold text-emerald-600">
                        ₹{Number(queueConfirmData.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(queueConfirmData.services) && queueConfirmData.services.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">Services Billed:</span>
                      <p className="font-medium text-slate-700 truncate">
                        {queueConfirmData.services.map((s) => s.name).join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Clarification prompt */}
                <p className="mt-3.5 text-xs text-slate-500 leading-relaxed text-center">
                  Select <strong className="text-blue-600 font-semibold">Yes</strong> to assign token and place in doctor's waiting list. Select <strong className="text-slate-700 font-semibold">No, Skip</strong> for standalone lab tests or pharmacy only.
                </p>

                {/* Yes / No Action Buttons */}
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const pName = queueConfirmData.patientName;
                      setQueueConfirmData(null);
                      toast.info(`Billing saved. ${pName} was not added to doctor queue.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition active:scale-95 shadow-xs"
                  >
                    <X size={15} />
                    No, Skip
                  </button>

                  <button
                    type="button"
                    disabled={addingToQueue}
                    onClick={async () => {
                      try {
                        setAddingToQueue(true);
                        const res = await addToQueueApi(queueConfirmData.payload);
                        const assignedToken = res?.data?.tokenNumber || queueConfirmData.tokenNumber;
                        if (assignedToken) {
                          setBills((prev) =>
                            prev.map((b) =>
                              (queueConfirmData.payload.visitId && b.visitId === queueConfirmData.payload.visitId) ||
                              (queueConfirmData.payload.bill && String(b._id || b.id) === String(queueConfirmData.payload.bill)) ||
                              b.patientName === queueConfirmData.patientName
                                ? { ...b, tokenNumber: assignedToken }
                                : b
                            )
                          );
                        }
                        toast.success(
                          `Patient ${queueConfirmData.patientName} added to Doctor Queue (${assignedToken || "Waiting"})!`
                        );
                      } catch (err) {
                        console.error("Queue add error:", err);
                        toast.error("Unable to add patient to queue. Please try again.");
                      } finally {
                        setAddingToQueue(false);
                        setQueueConfirmData(null);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {addingToQueue ? "Adding..." : "Yes, Add to Queue"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* =====================================================
          Day-End Settlement & Shift Handover Slip Modal
      ===================================================== */}
      {showSettlementModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto cursor-pointer"
            onClick={() => setShowSettlementModal(false)}
          >
            <div
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 cursor-default animate-in zoom-in-95 duration-200 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Actions */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <WalletCards size={18} className="text-emerald-700" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Day-End Shift Settlement Sheet
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Printable Settlement Slip Body */}
              <div id="printable-settlement-slip" className="p-5 sm:p-6 bg-white space-y-4">
                {/* Clinic Header */}
                <div className="border-b-2 border-slate-800 pb-3 text-center">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    Dr. Vinish Kumar Singh
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-700">
                    M.S., M.Ch. (Urology) • Senior Consultant Urologist & Andrologist
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Rudraksh IVF & Urology Centre (Sharda Nagar) / Dr. Shilpi Maternity Centre
                  </p>
                  <div className="mt-2 inline-block rounded-md bg-slate-900 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
                    OPD Shift Settlement & Cash Tally Sheet
                  </div>
                </div>

                {/* Shift Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Settlement Date:</span>
                    <span className="font-bold text-slate-800">
                      {new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Generated At:</span>
                    <span className="font-bold text-slate-800">
                      {new Date().toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Desk Operator:</span>
                    <span className="font-semibold text-slate-700">Reception Counter #1</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Total Invoices:</span>
                    <span className="font-bold text-blue-700">
                      {totalBillsCount || bills.length} Bills
                    </span>
                  </div>
                </div>

                {/* Detailed Financial Breakdown Table */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Collections Reconciliation
                  </h4>

                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Banknote size={15} className="text-emerald-700" />
                        <div>
                          <span className="font-bold text-slate-900 block">Physical Cash In Drawer</span>
                          <span className="text-[10px] text-slate-500">Physical notes to hand over</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-emerald-800 block">
                          ₹{tallyCash.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{cashPercent}% of total</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Smartphone size={15} className="text-blue-700" />
                        <div>
                          <span className="font-bold text-slate-900 block">UPI / QR Digital Payments</span>
                          <span className="text-[10px] text-slate-500">Direct clinic bank credit</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-blue-800 block">
                          ₹{tallyUpi.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-blue-700 font-semibold">{upiPercent}% of total</span>
                      </div>
                    </div>

                    {tallyCard > 0 && (
                      <div className="flex items-center justify-between p-2.5 bg-purple-50/70 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <CreditCard size={15} className="text-purple-700" />
                          <div>
                            <span className="font-bold text-slate-900 block">Card / POS Swipe</span>
                            <span className="text-[10px] text-slate-500">Card machine terminal</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-sm text-purple-800 block">
                            ₹{tallyCard.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-purple-700 font-semibold">{cardPercent}% of total</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-slate-900 text-white">
                      <div>
                        <span className="font-bold text-sm block">Total Realized Collection</span>
                        <span className="text-[10px] text-slate-300">All modes combined (100%)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base text-emerald-400">
                          ₹{tallyTotalCollected.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Balance Notice */}
                  {tallyTotalDue > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 border border-amber-200">
                      <span className="font-medium">Total Pending Patient Due:</span>
                      <span className="font-black">₹{tallyTotalDue.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                {/* Handover & Verification Signatures */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="border-t border-slate-300 pt-1.5">
                    <p className="font-bold text-slate-800">Cashier / Receptionist</p>
                    <p className="text-[10px] text-slate-400">(Cash Handed Over)</p>
                  </div>
                  <div className="border-t border-slate-300 pt-1.5">
                    <p className="font-bold text-slate-800">Doctor / Manager</p>
                    <p className="text-[10px] text-slate-400">(Verified & Received)</p>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
                <p className="text-[11px] text-slate-500">
                  Ready to print for shift handover.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettlementModal(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Settlement Slip</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* =====================================================
          Daily Collection History Modal (Roj Ka Hisaab)
      ===================================================== */}
      {showDailyHistoryModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto cursor-pointer"
            onClick={() => setShowDailyHistoryModal(false)}
          >
            <div
              className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 cursor-default animate-in zoom-in-95 duration-200 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Daily Collection History (Roj Ka Hisaab)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Day-by-day revenue breakdown of Cash in Drawer vs UPI / Online collections.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDailyHistoryModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
                {loadingDailyHistory ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Clock size={24} className="mx-auto mb-2 animate-spin text-blue-500" />
                    Loading daily collection history...
                  </div>
                ) : dailyHistoryList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No billing history records found in database.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-3">Date (Tareekh)</th>
                          <th className="py-2.5 px-3 text-center">Bills</th>
                          <th className="py-2.5 px-3 text-right">Cash in Hand</th>
                          <th className="py-2.5 px-3 text-right">UPI / Online</th>
                          <th className="py-2.5 px-3 text-right">Total Collection</th>
                          <th className="py-2.5 px-3 text-right">Due Balance</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dailyHistoryList.map((day) => {
                          const dateObj = new Date(day._id + "T00:00:00");
                          const formattedDate = !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : day._id;

                          const isToday =
                            day._id === new Date().toISOString().split("T")[0];

                          return (
                            <tr
                              key={day._id}
                              className={`hover:bg-slate-50/80 transition ${
                                isToday ? "bg-blue-50/40 font-semibold" : ""
                              }`}
                            >
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                <div className="flex items-center gap-1.5">
                                  <span>{formattedDate}</span>
                                  {isToday && (
                                    <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-700">
                                      Today
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                                {day.totalBills}
                              </td>

                              <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                                ₹{Number(day.cashTotal || 0).toLocaleString("en-IN")}
                              </td>

                              <td className="py-2.5 px-3 text-right text-blue-700 font-bold">
                                ₹{Number(day.upiTotal || 0).toLocaleString("en-IN")}
                              </td>

                              <td className="py-2.5 px-3 text-right font-black text-slate-900">
                                ₹{Number(day.totalCollected || 0).toLocaleString("en-IN")}
                              </td>

                              <td className="py-2.5 px-3 text-right text-slate-500">
                                {day.totalDue > 0 ? (
                                  <span className="text-amber-700 font-bold">
                                    ₹{Number(day.totalDue).toLocaleString("en-IN")}
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-medium">₹0</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDatePreset("custom");
                                    setCustomDate(day._id);
                                    setShowDailyHistoryModal(false);
                                    toast.info(`Filtered billing to ${formattedDate}`);
                                  }}
                                  className="rounded-md border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 px-2 py-1 text-[11px] font-bold text-blue-600 transition shadow-2xs cursor-pointer"
                                >
                                  View Day
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
                <span className="text-[11px] text-slate-500">
                  Click <strong>View Day</strong> on any date to filter all records and print that day's settlement slip.
                </span>
                <button
                  type="button"
                  onClick={() => setShowDailyHistoryModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
