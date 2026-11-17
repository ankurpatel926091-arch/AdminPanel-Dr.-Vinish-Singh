import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminEnquiriesApi } from '../api/enquiryApi';
import { getAdminAppointmentsApi } from '../api/appointmentApi';
import { getAdminGalleryApi } from '../api/galleryApi';
import { getAdminBlogsApi } from '../api/blogApi';
import { getAdminClinicsApi } from '../api/clinicApi';
import { isLoggedIn } from '../utils/auth';

const AdminDataContext = createContext();

export const AdminDataProvider = ({ children }) => {
  const authenticated = isLoggedIn();
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [blogs, setBlogs] = useState([]);

  const deduplicateClinics = (list) => {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter(item => {
      if (!item) return false;
      const raw = (item.name || item.title || '').trim().toLowerCase();
      let key = raw;
      if (raw.includes('rudraksh')) key = 'rudraksh';
      else if (raw.includes('shilpi')) key = 'shilpi';
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const [clinics, setClinics] = useState([]);

  const [appointments, setAppointments] = useState([]);

  const [enquiries, setEnquiries] = useState([]);

  const [stats, setStats] = useState({
    enquiries: { count: 0 },
    appointments: { count: 0 },
    testimonials: { count: 0 },
    treatments: { count: 0 },
    galleryImages: { count: 0 },
    blogs: { count: 0 }
  });

  // Keep stats in sync with dynamic arrays
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      enquiries: { ...prev.enquiries, count: enquiries.length },
      appointments: { ...prev.appointments, count: appointments.length },
      galleryImages: { ...prev.galleryImages, count: galleryItems.length },
      blogs: { ...prev.blogs, count: blogs.length }
    }));
  }, [enquiries.length, appointments.length, galleryItems.length, blogs.length]);

  // Fetch real contact enquiries, gallery & blogs from backend API
  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const res = await getAdminEnquiriesApi();
      if (res && res.data) {
        const items = res.data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setEnquiries(items);
      }
    } catch (err) {
      console.warn('Backend enquiry fetch offline or error, using default state:', err.message);
    } finally {
      setLoadingEnquiries(false);
    }

    // Appointments: sirf backend se, localStorage nahi
    try {
      const aptRes = await getAdminAppointmentsApi();
      if (aptRes && aptRes.data && Array.isArray(aptRes.data)) {
        const items = aptRes.data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setAppointments(items);
      }
    } catch (err) {
      console.warn('Backend appointment fetch offline or error:', err.message);
    }

    try {
      const galRes = await getAdminGalleryApi();
      if (galRes && galRes.data) {
        setGalleryItems(galRes.data);
      }
    } catch (err) {
      console.warn('Backend gallery fetch offline or error:', err.message);
    }

    try {
      const blogRes = await getAdminBlogsApi();
      if (blogRes && blogRes.data) {
        setBlogs(blogRes.data);
      }
    } catch (err) {
      console.warn('Backend blog fetch offline or error:', err.message);
    }

    try {
      const clinicRes = await getAdminClinicsApi();
      if (clinicRes && Array.isArray(clinicRes.data)) {
        const items = deduplicateClinics(clinicRes.data.map(c => ({
          ...c,
          id: c._id || c.id || c.clinicId
        })));
        setClinics(items);
      }
    } catch (err) {
      console.warn('Backend clinic fetch offline or error:', err.message);
    }
  };

  // Real-time synchronization (sirf enquiries ke liye, appointments localStorage se nahi)
  const syncLocalStorageData = () => {
    try {
      // Contact Enquiries submitted from website
      const localEnqStr = localStorage.getItem('dr_vinish_enquiries');
      if (localEnqStr) {
        const localEnq = JSON.parse(localEnqStr);
        if (Array.isArray(localEnq) && localEnq.length > 0) {
          setEnquiries(prev => {
            const existingIds = new Set(prev.map(e => String(e.id || e._id)));
            const newItems = localEnq.filter(e => !existingIds.has(String(e.id || e._id)));
            return newItems.length > 0 ? [...newItems, ...prev] : prev;
          });
        }
      }

      // Appointments: localStorage se sync hata diya
    } catch (err) {
      console.warn('Sync local data error:', err.message);
    }
  };

  useEffect(() => {
    syncLocalStorageData();
    window.addEventListener('storage', syncLocalStorageData);
    const interval = setInterval(syncLocalStorageData, 2000);
    return () => {
      window.removeEventListener('storage', syncLocalStorageData);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchEnquiries();
    } else {
      setEnquiries([]);
      setStats(prev => ({
        ...prev,
        enquiries: { ...prev.enquiries, count: 0 }
      }));
    }
  }, []);

  const [testimonials, setTestimonials] = useState([]);
  const [chartData] = useState([]);
  const [services, setServices] = useState([]);

  // addAppointment: ab localStorage nahi, sirf state
  const addAppointment = (newApt) => {
    const foundClinic = clinics.find(c => String(c._id || c.id) === String(newApt.clinic));
    const savedAppointment = {
      ...newApt,
      id: newApt._id || newApt.id || ('APT-' + Date.now()),
      source: newApt.source || 'Manual',
      clinic: foundClinic?.name || foundClinic?._id || newApt.clinic
    };

    setAppointments(prev => [
      savedAppointment,
      ...prev.filter(item => String(item._id || item.id) !== String(savedAppointment._id || savedAppointment.id))
    ]);

    return savedAppointment;
  };

  // addOpdRecord: ab localStorage nahi, sirf state
  const addOpdRecord = (newRecord) => {
    setAppointments(prev => [newRecord, ...prev]);
  };

  // updateAppointmentStatus: ab localStorage nahi, sirf state
  const updateAppointmentStatus = (id, newStatus, extraFields = {}) => {
    setAppointments(prev =>
      prev.map(item => {
        if (String(item.id) === String(id) || String(item._id) === String(id)) {
          return { ...item, ...extraFields, status: newStatus };
        }
        return item;
      })
    );
  };

  // deleteAppointment: ab localStorage nahi, sirf state
  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(item => item.id !== id && item._id !== id));
  };

  const updateEnquiryStatus = (id, newStatus) => {
    const realId = id._id || id;
    setEnquiries(prev => prev.map(item => (item.id === realId || item._id === realId) ? { ...item, status: newStatus } : item));
  };

  const deleteEnquiry = (id) => {
    const realId = id._id || id;
    setEnquiries(prev => prev.filter(item => item.id !== realId && item._id !== realId));
    setStats(prev => ({
      ...prev,
      enquiries: { ...prev.enquiries, count: Math.max(0, prev.enquiries.count - 1) }
    }));
  };

  const toggleTestimonialApproval = (id) => {
    setTestimonials(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'Approved' ? 'Pending' : 'Approved' } : item));
  };

  const deleteTestimonial = (id) => {
    setTestimonials(prev => prev.filter(item => item.id !== id));
  };

  // Services CRUD handlers
  const addService = (newService) => {
    setServices(prev => [newService, ...prev]);
  };

  const updateService = (id, updatedFields) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const toggleServiceStatus = (id) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Clinics are fetched from the backend; these handlers keep the UI in sync with API results.
  const addClinic = (newClinic) => {
    const clinicWithId = {
      ...newClinic,
      id: Date.now(),
      active: true
    };
    setClinics(prev => [...prev, clinicWithId]);
  };

  const updateClinic = (id, updatedFields) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const toggleClinicStatus = (id) => {
    setClinics(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const deleteClinic = (id) => {
    setClinics(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AdminDataContext.Provider value={{
      stats,
      appointments,
      enquiries,
      testimonials,
      chartData,
      services,
      clinics,
      galleryItems,
      blogs,
      loadingEnquiries,
      fetchEnquiries,
      addAppointment,
      addOpdRecord,
      updateAppointmentStatus,
      deleteAppointment,
      updateEnquiryStatus,
      deleteEnquiry,
      toggleTestimonialApproval,
      deleteTestimonial,
      addService,
      updateService,
      toggleServiceStatus,
      deleteService,
      addClinic,
      updateClinic,
      toggleClinicStatus,
      deleteClinic
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => useContext(AdminDataContext);