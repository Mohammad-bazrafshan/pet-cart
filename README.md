# پت‌کارت

فرانت‌اند React و API مبتنی بر NestJS برای مدیریت حساب کاربری و اطلاعات حیوانات خانگی.

## نیازمندی‌ها

- Node.js 20 یا بالاتر
- PostgreSQL 14 یا بالاتر (محلی یا یک سرویس مدیریت‌شده)

## راه‌اندازی API

از پوشه‌ی پروژه:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

ابتدا با pgAdmin یا ابزار مورداعتمادت یک دیتابیس به نام `petcart` بساز. سپس مقادیر `DATABASE_URL` و `JWT_SECRET` را در `backend/.env` تنظیم کن. مقدار `DATABASE_URL` باید به نام کاربری و گذرواژه واقعی PostgreSQL تو اشاره کند؛ مقدارهای نمونه در `.env.example` صرفاً جای‌نگهدارند. مقدار `JWT_SECRET` باید یک راز تصادفیِ حداقل ۳۲ کاراکتری باشد و نباید در مخزن ثبت یا با کسی به اشتراک گذاشته شود.

نمونه‌ی قالب آدرس اتصال:

```text
postgresql://<نام‌کاربری>:<گذرواژه>@localhost:5432/petcart?schema=public
```

اگر گذرواژه در URL نویسه‌های ویژه دارد، آن را URL-encode کن.

برای اجرای migrationها و آماده‌سازی Prisma:

```powershell
npm run db:deploy
npm run db:generate
```

سپس API را در حالت توسعه اجرا کن:

```powershell
npm run start:dev
```

API روی `http://localhost:3000/api` اجرا می‌شود. اتصال PostgreSQL باید پیش از اجرای سرور برقرار باشد.

## راه‌اندازی فرانت‌اند

در پنجره‌ی PowerShell دیگری، از ریشه‌ی پروژه:

```powershell
npm install
npm run dev
```

Vite مسیر `/api` را به بک‌اند محلی هدایت می‌کند. در صورت استقرار روی محیط دیگر می‌توان `VITE_API_URL` را برای فرانت و `FRONTEND_ORIGIN` را برای API تنظیم کرد.

برای دیدن داشبورد بدون راه‌اندازی دیتابیس یا API، فرانت‌اند را با `npm run dev` اجرا کن و در صفحه‌ی ورود دکمه‌ی «ورود نمایشی و دیدن داشبورد» را بزن. حالت نمایشی فقط در محیط توسعه فعال است و داده‌های نمونه را در حافظه نگه می‌دارد.

## مسیرهای پیاده‌سازی‌شده

- `POST /api/auth/register` و `POST /api/auth/login`: ایجاد حساب و ورود
- `GET /api/auth/me` و `POST /api/auth/logout`: بررسی حساب و خروج
- `GET /api/pets`, `POST /api/pets`, `GET /api/pets/:id`, `PATCH /api/pets/:id`, `DELETE /api/pets/:id`: مدیریت حیوانات متعلق به کاربر واردشده

نشست با کوکی `httpOnly`، `SameSite=Lax` و عمر ۸ ساعته نگه‌داری می‌شود. گذرواژه‌ها با bcrypt هش می‌شوند و مالکیت هر حیوان در API بررسی می‌شود.

## محدوده فعلی

ثبت‌نام/ورود و اطلاعات پایه حیوانات به PostgreSQL وصل شده‌اند. نوبت‌ها، یادآوری‌ها و پرونده پزشکی هنوز در API پیاده‌سازی نشده‌اند و رابط کاربری آن‌ها فعلاً وضعیت خالی را نشان می‌دهد.
