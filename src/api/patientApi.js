import API from './axios';

// Get all real patients aggregated from database (supports server-side pagination & filters)
export const getPatientsApi = async (filters = {}) => {
  try {
    const params = {};
    if (filters.search && String(filters.search).trim()) {
      params.search = String(filters.search).trim();
    }
    if (filters.gender && filters.gender !== 'All') {
      params.gender = filters.gender;
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }

    const res = await API.get('/admin/patients', { params });
    if (res?.data) {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.data)) return res.data.data;
      if (res.data.data) return res.data;
    }
    return [];
  } catch (error) {
    console.error('Fetch Patients Error:', error);
    return [];
  }
};

// Register a new patient in database
export const registerPatientApi = async (patientData) => {
  try {
    const res = await API.post('/admin/patients', patientData);
    return res?.data || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Register Patient Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};
