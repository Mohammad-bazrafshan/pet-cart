
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  PawPrint,
  ShieldCheck,
  Heart,
  UserRound,
  Stethoscope,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 size-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-[30rem] rounded-full bg-sky-200/40 blur-3xl" />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_80px_-24px_rgba(37,99,235,0.22)] lg:min-h-[700px] lg:grid-cols-2">
        {/* Register form */}
        <section className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <Link
            to="/"
            className="mb-7 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
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

          <div className="mb-6">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <Sparkles size={14} />
              به خانواده پت‌کارت بپیوند
            </span>

            <h1 className="text-2xl font-black leading-relaxed text-slate-900 sm:text-3xl">
              حساب کاربری بساز
            </h1>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              شروع یک مسیر ساده‌تر برای مراقبت از دوست کوچکت.
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

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {/* Full name */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                نام و نام خانوادگی
              </label>

              <div className="group relative">
                <UserRound
                  size={19}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="مثلاً محمد رضایی"
                  required
                  minLength={2}
                  maxLength={100}
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-12 py-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                  dir="ltr"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-4 pr-12 text-left text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                گذرواژه
              </label>

              <div className="group relative">
                <ShieldCheck
                  size={19}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="حداقل ۸ کاراکتر"
                  required
                  minLength={8}
                  maxLength={72}
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/80"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "مخفی کردن گذرواژه" : "نمایش گذرواژه"
                  }
                  className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                گذرواژه باید حداقل ۸ کاراکتر داشته باشد.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-1 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200/70 transition duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-200/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  در حال ساخت حساب...
                </>
              ) : (
                <>
                  ساخت حساب کاربری
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-100" />
            <span className="text-xs text-slate-400">عضویت در پت‌کارت</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            قبلاً ثبت‌نام کرده‌ای؟{" "}
            <Link
              to="/login"
              className="font-extrabold text-blue-600 transition hover:text-blue-800"
            >
              وارد شو
            </Link>
          </p>

          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center gap-2 self-center text-xs font-semibold text-slate-400 transition hover:text-blue-600"
          >
            <ArrowLeft size={14} />
            بازگشت به صفحه اصلی
          </Link>
        </section>

        {/* Visual panel */}
        <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 px-10 py-12 text-center lg:flex">
          <div className="absolute -right-20 top-0 size-72 rounded-full bg-white/70 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-80 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute right-12 top-12 size-16 rotate-12 rounded-2xl border border-white/70 bg-white/40" />
          <div className="absolute bottom-20 right-20 size-10 -rotate-12 rounded-xl bg-white/50" />

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

          <div className="relative mt-10 max-w-md">
            <span className="text-xs font-extrabold tracking-widest text-blue-600">
              CARE · HEALTH · HAPPINESS
            </span>

            <h2 className="mt-4 text-2xl font-black leading-relaxed text-slate-900 xl:text-3xl">
              هر مراقبت کوچک،
              <span className="block text-blue-600">
                یک قدم برای زندگی شادتر
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-8 text-slate-600">
              اطلاعات دوست کوچکت را منظم نگه دار و با خیال آسوده، مراقبت از او
              را در یک فضای ساده و یکپارچه دنبال کن.
            </p>
          </div>

          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
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

export default Register;
