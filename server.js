const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const tls = require('tls');
const { URL } = require('url');

function loadLocalEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        return;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

loadLocalEnv();

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
const bookingReceiverEmail = process.env.BOOKING_RECEIVER_EMAIL || 'contact@goclean.lu';
const bookingsFile = path.join(__dirname, 'bookings.json');
const resultsDirectory = path.join(__dirname, 'img', 'work');
const publicRoot = __dirname;
const timeSlots = Array.from({ length: 8 }, (_, index) => {
  const hour = 9 + index;
  return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 3).padStart(2, '0')}:00`;
});

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
};

function clean(value) {
  return String(value || '').trim();
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON request.'));
      }
    });
    req.on('error', reject);
  });
}

function loadBookings() {
  try {
    if (!fs.existsSync(bookingsFile)) {
      fs.writeFileSync(bookingsFile, '[]', 'utf8');
      return [];
    }
    return JSON.parse(fs.readFileSync(bookingsFile, 'utf8') || '[]');
  } catch (error) {
    console.error('Could not read bookings file:', error);
    return [];
  }
}

function saveBookings(bookings) {
  try {
    fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2), 'utf8');
  } catch (error) {
    console.error('Could not save bookings file:', error);
  }
}

function listResultPairs() {
  if (!fs.existsSync(resultsDirectory)) {
    return [];
  }

  const files = new Set(fs.readdirSync(resultsDirectory));
  const pairs = [];

  files.forEach((filename) => {
    const match = filename.match(/^before(\d*)\.(png|jpg|jpeg|tif|tiff)$/i);
    if (!match) {
      return;
    }

    const suffix = match[1];
    const afterFilename = `after${suffix}.png` || `after${suffix}.jpg` || `after${suffix}.jpeg` || `after${suffix}.tif` || `after${suffix}.tiff`;
    if (files.has(afterFilename)) {
      pairs.push({
        order: suffix === '' ? 0 : Number(suffix),
        before: `/img/work/${filename}`,
        after: `/img/work/${afterFilename}`,
      });
    }
  });

  return pairs.sort((a, b) => a.order - b.order);
}

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));
}

function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_RECIPIENT
  );
}

function smtpEncode(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function formatEmailMessage({ from, to, replyTo, subject, text }) {
  const safeSubject = subject.replace(/[\r\n]+/g, ' ');
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${safeSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    text,
  ].join('\r\n');
}

function formatBookingEmailText(booking) {
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

function publicEmailError(error) {
  const message = String(error?.message || '');

  if (/timed out|ETIMEDOUT/i.test(message)) {
    return 'Email server timeout. The deployment host may be blocking SMTP port 587.';
  }

  if (/ECONNREFUSED|ENETUNREACH|EHOSTUNREACH|ECONNRESET|socket hang up/i.test(message)) {
    return 'Could not connect to the email server from the deployment host.';
  }

  if (/AUTH|535|authentication|invalid login|password/i.test(message)) {
    return 'Email authentication failed. Check SMTP_USER and SMTP_PASS.';
  }

  if (/MAIL FROM|sender|from/i.test(message)) {
    return 'The email sender address was rejected. Check SMTP_FROM.';
  }

  if (/RCPT TO|recipient/i.test(message)) {
    return 'The booking receiver email was rejected. Check BOOKING_RECEIVER_EMAIL.';
  }

  if (/Resend email failed/i.test(message)) {
    return message;
  }

  return 'Email delivery failed on the server.';
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onError);
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const onData = (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1] || '';
      if (/^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(buffer);
      }
    };

    socket.on('data', onData);
    socket.once('error', onError);
  });
}

async function smtpCommand(socket, command, expectedCodes) {
  if (command) {
    socket.write(`${command}\r\n`);
  }

  const response = await readSmtpResponse(socket);
  const code = Number(response.slice(0, 3));
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
  return response;
}

function connectSmtp() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const useImplicitTls = secure && smtpPort === 465;

  return new Promise((resolve, reject) => {
    const socket = useImplicitTls
      ? tls.connect({ host: smtpHost, port: smtpPort, servername: smtpHost })
      : net.connect({ host: smtpHost, port: smtpPort });

    socket.setEncoding('utf8');
    socket.setTimeout(Number(process.env.SMTP_TIMEOUT_MS || 6000));
    if (useImplicitTls) {
      socket.once('secureConnect', () => resolve(socket));
    } else {
      socket.once('connect', () => resolve(socket));
    }
    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out.'));
    });
    socket.once('error', reject);
  });
}

function upgradeToTls(socket) {
  const smtpHost = process.env.SMTP_HOST;

  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: smtpHost }, () => {
      resolve(secureSocket);
    });
    secureSocket.once('error', reject);
  });
}

async function sendBookingEmail(booking) {
  if (process.env.RESEND_API_KEY) {
    await sendBookingEmailWithResend(booking);
    return;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const useImplicitTls = secure && smtpPort === 465;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `New GoClean Lux booking: ${booking.service} on ${booking.date}`;
  const text = formatBookingEmailText(booking);

  let socket = await connectSmtp();
  let emailAccepted = false;

  try {
    await smtpCommand(socket, null, [220]);
    await smtpCommand(socket, `EHLO ${smtpHost}`, [250]);
    if (!useImplicitTls) {
      await smtpCommand(socket, 'STARTTLS', [220]);
      socket = await upgradeToTls(socket);
      await smtpCommand(socket, `EHLO ${smtpHost}`, [250]);
    }
    await smtpCommand(socket, 'AUTH LOGIN', [334]);
    await smtpCommand(socket, smtpEncode(process.env.SMTP_USER), [334]);
    await smtpCommand(socket, smtpEncode(process.env.SMTP_PASS), [235]);
    await smtpCommand(socket, `MAIL FROM:<${process.env.SMTP_USER}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${bookingReceiverEmail}>`, [250, 251]);
    await smtpCommand(socket, 'DATA', [354]);
    socket.write(`${formatEmailMessage({ from, to: bookingReceiverEmail, replyTo: booking.email, subject, text })}\r\n.\r\n`);
    await smtpCommand(socket, null, [250]);
    emailAccepted = true;
    try {
      await smtpCommand(socket, 'QUIT', [221]);
    } catch (quitError) {
      console.warn('SMTP QUIT failed after successful send:', quitError.message);
    }
  } finally {
    socket.end();
  }

  if (!emailAccepted) {
    throw new Error('Email was not accepted by the SMTP server.');
  }
}

async function sendBookingEmailWithResend(booking) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'GoClean Lux <contact@goclean.lu>';
  const subject = `New GoClean Lux booking: ${booking.serviceType} on ${booking.date}`;
  const text = formatBookingEmailText(booking);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [bookingReceiverEmail],
      reply_to: booking.email,
      subject,
      text,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const resendMessage = result.message || result.error || `Resend returned HTTP ${response.status}`;
    throw new Error(`Resend email failed: ${resendMessage}`);
  }
}

async function sendBookingTelegram(booking) {
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: formatBookingEmailText(booking),
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    throw new Error(result.description || `Telegram returned HTTP ${response.status}`);
  }
}

async function sendBookingWhatsApp(booking) {
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v23.0';
  const url = `https://graph.facebook.com/${apiVersion}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const templateName = clean(process.env.WHATSAPP_TEMPLATE_NAME);
  const payload = templateName
    ? {
        messaging_product: 'whatsapp',
        to: process.env.WHATSAPP_RECIPIENT,
        type: 'template',
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: process.env.WHATSAPP_RECIPIENT,
        type: 'text',
        text: { preview_url: false, body: formatBookingEmailText(booking) },
      };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result.error?.message || `WhatsApp returned HTTP ${response.status}`;
    throw new Error(message);
  }
}

