(function () {
  'use strict';

  var measurementId = 'G-5PP6RMZNC7';
  var storageKey = 'pb_analytics_consent';
  var bannerId = 'cookie-consent';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  function readChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // Jeśli pamięć lokalna jest niedostępna, wybór obowiązuje do zamknięcia strony.
    }
  }

  function updateConsent(granted) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: granted ? 'granted' : 'denied'
    });
  }

  function loadAnalytics() {
    if (document.querySelector('script[data-google-analytics]')) return;

    updateConsent(true);

    var script = document.createElement('script');
    script.async = true;
    script.dataset.googleAnalytics = 'true';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }

  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; Path=/; Domain=.' + window.location.hostname + '; SameSite=Lax';
      }
    });
  }

  function closeBanner() {
    var banner = document.getElementById(bannerId);
    if (banner) banner.remove();
  }

  function choose(choice) {
    saveChoice(choice);

    if (choice === 'granted') {
      loadAnalytics();
    } else {
      updateConsent(false);
      removeAnalyticsCookies();
    }

    closeBanner();
    addSettingsControl();
  }

  function showBanner() {
    closeBanner();

    var banner = document.createElement('section');
    banner.id = bannerId;
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.setAttribute('aria-describedby', 'cookie-consent-description');
    banner.innerHTML =
      '<div class="cookie-consent-copy">' +
        '<strong id="cookie-consent-title">Twoja prywatność</strong>' +
        '<p id="cookie-consent-description">Za Twoją zgodą użyjemy Google Analytics, aby sprawdzić, jak odwiedzający korzystają ze strony. Odrzucenie analityki nie ograniczy jej działania. <a href="/polityka-prywatnosci/">Dowiedz się więcej</a>.</p>' +
      '</div>' +
      '<div class="cookie-consent-actions">' +
        '<button class="btn btn-outline" type="button" data-consent="denied">Tylko niezbędne</button>' +
        '<button class="btn btn-primary" type="button" data-consent="granted">Akceptuję analitykę</button>' +
      '</div>';

    banner.querySelectorAll('[data-consent]').forEach(function (button) {
      button.addEventListener('click', function () {
        choose(button.dataset.consent);
      });
    });

    document.body.appendChild(banner);
  }

  function addSettingsControl() {
    if (document.querySelector('.cookie-settings-link')) return;

    var footer = document.querySelector('.footer-bottom');
    if (!footer) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'cookie-settings-link';
    button.textContent = 'Ustawienia cookies';
    button.addEventListener('click', showBanner);
    footer.appendChild(button);
  }

  function init() {
    var choice = readChoice();

    if (choice === 'granted') {
      loadAnalytics();
      addSettingsControl();
    } else if (choice === 'denied') {
      updateConsent(false);
      addSettingsControl();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
