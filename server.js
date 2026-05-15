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
const host = process.env.HOST || '127.0.0.1';
const bookingReceiverEmail = process.env.BOOKING_RECEIVER_EMAIL || 'contact@goclean.lu';
const bookingsFile = path.join(__dirname, 'bookings.json');
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

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
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

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1] || '';
      if (/^\d{3} /.test(lastLine)) {
        socket.off('data', onData);
        resolve(buffer);
      }
    };

    socket.on('data', onData);
    socket.once('error', reject);
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

  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host: smtpHost, port: smtpPort, servername: smtpHost })
      : net.connect({ host: smtpHost, port: smtpPort });

    socket.setTimeout(15000);
    socket.once('connect', () => resolve(socket));
    socket.once('secureConnect', () => resolve(socket));
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
  const smtpHost = process.env.SMTP_HOST;
  const secure = process.env.SMTP_SECURE === 'true';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `New GoClean Lux booking: ${booking.service} on ${booking.date}`;
  const text = [
    'New GoClean Lux booking request',
    '',
    `Service: ${booking.service}`,
    booking.service === 'Car Cleaning' ? `Package: ${booking.serviceType}` : null,
    booking.service === 'Car Cleaning' ? `Vehicle size: ${booking.carSize}` : null,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    `Estimate: ${booking.estimate}`,
    '',
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Email: ${booking.email}`,
    `Address: ${booking.address}`,
    '',
    `Notes: ${booking.notes || 'No notes provided'}`,
  ]
    .filter(Boolean)
    .join('\n');

  let socket = await connectSmtp();

  try {
    await smtpCommand(socket, null, [220]);
    await smtpCommand(socket, `EHLO ${smtpHost}`, [250]);
    if (!secure) {
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
    await smtpCommand(socket, 'QUIT', [221]);
  } finally {
    socket.end();
  }
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
      name: clean(body.name),
      phone: clean(body.phone),
      email: clean(body.email),
      address: clean(body.address),
      notes: clean(body.notes),
    };

    const requiredFields = ['service', 'date', 'time', 'name', 'phone', 'email', 'address'];
    if (booking.service === 'Car Cleaning') {
      requiredFields.push('serviceType', 'carSize');
    }

    if (requiredFields.some((field) => !booking[field])) {
      sendJson(res, 400, { message: 'Please complete all required booking fields.' });
      return;
    }

    const bookings = loadBookings();
    if (bookings.some((existing) => existing.date === booking.date && existing.time === booking.time)) {
      sendJson(res, 409, { message: 'That time slot is already booked. Please choose a different slot.' });
      return;
    }

    bookings.push(booking);
    saveBookings(bookings);

    if (!isEmailConfigured()) {
      console.log('New GoClean Lux booking request:', booking);
      sendJson(res, 200, {
        mailSent: false,
        message: 'Booking received, but SMTP email delivery is not configured yet.',
      });
      return;
    }

    await sendBookingEmail(booking);
    sendJson(res, 200, { mailSent: true, message: 'Booking request sent.' });
  } catch (error) {
    console.error('Booking request failed:', error);
    sendJson(res, 500, { message: 'The booking could not be emailed. Please try again or contact us directly.' });
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
