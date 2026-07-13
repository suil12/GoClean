const {
  loadAvailability,
  saveAvailability,
  timeSlots,
} = require('./availability');
const {
  loadReservations,
  saveReservations,
} = require('./reservations');

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
}

function isAuthorized(event) {
  const expected = process.env.ADMIN_PASSWORD;
  const provided = event.headers['x-admin-password'] || event.headers['X-Admin-Password'];
  return Boolean(expected && provided && provided === expected);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (!process.env.ADMIN_PASSWORD) {
    return json(500, { message: 'Admin is not configured. Add ADMIN_PASSWORD in Netlify environment variables.' });
  }

  if (!isAuthorized(event)) {
    return json(401, { message: 'Wrong admin password.' });
  }

  try {
    if (event.httpMethod === 'GET') {
      const [availability, reservations] = await Promise.all([
        loadAvailability(),
        loadReservations(),
      ]);
      return json(200, { availability, reservations, timeSlots });
    }

    if (event.httpMethod !== 'POST') {
      return json(405, { message: 'Method not allowed.' });
    }

    const body = JSON.parse(event.body || '{}');

    if (body.action === 'saveAvailability') {
      const availability = await saveAvailability(body.availability || {});
      return json(200, { availability });
    }

    if (body.action === 'updateReservationStatus') {
      const reservations = await loadReservations();
      const updated = reservations.map((reservation) => (
        reservation.id === body.id
          ? { ...reservation, status: String(body.status || 'new'), updatedAt: new Date().toISOString() }
          : reservation
      ));
      await saveReservations(updated);
      return json(200, { reservations: updated });
    }

    if (body.action === 'deleteReservation') {
      const reservations = await loadReservations();
      const updated = reservations.filter((reservation) => reservation.id !== body.id);
      await saveReservations(updated);
      return json(200, { reservations: updated });
    }

    return json(400, { message: 'Unknown admin action.' });
  } catch (error) {
    console.error('Admin request failed:', error);
    return json(500, { message: 'Admin request failed.', error: String(error?.message || error) });
  }
};
