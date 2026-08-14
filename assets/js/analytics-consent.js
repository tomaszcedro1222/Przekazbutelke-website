(function () {
  'use strict';

  var measurementId = 'G-5PP6RMZNC7';
  var storageKey = 'pb_analytics_consent';
  var bannerId = 'cookie-consent';
  var trackingInstalled = false;
  var viewedSections = {};
  var reachedScrollDepths = {};

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
    updateConsent(true);

    if (!document.querySelector('script[data-google-analytics]')) {
      var script = document.createElement('script');
      script.async = true;
      script.dataset.googleAnalytics = 'true';
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
      document.head.appendChild(script);

      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    }

    installInteractionTracking();
    window.setTimeout(recordVisibleSections, 0);
  }

  function canTrack() {
    return readChoice() === 'granted' && Boolean(document.querySelector('script[data-google-analytics]'));
  }

  function trackEvent(name, parameters) {
    if (!canTrack()) return;
    window.gtag('event', name, parameters || {});
  }

  function linkArea(element) {
    if (element.closest('.site-header')) return 'header';
    if (element.closest('.hero')) return 'hero';
    if (element.closest('.footer')) return 'footer';
    if (element.closest('#patroni')) return 'patrons';
    if (element.closest('.faq-section')) return 'faq';
    return 'content';
  }

  function sectionName(section) {
    return section.id || 'hero';
  }

  function recordSection(section) {
    var name = sectionName(section);
    if (viewedSections[name] || !canTrack()) return;
    viewedSections[name] = true;
    trackEvent('section_view', { section_name: name });
  }

  function recordVisibleSections() {
    document.querySelectorAll('main > section').forEach(function (section) {
      var bounds = section.getBoundingClientRect();
      var visibleHeight = Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0);
      if (visibleHeight > Math.min(180, bounds.height * 0.35)) recordSection(section);
    });
  }

  function recordScrollDepth() {
    if (!canTrack()) return;

    var pageHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var depth = Math.min(100, Math.round((window.scrollY / pageHeight) * 100));

    [25, 50, 75, 90].forEach(function (threshold) {
      if (depth >= threshold && !reachedScrollDepths[threshold]) {
        reachedScrollDepths[threshold] = true;
        trackEvent('scroll_depth', { percent_scrolled: threshold });
      }
    });
  }

  function installInteractionTracking() {
    if (trackingInstalled) return;
    trackingInstalled = true;

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!link || !canTrack()) return;

      var href = link.getAttribute('href') || '';
      var area = linkArea(link);

      if (href.charAt(0) === '#') {
        trackEvent('section_navigation', {
          destination_section: href.slice(1) || 'top',
          link_area: area
        });
      } else if (href.indexOf('mailto:') === 0) {
        trackEvent('contact_click', {
          contact_method: 'email',
          link_area: area
        });
      } else if (href.charAt(0) === '/') {
        trackEvent('internal_link_click', {
          destination_path: href.split('#')[0],
          link_area: area
        });
      }
    });

    document.addEventListener('toggle', function (event) {
      if (event.target.matches('.faq-list details') && event.target.open) {
        var position = Array.prototype.indexOf.call(event.target.parentNode.children, event.target) + 1;
        trackEvent('faq_open', { faq_position: position });
      }
    }, true);

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) recordSection(entry.target);
        });
      }, { threshold: [0.35] });

      document.querySelectorAll('main > section').forEach(function (section) {
        observer.observe(section);
      });
    }

    window.addEventListener('scroll', recordScrollDepth, { passive: true });
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
      trackEvent('analytics_consent_granted');
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

  window.pbTrackEvent = trackEvent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
