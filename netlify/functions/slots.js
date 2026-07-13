const { availableSlotsForDate, timeSlots } = require('./availability');

exports.handler = async (event) => {
  const date = String(event.queryStringParameters?.date || '').trim();
  const slots = date ? availableSlotsForDate(date) : timeSlots;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ slots }),
  };
};
