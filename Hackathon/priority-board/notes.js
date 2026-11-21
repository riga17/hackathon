(function () {
  'use strict';
  const KEY = 'priority.notes', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const HUES = [null, 335, 215, 265, 150, 38, 185];
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const col = (h) => (h == null ? '' : 'hsl(' + h + ' 75% 55%)');
  let notes = [], cur = null, filt = { q: '', f: 'all' }, saveT, undoT;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ----- Storage ----- */
  function load() {
    try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) return r.filter((n) => n && typeof n.id === 'string'); } catch (e) {}
    const now = Date.now();
    return [{ id: uid(), title: 'Welcome to Notes', body: 'Write anything here: lecture notes, ideas, lists.\n\n• Your notes save automatically.\n• Pin the important ones so they stay on top.\n• Pick a color to organize them.\n• Press / to search, N for a new note.', hue: 335, pinned: true, created: now, updated: now }];
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) { $('saved').textContent = 'Could not save'; } };
  const get = (id) => notes.find((n) => n.id === id);

  function ago(ts) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /* ----- List ----- */
  function renderList() {
    const q = filt.q.toLowerCase(), ul = $('nl'); ul.textContent = '';
    const list = notes.filter((n) => (filt.f === 'all' || n.pinned) && (!q || (n.title + ' ' + n.body).toLowerCase().includes(q)))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
    if (!list.length) ul.append(el('li', 'nl-empty', q ? 'No notes match your search.' : filt.f === 'pinned' ? 'No pinned notes yet.' : 'No notes yet.'));
    list.forEach((n) => {
      const li = el('li'), b = el('button', 'ni' + (n.id === cur ? ' on' : '')); b.type = 'button';
      if (n.hue != null) b.style.setProperty('--c', col(n.hue));
      b.append(el('b', null, (n.pinned ? '📌 ' : '') + (n.title.trim() || 'Untitled note')), el('span', null, n.body.trim().slice(0, 140) || 'No text yet'), el('small', null, ago(n.updated)));
      b.onclick = () => { open(n.id); $('wrap').classList.add('editing'); };
      li.append(b); ul.append(li);
    });
    $('sub').textContent = notes.length + ' note' + (notes.length === 1 ? '' : 's') + ' · ' + notes.filter((n) => n.pinned).length + ' pinned';
  }

  /* ----- Editor ----- */
  function renderSws(n) {
    const box = $('sws'); box.textContent = '';
    HUES.forEach((h) => {
      const b = el('button', 'sw2' + (h == null ? ' none' : '') + ((n.hue == null ? null : n.hue) === h ? ' on' : '')); b.type = 'button';
      if (h != null) b.style.setProperty('--c', col(h));
      b.setAttribute('aria-label', h == null ? 'No color' : 'Color ' + h);
      b.onclick = () => { n.hue = h; touch(n); renderSws(n); paint(n); renderList(); };
      box.append(b);
    });
  }
  function paint(n) {
    const e = $('edit');
    if (n.hue == null) e.style.removeProperty('--c'); else e.style.setProperty('--c', col(n.hue));
    $('pin').classList.toggle('on', !!n.pinned);
    $('pin').setAttribute('aria-pressed', String(!!n.pinned));
  }
  function words() { const t = $('body').value.trim(); $('wc').textContent = (t ? t.split(/\s+/).length : 0) + ' words · ' + $('body').value.length + ' characters'; }
  function open(id) {
    const n = get(id); if (!n) return;
    cur = id; $('title').value = n.title; $('body').value = n.body;
    $('when').textContent = 'Created ' + new Date(n.created).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    $('saved').textContent = ''; renderSws(n); paint(n); words(); renderList();
  }
  function show() {
    const has = notes.length > 0;
    $('none').hidden = has; $('edit').style.display = has ? '' : 'none'; document.querySelector('.nt-list').style.display = has ? '' : 'none';
  }
  function touch(n) { n.updated = Date.now(); clearTimeout(saveT); $('saved').textContent = 'Saving…'; saveT = setTimeout(() => { save(); $('saved').textContent = 'Saved'; }, 300); }

  function create() {
    const now = Date.now(), n = { id: uid(), title: '', body: '', hue: null, pinned: false, created: now, updated: now };
    notes.unshift(n); save(); show(); filt = { q: '', f: 'all' }; $('q').value = '';
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.f === 'all'));
    open(n.id); $('wrap').classList.add('editing'); $('title').focus();
  }

  /* ----- Delete with undo ----- */
  function undoToast(msg, fn) {
    let t = $('undo');
    if (!t) { t = el('div', 'toast'); t.id = 'undo'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = ''; t.append(el('span', null, msg));
    const b = el('button', null, 'Undo'); b.type = 'button'; b.onclick = () => { fn(); t.classList.remove('show'); };
    t.append(b); t.classList.add('show'); clearTimeout(undoT); undoT = setTimeout(() => t.classList.remove('show'), 6000);
  }
  function del() {
    const i = notes.findIndex((n) => n.id === cur); if (i < 0) return;
    const gone = notes.splice(i, 1)[0]; save(); show();
    const next = notes[Math.min(i, notes.length - 1)];
    if (next) open(next.id); else { cur = null; renderList(); }
    $('wrap').classList.remove('editing');
    undoToast('Note deleted', () => { notes.splice(Math.min(i, notes.length), 0, gone); save(); show(); open(gone.id); });
  }

  /* ----- Events ----- */
  $('title').addEventListener('input', () => { const n = get(cur); if (!n) return; n.title = $('title').value; touch(n); renderList(); });
  $('body').addEventListener('input', () => { const n = get(cur); if (!n) return; n.body = $('body').value; touch(n); words(); renderList(); });
  $('pin').onclick = () => { const n = get(cur); if (!n) return; n.pinned = !n.pinned; touch(n); paint(n); renderList(); P.toast(n.pinned ? 'Note pinned.' : 'Note unpinned.'); };
  $('del').onclick = del;
  $('dl').onclick = () => {
    const n = get(cur); if (!n) return;
    const blob = new Blob([(n.title ? n.title + '\n\n' : '') + n.body], { type: 'text/plain' }), a = el('a');
    a.href = URL.createObjectURL(blob); a.download = (n.title.trim() || 'note').replace(/[^\w\- ]+/g, '').slice(0, 40) + '.txt';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('back').onclick = () => $('wrap').classList.remove('editing');
  $('new').onclick = create; $('first').onclick = create;
  $('q').addEventListener('input', (e) => { filt.q = e.target.value.trim(); renderList(); });
  document.querySelector('.chips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    filt.f = c.dataset.f; document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c)); renderList();
  });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select')) return;
    if (e.key === 'n' || e.key === 'N') { e.preventDefault(); create(); }
    else if (e.key === '/') { e.preventDefault(); $('wrap').classList.remove('editing'); $('q').focus(); }
  });
  window.addEventListener('pagehide', () => { clearTimeout(saveT); save(); });

  notes = load(); save(); show();
  const first = notes.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated)[0];
  if (first) open(first.id); else renderList();
})();