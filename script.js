document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('year');
  const serviceSelect = document.getElementById('serviceSelect');
  const dateSelect = document.getElementById('dateSelect');
  const slotContainer = document.getElementById('slotContainer');
  const bookingForm = document.getElementById('bookingForm');
  const bookingMessage = document.getElementById('bookingMessage');
  const summaryService = document.getElementById('summaryService');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const calendarToggle = document.getElementById('calendarToggle');

  yearEl.textContent = new Date().getFullYear();

  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => observer.observe(el));

  const timeSlots = [];
  for (let hour = 9; hour <= 16; hour += 1) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const endHour = hour + 3;
    const end = `${endHour.toString().padStart(2, '0')}:00`;
    timeSlots.push(`${start} - ${end}`);
  }

  let selectedSlot = null;

  function setTodayMinimum() {
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0];
    dateSelect.min = isoDate;
    if (!dateSelect.value) {
      dateSelect.value = isoDate;
    }
  }

  function renderSlots() {
    slotContainer.innerHTML = '';
    timeSlots.forEach((slot) => {
      const slotButton = document.createElement('button');
      slotButton.type = 'button';
      slotButton.className = 'slot-chip';
      slotButton.textContent = slot;
      slotButton.dataset.slot = slot;

      if (selectedSlot === slot) {
        slotButton.classList.add('selected');
      }

      slotButton.addEventListener('click', () => {
        selectedSlot = slot;
        updateSummary();
        renderSlots();
      });

      slotContainer.appendChild(slotButton);
    });
  }

  function updateSummary() {
    summaryService.textContent = serviceSelect.value;
    summaryDate.textContent = dateSelect.value ? dateSelect.value : 'Select a date';
    summaryTime.textContent = selectedSlot ? selectedSlot : 'Pick a slot';
  }

  serviceSelect.addEventListener('change', updateSummary);
  dateSelect.addEventListener('change', () => {
    selectedSlot = null;
    updateSummary();
    renderSlots();
  });

  if (calendarToggle) {
    calendarToggle.addEventListener('click', () => {
      if (typeof dateSelect.showPicker === 'function') {
        dateSelect.showPicker();
      } else {
        dateSelect.focus();
      }
    });
  }

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();

    if (!selectedSlot) {
      bookingMessage.textContent = 'Please choose a time slot before submitting.';
      bookingMessage.className = 'booking-message error';
      return;
    }

    bookingMessage.textContent = `Thanks ${name}! Your request for ${serviceSelect.value} on ${dateSelect.value} at ${selectedSlot} has been received.`;
    bookingMessage.className = 'booking-message success';
    bookingForm.reset();
    setTodayMinimum();
    selectedSlot = null;
    updateSummary();
    renderSlots();
  });

  setTodayMinimum();
  renderSlots();
  updateSummary();
});
