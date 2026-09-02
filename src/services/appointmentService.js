import API from '../api/axios';

// Get all appointments for Admin Panel
export const getAdminAppointmentsApi = async () => {
  const response = await API.get('/appointments/admin/all');
  return response.data;
};

// Update appointment status ('Pending', 'Confirmed', 'Missed', 'Cancelled')
export const updateAppointmentStatusApi = async (id, status, appointmentData = null) => {
  const response = await API.patch(`/appointments/admin/${id}/status`, { status, appointment: appointmentData });
  return response.data;
};

// Notify appointment status email via Nodemailer
export const notifyAppointmentEmailApi = async (appointment, status) => {
  const response = await API.post('/appointments/notify-email', { appointment, status });
  return response.data;
};

// Delete appointment
export const deleteAppointmentApi = async (id) => {
  const response = await API.delete(`/appointments/admin/${id}`);
  return response.data;
};
