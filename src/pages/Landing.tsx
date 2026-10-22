import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const features = [
  {
    icon: "📋",
    title: "پرونده سلامت دیجیتال",
    description:
      "سوابق پزشکی، واکسن‌ها و اطلاعات حیوان خانگی خود را در یک پرونده منظم نگهداری کنید.",
  },
  {
    icon: "🩺",
    title: "نوبت‌دهی دامپزشکی",
    description:
      "کلینیک و دامپزشک موردنظرتان را پیدا کنید و برای دریافت خدمات، نوبت بگیرید.",
  },
  {
    icon: "🔔",
    title: "یادآوری هوشمند",
    description:
      "برای واکسن‌ها، داروها و مراقبت‌های مهم حیوان خانگی خود یادآوری داشته باشید.",
  },
];

const steps = [
  {
    number: "01",
    title: "ثبت‌نام کنید",
    description: "حساب کاربری خود را به‌سادگی بسازید.",
  },
  {
    number: "02",
    title: "حیوان خود را ثبت کنید",
    description: "اطلاعات و سوابق حیوان خانگی‌تان را وارد کنید.",
  },
  {
    number: "03",
    title: "مراقبت را شروع کنید",
    description: "از امکانات پت‌کارت برای مدیریت سلامت حیوان استفاده کنید.",
  },
];

function PawIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="42" rx="16" ry="13" />
      <ellipse cx="14" cy="27" rx="7" ry="9" transform="rotate(-25 14 27)" />
      <ellipse cx="27" cy="15" rx="7" ry="9" transform="rotate(-8 27 15)" />
      <ellipse cx="41" cy="15" rx="7" ry="9" transform="rotate(8 41 15)" />
      <ellipse cx="53" cy="27" rx="7" ry="9" transform="rotate(25 53 27)" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-white text-slate-800"
    >
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <PawIcon />
            </span>

            <span>
              <span className="block text-xl font-extrabold text-slate-900">
                پت‌کارت
              </span>
              <span
                dir="ltr"
                className="block text-xs font-medium tracking-widest text-blue-600"
              >
                PetCard
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#veterinarian-cooperation"
              className="transition hover:text-blue-600"
            >
              همکاری دامپزشکان
            </a>
            <a href="#features" className="transition hover:text-blue-600">
              امکانات
            </a>
            <a href="#how-it-works" className="transition hover:text-blue-600">
              نحوه کار
            </a>
            <a href="#clinics" className="transition hover:text-blue-600">
              برای کلینیک‌ها
            </a>
            <a href="#about" className="transition hover:text-blue-600">
              درباره ما
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
            >
              ورود
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 sm:px-5"
            >
              ثبت‌نام
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 md:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <PawIcon className="h-5 w-5" />
              مراقبت بهتر، زندگی شادتر
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.5] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              برای دوست کوچکت،
              <span className="block text-blue-600">یک همراه مهربان</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              با پت‌کارت، سلامت حیوان خانگی‌ات را هوشمندانه مدیریت کن. سوابق
              پزشکی را نگه دار، واکسن‌ها را به‌موقع به خاطر بسپار و برای دریافت
              خدمات دامپزشکی نوبت بگیر.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                شروع کنید
                <span aria-hidden="true">←</span>
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                آشنایی با امکانات
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </span>
                مدیریت سوابق سلامت
              </span>
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </span>
                یادآوری مراقبت‌ها
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-5 rounded-[3rem] bg-blue-100/80 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-5 sm:p-8">
              <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-white/60" />
              <div className="absolute -right-8 bottom-12 h-40 w-40 rounded-full bg-blue-200/40" />

              <div className="relative flex items-center justify-between">
                <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs text-slate-500">همراه همیشگی</p>
                  <p className="mt-1 font-bold text-slate-800">سلامتی دوستت</p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  ♡
                </span>
              </div>

              <div className="relative flex min-h-64 items-center justify-center py-8 sm:min-h-80">
                <div className="absolute h-56 w-56 rounded-full border border-white/80 sm:h-64 sm:w-64" />
                <div className="absolute h-44 w-44 rounded-full bg-white/60 sm:h-52 sm:w-52" />

                <div className="relative flex items-end justify-center gap-1 text-8xl drop-shadow-sm sm:text-9xl">
                  <span role="img" aria-label="سگ">
                    🐕
                  </span>
                  <span
                    className="mb-2 -mr-5 text-6xl sm:-mr-7 sm:text-7xl"
                    role="img"
                    aria-label="گربه"
                  >
                    🐈
                  </span>
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white bg-white/90 p-3.5 shadow-sm">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-lg">
                    💉
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    یادآوری واکسن
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    مراقبت در زمان مناسب
                  </p>
                </div>

                <div className="rounded-2xl border border-white bg-white/90 p-3.5 shadow-sm">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                    🩺
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    پرونده سلامت
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    سوابق همیشه همراهت
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 top-1/3 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
                🐾
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">دوست کوچولوت</p>
                <p className="mt-1 text-xs text-slate-500">
                  شایسته بهترین مراقبته
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50/80 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold text-blue-600">
              امکانات پت‌کارت
            </span>
            <h2 className="mt-3 text-3xl font-black leading-relaxed text-slate-900 sm:text-4xl">
              همه مراقبت‌های حیوان خانگی، یک‌جا
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              ابزارهایی ساده برای اینکه هیچ‌کدام از نیازهای مهم دوست کوچکت را
              فراموش نکنی.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition group-hover:bg-blue-100">
                  {feature.icon}
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-8 text-slate-600">
                  {feature.description}
                </p>

                <a
                  href="#how-it-works"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:gap-3"
                >
                  بیشتر بدانید
                  <span aria-hidden="true">←</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold text-blue-600">شروع آسان</span>
            <h2 className="mt-3 text-3xl font-black leading-relaxed text-slate-900 sm:text-4xl">
              شروع با پت‌کارت ساده است
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              فقط در چند قدم، مراقبت از حیوان خانگی‌ات را منظم‌تر کن.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-200">
                  {step.number}
                </div>

                {index !== steps.length - 1 && (
                  <div className="absolute right-[calc(50%+48px)] top-8 hidden h-px w-[calc(100%-96px)] bg-blue-200 md:block" />
                )}

                <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs leading-8 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics CTA */}

      {/* Clinics CTA */}

      {/* Cooperation CTA */}
      <section id="clinics" className="px-5 pb-20 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-l from-blue-700 via-blue-600 to-sky-500 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                همراهی با متخصصان
              </span>

              <h2 className="mt-5 text-2xl font-black leading-relaxed sm:text-3xl">
                به خانواده پت‌کارت بپیوندید
              </h2>

              <p className="mt-4 max-w-xl leading-8 text-blue-50">
                کلینیک، دامپزشک، ترینر یا واکر حیوانات هستید؟ درخواست همکاری خود
                را ثبت کنید تا پس از بررسی و تأیید ادمین، بتوانید فعالیت خود را
                در پت‌کارت آغاز کنید.
              </p>
            </div>

            <div className="grid w-full shrink-0 gap-3 sm:w-auto sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/clinic-cooperation")}
                className="rounded-2xl bg-white px-5 py-4 font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                درخواست همکاری کلینیک
              </button>

              <Link
                to="/veterinarian-cooperation"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                درخواست همکاری دامپزشک
              </Link>

              <Link
                to="/provider-cooperation?type=trainer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                درخواست همکاری ترینر
              </Link>

              <Link
                to="/provider-cooperation?type=walker"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-4 text-center font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                درخواست همکاری واکر
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-t border-slate-100 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 text-center lg:px-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PawIcon />
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            پت‌کارت؛ همراه مراقبت از دوست کوچکت
          </h2>
          <p className="max-w-2xl leading-8 text-slate-600">
            هدف ما ساده‌تر کردن مدیریت سلامت حیوانات خانگی و کمک به صاحبان آن‌ها
            برای مراقبتی منظم‌تر است.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-500 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} پت‌کارت. تمام حقوق محفوظ است.</p>

          <div className="flex items-center gap-5">
            <a href="#features" className="transition hover:text-blue-600">
              امکانات
            </a>
            <a href="#about" className="transition hover:text-blue-600">
              درباره ما
            </a>
            <Link to="/login" className="transition hover:text-blue-600">
              ورود
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
