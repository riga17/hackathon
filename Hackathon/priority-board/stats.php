<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Statistics · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="stats.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1>Statistics</h1><p id="sub"></p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
    </header>

    <section class="stats" aria-label="Summary">
      <article class="stat"><i class="ic">📋</i><div><b id="st-total">0</b><span>Total tasks</span></div></article>
      <article class="stat"><i class="ic">✅</i><div><b id="st-done">0</b><span>Completed</span></div></article>
      <article class="stat"><i class="ic">⏰</i><div><b id="st-over">0</b><span>Overdue</span></div></article>
      <article class="stat"><i class="ic">📈</i><div><b id="st-rate">0%</b><span>Completion rate</span></div></article>
    </section>

    <div class="grid-s">
      <!-- Priority donut -->
      <section class="card">
        <header class="card-head"><h2>By priority</h2></header>
        <div class="donut-wrap">
          <div class="donut" id="donut-prio" role="img" aria-label="Tasks by priority"></div>
          <ul class="legend-list" id="leg-prio"></ul>
        </div>
      </section>

      <!-- List distribution -->
      <section class="card">
        <header class="card-head"><h2>By list</h2></header>
        <div class="donut-wrap">
          <div class="donut" id="donut-list" role="img" aria-label="Tasks by list"></div>
          <ul class="legend-list" id="leg-list"></ul>
        </div>
      </section>

      <!-- 14-day trend -->
      <section class="card span-2">
        <header class="card-head"><h2>Completed · last 14 days</h2><span class="pill" id="trend-total">0</span></header>
        <div class="trend" id="trend"></div>
      </section>

      <!-- Categories -->
      <section class="card">
        <header class="card-head"><h2>By category</h2></header>
        <ul class="cat-list" id="cat-list"></ul>
      </section>

      <!-- Busiest days -->
      <section class="card">
        <header class="card-head"><h2>Busiest due days</h2></header>
        <ul class="cat-list" id="day-list"></ul>
      </section>
    </div>
  </div>
</div>
<script src="stats.js"></script>
</body>
</html>