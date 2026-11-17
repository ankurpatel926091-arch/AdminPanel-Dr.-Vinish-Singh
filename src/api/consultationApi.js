import API from './axios';

// Create or update consultation (Draft or Completed)
export const saveConsultationApi = async (consultationData) => {
  try {
    const res = await API.post('/consultations', consultationData);
    return res?.data || { success: false };
  } catch (error) {
    console.error('Save Consultation API Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// Get all consultations (for Medical Records & History)
export const getConsultationsApi = async () => {
  try {
    const res = await API.get('/consultations');
    if (res?.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error('Get Consultations API Error:', error);
    return [];
  }
};

// Get consultation history for a specific patient
export const getPatientConsultationsApi = async (patientId) => {
  try {
    if (!patientId) return [];
    const res = await API.get(`/consultations/patient/${encodeURIComponent(patientId)}`);
    if (res?.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error('Get Patient Consultations API Error:', error);
    return [];
  }
};

// Get single consultation by record key / patient
export const getConsultationByRecordKeyApi = async (recordKey) => {
  try {
    if (!recordKey) return null;
    const res = await API.get(`/consultations/patient/${encodeURIComponent(recordKey)}`);
    if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data.find((r) => r.recordKey === recordKey) || res.data.data[0];
    }
    return null;
  } catch (error) {
    return null;
  }
};
