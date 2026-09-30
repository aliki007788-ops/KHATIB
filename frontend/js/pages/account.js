route('#/app/account', {
  private: true,
  async render(root) {
    const u = Auth.user;
    const eitaa = await api.eitaaStatus().catch(() => null);

    root.innerHTML = `
      <div class="page-head"><div><h2>حساب کاربری</h2><p class="muted">اطلاعات، پیوندها و حریم خصوصی.</p></div></div>

      <div class="dash-grid">
        <div class="stack gap-l">
          <div class="card">
            <h3>پروفایل</h3>
            <hr class="rule-brass"/>
            <p><strong>نام:</strong> ${escapeHtml(u?.name || '—')}</p>
            <p><strong>ایمیل:</strong> ${escapeHtml(u?.email || '—')}</p>
            <p><strong>پلن:</strong> ${planLabel(u?.plan)}</p>
            <p><strong>تأیید ایمیل:</strong> ${u?.email_verified ? 'تأیید شده' : 'تأیید نشده'}</p>
          </div>

          <div class="card">
            <h3>ایتا</h3>
            <hr class="rule-brass"/>
            <p>${eitaa?.linked ? `حساب ایتا متصل است${eitaa.linked_at ? ' · ' + fmtDate(eitaa.linked_at) : ''}` : 'حساب ایتا هنوز متصل نشده است.'}</p>
          </div>
        </div>

        <div class="stack gap-l">
          <div class="card">
            <h3>حریم خصوصی</h3>
            <hr class="rule-brass"/>
            <p class="muted" style="font-size:.88rem">می‌توانی نسخه‌ای از اطلاعاتت را دریافت کنی یا حساب را برای همیشه حذف کنی.</p>
            <div class="stack gap-s">
              <button class="btn btn-ghost" id="export-btn">دریافت خروجی داده‌ها</button>
              <button class="btn btn-danger" id="delete-btn">حذف حساب کاربری</button>
            </div>
          </div>
        </div>
      </div>
    `;

    root.querySelector('#export-btn').addEventListener('click', async () => {
      try {
        const data = await api.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'khatib-data-export.json';
        a.click();
      } catch (e) { toast(e.message, 'error'); }
    });

    root.querySelector('#delete-btn').addEventListener('click', () => {
      const modal = openModal(`
        <h3>حذف حساب کاربری</h3>
        <p class="muted">این عملیات غیرقابل بازگشت است. برای تأیید عبارت <strong>DELETE_ACCOUNT</strong> را در ذهن داشته باش و دکمه زیر را بزن.</p>
        <div class="row gap-s" style="margin-top:16px">
          <button class="btn btn-danger grow" id="confirm-del">بله، حذف کن</button>
          <button class="btn btn-ghost grow" onclick="this.closest('.modal-backdrop').remove()">انصراف</button>
        </div>
      `);
      modal.querySelector('#confirm-del').addEventListener('click', async () => {
        try {
          await api.deleteAccount();
          Auth.clear();
          location.hash = '#/';
        } catch (e) { toast(e.message, 'error'); }
      });
    });
  }
});
