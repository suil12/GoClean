const { readJson, writeJson } = require('./storage');

const timeSlots = Array.from({ length: 8 }, (_, index) => {
  const hour = 9 + index;
  return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 3).padStart(2, '0')}:00`;
});

const unavailableWeekDates = [
  '2026-07-19',
  '2026-07-20',
  '2026-07-21',
  '2026-07-22',
  '2026-07-23',
  '2026-07-24',
  '2026-07-25',
  '2026-07-26',
  '2026-07-27',
];

const defaultAvailability = {
  fullDays: [
    '2026-07-14',
    ...unavailableWeekDates,
  ],
  blockedSlots: {
    '2026-07-17': [
      '09:00 - 12:00',
      '10:00 - 13:00',
      '11:00 - 14:00',
    ],
  },
  messages: {
    '2026-07-14': 'Tomorrow is fully booked. Please choose another day.',
    ...Object.fromEntries(
      unavailableWeekDates.map((date) => [
        date,
        'We are not available this week. Please try the following week, starting from July 28.',
      ])
    ),
    '2026-07-17': 'Friday morning is fully booked. Please choose an afternoon slot.',
  },
  updatedAt: '2026-07-13T00:00:00.000Z',
};

function uniqueSorted(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))].sort();
}

function normalizeAvailability(value = {}) {
  const blockedSlots = {};
  Object.entries(value.blockedSlots || {}).forEach(([date, slots]) => {
    const cleanDate = String(date || '').trim();
    const cleanSlots = uniqueSorted(slots).filter((slot) => timeSlots.includes(slot));
    if (cleanDate && cleanSlots.length) {
      blockedSlots[cleanDate] = cleanSlots;
    }
  });

  const messages = {};
  Object.entries(value.messages || {}).forEach(([date, message]) => {
    const cleanDate = String(date || '').trim();
    const cleanMessage = String(message || '').trim();
    if (cleanDate && cleanMessage) {
      messages[cleanDate] = cleanMessage;
    }
  });

  return {
    fullDays: uniqueSorted(value.fullDays),
    blockedSlots,
    messages,
    updatedAt: value.updatedAt || new Date().toISOString(),
  };
}

function mergeWithDefaults(value) {
  const normalized = normalizeAvailability(value);
  return normalizeAvailability({
    fullDays: [...defaultAvailability.fullDays, ...normalized.fullDays],
    blockedSlots: {
      ...defaultAvailability.blockedSlots,
      ...normalized.blockedSlots,
    },
    messages: {
      ...defaultAvailability.messages,
      ...normalized.messages,
    },
    updatedAt: normalized.updatedAt || defaultAvailability.updatedAt,
  });
}

async function loadAvailability() {
  const stored = await readJson('availability', null);
  return stored ? normalizeAvailability(stored) : normalizeAvailability(defaultAvailability);
}

async function saveAvailability(availability) {
  const normalized = normalizeAvailability({
    ...availability,
    updatedAt: new Date().toISOString(),
  });
  await writeJson('availability', normalized);
  return normalized;
}

function getAvailableSlotsForDate(date, availability, alreadyBookedSlots = []) {
  if ((availability.fullDays || []).includes(date)) {
    return [];
  }

  const booked = new Set(alreadyBookedSlots);
  const blocked = new Set((availability.blockedSlots || {})[date] || []);
  return timeSlots.filter((slot) => !booked.has(slot) && !blocked.has(slot));
}

function getAvailabilityMessage(date, availability, slots) {
  const customMessage = availability.messages?.[date] || '';
  if (customMessage) {
    return customMessage;
  }

  if (slots.length === 0 && (availability.fullDays || []).includes(date)) {
    return 'This day is fully booked. Please choose another date.';
  }

  return '';
}

function isSlotAvailable(date, slot, availability, alreadyBookedSlots = []) {
  return getAvailableSlotsForDate(date, availability, alreadyBookedSlots).includes(slot);
}

module.exports = {
  timeSlots,
  defaultAvailability,
  loadAvailability,
  saveAvailability,
  getAvailableSlotsForDate,
  getAvailabilityMessage,
  isSlotAvailable,
  normalizeAvailability,
};
