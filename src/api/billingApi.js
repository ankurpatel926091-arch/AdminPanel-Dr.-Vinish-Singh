import API from './axios';

const BILLS_STORAGE_KEY = 'dr_vinish_bills';

// Fetch all OPD bills (from backend API or local storage fallback)
export const getAdminBillsApi = async () => {
  try {
    const res = await API.get('/billing/admin/all');
    if (res?.data && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (error) {
    // If backend route is not mounted yet, fallback to persistent local storage
  }

  try {
    const stored = localStorage.getItem(BILLS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Unable to read bills from local storage', e);
  }

  return [];
};

// Create a new OPD Bill
export const createAdminBillApi = async (billData) => {
  try {
    const res = await API.post('/billing/admin', billData);
    if (res?.data) return res.data;
  } catch (error) {
    // Fallback: save to localStorage list
  }

  try {
    const currentBills = JSON.parse(localStorage.getItem(BILLS_STORAGE_KEY) || '[]');
    const updatedBills = [billData, ...currentBills];
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
    window.dispatchEvent(new Event('storage'));
    return { success: true, data: billData };
  } catch (e) {
    console.warn('Fallback bill save error', e);
    return { success: false, data: billData };
  }
};

// Update an existing OPD Bill
export const updateAdminBillApi = async (billId, updatedFields) => {
  try {
    const res = await API.put(`/billing/admin/${billId}`, updatedFields);
    if (res?.data) return res.data;
  } catch (error) {
    // Fallback
  }

  try {
    const currentBills = JSON.parse(localStorage.getItem(BILLS_STORAGE_KEY) || '[]');
    const updatedBills = currentBills.map((b) => (b.billId === billId ? { ...b, ...updatedFields } : b));
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(updatedBills));
    window.dispatchEvent(new Event('storage'));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