async function sendBookingWebhook(booking) {
  const response = await fetch(process.env.BOOKING_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.BOOKING_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${process.env.BOOKING_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({ event: 'booking.created', booking }),
  });

  if (!response.ok) {
    throw new Error(`Booking webhook returned HTTP ${response.status}`);
  }
}

async function attemptNotification(channel, configured, sender) {
  if (!configured) {
    return { configured: false, sent: false, error: '' };
  }

  try {
    await sender();
    return { configured: true, sent: true, error: '' };
  } catch (error) {
    console.error(`Booking ${channel} notification failed:`, error);
    return { configured: true, sent: false, error: String(error?.message || error) };
  }
}

async function deliverBookingNotifications(booking) {
  const [email, telegram, whatsapp, webhook] = await Promise.all([
    attemptNotification('email', isEmailConfigured(), () => sendBookingEmail(booking)),
    attemptNotification('Telegram', isTelegramConfigured(), () => sendBookingTelegram(booking)),
    attemptNotification('WhatsApp', isWhatsAppConfigured(), () => sendBookingWhatsApp(booking)),
    attemptNotification('webhook', Boolean(process.env.BOOKING_WEBHOOK_URL), () => sendBookingWebhook(booking)),
  ]);

  return { email, telegram, whatsapp, webhook };
}

