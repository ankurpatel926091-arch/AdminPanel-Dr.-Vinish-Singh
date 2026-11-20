import API from './axios';

// Get all contact enquiries for Admin Panel (supports server-side pagination & search)
export const getAdminEnquiriesApi = async (params = {}) => {
  const response = await API.get('/enquiries/admin/all', { params });
  return response.data;
};

// Update enquiry status ('Read', 'Replied')
export const updateEnquiryStatusApi = async (id, status) => {
  const response = await API.patch(`/enquiries/admin/${id}/status`, { status });
  return response.data;
};

// Delete enquiry
export const deleteEnquiryApi = async (id) => {
  const response = await API.delete(`/enquiries/admin/${id}`);
  return response.data;
};

