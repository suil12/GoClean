const loginPanel = document.getElementById('loginPanel');
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginMessage = document.getElementById('loginMessage');
const adminDashboard = document.getElementById('adminDashboard');
const refreshAdmin = document.getElementById('refreshAdmin');
const fullDayForm = document.getElementById('fullDayForm');
const fullDayDate = document.getElementById('fullDayDate');
const fullDayMessage = document.getElementById('fullDayMessage');
const fullDaysList = document.getElementById('fullDaysList');
const slotBlockForm = document.getElementById('slotBlockForm');
const slotDate = document.getElementById('slotDate');
const slotMessage = document.getElementById('slotMessage');
const slotCheckboxes = document.getElementById('slotCheckboxes');
const blockedSlotsList = document.getElementById('blockedSlotsList');
const reservationList = document.getElementById('reservationList');
const saveMessage = document.getElementById('saveMessage');

let password = sessionStorage.getItem('gocleanAdminPassword') || '';
let state = {
  availability: { fullDays: [], blockedSlots: {}, messages: {} },
  reservations: [],
  timeSlots: [],
};

function todayIso() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function showMessage(message, isError = false) {
  saveMessage.textContent = message;
  saveMessage.style.color = isError ? '#b42318' : '#055463';
}

async function adminRequest(options = {}) {
  const response = await fetch('/api/admin', {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': password,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Admin request failed.');
  }
  return data;
}

function normalizeAvailability() {
  state.availability.fullDays = [...new Set(state.availability.fullDays || [])].sort();
  state.availability.blockedSlots = state.availability.blockedSlots || {};
  state.availability.messages = state.availability.messages || {};
}

async function saveAvailability(message = 'Availability saved.') {
  normalizeAvailability();
  const data = await adminRequest({
    method: 'POST',
    body: {
      action: 'saveAvailability',
      availability: state.availability,
    },
  });
  state.availability = data.availability;
  renderAvailability();
  showMessage(message);
}

function renderSlotCheckboxes() {
  slotCheckboxes.innerHTML = '';
  state.timeSlots.forEach((slot) => {
    const id = `slot-${slot.replace(/[^a-z0-9]/gi, '-')}`;
    const label = document.createElement('label');
    label.innerHTML = `<input id="${id}" type="checkbox" value="${slot}" /> <span>${slot}</span>`;
    slotCheckboxes.appendChild(label);
  });
}

function renderAvailability() {
  normalizeAvailability();
  fullDaysList.innerHTML = state.availability.fullDays.length
    ? ''
    : '<p class="admin-message">No fully closed days saved.</p>';

  state.availability.fullDays.forEach((date) => {
    const item = document.createElement('div');
    item.className = 'chip';
    item.innerHTML = `
      <div>
        <strong>${date}</strong>
        <small>${state.availability.messages[date] || 'Closed all day'}</small>
      </div>
      <button type="button" class="remove-button">Remove</button>
    `;
    item.querySelector('button').addEventListener('click', async () => {
      state.availability.fullDays = state.availability.fullDays.filter((savedDate) => savedDate !== date);
      delete state.availability.messages[date];
      await saveAvailability('Closed day removed.');
    });
    fullDaysList.appendChild(item);
  });

  const blockedEntries = Object.entries(state.availability.blockedSlots || {});
  blockedSlotsList.innerHTML = blockedEntries.length
    ? ''
    : '<p class="admin-message">No partial blocked days saved.</p>';

  blockedEntries.forEach(([date, slots]) => {
    const item = document.createElement('div');
    item.className = 'blocked-item';
    item.innerHTML = `
      <strong>${date}</strong>
      <small>${slots.join(', ')}</small>
      <small>${state.availability.messages[date] || ''}</small>
      <button type="button" class="remove-button">Remove blocked slots</button>
    `;
    item.querySelector('button').addEventListener('click', async () => {
      delete state.availability.blockedSlots[date];
      delete state.availability.messages[date];
      await saveAvailability('Blocked slots removed.');
    });
    blockedSlotsList.appendChild(item);
  });
}

function renderReservations() {
  reservationList.innerHTML = state.reservations.length
    ? ''
    : '<p class="admin-message">No reservations yet.</p>';

  state.reservations.forEach((reservation) => {
    const item = document.createElement('article');
    item.className = 'reservation-item';
    item.innerHTML = `
      <div>
        <strong>${reservation.name || 'Customer'} · ${reservation.phone || 'No phone'}</strong>
        <small>${reservation.email || ''}</small>
        <small>${reservation.address || ''}</small>
      </div>
      <div>
        <strong>${reservation.date || 'No date'} · ${reservation.time || 'No time'}</strong>
        <small>${reservation.serviceType || reservation.service || 'Car Cleaning'} · ${reservation.carSize || ''}</small>
        <small>${reservation.estimate || ''}</small>
      </div>
      <div class="reservation-actions">
        <select aria-label="Reservation status">
          <option value="new">New</option>
          <option value="confirmed">Confirmed</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="button" class="remove-button">Delete</button>
      </div>
    `;

    const statusSelect = item.querySelector('select');
    statusSelect.value = reservation.status || 'new';
    statusSelect.addEventListener('change', async () => {
      const data = await adminRequest({
        method: 'POST',
        body: {
          action: 'updateReservationStatus',
          id: reservation.id,
          status: statusSelect.value,
        },
      });
      state.reservations = data.reservations;
      renderReservations();
      showMessage('Reservation updated.');
    });

    item.querySelector('button').addEventListener('click', async () => {
      const data = await adminRequest({
        method: 'POST',
        body: {
          action: 'deleteReservation',
          id: reservation.id,
        },
      });
      state.reservations = data.reservations;
      renderReservations();
      showMessage('Reservation deleted.');
    });

    reservationList.appendChild(item);
  });
}

async function loadAdmin() {
  const data = await adminRequest();
  state = data;
  renderSlotCheckboxes();
  renderAvailability();
  renderReservations();
  loginPanel.hidden = true;
  adminDashboard.hidden = false;
  showMessage('Admin loaded.');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  password = adminPassword.value;
  loginMessage.textContent = '';
  try {
    await loadAdmin();
    sessionStorage.setItem('gocleanAdminPassword', password);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

refreshAdmin.addEventListener('click', () => {
  loadAdmin().catch((error) => showMessage(error.message, true));
});

fullDayForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const date = fullDayDate.value;
  if (!date) {
    return;
  }

  state.availability.fullDays.push(date);
  if (fullDayMessage.value.trim()) {
    state.availability.messages[date] = fullDayMessage.value.trim();
  }
  await saveAvailability('Closed day added.');
  fullDayForm.reset();
});

slotBlockForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const date = slotDate.value;
  const slots = [...slotCheckboxes.querySelectorAll('input:checked')].map((input) => input.value);
  if (!date) {
    return;
  }

  if (slots.length) {
    state.availability.blockedSlots[date] = slots;
  } else {
    delete state.availability.blockedSlots[date];
  }

  if (slotMessage.value.trim()) {
    state.availability.messages[date] = slotMessage.value.trim();
  }

  await saveAvailability('Blocked slots saved.');
});

[fullDayDate, slotDate].forEach((input) => {
  input.min = todayIso();
});

if (password) {
  adminPassword.value = password;
  loadAdmin().catch(() => {
    sessionStorage.removeItem('gocleanAdminPassword');
  });
}
