route('#/app', {
  private: true,
  async render(root) {
    const [summary, reco] = await Promise.all([
      api.progressSummary().catch(() => null),
      api.dailyReco().catch(() => null),
    ]);

    root.innerHTML = `
      <div class="page-head">
        <div><h2>سلام${Auth.user?.name ? '، ' + escapeHtml(Auth.user.name) : ''}</h2><p class="muted">امروز چه چیزی را تمرین می‌کنیم؟</p></div>
      </div>

      <div class="stat-row">
        <div class="stat-card"><div class="v">${summary?.practice_count ?? 0}</div><div class="l">تعداد تمرین</div></div>
        <div class="stat-card"><div class="v">${summary?.best_score ?? '—'}</div><div class="l">بهترین امتیاز</div></div>
        <div class="stat-card"><div class="v">${summary?.average_score ?? '—'}</div><div class="l">میانگین امتیاز</div></div>
        <div class="stat-card"><div class="v">${summary?.current_streak_days ?? 0}</div><div class="l">روز پیاپی</div></div>
      </div>

      <div class="dash-grid">
        <div class="card">
          <h3>دسترسی سریع</h3>
          <hr class="rule-brass"/>
          <div class="row gap-m wrap">
            <a href="#/app/speech" class="btn btn-brass">${ICONS.mic} تمرین سخنرانی</a>
            <a href="#/app/chat" class="btn btn-ghost">${ICONS.chat} گفتگوی عراقی</a>
            <a href="#/app/learning" class="btn btn-ghost">${ICONS.path} مسیر یادگیری</a>
          </div>
        </div>

        <div class="reco-card" id="reco-slot">
          ${reco ? `
            <div class="badge badge-brass">پیشنهاد امروز</div>
            <h3 style="margin-top:12px">${escapeHtml(reco.title_fa)}</h3>
            <p>${escapeHtml(reco.description_fa)}</p>
            <button class="btn btn-brass btn-sm" id="reco-go">شروع</button>
          ` : `<p class="muted">پیشنهادی موجود نیست.</p>`}
        </div>
      </div>
    `;

    const goBtn = root.querySelector('#reco-go');
    if (goBtn && reco) {
      goBtn.addEventListener('click', async () => {
        if (reco.action_scenario_id) {
          try {
            await api.scenarioStart(reco.action_scenario_id);
            location.hash = '#/app/chat';
          } catch (e) { toast(e.message, 'error'); }
        } else {
          location.hash = '#/app/speech';
        }
      });
    }
  }
});
