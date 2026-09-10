import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/layout/AdminLayout';
import { Loader2 } from 'lucide-react';
import { isLoggedIn } from './utils/auth';

// Lazy Loaded Route Components for Admin Panel
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContactEnquiries = lazy(() => import('./pages/ContactEnquiries'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Clinics = lazy(() => import('./pages/Clinics'));
const Blogs = lazy(() => import('./pages/Blogs'));

// Reception Service Page Components
const TodayOPD = lazy(() => import('./pages/TodayOPD'));
const PatientRegistration = lazy(() => import('./pages/PatientRegistration'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Billing = lazy(() => import('./pages/Billing'));
const Payments = lazy(() => import('./pages/Payments'));
const DoctorQueue = lazy(() => import('./pages/DoctorQueue'));
const Patients = lazy(() => import('./pages/Patients'));
const Reports = lazy(() => import('./pages/Reports'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Loading Page...</span>
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
  return isLoggedIn()
    ? <Navigate to="/admin" replace />
    : <Navigate to="/login" replace />;
}

export default function App() {
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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Admin Panel Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="enquiries" element={<ContactEnquiries />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="clinics" element={<Clinics />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="articles" element={<Navigate to="/admin/blogs" replace />} />

              {/* Reception Services Routes */}
              <Route path="today-opd" element={<TodayOPD />} />
              <Route path="patient-registration" element={<PatientRegistration />} />
              <Route path="check-in" element={<CheckIn />} />
              <Route path="billing" element={<Billing />} />
              <Route path="payments" element={<Payments />} />
              <Route path="doctor-queue" element={<DoctorQueue />} />
              <Route path="patients" element={<Patients />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Legacy/Direct Admin Routes */}
            <Route path="/enquiries" element={<Navigate to="/admin/enquiries" replace />} />
            <Route path="/gallery" element={<Navigate to="/admin/gallery" replace />} />
            <Route path="/clinics" element={<Navigate to="/admin/clinics" replace />} />
            <Route path="/blogs" element={<Navigate to="/admin/blogs" replace />} />
            <Route path="/articles" element={<Navigate to="/admin/blogs" replace />} />

            {/* Reception Direct Routes Redirects */}
            <Route path="/patient-registration" element={<Navigate to="/admin/patient-registration" replace />} />
            <Route path="/check-in" element={<Navigate to="/admin/check-in" replace />} />
            <Route path="/billing" element={<Navigate to="/admin/billing" replace />} />
            <Route path="/payments" element={<Navigate to="/admin/payments" replace />} />
            <Route path="/doctor-queue" element={<Navigate to="/admin/doctor-queue" replace />} />

            {/* Root & Catch-All */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AdminDataProvider>
  );
}
