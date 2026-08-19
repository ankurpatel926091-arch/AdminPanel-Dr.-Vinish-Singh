import API from '../api/axios';

// Get all gallery items for Admin panel
export const getAdminGalleryApi = async () => {
  const response = await API.get('/gallery/admin/all');
  return response.data;
};

// Upload new media (file upload via FormData or URL via JSON)
export const uploadGalleryMediaApi = async (formDataOrData) => {
  const isFormData = formDataOrData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await API.post('/gallery/admin/upload', formDataOrData, config);
  return response.data;
};

// Toggle active/inactive status
export const toggleGalleryStatusApi = async (id) => {
  const response = await API.patch(`/gallery/admin/${id}/toggle`);
  return response.data;
};

// Delete gallery item
export const deleteGalleryItemApi = async (id) => {
  const response = await API.delete(`/gallery/admin/${id}`);
  return response.data;
};
