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
  else if (['missed', 'no_show', 'no show'].includes(sourceStatus)) status = 'NO_SHOW';
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

export const getStaticCheckInAppointments = (fallbackAppointments) => {
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
  const standaloneCheckIns = savedCheckIns.filter(
    (appointment) => !adminIds.has(getAppointmentId(appointment))
  );

  if (!savedCheckIns.length && !adminAppointments.length) {
    return fallbackAppointments.map(toCheckInAppointment);
  }

  return [...mappedAdminAppointments, ...standaloneCheckIns];
};

export const saveCheckInAppointments = (appointments) => {
  localStorage.setItem(CHECK_IN_APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));

  const appointmentById = new Map(
    appointments.map((appointment) => [getAppointmentId(appointment), appointment])
  );
  const savedAppointments = readArray(APPOINTMENTS_STORAGE_KEY).map((appointment) => {
    const checkIn = appointmentById.get(getAppointmentId(appointment));
    if (!checkIn) return appointment;

    const updatedAppointment = {
      ...appointment,
      visitId: checkIn.visitId,
      tokenNumber: checkIn.tokenNumber,
      checkInAt: checkIn.checkInAt,
      checkedInBy: checkIn.checkedInBy,
    };
    if (['CHECKED_IN', 'COMPLETED'].includes(checkIn.status)) {
      updatedAppointment.checkInStatus = checkIn.status;
    } else {
      delete updatedAppointment.checkInStatus;
    }
    return updatedAppointment;
  });

  if (savedAppointments.length) {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(savedAppointments));
  }
  window.dispatchEvent(new Event('storage'));
};

export const readStoredArray = readArray;

export const saveQueue = (queue) => {
  const serialized = JSON.stringify(queue);
  localStorage.setItem(DOCTOR_QUEUE_STORAGE_KEY, serialized);
  localStorage.setItem(SHARED_QUEUE_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event('storage'));
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
  if (!key) return;

  const appointments = readArray(APPOINTMENTS_STORAGE_KEY).map((appointment) =>
    getAppointmentId(appointment) === key
      ? { ...appointment, status: 'Visited', checkInStatus: 'COMPLETED' }
      : appointment
  );
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));

  const checkIns = readArray(CHECK_IN_APPOINTMENTS_STORAGE_KEY).map((appointment) =>
    getAppointmentId(appointment) === key
      ? { ...appointment, status: 'COMPLETED' }
      : appointment
  );
  localStorage.setItem(CHECK_IN_APPOINTMENTS_STORAGE_KEY, JSON.stringify(checkIns));
  window.dispatchEvent(new Event('storage'));
};
