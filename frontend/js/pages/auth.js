route('#/login', {
  private: false,
  render(root) {
    root.innerHTML = `
    <div class="auth-wrap">
      <div style="position:absolute;inset:0;opacity:.5;pointer-events:none">${resonanceArt()}</div>
      <div class="auth-card card">
        <div class="brandmark center" style="justify-content:center;margin-bottom:6px">${brandMark(26)}<span>خطیب</span></div>
        <p class="center">ورود به حساب کاربری</p>
        <form id="login-form">
          <div class="field"><label>ایمیل</label><input type="email" name="email" required/></div>
          <div class="field"><label>رمز عبور</label><input type="password" name="password" required/></div>
          <button class="btn btn-brass btn-block" type="submit">ورود</button>
        </form>
        <p class="center muted" style="margin-top:18px">حساب نداری؟ <a href="#/register">ثبت‌نام کن</a></p>
      </div>
    </div>`;

    root.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
      const fd = new FormData(e.target);
      try {
        const data = await api.login({ email: fd.get('email'), password: fd.get('password') });
        Auth.set(data.access_token);
        await ensureUser();
        location.hash = '#/app';
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'ورود';
      }
    });
  }
});

route('#/register', {
  private: false,
  render(root) {
    root.innerHTML = `
    <div class="auth-wrap">
      <div style="position:absolute;inset:0;opacity:.5;pointer-events:none">${resonanceArt()}</div>
      <div class="auth-card card">
        <div class="brandmark center" style="justify-content:center;margin-bottom:6px">${brandMark(26)}<span>خطیب</span></div>
        <p class="center">ساخت حساب رایگان</p>
        <form id="reg-form">
          <div class="field"><label>نام</label><input type="text" name="name"/></div>
          <div class="field"><label>ایمیل</label><input type="email" name="email" required/></div>
          <div class="field"><label>رمز عبور</label><input type="password" name="password" required minlength="8"/></div>
          <button class="btn btn-brass btn-block" type="submit">ساخت حساب</button>
        </form>
        <p class="center muted" style="margin-top:18px">حساب داری؟ <a href="#/login">وارد شو</a></p>
      </div>
    </div>`;

    root.querySelector('#reg-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
      const fd = new FormData(e.target);
      try {
        await api.register({ email: fd.get('email'), password: fd.get('password'), name: fd.get('name') || undefined });
        const data = await api.login({ email: fd.get('email'), password: fd.get('password') });
        Auth.set(data.access_token);
        await ensureUser();
        toast('خوش آمدی!', 'ok');
        location.hash = '#/app';
      } catch (err) {
        toast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'ساخت حساب';
      }
    });
  }
});
