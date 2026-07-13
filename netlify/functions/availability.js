const timeSlots = Array.from({ length: 8 }, (_, index) => {
  const hour = 9 + index;
  return `${String(hour).padStart(2, '0')}:00 - ${String(hour + 3).padStart(2, '0')}:00`;
});

const fullyBookedDates = new Set([
  '2026-07-14',
  '2026-07-19',
  '2026-07-20',
  '2026-07-21',
  '2026-07-22',
  '2026-07-23',
  '2026-07-24',
  '2026-07-25',
  '2026-07-26',
  '2026-07-27',
]);

const blockedSlotsByDate = {
  '2026-07-17': new Set([
    '09:00 - 12:00',
    '10:00 - 13:00',
    '11:00 - 14:00',
  ]),
};

function availableSlotsForDate(date, alreadyBookedSlots = []) {
  if (fullyBookedDates.has(date)) {
    return [];
  }

  const booked = new Set(alreadyBookedSlots);
  const blocked = blockedSlotsByDate[date] || new Set();
  return timeSlots.filter((slot) => !booked.has(slot) && !blocked.has(slot));
}

function isSlotAvailable(date, slot, alreadyBookedSlots = []) {
  return availableSlotsForDate(date, alreadyBookedSlots).includes(slot);
}

module.exports = {
  timeSlots,
  fullyBookedDates,
  blockedSlotsByDate,
  availableSlotsForDate,
  isSlotAvailable,
};
