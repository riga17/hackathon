(function () {
  'use strict';
  const KEY = 'priority.study', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const today = ds(new Date());
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const col = (h) => 'hsl(' + h + ' 75% 55%)';
  const HUES = [335, 215, 265, 150, 25, 185];
  const fmtM = (m) => (m < 60 ? m + ' min' : Math.floor(m / 60) + 'h ' + (m % 60 ? (m % 60) + 'm' : ''));
  let D, newHue = HUES[0], deck = 'all', idx = 0, flipped = false;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ----- Storage ----- */
  function load() {
    try {
      const r = JSON.parse(localStorage.getItem(KEY));
      if (r && Array.isArray(r.subjects)) return Object.assign({ sessions: [], exams: [], cards: [] }, r);
    } catch (e) {}
    const m = uid(), p = uid(), g = uid();
    return {
      subjects: [{ id: m, name: 'Math', hue: 215, goal: 5 }, { id: p, name: 'Programming', hue: 265, goal: 5 }, { id: g, name: 'English', hue: 25, goal: 3 }],
      sessions: [], exams: [],
      cards: [
        { id: uid(), sub: p, q: 'What does HTML stand for?', a: 'HyperText Markup Language', known: false },
        { id: uid(), sub: m, q: 'What is the area of a circle?', a: 'π × r²', known: false }
      ]
    };
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {} };
  const sub = (id) => D.subjects.find((s) => s.id === id);

  /* ----- Stats ----- */
  const minsOn = (d) => D.sessions.filter((s) => s.date === d).reduce((a, s) => a + s.mins, 0);
  const weekStart = ds(addDays(-6));
  const weekMins = (id) => D.sessions.filter((s) => s.date >= weekStart && (!id || s.sub === id)).reduce((a, s) => a + s.mins, 0);

  function renderStats() {
    $('s-today').textContent = fmtM(minsOn(today));
    $('s-week').textContent = fmtM(weekMins());
    let streak = 0, d = 0;
    if (!minsOn(today)) d = 1; // today may not be studied yet
    while (minsOn(ds(addDays(-d)))) { streak++; d++; }
    $('s-streak').textContent = streak;
    $('s-cards').textContent = D.cards.filter((c) => c.known).length + '/' + D.cards.length;
    $('w-total').textContent = fmtM(weekMins());
  }

  function renderBars() {
    const box = $('bars'); box.textContent = '';
    const days = [...Array(7)].map((_, i) => addDays(i - 6));
    const vals = days.map((d) => minsOn(ds(d)));
    const max = Math.max(30, ...vals);
    days.forEach((d, i) => {
      const b = el('div', 'bar' + (vals[i] ? ' has' : '') + (i === 6 ? ' today' : ''));
      const bar = el('i'); bar.style.height = Math.max(6, (vals[i] / max) * 100) + '%';
      b.append(el('b', null, vals[i] ? vals[i] + 'm' : ''), bar, el('span', null, i === 6 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' })));
      box.append(b);
    });
  }

  /* ----- Subjects ----- */
  function renderSubjects() {
    const ul = $('subjects'); ul.textContent = '';
    $('sub-count').textContent = D.subjects.length;
    if (!D.subjects.length) ul.append(el('li', 'empty', 'Add your first subject below.'));
    D.subjects.forEach((s) => {
      const mins = weekMins(s.id), goal = s.goal * 60, pct = Math.min(100, Math.round(mins / goal * 100));
      const li = el('li', 'row'); li.style.setProperty('--c', col(s.hue));
      const b = el('div', 'rb'); b.append(el('div', 'rt', s.name), el('small', null, fmtM(mins) + ' of ' + s.goal + 'h this week'));
      const m = el('div', 'meter'); const i = el('i'); i.style.width = pct + '%'; m.append(i); b.append(m);
      const x = el('button', 'x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Delete subject ' + s.name); x.title = 'Delete subject';
      x.onclick = () => {
        if (!confirm('Delete "' + s.name + '" and its flashcards? Logged study time stays in your totals.')) return;
        D.subjects = D.subjects.filter((z) => z.id !== s.id); D.cards = D.cards.filter((c) => c.sub !== s.id);
        save(); renderAll();
      };
      li.append(b, x); ul.append(li);
    });
    const opts = D.subjects.map((s) => '<option value="' + s.id + '">' + s.name.replace(/</g, '&lt;') + '</option>').join('') || '<option value="">Add a subject first</option>';
    ['t-sub', 'fc-sub'].forEach((id) => { const sel = $(id), v = sel.value; sel.innerHTML = opts; if (v && sub(v)) sel.value = v; });
    const dk = $('fc-deck'), dv = deck;
    dk.innerHTML = '<option value="all">All decks</option>' + D.subjects.map((s) => '<option value="' + s.id + '">' + s.name.replace(/</g, '&lt;') + '</option>').join('');
    dk.value = sub(dv) ? dv : 'all'; deck = dk.value;
  }

  function renderHues() {
    const box = $('sub-hues'); box.textContent = '';
    HUES.forEach((h) => {
      const b = el('button', 'sw2' + (h === newHue ? ' on' : '')); b.type = 'button'; b.style.setProperty('--c', col(h)); b.setAttribute('aria-label', 'Color ' + h);
      b.onclick = () => { newHue = h; renderHues(); }; box.append(b);
    });
  }

  /* ----- Exams ----- */
  function renderExams() {
    const ul = $('exams'); ul.textContent = '';
    const list = D.exams.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    if (!list.length) ul.append(el('li', 'empty', 'No exams yet. Add a date to start the countdown.'));
    list.forEach((x) => {
      const diff = Math.round((new Date(x.date + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5);
      const li = el('li', 'row' + (diff < 0 ? ' past' : diff <= 3 ? ' soon' : ''));
      const dd = el('div', 'days', diff < 0 ? '—' : String(diff)); dd.append(el('small', null, diff < 0 ? 'passed' : diff === 0 ? 'today' : diff === 1 ? 'day left' : 'days left'));
      dd.firstChild.nodeType === 3 && (dd.firstChild.textContent = diff < 0 ? '—' : diff);
      const b = el('div', 'rb'); b.append(el('div', 'rt', x.name), el('small', null, new Date(x.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })));
      const del = el('button', 'x', '✕'); del.type = 'button'; del.setAttribute('aria-label', 'Delete ' + x.name);
      del.onclick = () => { D.exams = D.exams.filter((z) => z.id !== x.id); save(); renderExams(); };
      li.append(dd, b, del); ul.append(li);
    });
  }

  /* ----- Flashcards ----- */
  const cards = () => D.cards.filter((c) => deck === 'all' || c.sub === deck);
  function renderCard(anim) {
    const list = cards(), c = list[idx];
    const card = $('fc-card');
    card.classList.toggle('back', !!c && flipped);
    if (anim) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
    ['fc-learn', 'fc-know', 'fc-del'].forEach((id) => { $(id).disabled = !c; });
    if (!c) { $('fc-side').textContent = ''; $('fc-text').textContent = 'No cards here yet. Add one below.'; $('fc-hint').textContent = ''; $('fc-count').textContent = ''; return; }
    $('fc-side').textContent = (sub(c.sub) ? sub(c.sub).name + ' · ' : '') + (flipped ? 'Answer' : 'Question');
    $('fc-text').textContent = flipped ? c.a : c.q;
    $('fc-hint').textContent = flipped ? 'Did you get it right?' : 'Click to flip';
    $('fc-count').textContent = 'Card ' + (idx + 1) + ' of ' + list.length + ' · ' + list.filter((z) => z.known).length + ' mastered';
  }
  function nextCard() { const n = cards().length; idx = n ? (idx + 1) % n : 0; flipped = false; renderCard(true); }
  function mark(known) { const c = cards()[idx]; if (!c) return; c.known = known; save(); renderStats(); nextCard(); }

  /* ----- Timer (uses real time, so it stays accurate) ----- */
  let total = 1500, left = 1500, endAt = 0, tick = null;
  const draw = () => { $('t-disp').textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60); };
  function log(mins) {
    const sid = $('t-sub').value; if (!sid || mins < 1) return;
    D.sessions.push({ id: uid(), sub: sid, mins, date: today }); save(); renderAll();
    P.toast('Logged ' + mins + ' min of ' + (sub(sid) ? sub(sid).name : 'study') + '.');
  }
  function stopTick() { clearInterval(tick); tick = null; }
  function setLen() { total = left = +$('t-len').value * 60; draw(); }
  function reset() { stopTick(); setLen(); $('t-go').textContent = 'Start'; }
  function go() {
    if (tick) { stopTick(); left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); $('t-go').textContent = 'Resume'; return; }
    if (!$('t-sub').value) { P.toast('Add a subject first.'); return; }
    endAt = Date.now() + left * 1000; $('t-go').textContent = 'Pause';
    tick = setInterval(() => {
      left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); draw();
      if (left <= 0) { stopTick(); log(Math.round(total / 60)); reset(); }
    }, 250);
  }
  function finish() {
    if (tick) left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    const mins = Math.round((total - left) / 60);
    if (mins < 1) { P.toast('Study for at least a minute to log a session.'); return; }
    log(mins); reset();
  }

  function renderAll() { renderSubjects(); renderStats(); renderBars(); renderExams(); renderCard(false); }

  /* ----- Events ----- */
  $('t-go').onclick = go; $('t-fin').onclick = finish; $('t-reset').onclick = reset;
  $('t-len').onchange = () => { if (!tick) setLen(); else P.toast('Reset the timer to change its length.'); };

  $('sub-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('sub-name').value.trim(); if (!name) return;
    D.subjects.push({ id: uid(), name: name.slice(0, 30), hue: newHue, goal: Math.max(1, Math.min(60, +$('sub-goal').value || 5)) });
    save(); $('sub-name').value = ''; renderAll();
  });
  $('ex-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('ex-name').value.trim(), date = $('ex-date').value; if (!name || !date) return;
    D.exams.push({ id: uid(), name: name.slice(0, 50), date }); save(); $('ex-name').value = ''; $('ex-date').value = ''; renderExams();
  });
  $('fc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('fc-q').value.trim(), a = $('fc-a').value.trim(), s = $('fc-sub').value;
    if (!q || !a) return; if (!s) { P.toast('Add a subject first.'); return; }
    D.cards.push({ id: uid(), sub: s, q, a, known: false }); save();
    $('fc-q').value = ''; $('fc-a').value = ''; $('fc-q').focus();
    deck = 'all'; $('fc-deck').value = 'all'; idx = cards().length - 1; flipped = false;
    renderStats(); renderCard(true); P.toast('Card added.');
  });
  $('fc-card').onclick = () => { if (!cards().length) return; flipped = !flipped; renderCard(true); };
  $('fc-know').onclick = () => mark(true);
  $('fc-learn').onclick = () => mark(false);
  $('fc-del').onclick = () => {
    const c = cards()[idx]; if (!c) return;
    D.cards = D.cards.filter((z) => z.id !== c.id); save(); idx = 0; flipped = false; renderStats(); renderCard(true);
  };
  $('fc-deck').onchange = (e) => { deck = e.target.value; idx = 0; flipped = false; renderCard(true); };
  $('fc-shuffle').onclick = () => {
    const keep = D.cards.filter((c) => deck !== 'all' && c.sub !== deck), mix = cards();
    for (let i = mix.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [mix[i], mix[j]] = [mix[j], mix[i]]; }
    D.cards = keep.concat(mix); save(); idx = 0; flipped = false; renderCard(true); P.toast('Cards shuffled.');
  };
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,select,button')) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); $('fc-card').click(); }
    else if (e.key === 'ArrowRight') nextCard();
  });

  D = load(); save();
  renderHues(); renderAll(); draw();
})();