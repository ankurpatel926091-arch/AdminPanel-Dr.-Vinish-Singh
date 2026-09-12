import React, { useMemo, useState } from "react";
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
} from "lucide-react";

/* =========================================
   Mock Billing Data
========================================= */

const initialBills = [
  {
    billId: "BILL-1001",
    visitId: "V-20052",
    patientId: "UHID-10245",
    patientName: "Rahul Sharma",
    age: 42,
    gender: "Male",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    visitDate: "12 Sep 2026",

    consultationFee: 1000,

    services: [
      {
        name: "OPD Consultation",
        amount: 1000,
      },
      {
        name: "Ultrasound KUB",
        amount: 800,
      },
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
    age: 36,
    gender: "Male",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    visitDate: "12 Sep 2026",

    consultationFee: 1000,

    services: [
      {
        name: "OPD Consultation",
        amount: 1000,
      },
      {
        name: "Urine Routine",
        amount: 250,
      },
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
    age: 58,
    gender: "Male",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "Ajanta Hospital",
    visitDate: "12 Sep 2026",

    consultationFee: 1200,

    services: [
      {
        name: "OPD Consultation",
        amount: 1200,
      },
      {
        name: "USG Prostate",
        amount: 900,
      },
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
    age: 29,
    gender: "Male",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Andrology",
    hospital: "Ajanta Hospital",
    visitDate: "11 Sep 2026",

    consultationFee: 1200,

    services: [
      {
        name: "OPD Consultation",
        amount: 1200,
      },
    ],

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
    age: 47,
    gender: "Male",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    visitDate: "11 Sep 2026",

    consultationFee: 1000,

    services: [
      {
        name: "OPD Consultation",
        amount: 1000,
      },
      {
        name: "Urine Culture",
        amount: 600,
      },
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
  const [bills, setBills] = useState(initialBills);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentBill, setPaymentBill] = useState(null);

  const [paymentMode, setPaymentMode] = useState("UPI");
  const [paymentAmount, setPaymentAmount] = useState("");

  /* =========================================
     Filter Bills
  ========================================= */

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        bill.billId.toLowerCase().includes(searchText) ||
        bill.visitId.toLowerCase().includes(searchText) ||
        bill.patientName.toLowerCase().includes(searchText) ||
        bill.patientId.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  /* =========================================
     Statistics
  ========================================= */

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;

  const pendingBills = bills.filter(
    (bill) => bill.paymentStatus === "Pending"
  ).length;

  const totalDue = bills.reduce(
    (sum, bill) => sum + bill.dueAmount,
    0
  );

  const totalCollected = bills.reduce(
    (sum, bill) => sum + bill.paidAmount,
    0
  );

  /* =========================================
     Collect Payment
  ========================================= */

  const handleCollectPayment = () => {
    if (!paymentBill) return;

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    if (amount > paymentBill.dueAmount) {
      alert("Payment amount cannot be greater than due amount.");
      return;
    }

    setBills((prev) =>
      prev.map((bill) => {
        if (bill.billId !== paymentBill.billId) {
          return bill;
        }

        const newPaidAmount = bill.paidAmount + amount;
        const newDueAmount = bill.totalAmount - newPaidAmount;

        return {
          ...bill,
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentMode,
          paymentStatus:
            newDueAmount === 0 ? "Paid" : "Partial",
          invoiceStatus:
            newDueAmount === 0 ? "Paid" : "Partial",
        };
      })
    );

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
            Manage OPD bills, payments and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Calendar
            size={18}
            className="text-blue-600"
          />

          <span className="text-sm font-medium text-slate-700">
            Today's Billing
          </span>
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
              <p className="text-sm text-slate-500">
                Total Bills
              </p>

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
              <p className="text-sm text-slate-500">
                Paid Bills
              </p>

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
              <p className="text-sm text-slate-500">
                Pending Bills
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {pendingBills}
              </h2>
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
              <p className="text-sm text-slate-500">
                Total Due
              </p>

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
            <p className="text-sm text-slate-500">
              Today's Collection
            </p>

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
              placeholder="Search Bill ID, Visit ID, patient name or UHID..."
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
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
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
            <h2 className="font-semibold text-slate-800">
              OPD Bills
            </h2>

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
                  Doctor
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

                      <p className="mt-1 text-xs text-slate-400">
                        {bill.visitDate}
                      </p>

                    </td>

                    {/* Patient */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <User size={18} />
                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            {bill.patientName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {bill.patientId} • {bill.age} yrs •{" "}
                            {bill.gender}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Doctor */}
                    <td className="px-5 py-4">

                      <div className="flex items-start gap-2">

                        <Stethoscope
                          size={17}
                          className="mt-0.5 text-blue-500"
                        />

                        <div>

                          <p className="text-sm font-medium text-slate-700">
                            {bill.doctor}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {bill.department}
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
                        className={`font-semibold ${
                          bill.dueAmount > 0
                            ? "text-red-600"
                            : "text-slate-400"
                        }`}
                      >
                        ₹{bill.dueAmount.toLocaleString("en-IN")}
                      </p>

                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                          paymentStatusStyles[
                            bill.paymentStatus
                          ]
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
                          onClick={() =>
                            setSelectedBill(bill)
                          }
                          title="View Bill"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        {/* Payment */}
                        {bill.dueAmount > 0 && (
                          <button
                            onClick={() => {
                              setPaymentBill(bill);
                              setPaymentAmount(
                                bill.dueAmount.toString()
                              );
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
                            title="Receipt"
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

                  <td
                    colSpan="8"
                    className="px-5 py-14 text-center"
                  >

                    <FileText
                      size={40}
                      className="mx-auto text-slate-300"
                    />

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
          View Bill Modal
      ========================================= */}

      {selectedBill && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg font-bold text-slate-900">
                    Bill Details
                  </h2>

                  {selectedBill.paymentStatus === "Paid" && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle2 size={13} />
                      Paid
                    </span>
                  )}

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedBill.billId} •{" "}
                  {selectedBill.visitId}
                </p>

              </div>

              <button
                onClick={() => setSelectedBill(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Content */}
            <div className="overflow-y-auto p-5">

              {/* Patient */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <User size={26} />
                  </div>

                  <div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedBill.patientName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedBill.patientId} •{" "}
                      {selectedBill.age} years •{" "}
                      {selectedBill.gender}
                    </p>

                  </div>

                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-slate-400">
                      Doctor
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedBill.doctor}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedBill.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Hospital
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedBill.hospital}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Visit ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedBill.visitId}
                    </p>
                  </div>

                </div>

              </div>

              {/* Services */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="mb-4 font-semibold text-slate-800">
                  Bill Items
                </h3>

                <div className="space-y-3">

                  {selectedBill.services.map(
                    (service, index) => (

                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                      >

                        <span className="text-sm text-slate-700">
                          {service.name}
                        </span>

                        <span className="text-sm font-semibold text-slate-800">
                          ₹
                          {service.amount.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* Amount Summary */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Consultation & Services
                    </span>

                    <span className="font-medium text-slate-700">
                      ₹
                      {selectedBill.services
                        .reduce(
                          (sum, item) =>
                            sum + item.amount,
                          0
                        )
                        .toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-medium text-red-600">
                      - ₹
                      {selectedBill.discount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">

                    <div className="flex justify-between">

                      <span className="font-semibold text-slate-800">
                        Total Amount
                      </span>

                      <span className="text-lg font-bold text-slate-900">
                        ₹
                        {selectedBill.totalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      Paid
                    </span>

                    <span className="font-semibold text-green-600">
                      ₹
                      {selectedBill.paidAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">
                      Due
                    </span>

                    <span className="font-semibold text-red-600">
                      ₹
                      {selectedBill.dueAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                </div>

              </div>

              {/* Paid Invoice Protection */}
              {selectedBill.paymentStatus === "Paid" && (

                <div className="mt-5 flex gap-3 rounded-xl border border-green-100 bg-green-50 p-4">

                  <Lock
                    size={19}
                    className="mt-0.5 shrink-0 text-green-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-green-800">
                      Paid Invoice Protected
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-700">
                      Paid invoices cannot be directly
                      edited or deleted by a normal
                      receptionist. Any refund, adjustment
                      or cancellation must follow the
                      controlled workflow and audit process.
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">

              {selectedBill.paymentStatus === "Paid" && (
                <>
                  <button
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <Receipt size={16} />
                    Print Receipt
                  </button>

                  <button
                    className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    <RotateCcw size={16} />
                    Refund / Adjustment
                  </button>
                </>
              )}

              {selectedBill.dueAmount > 0 && (
                <button
                  onClick={() => {
                    setSelectedBill(null);
                    setPaymentBill(selectedBill);
                    setPaymentAmount(
                      selectedBill.dueAmount.toString()
                    );
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <CreditCard size={16} />
                  Collect Payment
                </button>
              )}

              <button
                onClick={() => setSelectedBill(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================
          Payment Modal
      ========================================= */}

      {paymentBill && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>

                <h2 className="font-bold text-slate-900">
                  Collect Payment
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {paymentBill.billId} •{" "}
                  {paymentBill.patientName}
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

                <p className="text-sm text-red-600">
                  Outstanding Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  ₹
                  {paymentBill.dueAmount.toLocaleString(
                    "en-IN"
                  )}
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
                  onChange={(e) =>
                    setPaymentAmount(e.target.value)
                  }
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
                  onClick={() => setPaymentMode("Cash")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${
                    paymentMode === "Cash"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Banknote size={19} />
                  Cash
                </button>

                {/* Card */}
                <button
                  onClick={() => setPaymentMode("Card")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${
                    paymentMode === "Card"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard size={19} />
                  Card
                </button>

                {/* UPI */}
                <button
                  onClick={() => setPaymentMode("UPI")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${
                    paymentMode === "UPI"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Smartphone size={19} />
                  UPI
                </button>

                {/* Online */}
                <button
                  onClick={() => setPaymentMode("Online")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${
                    paymentMode === "Online"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <WalletCards size={19} />
                  Online
                </button>

                {/* Other */}
                <button
                  onClick={() => setPaymentMode("Other")}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition ${
                    paymentMode === "Other"
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
                  Successful payment will create a payment
                  record and receipt. Paid invoices cannot
                  be directly edited or deleted.
                </p>

              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">

              <button
                onClick={() => {
                  setPaymentBill(null);
                  setPaymentAmount("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
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