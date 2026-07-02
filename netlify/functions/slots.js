const timeSlots = Array.from({ length: 8 }, (_, index) => {
  const hour = 9 + index;
  return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 3).padStart(2, '0')}:00`;
});

exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify({ slots: timeSlots }),
});

