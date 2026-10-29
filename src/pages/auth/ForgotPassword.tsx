import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
ArrowLeft,
ArrowRight,
CheckCircle2,
LockKeyhole,
Mail,
ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function ForgotPassword() {
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setMessage("");
setError("");
setLoading(true);

try {
  const response = await axios.post(
    `${API_URL}/auth/forgot-password`,
    { email: email.trim() },
  );

  setMessage(
    response.data.message ||
      "اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی ارسال خواهد شد.",
  );
} catch (err: any) {
  setError(
    err.response?.data?.message ||
      "ارسال درخواست با خطا مواجه شد. دوباره تلاش کن.",
  );
} finally {
  setLoading(false);
}

}

return (
<main
   dir="rtl"
   className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12"
 >
{/* Background decorations */}
<div
     aria-hidden="true"
     className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl"
   />
<div
     aria-hidden="true"
     className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
   />

  <div className="relative w-full max-w-md">
    {/* Brand */}
    <div className="mb-7 flex flex-col items-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/20">
        <LockKeyhole size={30} strokeWidth={1.8} />
      </div>

      <p className="text-sm font-bold tracking-wide text-blue-700">
        PetCard
      </p>

      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        بازیابی رمز عبور
      </h1>

      <p className="mt-3 max-w-sm text-center text-sm leading-7 text-slate-500">
        نگران نباش! ایمیل حسابت رو وارد کن تا مراحل بازیابی رمز عبور رو
        برات ارسال کنیم.
      </p>
    </div>

    {/* Form card */}
    <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <ShieldCheck size={21} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800">
            حساب کاربری تو امنه
          </h2>
          <p className="mt-1 text-xs leading-6 text-slate-600">
            لینک بازیابی فقط برای تغییر رمز عبور حسابت استفاده می‌شه.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            آدرس ایمیل
          </label>

          <div className="group relative">
            <Mail
              size={19}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
              required
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-4 pr-11 text-left text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {message && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
          >
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p>{message}</p>
          </div>
        )}

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
              <span>در حال ارسال درخواست...</span>
            </>
          ) : (
            <>
              <span>ارسال لینک بازیابی</span>
              <ArrowLeft
                size={19}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-xs text-slate-400">یا</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <Link
        to="/login"
        className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3.5 text-sm font-extrabold text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-100 hover:text-blue-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 active:translate-y-0"
      >
        <ArrowRight
          size={19}
          strokeWidth={2.5}
          className="transition-transform duration-200 group-hover:translate-x-1 text-black"
        />
        <span className="text-black">        بازگشت به صفحه ورود
</span>
      </Link>
    </section>

    <p className="mt-6 text-center text-xs leading-6 text-slate-400">
      PetCard — همراه مطمئن مراقبت از حیوانات خانگی
    </p>
  </div>
</main>

);
}

export default ForgotPassword;