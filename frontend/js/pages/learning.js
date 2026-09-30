const SCEN_STATUS_LABEL = { locked: 'قفل', available: 'در دسترس', in_progress: 'در حال انجام', completed: 'تکمیل‌شده' };

route('#/app/learning', {
  private: true,
  async render(root) {
    let levels = [];
    let activeLevel = null;

    async function paint() {
      levels = await api.levels().catch(() => []);
      if (!activeLevel && levels.length) activeLevel = levels.find(l => l.unlocked)?.id || levels[0].id;

      root.innerHTML = `
        <div class="page-head"><div><h2>مسیر یادگیری</h2><p class="muted">سطح‌به‌سطح، سناریو به سناریو.</p></div></div>
        <div class="level-row" id="level-row">
          ${levels.map(l => `
            <div class="level-pill ${l.id === activeLevel ? 'active' : ''} ${!l.unlocked ? 'locked' : ''}" data-id="${l.id}">
              <div style="font-weight:700">${escapeHtml(l.name_fa)}</div>
              <div class="muted" style="font-size:.78rem">${l.completed_count}/${l.total_count} تکمیل</div>
            </div>`).join('')}
        </div>
        <div class="scenario-grid" id="scenario-grid"></div>
      `;

      root.querySelectorAll('.level-pill').forEach(n => n.addEventListener('click', () => {
        const lvl = levels.find(l => l.id === n.dataset.id);
        if (!lvl?.unlocked) { toast('این سطح هنوز قفل است', 'error'); return; }
        activeLevel = n.dataset.id;
        paint();
      }));

      await paintScenarios();
    }

    async function paintScenarios() {
      const grid = root.querySelector('#scenario-grid');
      grid.innerHTML = `<div class="empty-state"><div class="spinner" style="margin:0 auto"></div></div>`;
      const scenarios = await api.scenarios(activeLevel).catch(() => []);
      grid.innerHTML = scenarios.length === 0 ? '<div class="empty-state">سناریویی در این سطح نیست</div>' :
        scenarios.map(s => `
          <div class="scenario-card">
            <div class="row" style="justify-content:space-between">
              <h3 style="margin:0">${escapeHtml(s.title_fa)}</h3>
              <span class="badge ${s.status === 'completed' ? 'badge-sage' : s.status === 'in_progress' ? 'badge-brass' : ''}">${SCEN_STATUS_LABEL[s.status] || s.status}</span>
            </div>
            <p style="font-size:.88rem">${escapeHtml(s.description_fa)}</p>
            <div>${(s.key_vocabulary || []).map(v => `<span class="vocab-chip">${escapeHtml(v)}</span>`).join('')}</div>
            <div class="row gap-s" style="margin-top:auto">
              ${s.unlocked ? `<button class="btn btn-brass btn-sm" data-start="${s.id}">شروع گفتگو</button>` : `<span class="muted" style="font-size:.8rem">قفل</span>`}
              ${s.status !== 'completed' && s.unlocked ? `<button class="btn btn-ghost btn-sm" data-complete="${s.id}">علامت‌گذاری تکمیل</button>` : ''}
            </div>
          </div>`).join('');

      grid.querySelectorAll('[data-start]').forEach(b => b.addEventListener('click', async () => {
        try { await api.scenarioStart(b.dataset.start); location.hash = '#/app/chat'; }
        catch (e) { toast(e.message, 'error'); }
      }));
      grid.querySelectorAll('[data-complete]').forEach(b => b.addEventListener('click', async () => {
        try { await api.scenarioComplete(b.dataset.complete); toast('تکمیل شد', 'ok'); paint(); }
        catch (e) { toast(e.message, 'error'); }
      }));
    }

    await paint();
  }
});
