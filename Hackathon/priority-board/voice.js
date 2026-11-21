(function () {
  'use strict';
  const VK = 'priority.voice', CK = 'priorityConversations.v1', AK = 'priorityActiveChat.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ============================================================
  // GROQ API — paste your key here
  // ============================================================
  const GROQ_KEY = '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';
  const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const GROQ_MODEL = 'openai/gpt-oss-120b';
  // ============================================================

  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.innerHTML = icn('grid', 20);

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
      const o = el('option', null, 'No voices'); o.value = '';
      sel.append(o); sel.disabled = true; return;
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
        || voices.find((v) => /en/i.test(v.lang)) || voices[0];
      VS.voiceURI = pref.voiceURI; saveVS(); sel.value = pref.voiceURI;
    }
    chosenVoice = voices.find((v) => v.voiceURI === VS.voiceURI) || voices[0];
  }
  if (synth) {
    loadVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 500);
  }
  $('voice-select').addEventListener('change', (e) => {
    VS.voiceURI = e.target.value; saveVS();
    chosenVoice = voices.find((v) => v.voiceURI === VS.voiceURI) || voices[0];
    if (chosenVoice) say('Hi, this is my voice.');
  });
  $('speak-back').checked = VS.speak;
  $('speak-back').addEventListener('change', (e) => { VS.speak = e.target.checked; saveVS(); });

  function say(text) {
    if (!VS.speak || !synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (chosenVoice) u.voice = chosenVoice;
    u.rate = 1.02;
    synth.speak(u);
  }

  /* =========================================================
     Conversations
     ========================================================= */
  let conversations = [];
  try { const r = JSON.parse(localStorage.getItem(CK)); if (Array.isArray(r)) conversations = r; } catch (e) {}
  const saveConvs = () => { try { localStorage.setItem(CK, JSON.stringify(conversations)); } catch (e) {} };

  let activeId = null;
  try { activeId = localStorage.getItem(AK); } catch (e) {}
  const saveActive = (id) => {
    activeId = id;
    try { localStorage.setItem(AK, id || ''); } catch (e) {}
  };

  function currentConv() { return conversations.find((c) => c.id === activeId); }

  function newConversation() {
    const c = {
      id: uid(),
      title: 'New chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    conversations.unshift(c);
    saveConvs();
    saveActive(c.id);
    renderConvList();
    renderThread();
    $('chat-input').focus();
  }

  function openConversation(id) {
    const c = conversations.find((x) => x.id === id);
    if (!c) return;
    saveActive(id);
    renderConvList();
    renderThread();
  }

  function deleteConversation(id) {
    if (!confirm('Delete this conversation?')) return;
    conversations = conversations.filter((c) => c.id !== id);
    saveConvs();
    if (activeId === id) {
      const next = conversations[0];
      if (next) saveActive(next.id);
      else { newConversation(); return; }
    }
    renderConvList();
    renderThread();
  }

  function titleFrom(text) {
    const t = text.trim().replace(/\s+/g, ' ').slice(0, 40);
    return t || 'New chat';
  }

  function pushMessage(role, content) {
    let c = currentConv();
    if (!c) { newConversation(); c = currentConv(); }
    c.messages.push({ role, content });
    if (role === 'user' && (c.title === 'New chat' || !c.title)) {
      c.title = titleFrom(content);
    }
    c.updatedAt = Date.now();
    conversations = [c, ...conversations.filter((x) => x.id !== c.id)];
    saveConvs();
    renderConvList();
    renderThread();
  }

  /* =========================================================
     Render sidebar
     ========================================================= */
  function renderConvList() {
    const ul = $('conv-list'); ul.textContent = '';
    if (!conversations.length) {
      ul.append(el('li', 'conv-empty', 'No chats yet. Start one.'));
      return;
    }
    conversations.forEach((c) => {
      const li = el('li', 'conv-item' + (c.id === activeId ? ' on' : ''));
      const title = el('span', 'conv-title', c.title || 'New chat');
      const del = el('button', 'conv-del');
      del.type = 'button';
      del.innerHTML = icn('x', 12);
      del.setAttribute('aria-label', 'Delete conversation');
      del.onclick = (e) => { e.stopPropagation(); deleteConversation(c.id); };
      li.append(title, del);
      li.onclick = () => openConversation(c.id);
      ul.append(li);
    });
  }

  /* =========================================================
     Render thread
     ========================================================= */
  function renderThread() {
    const ul = $('chat'); ul.textContent = '';
    const c = currentConv();
    if (!c || !c.messages.length) {
      const li = el('li', 'ai-empty');
      li.textContent = 'Start a conversation. Ask about your tasks, your day, or productivity.';
      ul.append(li);
      return;
    }
    c.messages.forEach((m) => {
      const li = el('li', 'ai-msg ' + (m.role === 'user' ? 'user' : 'ai'));
      const av = el('div', 'ai-av', m.role === 'user' ? 'You' : 'AI');
      const bub = el('div', 'ai-bub', m.content);
      li.append(av, bub);
      ul.append(li);
    });
    ul.scrollTop = ul.scrollHeight;
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
     System prompt
     ========================================================= */
  function buildSystemPrompt() {
    let tasks = [];
    try { const r = JSON.parse(localStorage.getItem('priorityBoard.v1')); if (Array.isArray(r)) tasks = r; } catch (e) {}
    const today = new Date().toISOString().slice(0, 10);
    const open = tasks.filter((t) => t.list !== 'done');
    const done = tasks.filter((t) => t.list === 'done');
    const now = tasks.filter((t) => t.list === 'now');
    const overdue = open.filter((t) => t.due && t.due < today);
    const dueToday = open.filter((t) => t.due === today);

    let s = 'You are Priority AI inside a personal task app. The user\'s data:\n';
    s += '- Total: ' + tasks.length + ' tasks (' + done.length + ' done, ' + open.length + ' open)\n';
    s += '- Now list: ' + now.length + (now.length ? ' (' + now.map((t) => '"' + t.title + '"').join(', ') + ')' : '') + '\n';
    s += '- Overdue: ' + overdue.length + (overdue.length ? ' (' + overdue.map((t) => '"' + t.title + '"').join(', ') + ')' : '') + '\n';
    s += '- Due today: ' + dueToday.length + (dueToday.length ? ' (' + dueToday.map((t) => '"' + t.title + '"').join(', ') + ')' : '') + '\n';
    s += '\nBe concise (2-4 sentences), friendly, and practical. You cannot modify tasks. Speak naturally.';
    return { role: 'system', content: s };
  }

  /* =========================================================
     Groq API call
     ========================================================= */
  async function sendToAI(messages) {
    if (!GROQ_KEY || GROQ_KEY === 'gsk_YOUR_KEY_HERE') {
      throw new Error('No API key. Paste your Groq key in voice.js.');
    }
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [buildSystemPrompt(), ...messages.slice(-12)],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    if (!res.ok) {
      let detail = '';
      try { const j = await res.json(); detail = j.error?.message || ''; } catch (e) {}
      throw new Error('Groq ' + res.status + (detail ? ': ' + detail : ''));
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) throw new Error('Empty reply');
    return reply;
  }

  /* =========================================================
     Send handler
     ========================================================= */
  $('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';

    if (!currentConv()) newConversation();

    pushMessage('user', text);

    const typing = showTyping();
    setStatus('Thinking…', 'warn');

    try {
      const c = currentConv();
      const reply = await sendToAI(c.messages.map((m) => ({ role: m.role, content: m.content })));
      typing.remove();
      pushMessage('assistant', reply);
      say(reply);
      setStatus('Ready', 'ok');
    } catch (err) {
      typing.remove();
      pushMessage('assistant', 'Sorry — ' + err.message);
      setStatus('Error', 'error');
      console.error('[Priority AI]', err);
    }
  });

  /* Auto-resize textarea */
  const input = $('chat-input');
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('chat-form').requestSubmit();
    }
  });

  /* New chat / clear */
  $('new-chat').addEventListener('click', newConversation);
  $('clear-chat').addEventListener('click', () => {
    const c = currentConv();
    if (!c) return;
    if (!confirm('Clear this conversation?')) return;
    c.messages = [];
    c.title = 'New chat';
    saveConvs();
    renderConvList();
    renderThread();
    setStatus('Ready', 'ok');
    if (synth) synth.cancel();
  });

  /* =========================================================
     Init
     ========================================================= */
  if (!conversations.length) {
    newConversation();
  } else if (activeId) {
    if (!conversations.find((c) => c.id === activeId)) {
      saveActive(conversations[0].id);
    }
  } else {
    saveActive(conversations[0].id);
  }
  renderConvList();
  renderThread();
  setStatus('Ready', 'ok');
  setTimeout(() => input.focus(), 300);
})();