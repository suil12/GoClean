const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const storageFile = path.join(__dirname, '..', '.netlify-local-data', 'reservations.json');
if (fs.existsSync(storageFile)) {
  fs.unlinkSync(storageFile);
}

const bookingsFn = require('../netlify/functions/bookings');

(async () => {
  const response = await bookingsFn.handler({
    httpMethod: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      service: 'Car Cleaning',
      serviceType: 'Complete Clean',
      carSize: 'cityCar',
      date: '2026-10-15',
      time: '09:00 - 12:00',
      estimate: '€120',
      language: 'en',
      name: 'Test User',
      phone: '123456',
      email: 'test@example.com',
      address: '12 Test Street',
      notes: 'Regression check',
    }),
  });

  const payload = JSON.parse(response.body);
  assert.equal(response.statusCode, 200, `Expected 200, got ${response.statusCode}: ${response.body}`);
  assert.equal(payload.booking?.name, 'Test User');
  assert.equal(payload.notifications.telegram.configured, false);

  const saved = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
  assert.equal(saved.length > 0, true, 'Reservation should be written to storage even without Telegram settings');

  console.log('reservation-flow test passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
