(function () {
  'use strict';
  const PK = 'priorityProfile.v1', TK = 'priorityBoard.v1', HK = 'priorityBoard.habits.v2', GK = 'priorityBoard.goals.v1', AK = 'priorityAchievements.v1', FK = 'priorityAttachments.v1';
  const P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  const AVATARS = ['🙂','😎','🦊','🐼','🐯','🦉','🌸','🌙','⭐','🚀','🎨','🎧','🍀','🐉','🧁','💎'];
  let profile = { name: '', avatar: '🙂', bio: '', joinedAt: Date.now() };
  try { const r = JSON.parse(localStorage.getItem(PK)); if (r) Object.assign(profile, r); } catch (e) {}
  if (!profile.joinedAt) profile.joinedAt = Date.now();
  const saveProfile = () => { try { localStorage.setItem(PK, JSON.stringify(profile)); } catch (e) {} };

  /* ----- Storage reads ----- */
  let tasks = [], habits = [], goals = [], ach = {}, files = [];
  try { const r = JSON.parse(localStorage.getItem(TK)); if (Array.isArray(r)) tasks = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(HK)); if (Array.isArray(r)) habits = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(GK)); if (Array.isArray(r)) goals = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(AK)); if (r) ach = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(FK)); if (Array.isArray(r)) files = r; } catch (e) {}

  /* ----- Derived stats ----- */
  const done = tasks.filter((t) => t.list === 'done').length;
  const unlocked = (ach.unlocked && Object.keys(ach.unlocked).length) || 0;
  const xp = ach.xp || 0;

  function bestStreak() {
    let best = 0;
    habits.forEach((h) => {
      let s = 0; const d = new Date();
      for (let i = 0; i < 400; i++) {
        const k = ds(d);
        const on = h.days && h.days[k] && h.days[k].includes('done');
        if (on) s++; else if (i > 0) break;
        d.setDate(d.getDate() - 1);
      }
      if (s > best) best = s;
    });
    return best;
  }

  const LEVELS = [0, 100, 250, 500, 900, 1400, 2000, 3000];
  function levelOf(x) { let i = 0; LEVELS.forEach((min, k) => { if (x >= min) i = k; }); return i + 1; }

  /* ----- Render hero ----- */
  function renderHero() {
    $('avatar-emoji').textContent = profile.avatar || '🙂';
    $('p-name').textContent = profile.name || 'Your name';
    $('p-tag').textContent = profile.bio || (profile.name ? 'Ready to make today count.' : 'Set a display name to personalize your app.');
    $('lvl-num').textContent = levelOf(xp);
    $('xp-total').textContent = xp;
    const next = LEVELS[levelOf(xp) - 1 + 1] || LEVELS[LEVELS.length - 1];
    $('xp-hint').textContent = xp < next ? 'Earn ' + (next - xp) + ' more XP to level up.' : 'Top level unlocked.';
  }

  /* ----- Render stats ----- */
  function renderStats() {
    $('s-total').textContent = tasks.length;
    $('s-done').textContent = done;
    $('s-streak').textContent = bestStreak();
    $('s-badges').textContent = unlocked + '/' + 22;
    $('joined').textContent = new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    try { $('tz').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { $('tz').textContent = '—'; }
  }

  /* ----- Activity ----- */
  function renderActivity() {
    const ul = $('activity'); ul.textContent = '';
    const doneToday = tasks.filter((t) => t.list === 'done' && t.due === today).length;
    const habitsToday = habits.filter((h) => h.days && h.days[today] && h.days[today].includes('done')).length;
    const goalsNear = goals.filter((g) => g.current / g.target >= 0.75).length;
    const rows = [
      ['✅', 'Tasks completed today', doneToday],
      ['🌱', 'Habits done today', habitsToday],
      ['🎯', 'Goals over 75%', goalsNear],
      ['🏆', 'Badges unlocked', unlocked]
    ];
    rows.forEach(([i, l, v]) => {
      const li = el('li');
      li.append(el('i', null, i), el('span', null, l), el('b', null, String(v)));
      ul.append(li);
    });
  }

  /* ----- Data card ----- */
  function renderData() {
    $('data-tasks').textContent = tasks.length;
    $('data-habits').textContent = habits.length;
    $('data-goals').textContent = goals.length;
    $('data-files').textContent = files.length;
    $('sub').textContent = profile.name
      ? 'Welcome back, ' + profile.name + '. ' + (tasks.length ? tasks.length + ' tasks tracked.' : 'Add your first task to get going.')
      : 'Your personal corner of Priority.';
  }

  function renderAll() { renderHero(); renderStats(); renderActivity(); renderData(); }

  /* ----- Edit dialog ----- */
  const dlg = $('dlg');
  let pickedAvatar = profile.avatar || '🙂';
  function drawAvatars() {
    const g = $('avatar-grid'); g.textContent = '';
    AVATARS.forEach((a) => {
      const b = el('button', a === pickedAvatar ? 'on' : '', a); b.type = 'button';
      b.setAttribute('aria-label', 'Choose avatar ' + a);
      b.onclick = () => { pickedAvatar = a; drawAvatars(); };
      g.append(b);
    });
  }
  function openEdit() {
    pickedAvatar = profile.avatar || '🙂';
    $('f-name').value = profile.name || '';
    $('f-bio').value = profile.bio || '';
    drawAvatars(); dlg.showModal(); $('f-name').focus();
  }
  $('edit-prof').onclick = openEdit;
  $('edit-av').onclick = openEdit;
  $('form').addEventListener('submit', () => {
    profile.name = $('f-name').value.trim().slice(0, 30);
    profile.bio = $('f-bio').value.trim().slice(0, 160);
    profile.avatar = pickedAvatar;
    saveProfile(); renderAll(); P.toast('Profile updated.');
  });
  $('f-cancel').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* ----- Backup ----- */
  $('backup').onclick = () => {
    const data = {
      profile,
      tasks,
      habits,
      goals,
      achievements: ach,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type, addedAt: f.addedAt, data: f.data })),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'priority-backup-' + today + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    P.toast('Backup downloaded.');
  };

  /* ----- Reset ----- */
  const cf = $('confirm');
  $('reset-all').onclick = () => cf.showModal();
  $('c-cancel').onclick = () => cf.close();
  cf.addEventListener('click', (e) => { if (e.target === cf) cf.close(); });
  $('c-confirm').onclick = () => {
    [TK, HK, GK, AK, FK, 'priorityBoard.habits', 'priorityReminders.v1', 'priority.settings', PK].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    P.toast('All data cleared. Reloading…');
    setTimeout(() => location.reload(), 900);
  };

  renderAll();
})();