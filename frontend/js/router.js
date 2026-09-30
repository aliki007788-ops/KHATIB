/* ================================================================
   خطیب — Router
   ================================================================ */

const routes = {}; // path -> { render(root), private, admin, title }
function route(path, cfg) { routes[path] = cfg; }

const NAV_ITEMS = [
  { path: '#/app', label: 'داشبورد', icon: 'home' },
  { path: '#/app/speech', label: 'اتاق سخنرانی', icon: 'mic' },
  { path: '#/app/chat', label: 'گفتگوی عراقی', icon: 'chat' },
  { path: '#/app/translate', label: 'مترجم', icon: 'translate' },
  { path: '#/app/learning', label: 'مسیر یادگیری', icon: 'path' },
  { path: '#/app/progress', label: 'پیشرفت', icon: 'chart' },
  { path: '#/app/billing', label: 'اشتراک', icon: 'card' },
  { path: '#/app/account', label: 'حساب کاربری', icon: 'user' },
];

function sidebarHtml(active) {
  let items = NAV_ITEMS.map(n => `
    <div class="side-link ${active === n.path ? 'active' : ''}" data-nav="${n.path}">
      ${ICONS[n.icon]}<span>${n.label}</span>
    </div>`).join('');
  if (Auth.user && (Auth.user.role === 'admin' || Auth.user.role === 'superadmin')) {
    items += `<div class="side-link ${active === '#/app/admin' ? 'active' : ''}" data-nav="#/app/admin">${ICONS.shield}<span>مدیریت</span></div>`;
  }
  return `
    <aside class="sidebar">
      <div class="brandmark">${brandMark(26)}<span>خطیب</span></div>
      <nav class="stack gap-s">${items}</nav>
      <div class="sidebar-foot">
        <div class="side-link" data-nav="__logout">${ICONS.logout}<span>خروج</span></div>
      </div>
    </aside>`;
}

async function ensureUser() {
  if (Auth.user) return Auth.user;
  if (!Auth.token) return null;
  try {
    const u = await api.me();
    Auth.setUser(u);
    return u;
  } catch { return null; }
}

async function renderRoute() {
  const hash = location.hash || '#/';
  const base = hash.split('?')[0];
  const cfg = routes[base] || routes['#/404'];
  const appRoot = document.getElementById('app-root');

  if (cfg.private) {
    const u = await ensureUser();
    if (!u) { location.hash = '#/login'; return; }
    if (cfg.admin && !(u.role === 'admin' || u.role === 'superadmin')) { location.hash = '#/app'; return; }

    appRoot.innerHTML = `<div class="app-shell">${sidebarHtml(base)}<main class="main-area" id="page-slot"></main></div>`;
    appRoot.querySelectorAll('[data-nav]').forEach(node => {
      node.addEventListener('click', async () => {
        const target = node.getAttribute('data-nav');
        if (target === '__logout') {
          try { await api.logout(); } catch {}
          Auth.clear();
          location.hash = '#/';
        } else {
          location.hash = target;
        }
      });
    });
    const slot = document.getElementById('page-slot');
    slot.innerHTML = `<div class="empty-state"><div class="spinner" style="margin:0 auto"></div></div>`;
    try {
      await cfg.render(slot);
    } catch (e) {
      slot.innerHTML = `<div class="empty-state">مشکلی پیش آمد: ${escapeHtml(e.message)}</div>`;
    }
  } else {
    appRoot.innerHTML = `<div id="page-slot"></div>`;
    const slot = document.getElementById('page-slot');
    await cfg.render(slot);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/';
  renderRoute();
});
