<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notes · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="notes.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1>Notes</h1><p id="sub"></p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
      <button class="btn btn-primary" id="new" type="button">+ New note</button>
    </header>

    <div class="nt-wrap" id="wrap">
      <!-- List -->
      <section class="nt-list" aria-label="Your notes">
        <label class="sr-only" for="q">Search notes</label>
        <input id="q" type="search" placeholder="Search notes…  (press /)">
        <div class="chips" role="group" aria-label="Filter notes">
          <button class="chip on" data-f="all" type="button">All</button>
          <button class="chip" data-f="pinned" type="button">📌 Pinned</button>
        </div>
        <ul class="nl" id="nl"></ul>
      </section>

      <!-- Editor -->
      <section class="nt-edit" id="edit" aria-label="Note editor">
        <div class="e-bar">
          <button class="ib back-btn" id="back" type="button" aria-label="Back to notes">‹</button>
          <div class="sws" id="sws" role="group" aria-label="Note color"></div>
          <span class="saved" id="saved" aria-live="polite"></span>
          <button class="ib" id="pin" type="button" aria-label="Pin note" title="Pin note">📌</button>
          <button class="ib" id="dl" type="button" aria-label="Download note" title="Download as text file">⬇</button>
          <button class="ib" id="del" type="button" aria-label="Delete note" title="Delete note">🗑</button>
        </div>
        <label class="sr-only" for="title">Note title</label>
        <input id="title" class="e-title" maxlength="100" placeholder="Untitled note">
        <label class="sr-only" for="body">Note text</label>
        <textarea id="body" class="e-body" placeholder="Start writing…"></textarea>
        <div class="e-foot"><span id="wc">0 words</span><span id="when"></span></div>
      </section>

      <div class="nt-empty" id="none" hidden>
        <p>No notes yet.</p>
        <button class="btn btn-primary" id="first" type="button">Write your first note</button>
      </div>
    </div>
  </div>
</div>
<script src="notes.js"></script>
</body>
</html>