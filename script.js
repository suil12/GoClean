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
  const modalWhatsApp = document.getElementById('modalWhatsApp');
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
  const bookingStepElements = document.querySelectorAll('[data-booking-step]');
  const bookingWizardNav = document.getElementById('bookingWizardNav');
  const bookingBack = document.getElementById('bookingBack');
  const bookingNext = document.getElementById('bookingNext');
  const bookingStepProgress = document.getElementById('bookingStepProgress');
  const bookingWizardMessage = document.getElementById('bookingWizardMessage');
  const mobileBookingQuery = window.matchMedia('(max-width: 780px)');
  const bookingPlacement = document.getElementById('bookingPlacement');
  const bookingPanel = document.getElementById('contact');
  const resultsSection = document.getElementById('results');
  const resultsGrid = document.getElementById('resultsGrid');

  if (bookingPlacement && bookingPanel && resultsSection) {
    bookingPlacement.replaceWith(bookingPanel, resultsSection);
  }

  let selectedPackage = 'Complete Clean';
  let selectedCarSize = 'cityCar';
  let availableSlots = [];
  let currentLanguage = 'en';
  let currentBookingStep = 1;
  const totalBookingSteps = 4;
  let slotAvailabilityMessage = '';

  const translations = {
    en: {
      brandSubtext: 'Mobile Car Cleaning & Detailing',
      pageTitle: 'GoClean Lux | Mobile Car Cleaning & Detailing',
      navServices: 'Services',
      navHow: 'How it Works',
      navReviews: 'Reviews',
      navBook: 'Book Now',
      heroEyebrow: 'Professional mobile car cleaning & detailing',
      heroTitle: 'Car cleaning & detailing at your home.',
      heroText: 'You relax. We take care of your car wherever it is parked, at home or at the office.',
      heroQuote: 'Book your car cleaning',
      heroServices: 'View services',
      heroWhatsApp: 'WhatsApp information',
      heroInstagram: 'Watch our videos',
      heroProof: 'Real mobile car cleaning',
      heroProofInterior: 'Interior detailing',
      heroProofFinish: 'Premium finish',
      heroClients: 'satisfied clients',
      heroFast: 'fast booking',
      heroEco: 'premium products',
      bestBadge: 'Launch Offer',
      bestEyebrow: 'Most booked package',
      bestTitle: 'Complete Clean launch offer',
      bestText: 'Exterior wash, interior refresh, tire dressing and door jamb cleaning at a limited launch price.',
      bestStep1: 'Exterior wash and snow foam finish',
      bestStep2: 'Interior refresh and glass cleaning',
      bestStep3: 'Tire dressing and door jamb cleaning',
      startingAt: 'Starting at',
      bookPackage: 'Book this package',
      servicesEyebrow: 'Services built to impress',
      servicesTitle: 'Complete cleaning that feels fresh, fast, and focused.',
      serviceCar: 'Car Cleaning',
      serviceCarText: 'Professional mobile car detailing at your home, office, or parking spot. We come to you with the equipment.',
      serviceHome: 'Home & Office',
      serviceHomeText: 'Deep clean packages for kitchens, bathrooms, living areas and workspace surfaces with safe, premium products.',
      serviceSofa: 'Sofa & Upholstery',
      serviceSofaText: 'Steam cleaning, stain removal and fabric protection for sofas, armchairs and textile furniture.',
      serviceGarden: 'Garden & Outdoor',
      serviceGardenText: 'Terrace cleaning, outdoor furniture care and debris removal to keep gardens and driveways immaculate.',
      from39: 'from €39',
      from49: 'from €49',
      from59: 'from €59',
      from79: 'from €79',
      from99: 'from €99',
      from119: 'from €119',
      from299: 'from €299',
      packagesEyebrow: 'Car detailing packages',
      packagesTitle: 'Pick the level of care your car needs.',
      packagesText: 'Choose the car service you need, tell us where the car is, and we come to you. Launch prices may vary depending on vehicle size, condition, stain level, and extra requests.',
      resultsEyebrow: 'Real detailing results',
      resultsTitle: 'See the difference before and after.',
      resultsText: 'Real transformations from GoClean Lux mobile detailing sessions.',
      beforeLabel: 'Before',
      afterLabel: 'After',
      pkgExpress: 'Express Exterior Wash',
      pkgExpressText: 'Pre-rinse, snow foam, hand wash, and wheel cleaning for a fast exterior reset.',
      pkgExpressShort: 'Pre-rinse, snow foam, hand wash',
      pkgInterior: 'Interior Refresh',
      pkgInteriorText: 'Full vacuum, dashboard cleaning, plastics wipe-down, and interior glass cleaning.',
      pkgInteriorShort: 'Vacuum, dashboard, glass',
      pkgFull: 'Complete Clean',
      pkgFullText: 'Exterior wash plus interior refresh, tire dressing, and door jamb cleaning.',
      pkgFullShort: 'Exterior wash and interior refresh',
      pkgDeep: 'Deep Interior Detailing',
      pkgDeepText: 'Deep vacuuming, steam cleaning, seat shampoo, and odor treatment.',
      pkgDeepShort: 'Steam, shampoo, odor treatment',
      pkgVip: 'Showroom VIP',
      pkgVipText: 'Premium exterior polishing and showroom preparation for a deeper gloss and refined finish.',
      pkgVipShort: 'Exterior polishing and gloss finish',
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
      bookingTitle: 'Book professional detailing at your home or office.',
      bookingText: 'We come to you wherever you are. Choose your package, vehicle size, address, date and arrival window.',
      promiseHome: 'At home',
      promiseOffice: 'At the office',
      promiseAnywhere: 'Anywhere you are',
      step1: 'Step 1',
      step2: 'Step 2',
      step3: 'Step 3',
      step4: 'Step 4',
      step5: 'Step 5',
      backStep: 'Back',
      nextStep: 'Next',
      stepProgress: 'Step {current} of {total}',
      stepServiceTitle: 'Your mobile car detailing',
      stepServiceText: 'Choose your car package below. We bring the professional equipment to your home, office, or parking spot.',
      chooseService: 'Service',
      bookingCarSmall: 'Mobile detailing packages',
      bookingDetailingTitle: 'Professional car detailing',
      bookingDetailingText: 'Interior refresh, deep interior cleaning, exterior wash, and showroom polishing packages.',
      bookingDetailingPoint1: 'We come to your address',
      bookingDetailingPoint2: 'Launch offers from €39',
      bookingDetailingPoint3: 'Confirmation sent to GoClean Lux',
      bookingHomeSmall: 'Deep cleaning for interiors',
      bookingSofaSmall: 'Steam and fabric refresh',
      bookingGardenSmall: 'Terraces and exterior care',
      stepPackageTitle: 'Which car package?',
      stepPackageText: 'Pick exactly what your car needs. Each package shows the main work included and the launch price.',
      choosePackage: 'Car package',
      stepVehicleTitle: 'What size is your vehicle?',
      stepVehicleText: 'This helps us prepare the right time, products and equipment for your car.',
      vehicleSize: 'Vehicle size',
      cityCar: 'City car',
      berlina: 'Berlina',
      vehicleNote: 'Choose the size that best fits your vehicle. Final price may vary based on condition and extra service needs.',
      stepDateTitle: 'When should we come?',
      stepDateText: 'Select your preferred day and one available 3-hour arrival window.',
      preferredDate: 'Preferred date',
      availableSlots: 'Available 3-hour slots',
      unavailableWeekMessage: 'We are not available this week. Please try the following week, starting from July 28.',
      stepDetailsTitle: 'Where should we come?',
      stepDetailsText: 'Add your contact details and the address where we should arrive.',
      fullName: 'Full name',
      phoneNumber: 'Phone number',
      emailAddress: 'Email address',
      serviceAddress: 'Address where we come',
      notes: 'Notes',
      requestBooking: 'Request booking',
      formNote: 'After you submit, your full request is sent to GoClean Lux and we confirm the appointment with you.',
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
      summaryCopy: 'We arrive at your home, office, or chosen address with the detailing equipment. Choose your preferred 3-hour arrival window.',
      assurance1: 'Instant request',
      assurance1Text: 'Your details are sent to GoClean Lux.',
      assurance2: 'Manual confirmation',
      assurance2Text: 'We confirm the exact arrival time with you.',
      assurance3: 'Mobile service',
      assurance3Text: 'We arrive with the cleaning equipment.',
      footerText: 'Mobile Cleaning & Detailing in Luxembourg',
      modalEyebrow: 'Booking request sent',
      modalThanks: 'Thank you,',
      modalSent: 'Your request has been received and GoClean Lux has been notified with the booking details.',
      modalSaved: 'Your request has been received. GoClean Lux has your booking recap and will confirm manually.',
      sendWhatsAppRecap: 'Send recap on WhatsApp',
      done: 'Done',
      slotEmpty: 'No slots available for this date. Please choose another day. Week from 20 - 27 July is fully booked.',
      chooseSlotError: 'Please choose a time slot before submitting.',
      sending: 'Sending request...',
      bookingSuccessEmail: 'Booking request sent to GoClean Lux on Telegram. We will confirm your appointment shortly.',
      bookingSuccessSaved: 'Booking request received. We will confirm your appointment manually.',
      bookingSendFallback: 'Please send your booking on WhatsApp: +352 661 920 598.',
    },
    fr: {
      brandSubtext: 'Nettoyage automobile mobile & detailing',
      pageTitle: 'GoClean Lux | Nettoyage automobile mobile & detailing',
      navServices: 'Services',
      navHow: 'Fonctionnement',
      navReviews: 'Avis',
      navBook: 'Réserver',
      heroEyebrow: 'Nettoyage automobile mobile & detailing professionnel',
      heroTitle: 'Nettoyage voiture & detailing à domicile.',
      heroText: 'Vous vous détendez. Nous prenons soin de votre voiture à domicile, au bureau ou là où elle est stationnée.',
      heroQuote: 'Réserver votre nettoyage',
      heroServices: 'Voir les services',
      heroWhatsApp: 'Informations sur WhatsApp',
      heroInstagram: 'Voir nos vidéos',
      heroProof: 'Vrai nettoyage auto mobile',
      heroProofInterior: 'Detailing intérieur',
      heroProofFinish: 'Finition premium',
      heroClients: 'clients satisfaits',
      heroFast: 'réservation rapide',
      heroEco: 'produits premium',
      bestBadge: 'Offre lancement',
      bestEyebrow: 'Forfait le plus réservé',
      bestTitle: 'Offre lancement Nettoyage complet',
      bestText: 'Lavage extérieur, rafraîchissement intérieur, dressing pneus et nettoyage des contours de portes au prix lancement.',
      bestStep1: 'Lavage extérieur et finition snow foam',
      bestStep2: 'Rafraîchissement intérieur et nettoyage des vitres',
      bestStep3: 'Dressing pneus et contours de portes',
      startingAt: 'À partir de',
      bookPackage: 'Réserver ce forfait',
      servicesEyebrow: 'Des services qui impressionnent',
      servicesTitle: 'Un nettoyage complet, frais, rapide et précis.',
      serviceCar: 'Nettoyage voiture',
      serviceCarText: 'Detailing mobile professionnel à domicile, au bureau ou sur votre parking. Nous venons à vous avec le matériel.',
      serviceHome: 'Maison & Bureau',
      serviceHomeText: 'Formules de nettoyage en profondeur pour cuisines, salles de bain, espaces de vie et surfaces de travail.',
      serviceSofa: 'Canapé & Tissus',
      serviceSofaText: 'Nettoyage vapeur, détachage et protection textile pour canapés, fauteuils et meubles en tissu.',
      serviceGarden: 'Jardin & Extérieur',
      serviceGardenText: 'Nettoyage de terrasses, mobilier extérieur et allées pour garder vos espaces impeccables.',
      from39: 'dès €39',
      from49: 'dès €49',
      from59: 'dès €59',
      from79: 'dès €79',
      from99: 'dès €99',
      from119: 'dès €119',
      from299: 'dès €299',
      packagesEyebrow: 'Forfaits detailing voiture',
      packagesTitle: 'Choisissez le niveau de soin adapté à votre voiture.',
      packagesText: 'Choisissez le service auto dont vous avez besoin, indiquez où se trouve la voiture, et nous venons à vous. Les prix de lancement peuvent varier selon la taille, l’état, les taches et les demandes supplémentaires.',
      resultsEyebrow: 'Résultats detailing réels',
      resultsTitle: 'Voyez la différence avant et après.',
      resultsText: 'De vraies transformations réalisées par GoClean Lux en detailing mobile.',
      beforeLabel: 'Avant',
      afterLabel: 'Après',
      pkgExpress: 'Lavage extérieur express',
      pkgExpressText: 'Pré-rinçage, snow foam, lavage à la main et nettoyage des jantes pour un extérieur propre rapidement.',
      pkgExpressShort: 'Pré-rinçage, snow foam, lavage main',
      pkgInterior: 'Rafraîchissement intérieur',
      pkgInteriorText: 'Aspiration complète, nettoyage du tableau de bord, plastiques et vitres intérieures.',
      pkgInteriorShort: 'Aspiration, tableau de bord, vitres',
      pkgFull: 'Nettoyage complet',
      pkgFullText: 'Lavage extérieur, rafraîchissement intérieur, dressing pneus et nettoyage des contours de portes.',
      pkgFullShort: 'Lavage extérieur et intérieur',
      pkgDeep: 'Detailing intérieur profond',
      pkgDeepText: 'Aspiration profonde, nettoyage vapeur, shampoing des sièges et traitement des odeurs.',
      pkgDeepShort: 'Vapeur, shampoing, odeurs',
      pkgVip: 'Showroom VIP',
      pkgVipText: 'Polissage extérieur premium et préparation showroom pour une brillance plus profonde et une finition soignée.',
      pkgVipShort: 'Polissage extérieur et finition brillante',
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
      bookingTitle: 'Réservez un detailing professionnel à domicile ou au bureau.',
      bookingText: 'Nous venons à vous où que vous soyez. Choisissez le forfait, la taille du véhicule, l’adresse, la date et le créneau.',
      promiseHome: 'À domicile',
      promiseOffice: 'Au bureau',
      promiseAnywhere: 'Où que vous soyez',
      step1: 'Étape 1',
      step2: 'Étape 2',
      step3: 'Étape 3',
      step4: 'Étape 4',
      step5: 'Étape 5',
      backStep: 'Retour',
      nextStep: 'Suivant',
      stepProgress: 'Étape {current} sur {total}',
      stepServiceTitle: 'Votre detailing auto mobile',
      stepServiceText: 'Choisissez votre forfait voiture ci-dessous. Nous apportons le matériel professionnel à domicile, au bureau ou sur votre parking.',
      chooseService: 'Service',
      bookingCarSmall: 'Forfaits detailing mobile',
      bookingDetailingTitle: 'Detailing voiture professionnel',
      bookingDetailingText: 'Forfaits rafraîchissement intérieur, nettoyage intérieur profond, lavage extérieur et polissage showroom.',
      bookingDetailingPoint1: 'Nous venons à votre adresse',
      bookingDetailingPoint2: 'Offres lancement dès €39',
      bookingDetailingPoint3: 'Confirmation envoyée à GoClean Lux',
      bookingHomeSmall: 'Nettoyage intérieur en profondeur',
      bookingSofaSmall: 'Vapeur et rafraîchissement textile',
      bookingGardenSmall: 'Terrasses et extérieur',
      stepPackageTitle: 'Quel forfait voiture ?',
      stepPackageText: 'Choisissez exactement ce dont votre voiture a besoin. Chaque forfait montre le travail inclus et le prix de lancement.',
      choosePackage: 'Forfait voiture',
      stepVehicleTitle: 'Quelle est la taille du véhicule ?',
      stepVehicleText: 'Cela nous aide à préparer le bon temps, les bons produits et le bon matériel pour votre voiture.',
      vehicleSize: 'Taille du véhicule',
      cityCar: 'Citadine',
      berlina: 'Berline',
      vehicleNote: 'Choisissez la taille la plus proche de votre véhicule. Le prix final peut varier selon l’état et les demandes supplémentaires.',
      stepDateTitle: 'Quand devons-nous venir ?',
      stepDateText: 'Sélectionnez votre jour préféré et un créneau disponible de 3 heures.',
      preferredDate: 'Date souhaitée',
      availableSlots: 'Créneaux disponibles de 3 heures',
      unavailableWeekMessage: 'Nous ne sommes pas disponibles cette semaine. Veuillez essayer la semaine suivante, à partir du 28 juillet.',
      stepDetailsTitle: 'Où devons-nous venir ?',
      stepDetailsText: 'Ajoutez vos coordonnées et l’adresse où nous devons arriver.',
      fullName: 'Nom complet',
      phoneNumber: 'Numéro de téléphone',
      emailAddress: 'Adresse e-mail',
      serviceAddress: 'Adresse où nous venons',
      notes: 'Notes',
      requestBooking: 'Envoyer la demande',
      formNote: 'Après l’envoi, votre demande complète est transmise à GoClean Lux et nous confirmons le rendez-vous avec vous.',
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
      summaryCopy: 'Nous arrivons à votre domicile, au bureau ou à l’adresse choisie avec le matériel de detailing. Choisissez votre créneau d’arrivée de 3 heures.',
      assurance1: 'Demande instantanée',
      assurance1Text: 'Vos informations sont envoyées à GoClean Lux.',
      assurance2: 'Confirmation manuelle',
      assurance2Text: 'Nous confirmons l’heure exacte d’arrivée avec vous.',
      assurance3: 'Service mobile',
      assurance3Text: 'Nous arrivons avec le matériel de nettoyage.',
      footerText: 'Nettoyage mobile & detailing au Luxembourg',
      modalEyebrow: 'Demande envoyée',
      modalThanks: 'Merci,',
      modalSent: 'Votre demande a été reçue et GoClean Lux a été notifié avec les détails de la réservation.',
      modalSaved: 'Votre demande a été reçue. GoClean Lux a le récapitulatif et confirmera manuellement.',
      sendWhatsAppRecap: 'Envoyer le récapitulatif sur WhatsApp',
      done: 'Terminé',
      slotEmpty: 'Aucun créneau disponible pour cette date. Veuillez choisir un autre jour. Semaine du 20 au 27 juillet est complètement réservée.',
      chooseSlotError: 'Veuillez choisir un créneau avant d’envoyer.',
      sending: 'Envoi de la demande...',
      bookingSuccessEmail: 'Demande envoyée à GoClean Lux sur Telegram. Nous confirmerons votre rendez-vous rapidement.',
      bookingSuccessSaved: 'Demande de réservation reçue. Nous confirmerons votre rendez-vous manuellement.',
      bookingSendFallback: 'Veuillez envoyer votre réservation sur WhatsApp : +352 661 920 598.',
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
      'Express Exterior Wash': t('pkgExpress'),
      'Interior Refresh': t('pkgInterior'),
      'Complete Clean': t('pkgFull'),
      'Deep Interior Detailing': t('pkgDeep'),
      'Showroom VIP': t('pkgVip'),
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
    renderBookingWizard();
  }

  yearEl.textContent = new Date().getFullYear();

  const carPackagePrices = {
    'Express Exterior Wash': {
      cityCar: { amount: 39, label: 'from €39' },
      berlina: { amount: 39, label: 'from €39' },
      suv: { amount: 39, label: 'from €39' },
      xl: { amount: 39, label: 'from €39' },
    },
    'Interior Refresh': {
      cityCar: { amount: 49, label: 'from €49' },
      berlina: { amount: 49, label: 'from €49' },
      suv: { amount: 49, label: 'from €49' },
      xl: { amount: 49, label: 'from €49' },
    },
    'Complete Clean': {
      cityCar: { amount: 79, label: 'from €79' },
      berlina: { amount: 79, label: 'from €79' },
      suv: { amount: 79, label: 'from €79' },
      xl: { amount: 79, label: 'from €79' },
    },
    'Deep Interior Detailing': {
      cityCar: { amount: 99, label: 'from €99' },
      berlina: { amount: 99, label: 'from €99' },
      suv: { amount: 99, label: 'from €99' },
      xl: { amount: 99, label: 'from €99' },
    },
    'Showroom VIP': {
      cityCar: { amount: 299, label: 'from €299' },
      berlina: { amount: 299, label: 'from €299' },
      suv: { amount: 299, label: 'from €299' },
      xl: { amount: 299, label: 'from €299' },
    },
  };

  const serviceDetails = {
    'Car Cleaning': { price: 'from €39' },
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

  async function loadResultsGallery() {
    if (!resultsSection || !resultsGrid || window.location.protocol === 'file:') {
      return;
    }

    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.pairs) || data.pairs.length === 0) {
        return;
      }

      resultsGrid.innerHTML = '';
      data.pairs.forEach((pair, index) => {
        const card = document.createElement('article');
        card.className = 'result-pair reveal visible';
        card.innerHTML = `
          <figure>
            <img src="${pair.before}" alt="GoClean Lux detailing before ${index + 1}" loading="lazy" />
            <figcaption data-i18n="beforeLabel">${t('beforeLabel')}</figcaption>
          </figure>
          <figure>
            <img src="${pair.after}" alt="GoClean Lux detailing after ${index + 1}" loading="lazy" />
            <figcaption data-i18n="afterLabel">${t('afterLabel')}</figcaption>
          </figure>
        `;
        resultsGrid.appendChild(card);
      });
      resultsSection.hidden = false;
    } catch (error) {
      resultsSection.hidden = true;
    }
  }

  const revealElements = document.querySelectorAll('.reveal');
  document.documentElement.classList.add('reveal-ready');
  revealElements.forEach((el) => el.classList.add('visible'));

  if ('IntersectionObserver' in window) {
    revealElements.forEach((el) => el.classList.remove('visible'));
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    revealElements.forEach((el) => observer.observe(el));
    window.setTimeout(() => {
      revealElements.forEach((el) => el.classList.add('visible'));
    }, 1200);
  }

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

  function bookingStepLabel() {
    return t('stepProgress')
      .replace('{current}', currentBookingStep)
      .replace('{total}', totalBookingSteps);
  }

  function renderBookingWizard() {
    const isMobileWizard = mobileBookingQuery.matches;
    bookingForm.classList.toggle('wizard-enabled', isMobileWizard);
    bookingWizardNav.hidden = !isMobileWizard;

    bookingStepElements.forEach((element) => {
      const isActive = Number(element.dataset.bookingStep) === currentBookingStep;
      element.classList.toggle('wizard-step-active', !isMobileWizard || isActive);
    });

    bookingBack.disabled = currentBookingStep === 1;
    bookingNext.hidden = currentBookingStep === totalBookingSteps;
    bookingStepProgress.textContent = bookingStepLabel();
    bookingWizardMessage.textContent = '';
  }

  function scrollToCurrentBookingStep() {
    const activeStep = bookingForm.querySelector(`[data-booking-step="${currentBookingStep}"]`);
    activeStep?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function canAdvanceBookingStep() {
    if (currentBookingStep === 3 && !selectedSlot) {
      bookingWizardMessage.textContent = t('chooseSlotError');
      return false;
    }
    return true;
  }

  bookingBack.addEventListener('click', () => {
    currentBookingStep = Math.max(1, currentBookingStep - 1);
    renderBookingWizard();
    scrollToCurrentBookingStep();
  });

  bookingNext.addEventListener('click', () => {
    if (!canAdvanceBookingStep()) {
      return;
    }
    currentBookingStep = Math.min(totalBookingSteps, currentBookingStep + 1);
    renderBookingWizard();
    scrollToCurrentBookingStep();
  });

  const handleBookingViewportChange = () => {
    currentBookingStep = Math.min(currentBookingStep, totalBookingSteps);
    renderBookingWizard();
  };

  if (typeof mobileBookingQuery.addEventListener === 'function') {
    mobileBookingQuery.addEventListener('change', handleBookingViewportChange);
  } else {
    mobileBookingQuery.addListener(handleBookingViewportChange);
  }

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
      slotAvailabilityMessage = '';
      renderSlots();
      return;
    }

    try {
      const response = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.slots)) {
        availableSlots = data.slots;
        slotAvailabilityMessage = data.message || '';
      } else {
        availableSlots = [...timeSlots];
        slotAvailabilityMessage = '';
      }
    } catch (error) {
      availableSlots = [...timeSlots];
      slotAvailabilityMessage = '';
    }

    if (!availableSlots.includes(selectedSlot)) {
      selectedSlot = null;
    }

    renderSlots();
  }

  function renderSlots() {
    slotContainer.innerHTML = '';
    if (availableSlots.length === 0) {
      slotContainer.innerHTML = `<p class="slot-empty">${slotAvailabilityMessage || t('slotEmpty')}</p>`;
      return;
    }

    if (slotAvailabilityMessage) {
      const message = document.createElement('p');
      message.className = 'slot-empty slot-note';
      message.textContent = slotAvailabilityMessage;
      slotContainer.appendChild(message);
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
        bookingWizardMessage.textContent = '';
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
    serviceSelect.value = 'Car Cleaning';
    packageStepTitle.style.display = '';
    serviceTypeRow.style.display = '';
    vehicleStepTitle.style.display = '';
    carSizeRow.style.display = '';
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
    serviceSelect.value = 'Car Cleaning';
    currentBookingStep = 1;
    updateBookingFieldsVisibility();
    selectedSlot = null;
    updateSummary();
    loadAvailableSlots(dateSelect.value);
    renderBookingWizard();
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
    bookingWizardMessage.textContent = '';
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

  function showBookingModal(booking, notificationSent) {
    modalName.textContent = booking.name;
    modalCopy.textContent = notificationSent ? t('modalSent') : t('modalSaved');
    modalSummary.innerHTML = `
      <div><span>${t('summaryService')}</span><strong>${formatServiceLabel(booking.service)}</strong></div>
      <div><span>${t('summaryPackage')}</span><strong>${booking.serviceType ? formatPackageLabel(booking.serviceType) : t('notApplicable')}</strong></div>
      <div><span>${t('summaryVehicle')}</span><strong>${booking.carSize || t('notApplicable')}</strong></div>
      <div><span>${t('summaryDate')}</span><strong>${booking.date}</strong></div>
      <div><span>${t('summaryTime')}</span><strong>${booking.time}</strong></div>
      <div><span>${t('summaryEstimate')}</span><strong>${booking.estimate}</strong></div>
    `;
    const whatsappRecap = [
      'New GoClean Lux booking',
      `Package: ${formatPackageLabel(booking.serviceType)}`,
      `Vehicle: ${booking.carSize}`,
      `Date: ${booking.date}`,
      `Time: ${booking.time}`,
      `Estimate: ${booking.estimate}`,
      `Customer: ${booking.name}`,
      `Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Address: ${booking.address}`,
      booking.notes ? `Notes: ${booking.notes}` : '',
    ].filter(Boolean).join('\n');
    modalWhatsApp.href = `https://wa.me/352661920598?text=${encodeURIComponent(whatsappRecap)}`;
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
      language: currentLanguage,
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
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : { message: 'Booking API is not active on this deployment yet.' };

      if (!response.ok) {
        const details = result.emailError || result.error ? ` ${result.emailError || result.error}` : '';
        throw new Error(`${result.message || 'Could not send booking request.'}${details}`);
      }

      bookingMessage.textContent = result.notificationSent ? t('bookingSuccessEmail') : t('bookingSuccessSaved');
      bookingMessage.className = 'booking-message success';
      showBookingModal(result.booking || booking, result.notificationSent);
      bookingForm.reset();
      setTodayMinimum();
      selectedSlot = null;
      currentBookingStep = 1;
      updateSummary();
      renderSlots();
      renderBookingWizard();
    } catch (error) {
      bookingMessage.textContent = `${error.message} ${t('bookingSendFallback')}`;
      bookingMessage.className = 'booking-message error';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = t('requestBooking');
    }
  });

  updateBookingFieldsVisibility();
  setTodayMinimum();
  loadAvailableSlots(dateSelect.value);
  loadResultsGallery();
  renderBookingWizard();
  applyLanguage(currentLanguage);
});
