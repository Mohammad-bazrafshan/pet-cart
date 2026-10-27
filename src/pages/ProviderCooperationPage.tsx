import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  HeartPulse,
  LoaderCircle,
  LogOut,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { getCities, getProvincesList } from "@code-plate/iran-cities";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { api, getApiErrorMessage } from "../api/client";

type ProviderType = "trainer" | "walker";

type SelectOption = {
  value: string;
  label: string;
};

type ProviderForm = {
  providerType: ProviderType;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  province: SelectOption | null;
  city: SelectOption | null;
  address: string;
  experienceYears: number;
  specialties: string;
  price: string;
  priceUnit: string;
  bio: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const providerSchema: yup.ObjectSchema<ProviderForm> = yup.object({
  providerType: yup
    .mixed<ProviderType>()
    .oneOf(["trainer", "walker"])
    .required("نوع همکاری را انتخاب کنید"),

  fullName: yup
    .string()
    .trim()
    .required("نام و نام خانوادگی الزامی است")
    .max(150, "نام نباید بیشتر از ۱۵۰ کاراکتر باشد"),

  email: yup
    .string()
    .trim()
    .email("ایمیل معتبر نیست")
    .required("ایمیل الزامی است")
    .max(254, "ایمیل بیش از حد طولانی است"),

  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(72, "رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد"),

  phone: yup
    .string()
    .required("شماره تماس الزامی است")
    .matches(
      /^(?:(?:\+|00)98|0)?9\d{9}$/,
      "شماره موبایل معتبر وارد کنید",
    ),

  province: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("استان را انتخاب کنید"),

  city: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("شهر را انتخاب کنید"),

  address: yup
    .string()
    .defined()
    .max(500, "آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد"),

  experienceYears: yup
    .number()
    .typeError("سابقه کاری را به‌صورت عدد وارد کنید")
    .integer("سابقه کاری باید عدد صحیح باشد")
    .min(0, "سابقه کاری نمی‌تواند منفی باشد")
    .max(80, "مقدار سابقه کاری معتبر نیست")
    .required("سابقه کاری الزامی است"),

  specialties: yup
    .string()
    .defined()
    .max(500, "تخصص‌ها نباید بیشتر از ۵۰۰ کاراکتر باشند"),

  price: yup
    .string()
    .defined()
    .test(
      "valid-price",
      "مبلغ باید عدد معتبر باشد",
      (value) => {
        if (!value?.trim()) return true;

        return (
          /^\d+(\.\d{1,2})?$/.test(value) &&
          Number.isFinite(Number(value))
        );
      },
    ),

  priceUnit: yup
    .string()
    .defined()
    .max(30, "واحد قیمت بیش از حد طولانی است"),

  bio: yup
    .string()
    .defined()
    .max(2000, "توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد"),
});

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}

      {hint && !error && (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function SectionTitle({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-blue-600">
            بخش {number}
          </span>
          <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
            {title}
          </h2>
        </div>

        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: "46px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgb(59 130 246 / 10%)" : "none",
    "&:hover": {
      borderColor: "#93c5fd",
    },
    fontSize: "14px",
    direction: "rtl" as const,
    cursor: "pointer",
  }),

  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: "2px 12px",
  }),

  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: "#94a3b8",
  }),

  menu: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 50,
    borderRadius: "12px",
    overflow: "hidden",
    direction: "rtl" as const,
  }),

  option: (
    base: Record<string, unknown>,
    state: { isFocused: boolean; isSelected: boolean },
  ) => ({
    ...base,
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#334155",
  }),
};

