(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form || !window.fetch || !window.FormData) return;

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
