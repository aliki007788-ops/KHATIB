route('#/', {
  private: false,
  render(root) {
    root.innerHTML = `
    <header class="pub-nav">
      <div class="container">
        <div class="brandmark">${brandMark(28)}<span>خطیب</span></div>
        <div class="pub-links">
          <a href="#/#features">امکانات</a>
          <a href="#/#pricing">تعرفه‌ها</a>
          <a href="#/login" class="btn btn-ghost btn-sm">ورود</a>
          <a href="#/register" class="btn btn-brass btn-sm">شروع رایگان</a>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="container hero-grid">
        <div>
          <div class="hero-eyebrow">مربی هوشمند سخنوری و لهجهٔ عراقی</div>
          <h1>صدای خودت را <br/>به‌جای بگذار.</h1>
          <p style="font-size:1.05rem;max-width:520px">خطیب سخنرانی‌های تو را می‌شنود، تحلیل می‌کند و قدم‌به‌قدم برایت روشن می‌کند کجا رسا حرف می‌زنی و کجا باید مکث کنی، بلندتر بگویی یا واضح‌تر ادا کنی — و در کنارش لهجهٔ عراقی را با گفتگوهای واقعی تمرین می‌کنی.</p>
          <div class="hero-actions">
            <a href="#/register" class="btn btn-brass">ساخت حساب رایگان</a>
            <a href="#/login" class="btn btn-ghost">ورود به حساب</a>
          </div>
        </div>
        <div class="hero-visual">${resonanceArt()}</div>
      </div>
    </section>

    <section class="section" id="features">
      <div class="container">
        <div class="section-head">
          <div class="hero-eyebrow">امکانات</div>
          <h2>هرچه برای رساتر شدن لازم داری</h2>
        </div>
        <div class="feature-row">
          <div class="feature-card"><span class="num">۰۱</span><h3>اتاق سخنرانی</h3><p>متن بنویس یا صدایت را ضبط کن؛ تحلیل فوری در ابعاد وضوح، ریتم، اعتماد‌به‌نفس و واژگان دریافت کن.</p></div>
          <div class="feature-card"><span class="num">۰۲</span><h3>گفتگوی عراقی</h3><p>با هم‌صحبت هوشمند به لهجهٔ عراقی گفتگو کن، در موقعیت‌های واقعی روزمره.</p></div>
          <div class="feature-card"><span class="num">۰۳</span><h3>مسیر یادگیری</h3><p>سطح‌بندی شده، سناریومحور، با واژگان کلیدی هر مرحله — قدم‌به‌قدم پیش برو.</p></div>
        </div>
      </div>
    </section>

    <section class="section" id="pricing">
      <div class="container">
        <div class="section-head">
          <div class="hero-eyebrow">تعرفه‌ها</div>
          <h2>هر مسیر رشد، یک پلن</h2>
        </div>
        <div class="pricing-row">
          ${['free','base','pro','enterprise'].map(p => `
            <div class="plan-card ${p === 'pro' ? 'featured' : ''}">
              <div class="badge ${p === 'pro' ? 'badge-brass' : ''}">${planLabel(p)}</div>
              <div class="plan-price">${p === 'free' ? 'رایگان' : fmtToman(planPrice(p))}<br/><small>${p === 'free' ? '' : 'در ماه'}</small></div>
              <ul class="plan-features">
                ${p === 'free' ? '<li>۳ سخنرانی در ماه</li><li>۳ دقیقه صوت</li>' :
                  p === 'base' ? '<li>۳۰ سخنرانی در ماه</li><li>۳۰ دقیقه صوت</li>' :
                  '<li>سخنرانی نامحدود</li><li>صوت نامحدود</li>'}
                <li>گفتگوی عراقی</li>
                <li>مسیر یادگیری کامل</li>
              </ul>
              <a href="#/register" class="btn ${p === 'pro' ? 'btn-brass' : 'btn-ghost'} btn-block">شروع کن</a>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <footer class="pub-foot">
      <div class="container row" style="justify-content:space-between">
        <div>${brandMark(20)} خطیب</div>
        <div>© ${new Date().getFullYear()}</div>
      </div>
    </footer>
    `;
  }
});

route('#/404', {
  private: false,
  render(root) { root.innerHTML = `<div class="empty-state" style="padding-top:120px"><h2>یافت نشد</h2><a href="#/" class="btn btn-ghost">بازگشت به خانه</a></div>`; }
});
