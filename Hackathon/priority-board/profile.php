<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Profile · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="profile.css">
  <script src="app.js"></script>
  <style>
    /* Extra styles for the new avatar picker */
    .av-modes{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
    .av-modes button{border:1px solid var(--border);background:var(--bg);border-radius:99px;padding:7px 14px;cursor:pointer;font-weight:700;font-size:.85rem;color:var(--muted)}
    .av-modes button.on{background:var(--accent);border-color:var(--accent);color:#fff}
    .color-grid{display:flex;flex-wrap:wrap;gap:8px}
    .color-grid button{width:40px;height:40px;border-radius:50%;border:3px solid var(--surface);cursor:pointer;box-shadow:0 0 0 2px var(--border);padding:0}
    .color-grid button.on{box-shadow:0 0 0 3px var(--text)}
    .photo-zone{display:grid;gap:10px;justify-items:center;padding:10px 0}
    .photo-zone img{max-width:140px;max-height:140px;border-radius:50%;object-fit:cover;box-shadow:0 4px 14px hsl(var(--h) 40% 30% / .15)}
    .photo-zone label.btn{cursor:pointer;display:inline-block}
    .photo-zone input[type=file]{display:none}
    .avatar-img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
  </style>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1>My Profile</h1><p id="sub">Your personal corner of Priority.</p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
      <a class="btn btn-primary" href="settings.php">Settings</a>
    </header>

    <!-- Profile hero -->
    <section class="prof-hero">
      <div class="prof-avatar" id="avatar-wrap">
        <span id="avatar-emoji">🙂</span>
        <button class="edit-av" id="edit-av" type="button" aria-label="Change avatar">✎</button>
      </div>
      <div class="prof-info">
        <h2 id="p-name">Your name</h2>
        <p id="p-tag" class="tag-line">Set a display name to personalize your app.</p>
        <div class="quick-edit">
          <button class="btn" id="edit-prof" type="button">Edit profile</button>
          <button class="btn" id="export" type="button">Export data</button>
        </div>
      </div>
      <div class="prof-level">
        <div class="lvl-ring" id="lvl-ring"><b id="lvl-num">1</b><span>level</span></div>
        <div>
          <p class="xp-lbl">XP earned</p>
          <p id="xp-total" class="xp-num">0</p>
          <p id="xp-hint" class="xp-hint">Unlock achievements to grow.</p>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats" aria-label="Your stats">
      <article class="stat"><i class="ic">📋</i><div><b id="s-total">0</b><span>Total tasks</span></div></article>
      <article class="stat"><i class="ic">✅</i><div><b id="s-done">0</b><span>Tasks done</span></div></article>
      <article class="stat"><i class="ic">🔥</i><div><b id="s-streak">0</b><span>Best streak</span></div></article>
      <article class="stat"><i class="ic">🏆</i><div><b id="s-badges">0</b><span>Badges</span></div></article>
    </section>

    <div class="grid-p">
      <!-- About me -->
      <section class="card span-2">
        <header class="card-head"><h2>About me</h2></header>
        <p id="about-text" class="about-text">No bio yet. Say a little about yourself.</p>
        <div class="chips-row">
          <span class="chip-lbl">Member since</span>
          <span class="chip-val" id="joined">—</span>
        </div>
        <div class="chips-row">
          <span class="chip-lbl">Timezone</span>
          <span class="chip-val" id="tz">—</span>
        </div>
      </section>

      <!-- Activity snapshot -->
      <section class="card">
        <header class="card-head"><h2>This week</h2></header>
        <ul class="activity-list" id="activity"></ul>
      </section>

      <!-- Data & privacy -->
      <section class="card span-2">
        <header class="card-head"><h2>Data &amp; privacy</h2></header>
        <p class="muted">Everything is saved on this device only. Nothing leaves your browser.</p>
        <div class="data-grid">
          <div><b id="data-tasks">0</b><span>tasks stored</span></div>
          <div><b id="data-habits">0</b><span>habits tracked</span></div>
          <div><b id="data-goals">0</b><span>goals</span></div>
          <div><b id="data-files">0</b><span>files attached</span></div>
        </div>
        <div class="data-btns">
          <button class="btn" id="backup" type="button">Download backup</button>
          <button class="btn btn-danger" id="reset-all" type="button">Reset all data</button>
        </div>
      </section>

      <!-- Quick shortcuts -->
      <section class="card">
        <header class="card-head"><h2>Shortcuts</h2></header>
        <ul class="shortcuts">
          <li><a href="tasks.php"><span>✅</span>My Tasks</a></li>
          <li><a href="calendar.php"><span>📅</span>Calendar</a></li>
          <li><a href="habits.php"><span>🌱</span>Habits &amp; Goals</a></li>
          <li><a href="achievements.php"><span>🏆</span>Achievements</a></li>
          <li><a href="settings.php"><span>⚙️</span>Settings</a></li>
        </ul>
      </section>
    </div>
  </div>
</div>

<!-- Edit dialog -->
<dialog id="dlg">
  <form id="form" method="dialog">
    <h2>Edit profile</h2>

    <label>Display name<input id="f-name" maxlength="100" required placeholder="Your name"></label>

    <div style="display:grid;gap:8px">
      <span style="font-weight:700;font-size:.9rem">Avatar</span>
      <div class="av-modes" id="av-modes">
        <button type="button" data-mode="emoji">Emoji</button>
        <button type="button" data-mode="photo">Photo</button>
        <button type="button" data-mode="color">Color</button>
      </div>

      <div class="avatar-grid" id="avatar-grid"></div>

      <div class="color-grid" id="color-grid" style="display:none"></div>

      <div class="photo-zone" id="photo-zone" style="display:none">
        <img id="photo-preview" alt="Profile preview" style="display:none">
        <label class="btn btn-line">
          Choose photo
          <input id="f-photo" type="file" accept="image/*">
        </label>
        <small style="color:var(--muted);font-size:.8rem">Max 4 MB. Saved to your account.</small>
      </div>
    </div>

    <label>Bio (optional)<textarea id="f-bio" maxlength="160" rows="3" placeholder="A sentence about you…"></textarea></label>

    <div class="dfoot">
      <button class="btn" id="f-cancel" type="button">Cancel</button>
      <button class="btn btn-primary" type="submit">Save</button>
    </div>
  </form>
</dialog>

<!-- Reset confirm -->
<dialog id="confirm">
  <form method="dialog">
    <h2>Reset everything?</h2>
    <p class="muted">This clears tasks, habits, goals, achievements, files, and settings from this device. It does <b>not</b> delete your account.</p>
    <div class="dfoot">
      <button class="btn" id="c-cancel" type="button">Cancel</button>
      <button class="btn btn-danger" id="c-confirm" type="button">Reset all</button>
    </div>
  </form>
</dialog>

<script src="profile.js"></script>
</body>
</html>