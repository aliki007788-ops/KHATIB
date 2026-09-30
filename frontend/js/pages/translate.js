route('#/app/translate', {
  private: true,
  async render(root) {
    let direction = 'fa_to_iq';

    function paint() {
      root.innerHTML = `
        <div class="page-head"><div><h2>مترجم</h2><p class="muted">میان فارسی و عربی عراقی ترجمه کن.</p></div></div>
        <div class="card">
          <div class="row gap-m" style="margin-bottom:18px">
            <div class="mode-toggle">
              <button data-d="fa_to_iq" class="${direction === 'fa_to_iq' ? 'active' : ''}">فارسی ← عراقی</button>
              <button data-d="iq_to_fa" class="${direction === 'iq_to_fa' ? 'active' : ''}">عراقی ← فارسی</button>
            </div>
          </div>
          <div class="field"><textarea id="src-text" rows="5" maxlength="3000" placeholder="متن را وارد کن..."></textarea></div>
          <button class="btn btn-brass" id="go-btn">ترجمه کن</button>
          <div id="result" style="margin-top:20px"></div>
        </div>
      `;
      root.querySelectorAll('.mode-toggle button').forEach(b => b.addEventListener('click', () => { direction = b.dataset.d; paint(); }));
      root.querySelector('#go-btn').addEventListener('click', async () => {
        const text = root.querySelector('#src-text').value.trim();
        if (!text) return;
        const btn = root.querySelector('#go-btn');
        btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
        try {
          const res = await api.translate({ text, direction });
          root.querySelector('#result').innerHTML = `
            <hr class="rule-brass"/>
            <p style="font-size:1.05rem;color:var(--parchment)">${escapeHtml(res.translated_text)}</p>
            ${res.notes ? `<p class="muted" style="font-size:.85rem">${escapeHtml(res.notes)}</p>` : ''}
          `;
        } catch (e) { toast(e.message, 'error'); }
        btn.disabled = false; btn.textContent = 'ترجمه کن';
      });
    }
    paint();
  }
});
