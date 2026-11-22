<?php require 'auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Assistant · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <link rel="stylesheet" href="voice.css">
  <script src="app.js"></script>
</head>
<body>
<div class="app">
  <aside class="side" id="nav-slot"></aside>
  <div class="scrim" id="scrim"></div>

  <div class="main">
    <header class="top">
      <button class="ib menu-btn" id="menu-btn" type="button" aria-label="Open menu"></button>
      <div class="ttl"><h1>AI Assistant</h1><p id="sub">Ask about your tasks, or just chat.</p></div>
      <button class="ib" id="theme-toggle" type="button" aria-label="Toggle dark mode"></button>
    </header>

    <div class="chat-layout">
      <!-- Conversations sidebar -->
      <aside class="conv-side">
        <button class="btn btn-primary conv-new" id="new-chat" type="button">+ New chat</button>
        <p class="conv-label">Recent</p>
        <ul class="conv-list" id="conv-list"></ul>
      </aside>

      <!-- Chat panel -->
      <div class="ai-shell">
        <header class="ai-head">
          <div class="ai-identity">
            <div class="ai-orb">
              <span class="ai-orb-core"></span>
              <span class="ai-orb-ring"></span>
            </div>
            <div>
              <h2 class="ai-name" id="ai-name">Priority AI</h2>
              <p class="ai-status" id="ai-status">
                <span class="ai-dot"></span> Ready
              </p>
            </div>
          </div>
          <div class="ai-head-actions">
            <label class="ai-voice-pick" title="Voice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 9a4 4 0 0 1 0 6"/></svg>
              <select id="voice-select" aria-label="Voice"></select>
            </label>
            <label class="ai-toggle" title="Speak replies">
              <input type="checkbox" id="speak-back" checked>
              <span class="ai-toggle-track"></span>
            </label>
            <button class="ai-icon-btn" id="clear-chat" type="button" aria-label="Clear this chat" title="Clear">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>
            </button>
          </div>
        </header>

        <ul class="ai-thread" id="chat" aria-live="polite"></ul>

        <form class="ai-compose" id="chat-form" autocomplete="off">
          <label class="sr-only" for="chat-input">Message</label>
          <textarea id="chat-input" rows="1" maxlength="500" placeholder="Ask anything about your day…"></textarea>
          <button class="ai-send" type="submit" aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
<script src="voice.js"></script>
</body>
</html>