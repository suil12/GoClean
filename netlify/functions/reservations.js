const { readJson, writeJson } = require('./storage');

function normalizeReservations(value) {
  return Array.isArray(value) ? value : [];
}

async function loadReservations() {
  return normalizeReservations(await readJson('reservations', []));
}

async function saveReservations(reservations) {
  const normalized = normalizeReservations(reservations);
  await writeJson('reservations', normalized);
  return normalized;
}

async function addReservation(booking) {
  const reservations = await loadReservations();
  const reservation = {
    id: booking.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: booking.status || 'new',
    ...booking,
  };
  reservations.unshift(reservation);
  await saveReservations(reservations.slice(0, 500));
  return reservation;
}

module.exports = {
  loadReservations,
  saveReservations,
  addReservation,
};
