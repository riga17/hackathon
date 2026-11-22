<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dashboard · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu" data-icon="grid"></button>
      <form class="quick" id="quick-form" autocomplete="off">
        <label class="sr-only" for="quick-add">Quick add a task</label>
        <input id="quick-add" type="text" maxlength="80" placeholder="Add a task and press Enter…" required>
      </form>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode"></button>
      <a class="ib avatar" href="profile.php" aria-label="My profile" data-icon="user"></a>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-text">
        <p class="hero-date" id="hero-date"></p>
        <h1 id="hero-title">Priority</h1>
        <p class="hero-sub" id="hero-sub"></p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tasks.php">Open my tasks</a>
          <a class="btn" href="voice.php">Talk to the assistant</a>
        </div>
      </div>
      <div class="ring" id="ring" role="img" aria-label="Overall progress">
        <div class="ring-in"><b id="ring-pct">0%</b><span>done</span></div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats" aria-label="Summary">
      <article class="stat"><i class="ic" data-icon="note"></i><div><b id="st-total">0</b><span>Total tasks</span></div></article>
      <article class="stat"><i class="ic" data-icon="checkCircle"></i><div><b id="st-done">0</b><span>Completed</span></div></article>
      <article class="stat"><i class="ic" data-icon="fire"></i><div><b id="st-now">0/5</b><span>In focus now</span></div></article>
      <article class="stat"><i class="ic" data-icon="alert"></i><div><b id="st-over">0</b><span>Overdue</span></div></article>
    </section>

    <div class="grid">
      <!-- Today's focus -->
      <section class="card span-2">
        <header class="card-head"><h2>Today's focus</h2><a href="tasks.php">See all</a></header>
        <ul class="list focus-list" id="focus-list"></ul>
      </section>

      <!-- Focus timer -->
      <section class="card timer-card">
        <header class="card-head"><h2>Focus timer</h2></header>
        <div class="timer" id="timer-display">25:00</div>
        <div class="timer-btns">
          <button class="btn" id="timer-toggle" type="button">Start</button>
          <button class="btn btn-line" id="timer-reset" type="button">Reset</button>
        </div>
      </section>

      <!-- Mini calendar -->
      <section class="card mini-cal">
        <header class="card-head">
          <h2 id="mc-label">Calendar</h2>
          <div class="mc-nav">
            <button class="mc-btn" id="mc-prev" type="button" aria-label="Previous month" data-icon="arrowLeft"></button>
            <button class="mc-btn" id="mc-next" type="button" aria-label="Next month" data-icon="arrowRight"></button>
          </div>
        </header>
        <div class="mc-dow" aria-hidden="true"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
        <div class="mc-days" id="mc-days"></div>
        <div class="mc-actions">
          <a class="mc-open" href="calendar.php">Open full calendar</a>
          <a class="mc-voice" href="voice.php">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>
            Talk to the assistant
          </a>
        </div>
      </section>

      <!-- Coming up -->
      <section class="card">
        <header class="card-head">
          <h2>Coming up</h2>
          <a href="voice.php">Ask the assistant</a>
        </header>
        <ul class="list upcoming" id="upcoming"></ul>
      </section>

      <!-- Habits -->
      <section class="card">
        <header class="card-head"><h2>Today's habits</h2><span class="pill" id="habit-count">0/4</span></header>
        <ul class="list habits" id="habits"></ul>
      </section>
    </div>

    <p class="quote" id="quote"></p>
  </div>
</div>
<script src="home.js"></script>
</body>
</html>