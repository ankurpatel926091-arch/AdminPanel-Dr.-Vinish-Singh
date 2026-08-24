import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminEnquiriesApi, updateEnquiryStatusApi, deleteEnquiryApi } from '../services/enquiryService';

const AdminDataContext = createContext();

export const AdminDataProvider = ({ children }) => {
  const [stats, setStats] = useState({
    enquiries: { count: 0, change: '+12%', isPositive: true },
    appointments: { count: 12, change: '+8%', isPositive: true },
    testimonials: { count: 18, change: '+15%', isPositive: true },
    treatments: { count: 12, change: 'No change', isNeutral: true },
    galleryImages: { count: 36, change: '+5%', isPositive: true }
  });

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: 'Rahul Verma',
      phone: '9876543210',
      centre: '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 01 PM)',
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
      centre: '🌅 Morning OPD: Rudraksh IVF & Urology Centre (Sharda Nagar, 10 AM - 01 PM)',
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
    }
  ]);

  const [enquiries, setEnquiries] = useState([]);

  // Fetch real contact enquiries from backend API
  const fetchEnquiries = async () => {
    try {
      const res = await getAdminEnquiriesApi();
      if (res && res.data) {
        const items = res.data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setEnquiries(items);
        setStats(prev => ({
          ...prev,
          enquiries: { ...prev.enquiries, count: items.length }
        }));
      }
    } catch (err) {
      console.warn('Backend enquiry fetch offline or error, using default state:', err.message);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

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
