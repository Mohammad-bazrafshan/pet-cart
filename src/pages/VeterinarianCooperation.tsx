import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Select, { type StylesConfig } from "react-select";
import {
  getProvincesList,
  getCities,
} from "@code-plate/iran-cities";

import { api, getApiErrorMessage } from "../api/client";

type Clinic = {
  id: number;
  name: string;
  province?: string | null;
  city?: string | null;
  address?: string | null;
};

type ApplicationForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  province: string;
  city: string;
  workType: string;
  description: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const initialForm: ApplicationForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  licenseNumber: "",
  specialty: "",
  province: "",
  city: "",
  workType: "full_time",
  description: "",
};

const provinceOptions: SelectOption[] = getProvincesList().map(
  (province) => ({
    value: province.fa,
    label: province.fa,
  }),
);

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "50px",
    borderRadius: "14px",
    borderColor: state.isFocused ? "#0d9488" : "#e2e8f0",
    backgroundColor: state.isDisabled ? "#f8fafc" : "#ffffff",
    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(13,148,136,0.12)"
      : "none",
    transition: "all 180ms ease",
    "&:hover": {
      borderColor: "#0d9488",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "4px 14px",
  }),
  input: (base) => ({
    ...base,
    color: "#0f172a",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 12px 35px rgba(15,23,42,0.12)",
    border: "1px solid #e2e8f0",
  }),
  menuList: (base) => ({
    ...base,
    padding: "5px",
    maxHeight: "220px",
  }),
  option: (base, state) => ({
    ...base,
    padding: "11px 13px",
    marginBottom: "2px",
    borderRadius: "9px",
    textAlign: "right",
    backgroundColor: state.isSelected
      ? "#0f766e"
      : state.isFocused
        ? "#f0fdfa"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#334155",
    cursor: "pointer",
    transition: "background-color 150ms ease",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "13px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    fontSize: "14px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

export default function VeterinarianCooperation() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicId, setClinicId] = useState("");
  const [form, setForm] = useState<ApplicationForm>(initialForm);

  const [loadingClinics, setLoadingClinics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadClinics() {
      try {
        const response = await api.get<Clinic[]>(
          "/veterinarian-cooperation/clinics",
        );

        setClinics(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoadingClinics(false);
      }
    }

    void loadClinics();
  }, []);

  const cityOptions: SelectOption[] = form.province
    ? getCities(form.province).map((city) => ({
        value: city.fa,
        label: city.fa,
      }))
    : [];

  const selectedProvince =
    provinceOptions.find(
      (option) => option.value === form.province,
    ) ?? null;

  const selectedCity =
    cityOptions.find(
      (option) => option.value === form.city,
    ) ?? null;

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.province?.trim() === form.province &&
      clinic.city?.trim() === form.city,
  );

  function updateField(
    field: keyof ApplicationForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "province" ? { city: "" } : {}),
    }));

    if (field === "province" || field === "city") {
      setClinicId("");
    }

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.province || !form.city) {
      setError("لطفاً استان و شهر را انتخاب کن.");
      return;
    }

    if (!clinicId) {
      setError("لطفاً یکی از کلینیک‌های پیشنهادی را انتخاب کن.");
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("لطفاً یک ایمیل معتبر وارد کن.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    try {
      setSubmitting(true);

      const {
        confirmPassword: _confirmPassword,
        ...applicationData
      } = form;

      const response = await api.post(
        "/veterinarian-cooperation/applications",
        {
          ...applicationData,
          email: normalizedEmail,
          clinicId: Number(clinicId),
        },
      );

      setSuccess(
        response.data.message ||
          "درخواست همکاری با موفقیت ثبت شد. پس از تأیید کلینیک، حساب کاربری ساخته می‌شود.",
      );

      setForm(initialForm);
      setClinicId("");
      setShowPassword(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-teal-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

  const labelClass =
    "mb-2.5 block text-sm font-semibold text-slate-700";

  const sectionClass =
    "rounded-2xl border border-slate-100 bg-white p-5 sm:p-7";

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#f5f9f8] px-4 py-8 text-slate-800 sm:px-6 sm:py-12"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            className="mb-7 inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
          >
            <span aria-hidden="true">→</span>
            بازگشت به صفحه اصلی
          </Link>

          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-3xl text-white shadow-lg shadow-teal-700/20">
            🩺
          </div>

          <span className="mb-3 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-800">
            PETCARD · همکاری حرفه‌ای
          </span>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            به خانواده پت‌کارت بپیوند
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-500 sm:text-base">
            کلینیک موردنظرت را پیدا کن، اطلاعات حرفه‌ای خودت را
            ثبت کن و برای شروع همکاری درخواست بفرست.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <span className="text-teal-600">✓</span>
              ثبت درخواست آنلاین
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <span className="text-teal-600">✓</span>
              انتخاب کلینیک دلخواه
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <span className="text-teal-600">✓</span>
              بررسی توسط کلینیک
            </span>
          </div>
        </header>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1 */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-extrabold text-teal-700">
                ۱
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  انتخاب شهر و کلینیک
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  ابتدا موقعیت موردنظرت را مشخص کن.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>استان</label>
                <Select<SelectOption, false>
                  isRtl
                  isSearchable
                  isClearable
                  options={provinceOptions}
                  value={selectedProvince}
                  styles={selectStyles}
                  placeholder="استان را انتخاب کن..."
                  noOptionsMessage={() => "استانی پیدا نشد"}
                  onChange={(option) =>
                    updateField("province", option?.value ?? "")
                  }
                />
              </div>

              <div>
                <label className={labelClass}>شهر</label>
                <Select<SelectOption, false>
                  isRtl
                  isSearchable
                  isClearable
                  options={cityOptions}
                  value={selectedCity}
                  styles={selectStyles}
                  isDisabled={!form.province}
                  placeholder={
                    form.province
                      ? "شهر را انتخاب کن..."
                      : "ابتدا استان را انتخاب کن"
                  }
                  noOptionsMessage={() => "شهری پیدا نشد"}
                  onChange={(option) =>
                    updateField("city", option?.value ?? "")
                  }
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    کلینیک‌های پیشنهادی
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    کلینیکی را که می‌خواهی در آن فعالیت کنی انتخاب کن.
                  </p>
                </div>

                {form.city && (
                  <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                    {filteredClinics.length} کلینیک
                  </span>
                )}
              </div>

              {!form.city ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-9 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                    📍
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    منتظر انتخاب شهر
                  </p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    برای مشاهده کلینیک‌ها ابتدا استان و شهر را انتخاب کن.
                  </p>
                </div>
              ) : loadingClinics ? (
                <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-8 text-sm text-slate-500">
                  <span className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                  در حال دریافت فهرست کلینیک‌ها...
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center">
                  <div className="text-3xl">🏥</div>
                  <p className="mt-3 font-bold text-amber-900">
                    کلینیکی در این شهر پیدا نشد.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    شهر دیگری انتخاب کن یا بعداً دوباره بررسی کن.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredClinics.map((clinic) => {
                    const isSelected = clinicId === String(clinic.id);

                    return (
                      <button
                        key={clinic.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setClinicId(String(clinic.id));
                          setError("");
                          setSuccess("");
                        }}
                        className={`group relative rounded-2xl border p-4 text-right transition duration-200 ${
                          isSelected
                            ? "border-teal-600 bg-teal-50/70 shadow-md shadow-teal-900/5 ring-2 ring-teal-600/10"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition ${
                              isSelected
                                ? "bg-teal-600 text-white"
                                : "bg-slate-100 group-hover:bg-teal-50"
                            }`}
                          >
                            🏥
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold leading-6 text-slate-900">
                                {clinic.name}
                              </span>

                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                                  isSelected
                                    ? "border-teal-600 bg-teal-600 text-white"
                                    : "border-slate-300 text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                              {clinic.province}، {clinic.city}
                            </p>

                            {clinic.address && (
                              <p className="mt-2 text-xs leading-6 text-slate-400">
                                {clinic.address}
                              </p>
                            )}

                            {isSelected && (
                              <p className="mt-3 text-xs font-bold text-teal-700">
                                این کلینیک انتخاب شده است
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Section 2 */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-extrabold text-teal-700">
                ۲
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  اطلاعات حرفه‌ای دامپزشک
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  اطلاعاتت را دقیق و مطابق مدارک وارد کن.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  نام و نام خانوادگی
                </label>
                <input
                  required
                  minLength={3}
                  maxLength={150}
                  autoComplete="name"
                  className={inputClass}
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="مثلاً علی رضایی"
                />
              </div>

              <div>
                <label className={labelClass}>شماره تماس</label>
                <input
                  required
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="09xxxxxxxxx"
                />
              </div>

              <div>
                <label className={labelClass}>
                  شماره نظام دامپزشکی
                </label>
                <input
                  required
                  maxLength={50}
                  className={inputClass}
                  value={form.licenseNumber}
                  onChange={(event) =>
                    updateField("licenseNumber", event.target.value)
                  }
                  placeholder="شماره نظام دامپزشکی"
                />
              </div>

              <div>
                <label className={labelClass}>تخصص</label>
                <input
                  required
                  maxLength={150}
                  className={inputClass}
                  value={form.specialty}
                  onChange={(event) =>
                    updateField("specialty", event.target.value)
                  }
                  placeholder="مثلاً حیوانات خانگی"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>نوع همکاری</label>
                <select
                  className={inputClass}
                  value={form.workType}
                  onChange={(event) =>
                    updateField("workType", event.target.value)
                  }
                >
                  <option value="full_time">تمام‌وقت</option>
                  <option value="part_time">پاره‌وقت</option>
                  <option value="shift">شیفتی</option>
                  <option value="consultant">مشاور</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  توضیحات تکمیلی
                  <span className="mr-2 font-normal text-slate-400">
                    (اختیاری)
                  </span>
                </label>
                <textarea
                  rows={4}
                  maxLength={2000}
                  className={`${inputClass} resize-y leading-7`}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="سابقه کاری، مهارت‌ها و توضیحات بیشتر..."
                />
                <p className="mt-2 text-left text-xs text-slate-400">
                  {form.description.length}/2000
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className={sectionClass}>
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-extrabold text-teal-700">
                ۳
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  ساخت حساب کاربری
                </h2>
                <p className="mt-1 text-sm leading-7 text-slate-500">
                  پس از تأیید درخواست توسط کلینیک، حساب دامپزشکی‌ات
                  بر اساس فرایند ثبت‌نام سامانه ایجاد خواهد شد.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>آدرس ایمیل</label>
                <input
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  dir="ltr"
                  className={inputClass}
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className={labelClass}>رمز عبور</label>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  dir="ltr"
                  className={inputClass}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder="حداقل ۸ کاراکتر"
                />
              </div>

              <div>
                <label className={labelClass}>
                  تکرار رمز عبور
                </label>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  dir="ltr"
                  className={inputClass}
                  value={form.confirmPassword}
                  onChange={(event) =>
                    updateField("confirmPassword", event.target.value)
                  }
                  placeholder="رمز عبور را دوباره وارد کن"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                    className="h-4 w-4 rounded accent-teal-600"
                  />
                  نمایش رمزهای عبور
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
              <span className="mt-0.5 text-lg">🔒</span>
              <p className="text-xs leading-7 text-teal-900">
                رمز عبور برای ساخت حساب استفاده می‌شود. آن را با
                دیگران به اشتراک نگذار و مطمئن شو بک‌اند رمز را
                به‌صورت امن هش می‌کند.
              </p>
            </div>
          </section>

          {/* Alerts */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
            >
              <span className="text-lg">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
            >
              <span className="text-lg">✓</span>
              <p>{success}</p>
            </div>
          )}

          {/* Submit */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <button
              type="submit"
              disabled={submitting || loadingClinics}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-l from-teal-700 to-emerald-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-teal-800/15 transition duration-200 hover:-translate-y-0.5 hover:from-teal-800 hover:to-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  در حال ثبت درخواست...
                </>
              ) : (
                <>
                  ثبت درخواست همکاری
                  <span aria-hidden="true">←</span>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-7 text-slate-400">
              ثبت درخواست به‌معنای تأیید استخدام نیست؛ نتیجه پس از
              بررسی کلینیک مشخص می‌شود.
            </p>
          </div>
        </form>

        <footer className="py-8 text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-teal-700 transition hover:text-teal-900"
          >
            PetCard
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            مراقبت بهتر، زندگی سالم‌تر برای حیوانات خانگی
          </p>
        </footer>
      </div>
    </div>
  );
}