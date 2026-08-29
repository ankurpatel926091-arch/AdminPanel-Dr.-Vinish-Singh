import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminEnquiriesApi, updateEnquiryStatusApi, deleteEnquiryApi } from '../services/enquiryService';
import { getAdminAppointmentsApi, updateAppointmentStatusApi, deleteAppointmentApi } from '../services/appointmentService';
import { getAdminGalleryApi } from '../services/galleryService';
import { getAdminBlogsApi } from '../services/blogService';
import { useAuth } from './AuthContext';

const AdminDataContext = createContext();

export const AdminDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [blogs, setBlogs] = useState([]);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: 'Rahul Verma',
      phone: '9876543210',
      centre: '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 03 PM)',
      problem: 'Laser Kidney Stones (RIRS / PCNL)',
      message: 'Severe left flank pain since yesterday night.',
      date: '20 May 2025',
      time: '11:20 AM',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Amit Kumar',
      phone: '9765432101',
      centre: '🌇 Afternoon OPD: Apollomedics Super Speciality Hospital (LDA Colony, 02 PM - 04 PM)',
      problem: 'Prostate Care & Enlargement (BPH / TURP)',
      message: 'Frequent night urination and weak stream.',
      date: '21 May 2025',
      time: '02:00 PM',
      status: 'Confirmed'
    },
    {
      id: 3,
      name: 'Neha Singh',
      phone: '9654321098',
      centre: '🌆 Evening OPD: Chandan Hospital (Faizabad Road, 05 PM - 07 PM)',
      problem: 'Urine Leakage & UTI Infection',
      message: 'Burning sensation and discomfort since 3 days.',
      date: '22 May 2025',
      time: '04:30 PM',
      status: 'Pending'
    },
    {
      id: 4,
      name: 'Pooja Sharma',
      phone: '9543210987',
      centre: '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 03 PM)',
      problem: 'Kidney Health Followup',
      message: 'Post surgery ultrasound report discussion.',
      date: '23 May 2025',
      time: '10:30 AM',
      status: 'Confirmed'
    },
    {
      id: 5,
      name: 'Vikas Yadav',
      phone: '9432109876',
      centre: '🌇 Afternoon OPD: Apollomedics Super Speciality Hospital (LDA Colony, 02 PM - 04 PM)',
      problem: 'General Urology Consultation',
      message: 'Routine checkup for kidney health.',
      date: '24 May 2025',
      time: '03:00 PM',
      status: 'Cancelled'
    },
    {
      id: 6,
      name: 'Sanjay Patel',
      phone: '9321098765',
      centre: '🌆 Evening OPD: Chandan Hospital (Faizabad Road, 05 PM - 07 PM)',
      problem: 'Kidney Stone Consultation',
      message: 'Evaluation for endoscopic stone treatment.',
      date: '25 May 2025',
      time: '12:15 PM',
      status: 'Missed'
    },
    {
      id: 7,
      name: 'Ankit Singh',
      phone: '9210987654',
      centre: '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 03 PM)',
      problem: 'Male Infertility Consultation',
      message: 'Andrology consultation and semen analysis review.',
      date: '26 May 2025',
      time: '01:45 PM',
      status: 'Pending'
    }
  ]);

  const [enquiries, setEnquiries] = useState([]);

  const [stats, setStats] = useState({
    enquiries: { count: 0, change: '+12%', isPositive: true },
    appointments: { count: appointments.length, change: '+8%', isPositive: true },
    testimonials: { count: 18, change: '+15%', isPositive: true },
    treatments: { count: 12, change: 'No change', isNeutral: true },
    galleryImages: { count: 36, change: '+5%', isPositive: true },
    blogs: { count: 24, change: '+10%', isPositive: true }
  });

  // Keep stats in sync with dynamic arrays
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      enquiries: { ...prev.enquiries, count: enquiries.length },
      appointments: { ...prev.appointments, count: appointments.length },
      galleryImages: { ...prev.galleryImages, count: galleryItems.length > 0 ? galleryItems.length : prev.galleryImages.count },
      blogs: { ...prev.blogs, count: blogs.length > 0 ? blogs.length : prev.blogs.count }
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

    try {
      const aptRes = await getAdminAppointmentsApi();
      if (aptRes && aptRes.data && aptRes.data.length > 0) {
        const items = aptRes.data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setAppointments(prev => {
          const existingIds = new Set(prev.map(a => String(a.id)));
          const newItems = items.filter(a => !existingIds.has(String(a.id)));
          return newItems.length > 0 ? [...newItems, ...prev] : prev;
        });
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
  };

  // Real-time synchronization of local appointments and enquiries submitted from website
  const syncLocalStorageData = () => {
    try {
      // 1. Appointments submitted from website
      const localAptsStr = localStorage.getItem('dr_vinish_appointments');
      if (localAptsStr) {
        const localApts = JSON.parse(localAptsStr);
        if (Array.isArray(localApts) && localApts.length > 0) {
          setAppointments(prev => {
            const existingIds = new Set(prev.map(a => String(a.id)));
            const newItems = localApts.filter(a => !existingIds.has(String(a.id)));
            return newItems.length > 0 ? [...newItems, ...prev] : prev;
          });
        }
      }

      // 2. Contact Enquiries submitted from website
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
    if (isAuthenticated) {
      fetchEnquiries();
    } else {
      setEnquiries([]);
      setStats(prev => ({
        ...prev,
        enquiries: { ...prev.enquiries, count: 0 }
      }));
    }
  }, [isAuthenticated]);

  const [testimonials, setTestimonials] = useState([
    { id: 1, name: 'Sandeep Gupta', rating: 5, text: 'Very good experience with Dr. Vinish Singh. He is very kind and treats patients with care.', status: 'Approved', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { id: 2, name: 'Asha Mishra', rating: 5, text: 'Excellent treatment and very professional approach.', status: 'Approved', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    { id: 3, name: 'Rohit Tiwari', rating: 5, text: 'Highly recommended doctor for urology related problems.', status: 'Approved', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' }
  ]);

  const [chartData] = useState([
    { date: '18 May', enquiries: 8 },
    { date: '25 May', enquiries: 14 },
    { date: '01 Jun', enquiries: 18 },
    { date: '08 Jun', enquiries: 22 },
    { date: '15 Jun', enquiries: 15 }
  ]);

  const [services, setServices] = useState([
    { 
      id: 1, 
      title: 'Kidney Stone Treatment', 
      subtitle: 'Laser Lithotripsy, RIRS & PCNL procedures.', 
      description: 'Stitchless laser surgery & endoscopic stone clearance procedures.', 
      icon: 'Stethoscope', 
      active: true,
      highlights: ['Stitchless Laser RIRS & PCNL for Kidney Stones', 'Bladder Stone & Ureteroscopic Surgery']
    },
    { 
      id: 2, 
      title: 'Prostate Care (BPH)', 
      subtitle: 'Advanced TURP & Laser prostate surgeries.', 
      description: 'HolEP laser prostatectomy and BPH urinary outflow restoration.', 
      icon: 'Shield', 
      active: true,
      highlights: ['HolEP Laser Prostatectomy for BPH', 'Prostate Enlargement Evaluation & TURP']
    },
    { 
      id: 3, 
      title: 'Laparoscopic Urology', 
      subtitle: 'Minimally invasive keyhole kidney surgeries.', 
      description: 'Keyhole surgical repair for kidney obstruction, pyeloplasty and tumors.', 
      icon: 'Scissors', 
      active: true,
      highlights: ['Keyhole Kidney Surgery & Pyeloplasty', 'Laparoscopic Nephrectomy']
    },
    { 
      id: 4, 
      title: 'Andrology & Male Infertility', 
      subtitle: 'Microscopic varicocelectomy & erectile dysfunction.', 
      description: 'Evidence-based male reproductive wellness and microscopic surgeries.', 
      icon: 'Activity', 
      active: true,
      highlights: ['Male Infertility Evaluation & Micro-TESE', 'Microscopic Varicocelectomy & Erectile Health']
    }
  ]);

  const addAppointment = (newApt) => {
    setAppointments(prev => [newApt, ...prev]);
    setStats(prev => ({
      ...prev,
      appointments: { ...prev.appointments, count: prev.appointments.count + 1 }
    }));
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(item => item.id !== id));
  };

  const updateEnquiryStatus = async (id, newStatus) => {
    const realId = id._id || id;
    setEnquiries(prev => prev.map(item => (item.id === realId || item._id === realId) ? { ...item, status: newStatus } : item));

    try {
      if (typeof realId === 'string' && realId.length === 24) {
        await updateEnquiryStatusApi(realId, newStatus);
      }
    } catch (err) {
      console.error('Error updating enquiry status:', err.message);
    }
  };

  const deleteEnquiry = async (id) => {
    const realId = id._id || id;
    setEnquiries(prev => prev.filter(item => item.id !== realId && item._id !== realId));
    setStats(prev => ({
      ...prev,
      enquiries: { ...prev.enquiries, count: Math.max(0, prev.enquiries.count - 1) }
    }));

    try {
      if (typeof realId === 'string' && realId.length === 24) {
        await deleteEnquiryApi(realId);
      }
    } catch (err) {
      console.error('Error deleting enquiry:', err.message);
    }
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

  return (
    <AdminDataContext.Provider value={{
      stats,
      appointments,
      enquiries,
      testimonials,
      chartData,
      services,
      galleryItems,
      blogs,
      loadingEnquiries,
      fetchEnquiries,
      addAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      updateEnquiryStatus,
      deleteEnquiry,
      toggleTestimonialApproval,
      deleteTestimonial,
      addService,
      updateService,
      toggleServiceStatus,
      deleteService
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => useContext(AdminDataContext);
