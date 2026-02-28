/* ===================================================
   IJODIY PORTFOLIO — app.js
   GitHub Pages uchun tayyor (localStorage ishlatadi)
=================================================== */

'use strict';

// ─── STATE ───────────────────────────────────────
let currentUser  = null;
let pendingFile  = null;
let pendingUrl   = null;
let activeFilter = 'all';

// ─── STORAGE HELPERS ─────────────────────────────
function sKey() { return 'portfolio__' + currentUser; }

function getWorks() {
  try { return JSON.parse(localStorage.getItem(sKey()) || '[]'); }
  catch { return []; }
}

function saveWorks(list) {
  localStorage.setItem(sKey(), JSON.stringify(list));
}

// ─── PAGE SWITCHING ───────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });
  const pg = document.getElementById(id);
  pg.style.display = 'block';
  pg.classList.add('active');
}

// ─── LOGIN ────────────────────────────────────────
function doLogin() {
  const u = document.getElementById('inp-user').value.trim();
  const p = document.getElementById('inp-pass').value;

  if (!u) { toast('⚠ Iltimos, foydalanuvchi nomini kiriting'); return; }

  currentUser = u;
  document.getElementById('admin-username').textContent = u;
  updateShareUrl();
  renderAdminGrid();
  showPage('page-admin');
  toast('✦ Xush kelibsiz, ' + u + '!');
}

function doLogout() {
  currentUser = null;
  pendingFile = null;
  pendingUrl  = null;
  document.getElementById('inp-user').value = '';
  document.getElementById('inp-pass').value = '';
  showPage('page-login');
}

function guestView() {
  currentUser = '_guest';
  openPublic(false);
}

// ─── SHARE URL ────────────────────────────────────
function updateShareUrl() {
  const base = window.location.href.split('?')[0].split('#')[0];
  const url  = base + '?u=' + encodeURIComponent(currentUser);
  const box  = document.getElementById('share-url-box');
  document.getElementById('share-url-text').textContent = url;
  box.dataset.url = url;
}

function copyShareLink() {
  const url = document.getElementById('share-url-box').dataset.url || window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => toast('🔗 Havola nusxalandi!'))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text; el.style.position = 'fixed'; el.style.opacity = '0';
  document.body.appendChild(el); el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  toast('🔗 Havola nusxalandi!');
}

// ─── ADMIN TABS ───────────────────────────────────
function adminTab(tab) {
  document.getElementById('tab-upload').style.display = tab === 'upload' ? '' : 'none';
  document.getElementById('tab-works').style.display  = tab === 'works'  ? '' : 'none';

  document.getElementById('btn-tab-upload').classList.toggle('active', tab === 'upload');
  document.getElementById('btn-tab-works').classList.toggle('active',  tab === 'works');

  if (tab === 'works') renderAdminGrid();
}

// ─── FILE HANDLING ────────────────────────────────
const dz = document.getElementById('drop-zone');
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('over'));
dz.addEventListener('drop', e => {
  e.preventDefault(); dz.classList.remove('over');
  const f = e.dataTransfer.files[0];
  if (f) loadFile(f);
});

function onFileSelect(e) {
  const f = e.target.files[0];
  if (f) loadFile(f);
}

function loadFile(file) {
  pendingFile = file;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingUrl = ev.target.result;
    // Auto-fill title & category
    document.getElementById('f-title').value = file.name.replace(/\.[^/.]+$/, '');
    const ext = file.name.split('.').pop().toLowerCase();
    const sel = document.getElementById('f-cat');
    if (['jpg','jpeg','png','gif','webp','svg','avif'].includes(ext)) sel.value = 'Rasm';
    else if (['mp3','wav','ogg','m4a','flac'].includes(ext))           sel.value = 'Musiqa';
    else if (['mp4','mov','avi','webm','mkv'].includes(ext))           sel.value = 'Video';
    else if (['pdf'].includes(ext))                                    sel.value = 'Maqola';
    document.getElementById('meta-panel').classList.add('visible');
    toast('📎 Fayl tayyor! Ma\'lumot to\'ldiring.');
  };
  reader.readAsDataURL(file);
}

function publishWork() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { toast('⚠ Asar nomini kiriting'); return; }

  const work = {
    id:       Date.now(),
    title,
    category: document.getElementById('f-cat').value,
    desc:     document.getElementById('f-desc').value.trim(),
    fileUrl:  pendingUrl,
    fileName: pendingFile ? pendingFile.name : '',
    fileType: pendingFile ? pendingFile.type : '',
    date:     new Date().toLocaleDateString('uz-UZ')
  };

  const list = getWorks();
  list.unshift(work);
  saveWorks(list);

  // Reset form
  pendingFile = null; pendingUrl = null;
  document.getElementById('meta-panel').classList.remove('visible');
  document.getElementById('f-title').value = '';
  document.getElementById('f-desc').value  = '';
  document.getElementById('file-inp').value = '';

  renderAdminGrid();
  toast('✦ Asar muvaffaqiyatli joylashtirildi!');
}

