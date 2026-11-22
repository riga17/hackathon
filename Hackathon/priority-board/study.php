<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Study Center · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="study.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1>Study Center</h1><p id="sub">Plan, focus and remember more.</p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
    </header>

    <section class="strip" aria-label="Study summary">
      <div><div class="big" id="s-today">0 min</div><div class="lbl">studied today</div></div>
      <div><div class="big" id="s-week">0 min</div><div class="lbl">last 7 days</div></div>
      <div><div class="big" id="s-streak">0</div><div class="lbl">day streak</div></div>
      <div><div class="big" id="s-cards">0</div><div class="lbl">cards mastered</div></div>
    </section>

    <div class="st-grid">
      <!-- Timer -->
      <section class="card timer-card">
        <header class="card-head"><h2>Study timer</h2></header>
        <div class="t-row">
          <label class="sr-only" for="t-sub">Subject</label>
          <select id="t-sub"></select>
          <label class="sr-only" for="t-len">Length</label>
          <select id="t-len">
            <option value="15">15 min</option>
            <option value="25" selected>25 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </div>
        <div class="timer" id="t-disp" role="timer">25:00</div>
        <div class="timer-btns">
          <button class="btn" id="t-go" type="button">Start</button>
          <button class="btn btn-line" id="t-fin" type="button">Finish &amp; log</button>
          <button class="btn btn-line" id="t-reset" type="button">Reset</button>
        </div>
      </section>

      <!-- Week -->
      <section class="card">
        <header class="card-head"><h2>Last 7 days</h2><span class="pill" id="w-total">0 min</span></header>
        <div class="bars" id="bars"></div>
      </section>

      <!-- Subjects -->
      <section class="card">
        <header class="card-head"><h2>Subjects</h2><span class="pill" id="sub-count">0</span></header>
        <ul class="list" id="subjects"></ul>
        <form class="mini-form" id="sub-form" autocomplete="off">
          <div class="mf-row">
            <label class="sr-only" for="sub-name">Subject name</label>
            <input id="sub-name" maxlength="30" placeholder="New subject…" required>
            <label class="sr-only" for="sub-goal">Weekly goal in hours</label>
            <input id="sub-goal" type="number" min="1" max="60" value="5" title="Weekly goal (hours)">
          </div>
          <div class="mf-row"><div class="sws" id="sub-hues"></div><button class="btn btn-primary" type="submit">Add</button></div>
        </form>
      </section>

      <!-- Exams -->
      <section class="card">
        <header class="card-head"><h2>Exams &amp; deadlines</h2></header>
        <ul class="list" id="exams"></ul>
        <form class="mini-form" id="ex-form" autocomplete="off">
          <label class="sr-only" for="ex-name">Exam name</label>
          <input id="ex-name" maxlength="50" placeholder="Exam or test name…" required>
          <div class="mf-row">
            <label class="sr-only" for="ex-date">Date</label>
            <input id="ex-date" type="date" required>
            <button class="btn btn-primary" type="submit">Add</button>
          </div>
        </form>
      </section>

      <!-- Flashcards -->
      <section class="card span-2 fc">
        <header class="card-head">
          <h2>Flashcards</h2>
          <div class="fc-tools">
            <label class="sr-only" for="fc-deck">Deck</label>
            <select id="fc-deck"></select>
            <button class="btn" id="fc-shuffle" type="button">Shuffle</button>
          </div>
        </header>
        <div class="fc-stage">
          <button class="fc-card" id="fc-card" type="button" aria-live="polite">
            <small id="fc-side">Question</small>
            <span id="fc-text">No cards yet. Add one below.</span>
            <em id="fc-hint">Click to flip</em>
          </button>
          <p class="fc-count" id="fc-count"></p>
          <div class="fc-actions">
            <button class="btn" id="fc-learn" type="button">Still learning</button>
            <button class="btn btn-primary" id="fc-know" type="button">Got it</button>
            <button class="btn btn-line-d" id="fc-del" type="button" aria-label="Delete this card">Delete</button>
          </div>
        </div>
        <form class="fc-form" id="fc-form" autocomplete="off">
          <label class="sr-only" for="fc-sub">Subject</label>
          <select id="fc-sub"></select>
          <label class="sr-only" for="fc-q">Question</label>
          <input id="fc-q" maxlength="120" placeholder="Question (front)" required>
          <label class="sr-only" for="fc-a">Answer</label>
          <input id="fc-a" maxlength="200" placeholder="Answer (back)" required>
          <button class="btn btn-primary" type="submit">Add card</button>
        </form>
      </section>
    </div>
  </div>
</div>
<script src="study.js"></script>
</body>
</html>