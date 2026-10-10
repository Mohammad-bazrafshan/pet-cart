
import { useState, type FormEvent } from "react";
import axios from "axios";

type CooperationForm = {
  clinic_name: string;
  manager_name: string;
  phone: string;
  city: string;
  description: string;
};

const initialForm: CooperationForm = {
  clinic_name: "",
  manager_name: "",
  phone: "",
  city: "",
  description: "",
};

export default function ClinicCooperationPage() {
    
  const [form, setForm] = useState<CooperationForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/clinics/cooperation-requests",
        {
          clinicName: form.clinic_name.trim(),
          managerName: form.manager_name.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          description: form.description.trim(),
        }
      );

      setSuccess(
        "درخواست شما با موفقیت ثبت شد. پس از بررسی ادمین، نتیجه به شما اطلاع داده خواهد شد."
      );

      setForm(initialForm);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید."
        );
      } else {
        setError("خطای غیرمنتظره‌ای رخ داد.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800 sm:py-16"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* بخش معرفی */}
        <section className="rounded-3xl bg-gradient-to-br from-teal-800 to-emerald-600 p-7 text-white shadow-lg sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
            همکاری با Pet Card
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-relaxed sm:text-4xl">
            کلینیک شما،
            <br />
            همراه سلامت حیوانات
          </h1>

          <p className="mt-5 text-sm leading-8 text-white/85 sm:text-base">
            با ثبت درخواست همکاری، کلینیک خود را به مجموعه Pet Card معرفی
            کنید و برای ارائه خدمات بهتر به صاحبان حیوانات خانگی همراه ما شوید.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                ✓
              </span>
              <div>
                <h2 className="font-bold">ثبت درخواست آسان</h2>
                <p className="mt-1 text-sm leading-6 text-white/75">
                  اطلاعات اولیه کلینیک را در فرم وارد کنید.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                ✓
              </span>
              <div>
                <h2 className="font-bold">بررسی توسط ادمین</h2>
                <p className="mt-1 text-sm leading-6 text-white/75">
                  درخواست شما پیش از ثبت نهایی بررسی می‌شود.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                ✓
              </span>
              <div>
                <h2 className="font-bold">شروع همکاری</h2>
                <p className="mt-1 text-sm leading-6 text-white/75">
                  پس از تأیید، اطلاعات کلینیک در سامانه ثبت می‌شود.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* فرم */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold">
              درخواست همکاری کلینیک
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              لطفاً اطلاعات زیر را با دقت تکمیل کنید.
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
            >
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="clinic_name"
                  className="mb-2 block text-sm font-semibold"
                >
                  نام کلینیک *
                </label>
                <input
                  id="clinic_name"
                  name="clinic_name"
                  value={form.clinic_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="مثلاً کلینیک مهر"
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="manager_name"
                  className="mb-2 block text-sm font-semibold"
                >
                  نام مسئول کلینیک *
                </label>
                <input
                  id="manager_name"
                  name="manager_name"
                  value={form.manager_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="نام و نام خانوادگی"
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold"
                >
                  شماره تماس *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="شماره تماس کلینیک"
                  maxLength={30}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold"
                >
                  شهر *
                </label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="شهر محل فعالیت"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold"
              >
                توضیحات تکمیلی
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} min-h-32 resize-y`}
                placeholder="درباره خدمات کلینیک و زمینه همکاری توضیح دهید..."
                maxLength={2000}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 px-5 py-3.5 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "در حال ارسال درخواست..." : "ثبت درخواست همکاری"}
            </button>

            <p className="text-center text-xs leading-6 text-slate-400">
              ثبت درخواست به معنی تأیید نهایی همکاری نیست.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
