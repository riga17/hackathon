(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');

  const FAQ = [
    { q: 'Where is my data stored?', tags: ['data','privacy','backup'], a: 'Everything you add — tasks, habits, goals, files, and settings — is saved in your browser on this device only. Nothing is sent to a server. Use Settings → Download backup to save a copy you can keep.' },
    { q: 'How do I add a task?', tags: ['tasks','add'], a: 'The quickest way is the search bar at the top of the Dashboard: type a task and press Enter. For more control (priority, due date, notes), open My Tasks and click <a href="tasks.html">+ New task</a>.' },
    { q: 'What is the Now list?', tags: ['tasks','focus','now'], a: 'Now is your focus list, capped at 5 tasks. It is meant to be the short list you are actively working on. Drag tasks in and out on My Tasks, and tick them off when they are done.' },
    { q: 'How does the calendar work?', tags: ['calendar','dates','due'], a: 'The Calendar shows any task with a due date on its day. Drag a task chip onto another day to reschedule it, or click a day to see its tasks and add one. Tapping any day in the Dashboard mini calendar opens the same day here.' },
    { q: 'What does the voice assistant do?', tags: ['voice','assistant','speech'], a: 'The Voice Assistant uses your browser\'s speech recognition to add tasks and answer questions hands-free. Try “Add buy milk tomorrow” or “What\'s due today?”. Voice input works in Chrome, Edge, and Safari.' },
    { q: 'Can I use Priority offline?', tags: ['offline','data','browser'], a: 'Once the page is open it runs entirely on your device, so most interactions work without a connection. Because it is not installed as an app, you still need to reach it from the internet the first time you load a page.' },
    { q: 'How do I change my color or theme?', tags: ['settings','theme','dark','color'], a: 'Open <a href="settings.html">Settings</a>. You can switch light/dark, pick a preset color, or slide for any hue. Your choice carries across every page instantly.' },
    { q: 'How do I reset everything?', tags: ['reset','data','settings'], a: 'Settings → Reset all data clears every saved item and reloads. Export a backup first if you might want your tasks back later.' },
    { q: 'Why is my music stopping?', tags: ['music','audio','settings'], a: 'Music is generated in your browser and stops when you open a new page, because each page is its own file. For continuous music you would need a single-page version of the app — that is a bigger change we can do later.' },
    { q: 'What are achievements?', tags: ['achievements','badges','xp'], a: 'Achievements award badges and XP for milestones like your first completed task, a 7-day habit streak, or finishing focus sessions. Open <a href="achievements.html">Achievements</a> to see your progress.' },
    { q: 'How do I track habits and goals?', tags: ['habits','goals','streaks'], a: 'Habits &amp; Goals lets you tick off daily habits, see your best streak, and add long-term goals with progress bars. Each day you complete a habit adds to your streak.' },
    { q: 'Where are my attachments saved?', tags: ['attachments','files','upload'], a: 'Attachments stay in your browser like everything else. Each file is limited to 3&nbsp;MB because browser storage is small. For bigger files we would need to switch to IndexedDB.' },
    { q: 'Can I use Priority on my phone?', tags: ['mobile','phone','responsive'], a: 'Yes. Every page is responsive, and the sidebar becomes a slide-out menu under 820&nbsp;px. Drag and drop on the task board works with touch too.' }
  ];

  const GUIDES = [
    { href: 'home.html', icon: 'home', name: 'Dashboard', desc: 'Overview, timer, mini calendar' },
    { href: 'tasks.html', icon: 'checkCircle', name: 'My Tasks', desc: 'Drag and drop board' },
    { href: 'calendar.html', icon: 'calendar', name: 'Calendar', desc: 'Month view, reschedule by drag' },
    { href: 'habits.html', icon: 'sprout', name: 'Habits & Goals', desc: 'Streaks and long-term goals' },
    { href: 'stats.html', icon: 'chart', name: 'Statistics', desc: 'Charts of your progress' },
    { href: 'voice.html', icon: 'mic', name: 'Voice Assistant', desc: 'Hands-free tasks and questions' },
    { href: 'attachments.html', icon: 'paperclip', name: 'My Attachments', desc: 'Store files on your device' },
    { href: 'reminders.html', icon: 'bell', name: 'Reminders', desc: 'Timeline and custom alerts' },
    { href: 'achievements.html', icon: 'trophy', name: 'Achievements', desc: 'Badges and XP' },
    { href: 'profile.html', icon: 'user', name: 'My Profile', desc: 'Your info and stats' },
    { href: 'settings.html', icon: 'settings', name: 'Settings', desc: 'Theme, color, music' }
  ];

  const SHORTCUTS = [
    ['N', 'New task (My Tasks)'],
    ['/', 'Focus the search box'],
    ['Enter', 'Quick-add on Dashboard'],
    ['Enter / Space', 'Open a focused badge or day'],
    ['Esc', 'Close a dialog']
  ];

  const TAGS = ['tasks', 'calendar', 'music', 'backup', 'habits', 'achievements', 'voice', 'reset'];

  /* ----- Render FAQ ----- */
  let openIdx = -1;
  function buildFaq(filter) {
    const ul = $('faq'); ul.textContent = '';
    const f = (filter || '').toLowerCase().trim();
    let shown = 0;
    FAQ.forEach((item, i) => {
      const hay = (item.q + ' ' + item.tags.join(' ') + ' ' + item.a.replace(/<[^>]+>/g, '')).toLowerCase();
      if (f && !hay.includes(f)) return;
      shown++;
      const li = el('li');
      const btn = el('button', 'q'); btn.type = 'button';
      btn.append(el('span', null, item.q), el('span', 'arrow', '›'));
      const ans = el('div', 'a'); ans.innerHTML = item.a;
      btn.onclick = () => {
        const wasOpen = li.classList.contains('open');
        document.querySelectorAll('.faq li.open').forEach((x) => x.classList.remove('open'));
        if (!wasOpen) li.classList.add('open');
      };
      if (i === openIdx || (!f && i === 0)) li.classList.add('open');
      li.append(btn, ans); ul.append(li);
    });
    $('count').textContent = shown;
    $('no-results').classList.toggle('show', shown === 0);
  }

  /* ----- Render guides ----- */
  const g = $('guides');
  GUIDES.forEach((x) => {
    const li = el('li');
    const a = el('a'); a.href = x.href;
    const ico = el('span', 'ico');
    ico.innerHTML = icn(x.icon, 20);
    a.append(ico);
    const body = el('div');
    body.append(el('div', null, x.name), el('div', 'desc', x.desc));
    a.append(body); li.append(a); g.append(li);
  });

  /* ----- Render shortcuts ----- */
  const s = $('shortcuts');
  SHORTCUTS.forEach(([k, d]) => {
    const li = el('li');
    li.append(el('kbd', null, k), el('span', null, d));
    s.append(li);
  });

  /* ----- Render tags ----- */
  const tg = $('tags');
  TAGS.forEach((t) => {
    const b = el('button', null, '#' + t); b.type = 'button';
    b.onclick = () => { $('q').value = t; buildFaq(t); };
    tg.append(b);
  });

  /* ----- Search ----- */
  $('q').addEventListener('input', (e) => buildFaq(e.target.value));

  buildFaq('');
})();