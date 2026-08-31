import API from '../api/axios';

export const getAdminClinicsApi = async () => {
  try {
    const response = await API.get('/clinics/admin');
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
};

export const createClinicApi = async (clinicData) => {
  try {
    const response = await API.post('/clinics/admin', clinicData);
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

export const updateClinicApi = async (id, updatedData) => {
  try {
    const response = await API.put(`/clinics/admin/${id}`, updatedData);
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

export const toggleClinicStatusApi = async (id) => {
  try {
    const response = await API.patch(`/clinics/admin/${id}/toggle`);
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

export const deleteClinicApi = async (id) => {
  try {
    const response = await API.delete(`/clinics/admin/${id}`);
    return response.data;
  } catch (error) {
    return { success: false };
  }
};
