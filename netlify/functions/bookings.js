const REQUIRED_FIELDS = [
  'service',
  'serviceType',
  'carSize',
  'date',
  'time',
  'name',
  'phone',
  'email',
  'address',
];

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

function clean(value) {
  return String(value || '').trim();
}

function formatBookingText(booking) {
  return [
    'New GoClean Lux booking request',
    '',
    'BOOKING',
    `Service booked: ${booking.service || 'N/A'}`,
    `Package / type of detailing: ${booking.serviceType || 'N/A'}`,
    `Vehicle size: ${booking.carSize || 'N/A'}`,
    `Date: ${booking.date || 'N/A'}`,
    `Time: ${booking.time || 'N/A'}`,
    `Estimate: ${booking.estimate || 'N/A'}`,
    `Website language: ${booking.language || 'N/A'}`,
    `Submitted at: ${booking.submittedAt || 'N/A'}`,
    '',
    'CUSTOMER',
    `Name: ${booking.name || 'N/A'}`,
    `Phone: ${booking.phone || 'N/A'}`,
    `Email: ${booking.email || 'N/A'}`,
    `Service address: ${booking.address || 'N/A'}`,
    '',
    'NOTES',
    booking.notes || 'No notes provided',
  ].join('\n');
}

function bookingResponseSummary(booking) {
  return {
    serviceBooked: booking.service,
    service: booking.service,
    package: booking.serviceType,
    serviceType: booking.serviceType,
    vehicleSize: booking.carSize,
    carSize: booking.carSize,
    date: booking.date,
    time: booking.time,
    estimate: booking.estimate,
    name: booking.name,
    phone: booking.phone,
    email: booking.email,
    address: booking.address,
    notes: booking.notes,
    customer: {
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      address: booking.address,
    },
  };
}

async function sendTelegram(booking) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Telegram is not configured. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Netlify.');
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatBookingText(booking),
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    throw new Error(result.description || `Telegram returned HTTP ${response.status}`);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { message: 'Method not allowed.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const booking = {
      service: clean(body.service),
      serviceType: clean(body.serviceType),
      carSize: clean(body.carSize),
      date: clean(body.date),
      time: clean(body.time),
      estimate: clean(body.estimate),
      language: clean(body.language),
      name: clean(body.name),
      phone: clean(body.phone),
      email: clean(body.email),
      address: clean(body.address),
      notes: clean(body.notes),
      submittedAt: new Date().toISOString(),
    };

    if (booking.service !== 'Car Cleaning') {
      return json(400, { message: 'Only car detailing bookings are available online.' });
    }

    if (REQUIRED_FIELDS.some((field) => !booking[field])) {
      return json(400, { message: 'Please complete all required booking fields.' });
    }

    await sendTelegram(booking);
    console.log('New GoClean Lux booking request:', booking);

    return json(200, {
      message: 'Booking request received and Telegram notification sent.',
      mailSent: false,
      notificationSent: true,
      notifications: {
        telegram: { configured: true, sent: true },
      },
      booking: bookingResponseSummary(booking),
    });
  } catch (error) {
    console.error('Booking request failed:', error);
    return json(500, {
      message: 'The booking could not be sent to Telegram.',
      error: String(error?.message || error),
    });
  }
};

