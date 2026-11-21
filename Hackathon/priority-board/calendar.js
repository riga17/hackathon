(function () {
  'use strict';
  const KEY = 'priorityBoard.v1', EK = 'priorityExams.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (s) => new Date(s + 'T00:00:00');
  const today = ds(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.innerHTML = P.icon('grid', 20);
  const prevBtn = $('prev');
  if (prevBtn) prevBtn.innerHTML = P.icon('arrowLeft', 20);
  const nextBtn = $('next');
  if (nextBtn) nextBtn.innerHTML = P.icon('arrowRight', 20);

  /* =========================================================
     State
     ========================================================= */
  let tasks = [], exams = [];
  let view = new Date();
  view.setDate(1);
  let sel = today;
  let dragId = null;

  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) tasks = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(EK)); if (Array.isArray(r)) exams = r; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} };

  const tasksOn = (d) => tasks.filter((t) => t.due === d);
  const examsOn = (d) => exams.filter((x) => x.date === d);

  /* =========================================================
     Month grid
     ========================================================= */
  function renderGrid() {
    $('month-label').textContent = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const y = view.getFullYear(), m = view.getMonth();
    const start = new Date(y, m, 1 - ((new Date(y, m, 1).getDay() + 6) % 7));
    const grid = $('days'); grid.textContent = '';
    let dueCount = 0, examCount = 0;

    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = ds(d);
      const tList = tasksOn(key);
      const eList = examsOn(key);
      const inMonth = d.getMonth() === m;
      if (inMonth) { dueCount += tList.length; examCount += eList.length; }

      const cell = el('div', 'day' + (inMonth ? '' : ' other') + (key === today ? ' today' : '') + (key === sel ? ' sel' : ''));
      cell.dataset.d = key;
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      const aria = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) +
        ', ' + tList.length + ' tasks, ' + eList.length + ' exams';
      cell.setAttribute('aria-label', aria);
      cell.append(el('span', 'num', d.getDate()));

      const chips = el('div', 'chips');

      tList.slice(0, 3).forEach((t) => {
        const c = el('span', 'ch p-' + t.priority + (t.list === 'done' ? ' done' : ''), t.title);
        c.dataset.id = t.id;
        c.draggable = true;
        c.title = t.title;
        chips.append(c);
      });

      eList.slice(0, 2).forEach((ex) => {
        const label = ex.subject + (ex.topic ? ' · ' + ex.topic : '');
        const c = el('span', 'ch ch-exam', label);
        c.dataset.examId = ex.id;
        c.title = 'Exam: ' + label + (ex.time ? ' at ' + ex.time : '');
        chips.append(c);
      });

      const total = tList.length + eList.length;
      if (total > 5) {
        chips.append(el('span', 'more', '+' + (total - 5) + ' more'));
      }

      cell.append(chips);
      grid.append(cell);
    }

    $('month-sub').textContent =
      (dueCount || examCount)
        ? dueCount + ' task' + (dueCount === 1 ? '' : 's') + ' · ' +
          examCount + ' exam' + (examCount === 1 ? '' : 's') + ' this month'
        : 'Nothing due this month';
  }

  /* =========================================================
     Day panel
     ========================================================= */
  function renderPanel() {
    const d = parse(sel);
    const diff = Math.round((d - parse(today)) / 864e5);
    $('dp-rel').textContent =
      diff === 0 ? 'Today' :
      diff === 1 ? 'Tomorrow' :
      diff === -1 ? 'Yesterday' :
      diff > 0 ? 'In ' + diff + ' days' :
      Math.abs(diff) + ' days ago';
    $('dp-date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    const ul = $('dp-list'); ul.textContent = '';
    const tList = tasksOn(sel);
    const eList = examsOn(sel);

    if (!tList.length && !eList.length) {
      ul.append(el('li', 'dp-empty', 'Nothing planned. Add a task below.'));
      return;
    }

    eList.forEach((ex) => {
      const li = el('li', 'dp-item dp-exam');
      const ico = el('div', 'exam-ico', 'Exam');
      const body = el('div', 'tx', ex.subject);
      const meta = [];
      if (ex.time) meta.push(ex.time);
      if (ex.room) meta.push(ex.room);
      if (meta.length) body.append(el('small', null, meta.join(' · ')));
      if (ex.topic) body.append(el('small', null, ex.topic));
      if (ex.notes) body.append(el('small', null, ex.notes));
      li.append(ico, body);
      ul.append(li);
    });

    tList.forEach((t) => {
      const li = el('li', 'dp-item p-' + t.priority + (t.list === 'done' ? ' done' : ''));
      const chk = el('button', 'chk', t.list === 'done' ? '✓' : '');
      chk.type = 'button';
      chk.setAttribute('aria-label', (t.list === 'done' ? 'Mark not done: ' : 'Mark done: ') + t.title);
      chk.onclick = () => {
        t.list = t.list === 'done' ? 'later' : 'done';
        if (t.list === 'done') t.completedAt = new Date().toISOString();
        else delete t.completedAt;
        save();
        renderAll();
      };
      const tx = el('div', 'tx', t.title);
      tx.append(el('small', null, t.priority[0].toUpperCase() + t.priority.slice(1) + ' priority · ' +
        (t.list === 'now' ? 'Now' : t.list === 'done' ? 'Done' : 'Later')));
      const x = el('button', 'x', '✕');
      x.type = 'button';
      x.setAttribute('aria-label', 'Remove due date from ' + t.title);
      x.title = 'Remove from calendar';
      x.onclick = () => {
        t.due = '';
        save();
        renderAll();
        P.toast('Removed from the calendar. The task is still in My Tasks.');
      };
      li.append(chk, tx, x);
      ul.append(li);
    });
  }

  function renderAll() { renderGrid(); renderPanel(); }

  /* =========================================================
     Navigation
     ========================================================= */
  function go(delta) {
    view = delta === 0 ? new Date() : new Date(view.getFullYear(), view.getMonth() + delta, 1);
    view.setDate(1);
    if (delta === 0) sel = today;
    renderAll();
  }
  $('prev').onclick = () => go(-1);
  $('next').onclick = () => go(1);
  $('today').onclick = () => go(0);

  /* =========================================================
     Day clicks
     ========================================================= */
  const grid = $('days');

  function pick(cell) {
    sel = cell.dataset.d;
    const d = parse(sel);
    if (d.getMonth() !== view.getMonth()) {
      view = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    renderAll();
  }

  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.day');
    if (c) pick(c);
  });
  grid.addEventListener('keydown', (e) => {
    const c = e.target.closest('.day');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(c); }
  });

  /* =========================================================
     Drag and drop — tasks only
     ========================================================= */
  grid.addEventListener('dragstart', (e) => {
    const c = e.target.closest('.ch'); if (!c) return;
    if (!c.dataset.id) return;
    dragId = c.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
    setTimeout(() => c.classList.add('dragging'), 0);
  });

  grid.addEventListener('dragend', () => {
    dragId = null;
    grid.querySelectorAll('.dragging,.drop').forEach((n) => n.classList.remove('dragging', 'drop'));
  });

  grid.addEventListener('dragover', (e) => {
    const c = e.target.closest('.day'); if (!c || !dragId) return;
    e.preventDefault();
    grid.querySelectorAll('.drop').forEach((n) => n !== c && n.classList.remove('drop'));
    c.classList.add('drop');
  });

  grid.addEventListener('drop', (e) => {
    const c = e.target.closest('.day'); if (!c || !dragId) return;
    e.preventDefault();
    const t = tasks.find((x) => x.id === dragId); if (!t) return;
    t.due = c.dataset.d;
    sel = c.dataset.d;
    save();
    renderAll();
    P.toast('Moved to ' + parse(t.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + '.');
  });

  /* =========================================================
     Add a task on the selected day
     ========================================================= */
  $('dp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('dp-title').value.trim(); if (!v) return;
    tasks.unshift({
      id: uid(),
      title: v.slice(0, 80),
      priority: $('dp-prio').value,
      list: 'later',
      due: sel,
      createdAt: Date.now()
    });
    save();
    $('dp-title').value = '';
    $('dp-prio').value = 'medium';
    renderAll();
    P.toast('Task added.');
  });

  /* =========================================================
     Reload on focus so exam edits show up
     ========================================================= */
  window.addEventListener('focus', () => {
    try { const r = JSON.parse(localStorage.getItem(EK)); exams = Array.isArray(r) ? r : []; } catch (e) {}
    try { const r = JSON.parse(localStorage.getItem(KEY)); tasks = Array.isArray(r) ? r : []; } catch (e) {}
    renderAll();
  });

  renderAll();
})();