(function () {
  'use strict';
  const KEY = 'priorityBoard.v1', FK = 'priorityFocus.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.innerHTML = icn('grid', 20);
  const zenBtn = $('zen-btn');
  if (zenBtn) zenBtn.innerHTML = icn('eye', 20);
  const zenExit = $('zen-exit');
  if (zenExit) zenExit.innerHTML = icn('x', 20);

  /* ----- State ----- */
  let tasks = [];
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) tasks = r; } catch (e) {}

  const FS = {
    taskId: '',
    minutes: 25,
    type: 'focus',
    count: 0,
    countDay: today,
    history: []
  };
  try { Object.assign(FS, JSON.parse(localStorage.getItem(FK)) || {}); } catch (e) {}
  if (FS.countDay !== today) { FS.count = 0; FS.countDay = today; FS.history = []; }
  const saveFS = () => { try { localStorage.setItem(FK, JSON.stringify(FS)); } catch (e) {} };

  let secs = FS.minutes * 60;
  let tick = null;
  let mode = 'idle'; // idle | running | paused
  let zenActive = false;

  function currentTask() { return tasks.find((t) => t.id === FS.taskId); }
  function fmtClock() { return pad(Math.floor(secs / 60)) + ':' + pad(secs % 60); }

  /* =========================================================
     Render
     ========================================================= */
  function render() {
    const t = currentTask();
    const label = $('focus-label');
    const timer = $('focus-timer');

    let txt = 'Ready to focus', cls = '';
    if (mode === 'running') txt = FS.type === 'break' ? 'On a break' : 'Focusing';
    else if (mode === 'paused') txt = 'Paused';
    if (mode === 'paused') cls = ' paused';
    else if (FS.type === 'break') cls = ' break';
    label.textContent = txt;
    label.className = 'focus-label' + cls;

    timer.className = 'focus-timer' + (mode === 'running' ? ' running' : mode === 'paused' ? ' paused' : FS.type === 'break' ? ' break' : '');
    timer.textContent = fmtClock();

    $('focus-streak').textContent = FS.count ? FS.count + ' session' + (FS.count === 1 ? '' : 's') + ' today' : '';

    if (FS.type === 'break') {
      $('ft-title').textContent = 'Take a break';
      $('ft-sub').textContent = 'Step away from the screen for a moment.';
      $('pick-btn').hidden = true;
    } else {
      $('ft-title').textContent = t ? t.title : 'No task selected';
      $('ft-sub').textContent = t ? 'In your Now list' : 'Pick something from your Now list to begin.';
      $('pick-btn').hidden = false;
      $('pick-btn').textContent = t ? 'Change task' : 'Choose a task';
    }

    const typeLabel = FS.type === 'focus' ? 'Focus' : FS.type === 'break' ? 'Break' : 'Custom';
    $('stat-type').textContent = typeLabel;
    $('stat-length').textContent = FS.minutes + ' min';
    $('stat-task').textContent = FS.type === 'break' ? '—' : (t ? t.title : 'None');
    $('stat-count').textContent = FS.count;
    const totalMin = FS.history.reduce((s, h) => s + h.minutes, 0);
    $('stat-total').textContent = totalMin + ' min';

    $('start-btn').textContent = mode === 'running' ? 'Restart' : mode === 'paused' ? 'Resume' : 'Start focus';
    $('pause-btn').hidden = mode !== 'running';

    document.querySelectorAll('.seg').forEach((b) => {
      const matchesType = b.dataset.type === FS.type;
      const matchesMin = b.dataset.min === 'custom' ? FS.custom : +b.dataset.min === FS.minutes;
      b.classList.toggle('on', matchesType && matchesMin);
      b.classList.toggle('break', b.dataset.type === 'break');
    });

    renderHistory();
    if (zenActive) renderZen();
  }

  function renderHistory() {
    const ul = $('focus-history'); ul.textContent = '';
    if (!FS.history.length) {
      ul.append(el('li', 'empty', 'No sessions yet today. Start one up.'));
      return;
    }
    FS.history.slice().reverse().forEach((h) => {
      const li = el('li');
      li.append(el('span', null, h.title || (h.type === 'break' ? 'Break' : 'Focus session')));
      li.append(el('span', 'meta', h.minutes + ' min · ' + h.time));
      ul.append(li);
    });
  }

  function renderZen() {
    $('zen-task').textContent = FS.type === 'break' ? 'Take a break' : (currentTask() ? currentTask().title : 'Take a breath and focus.');
    $('zen-label').textContent = FS.type === 'break' ? 'Break time' : 'Focusing on';
    const t = $('zen-timer');
    t.className = 'zen-timer' + (mode === 'paused' ? ' paused' : FS.type === 'break' ? ' break' : '');
    t.textContent = fmtClock();
    $('zen-toggle').textContent = mode === 'running' ? 'Pause' : mode === 'paused' ? 'Resume' : 'Start';
  }

  /* =========================================================
     Bubbles (Focus Page + Zen Mode)
     ========================================================= */
  function spawnBubbles(containerId, count) {
    const container = $(containerId);
    if (!container) return;
    container.innerHTML = ''; 

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      
      const size = Math.random() * 40 + 10; // 10px to 50px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      
      bubble.style.left = `${Math.random() * 100}%`;
      
      const duration = Math.random() * 5 + 4; // 4s to 9s
      bubble.style.animationDuration = `${duration}s`;
      
      // Negative delay makes them instantly pop up on screen
      bubble.style.animationDelay = `${Math.random() * duration * -1}s`; 
      
      container.appendChild(bubble);
    }
  }

  function createHeroBubbles() {
    spawnBubbles('hero-bubbles', 15); // 15 bubbles for the card
  }

  function createZenBubbles() {
    spawnBubbles('zen-bubbles', 40); // 40 bubbles for the full screen
  }

  /* =========================================================
     Timer
     ========================================================= */
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function start() {
    if (mode === 'running') return;
    if (secs <= 0) secs = FS.minutes * 60;
    mode = 'running';
    render();
    tick = setInterval(() => {
      secs--;
      $('focus-timer').textContent = fmtClock();
      if (zenActive) $('zen-timer').textContent = fmtClock();
      if (secs <= 0) finish();
    }, 1000);
  }
  function pause() {
    if (mode !== 'running') return;
    stopTick();
    mode = 'paused';
    render();
  }
  function reset() {
    stopTick();
    secs = FS.minutes * 60;
    mode = 'idle';
    render();
  }
  function finish() {
    stopTick();
    secs = 0;
    mode = 'idle';
    const t = currentTask();
    FS.count++;
    FS.history.push({
      title: FS.type === 'break' ? 'Break' : (t ? t.title : 'Focus session'),
      minutes: FS.minutes,
      type: FS.type,
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    });
    saveFS();
    P.toast(FS.type === 'break' ? 'Break over. Back to it.' : 'Session complete. Take a break.');
    if (window.PriorityAchievements) PriorityAchievements.addFocusSession();
    render();
    setTimeout(() => { secs = FS.minutes * 60; render(); }, 1500);
  }

  /* =========================================================
     Task picker
     ========================================================= */
  const dlg = $('pick-dialog');
  function openPicker() {
    const ul = $('pick-list'); ul.textContent = '';
    const now = tasks.filter((t) => t.list === 'now');
    if (!now.length) {
      ul.append(el('li', 'empty', 'Your Now list is empty. Add tasks in My Tasks.'));
    } else {
      now.forEach((t) => {
        const li = el('li', t.priority);
        li.append(el('span', 'prio'), el('span', null, t.title));
        li.onclick = () => { FS.taskId = t.id; saveFS(); dlg.close(); render(); };
        ul.append(li);
      });
    }
    dlg.showModal();
  }
  $('pick-cancel').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('pick-btn').onclick = openPicker;

  /* =========================================================
     Presets
     ========================================================= */
  document.querySelectorAll('.seg').forEach((b) => {
    b.addEventListener('click', () => {
      if (b.dataset.min === 'custom') { openCustom(); return; }
      if (mode === 'running' && !confirm('Changing the timer will reset the current session. Continue?')) return;
      stopTick();
      FS.minutes = +b.dataset.min;
      FS.type = b.dataset.type;
      FS.custom = false;
      saveFS();
      secs = FS.minutes * 60;
      mode = 'idle';
      render();
    });
  });

  /* =========================================================
     Custom timer
     ========================================================= */
  const customDlg = $('custom-dialog');
  const range = $('custom-range');
  const out = $('custom-out');
  range.addEventListener('input', () => { out.textContent = range.value + ' min'; });
  document.querySelectorAll('.custom-quick button').forEach((b) => {
    b.addEventListener('click', () => {
      range.value = b.dataset.m;
      out.textContent = range.value + ' min';
    });
  });
  function openCustom() {
    range.value = FS.minutes;
    out.textContent = FS.minutes + ' min';
    customDlg.showModal();
  }
  $('custom-cancel').onclick = () => customDlg.close();
  customDlg.addEventListener('click', (e) => { if (e.target === customDlg) customDlg.close(); });
  $('custom-start').onclick = () => {
    if (mode === 'running' && !confirm('Changing the timer will reset the current session. Continue?')) return;
    stopTick();
    FS.minutes = +range.value;
    FS.type = 'focus';
    FS.custom = true;
    saveFS();
    secs = FS.minutes * 60;
    mode = 'idle';
    customDlg.close();
    render();
  };

  /* =========================================================
     Zen mode
     ========================================================= */
  function enterZen() {
    zenActive = true;
    $('zen').hidden = false;
    document.body.style.overflow = 'hidden';
    createZenBubbles(); // Generate full-screen bubbles
    renderZen();
  }
  function exitZen() {
    zenActive = false;
    $('zen').hidden = true;
    document.body.style.overflow = '';
    render();
  }
  zenBtn.addEventListener('click', enterZen);
  zenExit.addEventListener('click', exitZen);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zenActive) exitZen();
  });

  $('zen-toggle').onclick = () => { if (mode === 'running') pause(); else start(); };
  $('zen-reset').onclick = () => reset();

  /* =========================================================
     Actions
     ========================================================= */
  $('start-btn').addEventListener('click', () => {
    if (mode === 'running') { reset(); start(); return; }
    start();
  });
  $('pause-btn').addEventListener('click', pause);
  $('reset-btn').addEventListener('click', reset);
  $('clear-history').addEventListener('click', () => {
    if (!FS.history.length) return;
    if (!confirm('Clear today\'s session history?')) return;
    FS.history = [];
    FS.count = 0;
    saveFS();
    render();
  });

  /* =========================================================
     Keyboard shortcuts
     ========================================================= */
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select') || dlg.open || customDlg.open) return;
    if (e.key === ' ') {
      e.preventDefault();
      if (mode === 'running') pause(); else start();
    } else if (e.key === 'r' || e.key === 'R') {
      reset();
    }
  });

  // Boot up
  createHeroBubbles(); // Start the bubbles on the timer card immediately
  render();
})();