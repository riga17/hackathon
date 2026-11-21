(function () {
  'use strict';
  const KEY = 'priorityAttachments.v1', P = window.Priority;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const icn = (name, size) => (window.PriorityIcon ? PriorityIcon(name, size) : '');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const MAX = 3 * 1024 * 1024; // 3 MB per file, to keep localStorage safe

  let files = [];
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r)) files = r; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(files)); } catch (e) { P.toast('Storage full. Delete a file to free space.'); } };
  let filter = { q: '', t: 'all' };

  /* ----- Drop-zone icon ----- */
  const dropIco = document.querySelector('.drop-ico');
  if (dropIco) dropIco.innerHTML = icn('paperclip', 40);

  /* ----- Type helpers ----- */
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

  /* ----- Render ----- */
  function render() {
    const grid = $('grid'); grid.textContent = '';
    const q = filter.q.toLowerCase();
    const list = files
      .filter((f) => filter.t === 'all' || f.type === filter.t)
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .sort((a, b) => b.addedAt - a.addedAt);

    if (!list.length) {
      const e = el('div', 'empty-a');
      e.append(el('b', null, files.length ? 'No matching files.' : 'No attachments yet.'),
        el('span', null, files.length ? 'Try a different search or filter.' : 'Drag a file in, or click Upload to add your first one.'));
      grid.append(e);
    }

    list.forEach((f) => {
      const card = el('div', 'file');
      const th = el('div', 'file-thumb');
      const badge = el('span', 'badge', LABEL[f.type] || 'File');
      if (f.type === 'image' && f.data) { const img = el('img'); img.src = f.data; img.alt = f.name; th.append(img); }
      else th.innerHTML = icn(ICON[f.type] || 'folder', 40);
      th.append(badge);

      const name = el('div', 'file-name', f.name);
      const meta = el('div', 'file-meta');
      meta.append(el('span', null, fmtSize(f.size)), el('span', null, fmtDate(f.addedAt)));
      const acts = el('div', 'acts');
      const open = el('button', null, 'Open'); open.type = 'button';
      const del = el('button', 'del', 'Delete'); del.type = 'button';
      open.onclick = (e) => { e.stopPropagation(); openPreview(f); };
      del.onclick = (e) => { e.stopPropagation(); removeFile(f.id); };
      acts.append(open, del);
      card.append(th, name, meta, acts);
      card.onclick = () => openPreview(f);
      grid.append(card);
    });

    $('sub').textContent = files.length ? files.length + ' file' + (files.length === 1 ? '' : 's') + ' stored on this device' : 'Drag a file in or click upload.';
    $('storage').textContent = fmtSize(totalBytes()) + ' used';
  }

  /* ----- Add files ----- */
  function addFiles(fileList) {
    const arr = [...fileList];
    if (!arr.length) return;
    let pending = arr.length, added = 0, skipped = 0;
    arr.forEach((file) => {
      if (file.size > MAX) { skipped++; if (--pending === 0) finish(); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        files.push({
          id: uid(),
          name: file.name,
          size: file.size,
          mime: file.type,
          type: typeOf(file.type, file.name),
          data,
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
      if (skipped) P.toast(skipped + ' file' + (skipped === 1 ? ' was' : 's were') + ' too large (max 3 MB each).');
    }
  }

  /* ----- Remove ----- */
  function removeFile(id) {
    const i = files.findIndex((f) => f.id === id);
    if (i < 0) return;
    if (!confirm('Delete this file? This cannot be undone.')) return;
    files.splice(i, 1); save(); render(); $('preview').close();
    P.toast('File deleted.');
  }

  /* ----- Preview ----- */
  const dlg = $('preview');
  function openPreview(f) {
    $('pv-name').textContent = f.name;
    const body = $('pv-body'); body.textContent = '';
    let node = null;
    if (f.type === 'image') { node = el('img'); node.src = f.data; node.alt = f.name; }
    else if (f.type === 'audio') { node = el('audio'); node.controls = true; node.src = f.data; }
    else if (f.type === 'video') { node = el('video'); node.controls = true; node.src = f.data; }
    else if (f.type === 'pdf') { node = el('iframe'); node.src = f.data; node.title = f.name; }
    else if (f.type === 'text') {
      node = el('pre', null, 'Loading…'); body.append(node);
      try {
        const b64 = f.data.split(',')[1] || '';
        const bin = atob(b64); const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const text = new TextDecoder().decode(bytes);
        node.textContent = text.slice(0, 20000) + (text.length > 20000 ? '\n\n… truncated for preview' : '');
      } catch (e) { node.textContent = 'Could not read this file.'; }
      node = null;
    }
    if (node) body.append(node);
    else if (f.type !== 'text') {
      const np = el('div', 'nopv');
      np.innerHTML = icn('file', 32) + '<br>No preview available. Use Download to open it.';
      body.append(np);
    }
    $('pv-meta').textContent = (LABEL[f.type] || 'File') + ' · ' + fmtSize(f.size) + ' · added ' + fmtDate(f.addedAt);
    const dl = $('pv-dl'); dl.href = f.data; dl.download = f.name;
    $('pv-del').onclick = () => removeFile(f.id);
    dlg.showModal();
  }
  $('pv-close').onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* ----- Upload controls ----- */
  $('upload-btn').onclick = () => $('file-input').click();
  $('file-input').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };

  const drop = $('drop');
  drop.onclick = () => $('file-input').click();
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  // Prevent the browser from opening files dropped elsewhere on the page
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => { if (!e.target.closest('#drop')) e.preventDefault(); });

  /* ----- Search / filter ----- */
  $('q').addEventListener('input', (e) => { filter.q = e.target.value.trim(); render(); });
  document.querySelector('.chips').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    filter.t = c.dataset.t;
    document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c));
    render();
  });

  render();
})();