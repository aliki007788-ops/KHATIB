# فرانت خطیب

فرانت‌اند سبک، بدون نیاز به build (Vanilla JS + CSS)، طراحی‌شده برای اتصال مستقیم به بک‌اند FastAPI پروژهٔ «خطیب». تمام endpointها بر اساس کد واقعی روترها و اسکیماهای بک‌اند شما پیاده‌سازی شده‌اند (auth با access token + کوکی refresh، اسپیچ‌لب متن/صوت، چت عراقی، ترجمه، پیشرفت، یادگیری، اشتراک، حریم خصوصی، ادمین).

## ساختار

```
index.html
css/design.css   ← دیزاین سیستم (رنگ، تایپوگرافی، کامپوننت‌ها)
css/pages.css    ← استایل صفحات
js/api.js        ← کلاینت API + مدیریت توکن/refresh
js/ui.js         ← کمکی‌های UI (toast, modal, گیج امتیاز, آیکون‌ها)
js/router.js     ← روتر hash-based + shell برنامه
js/pages/*.js    ← هر صفحه (لندینگ، ورود، داشبورد، اسپیچ‌لب، چت، ترجمه، یادگیری، پیشرفت، اشتراک، حساب، ادمین)
```

## دو روش اجرا

### ۱) هم‌سرور با بک‌اند (ساده‌ترین حالت)

فولدر این فرانت را به‌عنوان یک static mount در `app/main.py` اضافه کنید (کنار mount موجود سوییگر):

```python
from fastapi.staticfiles import StaticFiles
FRONTEND_DIR = BASE_DIR.parent / "khatib-frontend"   # مسیر را مطابق محل واقعی تنظیم کنید
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
```

⚠️ این mount باید **بعد از** ثبت همهٔ روترهای `/api/...` انجام شود تا با آن‌ها تداخل نکند. در این حالت `window.KHATIB_API_BASE` را خالی (`""`) نگه دارید — چون فرانت و بک‌اند هم‌مبدأ (same-origin) هستند، کوکی refresh و CORS اصلاً درگیر نمی‌شوند.

### ۲) جدا از بک‌اند (روی دامنه/پورت دیگر)

فایل‌ها را با هر static server ساده (nginx, `python -m http.server`, Netlify, …) سرو کنید و:

1. در `index.html` مقدار بدهید:
   ```js
   window.KHATIB_API_BASE = "https://api.example.com";
   ```
2. در بک‌اند، متغیر `CORS_ORIGINS` را در `.env` طوری تنظیم کنید که آدرس فرانت شما را شامل شود (مثلاً `CORS_ORIGINS=https://app.example.com`). میدل‌ور CORS بک‌اند از قبل با `allow_credentials=True` پیکربندی شده، پس کوکی refresh بین دو مبدأ هم کار می‌کند — فقط باید هر دو روی HTTPS باشند و نام دامنه دقیق در لیست باشد.

## نکات مهم

- **توکن‌ها:** access token کوتاه‌عمر در حافظه/`localStorage` نگه‌داری می‌شود و در هدر `Authorization: Bearer` ارسال می‌شود. refresh token در کوکی httpOnly است که بک‌اند خودش تنظیم می‌کند؛ فرانت هیچ‌وقت مستقیم به آن دسترسی ندارد. با گرفتن ۴۰۱، `api.js` خودکار یک بار `/api/auth/refresh` را صدا می‌زند و درخواست را تکرار می‌کند.
- **ضبط صدا:** صفحهٔ اسپیچ‌لب از `MediaRecorder` مرورگر استفاده می‌کند و فایل webm را به `POST /api/speech/audio` (multipart: `topic_label` + `file`) می‌فرستد؛ چون مرورگرها دسترسی میکروفون را فقط روی HTTPS یا `localhost` می‌دهند، برای تست لوکال از `localhost` استفاده کنید.
- **CSP:** میدل‌ور `SecurityHeadersMiddleware` بک‌اند فعلاً در `main.py` کامنت است. اگر آن را فعال کردید، باید `fonts.googleapis.com` و `fonts.gstatic.com` را به `style-src`/`font-src` اضافه کنید تا فونت‌های فارسی (Vazirmatn, Markazi Text) لود شوند.
- **پرداخت:** دکمهٔ ارتقای پلن، `POST /api/billing/checkout` را صدا می‌زند و کاربر را به `payment_url` برگشتی هدایت می‌کند؛ بازگشت از درگاه از طریق `GET /api/billing/callback` روی خود بک‌اند مدیریت می‌شود، فرانت فقط صفحهٔ اشتراک را دوباره می‌خواند.
- بدون هیچ build step یا وابستگی npm — فقط HTML/CSS/JS خام.

## هویت بصری

پالت رنگی از فضای منبر و چراغ خطابه الهام گرفته: مرکب تیره (`--ink`) به‌عنوان زمینه، برنز گرم (`--brass`) برای صدا/امتیاز/CTA، و اناری تیره (`--wine`) برای المان‌های گفتگو. تایپوگرافی از ترکیب Markazi Text (تیترها، حس کلاسیک خطابه) و Vazirmatn (متن/رابط کاربری، خوانایی بالا) استفاده می‌کند.
