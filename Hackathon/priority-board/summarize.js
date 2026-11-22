(function () {
  'use strict';
  const P = window.Priority;
  const btn = document.getElementById('notify');
  if (!btn) return;

  // Remember whether they already asked
  const KEY = 'priority.summarize.waitlist';
  try {
    if (localStorage.getItem(KEY) === '1') {
      btn.textContent = 'You are on the list';
      btn.disabled = true;
    }
  } catch (e) {}

  btn.addEventListener('click', () => {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    btn.textContent = 'You are on the list';
    btn.disabled = true;
    if (P && P.toast) P.toast('Thanks — we will let you know.');
  });
})();