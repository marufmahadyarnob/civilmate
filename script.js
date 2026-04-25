/* ============================================
   CivilMate — script.js
   Global utilities + page-specific functions
   ============================================ */

'use strict';

/* ========== Theme ========== */
const ThemeManager = {
  KEY: 'civilmate_theme',
  init() {
    const saved = localStorage.getItem(this.KEY) || 'dark';
    this.apply(saved);
  },
  toggle() {
    const current = document.body.classList.contains('light') ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    localStorage.setItem(this.KEY, next);
  },
  apply(theme) {
    document.body.classList.toggle('light', theme === 'light');
    document.querySelectorAll('#theme-toggle, #theme-toggle-mob').forEach(btn => {
      if (!btn) return;
      btn.querySelector('i').className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      btn.title = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    });
  }
};

/* ========== Page Loader ========== */
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 800);
  });
}

/* ========== Nav Active State ========== */
function initNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
}

/* ========== Toast ========== */
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' error' : ''}`;
  toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}" style="color:var(--${type==='error'?'red':'green'})"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 320);
  }, 3000);
}

/* ========== Global Init ========== */
function globalInit() {
  ThemeManager.init();
  initLoader();
  initNav();
  document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
  document.getElementById('theme-toggle-mob')?.addEventListener('click', () => ThemeManager.toggle());
}

/* ================================================
   CONCRETE CALCULATOR
   ================================================ */
function calcConcrete() {
  const L = parseFloat(document.getElementById('c-length').value);
  const W = parseFloat(document.getElementById('c-width').value);
  const T = parseFloat(document.getElementById('c-thickness').value);
  const unit = document.getElementById('c-unit').value;
  const res = document.getElementById('concrete-result');

  if (isNaN(L) || isNaN(W) || isNaN(T) || L <= 0 || W <= 0 || T <= 0) {
    showToast('Please enter valid positive values.', 'error'); return;
  }

  let vol = L * W * T; // in chosen unit cubed
  let volM3 = vol;
  if (unit === 'ft') volM3 = vol * 0.0283168; // ft³ → m³
  if (unit === 'in') volM3 = vol * 0.000016387; // in³ → m³

  // Mix ratio 1:2:4, dry volume ≈ 1.5 × wet volume
  const dryVol = volM3 * 1.5;
  const ratio   = 1 + 2 + 4; // = 5.5
  const cementBags  = (dryVol / ratio) * 1440 / 50; // bags of 50kg
  const sandM3      = (1.5 / ratio) * dryVol;
  const aggregateM3 = (3   / ratio) * dryVol;
  const cementKg    = cementBags * 50;

  document.getElementById('r-vol-m3').textContent    = volM3.toFixed(3);
  document.getElementById('r-vol-ft3').textContent   = (volM3 * 35.3147).toFixed(3);
  document.getElementById('r-cement-bags').textContent = cementBags.toFixed(2);
  document.getElementById('r-cement-kg').textContent   = cementKg.toFixed(2);
  document.getElementById('r-sand').textContent        = sandM3.toFixed(3);
  document.getElementById('r-agg').textContent         = aggregateM3.toFixed(3);

  res.classList.add('show');
  showToast('Concrete calculated successfully!');
}

function resetConcrete() {
  ['c-length','c-width','c-thickness'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('concrete-result').classList.remove('show');
}

/* ================================================
   BRICK CALCULATOR
   ================================================ */
function calcBrick() {
  const area   = parseFloat(document.getElementById('b-area').value);
  const thick  = parseFloat(document.getElementById('b-wall-thick').value);
  const size   = document.getElementById('b-size').value;
  const res    = document.getElementById('brick-result');

  if (isNaN(area) || isNaN(thick) || area <= 0 || thick <= 0) {
    showToast('Please enter valid values.', 'error'); return;
  }

  // Brick dimensions (standard sizes in mm)
  const brickSizes = {
    standard: { l: 190, w: 90, h: 90 },
    modular:  { l: 200, w: 100, h: 100 },
    queen:    { l: 194, w: 95, h: 70 },
    king:     { l: 257, w: 121, h: 70 }
  };
  const b = brickSizes[size];
  const mortarThick = 10; // mm

  // Volume of one brick with mortar (m³)
  const brickVolMortar = ((b.l + mortarThick) * (b.h + mortarThick) * (thick * 1000)) / 1e9;

  // Wall volume in m³
  const wallVolM3 = area * (thick);
  const numBricks = Math.ceil(wallVolM3 / brickVolMortar);

  // Mortar volume ≈ 30% of wall volume
  const mortarVol = wallVolM3 * 0.30;
  const dryMortar = mortarVol * 1.33;
  // Ratio 1:6 (cement:sand)
  const cementVol  = dryMortar / 7;
  const cementBags = Math.ceil((cementVol * 1440) / 50);
  const sandVol    = dryMortar * (6 / 7);

  document.getElementById('r-bricks').textContent       = numBricks.toLocaleString();
  document.getElementById('r-wall-vol').textContent     = wallVolM3.toFixed(3);
  document.getElementById('r-mortar-vol').textContent   = mortarVol.toFixed(3);
  document.getElementById('r-b-cement-bags').textContent = cementBags;
  document.getElementById('r-b-cement-kg').textContent   = (cementBags * 50).toFixed(0);
  document.getElementById('r-b-sand').textContent        = sandVol.toFixed(3);

  res.classList.add('show');
  showToast('Brick calculation done!');
}

function resetBrick() {
  ['b-area','b-wall-thick'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('brick-result').classList.remove('show');
}

/* ================================================
   UNIT CONVERTER
   ================================================ */
const converterDefs = {
  length:   { label: 'Length',   a: 'm',  b: 'ft',  factor: 3.28084,         dec: 5 },
  weight:   { label: 'Weight',   a: 'kN', b: 'kg',  factor: 101.971621,      dec: 4 },
  volume:   { label: 'Volume',   a: 'm³', b: 'ft³', factor: 35.3147,         dec: 5 },
  area:     { label: 'Area',     a: 'm²', b: 'ft²', factor: 10.7639,         dec: 5 },
  pressure: { label: 'Pressure', a: 'kPa',b: 'psi', factor: 0.14503773,      dec: 5 },
  temp:     { label: 'Temp',     a: '°C', b: '°F',  factor: null,            dec: 2 },
};

function doConvert(type, dir) {
  const def    = converterDefs[type];
  const fromId = `${type}-${dir === 'ab' ? 'a' : 'b'}`;
  const toId   = `${type}-${dir === 'ab' ? 'b' : 'a'}`;
  const val    = parseFloat(document.getElementById(fromId).value);
  if (isNaN(val)) return;
  let result;
  if (type === 'temp') {
    result = dir === 'ab' ? (val * 9/5) + 32 : (val - 32) * 5/9;
  } else {
    result = dir === 'ab' ? val * def.factor : val / def.factor;
  }
  document.getElementById(toId).value = result.toFixed(def.dec);
}

function clearConverter(type) {
  document.getElementById(`${type}-a`).value = '';
  document.getElementById(`${type}-b`).value = '';
}

/* ================================================
   SOIL CALCULATOR
   ================================================ */
function calcSoil() {
  const Gs  = parseFloat(document.getElementById('s-gs').value);
  const e   = parseFloat(document.getElementById('s-e').value);
  const w   = parseFloat(document.getElementById('s-w').value);
  const res = document.getElementById('soil-result');

  if ([Gs, e, w].some(v => isNaN(v) || v < 0)) {
    showToast('Please enter valid values.', 'error'); return;
  }

  const gammaW = 9.81; // kN/m³
  const S  = (Gs * w / e);                             // degree of saturation
  const n  = e / (1 + e);                              // porosity
  const yd = (Gs * gammaW) / (1 + e);                  // dry unit weight kN/m³
  const ysat= ((Gs + e) * gammaW) / (1 + e);           // saturated unit weight kN/m³
  const ysub= ysat - gammaW;                            // submerged
  const yb  = (Gs * gammaW * (1 + w)) / (1 + e);       // bulk unit weight

  document.getElementById('r-s-e').textContent    = e.toFixed(4);
  document.getElementById('r-s-n').textContent    = (n * 100).toFixed(2) + '%';
  document.getElementById('r-s-s').textContent    = Math.min(S, 1).toFixed(4);
  document.getElementById('r-s-yd').textContent   = yd.toFixed(3);
  document.getElementById('r-s-ysat').textContent = ysat.toFixed(3);
  document.getElementById('r-s-ysub').textContent = ysub.toFixed(3);
  document.getElementById('r-s-yb').textContent   = yb.toFixed(3);

  res.classList.add('show');
  showToast('Soil parameters calculated!');
}

function resetSoil() {
  ['s-gs','s-e','s-w'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('soil-result').classList.remove('show');
}

/* ================================================
   COST ESTIMATOR
   ================================================ */
let costItems = JSON.parse(localStorage.getItem('civilmate_cost_items') || '[]');

function renderCostTable() {
  const tbody = document.getElementById('cost-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  let total = 0;
  costItems.forEach((item, i) => {
    const cost = item.qty * item.rate;
    total += cost;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.desc}</td>
      <td>${item.qty.toLocaleString()}</td>
      <td>${item.unit}</td>
      <td>₹${item.rate.toLocaleString()}</td>
      <td><strong>₹${cost.toLocaleString(undefined,{minimumFractionDigits:2})}</strong></td>
      <td><button class="btn btn-danger btn-sm" onclick="removeCostItem(${i})"><i class="fas fa-trash"></i></button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('cost-total').textContent = '₹' + total.toLocaleString(undefined,{minimumFractionDigits:2});
  document.getElementById('cost-count').textContent = costItems.length;
  localStorage.setItem('civilmate_cost_items', JSON.stringify(costItems));
}

function addCostItem() {
  const desc = document.getElementById('cost-desc').value.trim();
  const qty  = parseFloat(document.getElementById('cost-qty').value);
  const unit = document.getElementById('cost-unit').value.trim() || 'nos';
  const rate = parseFloat(document.getElementById('cost-rate').value);
  if (!desc || isNaN(qty) || isNaN(rate) || qty <= 0 || rate <= 0) {
    showToast('Fill all fields correctly.', 'error'); return;
  }
  costItems.push({ desc, qty, unit, rate });
  ['cost-desc','cost-qty','cost-unit','cost-rate'].forEach(id => document.getElementById(id).value = '');
  renderCostTable();
  showToast('Item added!');
}

function removeCostItem(i) {
  costItems.splice(i, 1);
  renderCostTable();
  showToast('Item removed.');
}

function clearAllCost() {
  if (!confirm('Clear all items?')) return;
  costItems = [];
  renderCostTable();
}

/* ================================================
   PROJECT PLANNER (localStorage)
   ================================================ */
let tasks = JSON.parse(localStorage.getItem('civilmate_tasks') || '[]');

function saveTasks() { localStorage.setItem('civilmate_tasks', JSON.stringify(tasks)); }

function renderTasks() {
  const list = document.getElementById('task-list');
  if (!list) return;
  list.innerHTML = '';
  const filter = document.querySelector('.task-filter-btn.active')?.dataset.filter || 'all';
  const toShow = tasks.filter(t =>
    filter === 'all' || (filter === 'done' && t.done) || (filter === 'pending' && !t.done)
  );
  if (!toShow.length) {
    list.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px 0;">No tasks here.</p>';
    return;
  }
  toShow.forEach(t => {
    const div = document.createElement('div');
    div.className = `task-item${t.done ? ' done' : ''}`;
    div.innerHTML = `
      <div class="task-checkbox" onclick="toggleTask(${t.id})">
        ${t.done ? '<i class="fas fa-check" style="font-size:.7rem"></i>' : ''}
      </div>
      <span class="task-text">${escHtml(t.text)}</span>
      <span class="text-muted" style="font-size:.75rem;white-space:nowrap">${t.date}</span>
      <button class="task-del btn-icon" style="width:28px;height:28px;font-size:.8rem" onclick="deleteTask(${t.id})">
        <i class="fas fa-trash"></i>
      </button>`;
    list.appendChild(div);
  });
  updateTaskStats();
}

function addTask() {
  const inp = document.getElementById('task-input');
  const text = inp?.value.trim();
  if (!text) { showToast('Enter a task.', 'error'); return; }
  tasks.push({ id: Date.now(), text, done: false, date: new Date().toLocaleDateString() });
  inp.value = '';
  saveTasks(); renderTasks();
  showToast('Task added!');
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(x => x.id !== id);
  saveTasks(); renderTasks();
  showToast('Task deleted.');
}

function clearDoneTasks() {
  tasks = tasks.filter(x => !x.done);
  saveTasks(); renderTasks();
  showToast('Completed tasks cleared.');
}

function updateTaskStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;
  const el = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
  el('task-total',   total);
  el('task-done',    done);
  el('task-pending', pending);
  const bar = document.getElementById('task-progress-bar');
  if (bar) bar.style.width = total ? `${(done/total*100).toFixed(0)}%` : '0%';
}

function initTaskFilter() {
  document.querySelectorAll('.task-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.task-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks();
    });
  });
  document.getElementById('task-input')?.addEventListener('keypress', e => { if(e.key==='Enter') addTask(); });
}

/* ================================================
   IMAGE NOTES (localStorage — base64)
   ================================================ */
let imgNotes = JSON.parse(localStorage.getItem('civilmate_img_notes') || '[]');

function saveImgNotes() { localStorage.setItem('civilmate_img_notes', JSON.stringify(imgNotes)); }

function renderImgNotes() {
  const grid = document.getElementById('img-note-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!imgNotes.length) {
    grid.innerHTML = '<p class="text-muted" style="padding:20px 0">No image notes yet. Upload one above!</p>';
    return;
  }
  imgNotes.forEach((note, i) => {
    const div = document.createElement('div');
    div.className = 'img-note-card';
    div.innerHTML = `
      <img src="${note.src}" alt="note image" loading="lazy">
      <div class="img-note-body">
        <p class="img-note-text">${escHtml(note.text)}</p>
        <div class="img-note-actions">
          <button class="btn btn-danger btn-sm" onclick="deleteImgNote(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

