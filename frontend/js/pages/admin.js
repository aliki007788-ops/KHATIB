route('#/app/admin', {
  private: true,
  admin: true,
  async render(root) {
    const stats = await api.adminStats().catch(() => null);
    let search = '';

    root.innerHTML = `
      <div class="page-head"><div><h2>مدیریت</h2><p class="muted">آمار کلی پلتفرم و مدیریت کاربران.</p></div></div>

      <div class="stat-row">
        <div class="stat-card"><div class="v">${stats?.total_users ?? '—'}</div><div class="l">کل کاربران</div></div>
        <div class="stat-card"><div class="v">${stats?.active_users ?? '—'}</div><div class="l">کاربران فعال</div></div>
        <div class="stat-card"><div class="v">${stats?.completed_speeches ?? '—'}</div><div class="l">سخنرانی تکمیل‌شده</div></div>
        <div class="stat-card"><div class="v">${fmtToman(stats?.total_revenue_toman ?? 0)}</div><div class="l">درآمد کل</div></div>
      </div>

      <div class="card">
        <div class="row" style="justify-content:space-between;margin-bottom:14px">
          <h3>کاربران</h3>
          <input id="search-input" placeholder="جست‌وجوی ایمیل یا نام..." style="max-width:260px"/>
        </div>
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead><tr><th>ایمیل</th><th>نام</th><th>نقش</th><th>پلن</th><th>وضعیت</th><th>عملیات</th></tr></thead>
            <tbody id="user-rows"></tbody>
          </table>
        </div>
      </div>
    `;

    async function loadUsers() {
      const tbody = root.querySelector('#user-rows');
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="spinner" style="margin:0 auto"></div></div></td></tr>`;
      const users = await api.adminUsers(search).catch(() => []);
      tbody.innerHTML = users.length === 0 ? `<tr><td colspan="6"><div class="empty-state">کاربری یافت نشد</div></td></tr>` :
        users.map(u => `
          <tr>
            <td>${escapeHtml(u.email)}</td>
            <td>${escapeHtml(u.name || '—')}</td>
            <td>${escapeHtml(u.role)}</td>
            <td>
              <select data-plan-select="${u.id}">
                ${['free','base','pro','enterprise'].map(p => `<option value="${p}" ${u.plan === p ? 'selected' : ''}>${planLabel(p)}</option>`).join('')}
              </select>
            </td>
            <td><span class="badge ${u.active ? 'badge-sage' : 'badge-brick'}">${u.active ? 'فعال' : 'غیرفعال'}</span></td>
            <td><button class="btn btn-ghost btn-sm" data-toggle-active="${u.id}" data-current="${u.active}">${u.active ? 'غیرفعال کن' : 'فعال کن'}</button></td>
          </tr>`).join('');

      tbody.querySelectorAll('[data-plan-select]').forEach(sel => sel.addEventListener('change', async () => {
        try { await api.adminSetPlan(sel.dataset.planSelect, sel.value); toast('پلن به‌روزرسانی شد', 'ok'); }
        catch (e) { toast(e.message, 'error'); }
      }));
      tbody.querySelectorAll('[data-toggle-active]').forEach(btn => btn.addEventListener('click', async () => {
        const next = btn.dataset.current !== 'true';
        try { await api.adminSetActive(btn.dataset.toggleActive, next); toast('وضعیت به‌روزرسانی شد', 'ok'); loadUsers(); }
        catch (e) { toast(e.message, 'error'); }
      }));
    }

    let debounceT;
    root.querySelector('#search-input').addEventListener('input', (e) => {
      clearTimeout(debounceT);
      debounceT = setTimeout(() => { search = e.target.value; loadUsers(); }, 350);
    });

    await loadUsers();
  }
});
