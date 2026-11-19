(function () {
  'use strict';

  var SERVICES = {
    design: 'Engineering design (civil, structural, MEP)',
    review: 'Third-party plan review'
  };

  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1140px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  var form = document.getElementById('contact-form');
  if (!form) return;

  var service = form.elements.service;

  function pickService(key) {
    if (service && Object.prototype.hasOwnProperty.call(SERVICES, key)) {
      service.value = SERVICES[key];
    }
  }

  pickService(new URLSearchParams(window.location.search).get('service') || '');

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[data-service]');
    if (link) pickService(link.getAttribute('data-service'));
  });

  var button = form.querySelector('button[type="submit"]');
  var error = document.getElementById('form-error');
  var done = document.getElementById('form-done');
  var label = button ? button.textContent : '';
  var sending = false;

  function fail() {
    sending = false;
    if (button) {
      button.disabled = false;
      button.textContent = label;
    }
    if (error) error.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    if (!window.fetch || !window.FormData) return;
    e.preventDefault();
    if (sending) return;
    sending = true;
    if (error) error.hidden = true;
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : 0;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.hidden = true;
      if (done) {
        done.hidden = false;
        done.focus();
      }
    }).catch(function () {
      clearTimeout(timer);
      fail();
    });
  });
})();