function addImgNote() {
  const file = document.getElementById('img-upload').files[0];
  const text = document.getElementById('img-note-text').value.trim();
  if (!file) { showToast('Select an image.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    imgNotes.push({ src: e.target.result, text: text || 'No note.' });
    saveImgNotes(); renderImgNotes();
    document.getElementById('img-upload').value = '';
    document.getElementById('img-note-text').value = '';
    showToast('Image note saved!');
  };
  reader.readAsDataURL(file);
}

function deleteImgNote(i) {
  imgNotes.splice(i, 1);
  saveImgNotes(); renderImgNotes();
  showToast('Deleted.');
}

/* ================================================
   MCQ ENGINE
   ================================================ */
const mcqData = [
  { q: "What is the water-cement ratio recommended for normal concrete?", opts: ["0.35–0.45", "0.45–0.60", "0.60–0.75", "0.75–0.90"], ans: 1, exp: "A W/C ratio of 0.45–0.60 is typical for normal concrete, balancing workability and strength." },
  { q: "Standard size of a modular brick (in mm) is:", opts: ["190×90×90", "200×100×100", "230×110×75", "250×125×75"], ans: 1, exp: "A modular brick is 200×100×100 mm including mortar; the actual size is 190×90×90 mm." },
  { q: "The specific gravity of ordinary Portland cement is approximately:", opts: ["2.10", "2.65", "3.15", "3.50"], ans: 2, exp: "OPC has a specific gravity of about 3.15, determined by Le Chatelier's flask method." },
  { q: "Which test is used to determine the consistency of cement?", opts: ["Soundness test", "Vicat apparatus test", "Setting time test", "Tensile strength test"], ans: 1, exp: "The Vicat apparatus test measures the standard consistency (normal consistency) of cement paste." },
  { q: "The void ratio 'e' is defined as:", opts: ["Vv / Vs", "Vv / V", "Vs / V", "Vv / Vw"], ans: 0, exp: "Void ratio e = Volume of voids / Volume of solids. Porosity n = Vv / V (total volume)." },
  { q: "Maximum size of aggregate used in RCC work is generally:", opts: ["6 mm", "10 mm", "20 mm", "40 mm"], ans: 2, exp: "20 mm maximum aggregate size is standard for RCC to allow proper compaction and reinforcement coverage." },
  { q: "The unit weight of plain concrete is approximately:", opts: ["18 kN/m³", "20 kN/m³", "24 kN/m³", "28 kN/m³"], ans: 2, exp: "Plain concrete has a unit weight of approximately 24 kN/m³ (≈ 2400 kg/m³)." },
  { q: "Slump test is used to measure:", opts: ["Strength of concrete", "Workability of concrete", "Durability of concrete", "Water absorption"], ans: 1, exp: "The slump test measures workability/consistency of fresh concrete." },
  { q: "Bearing capacity of soil is determined by which formula?", opts: ["Darcy's law", "Terzaghi's formula", "Bernoulli's equation", "Boussinesq's theory"], ans: 1, exp: "Terzaghi's bearing capacity formula is the most widely used: qu = c·Nc + q·Nq + 0.5·γ·B·Nγ." },
  { q: "Which of the following is NOT a property of a good building stone?", opts: ["High porosity", "High compressive strength", "Durability", "Resistance to fire"], ans: 0, exp: "High porosity is undesirable — it reduces strength and durability. A good stone should have low porosity." },
  { q: "According to IS 456, clear cover for slab is:", opts: ["15 mm", "20 mm", "25 mm", "40 mm"], ans: 0, exp: "IS 456:2000 specifies 15 mm clear cover for slabs (mild exposure conditions)." },
  { q: "The process of hardening of cement after initial set is called:", opts: ["Hydration", "Carbonation", "Setting", "Curing"], ans: 0, exp: "Hydration is the chemical reaction between cement and water that causes setting and hardening." },
  { q: "Which soil has the highest capillary rise?", opts: ["Gravel", "Coarse sand", "Fine sand", "Clay"], ans: 3, exp: "Clay, due to its very fine particle size and large surface area, has the highest capillary rise." },
  { q: "Fineness modulus of fine aggregate should be between:", opts: ["1.0 – 2.0", "2.0 – 3.5", "3.5 – 5.0", "5.0 – 6.5"], ans: 1, exp: "FM of fine aggregate (sand) should lie between 2.0 and 3.5 as per IS 383." },
  { q: "Workability of concrete increases with:", opts: ["Decrease in W/C ratio", "Decrease in aggregate size", "Increase in W/C ratio", "Increase in cement content"], ans: 2, exp: "More water (higher W/C ratio) increases workability but reduces strength — a key trade-off in mix design." },
  { q: "The modulus of elasticity of steel is approximately:", opts: ["100 GPa", "150 GPa", "200 GPa", "250 GPa"], ans: 2, exp: "Young's modulus of structural steel is approximately 200 GPa (2×10⁵ N/mm²)." },
  { q: "Darcy's law for seepage through soil is: v =", opts: ["k·i", "k/i", "k²·i", "k·i²"], ans: 0, exp: "Darcy's law: v = k·i, where v = seepage velocity, k = coefficient of permeability, i = hydraulic gradient." },
  { q: "Which type of cement is used for mass concrete construction?", opts: ["Rapid hardening cement", "Low heat cement", "Sulphate resisting cement", "White cement"], ans: 1, exp: "Low heat cement is used for mass concrete (dams, foundations) to minimise heat of hydration." },
  { q: "Poisson's ratio for concrete is typically:", opts: ["0.05 – 0.10", "0.15 – 0.20", "0.30 – 0.35", "0.45 – 0.50"], ans: 1, exp: "Concrete has a Poisson's ratio of approximately 0.15–0.20." },
  { q: "Compaction factor test is used for:", opts: ["Very dry mixes", "Stiff mixes", "High workability mixes", "Highly workable mixes"], ans: 1, exp: "Compaction factor test is suitable for low-workability (stiff) mixes where slump test is not reliable." },
];

let mcqState = { current: 0, score: 0, answered: false, order: [] };

function shuffleMCQ() {
  mcqState.order = [...Array(mcqData.length).keys()].sort(() => Math.random() - 0.5);
  mcqState.current = 0; mcqState.score = 0; mcqState.answered = false;
  renderMCQ();
}

function renderMCQ() {
  const container = document.getElementById('mcq-container');
  if (!container) return;
  const idx = mcqState.order[mcqState.current];
  const q   = mcqData[idx];
  const progress = mcqState.current / mcqData.length * 100;

  document.getElementById('mcq-progress-fill').style.width = progress + '%';
  document.getElementById('mcq-score-display').textContent = `${mcqState.score} / ${mcqData.length}`;
  document.getElementById('mcq-num').textContent = `Q${mcqState.current + 1} of ${mcqData.length}`;

  container.innerHTML = `
    <p class="mcq-question">${mcqState.current + 1}. ${q.q}</p>
    <div class="mcq-options">
      ${q.opts.map((o,i) => `
        <div class="mcq-option" data-idx="${i}" onclick="answerMCQ(${i})">
          <div class="mcq-badge">${'ABCD'[i]}</div>
          <span>${o}</span>
        </div>`).join('')}
    </div>
    <div class="mcq-explain" id="mcq-explain">${q.exp}</div>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn btn-secondary" onclick="prevMCQ()" ${mcqState.current===0?'disabled':''}>
        <i class="fas fa-arrow-left"></i> Prev
      </button>
      <button class="btn btn-primary" id="mcq-next-btn" onclick="nextMCQ()" style="margin-left:auto">
        ${mcqState.current===mcqData.length-1?'Finish':'Next <i class="fas fa-arrow-right"></i>'}
      </button>
    </div>`;
  mcqState.answered = false;
}

function answerMCQ(chosen) {
  if (mcqState.answered) return;
  mcqState.answered = true;
  const idx = mcqState.order[mcqState.current];
  const q   = mcqData[idx];
  const opts = document.querySelectorAll('.mcq-option');
  opts.forEach((opt, i) => {
    opt.classList.add('disabled');
    if (i === q.ans) opt.classList.add('correct');
    else if (i === chosen && chosen !== q.ans) opt.classList.add('wrong');
  });
  if (chosen === q.ans) mcqState.score++;
  document.getElementById('mcq-explain').classList.add('show');
  document.getElementById('mcq-score-display').textContent = `${mcqState.score} / ${mcqData.length}`;
}

function nextMCQ() {
  if (mcqState.current < mcqData.length - 1) {
    mcqState.current++;
    renderMCQ();
  } else {
    showMCQResult();
  }
}

function prevMCQ() {
  if (mcqState.current > 0) { mcqState.current--; renderMCQ(); }
}

function showMCQResult() {
  const container = document.getElementById('mcq-container');
  const pct = Math.round(mcqState.score / mcqData.length * 100);
  const grade = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good Job!' : pct >= 40 ? 'Keep Practicing!' : 'Need More Study!';
  container.innerHTML = `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:3.5rem;margin-bottom:10px">${pct>=80?'🏆':pct>=60?'🎯':'📚'}</div>
      <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--accent)">${mcqState.score} / ${mcqData.length}</div>
      <div style="font-size:1.2rem;font-weight:600;margin:8px 0">${grade}</div>
      <div style="color:var(--text-muted);margin-bottom:24px">Score: ${pct}%</div>
      <button class="btn btn-primary" onclick="shuffleMCQ()"><i class="fas fa-redo"></i> Try Again</button>
    </div>`;
  document.getElementById('mcq-progress-fill').style.width = '100%';
}

/* ========== Utilities ========== */
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ========== DOM Ready ========== */
document.addEventListener('DOMContentLoaded', () => {
  globalInit();
  // Page-specific inits
  if (document.getElementById('concrete-result')) {} // concrete page
  if (document.getElementById('brick-result'))    {} // brick page
  if (document.getElementById('cost-tbody'))      { renderCostTable(); }
  if (document.getElementById('task-list'))       { renderTasks(); initTaskFilter(); }
  if (document.getElementById('img-note-grid'))   { renderImgNotes(); }
  if (document.getElementById('mcq-container'))   { shuffleMCQ(); }
  if (document.getElementById('task-input')) {
    document.getElementById('task-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') addTask();
    });
  }
});
