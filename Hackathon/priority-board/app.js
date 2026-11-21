(function () {
  'use strict';
  const SK = 'priority.settings', TK = 'priorityBoard.theme';
  const S = { hue: 335, track: 'rain', vol: 0.4 };
  try { Object.assign(S, JSON.parse(localStorage.getItem(SK)) || {}); } catch (e) {}
  const root = document.documentElement;

  const mode = () => { try { return localStorage.getItem(TK) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) { return 'light'; } };
  function apply() {
    root.dataset.theme = mode();
    root.style.setProperty('--h', S.hue);
    document.querySelectorAll('#theme-toggle').forEach((b) => { b.textContent = mode() === 'dark' ? '☀️' : '🌙'; });
  }
  function setMode(m) { try { localStorage.setItem(TK, m); } catch (e) {} apply(); }
  function set(o) { Object.assign(S, o); try { localStorage.setItem(SK, JSON.stringify(S)); } catch (e) {} apply(); }
  apply();

  /* ----- Toast ----- */
  let tt;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ----- Music (generated in the browser, no files needed) ----- */
  const TRACKS = [
    { id: 'rain', name: 'Rain', icon: '🌧️', desc: 'Soft steady rain' },
    { id: 'ocean', name: 'Ocean', icon: '🌊', desc: 'Slow rolling waves' },
    { id: 'lofi', name: 'Lo-fi chill', icon: '🎧', desc: 'Mellow chords' },
    { id: 'focus', name: 'Deep focus', icon: '🧠', desc: 'Warm brown noise' }
  ];
  const M = { ctx: null, gain: null, iv: null };
  const emit = () => window.dispatchEvent(new Event('musicchange'));

  function noise(c, brown) {
    const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    let l = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } else d[i] = w * 0.5;
    }
    const s = c.createBufferSource(); s.buffer = b; s.loop = true; s.start(); return s;
  }
  const filt = (c, type, f) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; return n; };
  const chain = (src, nodes) => nodes.reduce((p, n) => { p.connect(n); return n; }, src);

  function stop() {
    clearInterval(M.iv);
    if (M.ctx) { M.ctx.close(); M.ctx = null; M.gain = null; }
    emit();
  }
  function play(id) {
    stop();
    const c = M.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const m = M.gain = c.createGain(); m.gain.value = S.vol; m.connect(c.destination);
    set({ track: id });
    if (id === 'rain') chain(noise(c), [filt(c, 'highpass', 900), filt(c, 'lowpass', 7000), m]);
    else if (id === 'focus') chain(noise(c, 1), [filt(c, 'lowpass', 900), m]);
    else if (id === 'ocean') {
      const g = c.createGain(), o = c.createOscillator(), d = c.createGain();
      g.gain.value = 0.55; o.frequency.value = 0.1; d.gain.value = 0.4;
      o.connect(d); d.connect(g.gain); o.start();
      chain(noise(c, 1), [filt(c, 'lowpass', 500), g, m]);
    } else {
      const v = c.createGain(); v.gain.value = 0.04;
      chain(noise(c), [filt(c, 'highpass', 3500), v, m]); // vinyl crackle
      const CH = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [130.8, 196, 246.9, 329.6], [196, 246.9, 293.7, 329.6]];
      let i = 0;
      const chord = () => {
        const t = c.currentTime;
        CH[i++ % 4].forEach((f, k) => {
          const o = c.createOscillator(), g = c.createGain(), s = t + k * 0.12;
          o.type = 'triangle'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, s);
          g.gain.linearRampToValueAtTime(0.3, s + 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
          o.connect(g); g.connect(m); o.start(s); o.stop(t + 2.7);
        });
      };
      chord(); M.iv = setInterval(chord, 2600);
    }
    emit();
  }
  function setVol(v) { set({ vol: v }); if (M.gain) M.gain.gain.value = v; }

  window.Priority = {
    get: () => S, set, setMode, mode, toast,
    music: { tracks: TRACKS, play, stop, setVol, on: () => !!M.ctx }
  };

  /* ----- Sidebar ----- */
  // [name, icon, page]  (no page = coming soon)
  const NAV = [
    ['Workspace'],
    ['Dashboard', '🏠', 'home.html'],
    ['My Tasks', '✅', 'tasks.html'],
    ['Calendar', '📅', 'calendar.html'],
    ['Study Center', '📚','study.html'],
    ['Focus Mode', '🎯','focus.html'],
    ['Notes', '📝','notes.html'],
    ['Habits &amp; Goals', '🌱','habits.html'],
    ['Statistics', '📊','stats.html'],
    ['Personal tools'],
    ['Voice Assistant', '🎙️'],
    ['My Attachments', '📎'],
    ['Reminders', '🔔'],
    ['Achievements', '🏆'],
    ['My Profile', '👤'],
    ['Settings', '⚙️', 'settings.html'],
    ['Help Center', '💬']
  ];

  document.addEventListener('DOMContentLoaded', function () {
    apply();
    const slot = document.getElementById('nav-slot');
    if (!slot) return;
    const page = location.pathname.split('/').pop() || 'home.html';
    slot.innerHTML =
      '<a class="brand" href="home.html"><b>✓</b>Priority</a><nav aria-label="Main">' +
      NAV.map((n) => n.length === 1
        ? '<p class="grp">' + n[0] + '</p>'
        : '<a href="' + (n[2] || '#') + '"' + (n[2] ? '' : ' data-soon') + (n[2] === page ? ' class="on" aria-current="page"' : '') + '><i>' + n[1] + '</i>' + n[0] + '</a>'
      ).join('') + '</nav>' +
      '<div class="mini"><b>🎵 Music</b><div class="row"><select id="mp-track" aria-label="Track">' +
      TRACKS.map((t) => '<option value="' + t.id + '">' + t.icon + ' ' + t.name + '</option>').join('') +
      '</select><button id="mp-play" type="button">Play</button></div>' +
      '<input id="mp-vol" type="range" min="0" max="1" step="0.05" aria-label="Volume"></div>';

    const sel = document.getElementById('mp-track'), btn = document.getElementById('mp-play'), vol = document.getElementById('mp-vol');
    const sync = () => { sel.value = S.track; vol.value = S.vol; btn.textContent = M.ctx ? 'Stop' : 'Play'; };
    sync();
    btn.addEventListener('click', () => (M.ctx ? stop() : play(sel.value)));
    sel.addEventListener('change', () => { set({ track: sel.value }); if (M.ctx) play(sel.value); });
    vol.addEventListener('input', () => setVol(+vol.value));
    window.addEventListener('musicchange', sync);

    // mobile menu + pages not built yet
    const sc = document.getElementById('scrim'), mb = document.getElementById('menu-btn');
    const menu = (o) => { slot.classList.toggle('open', o); if (sc) sc.classList.toggle('show', o); };
    if (mb) mb.addEventListener('click', () => menu(!slot.classList.contains('open')));
    if (sc) sc.addEventListener('click', () => menu(false));
    slot.querySelectorAll('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault(); toast(a.textContent + ' is coming soon.'); menu(false);
    }));
    const tg = document.getElementById('theme-toggle');
    if (tg) tg.addEventListener('click', () => setMode(mode() === 'dark' ? 'light' : 'dark'));
  });
})();