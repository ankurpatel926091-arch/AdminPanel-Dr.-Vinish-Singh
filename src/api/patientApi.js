import API from './axios';

// Get all real patients aggregated from database
export const getPatientsApi = async () => {
  try {
    const res = await API.get('/admin/patients');
    if (res?.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res?.data)) {
      return res.data;
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
