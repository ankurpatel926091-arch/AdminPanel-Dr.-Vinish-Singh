import API from './axios';

// Get all appointments for Admin Panel
export const getAdminAppointmentsApi = async () => {
  try {
    const response = await API.get('/appointments/admin/all');
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Fallback for deployed servers without /admin/all
      const fallback = await API.get('/appointments/public/confirmed-slots');
      return fallback.data;
    }
    throw error;
  }
};

// Create an appointment from the Admin Panel
export const createAdminAppointmentApi = async (appointment) => {
  try {
    const response = await API.post('/appointments/admin', appointment);
    return response.data;
  } catch (error) {
    // If /appointments/admin is not yet deployed on the remote server (404),
    // fallback to standard /appointments endpoint
    if (error.response && (error.response.status === 404 || error.response.status === 405)) {
      const fallback = await API.post('/appointments', appointment);
      if (fallback?.data && appointment.status && appointment.status !== 'Pending') {
        const aptId = fallback.data._id || fallback.data.id;
        if (aptId) {
          try {
            await API.patch(`/appointments/admin/${aptId}/status`, { status: appointment.status });
            fallback.data.status = appointment.status;
          } catch (e) {
            fallback.data.status = appointment.status;
          }
        }
      }
      return fallback.data;
    }
    throw error;
  }
};

// Update appointment status ('Pending', 'Confirmed', 'Missed', 'Cancelled', 'Checked-in', 'Visited')
export const updateAppointmentStatusApi = async (id, status, appointmentData = null) => {
  try {
    const response = await API.patch(`/appointments/admin/${id}/status`, { status, appointment: appointmentData });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Notify appointment status email via Nodemailer
export const notifyAppointmentEmailApi = async (appointment, status) => {
  try {
    const response = await API.post('/appointments/notify-email', { appointment, status });
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

// Delete appointment
export const deleteAppointmentApi = async (id) => {
  try {
    const response = await API.delete(`/appointments/admin/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
