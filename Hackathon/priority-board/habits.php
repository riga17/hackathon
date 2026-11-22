<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Habits & Goals · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="habits.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1>Habits &amp; Goals</h1><p id="sub"></p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
      <button class="btn btn-primary" id="new-habit" type="button">+ New habit</button>
    </header>

    <!-- Stats row -->
    <section class="stats" aria-label="Summary">
      <article class="stat"><i class="ic">🔥</i><div><b id="st-streak">0</b><span>Best streak</span></div></article>
      <article class="stat"><i class="ic">✅</i><div><b id="st-today">0/0</b><span>Today done</span></div></article>
      <article class="stat"><i class="ic">📅</i><div><b id="st-week">0%</b><span>This week</span></div></article>
      <article class="stat"><i class="ic">🎯</i><div><b id="st-goals">0</b><span>Active goals</span></div></article>
    </section>

    <div class="grid-hg">
      <!-- Habits column -->
      <section class="card">
        <header class="card-head">
          <h2>Today's habits</h2>
          <span class="pill" id="habit-count">0/0</span>
        </header>
        <ul class="list h-list" id="habit-list"></ul>
      </section>

      <!-- Goals column -->
      <section class="card">
        <header class="card-head">
          <h2>Goals</h2>
          <button class="mini-b" id="new-goal" type="button" aria-label="New goal">+ Add</button>
        </header>
        <ul class="list g-list" id="goal-list"></ul>
      </section>

      <!-- Week heatmap -->
      <section class="card span-2">
        <header class="card-head"><h2>This week</h2><span class="pill" id="week-pct">0%</span></header>
        <div class="heat" id="heat"></div>
      </section>
    </div>
  </div>
</div>

<!-- Habit editor -->
<dialog id="habit-dlg">
  <form id="habit-form" method="dialog">
    <h2 id="h-title">New habit</h2>
    <label>Habit name<input id="h-name" maxlength="40" required placeholder="e.g. Drink water"></label>
    <label>Icon
      <div class="ico-row" id="ico-row"></div>
    </label>
    <div class="dfoot">
      <button class="btn del" id="h-del" type="button">Delete</button>
      <button class="btn" id="h-cancel" type="button">Cancel</button>
      <button class="btn btn-primary" type="submit">Save</button>
    </div>
  </form>
</dialog>

<!-- Goal editor -->
<dialog id="goal-dlg">
  <form id="goal-form" method="dialog">
    <h2 id="g-title">New goal</h2>
    <label>Goal title<input id="g-name" maxlength="60" required placeholder="e.g. Read 12 books"></label>
    <div class="two">
      <label>Target<input id="g-target" type="number" min="1" value="10" required></label>
      <label>Unit<input id="g-unit" maxlength="12" placeholder="books"></label>
    </div>
    <label>Progress
      <div class="goal-prog-row">
        <input id="g-current" type="number" min="0" value="0">
        <input id="g-range" type="range" min="0" max="100" value="0">
      </div>
    </label>
    <div class="dfoot">
      <button class="btn del" id="g-del" type="button">Delete</button>
      <button class="btn" id="g-cancel" type="button">Cancel</button>
      <button class="btn btn-primary" type="submit">Save</button>
    </div>
  </form>
</dialog>

<script src="habits.js"></script>
</body>
</html>