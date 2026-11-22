(function () {
  'use strict';
  const TK = 'priorityBoard.v1', HK = 'priorityBoard.habits.v2', GK = 'priorityBoard.goals.v1', AK = 'priorityAchievements.v1', FK = 'priorityAttachments.v1';
  const P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = ds(new Date());
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  const AVATARS = ['🙂','😎','🦊','🐼','🐯','🦉','🌸','🌙','⭐','🚀','🎨','🎧','🍀','🐉','🧁','💎'];
  const COLORS = [335, 215, 265, 150, 25, 185, 300, 45];

  // profile state, filled from the server
  let profile = {
    email: '',
    name: '',
    bio: '',
    avatar: '🙂',       // emoji
    avatarType: 'emoji', // 'emoji' | 'photo' | 'color'
    photo: '',          // data URL
    colorHue: 335,
    joinedAt: null
  };

  /* ----- Storage reads ----- */
  let tasks = [], habits = [], goals = [], ach = {}, files = [];
  try { const r = JSON.parse(localStorage.getItem(TK)); if (Array.isArray(r)) tasks = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(HK)); if (Array.isArray(r)) habits = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(GK)); if (Array.isArray(r)) goals = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(AK)); if (r) ach = r; } catch (e) {}
  try { const r = JSON.parse(localStorage.getItem(FK)); if (Array.isArray(r)) files = r; } catch (e) {}

  /* ----- Load profile from server ----- */
  function loadProfile() {
    return fetch('profile-data.php')
      .then((r) => r.json())
      .then((u) => {
        if (u.error) throw new Error(u.error);
        profile.email = u.email || '';
        profile.name = u.display_name || '';
        profile.bio = u.bio || '';
        profile.avatar = u.avatar || '🙂';
        profile.photo = u.photo || '';
        profile.joinedAt = u.joined_at ? new Date(u.joined_at).getTime() : Date.now();

        // Decide which avatar type to show
        if (profile.photo) profile.avatarType = 'photo';
        else if (profile.avatar && profile.avatar.startsWith('#')) {
          // format "#335" means color mode
          profile.avatarType = 'color';
          profile.colorHue = parseInt(profile.avatar.slice(1), 10) || 335;
        } else {
          profile.avatarType = 'emoji';
        }
      })
      .catch((err) => {
        console.error('[Profile load]', err);
        P.toast('Could not load profile.');
      });
  }

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

  /* ----- Render avatar ----- */
  function renderAvatar() {
    const wrap = $('avatar-wrap');
    const emojiEl = $('avatar-emoji');
    if (!wrap || !emojiEl) return;

    // Clear any photo/color styling first
    wrap.style.background = '';
    wrap.style.color = '';
    emojiEl.textContent = '';
    emojiEl.style.display = '';

    // Remove any previously-injected <img>
    const oldImg = wrap.querySelector('.avatar-img');
    if (oldImg) oldImg.remove();

    if (profile.avatarType === 'photo' && profile.photo) {
      emojiEl.style.display = 'none';
      const img = document.createElement('img');
      img.className = 'avatar-img';
      img.src = profile.photo;
      img.alt = 'Profile photo';
      img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;display:block';
      wrap.insertBefore(img, wrap.firstChild);
    } else if (profile.avatarType === 'color') {
      const initial = (profile.name || profile.email || '?').trim().charAt(0).toUpperCase() || '?';
      wrap.style.background = 'hsl(' + profile.colorHue + ' 75% 55%)';
      wrap.style.color = '#fff';
      emojiEl.style.fontFamily = 'var(--head)';
      emojiEl.style.fontWeight = '800';
      emojiEl.style.fontSize = '3rem';
      emojiEl.textContent = initial;
    } else {
      emojiEl.style.fontFamily = '';
      emojiEl.style.fontWeight = '';
      emojiEl.style.fontSize = '';
      emojiEl.textContent = profile.avatar || '🙂';
    }
  }

  /* ----- Render hero ----- */
  function renderHero() {
    $('p-name').textContent = profile.name || 'Your name';
    $('p-tag').textContent = profile.bio || (profile.name ? 'Ready to make today count.' : 'Set a display name to personalize your app.');
    $('lvl-num').textContent = levelOf(xp);
    $('xp-total').textContent = xp;
    const li = levelOf(xp);
    const next = LEVELS[li] != null ? LEVELS[li] : LEVELS[LEVELS.length - 1];
    $('xp-hint').textContent = xp < next ? 'Earn ' + (next - xp) + ' more XP to level up.' : 'Top level unlocked.';
    renderAvatar();
  }

  /* ----- Render stats ----- */
  function renderStats() {
    $('s-total').textContent = tasks.length;
    $('s-done').textContent = done;
    $('s-streak').textContent = bestStreak();
    $('s-badges').textContent = unlocked + '/22';
    if (profile.joinedAt) {
      $('joined').textContent = new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    } else {
      $('joined').textContent = '—';
    }
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

  /* =========================================================
     Edit dialog
     ========================================================= */
  const dlg = $('dlg');
  let pickedMode = 'emoji';
  let pickedEmoji = '🙂';
  let pickedColor = 335;
  let pendingPhoto = '';

  function drawAvatarPicker() {
    // Mode tabs
    const tabs = $('av-modes');
    if (tabs) {
      tabs.querySelectorAll('[data-mode]').forEach((b) => {
        b.classList.toggle('on', b.dataset.mode === pickedMode);
      });
    }

    // Emoji grid
    const g = $('avatar-grid');
    if (g) {
      g.textContent = '';
      AVATARS.forEach((a) => {
        const b = el('button', a === pickedEmoji ? 'on' : '', a); b.type = 'button';
        b.setAttribute('aria-label', 'Choose avatar ' + a);
        b.onclick = () => { pickedEmoji = a; pickedMode = 'emoji'; drawAvatarPicker(); };
        g.append(b);
      });
      g.style.display = pickedMode === 'emoji' ? '' : 'none';
    }

    // Color grid
    const cg = $('color-grid');
    if (cg) {
      cg.textContent = '';
      COLORS.forEach((h) => {
        const b = el('button', h === pickedColor ? 'on' : ''); b.type = 'button';
        b.style.background = 'hsl(' + h + ' 75% 55%)';
        b.setAttribute('aria-label', 'Color ' + h);
        b.onclick = () => { pickedColor = h; pickedMode = 'color'; drawAvatarPicker(); };
        cg.append(b);
      });
      cg.style.display = pickedMode === 'color' ? '' : 'none';
    }

    // Photo zone
    const pz = $('photo-zone');
    if (pz) {
      pz.style.display = pickedMode === 'photo' ? '' : 'none';
      const preview = $('photo-preview');
      if (preview) {
        if (pendingPhoto || profile.photo) {
          preview.src = pendingPhoto || profile.photo;
          preview.style.display = 'block';
        } else {
          preview.style.display = 'none';
        }
      }
    }
  }

  function openEdit() {
    pickedMode = profile.avatarType;
    pickedEmoji = (profile.avatarType === 'emoji' ? profile.avatar : '🙂');
    pickedColor = profile.colorHue || 335;
    pendingPhoto = '';
    $('f-name').value = profile.name || '';
    $('f-bio').value = profile.bio || '';
    drawAvatarPicker();
    dlg.showModal();
    $('f-name').focus();
  }

  // Wire mode tabs (delegated)
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-mode]');
    if (t) {
      pickedMode = t.dataset.mode;
      drawAvatarPicker();
    }
  });

  $('edit-prof').onclick = openEdit;
  $('edit-av').onclick = openEdit;

  // Photo picker
  const photoInput = $('f-photo');
  if (photoInput) {
    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0]; if (!file) return;
      if (file.size > 4 * 1024 * 1024) { P.toast('Photo is too large (max 4 MB).'); photoInput.value = ''; return; }
      const reader = new FileReader();
      reader.onload = () => {
        pendingPhoto = reader.result;
        pickedMode = 'photo';
        drawAvatarPicker();
      };
      reader.readAsDataURL(file);
    });
  }

  // Save dialog
  $('form').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const newName = $('f-name').value.trim().slice(0, 100);
    const newBio = $('f-bio').value.trim().slice(0, 160);

    // Figure out what goes in `avatar`
    let avatarValue = '🙂';
    if (pickedMode === 'emoji') avatarValue = pickedEmoji;
    else if (pickedMode === 'color') avatarValue = '#' + pickedColor;
    else if (pickedMode === 'photo') avatarValue = profile.avatar || '🙂';

    // Upload photo first (if any), then update profile
    try {
      if (pickedMode === 'photo' && pendingPhoto) {
        const r = await fetch('profile-upload.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: pendingPhoto })
        });
        const j = await r.json();
        if (j.error) { P.toast(j.error); return; }
        profile.photo = j.photo;
      } else if (pickedMode !== 'photo') {
        // clear photo when switching away
        await fetch('profile-upload.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clear: true })
        });
        profile.photo = '';
      }

      const res = await fetch('profile-update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: newName, bio: newBio, avatar: avatarValue })
      });
      const uj = await res.json();
      if (uj.error) { P.toast(uj.error); return; }

      // reflect locally
      profile.name = newName;
      profile.bio = newBio;
      profile.avatar = avatarValue;
      profile.avatarType = pickedMode;
      if (pickedMode === 'color') profile.colorHue = pickedColor;

      dlg.close();
      renderAll();
      P.toast('Profile updated.');
    } catch (err) {
      console.error(err);
      P.toast('Could not save. Try again.');
    }
  });

  $('f-cancel').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* =========================================================
     Backup (kept local — exports your local data)
     ========================================================= */
  $('backup').onclick = () => {
    const data = {
      profile: { email: profile.email, name: profile.name, bio: profile.bio, avatar: profile.avatar, avatarType: profile.avatarType, joinedAt: profile.joinedAt },
      tasks, habits, goals,
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

  /* =========================================================
     Reset
     ========================================================= */
  const cf = $('confirm');
  $('reset-all').onclick = () => cf.showModal();
  $('c-cancel').onclick = () => cf.close();
  cf.addEventListener('click', (e) => { if (e.target === cf) cf.close(); });
  $('c-confirm').onclick = () => {
    [TK, HK, GK, AK, FK, 'priorityBoard.habits', 'priorityReminders.v1', 'priority.settings'].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    P.toast('Local data cleared. Reloading…');
    setTimeout(() => location.reload(), 900);
  };

  /* =========================================================
     Boot
     ========================================================= */
  loadProfile().then(() => renderAll());
})();