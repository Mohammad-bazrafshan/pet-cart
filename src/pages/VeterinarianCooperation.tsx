import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Select, { type StylesConfig } from "react-select";
import { getProvincesList, getCities } from "@code-plate/iran-cities";
import {
  ArrowLeft,
  BriefcaseMedical,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  HeartPulse,
  Hospital,
  LogOut,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  Phone,
  Award,
  FileText,
  Sparkles,
} from "lucide-react";

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

const provinceOptions: SelectOption[] = getProvincesList().map((province) => ({
  value: province.fa,
  label: province.fa,
}));

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "52px",
    borderRadius: "14px",
    borderColor: state.isFocused ? "#2563eb" : "#e2e8f0",
    backgroundColor: state.isDisabled ? "#f8fafc" : "#ffffff",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(37,99,235,0.10)" : "none",
    transition: "all 180ms ease",
    "&:hover": {
      borderColor: "#93c5fd",
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
      ? "#1d4ed8"
      : state.isFocused
        ? "#eff6ff"
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

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";

const labelClass = "mb-2.5 block text-sm font-semibold text-slate-700";

const sectionClass =
  "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7";

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100">
        {number}
      </div>

      <div>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-7 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

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
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
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
    provinceOptions.find((option) => option.value === form.province) ?? null;

  const selectedCity =
    cityOptions.find((option) => option.value === form.city) ?? null;

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.province?.trim() === form.province &&
      clinic.city?.trim() === form.city,
  );

  const selectedClinic = clinics.find(
    (clinic) => String(clinic.id) === clinicId,
  );

  function updateField(field: keyof ApplicationForm, value: string) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

      const { confirmPassword: _confirmPassword, ...applicationData } = form;

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

  return (
    <div
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#f5f8ff] text-slate-800"
    >
      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-700/20">
              <HeartPulse size={25} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">
                PetCard
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                مراقبت هوشمند حیوانات خانگی
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:px-4 sm:text-sm"
          >
            <LogOut size={17} />
            <span>خروج از صفحه</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#101d3b]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_300px] lg:px-8 lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-bold text-blue-200 sm:text-sm">
              <Sparkles size={15} />
              همکاری حرفه‌ای با پت‌کارت
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-[1.6] tracking-tight text-white sm:text-4xl lg:text-5xl">
              تخصصت را به
              <span className="text-blue-300"> مراقبت بهتر </span>
              تبدیل کن
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
              اطلاعات حرفه‌ای خودت را ثبت کن، کلینیک موردنظرت را انتخاب کن و
              مسیر همکاری با مجموعه‌های دامپزشکی را شروع کن.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <CheckCircle2 size={17} className="text-blue-300" />
                ثبت درخواست آنلاین
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <Hospital size={17} className="text-blue-300" />
                انتخاب کلینیک
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <ShieldCheck size={17} className="text-blue-300" />
                بررسی درخواست
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-[36px] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/10">
              <div className="absolute inset-5 rounded-[28px] border border-blue-300/15" />

              <div className="flex h-32 w-32 items-center justify-center rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-950/40">
                <Stethoscope size={66} strokeWidth={1.5} />
              </div>

              <div className="absolute -bottom-4 -right-5 flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Award size={22} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    تخصص تو، ارزشمند است
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    شروع مسیر همکاری
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Form column */}
          <div className="min-w-0">
            <div className="mb-6">
              <p className="text-xs font-extrabold tracking-wide text-blue-700">
                APPLICATION FORM
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                فرم درخواست همکاری
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                بخش‌های زیر را تکمیل کن تا درخواستت برای کلینیک انتخابی ارسال
                شود.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section 1: Location and clinic */}
              <section className={sectionClass}>
                <SectionHeading
                  number="۰۱"
                  title="انتخاب شهر و کلینیک"
                  description="ابتدا موقعیت موردنظرت را مشخص کن و سپس یک کلینیک انتخاب کن."
                />

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
                      <h3 className="font-extrabold text-slate-900">
                        کلینیک‌های پیشنهادی
                      </h3>
                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        کلینیکی را که قصد همکاری با آن را داری انتخاب کن.
                      </p>
                    </div>

                    {form.city && (
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {filteredClinics.length} کلینیک
                      </span>
                    )}
                  </div>

                  {!form.city ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                        <MapPin size={25} />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-800">
                        ابتدا شهر را انتخاب کن
                      </p>
                      <p className="mt-1 text-xs leading-6 text-slate-500">
                        فهرست کلینیک‌های موجود در شهر انتخابی نمایش داده می‌شود.
                      </p>
                    </div>
                  ) : loadingClinics ? (
                    <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-8 text-sm text-slate-500">
                      <LoaderCircle
                        size={28}
                        className="mb-3 animate-spin text-blue-600"
                      />
                      در حال دریافت فهرست کلینیک‌ها...
                    </div>
                  ) : filteredClinics.length === 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center">
                      <Hospital size={30} className="mx-auto text-amber-700" />
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
                                ? "border-blue-600 bg-blue-50/70 shadow-md shadow-blue-900/5 ring-2 ring-blue-600/10"
                                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700"
                                }`}
                              >
                                <Hospital size={23} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold leading-6 text-slate-900">
                                    {clinic.name}
                                  </span>

                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                                      isSelected
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 text-transparent"
                                    }`}
                                  >
                                    <Check size={13} />
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
                                  <p className="mt-3 text-xs font-bold text-blue-700">
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

              {/* Section 2: Professional details */}
              <section className={sectionClass}>
                <SectionHeading
                  number="۰۲"
                  title="اطلاعات حرفه‌ای"
                  description="اطلاعات شخصی و تخصصی خودت را دقیق وارد کن."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>نام و نام خانوادگی</label>
                    <div className="relative">
                      <UserRound
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        required
                        minLength={3}
                        maxLength={150}
                        autoComplete="name"
                        className={`${inputClass} pr-11`}
                        value={form.fullName}
                        onChange={(event) =>
                          updateField("fullName", event.target.value)
                        }
                        placeholder="مثلاً علی رضایی"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>شماره تماس</label>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        required
                        type="tel"
                        maxLength={30}
                        autoComplete="tel"
                        className={`${inputClass} pr-11`}
                        value={form.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                        placeholder="09xxxxxxxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>شماره نظام دامپزشکی</label>
                    <div className="relative">
                      <Award
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        required
                        maxLength={50}
                        className={`${inputClass} pr-11`}
                        value={form.licenseNumber}
                        onChange={(event) =>
                          updateField("licenseNumber", event.target.value)
                        }
                        placeholder="شماره نظام دامپزشکی"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>تخصص</label>
                    <div className="relative">
                      <BriefcaseMedical
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        required
                        maxLength={150}
                        className={`${inputClass} pr-11`}
                        value={form.specialty}
                        onChange={(event) =>
                          updateField("specialty", event.target.value)
                        }
                        placeholder="مثلاً حیوانات خانگی"
                      />
                    </div>
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

              {/* Section 3: Account */}
              <section className={sectionClass}>
                <SectionHeading
                  number="۰۳"
                  title="ساخت حساب کاربری"
                  description="اطلاعات ورود خود را وارد کن. ایجاد حساب طبق فرایند تأیید درخواست انجام می‌شود."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>آدرس ایمیل</label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        required
                        type="email"
                        maxLength={254}
                        autoComplete="email"
                        dir="ltr"
                        className={`${inputClass} pl-4 pr-11`}
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="example@email.com"
                      />
                    </div>
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
                    <label className={labelClass}>تکرار رمز عبور</label>
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
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      {showPassword ? "مخفی کردن رمزها" : "نمایش رمزهای عبور"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <LockKeyhole
                    size={19}
                    className="mt-1 shrink-0 text-blue-700"
                  />
                  <p className="text-xs leading-7 text-blue-900">
                    رمز عبور خود را با دیگران به اشتراک نگذار. بک‌اند باید رمز
                    عبور را به‌صورت امن هش کند و هرگز آن را به شکل متن ساده
                    ذخیره نکند.
                  </p>
                </div>
              </section>

              {/* Alerts */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
                >
                  <span className="mt-0.5 text-lg">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-800"
                >
                  <CheckCircle2 size={21} className="mt-1 shrink-0" />
                  <p>{success}</p>
                </div>
              )}

              {/* Submit */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                <button
                  type="submit"
                  disabled={submitting || loadingClinics}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-l from-blue-700 to-indigo-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-800/15 transition duration-200 hover:-translate-y-0.5 hover:from-blue-800 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={20} className="animate-spin" />
                      در حال ثبت درخواست...
                    </>
                  ) : (
                    <>
                      ثبت درخواست همکاری
                      <ArrowLeft size={19} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-7 text-slate-400">
                  ثبت درخواست به‌معنای استخدام قطعی نیست؛ نتیجه پس از بررسی
                  کلینیک مشخص می‌شود.
                </p>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="bg-[#101d3b] px-5 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <FileText size={23} />
                  </div>
                  <div>
                    <h3 className="font-extrabold">خلاصه درخواست</h3>
                    <p className="mt-1 text-xs text-slate-300">
                      اطلاعاتی که وارد می‌کنی
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <UserRound
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">نام دامپزشک</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {form.fullName.trim() || "هنوز وارد نشده"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">موقعیت فعالیت</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {form.province && form.city
                        ? `${form.province}، ${form.city}`
                        : "هنوز انتخاب نشده"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hospital
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">کلینیک انتخابی</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {selectedClinic?.name || "هنوز انتخاب نشده"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BriefcaseMedical
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">تخصص</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {form.specialty.trim() || "هنوز وارد نشده"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 size={18} className="mt-0.5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">نوع همکاری</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {form.workType === "full_time"
                        ? "تمام‌وقت"
                        : form.workType === "part_time"
                          ? "پاره‌وقت"
                          : form.workType === "shift"
                            ? "شیفتی"
                            : "مشاور"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">تکمیل اطلاعات</span>
                    <span className="font-bold text-blue-700">
                      {
                        [
                          form.fullName,
                          form.phone,
                          form.licenseNumber,
                          form.specialty,
                          form.province,
                          form.city,
                          clinicId,
                          form.email,
                          form.password,
                          form.confirmPassword,
                        ].filter((value) => value.trim()).length
                      }{" "}
                      از ۱۰
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-blue-700 to-indigo-500 transition-all duration-300"
                      style={{
                        width: `${
                          ([
                            form.fullName,
                            form.phone,
                            form.licenseNumber,
                            form.specialty,
                            form.province,
                            form.city,
                            clinicId,
                            form.email,
                            form.password,
                            form.confirmPassword,
                          ].filter((value) => value.trim()).length /
                            10) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShieldCheck size={23} />
              </div>

              <h3 className="mt-4 font-extrabold text-slate-900">
                بعد از ثبت درخواست چه اتفاقی می‌افتد؟
              </h3>

              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    ۱
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    درخواست و اطلاعات حرفه‌ای تو ثبت می‌شود.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    ۲
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    کلینیک انتخابی درخواست را بررسی می‌کند.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    ۳
                  </div>
                  <p className="text-xs leading-6 text-slate-600">
                    در صورت تأیید، فرایند ایجاد حساب طبق سامانه انجام می‌شود.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <HeartPulse size={20} className="text-blue-700" />
                <h3 className="font-extrabold text-slate-900">قبل از ارسال</h3>
              </div>

              <ul className="mt-4 space-y-3 text-xs leading-6 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-blue-600"
                  />
                  شماره نظام دامپزشکی را با دقت وارد کن.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-blue-600"
                  />
                  ایمیلی وارد کن که به آن دسترسی داری.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="mt-1 shrink-0 text-blue-600"
                  />
                  پیش از ثبت نهایی، کلینیک انتخابی را بررسی کن.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-right lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-black text-slate-800 transition hover:text-blue-700"
          >
            <HeartPulse size={19} className="text-blue-700" />
            PetCard
          </Link>

          <p className="text-xs leading-6 text-slate-400">
            مراقبت بهتر، زندگی سالم‌تر برای حیوانات خانگی
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-blue-700"
          >
            صفحه اصلی
            <ChevronLeft size={15} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
