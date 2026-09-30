# خطیب (Khatib) v5.0 — محصول نهایی

مربیگری سخنرانی فارسی + یادگیری گویش عراقی
Backend: FastAPI Modular Monolith | PostgreSQL | Redis | AI | ZarinPal | Eitaa
Frontend: HTML/CSS/JS خالص (بدون build)، در `frontend/`، به‌صورت خودکار توسط خود بک‌اند سرو می‌شود.

این ریپو شامل بک‌اند کامل **و** فرانت متصل به آن است — با اجرای یک دستور (`uvicorn app.main:app`)، هم API و هم رابط کاربری روی همان آدرس بالا می‌آیند.

---

## وضعیت فازها (نهایی)

| فاز | موضوع | وضعیت |
|-----|-------|-------|
| ۱ | Auth + Security + DB + Config | ✅ |
| ۲ | Billing (State Machine + Idempotency + ZarinPal) | ✅ |
| ۳ | AI Service (Retry / Fallback / Structured Output) | ✅ |
| ۴ | Speech (Text + Audio Upload + Transcription) | ✅ |
| ۵ | Worker (Job Queue Processor) | ✅ |
| ۶ | Chat (Iraqi Coach Conversations) | ✅ |
| ۷ | Eitaa Webhook (Secure) | ✅ |
| ۸ | Progress + Learning Engine | ✅ |
| ۹ | Admin API + Privacy | ✅ |
| ۱۰ | Observability + Docker + Health + Metrics | ✅ |

---

## API کامل

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Billing
- `POST /api/billing/checkout`
- `GET  /api/billing/callback`
- `GET  /api/billing/demo-pay`
- `GET  /api/billing/subscription`
- `GET  /api/billing/history`

### Speech
- `POST /api/speech/text` — تحلیل متن
- `POST /api/speech/audio` — آپلود صوت + تحلیل
- `GET  /api/speech`
- `GET  /api/speech/{id}`
- `DELETE /api/speech/{id}`

### Chat
- `POST /api/chat/conversations`
- `GET  /api/chat/conversations`
- `GET  /api/chat/conversations/{id}`
- `POST /api/chat/conversations/{id}/messages`
- `DELETE /api/chat/conversations/{id}`

### Translate
- `POST /api/translate`

### Progress & Learning
- `GET /api/progress/summary`
- `GET /api/progress/trends`
- `GET /api/learning/levels`
- `GET /api/learning/levels/{id}/scenarios`
- `POST /api/learning/scenarios/{id}/start`
- `POST /api/learning/scenarios/{id}/complete`
- `GET /api/learning/daily-recommendation`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{id}/plan`
- `PATCH /api/admin/users/{id}/active`
- `GET /api/admin/transactions`
- `GET /api/admin/subscriptions`
- `GET /api/admin/audit`

### Privacy
- `GET /api/privacy/export`
- `POST /api/privacy/delete-account`

### Eitaa
- `POST /api/eitaa/webhook`
- `GET /api/eitaa/link-status`

### Health
- `GET /health/live`
- `GET /health/ready`
- `GET /metrics`

---

## راه‌اندازی سریع (Development)

```bash
# 0. محیط مجازی (پیشنهادی)
python -m venv venv
source venv/bin/activate        # ویندوز: venv\Scripts\activate

# 1. وابستگی‌ها
pip install -r requirements.txt

# 2. محیط
cp .env.example .env
python scripts/generate_secrets.py
# مقادیر JWT_SECRET و PASSWORD_PEPPER چاپ‌شده را داخل .env جایگزین کن
# برای فعال بودن گفتگو/تحلیل هوشمند: AI_API_KEY را هم در .env پر کن

# 3. دیتابیس (ساخت جداول از روی مدل‌ها + seed مسیر یادگیری)
python scripts/init_db.py
# اگر نمی‌خواهی محتوای یادگیری seed شود: python scripts/init_db.py --no-seed

# 4. اجرا
uvicorn app.main:app --reload

# حالا هم API و هم رابط کاربری روی http://localhost:8000 در دسترس‌اند:
#   http://localhost:8000/          ← فرانت (لندینگ، ورود، داشبورد، ...)
#   http://localhost:8000/docs      ← Swagger UI
#   http://localhost:8000/api/...   ← تمام endpointها

# 5. Worker (ترمینال جدا — پردازش پس‌زمینهٔ صوت‌هایی که بلافاصله پردازش نشدند)
python worker.py
```

> نکته: `python scripts/init_db.py` فقط برای توسعهٔ لوکال است (جداول را مستقیم از مدل‌ها می‌سازد). برای production حتماً از Alembic استفاده کن (`alembic upgrade head`) — به بخش «Production» پایین مراجعه کن.

---

## فرانت‌اند

فولدر `frontend/` یک SPA سبک بدون build است (HTML/CSS/JS خالص، هویت بصری انتزاعی مرکب/برنز، RTL، فونت‌های Vazirmatn و Markazi Text). `app/main.py` این فولدر را با `StaticFiles(html=True)` روی مسیر `/` mount می‌کند — یعنی با بالا آمدن بک‌اند، فرانت هم همان‌جا در دسترس است، بدون نیاز به سرور جدا یا تنظیم CORS.

اگر خواستی فرانت را جدا (روی دامنه/پورت دیگر) دیپلوی کنی، در `frontend/index.html` مقدار `window.KHATIB_API_BASE` را به آدرس بک‌اند ست کن و در `.env` بک‌اند مقدار `CORS_ORIGINS` را به آدرس فرانت اضافه کن. جزئیات کامل در `frontend/README.md`.

---

## Production (Docker)

```bash
# .env را با مقادیر production پر کنید
# ENVIRONMENT=production
# DATABASE_URL=postgresql+psycopg://...
# PAYMENT_PROVIDER=zarinpal
# STORAGE_BACKEND=s3
# COOKIE_SECURE=true
# ...

docker compose up -d --build
```

---

## ساختار نهایی

```
khatib/
├── app/
│   ├── core/          config, db, models, security, plans, metrics, health, logging, ai_pricing
│   ├── middleware/    request_id, security_headers
│   ├── routers/       auth, billing, speech, chat, translate, progress, learning, admin, privacy, eitaa, health
│   ├── schemas/       auth, billing, speech, chat, progress, learning, admin, privacy, ai
│   ├── services/      billing, zarinpal, usage, ai*, speech, chat, storage, progress, learning, privacy, admin
│   ├── static/swagger-ui/   (دارایی‌های Swagger UI، مستقل از فرانت اصلی)
│   └── main.py
├── frontend/          رابط کاربری (HTML/CSS/JS خالص) — روی "/" mount می‌شود
├── worker.py
├── alembic/
├── scripts/           generate_secrets.py, init_db.py, seed_learning_content.py
├── tests/
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## ویژگی‌های کلیدی امنیتی و عملیاتی

- هیچ Secret پیش‌فرضی پذیرفته نمی‌شود
- Refresh Token Rotation + Reuse Detection
- Account Lockout + Rate Limiting
- Payment State Machine با `FOR UPDATE` و Idempotency
- Atomic Usage Counter
- Soft-delete + ناشناس‌سازی حساب
- Structured Logging + Request ID + Prometheus Metrics
- Production Guards سخت‌گیرانه
- Worker جداگانه برای پردازش صوت

---

**نسخه:** 5.0.0  
**وضعیت:** Production Candidate — آماده تست واقعی پرداخت، AI و Eitaa
