import { updateAppointmentStatusApi } from '../api/appointmentApi';

export const APPOINTMENTS_STORAGE_KEY = 'dr_vinish_appointments';
export const CHECK_IN_APPOINTMENTS_STORAGE_KEY = 'dr_vinish_checkin_appointments';
export const DOCTOR_QUEUE_STORAGE_KEY = 'dr_vinish_doctor_queue';
export const SHARED_QUEUE_STORAGE_KEY = 'dr_vinish_queue';
export const CONSULTATIONS_STORAGE_KEY = 'dr_vinish_consultations';
export const CURRENT_CONSULTATION_STORAGE_KEY = 'dr_vinish_current_consultation_patient';

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`Unable to read ${key} from local storage:`, error);
    return [];
  }
};

const getAppointmentId = (appointment) =>
  String(appointment.appointmentId || appointment._id || appointment.id || '');

export const toCheckInAppointment = (appointment, index = 0) => {
  const rawId = getAppointmentId(appointment);
  const clinicName =
    typeof appointment.clinic === 'object'
      ? appointment.clinic?.name
      : appointment.clinic || appointment.centre || appointment.hospital || '';
  const appointmentStatus = String(appointment.status || '').toLowerCase();
  const sourceStatus = String(
    ['cancelled', 'canceled', 'missed', 'no_show', 'no show', 'visited'].includes(appointmentStatus)
      ? appointment.status
      : appointment.checkInStatus || appointment.status || 'Pending'
  ).toLowerCase();
  let status = 'PENDING';

  if (['cancelled', 'canceled'].includes(sourceStatus)) status = 'CANCELLED';
  else if (['missed', 'no_show', 'no show'].includes(sourceStatus)) status = 'MISSED';
  else if (['visited', 'completed', 'consultation_completed'].includes(sourceStatus)) status = 'COMPLETED';
  else if (
    ['checked_in', 'checked-in'].includes(sourceStatus) ||
    appointment.visitId ||
    appointment.tokenNumber
  ) {
    status = 'CHECKED_IN';
  } else if (['confirmed', 'active'].includes(sourceStatus)) status = 'CONFIRMED';

  const identityDigits = String(appointment.phone || appointment.mobile || rawId)
    .replace(/\D/g, '')
    .slice(-5);

  return {
    ...appointment,
    appointmentId: rawId || `APT-DEMO-${index + 1}`,
    patientId: appointment.patientId || `UHID-${identityDigits || String(index + 1).padStart(5, '0')}`,
    patientName: appointment.patientName || appointment.name || 'Patient',
    age: appointment.age ?? '',
    gender: appointment.gender || 'Not provided',
    mobile: appointment.mobile || appointment.phone || '',
    doctorName: appointment.doctorName || appointment.doctor || 'Dr. Vinish Kumar Singh',
    department: appointment.department || appointment.problem || appointment.speciality || 'Urology',
    clinic: clinicName || 'Rudraksh IVF & Urology Centre',
    appointmentDate: appointment.appointmentDate || appointment.date || '',
    appointmentTime: appointment.appointmentTime || appointment.time || '11:00 AM',
    status,
    visitId: appointment.visitId || null,
    tokenNumber: appointment.tokenNumber || null,
    checkInAt: appointment.checkInAt || null,
    checkedInBy: appointment.checkedInBy || null,
  };
};

export const getStaticCheckInAppointments = (fallbackAppointments = []) => {
  const savedCheckIns = readArray(CHECK_IN_APPOINTMENTS_STORAGE_KEY);
  const adminAppointments = readArray(APPOINTMENTS_STORAGE_KEY);
  const savedById = new Map(
    savedCheckIns.map((appointment) => [getAppointmentId(appointment), appointment])
  );
  const mappedAdminAppointments = adminAppointments.map((appointment, index) => {
    const mapped = toCheckInAppointment(appointment, index);
    return { ...mapped, ...savedById.get(mapped.appointmentId) };
  });
  const adminIds = new Set(mappedAdminAppointments.map(getAppointmentId));

  // Purge any legacy dummy/mock static demo records
  const mockNames = ['Rahul Sharma', 'Priya Verma', 'Suresh Kumar', 'Mohit Singh', 'Amit Gupta', 'Vikas Singh'];
  const standaloneCheckIns = savedCheckIns.filter((appointment) => {
    const rawId = String(getAppointmentId(appointment) || '');
    const name = String(appointment.patientName || appointment.name || '');
    if (adminIds.has(rawId)) return false;
    if (rawId.startsWith('APT-100') || rawId.startsWith('APT-DEMO')) return false;
    if (mockNames.includes(name)) return false;
    return true;
  });

  if (!savedCheckIns.length && !adminAppointments.length && Array.isArray(fallbackAppointments) && fallbackAppointments.length > 0) {
    return fallbackAppointments.map(toCheckInAppointment);
  }

  return [...mappedAdminAppointments, ...standaloneCheckIns];
};

export const saveCheckInAppointments = (_appointments) => {
  // Deprecated: Check-ins are now managed directly in MongoDB via checkInAppointmentApi
};

export const readStoredArray = readArray;

export const saveQueue = (_queue) => {
  // Deprecated: Queue state now stored and synchronized directly via MongoDB API
};

export const normalizeQueueItem = (item) => ({
  ...item,
  id: String(
    item.id ||
      item.appointmentId ||
      item.visitId ||
      `Q-${item.tokenNumber || item.patientId || "unknown"}`
  ),
  appointmentId: item.appointmentId || '',
  patientId: item.patientId || '',
  patientName: item.patientName || item.name || 'Patient',
  age: item.age ?? '',
  gender: item.gender || 'Not provided',
  mobile: item.mobile || item.phone || '',
  tokenNumber: item.tokenNumber
    ? String(item.tokenNumber).startsWith('T-')
      ? String(item.tokenNumber)
      : `T-${String(item.tokenNumber).padStart(3, '0')}`
    : 'T-000',
  status: String(item.status || 'WAITING')
    .trim()
    .toUpperCase()
    .replace(/[ -]+/g, '_'),
  priority: String(item.priority || 'NORMAL').toUpperCase(),
  clinic: item.clinic || 'Rudraksh IVF & Urology Centre',
  checkInTime: item.checkInTime || item.checkInAt || '',
});

export const markAppointmentVisited = (appointmentId) => {
  const key = String(appointmentId || '');
  if (!key || key.startsWith('APT-DEMO')) return;

  // Persist directly to MongoDB
  updateAppointmentStatusApi(key, 'Visited').catch((err) =>
    console.warn('Update appointment status API:', err.message)
  );
};
