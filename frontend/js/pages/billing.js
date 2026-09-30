const SUB_STATUS_LABEL = { active: 'فعال', expired: 'منقضی', canceled: 'لغو‌شده', none: 'بدون اشتراک' };

route('#/app/billing', {
  private: true,
  async render(root) {
    const [sub, history] = await Promise.all([
      api.subscription().catch(() => null),
      api.history().catch(() => []),
    ]);

    root.innerHTML = `
      <div class="page-head"><div><h2>اشتراک</h2><p class="muted">پلن فعلی و تاریخچهٔ پرداخت‌ها.</p></div></div>

      <div class="card" style="margin-bottom:26px">
        <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:14px">
          <div>
            <div class="badge badge-brass">پلن فعلی: ${planLabel(sub?.plan || 'free')}</div>
            <p style="margin-top:10px">${sub?.status ? `وضعیت: ${SUB_STATUS_LABEL[sub.status] || sub.status}` : ''}
              ${sub?.expires_at ? ` · انقضا: ${fmtDate(sub.expires_at)}` : ''}</p>
          </div>
        </div>
      </div>

      <div class="pricing-row" style="margin-bottom:30px">
        ${['free', 'base', 'pro', 'enterprise'].map(p => `
          <div class="plan-card ${sub?.plan === p ? 'featured' : ''}">
            <div class="badge">${planLabel(p)}</div>
            <div class="plan-price">${p === 'free' ? 'رایگان' : fmtToman(planPrice(p))}</div>
            ${p === 'free' ? '' : `<button class="btn btn-brass btn-block" data-plan="${p}" ${sub?.plan === p ? 'disabled' : ''}>${sub?.plan === p ? 'پلن فعلی' : 'ارتقا'}</button>`}
          </div>`).join('')}
      </div>

      <div class="card">
        <h3>تاریخچهٔ پرداخت</h3>
        <hr class="rule-brass"/>
        ${history.length === 0 ? '<div class="empty-state">پرداختی ثبت نشده</div>' :
          history.map(t => `
            <div class="txn-row">
              <div>${planLabel(t.plan)} · ${fmtDate(t.created_at)}</div>
              <div class="row gap-s"><span>${fmtToman(t.amount_toman)}</span>
                <span class="badge ${t.status === 'paid' ? 'badge-sage' : t.status === 'failed' ? 'badge-brick' : ''}">${t.status}</span>
              </div>
            </div>`).join('')}
      </div>
    `;

    root.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', async () => {
      b.disabled = true; b.innerHTML = '<span class="spinner"></span>';
      try {
        const res = await api.checkout(b.dataset.plan);
        window.location.href = res.payment_url;
      } catch (e) {
        toast(e.message, 'error');
        b.disabled = false; b.textContent = 'ارتقا';
      }
    }));
  }
});
