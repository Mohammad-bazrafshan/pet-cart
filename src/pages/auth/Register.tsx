
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

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

function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, register } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      setLoading(true);

      await register({ name, email, password });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setError("ثبت‌نام با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-8 text-slate-800"
    >
      <div className="pointer-events-none absolute -right-32 -top-24 -z-10 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl shadow-blue-100/60 lg:min-h-[700px] lg:grid-cols-2">
        {/* فرم ثبت‌نام */}
        <section className="flex flex-col justify-center px-6 py-9 sm:px-12 lg:px-14">
          <Link to="/" className="mb-7 inline-flex items-center gap-3 self-start">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <PawIcon />
            </span>
            <span>
              <span className="block text-xl font-extrabold text-slate-900">
                پت‌کارت
              </span>
              <span className="mt-1 block text-xs font-medium text-blue-600">
                PetCard
              </span>
            </span>
          </Link>

          <span className="mb-2 text-sm font-bold text-blue-600">
            به جمع ما خوش آمدی
          </span>

          <h1 className="text-2xl font-black leading-relaxed text-slate-900 sm:text-3xl">
            یک حساب برای همه پنجه‌ها
          </h1>

          <p className="mt-2 text-sm leading-7 text-slate-500">
            حساب بساز و مراقبت از دوست کوچکت را ساده‌تر دنبال کن.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <form className="mt-5 grid gap-2.5" onSubmit={handleSubmit}>
            <label htmlFor="register-name" className="mt-1 text-sm font-bold text-slate-700">
              نام و نام خانوادگی
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="مثلاً محمد رضایی"
              required
              minLength={2}
              maxLength={100}
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <label htmlFor="register-email" className="mt-2 text-sm font-bold text-slate-700">
              ایمیل
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <label htmlFor="register-password" className="mt-2 text-sm font-bold text-slate-700">
              گذرواژه
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="حداقل ۸ کاراکتر"
              required
              minLength={8}
              maxLength={72}
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "در حال ساخت حساب..." : "ساخت حساب کاربری"}
              <span aria-hidden="true">←</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            قبلاً ثبت‌نام کرده‌ای؟{" "}
            <Link to="/login" className="font-extrabold text-blue-600 hover:text-blue-700">
              وارد شو
            </Link>
          </p>

          <Link
            to="/"
            className="mt-4 self-center text-xs font-medium text-slate-500 transition hover:text-blue-600"
          >
            ← بازگشت به صفحه اصلی
          </Link>
        </section>

        {/* بخش تصویری */}
        <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-10 py-12 text-center lg:flex">
          <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-blue-200/40 blur-2xl" />

          <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/80 bg-white/60 shadow-xl shadow-blue-100/50">
            <span className="text-[120px]" role="img" aria-label="گربه">
              🐱
            </span>
            <span className="absolute bottom-5 left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">
              🐾
            </span>
          </div>

          <h2 className="relative mt-10 text-2xl font-black leading-relaxed text-slate-900">
            هر مراقبت کوچک،
            <span className="block text-blue-600">یک عمر دوست‌داشتن است</span>
          </h2>

          <p className="relative mt-4 max-w-sm text-sm leading-8 text-slate-600">
            اطلاعات دوست کوچکت را منظم نگه دار و با خیال آسوده، مراقبت از او را
            دنبال کن.
          </p>

          <div className="relative mt-8 rounded-2xl border border-white bg-white/80 px-5 py-4 text-sm font-semibold text-blue-700 shadow-sm">
            🩺 شروع یک مسیر تازه برای مراقبت بهتر
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Register;
