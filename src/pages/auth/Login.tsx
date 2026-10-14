
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

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  const getRolePath = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "veterinarian":
        return "/clinic";
      case "admin":
        return "/admin";
      case "owner":
      default:
        return "/dashboard";
    }
  };

  if (user) {
    return <Navigate to={getRolePath(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      setLoading(true);
      await login({ email, password });

      // هدایت به مسیر متناسب با نقش کاربر
      const savedUser = JSON.parse(
        localStorage.getItem("petcard_user") ?? "null",
      );

      navigate(getRolePath(savedUser?.role), { replace: true });
    } catch (error) {
      console.error(error);
      setError("ایمیل یا رمز عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <main
      dir="rtl"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-10 text-slate-800"
    >
      <div className="pointer-events-none absolute -right-32 -top-24 -z-10 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl shadow-blue-100/60 lg:min-h-[650px] lg:grid-cols-2">
        {/* فرم ورود */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
          <Link to="/" className="mb-10 inline-flex items-center gap-3 self-start">
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

          <span className="mb-3 text-sm font-bold text-blue-600">
            خوش برگشتی!
          </span>

          <h1 className="text-2xl font-black leading-relaxed text-slate-900 sm:text-3xl">
            ورود به حساب کاربری
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            برای دیدن پرونده سلامت دوست کوچکت وارد شو.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <form className="mt-7 grid gap-3" onSubmit={handleSubmit}>
            <label htmlFor="login-email" className="text-sm font-bold text-slate-700">
              ایمیل
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <label htmlFor="login-password" className="mt-2 text-sm font-bold text-slate-700">
              گذرواژه
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="گذرواژه خود را وارد کنید"
              required
              minLength={4}
              className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "در حال ورود..." : "ورود به پت‌کارت"}
              <span aria-hidden="true">←</span>
            </button>
          </form>

          

          <p className="mt-7 text-center text-sm text-slate-500">
            هنوز حساب نداری؟{" "}
            <Link to="/register" className="font-extrabold text-blue-600 hover:text-blue-700">
              ثبت‌نام کن
            </Link>
          </p>

          <Link
            to="/"
            className="mt-5 self-center text-xs font-medium text-slate-500 transition hover:text-blue-600"
          >
            ← بازگشت به صفحه اصلی
          </Link>
        </section>

        {/* بخش تصویری */}
        <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 px-10 py-12 text-center lg:flex">
          <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-blue-200/40 blur-2xl" />

          <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/80 bg-white/60 shadow-xl shadow-blue-100/50">
            <span className="text-[120px]" role="img" aria-label="سگ">
              🐶
            </span>
            <span className="absolute bottom-5 left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg">
              🐾
            </span>
          </div>

          <h2 className="relative mt-10 text-2xl font-black leading-relaxed text-slate-900">
            مراقبت بهتر،
            <span className="block text-blue-600">زندگی شادتر</span>
          </h2>

          <p className="relative mt-4 max-w-sm text-sm leading-8 text-slate-600">
            پرونده سلامت، یادآوری واکسن‌ها و نوبت دامپزشکی؛ همه در یک همراه
            دوست‌داشتنی.
          </p>

          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700">
              🩺 پرونده سلامت
            </span>
            <span className="rounded-full border border-white bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700">
              🔔 یادآوری مراقبت
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Login;
