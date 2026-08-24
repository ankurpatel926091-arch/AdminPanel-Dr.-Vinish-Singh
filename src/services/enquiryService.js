import API from '../api/axios';

// Get all contact enquiries for Admin Panel
export const getAdminEnquiriesApi = async () => {
  const response = await API.get('/enquiries/admin/all');
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
