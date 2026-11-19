import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdminDataProvider } from "./context/AdminDataContext";
import AdminLayout from "./components/layout/AdminLayout";
import { Loader2 } from "lucide-react";
import { isLoggedIn } from "./utils/auth";
import DoctorDashboard from "./pages/Dashboard";
// import DoctorDash from "./pages/DoctorDashboard/DoctorDash";
import TodaysAppointments from "./pages/DoctorDashboard/TodaysAppointments";
import MedicalRecords from "./pages/DoctorDashboard/MedicalRecords";
import Prescriptions from "./pages/DoctorDashboard/Prescriptions";
import DoctorDash from "./pages/DoctorDashboard/DoctorDash";
import Consultation from "./pages/DoctorDashboard/Consultation";
import MyQueue from "./pages/DoctorDashboard/MyQueue";
import FollowUps from "./pages/DoctorDashboard/FollowUps";

// Lazy Loaded Route Components for Admin Panel
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContactEnquiries = lazy(() => import("./pages/ContactEnquiries"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Clinics = lazy(() => import("./pages/Clinics"));
const Blogs = lazy(() => import("./pages/Blogs"));

// Reception Service Page Components
const ReceptionAppointments = lazy(() => import("./pages/ReceptionServices/ReceptionAppointments"));
const OpdManagement = lazy(() => import("./pages/ReceptionServices/OpdManagement"));
const PatientRegistration = lazy(() => import("./pages/ReceptionServices/PatientRegistration"));
const CheckIn = lazy(() => import("./pages/ReceptionServices/CheckIn"));
const Billing = lazy(() => import("./pages/ReceptionServices/Billing"));
const Payments = lazy(() => import("./pages/ReceptionServices/Payments"));
const DoctorQueue = lazy(() => import("./pages/ReceptionServices/DoctorQueue"));
const Patients = lazy(() => import("./pages/ReceptionServices/Patients"));
const Reports = lazy(() => import("./pages/ReceptionServices/Reports"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
      Loading Page...
    </span>
  </div>
);

// Protected Route — just check localStorage token
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Root redirect — if logged in go to admin, else go to login
function RootRedirect() {
  return isLoggedIn() ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  // Purge legacy mock/business keys so data lives strictly in MongoDB
  useEffect(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Retain only admin authentication credentials
        if (key && !key.startsWith("dr_vinish_admin_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  // Global Modal Scroll Lock: Prevents background page scrolling whenever ANY modal is open
  useEffect(() => {
    const checkModalOpen = () => {
      const modals = document.querySelectorAll(
        '.fixed.inset-0:not([data-no-scroll-lock="true"]), [role="dialog"], .modal-backdrop'
      );

      let isModalOpen = false;
      for (let i = 0; i < modals.length; i++) {
        const el = modals[i];
        const style = window.getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          isModalOpen = true;
          break;
        }
      }

      if (isModalOpen) {
        if (!document.body.classList.contains('modal-open')) {
          const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
          document.documentElement.classList.add('modal-open');
          document.body.classList.add('modal-open');
          document.body.style.overflow = 'hidden';
          if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
          }
        }
      } else {
        if (document.body.classList.contains('modal-open')) {
          document.documentElement.classList.remove('modal-open');
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }
      }
    };

    checkModalOpen();

    const observer = new MutationObserver(() => {
      checkModalOpen();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden']
    });

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  return (
    <AdminDataProvider>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Login Route */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Panel Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="enquiries" element={<ContactEnquiries />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="clinics" element={<Clinics />} />
              <Route path="blogs" element={<Blogs />} />
              <Route
                path="articles"
                element={<Navigate to="/admin/blogs" replace />}
              />

              {/* Reception Services Routes */}
              <Route path="opd-management" element={<OpdManagement />} />
              <Route path="All-Appointments" element={<ReceptionAppointments />} />
              <Route
                path="patient-registration"
                element={<PatientRegistration />}
              />
              <Route path="check-in" element={<CheckIn />} />
              <Route path="billing" element={<Billing />} />
              <Route path="payments" element={<Payments />} />
              <Route path="doctor-queue" element={<DoctorQueue />} />
              <Route path="patients" element={<Patients />} />
              <Route path="reports" element={<Navigate to="/admin/billing" replace />} />
            </Route>

            {/* Legacy/Direct Admin Routes */}
            {/* <Route path="/enquiries" element={<Navigate to="/admin/enquiries" replace />} />
            <Route path="/gallery" element={<Navigate to="/admin/gallery" replace />} />
            <Route path="/clinics" element={<Navigate to="/admin/clinics" replace />} />
            <Route path="/blogs" element={<Navigate to="/admin/blogs" replace />} />
            <Route path="/articles" element={<Navigate to="/admin/blogs" replace />} /> */}

            {/* Doctor Dashboard Routes */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DoctorDash />} />
              <Route path="my-queue" element={<MyQueue />} />
              <Route
                path="todays-appointments"
                element={<TodaysAppointments />}
              />
              <Route
                path="all-appointments"
                element={<Navigate to="/doctor/todays-appointments" replace />}
              />
              <Route path="patients" element={<Patients />} />
              <Route path="medical-records" element={<MedicalRecords />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="reports" element={<Navigate to="/doctor/medical-records" replace />} />
              <Route path="follow-ups" element={<FollowUps />} />
              <Route path="consultation" element={<Consultation />} />
            </Route>

            {/* Reception Direct Routes Redirects */}
            {/* <Route path="/patient-registration" element={<Navigate to="/admin/patient-registration" replace />} />
            <Route path="/check-in" element={<Navigate to="/admin/check-in" replace />} />
            <Route path="/billing" element={<Navigate to="/admin/billing" replace />} />
            <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
            <Route path="/doctor-queue" element={<Navigate to="/admin/doctor-queue" replace />} /> */}
            

            {/* Root & Catch-All */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AdminDataProvider>
  );
}
