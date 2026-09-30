function sparkline(points) {
  if (!points || points.length === 0) return '<div class="empty-state">داده‌ای نیست</div>';
  const vals = points.map(p => p.score ?? p.value ?? 0);
  const max = Math.max(...vals, 1), min = Math.min(...vals, 0);
  const w = Math.max(points.length * 26, 260), h = 140, pad = 10;
  const xStep = (w - pad * 2) / Math.max(points.length - 1, 1);
  const norm = (v) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const pts = vals.map((v, i) => `${pad + i * xStep},${norm(v)}`).join(' ');
  const dots = vals.map((v, i) => `<circle cx="${pad + i * xStep}" cy="${norm(v)}" r="3.5" fill="var(--brass)"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
    <polyline points="${pts}" fill="none" stroke="var(--brass)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
  </svg>`;
}

route('#/app/progress', {
  private: true,
  async render(root) {
    const [summary, trends] = await Promise.all([
      api.progressSummary().catch(() => null),
      api.progressTrends().catch(() => []),
    ]);

    root.innerHTML = `
      <div class="page-head"><div><h2>پیشرفت</h2><p class="muted">روند امتیازها و ابعاد سخنرانی‌ات.</p></div></div>

      <div class="stat-row">
        <div class="stat-card"><div class="v">${summary?.practice_count ?? 0}</div><div class="l">تعداد تمرین</div></div>
        <div class="stat-card"><div class="v">${summary?.weekly_average_score ?? '—'}</div><div class="l">میانگین هفتگی</div></div>
        <div class="stat-card"><div class="v">${summary?.monthly_average_score ?? '—'}</div><div class="l">میانگین ماهانه</div></div>
        <div class="stat-card"><div class="v">${summary?.current_streak_days ?? 0}</div><div class="l">روز پیاپی</div></div>
      </div>

      <div class="card" style="margin-bottom:22px">
        <h3>روند امتیاز</h3>
        <hr class="rule-brass"/>
        <div class="sparkline-wrap">${sparkline(summary?.score_trend)}</div>
      </div>

      <div class="card">
        <h3>روند ابعاد سخنرانی</h3>
        <hr class="rule-brass"/>
        ${trends.length === 0 ? '<div class="empty-state">هنوز داده‌ای نیست</div>' :
          trends.map(t => `
            <div class="trend-row">
              <div>${escapeHtml(t.label_fa)}</div>
              <div class="row gap-s">
                <span class="muted" style="font-size:.85rem">${t.recent_average.toFixed(0)}</span>
                <span class="badge ${t.change_percent >= 0 ? 'badge-sage' : 'badge-brick'}">${t.change_percent >= 0 ? '▲' : '▼'} ${Math.abs(t.change_percent).toFixed(0)}٪</span>
              </div>
            </div>`).join('')}
      </div>
    `;
  }
});
