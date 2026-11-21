(function () {
  'use strict';
  const FK = 'priority.focus', TK = 'priorityBoard.v1', P = window.Priority, C = 2 * Math.PI * 120;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const MODES = { pomo: [25, 5, 'Pomodoro 25/5'], deep: [50, 10, 'Deep work 50/10'], quick: [15, 3, 'Quick 15/3'], custom: [0, 0, 'Custom'] };
  const S = { mode: 'pomo', custom: [30, 5], auto: false, task: '', log: {} };
  try { Object.assign(S, JSON.parse(localStorage.getItem(FK)) || {}); } catch (e) {}
  const saveS = () => { try { localStorage.setItem(FK, JSON.stringify(S)); } catch (e) {} };
  let tasks = [], phase = 'focus', total = 1500, left = 1500, endAt = 0, tick = null;

  const lens = () => (S.mode === 'custom' ? S.custom : MODES[S.mode]);
  const loadTasks = () => { try { const r = JSON.parse(localStorage.getItem(TK)); tasks = Array.isArray(r) ? r : []; } catch (e) { tasks = []; } };
  const saveTasks = () => { try { localStorage.setItem(TK, JSON.stringify(tasks)); } catch (e) {} };

  /* ----- Stats ----- */
  function stats() {
    const t = S.log[today] || { n: 0, m: 0 };
    $('s-n').textContent = t.n; $('s-m').textContent = t.m + ' min';
    $('s-all').textContent = Object.values(S.log).reduce((a, d) => a + d.n, 0);
  }
  function logSession() {
    const d = S.log[today] || (S.log[today] = { n: 0, m: 0 });
    d.n++; d.m += Math.round(total / 60); saveS(); stats();
  }

  /* ----- Timer ----- */
  function draw() {
    const m = Math.floor(left / 60), s = left % 60;
    $('clock').textContent = pad(m) + ':' + pad(s);
    $('prog').style.strokeDashoffset = C * (1 - left / total);
    document.title = (tick ? pad(m) + ':' + pad(s) + ' · ' : '') + (phase === 'focus' ? 'Focus' : 'Break') + ' · Priority';
    $('stage').classList.toggle('is-break', phase === 'break');
    $('phase').textContent = phase === 'focus' ? 'Focus time' : 'Break time. Stretch and breathe.';
  }
  function setPhase(p) { phase = p; total = left = lens()[p === 'focus' ? 0 : 1] * 60; draw(); }
  function stopTick() { clearInterval(tick); tick = null; }
  function beep() {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35].forEach((t) => {
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.value = 880; g.gain.setValueAtTime(0.2, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + 0.3);
        o.connect(g); g.connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.32);
      });
      setTimeout(() => c.close(), 1200);
    } catch (e) {}
  }
  function start() {
    endAt = Date.now() + left * 1000; $('go').textContent = 'Pause';
    clearInterval(tick);
    tick = setInterval(() => {
      left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); draw();
      if (left <= 0) finish();
    }, 250);
  }
  function finish() {
    stopTick(); beep();
    if (phase === 'focus') { logSession(); P.toast('Session complete. Time for a break.'); setPhase('break'); }
    else { P.toast('Break over. Ready for the next round?'); setPhase('focus'); }
    $('go').textContent = 'Start';
    if (S.auto) start();
  }
  function toggle() {
    if (tick) { stopTick(); left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); $('go').textContent = 'Resume'; draw(); }
    else start();
  }
  function reset() { stopTick(); setPhase('focus'); $('go').textContent = 'Start'; }
  function skip() { stopTick(); setPhase(phase === 'focus' ? 'break' : 'focus'); $('go').textContent = 'Start'; }

  /* ----- Modes ----- */
  function renderModes() {
    $('modes').innerHTML = Object.keys(MODES).map((k) => '<button type="button" class="seg' + (S.mode === k ? ' on' : '') + '" data-m="' + k + '">' + MODES[k][2] + '</button>').join('');
    $('custom').hidden = S.mode !== 'custom';
  }
  $('modes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    if (tick) { P.toast('Pause or reset the timer to change style.'); return; }
    S.mode = b.dataset.m; saveS(); renderModes(); setPhase('focus');
  });
  ['c-focus', 'c-break'].forEach((id, i) => $(id).addEventListener('change', (e) => {
    S.custom[i] = Math.max(1, Math.min(i ? 60 : 180, +e.target.value || 1)); e.target.value = S.custom[i]; saveS();
    if (!tick) setPhase(phase);
  }));

  /* ----- Task picker ----- */
  function renderTasks() {
    const open = tasks.filter((t) => t.list !== 'done').sort((a, b) => (a.list === 'now' ? 0 : 1) - (b.list === 'now' ? 0 : 1));
    const sel = $('task-sel');
    sel.innerHTML = '<option value="">Free focus (no task)</option>' + open.map((t) => '<option value="' + t.id + '"></option>').join('');
    [...sel.options].slice(1).forEach((o, i) => { o.textContent = (open[i].list === 'now' ? '🔥 ' : '') + open[i].title; });
    sel.value = open.some((t) => t.id === S.task) ? S.task : '';
    S.task = sel.value;
    const t = tasks.find((x) => x.id === S.task);
    $('now-task').textContent = t ? t.title : 'Free focus';
    $('task-done').disabled = !t;
  }
  $('task-sel').onchange = (e) => { S.task = e.target.value; saveS(); renderTasks(); };
  $('task-done').onclick = () => {
    const t = tasks.find((x) => x.id === S.task); if (!t) return;
    t.list = 'done'; saveTasks(); S.task = ''; saveS(); renderTasks(); P.toast('Task completed. Great work!');
  };

  /* ----- Music ----- */
  function renderMusic() {
    const s = P.get();
    $('m-tracks').innerHTML = P.music.tracks.map((t) => '<button type="button" data-t="' + t.id + '" class="' + (P.music.on() && s.track === t.id ? 'on' : '') + '">' + t.icon + ' ' + t.name + '</button>').join('');
    $('m-vol').value = s.vol;
  }
  $('m-tracks').addEventListener('click', (e) => {
    const b = e.target.closest('[data-t]'); if (!b) return;
    if (P.music.on() && P.get().track === b.dataset.t) P.music.stop(); else P.music.play(b.dataset.t);
  });
  $('m-vol').addEventListener('input', (e) => P.music.setVol(+e.target.value));
  window.addEventListener('musicchange', renderMusic);

  /* ----- Zen & full screen ----- */
  function zen(on) { document.body.classList.toggle('zen', on); $('zen').textContent = on ? '✕ Exit zen' : '🧘 Zen mode'; }
  $('zen').onclick = () => zen(!document.body.classList.contains('zen'));
  $('fs').onclick = () => {
    if (!document.fullscreenElement) (document.documentElement.requestFullscreen || function () { return Promise.reject(); }).call(document.documentElement).catch(() => P.toast('Full screen is not available here.'));
    else document.exitFullscreen();
  };
  $('zen').style.display = '';
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select,button')) return;
    if (e.key === ' ') { e.preventDefault(); toggle(); }
    else if (e.key === 'f' || e.key === 'F') zen(!document.body.classList.contains('zen'));
    else if (e.key === 'Escape') zen(false);
  });

  $('go').onclick = toggle; $('skip').onclick = skip; $('reset').onclick = reset;
  $('auto').checked = S.auto;
  $('auto').onchange = (e) => { S.auto = e.target.checked; saveS(); };
  $('c-focus').value = S.custom[0]; $('c-break').value = S.custom[1];

  loadTasks(); renderModes(); renderTasks(); renderMusic(); stats(); setPhase('focus');
  $('prog').style.strokeDasharray = C;
})();