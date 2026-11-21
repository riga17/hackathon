(function () {
  'use strict';
  const KEY = 'priorityAttachments.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const MAX = 4 * 1024 * 1024;

  let files = [];
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) files = r; } catch (e) {}
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(files)); }
    catch (e) { P.toast('Storage full. Delete a file to free space.'); }
  };
  let filter = { q: '', tab: 'scans' };

  /* Icons */
  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.innerHTML = icn('grid', 20);
  const scanIcon = $('scan-icon');
  if (scanIcon) scanIcon.innerHTML = icn('image', 30);

  /* =========================================================
     Types
     ========================================================= */
  function typeOf(mime, name) {
    if (!mime) mime = '';
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf' || /\.pdf$/i.test(name)) return 'pdf';
    if (mime.startsWith('text/') || /\.(txt|md|csv|json)$/i.test(name)) return 'text';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('video/')) return 'video';
    return 'other';
  }
  const ICON = { image: 'image', pdf: 'file', text: 'note', audio: 'audio', video: 'video', other: 'folder' };
  const LABEL = { image: 'Image', pdf: 'PDF', text: 'Note', audio: 'Audio', video: 'Video', other: 'File' };

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function totalBytes() { return files.reduce((s, f) => s + (f.size || 0), 0); }
  const isScanned = (f) => f.type === 'text' && f.scanned && f.text;

  /* =========================================================
     Render
     ========================================================= */
  function render() {
    const grid = $('grid'); grid.textContent = '';
    const q = filter.q.toLowerCase();
    const list = files
      .filter((f) => {
        if (filter.tab === 'scans') return isScanned(f);
        if (filter.tab === 'files') return !isScanned(f);
        return true;
      })
      .filter((f) => {
        if (!q) return true;
        const hay = ((f.name || '') + ' ' + (f.text || '')).toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.addedAt - a.addedAt);

    if (!list.length) {
      const e = el('div', 'empty-a');
      const scans = filter.tab === 'scans';
      e.append(
        el('b', null, files.length ? 'Nothing matches.' : (scans ? 'No scanned notes yet.' : 'No files yet.')),
        el('span', null, files.length
          ? 'Try a different tab or search.'
          : (scans ? 'Scan a photo above to get started.' : 'Upload a file from the toolbar.'))
      );
      grid.append(e);
    }

    list.forEach((f) => {
      const card = el('div', 'file');
      const th = el('div', 'file-thumb');

      if (f.data && f.type === 'image') {
        const img = el('img'); img.src = f.data; img.alt = f.name; th.append(img);
      } else if (f.scanned && f.data) {
        const img = el('img'); img.src = f.data; img.alt = f.name; th.append(img);
      } else {
        th.innerHTML = icn(ICON[f.type] || 'folder', 40);
      }

      if (f.scanned) th.append(el('span', 'badge badge-scan', 'Scanned'));
      th.append(el('span', 'badge', LABEL[f.type] || 'File'));

      card.append(th);
      card.append(el('div', 'file-name', f.name));

      if (isScanned(f) && f.text) {
        card.append(el('div', 'file-scan-preview', f.text.slice(0, 140) + (f.text.length > 140 ? '…' : '')));
      }

      const meta = el('div', 'file-meta');
      meta.append(el('span', null, fmtSize(f.size)), el('span', null, fmtDate(f.addedAt)));
      card.append(meta);

      const acts = el('div', 'acts');
      const open = el('button', null, 'Open'); open.type = 'button';
      const del = el('button', 'del', 'Delete'); del.type = 'button';
      open.onclick = (e) => { e.stopPropagation(); openPreview(f); };
      del.onclick = (e) => { e.stopPropagation(); removeFile(f.id); };
      acts.append(open, del);
      card.append(acts);

      card.onclick = () => openPreview(f);
      grid.append(card);
    });

    const scans = files.filter(isScanned).length;
    $('sub').textContent = files.length
      ? scans + ' scanned · ' + (files.length - scans) + ' files · stored on this device'
      : 'Scan notes, receipts, or anything with text.';
    $('storage').textContent = fmtSize(totalBytes()) + ' used';
  }

  /* =========================================================
     Regular file upload
     ========================================================= */
  function addFiles(fileList) {
    const arr = [...fileList];
    if (!arr.length) return;
    let pending = arr.length, added = 0, skipped = 0;
    arr.forEach((file) => {
      if (file.size > MAX) { skipped++; if (--pending === 0) finish(); return; }
      const reader = new FileReader();
      reader.onload = () => {
        files.push({
          id: uid(),
          name: file.name,
          size: file.size,
          mime: file.type,
          type: typeOf(file.type, file.name),
          data: reader.result,
          addedAt: Date.now()
        });
        added++; save(); if (--pending === 0) finish();
      };
      reader.onerror = () => { skipped++; if (--pending === 0) finish(); };
      reader.readAsDataURL(file);
    });
    function finish() {
      render();
      if (added) {
        P.toast('Added ' + added + ' file' + (added === 1 ? '' : 's') + '.');
        if (window.PriorityAchievements) PriorityAchievements.mark('fileUploaded');
      }
      if (skipped) P.toast(skipped + ' file' + (skipped === 1 ? ' was' : +'s were') + ' too large.');
    }
  }

  /* =========================================================
     Scanner
     ========================================================= */
  const zone = $('scan-zone');
  const progress = $('scan-progress');
  const spFill = $('sp-fill');
  const spPct = $('sp-pct');
  const spHint = $('sp-hint');

  function setProgress(pct, hint) {
    if (pct == null) { progress.hidden = true; return; }
    progress.hidden = false;
    spFill.style.width = Math.round(pct) + '%';
    spPct.textContent = Math.round(pct) + '%';
    if (hint) spHint.textContent = hint;
  }

  async function scanPhoto(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      P.toast('That is not an image. Use Upload file for other types.');
      return;
    }
    if (file.size > MAX) {
      P.toast('Photo is too large (max 4 MB).');
      return;
    }
    if (!window.Tesseract) {
      P.toast('Scanner not loaded. Check your connection and reload.');
      return;
    }

    zone.classList.add('scanning');
    setProgress(0, 'Reading the image…');

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      try {
        const result = await Tesseract.recognize(dataUrl, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(m.progress * 100, 'Reading the text…');
            } else if (m.status === 'loading tesseract core') {
              setProgress(2, 'Loading engine…');
            } else if (m.status === 'initializing tesseract') {
              setProgress(5, 'Preparing…');
            }
          }
        });

        const text = (result.data.text || '').replace(/\n{3,}/g, '\n\n').trim();
        const stamp = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const name = text
          ? 'Scan · ' + (text.split('\n')[0].slice(0, 30) || 'note')
          : 'Scan · ' + stamp + ' ' + time;

        files.push({
          id: uid(),
          name,
          size: file.size,
          mime: file.type,
          type: 'text',
          data: dataUrl,
          scanned: true,
          text,
          addedAt: Date.now()
        });
        save();
        setProgress(100, 'Done.');
        setTimeout(() => setProgress(null), 600);
        zone.classList.remove('scanning');
        render();
        P.toast(text
          ? 'Scan complete. ' + text.length + ' characters extracted.'
          : 'Photo saved, but no text was found.');
        if (window.PriorityAchievements) PriorityAchievements.mark('fileUploaded');

        filter.tab = 'scans';
        document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === 'scans'));
        render();
      } catch (err) {
        console.error('[Scan]', err);
        setProgress(null);
        zone.classList.remove('scanning');
        P.toast('Scan failed. Try again with a clearer photo.');
      }
    };
    reader.onerror = () => {
      setProgress(null);
      zone.classList.remove('scanning');
      P.toast('Could not read the photo.');
    };
    reader.readAsDataURL(file);
  }

  /* Scanner interactions */
  zone.onclick = () => $('photo-input').click();
  $('pick-photo').onclick = () => $('photo-input').click();
  $('use-camera').onclick = () => $('camera-input').click();
  $('photo-input').onchange = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) scanPhoto(f);
  };
  $('camera-input').onchange = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) scanPhoto(f);
  };

  ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => {
    e.preventDefault(); zone.classList.add('over');
  }));
  ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => {
    e.preventDefault(); zone.classList.remove('over');
  }));
  zone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      scanPhoto(e.dataTransfer.files[0]);
    }
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { if (!e.target.closest('#scan-zone')) e.preventDefault(); });

  /* =========================================================
     Remove
     ========================================================= */
  function removeFile(id) {
    const i = files.findIndex((f) => f.id === id);
    if (i < 0) return;
    if (!confirm('Delete this file? This cannot be undone.')) return;
    files.splice(i, 1); save(); render(); $('preview').close();
    P.toast('File deleted.');
  }

  /* =========================================================
     Preview
     ========================================================= */
  const dlg = $('preview');
  function openPreview(f) {
    $('pv-name').textContent = f.name;
    const body = $('pv-body'); body.textContent = '';

    if (isScanned(f)) {
      const wrap = el('div', 'scan-wrap');
      if (f.data) {
        const img = el('img'); img.src = f.data; img.alt = f.name;
        wrap.append(img);
      }
      const pre = el('pre', null, f.text || '(no text)');
      wrap.append(pre);
      body.append(wrap);
    } else if (f.type === 'image') {
      const img = el('img'); img.src = f.data; img.alt = f.name; body.append(img);
    } else if (f.type === 'audio') {
      const a = el('audio'); a.controls = true; a.src = f.data; body.append(a);
    } else if (f.type === 'video') {
      const v = el('video'); v.controls = true; v.src = f.data; body.append(v);
    } else if (f.type === 'pdf') {
      const fr = el('iframe'); fr.src = f.data; fr.title = f.name; body.append(fr);
    } else if (f.type === 'text' && !f.scanned) {
      try {
        const b64 = f.data.split(',')[1] || '';
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const text = new TextDecoder().decode(bytes);
        body.append(el('pre', null, text.slice(0, 20000)));
      } catch (e) {
        body.append(el('div', 'nopv', 'Could not read this file.'));
      }
    } else {
      const np = el('div', 'nopv');
      np.innerHTML = icn('file', 32) + '<br>No preview available. Use Download to open it.';
      body.append(np);
    }

    $('pv-meta').textContent = (LABEL[f.type] || 'File') + ' · ' + fmtSize(f.size) + ' · added ' + fmtDate(f.addedAt);
    dlg.showModal();
  }
  $('pv-close').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* =========================================================
     Tabs, search, upload button
     ========================================================= */
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      filter.tab = t.dataset.tab;
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === t));
      render();
    });
  });

  $('q').addEventListener('input', (e) => { filter.q = e.target.value.trim(); render(); });

  $('upload-btn').onclick = () => $('file-input').click();
  $('file-input').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };

  /* Init */
  render();
})();