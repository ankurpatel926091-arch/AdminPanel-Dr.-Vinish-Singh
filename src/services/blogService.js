import API from '../api/axios';

// Get all blogs for Admin panel (including drafts)
export const getAdminBlogsApi = async () => {
  const response = await API.get('/blogs/admin/all');
  return response.data;
};

// Create new blog
export const createBlogApi = async (blogData) => {
  const response = await API.post('/blogs/admin', blogData);
  return response.data;
};

// Update existing blog
export const updateBlogApi = async (id, blogData) => {
  const response = await API.put(`/blogs/admin/${id}`, blogData);
  return response.data;
};

// Delete blog
export const deleteBlogApi = async (id) => {
  const response = await API.delete(`/blogs/admin/${id}`);
  return response.data;
};

// Toggle blog status (Draft <-> Published)
export const toggleBlogStatusApi = async (id) => {
  const response = await API.patch(`/blogs/admin/${id}/status`);
  return response.data;
};
