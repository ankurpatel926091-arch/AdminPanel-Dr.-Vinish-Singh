import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/layout/AdminLayout';
import { Loader2 } from 'lucide-react';

// Lazy Loaded Route Components for Performance Optimization
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContactEnquiries = lazy(() => import('./pages/ContactEnquiries'));
const Appointments = lazy(() => import('./pages/Appointments'));
// const Services = lazy(() => import('./pages/Services'));
// const Treatments = lazy(() => import('./pages/Treatments'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
// const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const Clinics = lazy(() => import('./pages/Clinics'));
const Blogs = lazy(() => import('./pages/Blogs'));
const Settings = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
    <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Loading Page...</span>
  </div>
);

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Verifying Admin Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
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
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="enquiries" element={<ContactEnquiries />} />
                <Route path="appointments" element={<Appointments />} />
                {/* <Route path="services" element={<Services />} /> */}
                {/* <Route path="treatments" element={<Treatments />} /> */}
                <Route path="gallery" element={<Gallery />} />
                <Route path="testimonials" element={<Testimonials />} />
                {/* <Route path="profile" element={<DoctorProfile />} /> */}
                <Route path="clinics" element={<Clinics />} />
                <Route path="blogs" element={<Blogs />} />
                <Route path="articles" element={<Navigate to="/blogs" replace />} />
                {/* <Route path="settings" element={<Settings />} /> */}
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AdminDataProvider>
    </AuthProvider>
  );
}
