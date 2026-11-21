(function () {
  'use strict';
  const TK = 'priorityBoard.v1', HK = 'priorityBoard.habits.v2', GK = 'priorityBoard.goals.v1', AK = 'priorityAchievements.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  let tasks = [], habits = [], goals = [], state = { unlocked: {}, xp: 0, seen: {} };
  try { const r = JSON.parse(localStorage.getItem(TK)); if (Array.isArray(r)) tasks = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(HK)); if (Array.isArray(r)) habits = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(GK)); if (Array.isArray(r)) goals = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(AK)); if (r && typeof r === 'object') state = Object.assign(state, r); } catch (e) {}
  const save = () => { try { localStorage.setItem(AK, JSON.stringify(state)); } catch (e) {} };

  /* ----- Progress helpers ----- */
  const doneCount = () => tasks.filter((t) => t.list === 'done').length;
  const totalCount = () => tasks.length;
  const highDone = () => tasks.filter((t) => t.list === 'done' && t.priority === 'high').length;
  const customDone = () => tasks.filter((t) => t.list === 'done' && t.cat).length;
  const todayDone = () => tasks.filter((t) => t.list === 'done' && t.due === today).length;

  function bestStreak() {
    let best = 0;
    habits.forEach((h) => {
      let s = 0;
      const d = new Date();
      for (let i = 0; i < 400; i++) {
        const k = ds(d);
        const on = (h.days && h.days[k] && h.days[k].includes('done'));
        if (on) s++; else if (i === 0) { /* today not done yet, keep counting yesterday */ } else break;
        d.setDate(d.getDate() - 1);
      }
      if (s > best) best = s;
    });
    return best;
  }
  const habitsDoneToday = () => habits.filter((h) => h.days && h.days[today] && h.days[today].includes('done')).length;

  /* ----- Badge definitions ----- */
  // Each badge: { id, name, desc, icon, cat, target, get, xp }
  const BADGES = [
    { id: 'first_task', name: 'First step', desc: 'Complete your very first task.', icon: '🌱', cat: 'tasks', target: 1, get: doneCount, xp: 20 },
    { id: 'five_tasks', name: 'Getting going', desc: 'Complete 5 tasks.', icon: '🚀', cat: 'tasks', target: 5, get: doneCount, xp: 40 },
    { id: 'twenty_tasks', name: 'Task master', desc: 'Complete 20 tasks.', icon: '🏅', cat: 'tasks', target: 20, get: doneCount, xp: 100 },
    { id: 'fifty_tasks', name: 'Unstoppable', desc: 'Complete 50 tasks.', icon: '⚡', cat: 'tasks', target: 50, get: doneCount, xp: 200 },
    { id: 'high_5', name: 'Priority pro', desc: 'Finish 5 high-priority tasks.', icon: '🔴', cat: 'tasks', target: 5, get: highDone, xp: 70 },
    { id: 'today_3', name: 'On the day', desc: 'Complete 3 tasks due today.', icon: '⏰', cat: 'tasks', target: 3, get: todayDone, xp: 60 },
    { id: 'categorized_5', name: 'Organized mind', desc: 'Finish 5 categorized tasks.', icon: '🏷️', cat: 'tasks', target: 5, get: customDone, xp: 60 },
    { id: 'streak_3', name: 'On a roll', desc: 'Reach a 3-day habit streak.', icon: '🔥', cat: 'streak', target: 3, get: bestStreak, xp: 50 },
    { id: 'streak_7', name: 'Week warrior', desc: 'Reach a 7-day habit streak.', icon: '💥', cat: 'streak', target: 7, get: bestStreak, xp: 120 },
    { id: 'streak_30', name: 'Habit hero', desc: 'Reach a 30-day habit streak.', icon: '👑', cat: 'streak', target: 30, get: bestStreak, xp: 400 },
    { id: 'focus_1', name: 'Zen', desc: 'Finish one focus session.', icon: '🎯', cat: 'focus', target: 1, get: () => state.focusSessions || 0, xp: 30 },
    { id: 'focus_10', name: 'Deep worker', desc: 'Finish 10 focus sessions.', icon: '🧠', cat: 'focus', target: 10, get: () => state.focusSessions || 0, xp: 120 },
    { id: 'focus_50', name: 'Flow state', desc: 'Finish 50 focus sessions.', icon: '🌊', cat: 'focus', target: 50, get: () => state.focusSessions || 0, xp: 400 },
    { id: 'habits_perfect', name: 'Perfect day', desc: 'Complete every habit today.', icon: '✨', cat: 'habits', target: () => Math.max(1, habits.length), get: habitsDoneToday, xp: 40 },
    { id: 'habit_5', name: 'Habit collector', desc: 'Have 5 habits going.', icon: '🌿', cat: 'habits', target: 5, get: () => habits.length, xp: 50 },
    { id: 'goals_1', name: 'Goal getter', desc: 'Create your first goal.', icon: '🎯', cat: 'habits', target: 1, get: () => goals.length, xp: 20 },
    { id: 'goal_complete', name: 'Promise kept', desc: 'Reach a goal 100%.', icon: '🏁', cat: 'habits', target: 1, get: () => goals.filter((g) => g.current >= g.target).length, xp: 80 },
    { id: 'early_bird', name: 'Early bird', desc: 'Complete a task before noon.', icon: '🌅', cat: 'special', target: 1, get: () => state.earlyBird ? 1 : 0, xp: 40 },
    { id: 'night_owl', name: 'Night owl', desc: 'Complete a task after 9pm.', icon: '🌙', cat: 'special', target: 1, get: () => state.nightOwl ? 1 : 0, xp: 40 },
    { id: 'voice_user', name: 'Voice commander', desc: 'Use the voice assistant.', icon: '🎙️', cat: 'special', target: 1, get: () => state.voiceUsed ? 1 : 0, xp: 40 },
    { id: 'uploader', name: 'Tidy desk', desc: 'Upload a file to Attachments.', icon: '📎', cat: 'special', target: 1, get: () => state.fileUploaded ? 1 : 0, xp: 30 },
    { id: 'collector', name: 'Halfway hero', desc: 'Unlock 11 badges.', icon: '🏆', cat: 'special', target: 11, get: () => Object.keys(state.unlocked).length, xp: 150 }
  ];

  /* ----- Level curve ----- */
  const LEVELS = [
    { min: 0, name: 'Beginner' },
    { min: 100, name: 'Learner' },
    { min: 250, name: 'Doer' },
    { min: 500, name: 'Achiever' },
    { min: 900, name: 'Builder' },
    { min: 1400, name: 'Momentum maker' },
    { min: 2000, name: 'Master' },
    { min: 3000, name: 'Legend' }
  ];
  function levelOf(xp) { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l.min) i = k; }); return i; }

  /* ----- Read XP from local activity state ----- */
  // The other pages can add to these counters (see "How to hook it up" below).
  function stats() {
    const done = doneCount();
    return {
      totalTasks: totalCount(),
      done,
      bestStreak: bestStreak(),
      focusSessions: state.focusSessions || 0,
      goalsComplete: goals.filter((g) => g.current >= g.target).length
    };
  }

  /* ----- Award any new badges ----- */
  function checkBadges(silent) {
    let gainedXp = 0;
    const newly = [];
    BADGES.forEach((b) => {
      if (state.unlocked[b.id]) return;
      const target = typeof b.target === 'function' ? b.target() : b.target;
      const got = b.get();
      if (got >= target) {
        state.unlocked[b.id] = true;
        gainedXp += b.xp;
        newly.push(b);
      }
    });
    if (gainedXp) { state.xp = (state.xp || 0) + gainedXp; save(); }
    if (!silent && newly.length) showPopups(newly);
    return newly.length;
  }

  /* ----- Popup when a new badge unlocks ----- */
  function showPopups(list) {
    let i = 0;
    function next() {
      if (i >= list.length) return;
      const b = list[i++];
      $('bd-big').textContent = b.icon;
      $('bd-name').textContent = b.name;
      $('bd-desc').textContent = b.desc + ' (+' + b.xp + ' XP)';
      $('bd-fill').style.width = '100%';
      $('bd-txt').textContent = 'Unlocked!';
      $('bd').showModal();
      $('bd-close').onclick = () => { $('bd').close(); setTimeout(next, 180); };
    }
    next();
  }

  /* ----- Render ----- */
  let filter = 'all';
  function renderLevel() {
    const xp = state.xp || 0;
    const li = levelOf(xp);
    const cur = LEVELS[li], next = LEVELS[li + 1];
    $('lvl-badge').textContent = li + 1;
    $('lvl-name').textContent = cur.name;
    $('lvl-desc').textContent = next
      ? 'Reach ' + next.min + ' XP to become ' + next.name + '.'
      : 'You have reached the top. Incredible.';
    const into = next ? xp - cur.min : 1;
    const span = next ? next.min - cur.min : 1;
    $('xp-fill').style.width = Math.min(100, Math.round((into / span) * 100)) + '%';
    $('xp-txt').textContent = next ? xp + ' / ' + next.min + ' XP' : xp + ' XP';

    const unlocked = BADGES.filter((b) => state.unlocked[b.id]).length;
    $('cnt-unlocked').textContent = unlocked;
    $('cnt-total').textContent = BADGES.length;
    const s = stats();
    $('sub').textContent = unlocked + ' of ' + BADGES.length + ' badges unlocked · ' + s.done + ' tasks done · best streak ' + s.bestStreak;
  }

  function renderGrid() {
    const grid = $('grid'); grid.textContent = '';
    const list = BADGES.filter((b) => {
      const unlocked = !!state.unlocked[b.id];
      if (filter === 'unlocked' && !unlocked) return false;
      if (filter === 'locked' && unlocked) return false;
      if (['tasks', 'streak', 'focus', 'habits', 'special'].includes(filter) && b.cat !== filter) return false;
      return true;
    });
    list.forEach((b) => {
      const unlocked = !!state.unlocked[b.id];
      const target = typeof b.target === 'function' ? b.target() : b.target;
      const got = Math.min(b.get(), target);
      const pct = target ? Math.round((got / target) * 100) : 0;
      const card = el('div', 'badge ' + (unlocked ? 'unlocked' : 'locked'));
      card.tabIndex = 0; card.setAttribute('role', 'button');
      card.setAttribute('aria-label', b.name + ': ' + b.desc + (unlocked ? ' (unlocked)' : ' (locked)'));
      const lock = el('span', 'lock-ico', unlocked ? '✔' : '🔒');
      const ico = el('span', 'bico', b.icon);
      const nm = el('h3', 'bname', b.name);
      const ds_ = el('p', 'bdesc', b.desc);
      const bar = el('div', 'bbar'); const fill = el('i'); fill.style.width = pct + '%'; bar.append(fill);
      const txt = el('div', 'btxt', unlocked ? 'Unlocked · +' + b.xp + ' XP' : got + ' / ' + target);
      card.append(lock, ico, nm, ds_, bar, txt);
      card.onclick = () => openBadge(b, unlocked, target, got);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBadge(b, unlocked, target, got); } };
      grid.append(card);
    });
    if (!list.length) {
      const e = el('div', 'badge locked');
      e.style.gridColumn = '1 / -1';
      e.append(el('span', 'bico', '🔍'), el('h3', 'bname', 'Nothing here'), el('p', 'bdesc', filter === 'unlocked' ? 'Keep going — unlock your first badge soon.' : 'Try another filter.'));
      grid.append(e);
    }
  }

  function openBadge(b, unlocked, target, got) {
    $('bd-big').textContent = b.icon;
    $('bd-name').textContent = b.name + (unlocked ? ' ✔' : '');
    $('bd-desc').textContent = b.desc;
    const pct = target ? Math.min(100, Math.round((got / target) * 100)) : 0;
    $('bd-fill').style.width = pct + '%';
    $('bd-txt').textContent = unlocked ? 'Unlocked · +' + b.xp + ' XP' : got + ' / ' + target + ' (' + pct + '%) · reward ' + b.xp + ' XP';
    $('bd-close').onclick = () => $('bd').close();
    $('bd').showModal();
  }

  function renderAll() { renderLevel(); renderGrid(); }

  /* ----- Public helper so other pages can award XP counters ----- */
  // From voice.js:   window.PriorityAchievements && PriorityAchievements.mark('voiceUsed');
  // From focus timer: PriorityAchievements.addFocusSession();
  window.PriorityAchievements = {
    mark: (key) => { state[key] = true; save(); checkBadges(false); renderAll(); },
    addFocusSession: () => { state.focusSessions = (state.focusSessions || 0) + 1; save(); checkBadges(false); renderAll(); },
    state: () => state,
    reset: () => { state = { unlocked: {}, xp: 0, seen: {} }; save(); renderAll(); }
  };

  /* ----- Wire filters ----- */
  document.querySelector('.chips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    filter = c.dataset.f;
    document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c));
    renderGrid();
  });
  $('bd').addEventListener('click', (e) => { if (e.target === $('bd')) $('bd').close(); });

  /* ----- Time-based flags (early bird, night owl) ----- */
  const nowH = new Date().getHours();
  if (nowH < 12 && doneCount() > 0) state.earlyBird = true;
  if (nowH >= 21 && doneCount() > 0) state.nightOwl = true;
  save();

  checkBadges(true); // silently unlock on first load so popups only appear for new ones
  renderAll();
})();