function publicNotificationSummary(notifications) {
  return Object.fromEntries(
    Object.entries(notifications).map(([channel, result]) => [
      channel,
      { configured: result.configured, sent: result.sent },
    ])
  );
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(publicRoot, safePath));

  if (!filePath.startsWith(publicRoot)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(publicRoot, 'index.html'), (indexError, indexContent) => {
        if (indexError) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes['.html'] });
        res.end(indexContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

async function handleBooking(req, res) {
  try {
    const body = await readJsonBody(req);
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
      sendJson(res, 400, { message: 'Only car detailing bookings are available online.' });
      return;
    }

    const requiredFields = ['service', 'serviceType', 'carSize', 'date', 'time', 'name', 'phone', 'email', 'address'];

    if (requiredFields.some((field) => !booking[field])) {
      sendJson(res, 400, { message: 'Please complete all required booking fields.' });
      return;
    }

    const bookings = loadBookings();
    if (bookings.some((existing) => existing.date === booking.date && existing.time === booking.time)) {
      sendJson(res, 409, { message: 'That time slot is already booked. Please choose a different slot.' });
      return;
    }

    const notifications = await deliverBookingNotifications(booking);
    const notificationSummary = publicNotificationSummary(notifications);
    const mailSent = notifications.email.sent;
    const notificationSent = Object.values(notifications).some((notification) => notification.sent);
    const emailError = notifications.email.configured
      ? notifications.email.error
      : 'Email delivery is not configured on the server.';

    const bookingForLog = {
      ...booking,
      mailSent,
      notificationSent,
      notifications: notificationSummary,
      emailError,
    };

    console.log('New GoClean Lux booking request:', bookingForLog);
    bookings.push(booking);
    saveBookings(bookings);
    sendJson(res, 200, {
      mailSent,
      notificationSent,
      message: notificationSent
        ? 'Booking request received and notification sent.'
        : 'Booking received and logged. Please confirm manually from the server logs.',
      booking: bookingResponseSummary(booking),
      notifications: notificationSummary,
      emailError: emailError ? publicEmailError(new Error(emailError)) : '',
    });
  } catch (error) {
    console.error('Booking request failed:', error);
    sendJson(res, 500, {
      message: 'The booking could not be emailed. Please contact us on WhatsApp at +352 661 920 598.',
      emailError: publicEmailError(error),
    });
  }
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);

  if (req.method === 'GET' && requestUrl.pathname === '/api/slots') {
    const date = clean(requestUrl.searchParams.get('date'));
    if (!date) {
      sendJson(res, 400, { message: 'Date is required to load available slots.' });
      return;
    }

    const bookedSlots = loadBookings().filter((booking) => booking.date === date).map((booking) => booking.time);
    sendJson(res, 200, { slots: timeSlots.filter((slot) => !bookedSlots.includes(slot)) });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/results') {
    sendJson(res, 200, { pairs: listResultPairs() });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/bookings') {
    handleBooking(req, res);
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res, requestUrl.pathname);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(port, host, () => {
  console.log(`GoClean Lux site running at http://${host}:${port}`);
});
