import API from '../api/axios';

export const loginAdmin = async (email, password) => {
  const response = await API.post('/admin/login', { email, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await API.get('/admin/me');
  return response.data;
};

export const logoutAdmin = async () => {
  try {
    const response = await API.post('/admin/logout');
    return response.data;
  } catch (error) {
    // Even if backend fails, client will clear token
    return { success: true };
  }
};
