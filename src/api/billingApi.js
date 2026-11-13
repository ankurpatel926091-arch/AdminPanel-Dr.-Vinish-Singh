import API from './axios';

// Fetch all OPD bills from MongoDB database via backend API
export const getAdminBillsApi = async () => {
  try {
    const res = await API.get('/billing/admin/all');
    if (res?.data) {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.data)) return res.data.data;
    }
    return [];
  } catch (error) {
    console.error('Fetch Admin Bills Error:', error);
    return [];
  }
};

// Create a new OPD Bill in MongoDB
export const createAdminBillApi = async (billData) => {
  try {
    const res = await API.post('/billing/admin', billData);
    if (res?.data) {
      return res.data;
    }
    return { success: false, message: 'No response data from server' };
  } catch (error) {
    console.error('Create Admin Bill Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// Update an existing OPD Bill in MongoDB
export const updateAdminBillApi = async (billId, updatedFields) => {
  try {
    const res = await API.put(`/billing/admin/${billId}`, updatedFields);
    if (res?.data) {
      return res.data;
    }
    return { success: false, message: 'No response data from server' };
  } catch (error) {
    console.error('Update Admin Bill Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// Delete an OPD Bill from MongoDB
export const deleteAdminBillApi = async (billId) => {
  try {
    const res = await API.delete(`/billing/admin/${billId}`);
    return res.data;
  } catch (error) {
    console.error('Delete Admin Bill Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};
