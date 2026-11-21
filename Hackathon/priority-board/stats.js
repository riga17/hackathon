(function () {
  'use strict';
  const KEY = 'priorityBoard.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const fmt = (s) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');

  const PRIO = { high: 'hsl(0 85% 62%)', medium: 'hsl(38 95% 55%)', low: 'hsl(150 60% 45%)' };
  const PRIO_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };
  const LIST_COLORS = { now: 'hsl(335 85% 56%)', later: 'hsl(215 80% 58%)', done: 'hsl(150 60% 45%)' };
  const LIST_LABEL = { now: 'Now', later: 'Later', done: 'Done' };
  const CATS = { study: 'Study', work: 'Work', personal: 'Personal', other: 'Other' };
  const CAT_ICONS = { study: 'book', work: 'note', personal: 'home', other: 'star' };
  const CAT_COLORS = { study: 'hsl(265 70% 60%)', work: 'hsl(215 80% 58%)', personal: 'hsl(335 85% 56%)', other: 'hsl(38 95% 55%)', none: 'hsl(0 0% 60%)' };

  let tasks = [];
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) tasks = r; } catch (e) {}

  /* ----- Top stats ----- */
  const done = tasks.filter((t) => t.list === 'done').length;
  const total = tasks.length;
  const over = tasks.filter((t) => t.list !== 'done' && t.due && t.due < today).length;
  const rate = total ? Math.round((done / total) * 100) : 0;
  $('st-total').textContent = total;
  $('st-done').textContent = done;
  $('st-over').textContent = over;
  $('st-rate').textContent = rate + '%';
  $('sub').textContent = total ? 'Based on your ' + total + ' task' + (total === 1 ? '' : 's') : 'Add tasks to see your stats.';

  /* ----- Donut helper ----- */
  function drawDonut(donutId, legendId, counts, colors, labels, emptyMsg) {
    const donut = $(donutId), leg = $(legendId);
    const entries = Object.entries(counts).filter(([, n]) => n > 0);
    const sum = entries.reduce((s, [, n]) => s + n, 0);
    leg.textContent = '';
    if (!sum) {
      donut.style.setProperty('--seg', 'conic-gradient(var(--border) 0 100%)');
      donut.innerHTML = '';
      const inn = el('div', 'donut-in');
      inn.append(el('b', null, '0'), el('span', null, 'tasks'));
      donut.append(inn);
      leg.append(el('li', 'empty-line', emptyMsg));
      return;
    }
    donut.innerHTML = '';
    let acc = 0;
    const parts = entries.map(([k, n]) => {
      const start = (acc / sum) * 100;
      acc += n;
      const end = (acc / sum) * 100;
      return colors[k] + ' ' + start + '% ' + end + '%';
    });
    donut.style.setProperty('--seg', 'conic-gradient(' + parts.join(',') + ')');
    const inn = el('div', 'donut-in');
    inn.append(el('b', null, String(sum)), el('span', null, 'total'));
    donut.append(inn);
    entries.forEach(([k, n]) => {
      const li = el('li');
      const i = el('i'); i.style.setProperty('--c', colors[k]);
      li.append(i, el('span', null, labels[k]), el('b', null, String(n)));
      leg.append(li);
    });
  }

  /* ----- By priority ----- */
  const prioCounts = { high: 0, medium: 0, low: 0 };
  tasks.forEach((t) => { if (prioCounts[t.priority] != null) prioCounts[t.priority]++; });
  drawDonut('donut-prio', 'leg-prio', prioCounts, PRIO, PRIO_LABEL, 'No tasks yet.');

  /* ----- By list ----- */
  const listCounts = { now: 0, later: 0, done: 0 };
  tasks.forEach((t) => { if (listCounts[t.list] != null) listCounts[t.list]++; });
  drawDonut('donut-list', 'leg-list', listCounts, LIST_COLORS, LIST_LABEL, 'Nothing to show.');

  /* ----- 14-day completion trend ----- */
  function completedDate(t) {
    if (t.list !== 'done') return null;
    if (t.completedAt && /^\d{4}-\d{2}-\d{2}/.test(t.completedAt)) return t.completedAt.slice(0, 10);
    return today;
  }
  const trend = $('trend');
  const days = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(ds(d)); }
  const counts = days.map((k) => tasks.filter((t) => completedDate(t) === k).length);
  const max = Math.max(1, ...counts);
  const trendTotal = counts.reduce((s, n) => s + n, 0);
  $('trend-total').textContent = trendTotal + ' done';
  days.forEach((k, i) => {
    const d = new Date(k + 'T00:00:00');
    const col = el('div', 'tr' + (counts[i] ? ' has' : '') + (k === today ? ' today' : ''));
    const bar = el('i'); bar.style.height = Math.max(4, (counts[i] / max) * 100) + '%';
    col.append(el('b', null, counts[i] ? String(counts[i]) : ''), bar, el('span', null, k === today ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' })));
    col.title = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + counts[i] + ' completed';
    trend.append(col);
  });

  /* ----- By category ----- */
  const catCounts = { study: 0, work: 0, personal: 0, other: 0, none: 0 };
  tasks.forEach((t) => { catCounts[t.cat && CATS[t.cat] ? t.cat : 'none']++; });
  const catList = $('cat-list'); catList.textContent = '';
  const catTotal = Math.max(1, tasks.length);
  const catEntries = Object.entries(catCounts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  if (!catEntries.length) catList.append(el('li', 'empty-line', 'No tasks to categorize.'));
  catEntries.forEach(([k, n]) => {
    const li = el('li');
    const lb = el('div', 'lb');
    const i = el('i'); i.style.setProperty('--c', CAT_COLORS[k]);
    lb.append(i);
    const lbl = el('span');
    lbl.innerHTML = (k === 'none' ? '' : icn(CAT_ICONS[k] || 'star', 13) + ' ') + (k === 'none' ? 'Uncategorized' : CATS[k]);
    lb.append(lbl);
    const bw = el('div', 'bw'); const bi = el('i'); bi.style.width = (n / catTotal) * 100 + '%'; bi.style.setProperty('--c', CAT_COLORS[k]); bw.append(bi);
    li.append(lb, el('span', 'num', String(n)), bw);
    catList.append(li);
  });

  /* ----- Busiest due days (next 7 days) ----- */
  const dayList = $('day-list'); dayList.textContent = '';
  const nextDays = [];
  for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); nextDays.push(ds(d)); }
  const dayCounts = nextDays.map((k) => tasks.filter((t) => t.list !== 'done' && t.due === k).length);
  const maxDay = Math.max(1, ...dayCounts);
  const dayEntries = nextDays.map((k, i) => [k, dayCounts[i]]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  if (!dayEntries.length) dayList.append(el('li', 'empty-line', 'No deadlines in the next 7 days.'));
  dayEntries.forEach(([k, n]) => {
    const d = new Date(k + 'T00:00:00');
    const li = el('li');
    const lb = el('div', 'lb');
    const i = el('i'); i.style.setProperty('--c', k === today ? 'hsl(38 95% 55%)' : 'var(--accent)');
    lb.append(i);
    const lbl = el('span');
    lbl.innerHTML = k === today
      ? icn('clock', 13) + ' Today'
      : icn('calendar', 13) + ' ' + d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    lb.append(lbl);
    const bw = el('div', 'bw'); const bi = el('i'); bi.style.width = (n / maxDay) * 100 + '%'; bi.style.setProperty('--c', k === today ? 'hsl(38 95% 55%)' : 'var(--accent)'); bw.append(bi);
    li.append(lb, el('span', 'num', String(n)), bw);
    dayList.append(li);
  });
})();