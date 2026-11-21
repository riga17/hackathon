(function () {
  'use strict';
  const TK = 'priorityBoard.v1', RK = 'priorityReminders.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const now = new Date();
  const today = ds(now);
  const tomorrow = ds(new Date(now.getTime() + 864e5));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');
  const fmt = (s) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const fmtLong = (s) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  let tasks = [], customs = [], filt = 'all';
  try { const r = JSON.parse(localStorage.getItem(TK)); if (Array.isArray(r)) tasks = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(RK)); if (Array.isArray(r)) customs = r; } catch (e) {}
  const saveCustom = () => { try { localStorage.setItem(RK, JSON.stringify(customs)); } catch (e) {} };

  /* ----- Build combined list ----- */
  function buildItems() {
    const items = [];
    tasks.filter((t) => t.due && t.list !== 'done').forEach((t) => {
      items.push({ kind: 'task', id: t.id, text: t.title, date: t.due, time: '', priority: t.priority, source: 'task', done: false });
    });
    tasks.filter((t) => t.due && t.list === 'done').forEach((t) => {
      items.push({ kind: 'task', id: t.id, text: t.title, date: t.due, time: '', priority: t.priority, source: 'task', done: true });
    });
    customs.forEach((c) => {
      items.push({ kind: 'custom', id: c.id, text: c.text, date: c.date, time: c.time, priority: '', source: 'custom', done: !!c.done });
    });
    items.sort((a, b) => (a.date === b.date ? (a.time || '').localeCompare(b.time || '') : a.date < b.date ? -1 : 1));
    return items;
  }

  function groupOf(item) {
    if (item.done) return 'done';
    if (item.date < today) return 'overdue';
    if (item.date === today) return 'today';
    if (item.date === tomorrow) return 'tomorrow';
    const d = new Date(item.date + 'T00:00:00');
    const diff = (d - new Date(today + 'T00:00:00')) / 864e5;
    if (diff <= 7) return 'week';
    return 'later';
  }
  const GROUPS = [
    ['overdue', 'Overdue', 'alert'],
    ['today', 'Today', 'bell'],
    ['tomorrow', 'Tomorrow', 'sun'],
    ['week', 'This week', 'calendar'],
    ['later', 'Later', 'clock'],
    ['done', 'Done', 'checkCircle']
  ];
  const PRIO_COLOR = { high: 'hsl(0 85% 62%)', medium: 'hsl(38 95% 55%)', low: 'hsl(150 60% 45%)' };

  /* ----- Render ----- */
  function render() {
    const items = buildItems();
    const totalOpen = items.filter((i) => !i.done).length;
    const todayCount = items.filter((i) => !i.done && i.date === today).length;
    const overCount = items.filter((i) => !i.done && i.date < today).length;
    const doneCount = items.filter((i) => i.done).length;

    $('st-total').textContent = totalOpen;
    $('st-today').textContent = todayCount;
    $('st-over').textContent = overCount;
    $('st-done').textContent = doneCount;
    $('sub').textContent = totalOpen ? totalOpen + ' upcoming · ' + overCount + ' overdue' : 'Nothing scheduled. You are clear.';

    const tl = $('timeline'); tl.textContent = '';
    const buckets = {};
    items.forEach((i) => {
      if (filt === 'open' && i.done) return;
      if (filt === 'done' && !i.done) return;
      const g = groupOf(i);
      (buckets[g] = buckets[g] || []).push(i);
    });
    let any = false;
    GROUPS.forEach(([key, label, iconName]) => {
      const list = buckets[key]; if (!list || !list.length) return;
      any = true;
      const grp = el('div', 'tl-group');
      const head = el('div', 'tl-h' + (key === 'overdue' ? ' over' : ''));
      head.innerHTML = icn(iconName, 14) + ' ' + label + ' · ' + list.length;
      grp.append(head);

      const ul = el('ul', 'tl-list');
      list.forEach((i) => {
        const li = el('li', 'rem' + (i.done ? ' done' : '') + (groupOf(i) === 'overdue' ? ' over' : ''));
        if (i.priority) li.style.setProperty('--c', PRIO_COLOR[i.priority] || 'var(--accent)');
        const ico = el('span', 'rem-ico');
        ico.innerHTML = icn(i.source === 'task' ? 'note' : 'bell', 18);
        const body = el('div', 'rem-body');
        body.append(el('div', 'rem-text', i.text));
        const meta = el('div', 'rem-meta');
        const when = i.date === today ? 'Today' : i.date === tomorrow ? 'Tomorrow' : fmtLong(i.date);
        meta.append(el('span', null, when + (i.time ? ' · ' + i.time : '')));
        if (i.priority) meta.append(el('span', 'tag', i.priority));
        if (i.source === 'task') meta.append(el('span', 'tag', 'From tasks'));
        else meta.append(el('span', 'tag', 'Custom'));
        body.append(meta);

        const acts = el('div', 'rem-act');
        const btnDone = el('button'); btnDone.type = 'button';
        btnDone.innerHTML = icn(i.done ? 'refresh' : 'check', 16);
        btnDone.title = i.done ? 'Mark not done' : 'Mark done';
        btnDone.setAttribute('aria-label', (i.done ? 'Mark not done: ' : 'Mark done: ') + i.text);
        btnDone.onclick = () => toggleDone(i);
        acts.append(btnDone);
        if (i.source === 'custom') {
          const e = el('button'); e.type = 'button';
          e.innerHTML = icn('edit', 16);
          e.title = 'Edit'; e.setAttribute('aria-label', 'Edit ' + i.text);
          e.onclick = () => openCustom(customs.find((x) => x.id === i.id));
          acts.append(e);
        }
        li.append(ico, body, acts); ul.append(li);
      });
      grp.append(ul); tl.append(grp);
    });
    if (!any) {
      tl.append(el('div', 'empty', filt === 'done' ? 'No completed reminders yet.' : 'Nothing to show. Add a reminder to get started.'));
    }

    renderCustom();
  }

  function renderCustom() {
    const ul = $('custom-list'); ul.textContent = '';
    const list = customs.slice().sort((a, b) => (a.date === b.date ? (a.time || '').localeCompare(b.time || '') : a.date < b.date ? -1 : 1));
    if (!list.length) { ul.append(el('li', 'empty', 'No custom reminders. Tap + New reminder.')); return; }
    list.forEach((c) => {
      const li = el('li', 'cu' + (c.done ? ' done' : ''));
      li.append(el('div', 'cu-name', c.text));
      li.append(el('div', 'cu-when', (c.date === today ? 'Today' : c.date === tomorrow ? 'Tomorrow' : fmtLong(c.date)) + ' · ' + c.time));
      const row = el('div', 'cu-row');
      const tog = el('button', null, c.done ? 'Undo' : 'Done'); tog.type = 'button';
      tog.onclick = () => { c.done = !c.done; saveCustom(); render(); };
      const ed = el('button', null, 'Edit'); ed.type = 'button'; ed.onclick = () => openCustom(c);
      const rm = el('button', 'rm', 'Delete'); rm.type = 'button'; rm.onclick = () => { if (confirm('Delete this reminder?')) { customs = customs.filter((x) => x.id !== c.id); saveCustom(); render(); } };
      row.append(tog, ed, rm); li.append(row);
      ul.append(li);
    });
  }

  function toggleDone(i) {
    if (i.source === 'custom') { const c = customs.find((x) => x.id === i.id); if (c) { c.done = !c.done; saveCustom(); render(); } return; }
    const t = tasks.find((x) => x.id === i.id);
    if (!t) return;
    if (t.list === 'done') { t.list = 'later'; delete t.completedAt; }
    else { t.list = 'done'; t.completedAt = new Date().toISOString(); }
    try { localStorage.setItem(TK, JSON.stringify(tasks)); } catch (e) {}
    render();
  }

  /* ----- Dialog ----- */
  const dlg = $('dlg');
  let editing = null;
  function openCustom(c) {
    editing = c ? c.id : null;
    $('d-title').textContent = c ? 'Edit reminder' : 'New reminder';
    $('f-text').value = c ? c.text : '';
    $('f-date').value = c ? c.date : today;
    $('f-time').value = c ? c.time : '09:00';
    $('f-alert').checked = c ? !!c.alert : true;
    $('f-del').style.display = c ? '' : 'none';
    dlg.showModal(); $('f-text').focus();
  }
  $('form').addEventListener('submit', () => {
    const text = $('f-text').value.trim(); if (!text) return;
    const data = { text: text.slice(0, 100), date: $('f-date').value, time: $('f-time').value, alert: $('f-alert').checked, done: false };
    if (editing) { const c = customs.find((x) => x.id === editing); Object.assign(c, data); }
    else customs.push(Object.assign({ id: uid(), createdAt: Date.now() }, data));
    saveCustom(); render();
  });
  $('f-cancel').onclick = () => dlg.close();
  $('f-del').onclick = () => {
    if (!confirm('Delete this reminder?')) return;
    customs = customs.filter((x) => x.id !== editing); saveCustom(); dlg.close(); render();
  };
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('new').onclick = () => openCustom(null);

  document.querySelector('.seg-row').addEventListener('click', (e) => {
    const b = e.target.closest('.seg'); if (!b) return;
    filt = b.dataset.f;
    document.querySelectorAll('.seg').forEach((s) => s.classList.toggle('on', s === b));
    render();
  });

  /* ----- Live in-page alerts ----- */
  let lastCheck = 0;
  setInterval(() => {
    const now = new Date();
    const key = now.toISOString().slice(0, 16);
    if (key === lastCheck) return;
    lastCheck = key;
    const hhmm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    customs.forEach((c) => {
      if (c.alert && !c.done && c.date === ds(now) && c.time === hhmm) {
        P.toast('Reminder: ' + c.text);
        if ('Notification' in window && Notification.permission === 'granted') new Notification('Priority reminder', { body: c.text });
      }
    });
  }, 20000);

  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => Notification.requestPermission().catch(() => {}), 3000);
  }

  render();
})();