import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  WalletCards,
  User,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lock,
  X,
  IndianRupee,
  FileText,
} from "lucide-react";

/* =========================================
   Mock Payment Data
========================================= */

const initialPayments = [
  {
    paymentId: "PAY-10001",
    billId: "BILL-1001",
    visitId: "V-20052",
    patientId: "UHID-10245",
    patientName: "Rahul Sharma",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    amount: 1800,
    paymentMode: "UPI",
    transactionId: "UPI-92837465",
    paymentDate: "12 Sep 2026",
    paymentTime: "10:15 AM",
    status: "Successful",
  },

  {
    paymentId: "PAY-10002",
    billId: "BILL-1003",
    visitId: "V-20054",
    patientId: "UHID-10247",
    patientName: "Suresh Kumar",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "Ajanta Hospital",
    amount: 1000,
    paymentMode: "Cash",
    transactionId: null,
    paymentDate: "12 Sep 2026",
    paymentTime: "11:20 AM",
    status: "Successful",
  },

  {
    paymentId: "PAY-10003",
    billId: "BILL-1004",
    visitId: "V-20055",
    patientId: "UHID-10248",
    patientName: "Mohit Singh",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Andrology",
    hospital: "Ajanta Hospital",
    amount: 1000,
    paymentMode: "Card",
    transactionId: "CARD-67283921",
    paymentDate: "11 Sep 2026",
    paymentTime: "02:10 PM",
    status: "Successful",
  },

  {
    paymentId: "PAY-10004",
    billId: "BILL-1006",
    visitId: "V-20057",
    patientId: "UHID-10250",
    patientName: "Vikas Singh",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    amount: 1200,
    paymentMode: "Online",
    transactionId: "ONL-82736451",
    paymentDate: "11 Sep 2026",
    paymentTime: "04:35 PM",
    status: "Successful",
  },

  {
    paymentId: "PAY-10005",
    billId: "BILL-1007",
    visitId: "V-20058",
    patientId: "UHID-10251",
    patientName: "Amit Gupta",
    doctor: "Dr. Vinish Kumar Singh",
    department: "Urology",
    hospital: "SKD Hospital",
    amount: 900,
    paymentMode: "UPI",
    transactionId: "UPI-73482910",
    paymentDate: "10 Sep 2026",
    paymentTime: "12:45 PM",
    status: "Refunded",
  },
];

/* =========================================
   Helpers
========================================= */

const statusStyles = {
  Successful: "bg-green-50 text-green-700 border-green-200",
  Refunded: "bg-red-50 text-red-700 border-red-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Adjusted: "bg-amber-50 text-amber-700 border-amber-200",
};

const paymentModeIcon = {
  Cash: Banknote,
  Card: CreditCard,
  UPI: Smartphone,
  Online: WalletCards,
  Other: Receipt,
};

/* =========================================
   Main Component
========================================= */