export default function ProviderCooperationPage() {
  const [searchParams] = useSearchParams();

  const initialProviderType: ProviderType =
    searchParams.get("type") === "walker" ? "walker" : "trainer";

  const [providerType, setProviderType] =
    useState<ProviderType>(initialProviderType);

  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const provinceOptions = useMemo<SelectOption[]>(() => {
    return getProvincesList().map((province) => ({
      value: province.en,
      label: province.fa,
    }));
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProviderForm>({
    resolver: yupResolver(providerSchema),
    mode: "onBlur",
    defaultValues: {
      providerType: initialProviderType,
      fullName: "",
      email: "",
      password: "",
      phone: "",
      province: null,
      city: null,
      address: "",
      experienceYears: 0,
      specialties: "",
      price: "",
      priceUnit: "هر جلسه",
      bio: "",
    },
  });

  const selectedProvince = watch("province");
  const watchedCity = watch("city");
  const watchedFullName = watch("fullName");
  const watchedEmail = watch("email");
  const watchedPhone = watch("phone");
  const watchedExperience = watch("experienceYears");
  const watchedSpecialties = watch("specialties");
  const watchedPrice = watch("price");
  const watchedBio = watch("bio");

  const cityOptions = useMemo<SelectOption[]>(() => {
    if (!selectedProvince) return [];

    try {
      return getCities(selectedProvince.value).map((city) => ({
        value: city.en,
        label: city.fa,
      }));
    } catch {
      return [];
    }
  }, [selectedProvince]);

  const isTrainer = providerType === "trainer";

  const pageTitle = isTrainer
    ? "به خانواده ترینرهای PetCard بپیوندید"
    : "به خانواده واکرهای PetCard بپیوندید";

  const providerLabel = isTrainer ? "ترینر حیوانات" : "واکر حیوانات";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    setValue("providerType", providerType, {
      shouldValidate: true,
    });
  }, [providerType, setValue]);

  const onSubmit: SubmitHandler<ProviderForm> = async (data) => {
    setSuccessMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    const payload = {
      providerType: data.providerType,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      phone: data.phone.trim(),
      province: data.province?.label ?? "",
      city: data.city?.label ?? "",
      address: data.address.trim(),
      experienceYears: Number(data.experienceYears),
      specialties: data.specialties
        .split(/[,،]/)
        .map((item) => item.trim())
        .filter(Boolean),
      price: data.price.trim() ? Number(data.price) : null,
      priceUnit: data.priceUnit.trim() || null,
      bio: data.bio.trim(),
    };

    try {
      await api.post("/provider-cooperation-requests", payload);

      setSuccessMessage(
        "درخواست همکاری شما با موفقیت ثبت شد. پس از بررسی و تأیید ادمین، حساب کاربری شما ایجاد خواهد شد.",
      );

      reset({
        providerType,
        fullName: "",
        email: "",
        password: "",
        phone: "",
        province: null,
        city: null,
        address: "",
        experienceYears: 0,
        specialties: "",
        price: "",
        priceUnit: "هر جلسه",
        bio: "",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error) ||
          "ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-800"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <HeartPulse size={24} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">
                Pet<span className="text-blue-600">Card</span>
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                همراه هوشمند سلامت حیوانات
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:px-4"
          >
            <LogOut size={17} />
            <span>بازگشت به سایت</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero */}
        <section className="relative isolate mb-8 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10 lg:px-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-l from-blue-800/80 via-slate-900 to-slate-950" />

          <div className="absolute -left-12 -top-20 -z-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-28 right-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold text-blue-200">
                <Sparkles size={15} />
                همکاری با پلتفرم PetCard
              </div>

              <h1 className="max-w-2xl text-2xl font-black leading-relaxed sm:text-3xl lg:text-4xl">
                {pageTitle}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                اطلاعات حرفه‌ای خودت را ثبت کن تا پس از بررسی و تأیید
                درخواست توسط تیم PetCard، امکان فعالیت در پلتفرم را داشته
                باشی.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-100">
                  <ShieldCheck size={18} className="text-blue-300" />
                  بررسی درخواست توسط ادمین
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-100">
                  <BadgeCheck size={18} className="text-blue-300" />
                  ثبت‌نام اولیه رایگان
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:h-36 lg:w-36 lg:items-center lg:justify-center lg:rounded-[2rem] lg:border lg:border-white/10 lg:bg-white/5">
              {isTrainer ? (
                <PawPrint size={72} className="text-blue-300" />
              ) : (
                <MapPin size={72} className="text-blue-300" />
              )}
            </div>
          </div>
        </section>

        {/* Alerts */}
        {successMessage && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900"
          >
            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0 text-blue-600"
            />
            <div>
              <p className="font-extrabold">درخواست ثبت شد</p>
              <p className="mt-1 text-sm leading-6">{successMessage}</p>
            </div>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {submitError}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="min-w-0 space-y-6"
          >
            {/* Provider type */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                number="۰۱"
                icon={<BriefcaseBusiness size={22} />}
                title="نوع همکاری"
                description="مشخص کن قصد داری به‌عنوان چه نوع ارائه‌دهنده‌ای فعالیت کنی."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setProviderType("trainer")}
                  className={`group flex items-start gap-3 rounded-2xl border p-4 text-right transition ${
                    isTrainer
                      ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isTrainer
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <PawPrint size={22} />
                  </div>

                  <div className="flex-1">
                    <p className="font-extrabold text-slate-900">
                      ترینر حیوانات
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      آموزش و تربیت حیوانات خانگی
                    </p>
                  </div>

                  <span
                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                      isTrainer
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {isTrainer && <CheckCircle2 size={15} />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProviderType("walker")}
                  className={`group flex items-start gap-3 rounded-2xl border p-4 text-right transition ${
                    !isTrainer
                      ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      !isTrainer
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <MapPin size={22} />
                  </div>

                  <div className="flex-1">
                    <p className="font-extrabold text-slate-900">
                      واکر حیوانات
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      پیاده‌روی و مراقبت حین گردش
                    </p>
                  </div>

                  <span
                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                      !isTrainer
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {!isTrainer && <CheckCircle2 size={15} />}
                  </span>
                </button>
              </div>
            </section>

            {/* Account information */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                number="۰۲"
                icon={<UserRound size={22} />}
                title="اطلاعات حساب کاربری"
                description="اطلاعات تماس و مشخصات اولیه برای ایجاد حساب پس از تأیید درخواست."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="نام و نام خانوادگی *"
                  error={errors.fullName?.message}
                >
                  <input
                    {...register("fullName")}
                    className={inputClass}
                    placeholder="مثلاً علی محمدی"
                    autoComplete="name"
                  />
                </Field>

                <Field
                  label="شماره موبایل *"
                  error={errors.phone?.message}
                >
                  <input
                    {...register("phone")}
                    className={inputClass}
                    placeholder="09123456789"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                  />
                </Field>

                <Field label="ایمیل *" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    className={inputClass}
                    placeholder="example@email.com"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                  />
                </Field>

                <Field
                  label="رمز عبور *"
                  error={errors.password?.message}
                  hint="حداقل ۸ کاراکتر"
                >
                  <input
                    {...register("password")}
                    className={inputClass}
                    placeholder="رمز عبور دلخواه"
                    type="password"
                    autoComplete="new-password"
                    dir="ltr"
                  />
                </Field>
              </div>
            </section>

            {/* Location */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                number="۰۳"
                icon={<MapPin size={22} />}
                title="محدوده فعالیت"
                description="استان، شهر و آدرس محل فعالیتت را مشخص کن."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="استان *"
                  error={errors.province?.message}
                >
                  <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <Select<SelectOption, false>
                        options={provinceOptions}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(option) => {
                          field.onChange(option);
                          setValue("city", null, {
                            shouldValidate: true,
                          });
                        }}
                        placeholder="استان را انتخاب کنید"
                        noOptionsMessage={() => "موردی پیدا نشد"}
                        styles={selectStyles}
                      />
                    )}
                  />
                </Field>

                <Field label="شهر *" error={errors.city?.message}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select<SelectOption, false>
                        options={cityOptions}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        isDisabled={!selectedProvince}
                        placeholder={
                          selectedProvince
                            ? "شهر را انتخاب کنید"
                            : "ابتدا استان را انتخاب کنید"
                        }
                        noOptionsMessage={() => "موردی پیدا نشد"}
                        styles={selectStyles}
                      />
                    )}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="آدرس یا توضیحات محدوده فعالیت"
                    error={errors.address?.message}
                    hint="وارد کردن آدرس دقیق اختیاری است."
                  >
                    <textarea
                      {...register("address")}
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="محله یا محدوده‌ای که در آن خدمات ارائه می‌دهی..."
                      rows={3}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Professional information */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <SectionTitle
                number="۰۴"
                icon={<BadgeCheck size={22} />}
                title="اطلاعات حرفه‌ای"
                description="اطلاعات مربوط به سابقه، تخصص‌ها و تعرفه خدماتت را وارد کن."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="سابقه کاری (سال) *"
                  error={errors.experienceYears?.message}
                >
                  <input
                    {...register("experienceYears", {
                      valueAsNumber: true,
                    })}
                    className={inputClass}
                    type="number"
                    min={0}
                    max={80}
                    step={1}
                    placeholder="مثلاً ۲"
                  />
                </Field>

                <Field
                  label="هزینه پیشنهادی"
                  error={errors.price?.message}
                  hint="در صورت تمایل، مبلغ را به‌صورت عدد وارد کن."
                >
                  <input
                    {...register("price")}
                    className={inputClass}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="مثلاً 500000"
                    inputMode="decimal"
                  />
                </Field>

                <Field
                  label="واحد محاسبه هزینه"
                  error={errors.priceUnit?.message}
                >
                  <select {...register("priceUnit")} className={inputClass}>
                    <option value="هر جلسه">هر جلسه</option>
                    <option value="هر ساعت">هر ساعت</option>
                    <option value="هر روز">هر روز</option>
                    <option value="هر نوبت">هر نوبت</option>
                    <option value="توافقی">توافقی</option>
                  </select>
                </Field>

                <Field
                  label="تخصص‌ها"
                  error={errors.specialties?.message}
                  hint="چند تخصص را با ویرگول از هم جدا کن."
                >
                  <input
                    {...register("specialties")}
                    className={inputClass}
                    placeholder={
                      isTrainer
                        ? "آموزش پایه، اصلاح رفتار..."
                        : "پیاده‌روی، مراقبت روزانه..."
                    }
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="معرفی و توضیحات تکمیلی"
                    error={errors.bio?.message}
                    hint="درباره تجربه، شیوه کار و خدماتت بنویس."
                  >
                    <textarea
                      {...register("bio")}
                      className={`${inputClass} min-h-32 resize-y`}
                      placeholder="توضیح کوتاهی درباره خودت و خدماتی که ارائه می‌دهی..."
                      rows={5}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Submission notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  درخواست شما ابتدا بررسی می‌شود
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-600">
                  پس از ارسال فرم، اطلاعات توسط مدیر سیستم بررسی خواهد شد.
                  ایجاد حساب و امکان ورود، مطابق فرایند تأیید درخواست انجام
                  می‌شود.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
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

            <p className="text-center text-xs leading-6 text-slate-500">
              با ثبت درخواست، صحت اطلاعات واردشده را تأیید می‌کنی.
            </p>
          </form>

          {/* Live summary sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
              <div className="bg-gradient-to-l from-blue-700 to-blue-600 p-6 text-white">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  {isTrainer ? (
                    <PawPrint size={25} />
                  ) : (
                    <MapPin size={25} />
                  )}
                </div>

                <p className="text-xs font-semibold text-blue-100">
                  خلاصه درخواست همکاری
                </p>

                <h2 className="mt-2 text-xl font-black">
                  {providerLabel}
                </h2>

                <p className="mt-2 text-sm leading-6 text-blue-100">
                  نمای کلی اطلاعاتی که در فرم وارد می‌کنی.
                </p>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <p className="mb-1 text-xs text-slate-500">
                    نام متقاضی
                  </p>
                  <p className="break-words font-bold text-slate-900">
                    {watchedFullName?.trim() || "هنوز وارد نشده"}
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <p className="mb-1 text-xs text-slate-500">
                    ایمیل
                  </p>
                  <p
                    dir="ltr"
                    className="break-all text-left text-sm font-medium text-slate-700"
                  >
                    {watchedEmail?.trim() || "هنوز وارد نشده"}
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <p className="mb-1 text-xs text-slate-500">
                    شماره تماس
                  </p>
                  <p
                    dir="ltr"
                    className="text-left text-sm font-medium text-slate-700"
                  >
                    {watchedPhone?.trim() || "هنوز وارد نشده"}
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <p className="mb-2 text-xs text-slate-500">
                    محدوده فعالیت
                  </p>
                  <div className="flex items-start gap-2 text-sm font-medium text-slate-700">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />
                    <span>
                      {selectedProvince?.label || "استان انتخاب نشده"}
                      {watchedCity?.label
                        ? `، ${watchedCity.label}`
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                  <p className="mb-1 text-xs text-slate-500">
                    سابقه کاری
                  </p>
                  <p className="font-bold text-slate-900">
                    {Number.isFinite(Number(watchedExperience))
                      ? `${watchedExperience || 0} سال`
                      : "هنوز وارد نشده"}
                  </p>
                </div>

                {watchedSpecialties?.trim() && (
                  <>
                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="mb-2 text-xs text-slate-500">
                        تخصص‌ها
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {watchedSpecialties
                          .split(/[,،]/)
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item, index) => (
                            <span
                              key={`${item}-${index}`}
                              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700"
                            >
                              {item}
                            </span>
                          ))}
                      </div>
                    </div>
                  </>
                )}

                {watchedPrice?.trim() && (
                  <>
                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="mb-1 text-xs text-slate-500">
                        تعرفه پیشنهادی
                      </p>
                      <p className="font-bold text-slate-900">
                        {Number(watchedPrice).toLocaleString("fa-IR")}{" "}
                        تومان
                      </p>
                    </div>
                  </>
                )}

                {watchedBio?.trim() && (
                  <>
                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="mb-1 text-xs text-slate-500">
                        معرفی کوتاه
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {watchedBio}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-extrabold text-slate-900">
                مراحل همکاری
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      ۱. تکمیل اطلاعات
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      اطلاعات حساب و مشخصات حرفه‌ای را ثبت کن.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      ۲. بررسی درخواست
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      مدیر سیستم اطلاعات ارسالی را بررسی می‌کند.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <BadgeCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      ۳. تأیید و شروع فعالیت
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      پس از تأیید، حساب کاربری طبق فرایند سامانه ایجاد
                      می‌شود.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <p className="text-xs leading-6 text-slate-500">
                اطلاعات را با دقت وارد کن؛ ایمیل و شماره تماس برای ارتباط
                درباره درخواست همکاری اهمیت دارند.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-right lg:px-8">
          <p className="text-sm font-bold text-slate-700">
            PetCard
          </p>
          <p className="text-xs text-slate-500">
            همراه هوشمند سلامت و مراقبت از حیوانات خانگی
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 transition hover:text-blue-800"
          >
            صفحه اصلی
            <ArrowLeft size={16} />
          </Link>
        </div>
      </footer>
    </div>
  );
}