<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Summarize · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="summarize.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>
      <div class="ttl"><h1>Summarize</h1><p>Turn long content into clear, short notes.</p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode">🌙</button>
    </header>

    <section class="soon-hero">
      <div class="soon-orb"></div>
      <div class="soon-content">
        <span class="soon-icon" aria-hidden="true">📝</span>
        <span class="soon-pill">Coming soon</span>
        <h2>Read less, know more.</h2>
        <p>Drop in a photo, PDF, video, or paste a YouTube link — we'll pull out the important bits and hand you a clean summary. No need to skim through the whole thing.</p>

        <ul class="soon-features">
          <li><b>📷 Photos</b><span>Scan a page, a whiteboard, or a screenshot.</span></li>
          <li><b>📄 PDFs</b><span>Long documents, shortened to what matters.</span></li>
          <li><b>🎬 Videos</b><span>Transcripts turned into tight summaries.</span></li>
          <li><b>🔗 YouTube</b><span>Paste a link, get the gist in seconds.</span></li>
        </ul>

        <div class="soon-actions">
          <button class="btn btn-primary" id="notify" type="button">Tell me when it's ready</button>
          <a class="btn" href="home.php">Back to dashboard</a>
        </div>
      </div>
    </section>
  </div>
</div>
<script src="summarize.js"></script>
</body>
</html>