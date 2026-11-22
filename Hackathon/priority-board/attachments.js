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

  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.innerHTML = icn('grid', 20);

  const scanIcon = $('scanner-icon');
  if (scanIcon) scanIcon.innerHTML = icn('image', 32);

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
     Grid
     ========================================================= */
  function render() {
    const grid = $('grid'); grid.textContent = '';
    const q = filter.q.toLowerCase();
    const list = files
      .filter((f) => {
        if (filter.tab === 'scans') return f.scanned;
        if (filter.tab === 'files') return !f.scanned;
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
      card.tabIndex = 0; card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Open ' + f.name);
      const th = el('div', 'file-thumb');

      if (f.data && (f.type === 'image' || f.scanned)) {
        const img = el('img'); img.src = f.data; img.alt = f.name; th.append(img);
      } else {
        th.innerHTML = icn(ICON[f.type] || 'folder', 40);
      }

      if (f.scanned) th.append(el('span', 'badge badge-scan', 'Scanned'));
      th.append(el('span', 'badge', LABEL[f.type] || 'File'));

      card.append(th);
      card.append(el('div', 'file-name', f.name));

      if (isScanned(f)) {
        card.append(el('div', 'file-scan-preview', f.text.slice(0, 140) + (f.text.length > 140 ? '…' : '')));
      }

      const meta = el('div', 'file-meta');
      meta.append(el('span', null, fmtSize(f.size)), el('span', null, fmtDate(f.addedAt)));
      card.append(meta);

      const acts = el('div', 'acts');
      const open = el('button', null, 'Open'); open.type = 'button';
      const del = el('button', 'del', 'Delete'); del.type = 'button';
      open.onclick = (e) => { e.stopPropagation(); openViewer(f); };
      del.onclick = (e) => { e.stopPropagation(); removeFile(f.id); };
      acts.append(open, del);
      card.append(acts);

      card.onclick = () => openViewer(f);
      card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(f); } };
      grid.append(card);
    });

    const scans = files.filter((f) => f.scanned).length;
    $('sub').textContent = files.length
      ? scans + ' scanned · ' + (files.length - scans) + ' files · stored on this device'
      : 'Scan notes, receipts, or anything with text.';
    $('storage').textContent = fmtSize(totalBytes()) + ' used';
  }

  /* =========================================================
     Viewer (opens inside the app)
     ========================================================= */
  const viewer = $('viewer');
  let viewId = null, viewUrl = null, noteText = '', textTimer = null;

  const findFile = (id) => files.find((f) => f.id === id);
  function revokeView() { if (viewUrl) { URL.revokeObjectURL(viewUrl); viewUrl = null; } }

  function extFor(f) {
    const sub = ((f.mime || '').split('/')[1] || '').split('+')[0];
    return sub && !/\.\w{2,4}$/.test(f.name) ? '.' + (sub === 'jpeg' ? 'jpg' : sub) : '';
  }

  async function openViewer(f) {
    viewId = f.id;
    revokeView();
    $('v-title').textContent = f.name;
    $('v-meta').textContent = (f.scanned ? 'Scanned note' : (LABEL[f.type] || 'File')) + ' · ' + fmtSize(f.size) + ' · ' + fmtDate(f.addedAt);
    $('v-saved').textContent = '';

    const stage = $('v-stage'); stage.textContent = '';
    const side = $('v-side'), body = $('v-body');
    const isImage = f.scanned || (f.mime || '').startsWith('image/') || f.type === 'image';

    // Turn the stored data into a blob so PDFs and media open reliably
    let src = f.data;
    try { const blob = await (await fetch(f.data)).blob(); viewUrl = URL.createObjectURL(blob); src = viewUrl; } catch (e) {}

    let hasText = false;
    noteText = '';

    if (isImage) {
      const img = el('img'); img.src = src; img.alt = f.name; stage.append(img);
    } else if (f.type === 'pdf') {
      const fr = el('iframe'); fr.src = src; fr.title = f.name; stage.append(fr);
    } else if (f.type === 'audio') {
      const a = el('audio'); a.controls = true; a.src = src; stage.append(a);
    } else if (f.type === 'video') {
      const v = el('video'); v.controls = true; v.src = src; stage.append(v);
    } else if (f.type === 'text') {
      let t = '';
      try { t = await (await fetch(f.data)).text(); } catch (e) {}
      stage.append(el('pre', 'v-pre', t || 'This file is empty.'));
      noteText = t; hasText = !!t;
    } else {
      const box = el('div', 'v-other');
      box.innerHTML = icn('folder', 56);
      box.append(el('p', null, 'This file type can\'t be previewed. Use Download to open it.'));
      stage.append(box);
    }

    // Extracted text panel (scans only)
    if (f.scanned) {
      side.hidden = false; body.classList.remove('no-side');
      $('v-text').value = f.text || '';
      noteText = f.text || '';
      hasText = !!(f.text && f.text.trim());
    } else {
      side.hidden = true; body.classList.add('no-side');
    }

    $('v-copy').hidden = !hasText;
    $('v-note').hidden = !hasText;
    if (!viewer.open) viewer.showModal();
  }

  function closeViewer() {
    if (viewer.open) viewer.close();
  }
  viewer.addEventListener('close', () => {
    revokeView();
    $('v-stage').textContent = '';
    viewId = null;
    clearTimeout(textTimer);
  });
  viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });
  $('v-close').onclick = closeViewer;

  // Fix OCR mistakes: the text saves as you type
  $('v-text').addEventListener('input', () => {
    const f = findFile(viewId); if (!f) return;
    f.text = $('v-text').value;
    noteText = f.text;
    $('v-copy').hidden = $('v-note').hidden = !f.text.trim();
    $('v-saved').textContent = 'Saving…';
    clearTimeout(textTimer);
    textTimer = setTimeout(() => { save(); $('v-saved').textContent = 'Saved'; render(); }, 400);
  });

  $('v-copy').onclick = () => {
    const t = $('v-side').hidden ? noteText : $('v-text').value;
    if (!t.trim()) return;
    navigator.clipboard.writeText(t).then(() => P.toast('Text copied.'), () => P.toast('Could not copy.'));
  };

  $('v-note').onclick = () => {
    const f = findFile(viewId); if (!f) return;
    const text = ($('v-side').hidden ? noteText : $('v-text').value).trim();
    if (!text) return;
    const NK = 'priority.notes'; // same storage as the Notes page
    let notes = [];
    try { const r = JSON.parse(localStorage.getItem(NK)); if (Array.isArray(r)) notes = r; } catch (e) {}
    const now = Date.now();
    notes.unshift({ id: uid(), title: f.name.slice(0, 100), body: text, hue: null, pinned: false, created: now, updated: now });
    try { localStorage.setItem(NK, JSON.stringify(notes)); P.toast('Saved to Notes.'); }
    catch (e) { P.toast('Could not save. Storage is full.'); }
  };

  $('v-dl').onclick = () => {
    const f = findFile(viewId); if (!f) return;
    const a = el('a'); a.href = f.data; a.download = f.name + extFor(f);
    document.body.append(a); a.click(); a.remove();
  };

  $('v-del').onclick = () => {
    const f = findFile(viewId); if (!f) return;
    if (!confirm('Delete "' + f.name + '"? This cannot be undone.')) return;
    closeViewer();
    files = files.filter((x) => x.id !== f.id); save(); render();
    P.toast('File deleted.');
  };

  /* =========================================================
     Adding files
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
      filter.tab = 'files';
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === 'files'));
      render();
      if (added) {
        P.toast('Added ' + added + ' file' + (added === 1 ? '' : 's') + '.');
        if (window.PriorityAchievements) PriorityAchievements.mark('fileUploaded');
      }
      if (skipped) P.toast(skipped + ' file' + (skipped === 1 ? ' was' : 's were') + ' too large (max 4 MB).');
    }
  }

  /* =========================================================
     Scanning
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
      P.toast('That is not an image. Use Upload other file for other types.');
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

        const rec = {
          id: uid(),
          name,
          size: file.size,
          mime: file.type,
          type: 'text',
          data: dataUrl,
          scanned: true,
          text,
          addedAt: Date.now()
        };
        files.push(rec);
        save();

        setProgress(100, 'Done.');
        setTimeout(() => setProgress(null), 600);
        zone.classList.remove('scanning');

        filter.tab = 'scans';
        document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === 'scans'));
        render();
        if (window.PriorityAchievements) PriorityAchievements.mark('fileUploaded');

        P.toast(text
          ? 'Scan complete. ' + text.length + ' characters extracted.'
          : 'Photo saved, but no text was found.');

        // Open the result right here in the app
        openViewer(rec);
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

  function removeFile(id) {
    const i = files.findIndex((f) => f.id === id);
    if (i < 0) return;
    if (!confirm('Delete this file? This cannot be undone.')) return;
    files.splice(i, 1); save(); render();
    P.toast('File deleted.');
  }

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

  render();
})();