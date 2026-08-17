(function () {
  'use strict';

  /* ---------------------------------------------------------
     i18n strings for JS-generated UI text (form validation,
     submit status). Page copy itself lives in each language's
     HTML file — this only covers text main.js writes at runtime.
  --------------------------------------------------------- */
  var STRINGS = {
    lt: {
      fieldRequired: 'Šis laukas yra privalomas.',
      consentRequired: 'Būtina patvirtinti sutikimą.',
      emailInvalid: 'Įveskite teisingą el. pašto adresą.',
      formInvalid: 'Prašome patikrinti pažymėtus laukus ir bandyti dar kartą.',
      sending: 'Siunčiama…',
      success: 'Ačiū! Jūsų užklausa gauta — susisieksime artimiausiu metu.',
      sendError: 'Nepavyko išsiųsti užklausos. Bandykite dar kartą arba rašykite el. paštu kybartai@ebresa.lt.'
    },
    en: {
      fieldRequired: 'This field is required.',
      consentRequired: 'Please confirm your consent.',
      emailInvalid: 'Enter a valid email address.',
      formInvalid: 'Please check the highlighted fields and try again.',
      sending: 'Sending…',
      success: 'Thank you! Your request has been received — we’ll get back to you shortly.',
      sendError: 'Couldn’t send your request. Please try again or email kybartai@ebresa.lt.'
    },
    pl: {
      fieldRequired: 'To pole jest wymagane.',
      consentRequired: 'Prosimy potwierdzić zgodę.',
      emailInvalid: 'Podaj prawidłowy adres e-mail.',
      formInvalid: 'Sprawdź zaznaczone pola i spróbuj ponownie.',
      sending: 'Wysyłanie…',
      success: 'Dziękujemy! Otrzymaliśmy Twoje zapytanie — skontaktujemy się wkrótce.',
      sendError: 'Nie udało się wysłać zapytania. Spróbuj ponownie lub napisz na kybartai@ebresa.lt.'
    }
  };

  var pageLang = (document.documentElement.lang || 'lt').slice(0, 2).toLowerCase();
  var t = STRINGS[pageLang] || STRINGS.lt;

  /* ---------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------------------------------------------------
     Cookie consent
     Categories: necessary (always on), analytics (opt-in)
     Consent is stored in localStorage as JSON:
     { necessary: true, analytics: false, ts: 169... }
  --------------------------------------------------------- */
  var CONSENT_KEY = 'ebresa_cookie_consent';

  // GA4 Measurement ID. Analytics only loads once a visitor accepts the
  // "Analytics" cookie category — see loadAnalytics()/applyConsent() below.
  var GA_MEASUREMENT_ID = 'G-24P4DNX3M9';

  function getConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analyticsEnabled) {
    var consent = { necessary: true, analytics: !!analyticsEnabled, ts: Date.now() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch (e) {}
    return consent;
  }

  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID) return; // not configured yet — no-op by design
    if (window.__ebresaGaLoaded) return;
    window.__ebresaGaLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function applyConsent(consent) {
    if (consent && consent.analytics) loadAnalytics();
  }

  var cookieBanner = document.getElementById('cookie-banner');
  var cookieModal = document.getElementById('cookie-modal');
  var analyticsToggle = document.getElementById('cookie-toggle-analytics');

  function showBanner() { if (cookieBanner) cookieBanner.classList.add('is-visible'); }
  function hideBanner() { if (cookieBanner) cookieBanner.classList.remove('is-visible'); }
  function openModal() {
    if (!cookieModal) return;
    var existing = getConsent();
    if (analyticsToggle) analyticsToggle.checked = existing ? !!existing.analytics : false;
    cookieModal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!cookieModal) return;
    cookieModal.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      showBanner();
    }
  });

  document.querySelectorAll('[data-cookie-accept-all]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var consent = saveConsent(true);
      applyConsent(consent);
      hideBanner();
      closeModal();
    });
  });

  document.querySelectorAll('[data-cookie-necessary-only]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      saveConsent(false);
      hideBanner();
      closeModal();
    });
  });

  document.querySelectorAll('[data-cookie-settings]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal();
    });
  });

  document.querySelectorAll('[data-cookie-save]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wantsAnalytics = analyticsToggle ? analyticsToggle.checked : false;
      var consent = saveConsent(wantsAnalytics);
      applyConsent(consent);
      hideBanner();
      closeModal();
    });
  });

  document.querySelectorAll('[data-cookie-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  if (cookieModal) {
    cookieModal.addEventListener('click', function (e) {
      if (e.target === cookieModal) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------------------------------------------------------
     Quote / request form — submitted via FormSubmit (email
     delivery, no backend required). Falls back to a normal
     POST + redirect if JavaScript/fetch is unavailable.
  --------------------------------------------------------- */
  var quoteForm = document.getElementById('quote-form');

  if (quoteForm) {
    var statusBox = document.getElementById('quote-form-status');

    function setFieldError(field, message) {
      var wrapper = field.closest('.field');
      if (!wrapper) return;
      wrapper.classList.add('has-error');
      var errEl = wrapper.querySelector('.field-error');
      if (errEl) errEl.textContent = message;
    }

    function clearFieldError(field) {
      var wrapper = field.closest('.field');
      if (!wrapper) return;
      wrapper.classList.remove('has-error');
    }

    function showStatus(type, message) {
      if (!statusBox) return;
      statusBox.textContent = message;
      statusBox.className = 'form-status is-visible is-' + type;
    }

    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = quoteForm.querySelectorAll('[required]');
      var isValid = true;

      requiredFields.forEach(function (field) {
        clearFieldError(field);
        var value = (field.value || '').trim();

        if (field.type === 'checkbox' && !field.checked) {
          isValid = false;
          setFieldError(field, t.consentRequired);
          return;
        }
        if (field.type !== 'checkbox' && !value) {
          isValid = false;
          setFieldError(field, t.fieldRequired);
          return;
        }
        if (field.type === 'email' && value) {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            isValid = false;
            setFieldError(field, t.emailInvalid);
          }
        }
      });

      if (!isValid) {
        showStatus('error', t.formInvalid);
        return;
      }

      var submitBtn = quoteForm.querySelector('[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = t.sending; }

      var formData = new FormData(quoteForm);

      fetch(quoteForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            showStatus('success', t.success);
            quoteForm.reset();
          } else {
            throw new Error('Submission failed');
          }
        })
        .catch(function () {
          showStatus('error', t.sendError);
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        });
    });
  }

  /* ---------------------------------------------------------
     Pre-fill service select when a service card CTA is used
  --------------------------------------------------------- */
  document.querySelectorAll('[data-prefill-service]').forEach(function (el) {
    el.addEventListener('click', function () {
      var select = document.getElementById('quote-service');
      if (select) select.value = el.getAttribute('data-prefill-service');
    });
  });

  /* ---------------------------------------------------------
     Current year in footer
  --------------------------------------------------------- */
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
