// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────

(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], lines = [];
  const COLORS = ['rgba(0,229,255,', 'rgba(168,85,247,', 'rgba(255,255,255,'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r = Math.random() * 1.5 + 0.3;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.5 + 0.1;
  }

  function init() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });
    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(0,229,255,' + (0.05 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
})();

// ─── 3D TILT EFFECT ──────────────────────────────────────────────────────────

function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.035) translateZ(10px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1) translateZ(0)';
    });
  });
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem('waypoint_users') || '{}'); } catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem('waypoint_users', JSON.stringify(users));
}

function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem('waypoint_session') || 'null'); } catch { return null; }
}

function setCurrentUser(user) {
  sessionStorage.setItem('waypoint_session', JSON.stringify(user));
}

function showAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('active', tab === 'login');
  document.getElementById('registerForm').classList.toggle('active', tab === 'register');
}

function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if (!username || !password) { errEl.textContent = '// FIELDS CANNOT BE EMPTY'; return; }
  const users = getUsers();
  if (!users[username]) { errEl.textContent = '// USERNAME NOT FOUND'; return; }
  if (users[username].password !== btoa(password)) { errEl.textContent = '// INCORRECT PASSWORD'; return; }

  setCurrentUser({ username, name: users[username].name });
  launchApp(users[username].name, username);
}

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const errEl = document.getElementById('registerError');
  errEl.textContent = '';

  if (!name || !username || !password) { errEl.textContent = '// ALL FIELDS REQUIRED'; return; }
  if (username.length < 3) { errEl.textContent = '// USERNAME MUST BE 3+ CHARACTERS'; return; }
  if (password.length < 4) { errEl.textContent = '// PASSWORD MUST BE 4+ CHARACTERS'; return; }

  const users = getUsers();
  if (users[username]) { errEl.textContent = '// USERNAME ALREADY TAKEN'; return; }

  users[username] = { name, password: btoa(password) };
  saveUsers(users);
  setCurrentUser({ username, name });
  launchApp(name, username);
}

function launchApp(name, username) {
  const authScreen = document.getElementById('authScreen');
  const appScreen = document.getElementById('appScreen');

  authScreen.classList.add('exit');

  // Set user info
  document.getElementById('userDisplayName').textContent = name;
  document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();

  // Re-key all storage to be per-user
  currentUserKey = username;
  skills = load('waypoint_skills');
  applications = load('waypoint_applications');
  goals = load('waypoint_goals');
  practice = load('waypoint_practice');
  journal = load('waypoint_journal');

  setTimeout(() => {
    authScreen.style.display = 'none';
    appScreen.classList.remove('hidden');
    appScreen.classList.add('reveal');
    initTilt();
    renderTierLegend();
    renderDashboard();
    renderSkills();
    renderApplications();
    renderGoals();
    renderPractice();
    renderJournal();
  }, 600);
}

function handleLogout() {
  sessionStorage.removeItem('waypoint_session');
  location.reload();
}

// ─── STATE ────────────────────────────────────────────────────────────────────

let currentUserKey = 'guest';
let skills = [];
let applications = [];
let goals = [];
let practice = [];
let journal = [];
let appFilter = 'All';

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────

