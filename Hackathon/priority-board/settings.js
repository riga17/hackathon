(function () {
  'use strict';
  const P = window.Priority, $ = (id) => document.getElementById(id);
  const TK = 'priorityBoard.v1';
  const HUES = [['Pink', 335], ['Blue', 215], ['Purple', 265], ['Green', 150], ['Orange', 25], ['Teal', 185]];

  function applyCues() {
    const s = P.get();
    $('cue-sounds').checked = !!s.cueSounds;
    $('notify-reminders').checked = !!s.notifyReminders;
    $('default-list').value = s.defaultList || 'later';
    $('default-prio').value = s.defaultPrio || 'medium';
    $('notify-state').textContent = 'Notification permission: ' +
      (('Notification' in window) ? Notification.permission : 'not supported');
  }

  function draw() {
    const s = P.get(), m = P.mode();
    const icon = P.icon;

    $('modes').innerHTML = [['light', 'Light', 'sun'], ['dark', 'Dark', 'moon']]
      .map(([k, l, ic]) =>
        '<button class="seg' + (m === k ? ' on' : '') + '" data-m="' + k + '">' +
        icon(ic, 16) + ' ' + l + '</button>'
      ).join('');

    $('swatches').innerHTML = HUES
      .map(([n, h]) =>
        '<button class="sw' + (s.hue === h ? ' on' : '') + '" data-h="' + h +
        '" style="--c:hsl(' + h + ' 85% 56%)" aria-label="' + n + '" title="' + n + '"></button>'
      ).join('');

    // ---- Music section (YouTube) ----
    const musicBox = $('tracks');
    if (musicBox) {
      let last = '';
      try { last = localStorage.getItem('priority.yt.last') || ''; } catch (e) {}
      musicBox.innerHTML =
        '<div style="display:grid;gap:10px;grid-column:1/-1">' +
          '<label class="sr-only" for="yt-link">YouTube link</label>' +
          '<input id="yt-link" type="text" placeholder="Paste a YouTube link or video ID…" ' +
            'value="' + (last ? last.replace(/"/g, '&quot;') : '') + '" ' +
            'style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:11px 14px;color:var(--text);font:inherit">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="btn btn-primary" id="yt-play" type="button">Play</button>' +
            '<button class="btn" id="yt-stop" type="button">Stop</button>' +
          '</div>' +
          '<p class="hint" id="yt-status" style="margin:0"></p>' +
        '</div>';

      const link = $('yt-link');
      $('yt-play').addEventListener('click', () => {
        const v = link.value.trim();
        if (!v) { P.toast('Paste a YouTube link first.'); return; }
        try { localStorage.setItem('priority.yt.last', v); } catch (e) {}
        if (P.music.play(v)) $('yt-status').textContent = 'Loading…';
        else P.toast('That link does not look like a YouTube video.');
      });
      $('yt-stop').addEventListener('click', () => {
        P.music.stop();
        $('yt-status').textContent = 'Stopped.';
      });

      const syncStatus = () => {
        $('yt-status').textContent = P.music.on() ? 'Playing in this page.' : 'Nothing playing.';
      };
      syncStatus();
      window.addEventListener('musicchange', syncStatus);
    }

    $('hue').value = s.hue;
    $('vol').value = s.vol;

    const hueName = HUES.find(([, h]) => h === +$('hue').value);
    $('hue-lbl').textContent = hueName ? 'Preset · ' + hueName[0] : 'Custom hue · ' + $('hue').value + '°';
    $('vol-lbl').textContent = 'Volume · ' + Math.round($('vol').value * 100) + '%';

    applyCues();
  }

  /* Theme + color */
  $('modes').addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]');
    if (b) { P.setMode(b.dataset.m); draw(); }
  });

  $('swatches').addEventListener('click', (e) => {
    const b = e.target.closest('[data-h]');
    if (b) { P.set({ hue: +b.dataset.h }); draw(); }
  });

  $('hue').addEventListener('input', (e) => {
    P.set({ hue: +e.target.value });
    $('hue-lbl').textContent = 'Custom hue · ' + e.target.value + '°';
  });
  $('hue').addEventListener('change', draw);

  /* Volume (applies to YouTube player) */
  $('vol').addEventListener('input', (e) => {
    P.music.setVol(+e.target.value);
    $('vol-lbl').textContent = 'Volume · ' + Math.round(e.target.value * 100) + '%';
  });

  /* Cues and notifications */
  $('cue-sounds').addEventListener('change', (e) => P.set({ cueSounds: e.target.checked }));

  $('notify-reminders').addEventListener('change', (e) => {
    P.set({ notifyReminders: e.target.checked });
    if (e.target.checked && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(applyCues);
    }
  });

  $('ask-notify').addEventListener('click', () => {
    if (!('Notification' in window)) {
      P.toast('Notifications are not supported in this browser.');
      return;
    }
    Notification.requestPermission().then(() => {
      applyCues();
      P.toast('Notifications updated.');
    });
  });

  /* Defaults */
  $('default-list').addEventListener('change', (e) => P.set({ defaultList: e.target.value }));
  $('default-prio').addEventListener('change', (e) => P.set({ defaultPrio: e.target.value }));

  /* Backup */
  $('backup').addEventListener('click', () => {
    const keys = [
      TK,
      'priorityBoard.habits.v2',
      'priorityBoard.habits',
      'priorityBoard.goals.v1',
      'priorityAchievements.v1',
      'priorityAttachments.v1',
      'priorityReminders.v1',
      'priorityProfile.v1',
      'priority.settings',
      'priority.notes',
      'priority.study',
      'priority.voice',
      'priorityConversations.v1',
      'priorityActiveChat.v1',
      'priority.yt.last'
    ];
    const data = {};
    keys.forEach((k) => {
      try {
        const v = localStorage.getItem(k);
        if (v != null) {
          try { data[k] = JSON.parse(v); } catch (e) { data[k] = v; }
        }
      } catch (e) {}
    });
    data.exportedAt = new Date().toISOString();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'priority-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    P.toast('Backup downloaded.');
  });

  /* Reset appearance */
  $('reset-appearance').addEventListener('click', () => {
    P.music.stop();
    P.set({
      hue: 335,
      vol: 0.4,
      cueSounds: false,
      notifyReminders: false,
      defaultList: 'later',
      defaultPrio: 'medium'
    });
    P.setMode('light');
    draw();
    P.toast('Appearance reset.');
  });

  /* Reset all */
  const cf = $('confirm');
  $('reset-all').addEventListener('click', () => cf.showModal());
  $('c-cancel').onclick = () => cf.close();
  cf.addEventListener('click', (e) => { if (e.target === cf) cf.close(); });
  $('c-confirm').onclick = () => {
    [
      'priorityBoard.v1',
      'priorityBoard.habits.v2',
      'priorityBoard.habits',
      'priorityBoard.goals.v1',
      'priorityAchievements.v1',
      'priorityAttachments.v1',
      'priorityReminders.v1',
      'priorityProfile.v1',
      'priority.settings',
      'priority.notes',
      'priority.study',
      'priority.voice',
      'priorityConversations.v1',
      'priorityActiveChat.v1',
      'priority.yt.last'
    ].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    P.toast('All data cleared. Reloading…');
    setTimeout(() => location.reload(), 900);
  };

  window.addEventListener('musicchange', draw);
  draw();
})();