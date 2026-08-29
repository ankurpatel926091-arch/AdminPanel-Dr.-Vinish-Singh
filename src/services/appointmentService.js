import API from '../api/axios';

// Get all appointments for Admin Panel
export const getAdminAppointmentsApi = async () => {
  const response = await API.get('/appointments/admin/all');
  return response.data;
};

// Update appointment status ('Pending', 'Confirmed', 'Missed', 'Cancelled')
export const updateAppointmentStatusApi = async (id, status) => {
  const response = await API.patch(`/appointments/admin/${id}/status`, { status });
  return response.data;
};

// Delete appointment
export const deleteAppointmentApi = async (id) => {
  const response = await API.delete(`/appointments/admin/${id}`);
  return response.data;
};
