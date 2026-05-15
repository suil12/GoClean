const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config({ quiet: true });

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';
const bookingReceiverEmail = process.env.BOOKING_RECEIVER_EMAIL || 'contact@goclean.lu';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function clean(value) {
  return String(value || '').trim();
}

app.post('/api/bookings', async (req, res) => {
  const booking = {
    service: clean(req.body.service),
    date: clean(req.body.date),
    time: clean(req.body.time),
    estimate: clean(req.body.estimate),
    name: clean(req.body.name),
    phone: clean(req.body.phone),
    email: clean(req.body.email),
    address: clean(req.body.address),
    notes: clean(req.body.notes),
  };

  const requiredFields = ['service', 'date', 'time', 'name', 'phone', 'email', 'address'];
  const missingField = requiredFields.find((field) => !booking[field]);

  if (missingField) {
    return res.status(400).json({
      message: 'Please complete all required booking fields.',
    });
  }

  if (!isEmailConfigured()) {
    console.log('New GoClean Lux booking request:', booking);
    return res.json({
      mailSent: false,
      message: 'Booking received, but SMTP email delivery is not configured yet.',
    });
  }

  try {
    const transporter = createTransporter();
    const subject = `New GoClean Lux booking: ${booking.service} on ${booking.date}`;
    const text = [
      'New GoClean Lux booking request',
      '',
      `Service: ${booking.service}`,
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
    ].join('\n');

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: bookingReceiverEmail,
      replyTo: booking.email,
      subject,
      text,
    });

    return res.json({
      mailSent: true,
      message: 'Booking request sent.',
    });
  } catch (error) {
    console.error('Booking email failed:', error);
    return res.status(500).json({
      message: 'The booking could not be emailed. Please try again or contact us directly.',
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, host, () => {
  console.log(`GoClean Lux site running at http://${host}:${port}`);
});
