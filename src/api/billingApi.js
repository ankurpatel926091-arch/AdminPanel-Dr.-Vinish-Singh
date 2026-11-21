import API from './axios';

// Fetch all OPD bills from MongoDB database via backend API (supports server-side pagination & filters)
export const getAdminBillsApi = async (filters = {}) => {
  try {
    const params = {};
    if (filters.search && String(filters.search).trim()) {
      params.search = String(filters.search).trim();
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'All') {
      params.paymentStatus = filters.paymentStatus;
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters.date) {
      params.date = filters.date;
    }

    const res = await API.get('/billing/admin/all', { params });
    return res?.data || { success: false, data: [] };
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

// Fetch Day-by-Day Historical Collections Summary (Cash vs UPI vs Total)
export const getDailyCollectionSummaryApi = async (days = 30) => {
  try {
    const res = await API.get('/billing/admin/daily-summary', { params: { days } });
    return res?.data || { success: false, data: [] };
  } catch (error) {
    console.error('Fetch Daily Collection Summary Error:', error);
    return { success: false, data: [] };
  }
};
