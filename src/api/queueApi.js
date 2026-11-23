import API from './axios';

// Get today's doctor queue
export const getTodayQueueApi = async (params = {}) => {
  try {
    const res = await API.get('/queue/today', { params });
    if (res?.data) {
      if (Array.isArray(res.data.data)) return res.data.data;
      if (Array.isArray(res.data)) return res.data;
    }
    return [];
  } catch (error) {
    console.error('Fetch Today Queue Error:', error);
    return [];
  }
};

// Add patient to doctor queue
export const addToQueueApi = async (queueData) => {
  try {
    const res = await API.post('/queue/add', queueData);
    return res?.data || { success: false };
  } catch (error) {
    console.error('Add to Queue Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// Update patient status in queue (Waiting, Consulting, Completed, Skipped)
export const updateQueueStatusApi = async (id, statusData) => {
  try {
    const payload = typeof statusData === 'string' ? { status: statusData } : statusData;
    const res = await API.patch(`/queue/${id}/status`, payload);
    return res?.data || { success: false };
  } catch (error) {
    console.error('Update Queue Status Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// Call next waiting patient to consultation
export const callNextPatientApi = async () => {
  try {
    const res = await API.post('/queue/call-next');
    return res?.data || { success: false };
  } catch (error) {
    console.error('Call Next Patient Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// Remove patient from queue
export const deleteQueueItemApi = async (id) => {
  try {
    const res = await API.delete(`/queue/${id}`);
    return res?.data || { success: false };
  } catch (error) {
    console.error('Delete Queue Item Error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

