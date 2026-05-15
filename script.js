document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('year');
  const topbar = document.querySelector('.topbar');
  const cursorGlow = document.querySelector('.cursor-glow');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const serviceCards = document.querySelectorAll('.service-card');
  const counters = document.querySelectorAll('[data-count]');
  const serviceSelect = document.getElementById('serviceSelect');
  const dateSelect = document.getElementById('dateSelect');
  const slotContainer = document.getElementById('slotContainer');
  const bookingForm = document.getElementById('bookingForm');
  const bookingMessage = document.getElementById('bookingMessage');
  const bookingModal = document.getElementById('bookingModal');
  const modalClose = document.getElementById('modalClose');
  const modalDone = document.getElementById('modalDone');
  const modalName = document.getElementById('modalName');
  const modalCopy = document.getElementById('modalCopy');
  const modalSummary = document.getElementById('modalSummary');
  const summaryService = document.getElementById('summaryService');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryPrice = document.getElementById('summaryPrice');
  const calendarToggle = document.getElementById('calendarToggle');

  yearEl.textContent = new Date().getFullYear();

  const serviceDetails = {
    'Car Cleaning': { price: 'from €79' },
    'Home & Office': { price: 'from €119' },
    'Sofa & Upholstery': { price: 'from €59' },
    'Garden & Outdoor': { price: 'from €99' },
  };

  function updateHeaderState() {
    topbar.classList.toggle('scrolled', window.scrollY > 12);
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  if (cursorGlow) {
    window.addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
      cursorGlow.style.opacity = '1';
    });

    window.addEventListener('pointerleave', () => {
      cursorGlow.style.opacity = '0';
    });
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.querySelector('[data-count]')) {
            animateCounters();
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements.forEach((el) => observer.observe(el));

  function animateCounters() {
    counters.forEach((counter) => {
      if (counter.dataset.animated === 'true') {
        return;
      }

      counter.dataset.animated = 'true';
      const target = Number(counter.dataset.count);
      const duration = 1100;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased).toString();

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    });
  }

  animateCounters();

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
    const isoDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
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

  function syncServiceCards() {
    serviceCards.forEach((card) => {
      card.classList.toggle('active', card.dataset.service === serviceSelect.value);
    });
  }

  function updateSummary() {
    summaryService.textContent = serviceSelect.value;
    summaryDate.textContent = dateSelect.value ? dateSelect.value : 'Select a date';
    summaryTime.textContent = selectedSlot ? selectedSlot : 'Pick a slot';
    summaryPrice.textContent = serviceDetails[serviceSelect.value].price;
    syncServiceCards();
  }

  function chooseService(card) {
    serviceSelect.value = card.dataset.service;
    updateSummary();
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  serviceCards.forEach((card) => {
    card.addEventListener('click', () => {
      chooseService(card);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        chooseService(card);
      }
    });
  });

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

  function closeBookingModal() {
    bookingModal.classList.remove('open');
    bookingModal.setAttribute('aria-hidden', 'true');
  }

  function showBookingModal(booking, mailSent) {
    modalName.textContent = booking.name;
    modalCopy.textContent = mailSent
      ? 'Your request has been received and GoClean Lux has been emailed the booking details.'
      : 'Your request has been received. Email delivery still needs SMTP settings before live bookings can arrive in your mailbox.';
    modalSummary.innerHTML = `
      <div><span>Service</span><strong>${booking.service}</strong></div>
      <div><span>Date</span><strong>${booking.date}</strong></div>
      <div><span>Time</span><strong>${booking.time}</strong></div>
      <div><span>Estimate</span><strong>${booking.estimate}</strong></div>
    `;
    bookingModal.classList.add('open');
    bookingModal.setAttribute('aria-hidden', 'false');
    modalDone.focus();
  }

  [modalClose, modalDone].forEach((button) => {
    button.addEventListener('click', closeBookingModal);
  });

  bookingModal.addEventListener('click', (event) => {
    if (event.target === bookingModal) {
      closeBookingModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && bookingModal.classList.contains('open')) {
      closeBookingModal();
    }
  });

  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    const notes = document.getElementById('notesInput').value.trim();
    const submitButton = bookingForm.querySelector('button[type="submit"]');

    if (!selectedSlot) {
      bookingMessage.textContent = 'Please choose a time slot before submitting.';
      bookingMessage.className = 'booking-message error';
      return;
    }

    const booking = {
      service: serviceSelect.value,
      date: dateSelect.value,
      time: selectedSlot,
      estimate: serviceDetails[serviceSelect.value].price,
      name,
      phone,
      email,
      address,
      notes,
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending request...';
    bookingMessage.className = 'booking-message';
    bookingMessage.textContent = '';

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not send booking request.');
      }

      bookingMessage.textContent = result.mailSent
        ? 'Booking request sent. We will confirm your appointment shortly.'
        : 'Booking request captured. Email delivery still needs to be configured.';
      bookingMessage.className = 'booking-message success';
      showBookingModal(booking, result.mailSent);
      bookingForm.reset();
      setTodayMinimum();
      selectedSlot = null;
      updateSummary();
      renderSlots();
    } catch (error) {
      bookingMessage.textContent = error.message;
      bookingMessage.className = 'booking-message error';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Request booking';
    }
  });

  setTodayMinimum();
  renderSlots();
  updateSummary();
});