export default function Payments() {
  const [payments, setPayments] = useState(initialPayments);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundPayment, setRefundPayment] = useState(null);

  const [refundReason, setRefundReason] = useState("");

  /* =========================================
     Filter Payments
  ========================================= */

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        payment.paymentId.toLowerCase().includes(searchText) ||
        payment.billId.toLowerCase().includes(searchText) ||
        payment.visitId.toLowerCase().includes(searchText) ||
        payment.patientName.toLowerCase().includes(searchText) ||
        payment.patientId.toLowerCase().includes(searchText) ||
        (payment.transactionId || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        payment.status === statusFilter;

      const matchesMode =
        modeFilter === "All" ||
        payment.paymentMode === modeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMode
      );
    });
  }, [
    payments,
    search,
    statusFilter,
    modeFilter,
  ]);

  /* =========================================
     Statistics
  ========================================= */

  const successfulPayments = payments.filter(
    (payment) => payment.status === "Successful"
  );

  const totalCollected = successfulPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const totalTransactions = payments.length;

  const successfulCount = successfulPayments.length;

  const refundedAmount = payments
    .filter((payment) => payment.status === "Refunded")
    .reduce((sum, payment) => sum + payment.amount, 0);

  /* =========================================
     Refund / Adjustment
  ========================================= */

  const handleRefund = () => {
    if (!refundPayment) return;

    if (!refundReason.trim()) {
      alert("Please enter refund/adjustment reason.");
      return;
    }

    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentId === refundPayment.paymentId
          ? {
              ...payment,
              status: "Refunded",
            }
          : payment
      )
    );

    setRefundPayment(null);
    setRefundReason("");
    setSelectedPayment(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* =========================================
          Header
      ========================================= */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage payment transactions, receipts and
            payment history.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Calendar
            size={18}
            className="text-blue-600"
          />

          <span className="text-sm font-medium text-slate-700">
            Payment Transactions
          </span>
        </div>

      </div>

      {/* =========================================
          Stats Cards
      ========================================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Collection */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Collected
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                ₹{totalCollected.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <IndianRupee size={22} />
            </div>

          </div>

        </div>

        {/* Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Transactions
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {totalTransactions}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CreditCard size={22} />
            </div>

          </div>

        </div>

        {/* Successful */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Successful
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {successfulCount}
              </h2>
            </div>

            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>

          </div>

        </div>

        {/* Refund */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Refunded
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                ₹{refundedAmount.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <RotateCcw size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          Search & Filters
      ========================================= */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">

          {/* Search */}
          <div className="relative lg:col-span-1">

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
              placeholder="Payment ID, Bill ID, patient, UHID..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Payment Mode */}
          <div className="relative">

            <CreditCard
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={modeFilter}
              onChange={(e) =>
                setModeFilter(e.target.value)
              }
              className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Payment Modes
              </option>

              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Online">Online</option>
              <option value="Other">Other</option>
            </select>

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
              <option value="All">
                All Payment Status
              </option>

              <option value="Successful">
                Successful
              </option>

              <option value="Refunded">
                Refunded
              </option>

              <option value="Adjusted">
                Adjusted
              </option>

              <option value="Failed">
                Failed
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =========================================
          Payment Table
      ========================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="font-semibold text-slate-800">
              Payment Transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPayments.length} transaction
              {filteredPayments.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <Lock size={14} />
            Transaction records are protected
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1150px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bill / Visit
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Doctor
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mode
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date / Time
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

              {filteredPayments.length > 0 ? (

                filteredPayments.map((payment) => {

                  const ModeIcon =
                    paymentModeIcon[
                      payment.paymentMode
                    ] || Receipt;

                  return (
                    <tr
                      key={payment.paymentId}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Payment ID */}
                      <td className="px-5 py-4">

                        <p className="font-semibold text-slate-800">
                          {payment.paymentId}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.transactionId || "Cash Transaction"}
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
                              {payment.patientName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {payment.patientId}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Bill */}
                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-slate-700">
                          {payment.billId}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.visitId}
                        </p>

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
                              {payment.doctor}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {payment.department}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 text-right">

                        <p className="font-bold text-slate-800">
                          ₹
                          {payment.amount.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </td>

                      {/* Mode */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                            <ModeIcon size={16} />
                          </div>

                          <span className="text-sm font-medium text-slate-700">
                            {payment.paymentMode}
                          </span>

                        </div>

                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">

                        <p className="text-sm text-slate-700">
                          {payment.paymentDate}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} />
                          {payment.paymentTime}
                        </p>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                            statusStyles[payment.status]
                          }`}
                        >
                          {payment.status ===
                            "Successful" && (
                            <CheckCircle2 size={13} />
                          )}

                          {payment.status ===
                            "Refunded" && (
                            <XCircle size={13} />
                          )}

                          {payment.status}
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {/* View */}
                          <button
                            onClick={() =>
                              setSelectedPayment(payment)
                            }
                            title="View Payment"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Receipt */}
                          {payment.status ===
                            "Successful" && (
                            <button
                              title="View Receipt"
                              className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                            >
                              <Receipt size={17} />
                            </button>
                          )}

                          {/* Refund */}
                          {payment.status ===
                            "Successful" && (
                            <button
                              onClick={() =>
                                setRefundPayment(payment)
                              }
                              title="Refund / Adjustment"
                              className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100"
                            >
                              <RotateCcw size={17} />
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="px-5 py-14 text-center"
                  >

                    <CreditCard
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-600">
                      No payment transactions found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          Payment Details Modal
      ========================================= */}

      {selectedPayment && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-lg font-bold text-slate-900">
                    Payment Details
                  </h2>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      statusStyles[
                        selectedPayment.status
                      ]
                    }`}
                  >
                    {selectedPayment.status}
                  </span>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedPayment.paymentId}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedPayment(null)
                }
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
                      {selectedPayment.patientName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPayment.patientId}
                    </p>

                  </div>

                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-slate-400">
                      Doctor
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.doctor}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Bill ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.billId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Visit ID
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {selectedPayment.visitId}
                    </p>
                  </div>

                </div>

              </div>

              {/* Payment Information */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

                <div className="mb-4 flex items-center gap-2">

                  <CreditCard
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-800">
                    Payment Information
                  </h3>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-xs text-slate-400">
                      Payment Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      ₹
                      {selectedPayment.amount.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-xs text-slate-400">
                      Payment Mode
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPayment.paymentMode}
                    </p>

                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-xs text-slate-400">
                      Transaction ID
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {selectedPayment.transactionId ||
                        "Cash Transaction"}
                    </p>

                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">

                    <p className="text-xs text-slate-400">
                      Payment Date & Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedPayment.paymentDate}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPayment.paymentTime}
                    </p>

                  </div>

                </div>

              </div>

              {/* Protection */}
              <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">

                <Lock
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-sm font-semibold text-blue-800">
                    Payment Record Protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Successful payment records should not
                    be directly edited or deleted by a normal
                    receptionist. Refunds or adjustments must
                    follow the controlled workflow and audit
                    process.
                  </p>

                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">

              {selectedPayment.status ===
                "Successful" && (
                <>
                  <button
                    className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                  >
                    <Receipt size={16} />
                    View Receipt
                  </button>

                  <button
                    onClick={() =>
                      setRefundPayment(
                        selectedPayment
                      )
                    }
                    className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    <RotateCcw size={16} />
                    Refund / Adjustment
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  setSelectedPayment(null)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================
          Refund / Adjustment Modal
      ========================================= */}

      {refundPayment && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>

                <h2 className="font-bold text-slate-900">
                  Refund / Adjustment
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {refundPayment.paymentId}
                </p>

              </div>

              <button
                onClick={() => {
                  setRefundPayment(null);
                  setRefundReason("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Content */}
            <div className="p-5">

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">

                <p className="text-sm text-amber-700">
                  Payment Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-800">
                  ₹
                  {refundPayment.amount.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason
                </label>

                <textarea
                  value={refundReason}
                  onChange={(e) =>
                    setRefundReason(e.target.value)
                  }
                  rows={4}
                  placeholder="Enter reason for refund or adjustment..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <div className="mt-4 flex gap-3 rounded-lg bg-slate-50 p-3">

                <Lock
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <p className="text-xs leading-5 text-slate-500">
                  This action should be permission-controlled
                  and recorded in the audit log.
                </p>

              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">

              <button
                onClick={() => {
                  setRefundPayment(null);
                  setRefundReason("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleRefund}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                <RotateCcw size={16} />
                Submit Request
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}