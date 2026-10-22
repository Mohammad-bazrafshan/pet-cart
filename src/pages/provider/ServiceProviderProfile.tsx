
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/useAuth";

type ProviderProfile = {
  user_id: number;
  name: string;
  email: string;
  role: "trainer" | "walker";
  phone: string | null;
  province: string | null;
  city: string | null;
  address: string | null;
  bio: string | null;
  experience_years: number;
  specialties: string[];
  price: string | number | null;
  price_unit: string | null;
};

type ProfileForm = {
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  bio: string;
  experienceYears: number;
  specialties: string;
  price: string;
  priceUnit: string;
};

const emptyForm: ProfileForm = {
  name: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  bio: "",
  experienceYears: 0,
  specialties: "",
  price: "",
  priceUnit: "هر جلسه",
};

function ServiceProviderProfile() {
  const { user } = useAuth();

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isTrainer = user?.role === "trainer";

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ProviderProfile>(
          "/providers/me",
        );

        if (!active) return;

        const profile = response.data;

        setEmail(profile.email);

        setForm({
          name: profile.name ?? "",
          phone: profile.phone ?? "",
          province: profile.province ?? "",
          city: profile.city ?? "",
          address: profile.address ?? "",
          bio: profile.bio ?? "",
          experienceYears: Number(profile.experience_years ?? 0),
          specialties: (profile.specialties ?? []).join(", "),
          price:
            profile.price === null || profile.price === undefined
              ? ""
              : String(profile.price),
          priceUnit: profile.price_unit ?? "هر جلسه",
        });
      } catch (err) {
        console.error(err);

        if (active) {
          setError("دریافت اطلاعات پروفایل ناموفق بود.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("نام و نام خانوادگی الزامی است.");
      return;
    }

    if (
      !Number.isInteger(Number(form.experienceYears)) ||
      Number(form.experienceYears) < 0
    ) {
      setError("سابقه کاری باید عدد صحیح و غیرمنفی باشد.");
      return;
    }

    if (
      form.price.trim() !== "" &&
      (!Number.isFinite(Number(form.price)) ||
        Number(form.price) < 0)
    ) {
      setError("قیمت واردشده معتبر نیست.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/providers/me", {
        name: form.name.trim(),
        phone: form.phone,
        province: form.province,
        city: form.city,
        address: form.address,
        bio: form.bio,
        experienceYears: Number(form.experienceYears),
        specialties: form.specialties
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        price: form.price.trim() === "" ? null : Number(form.price),
        priceUnit: form.priceUnit,
      });

      setSuccess(
        response.data?.message ?? "پروفایل با موفقیت ذخیره شد.",
      );
    } catch (err) {
      console.error(err);
      setError("ذخیره اطلاعات ناموفق بود. لطفاً دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  if (loading) {
    return (
      <div dir="rtl" className="rounded-2xl bg-white p-8 text-slate-600">
        در حال دریافت اطلاعات پروفایل...
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-l from-blue-700 to-sky-500 p-7 text-white">
        <p className="text-sm text-blue-100">حساب کاربری من</p>

        <h1 className="mt-2 text-2xl font-black">
          {isTrainer ? "پروفایل ترینر" : "پروفایل واکر"}
        </h1>

        <p className="mt-3 text-sm leading-7 text-blue-50">
          اطلاعات تماس، سوابق کاری و مشخصات خدماتت رو مدیریت کن.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"
      >
        <div>
          <h2 className="text-lg font-black text-slate-900">
            اطلاعات شخصی
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            نام و راه‌های ارتباطی
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">
            نام و نام خانوادگی
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            ایمیل
            <input
              className={`${inputClass} bg-slate-50 text-slate-500`}
              value={email}
              readOnly
              type="email"
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            شماره تماس
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              type="tel"
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            استان
            <input
              className={inputClass}
              value={form.province}
              onChange={(e) => updateField("province", e.target.value)}
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            شهر
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </label>

          <label className="text-sm font-bold text-slate-700">
            سابقه کاری (سال)
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={form.experienceYears}
              onChange={(e) =>
                updateField(
                  "experienceYears",
                  Number(e.target.value),
                )
              }
              required
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-700">
          آدرس
          <textarea
            className={inputClass}
            rows={2}
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </label>

        <label className="block text-sm font-bold text-slate-700">
          درباره من و تجربه کاری
          <textarea
            className={inputClass}
            rows={4}
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="درباره تجربه، روش کار و خدماتت بنویس..."
          />
        </label>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-lg font-black text-slate-900">
            اطلاعات خدمات و قیمت‌گذاری
          </h2>

          <label className="mt-5 block text-sm font-bold text-slate-700">
            تخصص‌ها
            <input
              className={inputClass}
              value={form.specialties}
              onChange={(e) =>
                updateField("specialties", e.target.value)
              }
              placeholder="مثلاً آموزش پایه، اصلاح رفتار"
            />
            <span className="mt-2 block text-xs font-normal text-slate-500">
              تخصص‌ها را با ویرگول انگلیسی یا فارسی جدا کن.
            </span>
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              قیمت پایه (تومان)
              <input
                className={inputClass}
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="مثلاً 500000"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              واحد قیمت
              <select
                className={inputClass}
                value={form.priceUnit}
                onChange={(e) =>
                  updateField("priceUnit", e.target.value)
                }
              >
                <option value="هر جلسه">هر جلسه</option>
                <option value="هر ساعت">هر ساعت</option>
                <option value="هر روز">هر روز</option>
                <option value="هر نوبت">هر نوبت</option>
              </select>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}

export default ServiceProviderProfile;
