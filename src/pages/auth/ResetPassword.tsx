import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("لینک بازیابی معتبر نیست یا توکن آن وجود ندارد.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password,
      });

      setSuccess(true);
      setMessage(response.data.message || "رمز عبور با موفقیت تغییر کرد.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "تغییر رمز عبور انجام نشد. ممکن است لینک منقضی یا استفاده شده باشد.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pr-11 pl-12 text-sm text-slate-800 outline-none transition-all duration-200 placeholder hover focus focus focus focus/10";

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <header className="mb-7 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/20">
            <KeyRound size={30} strokeWidth={1.8} />
          </div>

          <p className="text-sm font-bold tracking-wide text-blue-700">
            PetCard
          </p>

          <h1 className="mt-2 text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            تعیین رمز عبور جدید
          </h1>

          <p className="mt-3 max-w-sm text-center text-sm leading-7 text-slate-500">
            یک رمز عبور جدید و امن برای حسابت انتخاب کن تا دوباره به پت‌کارت
            دسترسی داشته باشی.
          </p>
        </header>

        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:p-8">
          {!token ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <LockKeyhole
                  size={22}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <div>
                  <h2 className="font-bold text-red-800">
                    لینک بازیابی معتبر نیست
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-red-700">
                    توکن بازیابی در آدرس صفحه پیدا نشد. لطفاً یک لینک جدید
                    درخواست کن.
                  </p>
                </div>
              </div>

              <Link
                to="/forgot-password"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-700 to-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
              >
                درخواست لینک جدید
                <ArrowLeft
                  size={19}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </Link>
            </div>
          ) : success ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-7 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-emerald-900">
                  رمز عبورت تغییر کرد!
                </h2>

                <p
                  role="status"
                  className="mt-2 text-sm leading-7 text-emerald-800"
                >
                  {message}
                </p>
              </div>

              <Link
                to="/login"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-700 to-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
              >
                ورود با رمز جدید
                <ArrowLeft
                  size={19}
                  className="transition-transform group-hover:-translate-x-1"
                />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    انتخاب رمز امن
                  </h2>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    رمز جدیدت باید حداقل ۸ کاراکتر داشته باشه.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    رمز عبور جدید
                  </label>

                  <div className="group relative">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="حداقل ۸ کاراکتر"
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"
                      }
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    برای امنیت بیشتر از رمز عبور منحصربه‌فرد استفاده کن.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    تکرار رمز عبور جدید
                  </label>

                  <div className="group relative">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
                    />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                      placeholder="رمز عبور را دوباره وارد کن"
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={
                        showConfirmPassword
                          ? "مخفی کردن تکرار رمز عبور"
                          : "نمایش تکرار رمز عبور"
                      }
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-700 to-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      در حال تغییر رمز...
                    </>
                  ) : (
                    <>
                      <span>ثبت رمز عبور جدید</span>
                      <ArrowLeft
                        size={19}
                        className="transition-transform duration-200 group-hover:-translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {!success && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <Link
                to="/login"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3.5 text-sm font-extrabold text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-100 hover:text-blue-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 active:translate-y-0"
              >
                <ArrowRight
                  size={19}
                  strokeWidth={2.5}
                  className="text-black transition-transform duration-200 group-hover:translate-x-1"
                />
                <span className="text-black"> بازگشت به صفحه ورود</span>
              </Link>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs leading-6 text-slate-400">
          PetCard — همراه مطمئن مراقبت از حیوانات خانگی
        </p>
      </div>
    </main>
  );
}

export default ResetPassword;
