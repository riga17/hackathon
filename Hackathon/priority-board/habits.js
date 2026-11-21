(function () {
  'use strict';
  const HK = 'priorityBoard.habits.v2', GK = 'priorityBoard.goals.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ICONS = ['💧','📖','🏃','🧘','🌙','🥗','✍️','🎧','🧹','☀️'];
  let habits = [], goals = [];

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ----- Storage ----- */
  function loadHabits() {
    try { const r = JSON.parse(localStorage.getItem(HK)); if (Array.isArray(r) && r.length) return r; } catch (e) {}
    return [
      { id: uid(), name: 'Drink water', icon: '💧', days: {} },
      { id: uid(), name: 'Read for 20 minutes', icon: '📖', days: {} },
      { id: uid(), name: 'Move your body', icon: '🏃', days: {} },
      { id: uid(), name: 'Review today\'s notes', icon: '✍️', days: {} }
    ];
  }
  function loadGoals() {
    try { const r = JSON.parse(localStorage.getItem(GK)); if (Array.isArray(r)) return r; } catch (e) {}
    return [
      { id: uid(), name: 'Read 12 books', target: 12, current: 3, unit: 'books' },
      { id: uid(), name: 'Save for a laptop', target: 800, current: 250, unit: '$' }
    ];
  }
  const saveHabits = () => { try { localStorage.setItem(HK, JSON.stringify(habits)); } catch (e) {} };
  const saveGoals = () => { try { localStorage.setItem(GK, JSON.stringify(goals)); } catch (e) {} };

  /* ----- Streak helpers ----- */
  function streak(h) {
    let n = 0;
    const d = new Date();
    while (true) {
      const k = ds(d);
      const on = (h.days[k] || []).length > 0;
      if (k === today && !on) { d.setDate(d.getDate() - 1); continue; } // today not yet done, check yesterday
      if (!on) break;
      n++;
      d.setDate(d.getDate() - 1);
      if (n > 365) break;
    }
    return n;
  }
  function bestStreak() { return habits.reduce((m, h) => Math.max(m, streak(h)), 0); }
  function doneToday(h) { return (h.days[today] || []).includes('done'); }

  /* ----- Render habits ----- */
  function renderHabits() {
    const ul = $('habit-list'); ul.textContent = '';
    if (!habits.length) { ul.append(el('li', 'empty', 'No habits yet. Add one to start building a streak.')); }
    habits.forEach((h) => {
      const on = doneToday(h), s = streak(h);
      const li = el('li', 'h-item' + (on ? ' on' : ''));
      const ic = el('span', 'h-icon', h.icon || '⭐');
      const body = el('div', 'h-body');
      body.append(el('div', 'h-name', h.name), el('span', 'h-streak', s ? '🔥 ' + s + ' day streak' : 'Start today'));
      const chk = el('button', 'chk', on ? '✓' : ''); chk.type = 'button';
      chk.setAttribute('aria-label', (on ? 'Undo today: ' : 'Complete today: ') + h.name);
      chk.onclick = () => {
        const arr = new Set(h.days[today] || []);
        if (arr.has('done')) { arr.delete('done'); } else { arr.add('done'); P.toast('Nice. Keep the streak alive.'); }
        h.days[today] = [...arr]; saveHabits(); renderAll();
      };
      const ed = el('button', 'h-edit', '✎'); ed.type = 'button'; ed.setAttribute('aria-label', 'Edit ' + h.name);
      ed.onclick = () => openHabit(h);
      li.append(ic, body, chk, ed); ul.append(li);
    });
  }

  /* ----- Render goals ----- */
  function renderGoals() {
    const ul = $('goal-list'); ul.textContent = '';
    if (!goals.length) { ul.append(el('li', 'empty', 'No goals yet. Add one to track progress.')); }
    goals.forEach((g) => {
      const pct = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
      const complete = pct >= 100;
      const li = el('li', 'g-item' + (complete ? ' complete' : ''));
      const top = el('div', 'g-top');
      top.append(el('div', 'g-name', g.name), el('div', 'g-num', g.current + ' / ' + g.target + (g.unit ? ' ' + g.unit : '')));
      const bar = el('div', 'g-bar'); const i = el('i'); i.style.width = pct + '%'; bar.append(i);
      const btns = el('div', 'g-btns');
      const minus = el('button', null, '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Decrease ' + g.name);
      const plus = el('button', null, '+1'); plus.type = 'button'; plus.setAttribute('aria-label', 'Increase ' + g.name);
      minus.onclick = () => { g.current = Math.max(0, g.current - 1); saveGoals(); renderAll(); };
      plus.onclick = () => { g.current = Math.min(g.target, g.current + 1); saveGoals(); renderAll(); };
      const edit = el('button', 'gm', '✎'); edit.type = 'button'; edit.setAttribute('aria-label', 'Edit ' + g.name);
      edit.onclick = () => openGoal(g);
      btns.append(minus, plus, el('span', null, pct + '%'), edit);
      li.append(top, bar, btns); ul.append(li);
    });
  }

  /* ----- Week heatmap ----- */
  function renderHeat() {
    const box = $('heat'); box.textContent = '';
    const total = habits.length || 1;
    let weekDone = 0, weekPossible = 0;
    const start = new Date(); const off = (start.getDay() + 6) % 7; // Monday
    start.setDate(start.getDate() - off);
    ['M','T','W','T','F','S','S'].forEach((d) => box.append(el('div', 'heat-d', d)));
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = ds(d);
      const n = habits.filter((h) => (h.days[k] || []).includes('done')).length;
      if (k <= today) { weekDone += n; weekPossible += total; }
      const lvl = n === 0 ? 0 : Math.min(4, Math.ceil((n / total) * 4));
      const cell = el('div', 'heat-cell' + (lvl ? ' l' + lvl : '') + (k === today ? ' today' : ''), n ? String(n) : '');
      cell.title = d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) + ' · ' + n + '/' + total;
      box.append(cell);
    }
    const pct = weekPossible ? Math.round((weekDone / weekPossible) * 100) : 0;
    $('week-pct').textContent = pct + '%';
    $('st-week').textContent = pct + '%';
  }

  /* ----- Stats ----- */
  function renderStats() {
    const done = habits.filter(doneToday).length;
    $('st-streak').textContent = bestStreak();
    $('st-today').textContent = done + '/' + habits.length;
    $('st-goals').textContent = goals.filter((g) => g.current < g.target).length;
    $('habit-count').textContent = done + '/' + habits.length;
    $('sub').textContent = habits.length + ' habit' + (habits.length === 1 ? '' : 's') + ' · ' + goals.length + ' goal' + (goals.length === 1 ? '' : 's');
  }

  function renderAll() { renderHabits(); renderGoals(); renderHeat(); renderStats(); }

  /* ----- Habit dialog ----- */
  const hDlg = $('habit-dlg');
  let hEditing = null, hIcon = '💧';
  function openHabit(h) {
    hEditing = h ? h.id : null;
    hIcon = h ? h.icon : '💧';
    $('h-title').textContent = h ? 'Edit habit' : 'New habit';
    $('h-name').value = h ? h.name : '';
    $('h-del').style.display = h ? '' : 'none';
    drawIcons(); hDlg.showModal(); $('h-name').focus();
  }
  function drawIcons() {
    const row = $('ico-row'); row.textContent = '';
    ICONS.forEach((ic) => {
      const b = el('button', ic === hIcon ? 'on' : '', ic); b.type = 'button';
      b.onclick = () => { hIcon = ic; drawIcons(); };
      row.append(b);
    });
  }
  $('habit-form').addEventListener('submit', () => {
    const name = $('h-name').value.trim(); if (!name) return;
    if (hEditing) { const h = habits.find((x) => x.id === hEditing); h.name = name; h.icon = hIcon; }
    else habits.push({ id: uid(), name, icon: hIcon, days: {} });
    saveHabits(); renderAll();
  });
  $('h-cancel').onclick = () => hDlg.close();
  $('h-del').onclick = () => {
    if (!confirm('Delete this habit and its history?')) return;
    habits = habits.filter((x) => x.id !== hEditing); saveHabits(); hDlg.close(); renderAll();
  };
  hDlg.addEventListener('click', (e) => { if (e.target === hDlg) hDlg.close(); });
  $('new-habit').onclick = () => openHabit(null);

  /* ----- Goal dialog ----- */
  const gDlg = $('goal-dlg');
  let gEditing = null;
  function openGoal(g) {
    gEditing = g ? g.id : null;
    $('g-title').textContent = g ? 'Edit goal' : 'New goal';
    $('g-name').value = g ? g.name : '';
    $('g-target').value = g ? g.target : 10;
    $('g-unit').value = g ? g.unit || '' : '';
    $('g-current').value = g ? g.current : 0;
    $('g-range').value = g && g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
    $('g-del').style.display = g ? '' : 'none';
    gDlg.showModal(); $('g-name').focus();
  }
  // keep range and number in sync
  $('g-range').addEventListener('input', () => {
    const t = +$('g-target').value || 1;
    $('g-current').value = Math.round((+$('g-range').value / 100) * t);
  });
  $('g-current').addEventListener('input', () => {
    const t = +$('g-target').value || 1;
    $('g-range').value = Math.min(100, Math.round((+$('g-current').value / t) * 100));
  });
  $('goal-form').addEventListener('submit', () => {
    const name = $('g-name').value.trim(); if (!name) return;
    const target = Math.max(1, +$('g-target').value || 1);
    const current = Math.max(0, Math.min(target, +$('g-current').value || 0));
    const unit = $('g-unit').value.trim();
    if (gEditing) { Object.assign(goals.find((x) => x.id === gEditing), { name, target, current, unit }); }
    else goals.push({ id: uid(), name, target, current, unit });
    saveGoals(); renderAll();
  });
  $('g-cancel').onclick = () => gDlg.close();
  $('g-del').onclick = () => {
    if (!confirm('Delete this goal?')) return;
    goals = goals.filter((x) => x.id !== gEditing); saveGoals(); gDlg.close(); renderAll();
  };
  gDlg.addEventListener('click', (e) => { if (e.target === gDlg) gDlg.close(); });
  $('new-goal').onclick = () => openGoal(null);

  /* ----- Init ----- */
  habits = loadHabits(); goals = loadGoals();
  saveHabits(); saveGoals(); renderAll();
})();