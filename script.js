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
  const packageStepTitle = document.getElementById('packageStepTitle');
  const vehicleStepTitle = document.getElementById('vehicleStepTitle');
  const calendarToggle = document.getElementById('calendarToggle');
  const languageButtons = document.querySelectorAll('.lang-button');

  let selectedPackage = 'Full detail';
  let selectedCarSize = 'cityCar';
  let availableSlots = [];
  let currentLanguage = 'en';

  const translations = {
    en: {
      brandSubtext: 'Mobile Cleaning & Detailing',
      pageTitle: 'GoClean Lux | Mobile Cleaning & Detailing',
      navServices: 'Services',
      navHow: 'How it Works',
      navReviews: 'Reviews',
      navBook: 'Book Now',
      heroEyebrow: 'Premium Cleaning. Anytime. Anywhere.',
      heroTitle: 'Car detailing with home cleaning power.',
      heroText: 'GoClean Lux brings a polished finish to cars, sofas, homes, gardens and offices with mobile cleaning services tailored for Luxembourg.',
      heroQuote: 'Get a free quote',
      heroServices: 'View services',
      heroClients: 'satisfied clients',
      heroFast: 'fast booking',
      heroEco: 'premium products',
      bestBadge: 'Best Seller',
      bestEyebrow: 'Most booked package',
      bestTitle: 'Full interior detail',
      bestText: 'A complete refresh for seats, carpets, dashboard, trims, glass and odor-sensitive surfaces.',
      bestStep1: 'Vacuum and dust extraction',
      bestStep2: 'Steam clean fabric and plastics',
      bestStep3: 'Glass, dashboard and finishing shine',
      startingAt: 'Starting at',
      bookPackage: 'Book this package',
      servicesEyebrow: 'Services built to impress',
      servicesTitle: 'Complete cleaning that feels fresh, fast, and focused.',
      serviceCar: 'Car Cleaning',
      serviceCarText: 'Inside-out detailing, paint care, upholstery refresh and full exterior shine for every vehicle.',
      serviceHome: 'Home & Office',
      serviceHomeText: 'Deep clean packages for kitchens, bathrooms, living areas and workspace surfaces with safe, premium products.',
      serviceSofa: 'Sofa & Upholstery',
      serviceSofaText: 'Steam cleaning, stain removal and fabric protection for sofas, armchairs and textile furniture.',
      serviceGarden: 'Garden & Outdoor',
      serviceGardenText: 'Terrace cleaning, outdoor furniture care and debris removal to keep gardens and driveways immaculate.',
      from59: 'from €59',
      from79: 'from €79',
      from99: 'from €99',
      from119: 'from €119',
      from139: 'from €139',
      from249: 'from €249',
      from499: 'from €499',
      packagesEyebrow: 'Car detailing packages',
      packagesTitle: 'Pick the level of care your car needs.',
      packagesText: 'Each package is priced by vehicle size. Final pricing can vary slightly depending on condition, stain level, and extra requests.',
      pkgExpress: 'Express wash',
      pkgExpressText: 'A quick exterior refresh for cars that need a clean, polished look without a deep interior service.',
      pkgExpressShort: 'Fast exterior refresh',
      pkgInterior: 'Interior reset',
      pkgInteriorText: 'Focused interior cleaning for seats, carpets, plastics, glass and everyday dust buildup.',
      pkgInteriorShort: 'Seats, plastics, carpets',
      pkgFull: 'Full detail',
      pkgFullText: 'The most complete standard package: exterior wash plus a polished, refreshed interior finish.',
      pkgFullShort: 'Inside and outside finish',
      pkgDeep: 'Deep clean',
      pkgDeepText: 'Designed for heavy dirt, stains, odor-sensitive interiors and cars that need serious restoration.',
      pkgDeepShort: 'Heavy dirt and stains',
      pkgVip: 'Showroom / VIP',
      pkgVipText: 'Premium preparation for a top-level finish with extra attention to visible details and presentation.',
      pkgVipShort: 'Premium correction finish',
      popular: 'Popular',
      trustMobile: 'Mobile team',
      trustMobileText: 'We bring equipment to you',
      trustLux: 'Luxembourg-wide',
      trustLuxText: 'Homes, offices and vehicles',
      trustPremium: 'Premium finish',
      trustPremiumText: 'Detail-minded cleaning process',
      howEyebrow: 'Easy booking, real results',
      howTitle: 'From booking to shining in three smooth steps.',
      how1Title: 'Book online',
      how1Text: 'Select your service, choose a time and we arrive ready with all equipment.',
      how2Title: 'Professional service',
      how2Text: 'Experienced cleaners use eco-friendly products designed for cars, homes and furniture.',
      how3Title: 'Enjoy the glow',
      how3Text: 'Receive a complete walkthrough and satisfaction check before we leave your space refreshed.',
      reviewsEyebrow: 'Trusted in Luxembourg',
      reviewsTitle: 'What our clients say after the clean.',
      review1: '"GoClean Lux made my car look brand new again. The team arrived on time, and the finish was flawless."',
      review2: '"They cleaned our living room sofa and it looked amazing. Friendly service and no fuss booking."',
      review3: '"Excellent garden patio cleaning. The terrace was spotless and the crew left everything tidy."',
      bookingEyebrow: 'Ready for a spotless finish?',
      bookingTitle: 'Book your GoClean Lux session today.',
      bookingText: 'Pick a service, choose a date and time, then send your request instantly.',
      step1: 'Step 1',
      step2: 'Step 2',
      step3: 'Step 3',
      step4: 'Step 4',
      step5: 'Step 5',
      stepServiceTitle: 'Choose the service',
      stepServiceText: 'Start with the type of cleaning you need.',
      chooseService: 'Choose service',
      bookingCarSmall: 'Mobile detailing packages',
      bookingHomeSmall: 'Deep cleaning for interiors',
      bookingSofaSmall: 'Steam and fabric refresh',
      bookingGardenSmall: 'Terraces and exterior care',
      stepPackageTitle: 'Choose the car package',
      stepPackageText: 'Pick the level of detail. The image and description explain what each package is for.',
      choosePackage: 'Choose car package',
      stepVehicleTitle: 'Choose the vehicle size',
      stepVehicleText: 'This helps calculate the estimate for your selected package.',
      vehicleSize: 'Vehicle size',
      cityCar: 'City car',
      berlina: 'Berlina',
      vehicleNote: 'Choose the size that best fits your vehicle. Final price may vary based on condition and extra service needs.',
      stepDateTitle: 'Choose date and time',
      stepDateText: 'Select your preferred day and one available 3-hour arrival window.',
      preferredDate: 'Preferred date',
      availableSlots: 'Available 3-hour slots',
      stepDetailsTitle: 'Your contact details',
      stepDetailsText: 'We use these details to confirm your booking.',
      fullName: 'Full name',
      phoneNumber: 'Phone number',
      emailAddress: 'Email address',
      serviceAddress: 'Service address',
      notes: 'Notes',
      requestBooking: 'Request booking',
      formNote: 'We’ll confirm your booking and send a summary to your email after you submit.',
      namePlaceholder: 'Your name',
      addressPlaceholder: 'Street, city, Luxembourg',
      notesPlaceholder: 'Tell us anything useful: car model, access details, stains, parking...',
      summaryTitle: 'Booking summary',
      summaryService: 'Service',
      summaryPackage: 'Package',
      summaryVehicle: 'Vehicle',
      summaryDate: 'Date',
      summaryTime: 'Time',
      summaryEstimate: 'Estimate',
      summaryDuration: 'Duration',
      duration3: '3 hours',
      selectDate: 'Select a date',
      pickSlot: 'Pick a slot',
      notApplicable: 'N/A',
      summaryCopy: 'All bookings are offered within a 9:00–19:00 window. Choose your preferred 3-hour arrival slot.',
      assurance1: 'Instant request',
      assurance1Text: 'Your details are sent to GoClean Lux.',
      assurance2: 'Manual confirmation',
      assurance2Text: 'We confirm the exact arrival time with you.',
      assurance3: 'Mobile service',
      assurance3Text: 'We arrive with the cleaning equipment.',
      footerText: 'Mobile Cleaning & Detailing in Luxembourg',
      modalEyebrow: 'Booking request sent',
      modalThanks: 'Thank you,',
      modalSent: 'Your request has been received and GoClean Lux has been emailed the booking details.',
      modalSaved: 'Your request has been received. Email delivery still needs SMTP settings before live bookings can arrive in your mailbox.',
      done: 'Done',
      slotEmpty: 'No slots available for this date. Please choose another day.',
      chooseSlotError: 'Please choose a time slot before submitting.',
      sending: 'Sending request...',
      bookingSuccessEmail: 'Booking request sent. We will confirm your appointment shortly.',
      bookingSuccessSaved: 'Booking request captured. Email delivery still needs to be configured.',
    },
    fr: {
      brandSubtext: 'Nettoyage mobile & detailing',
      pageTitle: 'GoClean Lux | Nettoyage mobile & detailing',
      navServices: 'Services',
      navHow: 'Fonctionnement',
      navReviews: 'Avis',
      navBook: 'Réserver',
      heroEyebrow: 'Nettoyage premium. Partout. À tout moment.',
      heroTitle: 'Detailing auto avec la puissance du nettoyage à domicile.',
      heroText: 'GoClean Lux apporte une finition impeccable aux voitures, canapés, maisons, jardins et bureaux avec des services mobiles adaptés au Luxembourg.',
      heroQuote: 'Demander un devis',
      heroServices: 'Voir les services',
      heroClients: 'clients satisfaits',
      heroFast: 'réservation rapide',
      heroEco: 'produits premium',
      bestBadge: 'Meilleure vente',
      bestEyebrow: 'Forfait le plus réservé',
      bestTitle: 'Detailing intérieur complet',
      bestText: 'Un rafraîchissement complet des sièges, tapis, tableau de bord, plastiques, vitres et surfaces sensibles aux odeurs.',
      bestStep1: 'Aspiration et extraction de poussière',
      bestStep2: 'Nettoyage vapeur des tissus et plastiques',
      bestStep3: 'Vitres, tableau de bord et finition brillante',
      startingAt: 'À partir de',
      bookPackage: 'Réserver ce forfait',
      servicesEyebrow: 'Des services qui impressionnent',
      servicesTitle: 'Un nettoyage complet, frais, rapide et précis.',
      serviceCar: 'Nettoyage voiture',
      serviceCarText: 'Detailing intérieur et extérieur, soin de peinture, textiles et finition brillante pour chaque véhicule.',
      serviceHome: 'Maison & Bureau',
      serviceHomeText: 'Formules de nettoyage en profondeur pour cuisines, salles de bain, espaces de vie et surfaces de travail.',
      serviceSofa: 'Canapé & Tissus',
      serviceSofaText: 'Nettoyage vapeur, détachage et protection textile pour canapés, fauteuils et meubles en tissu.',
      serviceGarden: 'Jardin & Extérieur',
      serviceGardenText: 'Nettoyage de terrasses, mobilier extérieur et allées pour garder vos espaces impeccables.',
      from59: 'dès €59',
      from79: 'dès €79',
      from99: 'dès €99',
      from119: 'dès €119',
      from139: 'dès €139',
      from249: 'dès €249',
      from499: 'dès €499',
      packagesEyebrow: 'Forfaits detailing voiture',
      packagesTitle: 'Choisissez le niveau de soin adapté à votre voiture.',
      packagesText: 'Chaque forfait dépend de la taille du véhicule. Le prix final peut varier selon l’état, les taches et les demandes supplémentaires.',
      pkgExpress: 'Lavage express',
      pkgExpressText: 'Un rafraîchissement extérieur rapide pour une voiture propre et soignée, sans nettoyage intérieur complet.',
      pkgExpressShort: 'Rafraîchissement extérieur rapide',
      pkgInterior: 'Reset intérieur',
      pkgInteriorText: 'Nettoyage ciblé des sièges, tapis, plastiques, vitres et poussières du quotidien.',
      pkgInteriorShort: 'Sièges, plastiques, tapis',
      pkgFull: 'Detail complet',
      pkgFullText: 'Le forfait standard le plus complet : lavage extérieur et finition intérieure propre et soignée.',
      pkgFullShort: 'Finition intérieure et extérieure',
      pkgDeep: 'Nettoyage profond',
      pkgDeepText: 'Idéal pour saleté importante, taches, odeurs et intérieurs qui demandent une vraie remise en état.',
      pkgDeepShort: 'Saleté intense et taches',
      pkgVip: 'Showroom / VIP',
      pkgVipText: 'Préparation premium pour une finition haut niveau avec attention maximale aux détails visibles.',
      pkgVipShort: 'Finition correction premium',
      popular: 'Populaire',
      trustMobile: 'Équipe mobile',
      trustMobileText: 'Nous apportons le matériel',
      trustLux: 'Partout au Luxembourg',
      trustLuxText: 'Maisons, bureaux et véhicules',
      trustPremium: 'Finition premium',
      trustPremiumText: 'Processus de nettoyage précis',
      howEyebrow: 'Réservation facile, vrais résultats',
      howTitle: 'De la réservation à la brillance en trois étapes simples.',
      how1Title: 'Réservez en ligne',
      how1Text: 'Choisissez votre service, votre créneau, et nous arrivons avec tout le matériel.',
      how2Title: 'Service professionnel',
      how2Text: 'Nos produits sont adaptés aux voitures, maisons et meubles, avec une approche soignée.',
      how3Title: 'Profitez du résultat',
      how3Text: 'Nous vérifions le résultat avec vous avant de quitter les lieux.',
      reviewsEyebrow: 'Approuvé au Luxembourg',
      reviewsTitle: 'Ce que disent nos clients après le nettoyage.',
      review1: '"GoClean Lux a rendu ma voiture comme neuve. L’équipe est arrivée à l’heure et la finition était impeccable."',
      review2: '"Ils ont nettoyé notre canapé du salon et le résultat était superbe. Service sympathique et réservation simple."',
      review3: '"Excellent nettoyage de terrasse. Tout était impeccable et l’équipe a laissé l’espace propre."',
      bookingEyebrow: 'Prêt pour une finition impeccable ?',
      bookingTitle: 'Réservez votre session GoClean Lux.',
      bookingText: 'Choisissez un service, une date et un créneau, puis envoyez votre demande instantanément.',
      step1: 'Étape 1',
      step2: 'Étape 2',
      step3: 'Étape 3',
      step4: 'Étape 4',
      step5: 'Étape 5',
      stepServiceTitle: 'Choisissez le service',
      stepServiceText: 'Commencez par le type de nettoyage dont vous avez besoin.',
      chooseService: 'Choisir le service',
      bookingCarSmall: 'Forfaits detailing mobile',
      bookingHomeSmall: 'Nettoyage intérieur en profondeur',
      bookingSofaSmall: 'Vapeur et rafraîchissement textile',
      bookingGardenSmall: 'Terrasses et extérieur',
      stepPackageTitle: 'Choisissez le forfait voiture',
      stepPackageText: 'Choisissez le niveau de détail. L’image et la description expliquent chaque forfait.',
      choosePackage: 'Choisir le forfait voiture',
      stepVehicleTitle: 'Choisissez la taille du véhicule',
      stepVehicleText: 'Cela permet de calculer l’estimation du forfait choisi.',
      vehicleSize: 'Taille du véhicule',
      cityCar: 'Citadine',
      berlina: 'Berline',
      vehicleNote: 'Choisissez la taille la plus proche de votre véhicule. Le prix final peut varier selon l’état et les demandes supplémentaires.',
      stepDateTitle: 'Choisissez la date et l’heure',
      stepDateText: 'Sélectionnez votre jour préféré et un créneau disponible de 3 heures.',
      preferredDate: 'Date souhaitée',
      availableSlots: 'Créneaux disponibles de 3 heures',
      stepDetailsTitle: 'Vos coordonnées',
      stepDetailsText: 'Nous utilisons ces informations pour confirmer votre réservation.',
      fullName: 'Nom complet',
      phoneNumber: 'Numéro de téléphone',
      emailAddress: 'Adresse e-mail',
      serviceAddress: 'Adresse du service',
      notes: 'Notes',
      requestBooking: 'Envoyer la demande',
      formNote: 'Nous confirmerons votre réservation et vous enverrons un résumé après l’envoi.',
      namePlaceholder: 'Votre nom',
      addressPlaceholder: 'Rue, ville, Luxembourg',
      notesPlaceholder: 'Informations utiles : modèle de voiture, accès, taches, parking...',
      summaryTitle: 'Résumé de réservation',
      summaryService: 'Service',
      summaryPackage: 'Forfait',
      summaryVehicle: 'Véhicule',
      summaryDate: 'Date',
      summaryTime: 'Heure',
      summaryEstimate: 'Estimation',
      summaryDuration: 'Durée',
      duration3: '3 heures',
      selectDate: 'Choisir une date',
      pickSlot: 'Choisir un créneau',
      notApplicable: 'N/A',
      summaryCopy: 'Les réservations sont proposées entre 9:00 et 19:00. Choisissez votre créneau d’arrivée de 3 heures.',
      assurance1: 'Demande instantanée',
      assurance1Text: 'Vos informations sont envoyées à GoClean Lux.',
      assurance2: 'Confirmation manuelle',
      assurance2Text: 'Nous confirmons l’heure exacte d’arrivée avec vous.',
      assurance3: 'Service mobile',
      assurance3Text: 'Nous arrivons avec le matériel de nettoyage.',
      footerText: 'Nettoyage mobile & detailing au Luxembourg',
      modalEyebrow: 'Demande envoyée',
      modalThanks: 'Merci,',
      modalSent: 'Votre demande a été reçue et les détails ont été envoyés à GoClean Lux par e-mail.',
      modalSaved: 'Votre demande a été reçue. L’envoi e-mail nécessite encore la configuration SMTP pour les réservations en direct.',
      done: 'Terminé',
      slotEmpty: 'Aucun créneau disponible pour cette date. Veuillez choisir un autre jour.',
      chooseSlotError: 'Veuillez choisir un créneau avant d’envoyer.',
      sending: 'Envoi de la demande...',
      bookingSuccessEmail: 'Demande de réservation envoyée. Nous confirmerons votre rendez-vous rapidement.',
      bookingSuccessSaved: 'Demande de réservation enregistrée. L’envoi e-mail doit encore être configuré.',
    },
  };

  function t(key) {
    return translations[currentLanguage][key] || translations.en[key] || key;
  }

  function localizePriceLabel(label) {
    return currentLanguage === 'fr' ? label.replace('from', 'dès') : label;
  }

  function formatPackageLabel(value) {
    return {
      'Express wash': t('pkgExpress'),
      'Interior reset': t('pkgInterior'),
      'Full detail': t('pkgFull'),
      'Deep clean': t('pkgDeep'),
      'Showroom / VIP': t('pkgVip'),
    }[value] || value;
  }

  function formatServiceLabel(value) {
    return {
      'Car Cleaning': t('serviceCar'),
      'Home & Office': t('serviceHome'),
      'Sofa & Upholstery': t('serviceSofa'),
      'Garden & Outdoor': t('serviceGarden'),
    }[value] || value;
  }

  function applyLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language;
    document.title = t('pageTitle');
    languageButtons.forEach((button) => {
      button.classList.toggle('active', button.dataset.lang === language);
    });
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-placeholder-key]').forEach((element) => {
      element.placeholder = t(element.dataset.placeholderKey);
    });
    updateSummary();
  }

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

  languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyLanguage(button.dataset.lang);
    });
  });

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
      slotContainer.innerHTML = `<p class="slot-empty">${t('slotEmpty')}</p>`;
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
      cityCar: t('cityCar'),
      berlina: t('berlina'),
      suv: 'SUV',
      xl: 'XL / Van',
    }[value] || t('summaryVehicle');
  }

  function getEstimate() {
    if (serviceSelect.value !== 'Car Cleaning') {
      return { amount: null, text: localizePriceLabel(serviceDetails[serviceSelect.value]?.price || 'Estimate on request') };
    }

    const packageInfo = carPackagePrices[selectedPackage];
    const sizeInfo = packageInfo ? packageInfo[selectedCarSize] : null;

    if (!sizeInfo) {
      return { amount: null, text: currentLanguage === 'fr' ? 'Estimation sur demande' : 'Estimate on request' };
    }

    return { amount: sizeInfo.amount, text: localizePriceLabel(sizeInfo.label) };
  }

  function updateBookingFieldsVisibility() {
    const carDetailsVisible = serviceSelect.value === 'Car Cleaning';
    packageStepTitle.style.display = carDetailsVisible ? '' : 'none';
    serviceTypeRow.style.display = carDetailsVisible ? '' : 'none';
    vehicleStepTitle.style.display = carDetailsVisible ? '' : 'none';
    carSizeRow.style.display = carDetailsVisible ? '' : 'none';
  }

  function updateSummary() {
    const estimate = getEstimate();

    summaryService.textContent = formatServiceLabel(serviceSelect.value);
    summaryPackage.textContent = serviceSelect.value === 'Car Cleaning' ? formatPackageLabel(selectedPackage) : t('notApplicable');
    summaryVehicle.textContent = serviceSelect.value === 'Car Cleaning' ? formatVehicleLabel(selectedCarSize) : t('notApplicable');
    summaryDate.textContent = dateSelect.value ? dateSelect.value : t('selectDate');
    summaryTime.textContent = selectedSlot ? selectedSlot : t('pickSlot');
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
    modalCopy.textContent = mailSent ? t('modalSent') : t('modalSaved');
    modalSummary.innerHTML = `
      <div><span>${t('summaryService')}</span><strong>${formatServiceLabel(booking.service)}</strong></div>
      <div><span>${t('summaryPackage')}</span><strong>${booking.serviceType ? formatPackageLabel(booking.serviceType) : t('notApplicable')}</strong></div>
      <div><span>${t('summaryVehicle')}</span><strong>${booking.carSize || t('notApplicable')}</strong></div>
      <div><span>${t('summaryDate')}</span><strong>${booking.date}</strong></div>
      <div><span>${t('summaryTime')}</span><strong>${booking.time}</strong></div>
      <div><span>${t('summaryEstimate')}</span><strong>${booking.estimate}</strong></div>
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
      bookingMessage.textContent = t('chooseSlotError');
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
    submitButton.textContent = t('sending');
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

      bookingMessage.textContent = result.mailSent ? t('bookingSuccessEmail') : t('bookingSuccessSaved');
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
      submitButton.textContent = t('requestBooking');
    }
  });

  updateBookingFieldsVisibility();
  setTodayMinimum();
  loadAvailableSlots(dateSelect.value);
  applyLanguage(currentLanguage);
});
