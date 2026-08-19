import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContactEnquiries from './pages/ContactEnquiries';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import Treatments from './pages/Treatments';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import DoctorProfile from './pages/DoctorProfile';
import Clinics from './pages/Clinics';
import Articles from './pages/Articles';
import Settings from './pages/Settings';
import { Loader2 } from 'lucide-react';

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
        <BrowserRouter>
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
              <Route path="services" element={<Services />} />
              <Route path="treatments" element={<Treatments />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="clinics" element={<Clinics />} />
              <Route path="articles" element={<Articles />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminDataProvider>
    </AuthProvider>
  );
}