// ─── ADMIN GRID ───────────────────────────────────
function renderAdminGrid() {
  const list = getWorks();
  const grid = document.getElementById('admin-grid');

  if (!list.length) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:8px 0">Hali hech narsa joylashtirilmagan.</p>';
    return;
  }

  grid.innerHTML = list.map(w => `
    <div class="work-card">
      <div class="work-thumb">${thumbHTML(w)}</div>
      <div class="work-body">
        <div class="work-cat">${w.category}</div>
        <div class="work-title">${esc(w.title)}</div>
        <div class="work-desc">${esc(w.desc || 'Tavsif yo\'q')}</div>
      </div>
      <div class="work-actions">
        <button class="btn-sm" onclick="openModal(${w.id})">Ko'rish</button>
        <button class="btn-sm del" onclick="deleteWork(${w.id})">O'chirish</button>
      </div>
    </div>
  `).join('');
}

function deleteWork(id) {
  const list = getWorks().filter(w => w.id !== id);
  saveWorks(list);
  renderAdminGrid();
  toast('🗑 Asar o\'chirildi');
}

// ─── PUBLIC VIEW ──────────────────────────────────
function openPublic(fromAdmin) {
  document.getElementById('btn-back').style.display = fromAdmin ? '' : 'none';
  const name = currentUser && currentUser !== '_guest' ? currentUser : 'Portfolio';
  document.getElementById('pub-name').textContent = name;
  activeFilter = 'all';
  renderPublic();
  showPage('page-public');
}

function goBack() {
  if (currentUser && currentUser !== '_guest') showPage('page-admin');
  else showPage('page-login');
}

function renderPublic() {
  const list = getWorks();

  // Build filter pills
  const cats = ['Barchasi', ...new Set(list.map(w => w.category))];
  document.getElementById('pub-filters').innerHTML = cats.map(c => {
    const val = c === 'Barchasi' ? 'all' : c;
    return `<button class="filter-pill ${val === activeFilter ? 'active' : ''}"
      onclick="setFilter('${val}', this)">${c}</button>`;
  }).join('');

  // Filter works
  const shown = activeFilter === 'all' ? list : list.filter(w => w.category === activeFilter);
  const grid  = document.getElementById('pub-grid');

  if (!shown.length) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🎨</div>
        <h3>Hali asar yo'q</h3>
        <p style="font-size:13px">Birinchi asarni joylashtirish uchun kirish kerak</p>
      </div>`;
    return;
  }

  grid.innerHTML = shown.map(w => `
    <div class="pub-card" onclick="openModal(${w.id})">
      <div class="pub-thumb">${thumbHTML(w)}</div>
      <div class="pub-card-body">
        <div class="pub-card-cat">${w.category}</div>
        <div class="pub-card-title">${esc(w.title)}</div>
        <div class="pub-card-desc">${esc(w.desc || '')}</div>
      </div>
    </div>
  `).join('');
}

function setFilter(val, btn) {
  activeFilter = val;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPublic();
}

// ─── MODAL ────────────────────────────────────────
function openModal(id) {
  const w = getWorks().find(x => x.id === id);
  if (!w) return;

  document.getElementById('m-cat').textContent   = w.category;
  document.getElementById('m-title').textContent = w.title;
  document.getElementById('m-desc').textContent  = w.desc || '';

  const media = document.getElementById('m-media');
  if (w.fileType && w.fileType.startsWith('image/') && w.fileUrl) {
    media.innerHTML = `<img src="${w.fileUrl}" alt="${esc(w.title)}">`;
  } else if (w.fileUrl) {
    media.innerHTML = `<a class="dl-btn" href="${w.fileUrl}" download="${esc(w.fileName)}">
      ⬇ ${esc(w.fileName)} yuklab olish</a>`;
  } else {
    media.innerHTML = '';
  }

  document.getElementById('modal-bg').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
}

// ─── HELPERS ─────────────────────────────────────
const catEmoji = {
  'Maqola':'📄','She\'riyat':'📜','Rasm':'🖼',
  'Fotografiya':'📷','Musiqa':'🎵','Video':'🎬','Boshqa':'✦'
};

function thumbHTML(w) {
  if (w.fileType && w.fileType.startsWith('image/') && w.fileUrl)
    return `<img src="${w.fileUrl}" alt="${esc(w.title)}">`;
  return `<span>${catEmoji[w.category] || '✦'}</span>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── AUTO LOAD FROM URL ───────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const u = params.get('u');
  if (u) {
    currentUser = u;
    document.getElementById('pub-name').textContent = u;
    openPublic(false);
  }
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});