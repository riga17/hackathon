<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Focus Mode · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="focus.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu" data-icon="grid"></button>
      <div class="ttl"><h1>Focus Mode</h1><p id="sub">One task. One timer. Nothing else.</p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode"></button>
      <button class="ib" id="zen-btn" type="button" aria-label="Enter Zen Mode" title="Zen mode"></button>
    </header>

    <!-- Hero focus card -->
    <section class="focus-hero">
      <!-- Bubbles inside the focus card -->
      <div class="hero-bubbles" id="hero-bubbles"></div>

      <div class="focus-top">
        <span class="focus-label" id="focus-label">Ready to focus</span>
        <span class="focus-streak" id="focus-streak"></span>
      </div>

      <div class="focus-task" id="focus-task">
        <p class="ft-eyebrow">Working on</p>
        <h2 class="ft-title" id="ft-title">No task selected</h2>
        <p class="ft-sub" id="ft-sub">Pick something from your Now list to begin.</p>
        <button class="btn" id="pick-btn" type="button">Choose a task</button>
      </div>

      <!-- Timer with bubbles behind it -->
      <div class="focus-timer-wrap">
        <div class="focus-timer" id="focus-timer">25:00</div>
      </div>

      <div class="focus-actions">
        <button class="btn btn-primary" id="start-btn" type="button">Start focus</button>
        <button class="btn" id="pause-btn" type="button" hidden>Pause</button>
        <button class="btn" id="reset-btn" type="button">Reset</button>
      </div>

      <div class="focus-presets" role="group" aria-label="Timer length">
        <button class="seg on" data-min="25" data-type="focus" type="button">25 min</button>
        <button class="seg" data-min="50" data-type="focus" type="button">50 min</button>
        <button class="seg" data-min="15" data-type="focus" type="button">15 min</button>
        <button class="seg" data-min="5" data-type="break" type="button">Short break</button>
        <button class="seg" data-min="15" data-type="break" type="button">Long break</button>
        <button class="seg" data-min="custom" data-type="custom" type="button">Custom</button>
      </div>
    </section>

    <div class="focus-grid">
      <!-- Session info -->
      <section class="card">
        <header class="card-head"><h2>This session</h2></header>
        <ul class="focus-stats">
          <li><span>Type</span><b id="stat-type">Focus</b></li>
          <li><span>Length</span><b id="stat-length">25 min</b></li>
          <li><span>Task</span><b id="stat-task">None</b></li>
          <li><span>Sessions today</span><b id="stat-count">0</b></li>
          <li><span>Focus time today</span><b id="stat-total">0 min</b></li>
        </ul>
      </section>

      <!-- Session history -->
      <section class="card">
        <header class="card-head"><h2>Today's sessions</h2><button class="mini-b" id="clear-history" type="button">Clear</button></header>
        <ul class="focus-history" id="focus-history"></ul>
      </section>

      <!-- Tips -->
      <section class="card span-2">
        <header class="card-head"><h2>Focus tips</h2></header>
        <ul class="focus-tips">
          <li>Pick one thing from Now. Not three.</li>
          <li>Silence notifications. Everything can wait 25 minutes.</li>
          <li>Take the break when the timer ends. It makes the next session easier.</li>
          <li>After four focus sessions, take a longer break — 15 minutes or a walk.</li>
        </ul>
      </section>
    </div>
  </div>
</div>

<!-- Task picker dialog -->
<dialog id="pick-dialog">
  <form method="dialog">
    <h2>Pick a task to focus on</h2>
    <p class="muted">These are the tasks currently in your Now list.</p>
    <ul class="pick-list" id="pick-list"></ul>
    <div class="dfoot">
      <button class="btn" id="pick-cancel" type="button">Cancel</button>
    </div>
  </form>
</dialog>

<!-- Custom length dialog -->
<dialog id="custom-dialog">
  <form method="dialog" id="custom-form">
    <h2>Custom timer</h2>
    <p class="muted">Set any length from 1 to 120 minutes.</p>
    <div class="custom-row">
      <input type="range" id="custom-range" min="1" max="120" step="1" value="25">
      <output id="custom-out">25 min</output>
    </div>
    <div class="custom-quick">
      <button type="button" data-m="45">45</button>
      <button type="button" data-m="60">60</button>
      <button type="button" data-m="90">90</button>
    </div>
    <div class="dfoot">
      <button class="btn" id="custom-cancel" type="button">Cancel</button>
      <button class="btn btn-primary" id="custom-start" type="button">Start</button>
    </div>
  </form>
</dialog>

<!-- Zen mode overlay -->
<div class="zen" id="zen" hidden>
  <!-- Bubbles fill the whole screen in Zen mode -->
  <div class="zen-bubbles" id="zen-bubbles"></div>

  <button class="zen-exit" id="zen-exit" type="button" aria-label="Exit Zen Mode" data-icon="x"></button>
  <div class="zen-inner">
    <p class="zen-label" id="zen-label">Focusing on</p>
    <h1 class="zen-task" id="zen-task">Take a breath and focus.</h1>
    <div class="zen-timer" id="zen-timer">25:00</div>
    <div class="zen-actions">
      <button class="zen-btn" id="zen-toggle" type="button">Start</button>
      <button class="zen-btn zen-btn-ghost" id="zen-reset" type="button">Reset</button>
    </div>
  </div>
</div>

<script src="focus.js"></script>
</body>
</html>