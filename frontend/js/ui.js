/* ================================================================
   خطیب — UI helpers
   ================================================================ */

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function toast(msg, type = '') {
  const root = document.getElementById('toast-root');
  const node = el(`<div class="toast ${type === 'error' ? 'err' : type === 'ok' ? 'ok' : ''}">${escapeHtml(msg)}</div>`);
  root.appendChild(node);
  setTimeout(() => node.remove(), 3400);
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
  } catch { return iso; }
}

function fmtToman(n) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
}

function openModal(html) {
  const backdrop = el(`<div class="modal-backdrop"><div class="modal-box">${html}</div></div>`);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  document.body.appendChild(backdrop);
  return backdrop;
}

/* -------- brand mark: concentric resonance arcs -------- */
function brandMark(size = 30) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none">
    <circle cx="14" cy="20" r="5" fill="var(--brass)"/>
    <path d="M22 20a8 8 0 0 1 0 0" stroke="var(--brass)" stroke-width="2" fill="none" opacity=".85"/>
    <path d="M23 12a12 12 0 0 1 0 16" stroke="var(--brass)" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M29 7a19 19 0 0 1 0 26" stroke="var(--brass)" stroke-width="2" fill="none" opacity=".35"/>
  </svg>`;
}

/* -------- abstract voice waveform, decorative -------- */
function waveformSvg(seed = 7) {
  let bars = '';
  let x = 0;
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 46; i++) {
    const h = 14 + rand() * 120;
    const color = i % 7 === 0 ? 'var(--wine-soft)' : 'var(--brass)';
    const op = 0.35 + rand() * 0.65;
    bars += `<rect x="${x}" y="${150 - h}" width="6" height="${h}" rx="3" fill="${color}" opacity="${op.toFixed(2)}"/>`;
    x += 10;
  }
  return `<svg viewBox="0 0 ${x} 160" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${bars}</svg>`;
}

/* -------- resonance rings hero art -------- */
function resonanceArt() {
  return `<svg viewBox="0 0 400 380" width="100%" height="100%">
    <defs>
      <radialGradient id="g1" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="var(--brass)" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="var(--brass)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="200" cy="190" r="150" fill="url(#g1)"/>
    <circle cx="200" cy="190" r="120" stroke="var(--ink-line)" fill="none" stroke-width="1"/>
    <circle cx="200" cy="190" r="90" stroke="var(--brass)" fill="none" stroke-width="1" opacity=".5"/>
    <circle cx="200" cy="190" r="60" stroke="var(--wine-soft)" fill="none" stroke-width="1.5" opacity=".7"/>
    <circle cx="200" cy="190" r="34" fill="var(--brass)" opacity=".9"/>
    <path d="M120 190 Q160 110 200 190 T280 190" stroke="var(--parchment)" stroke-width="2" fill="none" opacity=".4"/>
  </svg>`;
}

/* -------- score gauge (semi-arc) -------- */
function scoreGauge(score, size = 116) {
  const pct = Math.max(0, Math.min(100, score ?? 0)) / 100;
  const r = 46, c = 2 * Math.PI * r;
  const color = pct > 0.75 ? 'var(--sage)' : pct > 0.5 ? 'var(--brass)' : 'var(--wine-soft)';
  return `<svg width="${size}" height="${size}" viewBox="0 0 110 110">
    <circle cx="55" cy="55" r="${r}" stroke="var(--ink-3)" stroke-width="10" fill="none"/>
    <circle cx="55" cy="55" r="${r}" stroke="${color}" stroke-width="10" fill="none"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" stroke-linecap="round"
      transform="rotate(-90 55 55)"/>
    <text x="55" y="62" text-anchor="middle" font-size="26" font-family="'Markazi Text',serif" fill="var(--parchment)">${score ?? '—'}</text>
  </svg>`;
}

function planLabel(plan) {
  return { free: 'رایگان', base: 'پایه', pro: 'حرفه\u200cای', enterprise: 'سازمانی' }[plan] || plan;
}
function planPrice(plan) {
  return { free: 0, base: 99000, pro: 249000, enterprise: 499000 }[plan] ?? null;
}

const ICONS = {
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>`,
  mic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/></svg>`,
  chat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4.5"/></svg>`,
  translate: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h9M7 3v3M4 12l4-9M12 20l5-11 5 11M13.5 16.5h7"/></svg>`,
  path: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 7 C12 9 12 15 16 17"/></svg>`,
  chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>`,
  card: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/></svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3.5v6c0 5-3.5 8.5-8 10.5C7.5 20 4 16.5 4 11.5v-6L12 2z"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
};