function load(key) {
  try {
    const raw = localStorage.getItem(`${currentUserKey}_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function save(key, value) {
  try {
    localStorage.setItem(`${currentUserKey}_${key}`, JSON.stringify(value));
  } catch (err) {}
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function deadlineLabel(days) {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days}d`;
}

function deadlineClass(days) {
  if (days <= 2) return 'soon';
  if (days <= 7) return 'upcoming';
  return 'later';
}

// ─── ASCENSION TIER SYSTEM (original — no licensed characters) ───────────────
// Every skill levels up through five original tiers as progress climbs.
// Crossing a threshold fires a full-screen "tier unlocked" moment.

const TIERS = [
  { id: 'spark', name: 'SPARK', min: 0,  color: '#64748b', glow: 'rgba(100,116,139,0.45)', glyph: '◯', line: 'A first flicker of ability.' },
  { id: 'pulse', name: 'PULSE', min: 20, color: '#00e5ff', glow: 'rgba(0,229,255,0.5)',     glyph: '◈', line: 'Steady current. Consistent reps.' },
  { id: 'surge', name: 'SURGE', min: 40, color: '#a855f7', glow: 'rgba(168,85,247,0.5)',    glyph: '◆', line: 'Momentum is undeniable now.' },
  { id: 'nova',  name: 'NOVA',  min: 60, color: '#f59e0b', glow: 'rgba(245,158,11,0.55)',   glyph: '✦', line: 'Bright enough that others notice.' },
  { id: 'apex',  name: 'APEX',  min: 80, color: '#10f0c0', glow: 'rgba(16,240,192,0.6)',    glyph: '✹', line: 'Mastery. The peak of the climb.' },
];

function getTier(progress) {
  let tier = TIERS[0];
  for (const t of TIERS) if (progress >= t.min) tier = t;
  return tier;
}

function tierRank(tier) {
  return TIERS.findIndex(t => t.id === tier.id);
}

function tierBadgeHtml(progress) {
  const t = getTier(progress);
  return `<span class="tier-badge tier-${t.id}" style="--tier-color:${t.color};--tier-glow:${t.glow}">${t.glyph} ${t.name}</span>`;
}

function renderTierLegend() {
  const row = document.getElementById('tierLegendRow');
  if (!row) return;
  row.innerHTML = TIERS.map(t => `
    <div class="tier-legend-item" style="--tier-color:${t.color};--tier-glow:${t.glow}">
      <span class="tier-legend-glyph">${t.glyph}</span>
      <span class="tier-legend-name">${t.name}</span>
      <span class="tier-legend-range">${t.min}%+</span>
    </div>
  `).join('');
}

let celebrating = false;
function celebrateTierUp(skillName, tier) {
  celebrating = true;
  const overlay = document.createElement('div');
  overlay.className = 'tier-celebration';
  overlay.style.setProperty('--tier-color', tier.color);
  overlay.style.setProperty('--tier-glow', tier.glow);
  overlay.innerHTML = `
    <div class="tier-rays"></div>
    <div class="tier-burst"></div>
    <div class="tier-content">
      <div class="tier-glyph-big">${tier.glyph}</div>
      <div class="tier-eyebrow">TIER UNLOCKED</div>
      <div class="tier-name-big">${tier.name}</div>
      <div class="tier-skill-name">${escapeHtml(skillName)}</div>
      <div class="tier-flavor">${tier.line}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  setTimeout(() => {
    overlay.classList.add('hide');
    setTimeout(() => { overlay.remove(); celebrating = false; }, 500);
  }, 2400);
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${btn.dataset.tab}`);
    });
  });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function renderDashboard() {
  const activeApplications = applications.filter(a => a.status !== 'Rejected').length;
  const goalsInProgress = goals.filter(g => g.progress < 100).length;
  const deadlineItems = collectDeadlines();
  const dueThisWeek = deadlineItems.filter(d => d.days <= 7 && d.days >= 0).length;

  animateCounter('statSkills', skills.length);
  animateCounter('statApplications', activeApplications);
  animateCounter('statGoals', goalsInProgress);
  animateCounter('statDeadlines', dueThisWeek);

  renderTrail();
  renderDeadlines(deadlineItems);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  const start = parseInt(el.textContent) || 0;
  const duration = 600;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function renderTrail() {
  const track = document.getElementById('trailTrack');
  const empty = document.getElementById('trailEmpty');

  if (goals.length === 0) {
    track.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const sorted = [...goals].sort((a, b) => new Date(a.target) - new Date(b.target));
  const R = 22, C = 2 * Math.PI * R;

  track.innerHTML = sorted.map((g, i) => {
    const offset = C - (C * g.progress / 100);
    const isLast = i === sorted.length - 1;
    return `
      <div class="trail-node">
        ${i < sorted.length - 1 ? `<div class="trail-connector" style="left:50%;right:-50%;"></div>` : ''}
        <div class="trail-ring-wrap">
          <svg class="trail-ring-svg" viewBox="0 0 52 52">
            <circle class="trail-ring-bg" cx="26" cy="26" r="${R}"/>
            <circle class="trail-ring-fg" cx="26" cy="26" r="${R}"
              stroke-dasharray="${C}" stroke-dashoffset="${offset}"
              style="stroke: ${g.progress === 100 ? 'var(--green)' : 'var(--cyan)'}"/>
          </svg>
          <div class="trail-ring-center">${g.progress}%</div>
        </div>
        <span class="trail-label" title="${escapeHtml(g.title)}">${escapeHtml(g.title)}</span>
      </div>
    `;
  }).join('');
}

function collectDeadlines() {
  const items = [];
  applications.forEach(a => {
    if (a.deadline) items.push({
      title: `${a.role} at ${a.company}`,
      sub: 'APPLICATION',
      date: a.deadline,
      days: daysUntil(a.deadline)
    });
  });
  goals.forEach(g => {
    if (g.progress < 100) items.push({
      title: g.title,
      sub: 'GOAL TARGET',
      date: g.target,
      days: daysUntil(g.target)
    });
  });
  return items.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderDeadlines(items) {
  const list = document.getElementById('deadlineList');
  const empty = document.getElementById('deadlineEmpty');

  if (items.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = items.slice(0, 8).map(item => `
    <div class="deadline-row">
      <div class="deadline-main">
        <span class="deadline-title">${escapeHtml(item.title)}</span>
        <span class="deadline-sub">${item.sub} · ${formatDate(item.date)}</span>
      </div>
      <span class="deadline-when ${deadlineClass(item.days)}">${deadlineLabel(item.days)}</span>
    </div>
  `).join('');
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────

const skillProgressInput = document.getElementById('skillProgress');
skillProgressInput.addEventListener('input', () => {
  document.getElementById('skillProgressVal').textContent = skillProgressInput.value + '%';
});

document.getElementById('skillForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('skillName').value.trim();
  if (!name) return;
  const progress = parseInt(skillProgressInput.value, 10);

  skills.push({
    id: uid(),
    name,
    category: document.getElementById('skillCategory').value,
    progress,
    target: document.getElementById('skillTarget').value || null,
    notes: document.getElementById('skillNotes').value.trim() || null,
  });

  save('waypoint_skills', skills);
  renderSkills();
  renderDashboard();
  e.target.reset();
  skillProgressInput.value = 0;
  document.getElementById('skillProgressVal').textContent = '0%';

  const tier = getTier(progress);
  if (tierRank(tier) > 0) celebrateTierUp(name, tier);
});

function renderSkills() {
  const list = document.getElementById('skillsList');
  const empty = document.getElementById('skillsEmpty');
  const badge = document.getElementById('skillCount');
  if (badge) badge.textContent = skills.length;

  if (skills.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = skills.map(s => {
    const metaParts = [];
    if (s.notes) metaParts.push(escapeHtml(s.notes));
    if (s.target) metaParts.push('Target: ' + formatDate(s.target));
    return `
      <div class="item-card" data-id="${s.id}">
        <div class="item-main">
          <div class="item-title-row">
            <span class="item-title">${escapeHtml(s.name)}</span>
            <span class="tag cat-${slugify(s.category)}">${s.category}</span>
            ${tierBadgeHtml(s.progress)}
          </div>
          ${metaParts.length ? `<div class="item-meta">${metaParts.join(' · ')}</div>` : ''}
          <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%"></div></div>
        </div>
        <div class="item-side">
          <input type="range" class="item-progress-input skill-progress-input" data-id="${s.id}" min="0" max="100" step="5" value="${s.progress}" aria-label="Update progress" />
          <button class="delete-btn skill-delete" data-id="${s.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('skillsList').addEventListener('input', e => {
  if (!e.target.classList.contains('skill-progress-input')) return;
  const skill = skills.find(s => s.id === e.target.dataset.id);
  if (!skill) return;
  const oldTier = getTier(skill.progress);
  skill.progress = parseInt(e.target.value, 10);
  const newTier = getTier(skill.progress);
  save('waypoint_skills', skills);

  const card = e.target.closest('.item-card');
  card.querySelector('.progress-fill').style.width = skill.progress + '%';
  const badgeEl = card.querySelector('.tier-badge');
  if (badgeEl) badgeEl.outerHTML = tierBadgeHtml(skill.progress);

  if (tierRank(newTier) > tierRank(oldTier)) celebrateTierUp(skill.name, newTier);
});

document.getElementById('skillsList').addEventListener('click', e => {
  const btn = e.target.closest('.skill-delete');
  if (!btn) return;
  skills = skills.filter(s => s.id !== btn.dataset.id);
  save('waypoint_skills', skills);
  renderSkills();
  renderDashboard();
});

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

document.getElementById('applicationForm').addEventListener('submit', e => {
  e.preventDefault();
  const company = document.getElementById('appCompany').value.trim();
  const role = document.getElementById('appRole').value.trim();
  if (!company || !role) return;

  applications.push({
    id: uid(),
    company,
    role,
    status: document.getElementById('appStatus').value,
    appliedDate: new Date().toISOString().slice(0, 10),
    deadline: document.getElementById('appDeadline').value || null,
    link: document.getElementById('appLink').value.trim() || null,
    notes: document.getElementById('appNotes').value.trim() || null,
  });

  save('waypoint_applications', applications);
  renderApplications();
  renderDashboard();
  e.target.reset();
});

document.getElementById('appFilters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-pill');
  if (!btn) return;
  appFilter = btn.dataset.filter;
  document.querySelectorAll('#appFilters .filter-pill').forEach(p => p.classList.toggle('active', p === btn));
  renderApplications();
});

function renderApplications() {
  const list = document.getElementById('applicationsList');
  const empty = document.getElementById('applicationsEmpty');
  const filtered = appFilter === 'All' ? applications : applications.filter(a => a.status === appFilter);

  if (filtered.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    empty.textContent = applications.length === 0
      ? 'No applications yet. Add your first one above.'
      : `// No "${appFilter}" applications found.`;
    return;
  }

  empty.style.display = 'none';
  const sorted = [...filtered].sort((a, b) => {
    if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return new Date(b.appliedDate) - new Date(a.appliedDate);
  });

  const statusOptions = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
  list.innerHTML = sorted.map(a => {
    const metaParts = [`Applied ${formatDate(a.appliedDate)}`];
    if (a.deadline) metaParts.push(`Deadline: ${formatDate(a.deadline)}`);
    if (a.link) metaParts.push(`<a href="${escapeHtml(a.link)}" target="_blank" rel="noopener">↗ Link</a>`);
    return `
      <div class="item-card" data-id="${a.id}">
        <div class="item-main">
          <div class="item-title-row">
            <span class="item-title">${escapeHtml(a.role)} · ${escapeHtml(a.company)}</span>
            <span class="tag status-${slugify(a.status)}">${a.status}</span>
          </div>
          <div class="item-meta">${metaParts.join(' · ')}</div>
          ${a.notes ? `<div class="item-meta">${escapeHtml(a.notes)}</div>` : ''}
        </div>
        <div class="item-side">
          <select class="status-select" data-id="${a.id}">
            ${statusOptions.map(st => `<option value="${st}" ${st === a.status ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
          <button class="delete-btn app-delete" data-id="${a.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('applicationsList').addEventListener('change', e => {
  if (!e.target.classList.contains('status-select')) return;
  const app = applications.find(a => a.id === e.target.dataset.id);
  if (!app) return;
  app.status = e.target.value;
  save('waypoint_applications', applications);
  renderApplications();
  renderDashboard();
});

document.getElementById('applicationsList').addEventListener('click', e => {
  const btn = e.target.closest('.app-delete');
  if (!btn) return;
  applications = applications.filter(a => a.id !== btn.dataset.id);
  save('waypoint_applications', applications);
  renderApplications();
  renderDashboard();
});

// ─── GOALS ────────────────────────────────────────────────────────────────────

document.getElementById('goalForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('goalTitle').value.trim();
  const target = document.getElementById('goalTarget').value;
  if (!title || !target) return;

  goals.push({
    id: uid(),
    title,
    category: document.getElementById('goalCategory').value,
    target,
    progress: 0,
    notes: document.getElementById('goalNotes').value.trim() || null,
  });

  save('waypoint_goals', goals);
  renderGoals();
  renderDashboard();
  e.target.reset();
});

function renderGoals() {
  const list = document.getElementById('goalsList');
  const empty = document.getElementById('goalsEmpty');
  const badge = document.getElementById('goalCount');
  if (badge) badge.textContent = goals.length;

  if (goals.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const sorted = [...goals].sort((a, b) => new Date(a.target) - new Date(b.target));

  list.innerHTML = sorted.map(g => {
    const days = daysUntil(g.target);
    const metaParts = [`Target: ${formatDate(g.target)} (${deadlineLabel(days)})`];
    if (g.notes) metaParts.push(escapeHtml(g.notes));
    return `
      <div class="item-card" data-id="${g.id}">
        <div class="item-main">
          <div class="item-title-row">
            <span class="item-title">${escapeHtml(g.title)}</span>
            <span class="tag cat-${slugify(g.category)}">${g.category}</span>
          </div>
          <div class="item-meta">${metaParts.join(' · ')}</div>
          <div class="progress-track"><div class="progress-fill" style="width:${g.progress}%"></div></div>
        </div>
        <div class="item-side">
          <input type="range" class="item-progress-input goal-progress-input" data-id="${g.id}" min="0" max="100" step="5" value="${g.progress}" aria-label="Update progress" />
          <button class="delete-btn goal-delete" data-id="${g.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('goalsList').addEventListener('input', e => {
  if (!e.target.classList.contains('goal-progress-input')) return;
  const goal = goals.find(g => g.id === e.target.dataset.id);
  if (!goal) return;
  goal.progress = parseInt(e.target.value, 10);
  save('waypoint_goals', goals);
  e.target.closest('.item-card').querySelector('.progress-fill').style.width = goal.progress + '%';
});

document.getElementById('goalsList').addEventListener('change', e => {
  if (!e.target.classList.contains('goal-progress-input')) return;
  renderDashboard();
});

document.getElementById('goalsList').addEventListener('click', e => {
  const btn = e.target.closest('.goal-delete');
  if (!btn) return;
  goals = goals.filter(g => g.id !== btn.dataset.id);
  save('waypoint_goals', goals);
  renderGoals();
  renderDashboard();
});

// ─── PRACTICE LOG (LeetCode / CodeChef / Codeforces / etc.) ──────────────────

const PLATFORM_CLASS = {
  leetcode: 'amber', codechef: 'violet', codeforces: 'applied',
  hackerrank: 'offer', geeksforgeeks: 'interview', other: 'wishlist',
};

document.getElementById('practiceForm').addEventListener('submit', e => {
  e.preventDefault();
  const platform = document.getElementById('practicePlatform').value;
  const solved = parseInt(document.getElementById('practiceSolved').value, 10) || 0;

  practice.push({
    id: uid(),
    platform,
    solved,
    rating: document.getElementById('practiceRating').value.trim() || null,
    link: document.getElementById('practiceLink').value.trim() || null,
    notes: document.getElementById('practiceNotes').value.trim() || null,
  });

  save('waypoint_practice', practice);
  renderPractice();
  e.target.reset();
  document.getElementById('practiceSolved').value = 0;
});

function renderPractice() {
  const list = document.getElementById('practiceList');
  const empty = document.getElementById('practiceEmpty');
  const badge = document.getElementById('practiceCount');
  if (badge) badge.textContent = practice.length;

  if (practice.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = practice.map(p => {
    const cls = PLATFORM_CLASS[slugify(p.platform)] || 'wishlist';
    const metaParts = [];
    if (p.rating) metaParts.push(escapeHtml(p.rating));
    if (p.notes) metaParts.push(escapeHtml(p.notes));
    if (p.link) metaParts.push(`<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener">↗ Profile</a>`);
    return `
      <div class="item-card" data-id="${p.id}">
        <div class="item-main">
          <div class="item-title-row">
            <span class="item-title">${escapeHtml(p.platform)}</span>
            <span class="tag status-${cls}">${p.platform}</span>
          </div>
          ${metaParts.length ? `<div class="item-meta">${metaParts.join(' · ')}</div>` : ''}
          <div class="practice-solved-row">
            <span class="practice-solved-num">${p.solved}</span>
            <span class="practice-solved-label">problems solved</span>
          </div>
        </div>
        <div class="item-side">
          <button class="primary-btn small practice-increment" data-id="${p.id}">+1 SOLVED</button>
          <button class="delete-btn practice-delete" data-id="${p.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('practiceList').addEventListener('click', e => {
  const incBtn = e.target.closest('.practice-increment');
  if (incBtn) {
    const p = practice.find(x => x.id === incBtn.dataset.id);
    if (p) {
      p.solved += 1;
      save('waypoint_practice', practice);
      const numEl = incBtn.closest('.item-card').querySelector('.practice-solved-num');
      numEl.textContent = p.solved;
      numEl.classList.remove('pop');
      void numEl.offsetWidth;
      numEl.classList.add('pop');
    }
    return;
  }
  const delBtn = e.target.closest('.practice-delete');
  if (delBtn) {
    practice = practice.filter(x => x.id !== delBtn.dataset.id);
    save('waypoint_practice', practice);
    renderPractice();
  }
});

// ─── JOURNAL ──────────────────────────────────────────────────────────────────

document.getElementById('journalForm').addEventListener('submit', e => {
  e.preventDefault();
  const text = document.getElementById('journalText').value.trim();
  if (!text) return;

  journal.push({
    id: uid(),
    text,
    date: new Date().toISOString(),
  });

  save('waypoint_journal', journal);
  renderJournal();
  e.target.reset();
});

function renderJournal() {
  const feed = document.getElementById('journalFeed');
  const empty = document.getElementById('journalEmpty');
  const badge = document.getElementById('journalCount');
  if (badge) badge.textContent = journal.length;

  if (journal.length === 0) {
    feed.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  const sorted = [...journal].sort((a, b) => new Date(b.date) - new Date(a.date));
  feed.innerHTML = sorted.map((j, i) => `
    <div class="journal-entry" data-id="${j.id}" style="animation-delay:${Math.min(i, 6) * 0.05}s">
      <div class="journal-entry-dot"></div>
      <div class="journal-entry-body">
        <div class="journal-entry-date">${new Date(j.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <p class="journal-entry-text">${escapeHtml(j.text)}</p>
      </div>
      <button class="delete-btn journal-delete" data-id="${j.id}">Remove</button>
    </div>
  `).join('');
}

document.getElementById('journalFeed').addEventListener('click', e => {
  const btn = e.target.closest('.journal-delete');
  if (!btn) return;
  journal = journal.filter(j => j.id !== btn.dataset.id);
  save('waypoint_journal', journal);
  renderJournal();
});

let previewTierIndex = 0;
const previewBtn = document.getElementById('tierPreviewBtn');
if (previewBtn) {
  previewBtn.addEventListener('click', () => {
    const tier = TIERS[previewTierIndex % TIERS.length];
    previewTierIndex++;
    celebrateTierUp('Preview Skill', tier);
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

// Check for existing session
const existingUser = getCurrentUser();
if (existingUser) {
  launchApp(existingUser.name, existingUser.username);
}
