(function () {
  'use strict';
  const VK = 'priority.voice', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ============================================================
  // YOUR GROQ API KEY
  // ============================================================
  const GROQ_KEY = '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'; // <-- paste your Groq key
  const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_MODEL = 'openai/gpt-oss-120b';
  // ============================================================

  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.innerHTML = P.icon('grid', 20);

  /* =========================================================
     Voice
     ========================================================= */
  const VS = { voiceURI: '', speak: true };
  try { Object.assign(VS, JSON.parse(localStorage.getItem(VK)) || {}); } catch (e) {}
  const saveVS = () => { try { localStorage.setItem(VK, JSON.stringify(VS)); } catch (e) {} };

  const synth = window.speechSynthesis;
  let voices = [], chosenVoice = null;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
    const sel = $('voice-select');
    sel.innerHTML = '';
    if (!voices.length) {
      const o = el('option', null, 'No voices');
      o.value = '';
      sel.append(o);
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    voices.forEach((v) => {
      const o = el('option', null, v.name + ' · ' + v.lang);
      o.value = v.voiceURI;
      if (v.voiceURI === VS.voiceURI) o.selected = true;
      sel.append(o);
    });
    if (!VS.voiceURI) {
      const pref = voices.find((v) => /en/i.test(v.lang) && /female|samantha|zira|karen|google us english/i.test(v.name))
        || voices.find((v) => /en/i.test(v.lang))
        || voices[0];
      VS.voiceURI = pref.voiceURI;
      saveVS();
      sel.value = pref.voiceURI;
    }
    chosenVoice = voices.find((v) => v.voiceURI === VS.voiceURI) || voices[0];
  }

  if (synth) {
    loadVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 500);
  }

  $('voice-select').addEventListener('change', (e) => {
    VS.voiceURI = e.target.value;
    saveVS();
    chosenVoice = voices.find((v) => v.voiceURI === VS.voiceURI) || voices[0];
    if (chosenVoice) say('Hi, this is my voice.');
  });

  $('speak-back').checked = VS.speak;
  $('speak-back').addEventListener('change', (e) => {
    VS.speak = e.target.checked;
    saveVS();
    if (!VS.speak && synth) synth.cancel();
  });

  function say(text) {
    if (!VS.speak || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (chosenVoice) u.voice = chosenVoice;
    u.rate = 1.02;
    u.pitch = 1;
    synth.speak(u);
  }

  /* =========================================================
     Chat UI
     ========================================================= */
  function addMsg(who, text) {
    const ul = $('chat');
    const empty = ul.querySelector('.ai-empty');
    if (empty) empty.remove();
    const li = el('li', 'ai-msg ' + (who === 'user' ? 'user' : 'ai'));
    const av = el('div', 'ai-av', who === 'user' ? 'You' : 'AI');
    const bub = el('div', 'ai-bub', text);
    li.append(av, bub);
    ul.append(li);
    ul.scrollTop = ul.scrollHeight;
    return li;
  }

  function showTyping() {
    const ul = $('chat');
    const li = el('li', 'ai-msg ai typing');
    const av = el('div', 'ai-av', 'AI');
    const bub = el('div', 'ai-bub');
    bub.append(el('i'), el('i'), el('i'));
    li.append(av, bub);
    ul.append(li);
    ul.scrollTop = ul.scrollHeight;
    return li;
  }

  function setStatus(text, tone) {
    const dotColor = tone === 'warn' ? 'hsl(38 95% 55%)'
                   : tone === 'error' ? 'hsl(0 85% 60%)'
                   : 'hsl(150 60% 45%)';
    $('ai-status').innerHTML = '<span class="ai-dot" style="background:' + dotColor + '"></span> ' + text;
  }

  /* =========================================================
     Conversation memory
     ========================================================= */
  const history = [];
  const MAX_HISTORY = 12;

  function buildSystemPrompt() {
    let tasks = [];
    try {
      const r = JSON.parse(localStorage.getItem('priorityBoard.v1'));
      if (Array.isArray(r)) tasks = r;
    } catch (e) {}
    const today = new Date().toISOString().slice(0, 10);
    const open = tasks.filter((t) => t.list !== 'done');
    const done = tasks.filter((t) => t.list === 'done');
    const now = tasks.filter((t) => t.list === 'now');
    const overdue = open.filter((t) => t.due && t.due < today);
    const dueToday = open.filter((t) => t.due === today);

    let s = 'You are Priority AI, a helpful assistant inside a personal task app called Priority. ';
    s += 'The user\'s current task data:\n';
    s += '- Total tasks: ' + tasks.length + ' (' + done.length + ' done, ' + open.length + ' open)\n';
    s += '- In "Now" focus list: ' + now.length + (now.length ? ' (' + now.map((t) => '"' + t.title + '"').join(', ') + ')' : '') + '\n';
    s += '- Overdue: ' + overdue.length + (overdue.length ? ' (' + overdue.map((t) => '"' + t.title + '"').join(', ') + ')' : '') + '\n';
    s += '- Due today: ' + dueToday.length + (dueToday.length ? ' (' + dueToday.map((t) => '"' + t.title + '"').join(', ') + ')' : '') + '\n';
    s += '\nBe concise (2-4 sentences), friendly, and practical. You can suggest priorities, give productivity tips, answer questions about their day, and help think through tasks. You cannot directly create or edit tasks — if the user wants to add one, remind them to use My Tasks or the quick-add bar. Speak naturally because replies may be read aloud.';
    return { role: 'system', content: s };
  }

  /* =========================================================
     Groq API call
     ========================================================= */
  async function sendToAI(userText) {
    if (!GROQ_KEY || GROQ_KEY === 'gsk_YOUR_KEY_HERE') {
      throw new Error('No API key. Open voice.js and paste your Groq key at the top.');
    }

    history.push({ role: 'user', content: userText });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

    const messages = [buildSystemPrompt(), ...history];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!res.ok) {
      let detail = '';
      try {
        const j = await res.json();
        detail = j.error?.message || j.error || '';
      } catch (e) {}
      throw new Error('Groq API ' + res.status + (detail ? ': ' + detail : ''));
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) throw new Error('Empty reply from Groq');

    history.push({ role: 'assistant', content: reply });
    return reply;
  }

  /* =========================================================
     Send handler
     ========================================================= */
  const form = $('chat-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';

    addMsg('user', text);
    const typing = showTyping();
    setStatus('Thinking…', 'warn');

    try {
      const reply = await sendToAI(text);
      typing.remove();
      addMsg('ai', reply);
      say(reply);
      setStatus('Ready', 'ok');
    } catch (err) {
      typing.remove();
      addMsg('ai', 'Sorry — ' + err.message);
      setStatus('Error', 'error');
      console.error('[Priority AI]', err);
    }
  });

  /* =========================================================
     Textarea auto-resize + Enter to send
     ========================================================= */
  const input = $('chat-input');
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  /* =========================================================
     Clear chat
     ========================================================= */
  $('clear-chat').addEventListener('click', () => {
    history.length = 0;
    $('chat').textContent = '';
    showEmpty();
    setStatus('Ready', 'ok');
    if (synth) synth.cancel();
  });

  function showEmpty() {
    const li = el('li', 'ai-empty');
    li.textContent = 'Ask about your tasks, your day, or productivity.';
    $('chat').append(li);
  }

  /* =========================================================
     Greeting
     ========================================================= */
  addMsg('ai', 'Hi. I can help you think through your tasks, prioritize your day, or just talk. What\'s on your mind?');
  setStatus('Ready', 'ok');

  /* Focus input on load */
  setTimeout(() => input.focus(), 300);
})();