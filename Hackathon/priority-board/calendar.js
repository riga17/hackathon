(function () {
  'use strict';
  const KEY = 'priorityBoard.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (s) => new Date(s + 'T00:00:00');
  const today = ds(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  let tasks = [], view = new Date(), sel = today, dragId = null;
  view.setDate(1);

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ----- Storage (same key as the other pages) ----- */
  function load() {
    try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) return r; } catch (e) {}
    const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ds(d); };
    const mk = (title, priority, list, due) => ({ id: uid(), title, priority, list, due, createdAt: Date.now() });
    return [
      mk('Submit the reflection for the internship', 'high', 'now', today),
      mk('Prepare the Scratch lesson plan', 'medium', 'now', inDays(2)),
      mk('Design the "Catch the Apple" activity', 'medium', 'later', inDays(5)),
      mk('Buy notebooks and markers', 'low', 'later', ''),
      mk('Set up the GitHub repository', 'high', 'done', '')
    ];
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} };
  const onDay = (d) => tasks.filter((t) => t.due === d);

  /* ----- Month grid ----- */
  function renderGrid() {
    $('month-label').textContent = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const y = view.getFullYear(), m = view.getMonth();
    const start = new Date(y, m, 1 - ((new Date(y, m, 1).getDay() + 6) % 7)); // week starts Monday
    const grid = $('days'); grid.textContent = '';
    let dueCount = 0, doneCount = 0;

    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = ds(d), list = onDay(key), inMonth = d.getMonth() === m;
      if (inMonth) { dueCount += list.length; doneCount += list.filter((t) => t.list === 'done').length; }

      const cell = el('div', 'day' + (inMonth ? '' : ' other') + (key === today ? ' today' : '') + (key === sel ? ' sel' : ''));
      cell.dataset.d = key; cell.tabIndex = 0; cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ', ' + list.length + ' tasks');
      cell.append(el('span', 'num', d.getDate()));

      const chips = el('div', 'chips');
      list.slice(0, 3).forEach((t) => {
        const c = el('span', 'ch p-' + t.priority + (t.list === 'done' ? ' done' : ''), t.title);
        c.dataset.id = t.id; c.draggable = true; c.title = t.title; chips.append(c);
      });
      if (list.length > 3) chips.append(el('span', 'more', '+' + (list.length - 3) + ' more'));
      cell.append(chips);
      grid.append(cell);
    }
    $('month-sub').textContent = dueCount
      ? dueCount + ' task' + (dueCount > 1 ? 's' : '') + ' due this month · ' + doneCount + ' done'
      : 'Nothing due this month';
  }

  /* ----- Day panel ----- */
  function renderPanel() {
    const d = parse(sel), diff = Math.round((d - parse(today)) / 864e5);
    $('dp-rel').textContent = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : diff > 0 ? 'In ' + diff + ' days' : Math.abs(diff) + ' days ago';
    $('dp-date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const ul = $('dp-list'); ul.textContent = '';
    const list = onDay(sel);
    if (!list.length) { ul.append(el('li', 'dp-empty', 'Nothing planned. Add a task below.')); return; }
    list.forEach((t) => {
      const li = el('li', 'dp-item p-' + t.priority + (t.list === 'done' ? ' done' : ''));
      const chk = el('button', 'chk', t.list === 'done' ? '✓' : ''); chk.type = 'button';
      chk.setAttribute('aria-label', (t.list === 'done' ? 'Mark not done: ' : 'Mark done: ') + t.title);
      chk.onclick = () => { t.list = t.list === 'done' ? 'later' : 'done'; save(); renderAll(); };
      const tx = el('div', 'tx', t.title);
      tx.append(el('small', null, t.priority[0].toUpperCase() + t.priority.slice(1) + ' priority · ' + (t.list === 'now' ? 'Now' : t.list === 'done' ? 'Done' : 'Later')));
      const x = el('button', 'x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Remove due date from ' + t.title); x.title = 'Remove from calendar';
      x.onclick = () => { t.due = ''; save(); renderAll(); P.toast('Removed from the calendar. The task is still in My Tasks.'); };
      li.append(chk, tx, x); ul.append(li);
    });
  }

  function renderAll() { renderGrid(); renderPanel(); }

  function go(delta) { view = delta === 0 ? new Date() : new Date(view.getFullYear(), view.getMonth() + delta, 1); view.setDate(1); if (delta === 0) sel = today; renderAll(); }

  /* ----- Events ----- */
  $('prev').onclick = () => go(-1);
  $('next').onclick = () => go(1);
  $('today').onclick = () => go(0);

  const grid = $('days');
  function pick(cell) {
    sel = cell.dataset.d;
    const d = parse(sel);
    if (d.getMonth() !== view.getMonth()) { view = new Date(d.getFullYear(), d.getMonth(), 1); }
    renderAll();
  }
  grid.addEventListener('click', (e) => { const c = e.target.closest('.day'); if (c) pick(c); });
  grid.addEventListener('keydown', (e) => {
    const c = e.target.closest('.day');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(c); }
  });

  // drag a task to another day to reschedule
  grid.addEventListener('dragstart', (e) => {
    const c = e.target.closest('.ch'); if (!c) return;
    dragId = c.dataset.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId);
    setTimeout(() => c.classList.add('dragging'), 0);
  });
  grid.addEventListener('dragend', () => { dragId = null; grid.querySelectorAll('.dragging,.drop').forEach((n) => n.classList.remove('dragging', 'drop')); });
  grid.addEventListener('dragover', (e) => {
    const c = e.target.closest('.day'); if (!c || !dragId) return;
    e.preventDefault(); grid.querySelectorAll('.drop').forEach((n) => n !== c && n.classList.remove('drop')); c.classList.add('drop');
  });
  grid.addEventListener('drop', (e) => {
    const c = e.target.closest('.day'); if (!c || !dragId) return;
    e.preventDefault();
    const t = tasks.find((x) => x.id === dragId); if (!t) return;
    t.due = c.dataset.d; sel = c.dataset.d; save(); renderAll();
    P.toast('Moved to ' + parse(t.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + '.');
  });

  $('dp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('dp-title').value.trim(); if (!v) return;
    tasks.unshift({ id: uid(), title: v.slice(0, 80), priority: $('dp-prio').value, list: 'later', due: sel, createdAt: Date.now() });
    save(); $('dp-title').value = ''; $('dp-prio').value = 'medium'; renderAll(); P.toast('Task added.');
  });

  tasks = load(); save(); renderAll();
})();