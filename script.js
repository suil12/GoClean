document.addEventListener('DOMContentLoaded', function () {
  const yearEl = document.getElementById('year');
  const topbar = document.querySelector('.topbar');
  const cursorGlow = document.querySelector('.cursor-glow');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const serviceCards = document.querySelectorAll('.service-card');
  const bookingServiceOptions = document.querySelectorAll('.booking-service-option');
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
  const summaryPackage = document.getElementById('summaryPackage');
  const summaryVehicle = document.getElementById('summaryVehicle');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryPrice = document.getElementById('summaryPrice');
  const packageOptions = document.querySelectorAll('.package-option');
  const carSizeOptions = document.querySelectorAll('.car-size-option');
  const serviceTypeRow = document.getElementById('serviceTypeRow');
  const carSizeRow = document.getElementById('carSizeRow');
  const calendarToggle = document.getElementById('calendarToggle');

  let selectedPackage = 'Full detail';
  let selectedCarSize = 'cityCar';
  let availableSlots = [];

  yearEl.textContent = new Date().getFullYear();

  const carPackagePrices = {
    'Express wash': {
      cityCar: { amount: 59, label: 'from €59' },
      berlina: { amount: 69, label: 'from €69' },
      suv: { amount: 79, label: 'from €79' },
      xl: { amount: 99, label: 'from €99' },
    },
    'Interior reset': {
      cityCar: { amount: 79, label: 'from €79' },
      berlina: { amount: 69, label: 'from €69' },
      suv: { amount: 79, label: 'from €79' },
      xl: { amount: 99, label: 'from €99' },
    },
    'Full detail': {
      cityCar: { amount: 139, label: 'from €139' },
      berlina: { amount: 159, label: 'from €159' },
      suv: { amount: 189, label: 'from €189' },
      xl: { amount: 229, label: 'from €229' },
    },
    'Deep clean': {
      cityCar: { amount: 249, label: 'from €249' },
      berlina: { amount: 279, label: 'from €279' },
      suv: { amount: 329, label: 'from €329' },
      xl: { amount: 399, label: 'from €399' },
    },
    'Showroom / VIP': {
      cityCar: { amount: 499, label: 'from €499' },
      berlina: { amount: 599, label: 'from €599' },
      suv: { amount: 699, label: 'from €699+' },
      xl: { amount: 699, label: 'from €699+' },
    },
  };

  const serviceDetails = {
    'Car Cleaning': { price: 'from €59' },
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

  async function loadAvailableSlots(date) {
    if (!date) {
      availableSlots = [...timeSlots];
      renderSlots();
      return;
    }

    try {
      const response = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.slots)) {
        availableSlots = data.slots;
      } else {
        availableSlots = [...timeSlots];
      }
    } catch (error) {
      availableSlots = [...timeSlots];
    }

    if (!availableSlots.includes(selectedSlot)) {
      selectedSlot = null;
    }

    renderSlots();
  }

  function renderSlots() {
    slotContainer.innerHTML = '';
    if (availableSlots.length === 0) {
      slotContainer.innerHTML = '<p class="slot-empty">No slots available for this date. Please choose another day.</p>';
      return;
    }

    availableSlots.forEach((slot) => {
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
    bookingServiceOptions.forEach((button) => {
      button.classList.toggle('selected', button.dataset.service === serviceSelect.value);
    });
  }

  function formatVehicleLabel(value) {
    return {
      cityCar: 'City car',
      berlina: 'Berlina',
      suv: 'SUV',
      xl: 'XL / Van',
    }[value] || 'Vehicle';
  }

  function getEstimate() {
    if (serviceSelect.value !== 'Car Cleaning') {
      return { amount: null, text: serviceDetails[serviceSelect.value]?.price || 'Estimate on request' };
    }

    const packageInfo = carPackagePrices[selectedPackage];
    const sizeInfo = packageInfo ? packageInfo[selectedCarSize] : null;

    if (!sizeInfo) {
      return { amount: null, text: 'Estimate on request' };
    }

    return { amount: sizeInfo.amount, text: sizeInfo.label };
  }

  function updateBookingFieldsVisibility() {
    const carDetailsVisible = serviceSelect.value === 'Car Cleaning';
    serviceTypeRow.style.display = carDetailsVisible ? '' : 'none';
    carSizeRow.style.display = carDetailsVisible ? '' : 'none';
  }

  function updateSummary() {
    const estimate = getEstimate();

    summaryService.textContent = serviceSelect.value;
    summaryPackage.textContent = serviceSelect.value === 'Car Cleaning' ? selectedPackage : 'N/A';
    summaryVehicle.textContent = serviceSelect.value === 'Car Cleaning' ? formatVehicleLabel(selectedCarSize) : 'N/A';
    summaryDate.textContent = dateSelect.value ? dateSelect.value : 'Select a date';
    summaryTime.textContent = selectedSlot ? selectedSlot : 'Pick a slot';
    summaryPrice.textContent = estimate.text;
    syncServiceCards();
  }

  function chooseService(card) {
    serviceSelect.value = card.dataset.service;
    updateBookingFieldsVisibility();
    selectedSlot = null;
    updateSummary();
    loadAvailableSlots(dateSelect.value);
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

  bookingServiceOptions.forEach((button) => {
    button.addEventListener('click', () => {
      serviceSelect.value = button.dataset.service;
      updateBookingFieldsVisibility();
      selectedSlot = null;
      updateSummary();
      loadAvailableSlots(dateSelect.value);
    });
  });

  serviceSelect.addEventListener('change', () => {
    updateBookingFieldsVisibility();
    selectedSlot = null;
    updateSummary();
    loadAvailableSlots(dateSelect.value);
  });

  packageOptions.forEach((button) => {
    button.addEventListener('click', () => {
      selectedPackage = button.dataset.package;
      packageOptions.forEach((option) => option.classList.toggle('selected', option === button));
      updateSummary();
    });
  });

  carSizeOptions.forEach((button) => {
    button.addEventListener('click', () => {
      selectedCarSize = button.dataset.size;
      carSizeOptions.forEach((option) => option.classList.toggle('selected', option === button));
      updateSummary();
    });
  });

  dateSelect.addEventListener('change', () => {
    selectedSlot = null;
    updateSummary();
    loadAvailableSlots(dateSelect.value);
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
      <div><span>Package</span><strong>${booking.serviceType || 'N/A'}</strong></div>
      <div><span>Vehicle</span><strong>${booking.carSize || 'N/A'}</strong></div>
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

    const estimate = getEstimate();

    const booking = {
      service: serviceSelect.value,
      serviceType: serviceSelect.value === 'Car Cleaning' ? selectedPackage : '',
      carSize: serviceSelect.value === 'Car Cleaning' ? formatVehicleLabel(selectedCarSize) : '',
      date: dateSelect.value,
      time: selectedSlot,
      estimate: estimate.text,
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

  updateBookingFieldsVisibility();
  setTodayMinimum();
  loadAvailableSlots(dateSelect.value);
  updateSummary();
});
