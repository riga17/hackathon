<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Calendar · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="calendar.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1 id="month-label">Calendar</h1><p id="month-sub"></p></div>
      <div class="nav-btns">
        <button class="ib" id="prev" type="button" aria-label="Previous month">‹</button>
        <button class="btn" id="today" type="button">Today</button>
        <button class="ib" id="next" type="button" aria-label="Next month">›</button>
      </div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
    </header>

    <div class="cal-wrap">
      <section class="cal" aria-label="Month calendar">
        <div class="dow" aria-hidden="true">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <div class="days" id="days"></div>
        <p class="legend">
          <span><i class="dot p-high"></i>High</span>
          <span><i class="dot p-medium"></i>Medium</span>
          <span><i class="dot p-low"></i>Low</span>
          <span class="tip">Drag a task to another day to reschedule it.</span>
        </p>
      </section>

      <aside class="day-panel" aria-live="polite">
        <p class="dp-eyebrow" id="dp-rel"></p>
        <h2 id="dp-date"></h2>
        <ul class="dp-list" id="dp-list"></ul>
        <form class="dp-add" id="dp-form" autocomplete="off">
          <label class="sr-only" for="dp-title">New task for this day</label>
          <input id="dp-title" maxlength="80" placeholder="Add a task for this day…" required>
          <div class="dp-row">
            <label class="sr-only" for="dp-prio">Priority</label>
            <select id="dp-prio">
              <option value="high">🔴 High</option>
              <option value="medium" selected>🟠 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <button class="btn btn-primary" type="submit">Add</button>
          </div>
        </form>
      </aside>
    </div>
  </div>
</div>
<script src="calendar.js"></script>
</body>
</html>