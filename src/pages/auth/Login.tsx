import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Heart,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  const getRolePath = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin";
      case "veterinarian":
        return "/clinic";
      case "trainer":
        return "/trainer";
      case "walker":
        return "/walker";
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
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 size-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-[30rem] rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-3xl" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_80px_-24px_rgba(37,99,235,0.22)] lg:min-h-[680px] lg:grid-cols-2">
        {/* Login form */}
        <section className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <Link
            to="/"
            className="mb-9 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-200/70">
              <PawPrint size={27} strokeWidth={2.3} />
            </span>

            <span>
              <span className="block text-xl font-black tracking-tight text-slate-900">
                پت‌کارت
              </span>
              <span className="mt-0.5 block text-xs font-semibold tracking-wide text-blue-600">
                PETCARD
              </span>
            </span>
          </Link>

          <div className="mb-7">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <Heart size={14} />
              همراه هوشمند حیوانات خانگی
            </span>

            <h1 className="text-2xl font-black leading-relaxed text-slate-900 sm:text-3xl">
              خوش برگشتی!
            </h1>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              وارد حساب کاربری‌ات شو و مراقبت از دوست کوچکت رو ادامه بده.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              <span className="mt-0.5 font-black">!</span>
              <span>{error}</span>
            </div>
          )}

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                آدرس ایمیل
              </label>

              <div className="group relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                  dir="ltr"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-4 pr-12 text-left text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="text-sm font-bold text-slate-700"
                >
                  گذرواژه
                </label>
              </div>

              <div className="group relative">
                <ShieldCheck
                  size={19}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="گذرواژه خود را وارد کنید"
                  required
                  minLength={4}
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "مخفی کردن گذرواژه" : "نمایش گذرواژه"
                  }
                  className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            <div className="-mt-2 flex justify-end">
              <Link
                to="/forgot-password"
                className="inline-flex rounded-lg px-2 py-1.5 text-sm font-bold text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-800 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                فراموشی رمز عبور؟
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group mt-1 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200/70 transition duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-200/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  در حال ورود...
                </>
              ) : (
                <>
                  ورود به پت‌کارت
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">حساب کاربری پت‌کارت</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            هنوز حساب نداری؟{" "}
            <Link
              to="/register"
              className="inline-flex rounded-lg px-2 py-1 font-extrabold text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-800 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              ثبت‌نام کن
            </Link>
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 self-center rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={14} />
            بازگشت به صفحه اصلی
          </Link>
        </section>

        {/* Visual panel */}
        <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 px-10 py-12 text-center lg:flex">
          <div className="absolute -right-20 top-0 size-72 rounded-full bg-white/70 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute right-12 top-12 size-16 rounded-2xl border border-white/70 bg-white/40 rotate-12" />
          <div className="absolute bottom-20 right-20 size-10 rounded-xl bg-white/50 -rotate-12" />

          <div className="relative flex size-64 items-center justify-center rounded-[3rem] border border-white/80 bg-white/60 shadow-2xl shadow-blue-200/50 backdrop-blur-sm xl:size-72">
            <div className="absolute inset-4 rounded-[2.4rem] border border-blue-100/80" />

            <div className="relative flex size-44 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-50 xl:size-48">
              <PawPrint
                size={100}
                strokeWidth={1.4}
                className="text-blue-600"
              />
            </div>

            <span className="absolute -left-4 top-8 flex size-14 items-center justify-center rounded-2xl border border-white bg-white text-blue-600 shadow-lg shadow-blue-100">
              <Heart size={25} />
            </span>

            <span className="absolute -bottom-3 -right-3 flex size-14 items-center justify-center rounded-2xl border border-white bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Stethoscope size={25} />
            </span>
          </div>

          <div className="relative mt-11 max-w-md">
            <span className="text-xs font-extrabold tracking-widest text-blue-600">
              CARE · HEALTH · HAPPINESS
            </span>

            <h2 className="mt-4 text-3xl font-black leading-relaxed text-slate-900 xl:text-4xl">
              مراقبت بهتر،
              <span className="block text-blue-600">زندگی شادتر</span>
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-8 text-slate-600">
              پرونده سلامت، یادآوری واکسن‌ها و نوبت دامپزشکی؛ همه در یک همراه
              هوشمند برای دوست دوست‌داشتنی تو.
            </p>
          </div>

          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-4 py-2.5 text-xs font-bold text-blue-800 shadow-sm">
              <ShieldCheck size={16} />
              پرونده سلامت
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/75 px-4 py-2.5 text-xs font-bold text-blue-800 shadow-sm">
              <Heart size={16} />
              مراقبت هوشمند
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Login;
