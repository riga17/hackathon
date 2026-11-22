(function () {
  'use strict';

  /* =========================================================
     SVG icon set
     ========================================================= */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    note: '<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/>',
    sprout: '<path d="M12 21v-7"/><path d="M12 14c0-4 3-7 7-7 0 4-3 7-7 7Z"/><path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5Z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-6M22 20H2"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
    paperclip: '<path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3"/><path d="M12 12v4M9 20h6M10 20v-2h4v2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.1-1.6 2.2"/><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 6l4 4"/>',
    arrowLeft: '<path d="M15 18l-6-6 6-6"/>',
    arrowRight: '<path d="M9 18l6-6-6-6"/>',
    sort: '<path d="M7 4v16M3 16l4 4 4-4"/><path d="M17 20V4M13 8l4-4 4 4"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4"/><circle cx="12" cy="17.5" r=".6" fill="currentColor" stroke="none"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    moon: '<path d="M21 12.8A8 8 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5-9 9"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    audio: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11"/>',
    video: '<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-3v10l-6-3"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M8 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM12 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m6 15 6-6 6 6"/>',
    fire: '<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 2 2 2 0 0-1 0-3 0-4Z"/><path d="M9 15a3 3 0 0 0 6 0"/>',
    star: '<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    flag: '<path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
    external: '<path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>'
  };

  function icon(name, size) {
    const p = ICONS[name];
    if (!p) return '';
    const s = size || 20;
    return '<svg class="icn" viewBox="0 0 24 24" width="' + s + '" height="' + s +
      '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  window.PriorityIcon = icon;

  /* =========================================================
     Settings state
     ========================================================= */
  const SK = 'priority.settings', TK = 'priorityBoard.theme';
  const S = {
    hue: 335,
    track: 'rain',
    vol: 0.4,
    cueSounds: false,
    notifyReminders: false,
    defaultList: 'later',
    defaultPrio: 'medium'
  };
  try { Object.assign(S, JSON.parse(localStorage.getItem(SK)) || {}); } catch (e) {}
  const root = document.documentElement;

  const mode = () => {
    try { return localStorage.getItem(TK) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
    catch (e) { return 'light'; }
  };

  function apply() {
    root.dataset.theme = mode();
    root.style.setProperty('--h', S.hue);
    document.querySelectorAll('#theme-toggle').forEach((b) => {
      b.innerHTML = icon(mode() === 'dark' ? 'sun' : 'moon');
    });
  }
  function setMode(m) {
    try { localStorage.setItem(TK, m); } catch (e) {}
    apply();
  }
  function set(o) {
    Object.assign(S, o);
    try { localStorage.setItem(SK, JSON.stringify(S)); } catch (e) {}
    apply();
  }
  apply();

  /* =========================================================
     Toast
     ========================================================= */
  let tt;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.append(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* =========================================================
     Generated music — 22 ambient tracks
     ========================================================= */
  const TRACKS = [
    { id: 'rain',        name: 'Rain',           desc: 'Soft steady rain',        icon: '🌧️', kind: 'rain' },
    { id: 'heavy_rain',  name: 'Heavy rain',     desc: 'Denser rainfall',         icon: '🌧️', kind: 'rain', hp: 500,  lp: 9000 },
    { id: 'drizzle',     name: 'Drizzle',        desc: 'Light pattering',         icon: '🌦️', kind: 'rain', hp: 1400, lp: 8500 },
    { id: 'thunder',     name: 'Thunder',        desc: 'Rain with low rumble',    icon: '⛈️', kind: 'rain', hp: 700,  lp: 8000, rumble: true },
    { id: 'ocean',       name: 'Ocean',          desc: 'Slow rolling waves',      icon: '🌊', kind: 'ocean' },
    { id: 'deep_ocean',  name: 'Deep ocean',     desc: 'Dark and low',            icon: '🌊', kind: 'ocean', freq: 0.06, lp: 380 },
    { id: 'shore',       name: 'Shoreline',      desc: 'Gentle lapping',          icon: '🏖️', kind: 'ocean', freq: 0.16, lp: 700 },
    { id: 'lofi',        name: 'Lo-fi chill',    desc: 'Mellow chords',           icon: '🎧', kind: 'lofi' },
    { id: 'lofi_slow',   name: 'Slow lo-fi',     desc: 'Slower chord change',     icon: '🎧', kind: 'lofi', interval: 3600 },
    { id: 'lofi_night',  name: 'Night lo-fi',    desc: 'Lower register chords',   icon: '🌙', kind: 'lofi', shift: -2 },
    { id: 'lofi_bright', name: 'Bright lo-fi',   desc: 'Higher register chords',  icon: '☀️', kind: 'lofi', shift: 2 },
    { id: 'focus',       name: 'Deep focus',     desc: 'Warm brown noise',        icon: '🧠', kind: 'brown', lp: 900 },
    { id: 'brown_low',   name: 'Brown low',      desc: 'Very dark brown noise',   icon: '🧠', kind: 'brown', lp: 500 },
    { id: 'pink',        name: 'Pink noise',     desc: 'Balanced full spectrum',  icon: '🎚️', kind: 'pink' },
    { id: 'white',       name: 'White noise',    desc: 'Bright and flat',         icon: '⚪', kind: 'white' },
    { id: 'wind',        name: 'Wind',           desc: 'Soft airy breeze',        icon: '🍃', kind: 'wind' },
    { id: 'forest',      name: 'Forest wind',    desc: 'Rustling trees',          icon: '🌲', kind: 'wind', lp: 1400 },
    { id: 'cave',        name: 'Cave hum',       desc: 'Low droning hum',         icon: '🪨', kind: 'drone', freq: 55 },
    { id: 'drone_deep',  name: 'Deep drone',     desc: 'Dark sustained tone',     icon: '🎛️', kind: 'drone', freq: 40 },
    { id: 'drone_open',  name: 'Open fifth',     desc: 'Two-tone fifth drone',    icon: '🎼', kind: 'drone2', freq: 110 },
    { id: 'bells',       name: 'Soft bells',     desc: 'Sparse gentle chimes',    icon: '🔔', kind: 'bells' },
    { id: 'night',       name: 'Night ambience', desc: 'Low hum + quiet air',     icon: '🌌', kind: 'night' }
  ];
  const M = { ctx: null, gain: null, iv: null, current: '' };
  const emit = () => window.dispatchEvent(new Event('musicchange'));

  function noiseBuf(c, kind) {
    const n = c.sampleRate * 2;
    const b = c.createBuffer(1, n, c.sampleRate);
    const d = b.getChannelData(0);
    let l = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; }
      else if (kind === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
      else d[i] = w * 0.5;
    }
    const s = c.createBufferSource();
    s.buffer = b; s.loop = true; s.start();
    return s;
  }
  const filt = (c, type, f, q) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q != null) n.Q.value = q; return n; };
  const chain = (src, nodes) => nodes.reduce((p, n) => { p.connect(n); return n; }, src);

  function stop() {
    clearInterval(M.iv);
    if (M.ctx) { try { M.ctx.close(); } catch (e) {} M.ctx = null; M.gain = null; }
    M.current = '';
    emit();
  }

  function buildTrack(c, m, def) {
    const k = def.kind;
    if (k === 'rain') {
      const nodes = [filt(c, 'highpass', def.hp || 900), filt(c, 'lowpass', def.lp || 7000), m];
      chain(noiseBuf(c), nodes);
      if (def.rumble) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = 45;
        g.gain.value = 0.08;
        o.connect(g); g.connect(m); o.start();
        const lfo = c.createOscillator(), lg = c.createGain();
        lfo.frequency.value = 0.12; lg.gain.value = 0.05;
        lfo.connect(lg); lg.connect(g.gain); lfo.start();
      }
    } else if (k === 'ocean') {
      const g = c.createGain(), o = c.createOscillator(), d = c.createGain();
      g.gain.value = 0.55;
      o.frequency.value = def.freq || 0.1;
      d.gain.value = 0.4;
      o.connect(d); d.connect(g.gain); o.start();
      chain(noiseBuf(c, 'brown'), [filt(c, 'lowpass', def.lp || 500), g, m]);
    } else if (k === 'brown') {
      chain(noiseBuf(c, 'brown'), [filt(c, 'lowpass', def.lp || 900), m]);
    } else if (k === 'pink') {
      chain(noiseBuf(c, 'pink'), [filt(c, 'lowpass', 6000), m]);
    } else if (k === 'white') {
      chain(noiseBuf(c, 'white'), [filt(c, 'lowpass', 9000), m]);
    } else if (k === 'wind') {
      const g = c.createGain(); g.gain.value = 0.6;
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 0.07; lg.gain.value = 400;
      const bp = filt(c, 'bandpass', 700, 0.6);
      lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
      chain(noiseBuf(c, 'pink'), [filt(c, 'highpass', 200), bp, g, m]);
    } else if (k === 'drone' || k === 'drone2') {
      const freqs = k === 'drone2' ? [def.freq || 110, (def.freq || 110) * 1.5] : [def.freq || 55];
      freqs.forEach((f) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.12;
        o.connect(g); g.connect(m); o.start();
      });
      const air = c.createGain(); air.gain.value = 0.04;
      chain(noiseBuf(c, 'brown'), [filt(c, 'lowpass', 600), air, m]);
    } else if (k === 'bells') {
      const scale = [523.25, 587.33, 659.25, 783.99, 880];
      const chime = () => {
        const f = scale[Math.floor(Math.random() * scale.length)];
        const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 3);
        o.connect(g); g.connect(m);
        o.start(t); o.stop(t + 3.1);
      };
      chime();
      M.iv = setInterval(chime, 2200 + Math.random() * 1800);
      const air = c.createGain(); air.gain.value = 0.02;
      chain(noiseBuf(c, 'pink'), [filt(c, 'lowpass', 1200), air, m]);
    } else if (k === 'night') {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 80; g.gain.value = 0.06;
      o.connect(g); g.connect(m); o.start();
      const air = c.createGain(); air.gain.value = 0.05;
      chain(noiseBuf(c, 'brown'), [filt(c, 'lowpass', 400), air, m]);
    } else if (k === 'lofi') {
      const v = c.createGain(); v.gain.value = 0.04;
      chain(noiseBuf(c, 'white'), [filt(c, 'highpass', 3500), v, m]);
      const CH = [
        [220, 261.6, 329.6, 392],
        [174.6, 220, 261.6, 329.6],
        [130.8, 196, 246.9, 329.6],
        [196, 246.9, 293.7, 329.6]
      ];
      const shift = def.shift || 0;
      let i = 0;
      const chord = () => {
        const t = c.currentTime;
        CH[i++ % 4].forEach((f, k2) => {
          const o = c.createOscillator(), g = c.createGain(), s = t + k2 * 0.12;
          o.type = 'triangle';
          o.frequency.value = f * Math.pow(2, shift / 12);
          g.gain.setValueAtTime(0.0001, s);
          g.gain.linearRampToValueAtTime(0.3, s + 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
          o.connect(g); g.connect(m);
          o.start(s); o.stop(t + 2.7);
        });
      };
      chord();
      M.iv = setInterval(chord, def.interval || 2600);
    }
  }

  function play(id) {
    stop();
    set({ track: id });
    const def = TRACKS.find((t) => t.id === id);
    if (!def) return;
    const c = M.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const m = M.gain = c.createGain();
    m.gain.value = S.vol;
    m.connect(c.destination);
    M.current = id;
    buildTrack(c, m, def);
    emit();
  }

  function setVol(v) {
    set({ vol: v });
    if (M.gain) M.gain.gain.value = v;
  }

  /* =========================================================
     Public API
     ========================================================= */
  window.Priority = {
    get: () => S,
    set,
    setMode,
    mode,
    toast,
    icon,
    music: {
      tracks: TRACKS,
      play,
      stop,
      setVol,
      current: () => M.current,
      on: () => !!M.ctx,
      onChange: (fn) => window.addEventListener('musicchange', fn)
    }
  };

  /* =========================================================
     Sidebar NAV
     ========================================================= */
  const NAV = [
    ['Workspace'],
    ['Dashboard', 'home', 'home.php'],
    ['My Tasks', 'checkCircle', 'tasks.php'],
    ['Calendar', 'calendar', 'calendar.php'],
    ['Focus Mode', 'target', 'focus.php'],
    ['Study Center', 'book', 'study.php'],
    ['Notes', 'note', 'notes.php'],
    ['Habits &amp; Goals', 'sprout', 'habits.php'],
    ['Statistics', 'chart', 'stats.php'],
    ['Personal tools'],
    ['Voice Assistant', 'mic', 'voice.php'],
    ['Scanner', 'paperclip', 'attachments.php'],
    ['Reminders', 'bell', 'reminders.php'],
    ['Achievements', 'trophy', 'achievements.php'],
    ['My Profile', 'user', 'profile.php'],
    ['Settings', 'settings', 'settings.php'],
    ['Help Center', 'help', 'help.php'],
    ['Log out', 'x', 'logout.php']
  ];

  document.addEventListener('DOMContentLoaded', function () {
    apply();

    /* =========================================================
       Sidebar
       ========================================================= */
    const slot = document.getElementById('nav-slot');
    if (slot) {
      const page = location.pathname.split('/').pop() || 'home.php';
      
      // --- Sidebar HTML with Glassy Bubbles ---
      slot.innerHTML =
        '<a class="brand" href="home.php"><b>' + icon('check', 18) + '</b>Priority</a>' +
        '<nav aria-label="Main">' +
        NAV.map((n) => n.length === 1
          ? '<p class="grp">' + n[0] + '</p>'
          : '<a href="' + (n[2] || '#') + '"' + (n[2] ? '' : ' data-soon') +
            (n[2] === page ? ' class="on" aria-current="page"' : '') +
            '><i>' + icon(n[1]) + '</i>' + n[0] + '</a>'
        ).join('') +
        '</nav>' +
        // Music Panel
        '<div class="mini">' +
          '<b style="position:relative;z-index:2">' + icon('music', 18) + ' Music</b>' +
          
          // The glassy bubble visualizer
          '<div class="mp-bubbles-wrap">' +
            '<div class="mp-bubbles">' +
              '<span style="width:14px;height:14px;left:10%;animation-duration:6s;animation-delay:0s"></span>' +
              '<span style="width:8px;height:8px;left:30%;animation-duration:5s;animation-delay:1.5s"></span>' +
              '<span style="width:20px;height:20px;left:55%;animation-duration:7s;animation-delay:0.5s"></span>' +
              '<span style="width:10px;height:10px;left:75%;animation-duration:4.5s;animation-delay:2.5s"></span>' +
              '<span style="width:16px;height:16px;left:90%;animation-duration:6.5s;animation-delay:3.2s"></span>' +
              '<span style="width:12px;height:12px;left:20%;animation-duration:5.5s;animation-delay:4s"></span>' +
            '</div>' +
          '</div>' +

          '<div class="mp-now" id="mp-now" style="position:relative;z-index:2">Nothing playing</div>' +
          
          '<select id="mp-select" aria-label="Choose a track" style="position:relative;z-index:2; width:100%;padding:8px 10px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:.85rem"></select>' +
          
          '<div class="row" style="position:relative;z-index:2; margin-top:6px">' +
            '<button id="mp-play" type="button" style="flex:1">Play</button>' +
            '<button id="mp-stop" type="button" style="flex:1;background:var(--bg);color:var(--text);border:1px solid var(--border)">Stop</button>' +
          '</div>' +
          '<input id="mp-vol" type="range" min="0" max="1" step="0.05" aria-label="Volume" style="position:relative;z-index:2">' +
        '</div>';

      const sel = document.getElementById('mp-select');
      const btn = document.getElementById('mp-play');
      const stopB = document.getElementById('mp-stop');
      const vol = document.getElementById('mp-vol');
      const now = document.getElementById('mp-now');

      sel.innerHTML = TRACKS.map((t) => '<option value="' + t.id + '">' + t.icon + ' ' + t.name + '</option>').join('');
      sel.value = S.track;

      function renderNow() {
        const cur = M.current;
        const t = TRACKS.find((x) => x.id === cur);
        now.textContent = t ? ('Playing: ' + t.name) : 'Nothing playing';
        btn.textContent = cur ? 'Stop' : 'Play';
        vol.value = S.vol;
        if (cur) sel.value = cur;
      }

      btn.addEventListener('click', () => {
        if (M.current) stop();
        else play(sel.value);
      });
      stopB.addEventListener('click', () => stop());
      sel.addEventListener('change', () => {
        if (M.current) play(sel.value);
      });
      vol.addEventListener('input', () => setVol(+vol.value));

      renderNow();
      window.addEventListener('musicchange', renderNow);

      /* Mobile menu */
      const sc = document.getElementById('scrim');
      const mb = document.getElementById('menu-btn');
      const menu = (o) => {
        slot.classList.toggle('open', o);
        if (sc) sc.classList.toggle('show', o);
      };
      if (mb) mb.addEventListener('click', () => menu(!slot.classList.contains('open')));
      if (sc) sc.addEventListener('click', () => menu(false));

      /* Coming-soon links */
      slot.querySelectorAll('[data-soon]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        toast(a.textContent.trim() + ' is coming soon.');
        menu(false);
      }));
    }

    /* =========================================================
       Theme toggle
       ========================================================= */
    const tg = document.getElementById('theme-toggle');
    if (tg) tg.addEventListener('click', () => setMode(mode() === 'dark' ? 'light' : 'dark'));

    /* =========================================================
       Inject SVG into any element with data-icon="name"
       ========================================================= */
    document.querySelectorAll('[data-icon]').forEach((el) => {
      el.innerHTML = icon(el.dataset.icon);
    });
  });
})();