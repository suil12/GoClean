const {
  getAvailabilityMessage,
  getAvailableSlotsForDate,
  loadAvailability,
  timeSlots,
} = require('./availability');
const { loadReservations } = require('./reservations');

exports.handler = async (event) => {
  const date = String(event.queryStringParameters?.date || '').trim();
  const availability = await loadAvailability();
  const reservations = await loadReservations();
  const bookedSlots = date
    ? reservations.filter((reservation) => reservation.date === date).map((reservation) => reservation.time)
    : [];
  const slots = date ? getAvailableSlotsForDate(date, availability, bookedSlots) : timeSlots;
  const message = date ? getAvailabilityMessage(date, availability, slots) : '';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ slots, message }),
  };
};
