(function () {
  'use strict';
  const KEY = 'priorityBoard.v1', LIM = 5, P = window.Priority;
  const LISTS = ['now', 'later', 'done'], NAMES = { now: 'Now', later: 'Later', done: 'Done' };
  const RANK = { high: 0, medium: 1, low: 2 }, NEXT = { high: 'medium', medium: 'low', low: 'high' };
  const LABEL = { high: 'High', medium: 'Medium', low: 'Low' };
  const CATS = { study: 'Study', work: 'Work', personal: 'Personal', other: 'Other' };
  const CAT_ICONS = { study: 'book', work: 'note', personal: 'home', other: 'star' };
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ds(d); };
  const fmt = (s) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  let tasks = [], filt = { q: '', p: 'all' }, editing = null, dragId = null, ut;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function icn(name, size) { return window.PriorityIcon ? PriorityIcon(name, size) : ''; }
  const find = (id) => tasks.find((t) => t.id === id);
  const countIn = (l) => tasks.filter((t) => t.list === l).length;

  /* ----- Column header icons ----- */
  [['ico-now', 'fire'], ['ico-later', 'clock'], ['ico-done', 'checkCircle']].forEach(([id, n]) => {
    const e = document.getElementById(id);
    if (e) e.innerHTML = icn(n, 18);
  });

  /* ----- Storage ----- */
  function clean(arr) {
    let n = 0;
    return arr.filter((r) => r && typeof r.id === 'string' && typeof r.title === 'string' && r.title.trim() && LISTS.includes(r.list) && r.priority in RANK)
      .map((r) => {
        const t = Object.assign({}, r, {
          title: r.title.trim().slice(0, 80),
          due: /^\d{4}-\d{2}-\d{2}$/.test(r.due || '') ? r.due : '',
          note: (r.note || '').slice(0, 300),
          cat: CATS[r.cat] ? r.cat : ''
        });
        if (t.list === 'now' && ++n > LIM) t.list = 'later';
        return t;
      });
  }
  function load() {
    try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) return clean(r); } catch (e) {}
    const mk = (title, priority, list, due, cat) => ({ id: uid(), title, priority, list, due: due || '', cat: cat || '', note: '', createdAt: Date.now() });
    return [
      mk('Submit the reflection for the internship', 'high', 'now', today, 'study'),
      mk('Prepare the Scratch lesson plan', 'medium', 'now', inDays(2), 'work'),
      mk('Design the "Catch the Apple" activity', 'medium', 'later', inDays(5), 'work'),
      mk('Buy notebooks and markers', 'low', 'later', '', 'personal'),
      mk('Set up the GitHub repository', 'high', 'done', '', 'study')
    ];
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) {} };

  /* ----- Undo toast ----- */
  function undoToast(msg, fn) {
    let t = $('undo');
    if (!t) { t = el('div', 'toast'); t.id = 'undo'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = ''; t.append(el('span', null, msg));
    const b = el('button', null, 'Undo'); b.type = 'button';
    b.onclick = () => { fn(); t.classList.remove('show'); };
    t.append(b); t.classList.add('show');
    clearTimeout(ut); ut = setTimeout(() => t.classList.remove('show'), 6000);
  }

  /* ----- Render ----- */
  function due(t) {
    if (!t.due) return null;
    if (t.list === 'done') return ['📅 ' + fmt(t.due), ''];
    if (t.due < today) return ['⚠ Overdue · ' + fmt(t.due), 'late'];
    if (t.due === today) return ['⏰ Today', 'td'];
    return ['📅 ' + fmt(t.due), ''];
  }
  function card(t) {
    const li = el('li', 'task p-' + t.priority + (t.list === 'done' ? ' done' : ''));
    li.dataset.id = t.id; li.draggable = true;
    const chk = el('button', 'chk', t.list === 'done' ? '✓' : ''); chk.type = 'button'; chk.dataset.a = 'toggle';
    chk.setAttribute('aria-label', (t.list === 'done' ? 'Mark not done: ' : 'Mark done: ') + t.title);
    const body = el('div', 'tb');
    body.append(el('div', 'tt', t.title));
    if (t.note) body.append(el('p', 'nt', t.note));
    const meta = el('div', 'meta');
    const pb = el('button', 'bd pr', LABEL[t.priority]); pb.type = 'button'; pb.dataset.a = 'prio'; pb.title = 'Click to change priority';
    meta.append(pb);
    const d = due(t); if (d) meta.append(el('span', 'bd ' + d[1], d[0]));
    if (t.cat) {
      const cb = el('span', 'bd');
      cb.innerHTML = icn(CAT_ICONS[t.cat] || 'star', 12) + ' ' + CATS[t.cat];
      meta.append(cb);
    }
    body.append(meta);
    const acts = el('div', 'acts');
    [['edit', 'edit', 'Edit task'], ['del', 'x', 'Delete task']].forEach(([a, n, l]) => {
      const b = el('button'); b.type = 'button'; b.dataset.a = a; b.setAttribute('aria-label', l); b.title = l;
      b.innerHTML = icn(n, 14);
      acts.append(b);
    });
    li.append(chk, body, acts);
    return li;
  }
  function render() {
    const q = filt.q.toLowerCase();
    LISTS.forEach((l) => {
      const ul = $('l-' + l); ul.textContent = '';
      tasks.filter((t) => t.list === l && (filt.p === 'all' || t.priority === filt.p) && (!q || t.title.toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q)))
        .forEach((t) => ul.append(card(t)));
      $('c-' + l).textContent = l === 'now' ? countIn(l) + '/' + LIM : countIn(l);
    });
    document.querySelector('[data-l="now"]').classList.toggle('full', countIn('now') >= LIM);
    const done = countIn('done'), total = tasks.length, pct = total ? Math.round(done / total * 100) : 0;
    const over = tasks.filter((t) => t.list !== 'done' && t.due && t.due < today).length;
    $('s-pct').textContent = pct + '%'; $('s-bar').style.width = pct + '%'; $('s-over').textContent = over;
    $('s-txt').textContent = done + ' of ' + total + ' tasks done';
    $('sub').textContent = (total - done) + ' open · ' + done + ' done';
  }

  /* ----- Actions ----- */
  function move(id, list, beforeId) {
    const t = find(id); if (!t) return;
    if (list === 'now' && t.list !== 'now' && countIn('now') >= LIM) { P.toast('Now is full (' + LIM + '). Finish or move one first.'); render(); return; }
    tasks = tasks.filter((x) => x.id !== id); t.list = list;
    if (list === 'done') t.completedAt = new Date().toISOString();
    else delete t.completedAt;
    const i = beforeId ? tasks.findIndex((x) => x.id === beforeId) : -1;
    i >= 0 ? tasks.splice(i, 0, t) : tasks.push(t);
    save(); render();
  }
  function remove(id) {
    const i = tasks.findIndex((t) => t.id === id); if (i < 0) return;
    const gone = tasks.splice(i, 1)[0]; save(); render();
    undoToast('Task deleted', () => { tasks.splice(Math.min(i, tasks.length), 0, gone); save(); render(); });
  }
  function sortList(l) {
    const s = tasks.filter((t) => t.list === l).sort((a, b) => RANK[a.priority] - RANK[b.priority] || (a.due && b.due ? (a.due < b.due ? -1 : a.due > b.due ? 1 : 0) : a.due ? -1 : b.due ? 1 : 0));
    tasks = tasks.filter((t) => t.list !== l).concat(s); save(); render(); P.toast(NAMES[l] + ' sorted by priority and date.');
  }
  function clearDone() {
    if (!countIn('done')) { P.toast('No completed tasks to clear.'); return; }
    const before = tasks.slice(); tasks = tasks.filter((t) => t.list !== 'done'); save(); render();
    undoToast('Completed tasks cleared', () => { tasks = before; save(); render(); });
  }

  /* ----- Dialog ----- */
  const dlg = $('dlg');
  function openDlg(t, list) {
    editing = t ? t.id : null;
    $('d-title').textContent = t ? 'Edit task' : 'New task';
    $('f-title').value = t ? t.title : '';
    $('f-prio').value = t ? t.priority : (P.get().defaultPrio || 'medium');
    $('f-due').value = t ? t.due : '';
    $('f-list').value = t ? t.list : (list || P.get().defaultList || 'later');
    $('f-cat').value = t ? t.cat || '' : '';
    $('f-note').value = t ? t.note || '' : '';
    $('f-del').style.display = t ? '' : 'none';
    dlg.showModal(); $('f-title').focus();
  }
  $('form').addEventListener('submit', () => {
    const title = $('f-title').value.trim(); if (!title) return;
    let list = $('f-list').value;
    const data = { title: title.slice(0, 80), priority: $('f-prio').value, due: $('f-due').value, cat: $('f-cat').value, note: $('f-note').value.trim() };
    const t = editing ? find(editing) : null;
    if (list === 'now' && (!t || t.list !== 'now') && countIn('now') >= LIM) { list = 'later'; P.toast('Now is full, so it went to Later.'); }
    if (t) {
      Object.assign(t, data);
      if (t.list !== list) {
        tasks = tasks.filter((x) => x !== t); t.list = list; tasks.push(t);
        if (list === 'done') t.completedAt = new Date().toISOString();
        else delete t.completedAt;
      }
    } else {
      tasks.unshift(Object.assign({ id: uid(), list, createdAt: Date.now() }, data));
      if (list === 'done') tasks[0].completedAt = new Date().toISOString();
    }
    save(); render();
  });
  $('f-cancel').onclick = () => dlg.close();
  $('f-del').onclick = () => { const id = editing; dlg.close(); remove(id); };
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $('new').onclick = () => openDlg(null, 'later');

  /* ----- Events ----- */
  const board = $('board');
  board.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]'); if (add) return openDlg(null, add.dataset.add);
    const so = e.target.closest('[data-sort]'); if (so) return sortList(so.dataset.sort);
    if (e.target.closest('#clear')) return clearDone();
    const b = e.target.closest('[data-a]'); if (!b) return;
    const id = b.closest('.task').dataset.id, t = find(id); if (!t) return;
    const a = b.dataset.a;
    if (a === 'toggle') move(id, t.list === 'done' ? 'later' : 'done');
    else if (a === 'edit') openDlg(t);
    else if (a === 'del') remove(id);
    else if (a === 'prio') { t.priority = NEXT[t.priority]; save(); render(); }
  });
  board.addEventListener('dblclick', (e) => { const li = e.target.closest('.task'); if (li && !e.target.closest('button')) openDlg(find(li.dataset.id)); });

  // drag & drop (built into the browser, no libraries needed)
  board.addEventListener('dragstart', (e) => {
    const li = e.target.closest('.task'); if (!li) return;
    dragId = li.dataset.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId);
    setTimeout(() => li.classList.add('dragging'), 0);
  });
  board.addEventListener('dragend', () => { dragId = null; document.querySelectorAll('.dragging,.over').forEach((n) => n.classList.remove('dragging', 'over')); });
  board.addEventListener('dragover', (e) => {
    const col = e.target.closest('.col'); if (!col || !dragId) return;
    e.preventDefault(); document.querySelectorAll('.col.over').forEach((c) => c !== col && c.classList.remove('over')); col.classList.add('over');
  });
  board.addEventListener('drop', (e) => {
    const col = e.target.closest('.col'); if (!col || !dragId) return;
    e.preventDefault(); col.classList.remove('over');
    const before = [...col.querySelectorAll('.task:not(.dragging)')].find((n) => { const r = n.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    move(dragId, col.dataset.l, before ? before.dataset.id : null);
  });

  $('q').addEventListener('input', (e) => { filt.q = e.target.value.trim(); render(); });
  document.querySelector('.chips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    filt.p = c.dataset.p; document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c)); render();
  });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select') || dlg.open) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openDlg(null, 'later'); }
    else if (e.key === '/') { e.preventDefault(); $('q').focus(); }
  });

  tasks = load(); save(); render();
})();