import { useEffect, useState } from "react";
import axios from "axios";
import { getCities, getProvincesList } from "@code-plate/iran-cities";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
type SelectOption = {
  value: string;
  label: string;
};

type ProviderForm = {
  providerType: "trainer" | "walker";
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

const provinceOptions: SelectOption[] = getProvincesList().map((province) => ({
  value: province.en,
  label: province.fa,
}));

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";

const selectStyles = {
  control: (base: object) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "12px",
    borderColor: "#e2e8f0",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#2563eb",
    },
  }),
  menu: (base: object) => ({
    ...base,
    zIndex: 20,
  }),
};

const schema: yup.ObjectSchema<ProviderForm> = yup.object({
  providerType: yup
    .mixed<"trainer" | "walker">()
    .oneOf(["trainer", "walker"])
    .required("نوع همکاری را انتخاب کنید."),

  fullName: yup
    .string()
    .trim()
    .required("نام و نام خانوادگی الزامی است.")
    .max(150, "نام نباید بیشتر از ۱۵۰ کاراکتر باشد."),

  email: yup
    .string()
    .trim()
    .email("ایمیل معتبر وارد کنید.")
    .required("ایمیل الزامی است.")
    .max(254, "ایمیل بیش از حد طولانی است."),

  password: yup
    .string()
    .required("رمز عبور الزامی است.")
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .max(72, "رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد."),

  phone: yup
    .string()
    .trim()
    .required("شماره تماس الزامی است.")
    .matches(/^(?:(?:\+|00)98|0)?9\d{9}$/, "شماره موبایل معتبر وارد کنید."),

  province: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("استان را انتخاب کنید."),

  city: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .required("شهر را انتخاب کنید."),

  address: yup
    .string()
    .trim()
    .max(500, "آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد.")
    .defined(),

  experienceYears: yup
    .number()
    .typeError("سابقه کاری را به‌صورت عدد وارد کنید.")
    .integer("سابقه کاری باید عدد صحیح باشد.")
    .min(0, "سابقه کاری نمی‌تواند منفی باشد.")
    .max(80, "سابقه کاری معتبر نیست.")
    .required("سابقه کاری را وارد کنید."),

  specialties: yup
    .string()
    .max(500, "فهرست خدمات بیش از حد طولانی است.")
    .defined(),

  price: yup
    .string()
    .defined()
    .test(
      "valid-price",
      "قیمت باید عددی مثبت یا صفر باشد.",
      (value) =>
        !value ||
        (/^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value))),
    ),

  priceUnit: yup.string().max(30, "واحد قیمت بیش از حد طولانی است.").defined(),

  bio: yup
    .string()
    .max(2000, "توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.")
    .defined(),
});

export default function ProviderCooperationPage() {
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [searchParams] = useSearchParams();

  const initialProviderType =
    searchParams.get("type") === "walker" ? "walker" : "trainer";
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProviderForm>({
    resolver: yupResolver(schema),
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
      priceUnit: "جلسه",
      bio: "",
    },
  });

  const providerType = watch("providerType");
  const selectedProvince = watch("province");

  const cityOptions: SelectOption[] = selectedProvince
    ? getCities(selectedProvince.value).map((city) => ({
        value: city.en,
        label: city.fa,
      }))
    : [];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  const onSubmit: SubmitHandler<ProviderForm> = async (data) => {
    setSuccess("");
    setServerError("");

    const payload = {
      providerType: data.providerType,
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      phone: data.phone.trim(),
      province: data.province!.label,
      city: data.city!.label,
      address: data.address.trim(),
      experienceYears: data.experienceYears,
      specialties: data.specialties
        .split(/[،,]/)
        .map((item) => item.trim())
        .filter(Boolean),
      price: data.price === "" ? null : Number(data.price),
      priceUnit: data.priceUnit.trim() || null,
      bio: data.bio.trim(),
    };

    try {
      await axios.post(
        "http://localhost:5000/api/provider-cooperation-requests",
        payload,
      );

      setSuccess(
        "درخواست همکاری شما با موفقیت ثبت شد. پس از بررسی و تأیید ادمین، حساب کاربری شما ایجاد خواهد شد.",
      );

      reset({
        providerType: data.providerType,
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
        priceUnit: "جلسه",
        bio: "",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید.",
        );
      } else {
        setServerError("خطای غیرمنتظره‌ای رخ داد.");
      }
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800 sm:py-16"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl bg-gradient-to-br from-blue-900 to-blue-600 p-7 text-white shadow-lg sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
            همکاری با PetCard
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-relaxed sm:text-4xl">
            مهارت شما،
            <br />
            همراه حیوانات خانگی
          </h1>

          <p className="mt-5 text-sm leading-8 text-white/85 sm:text-base">
            اگر ترینر یا واکر هستید، اطلاعات خود را ثبت کنید تا درخواست همکاری
            شما توسط تیم PetCard بررسی شود.
          </p>

          <div className="mt-8 space-y-5">
            {[
              ["ثبت اطلاعات", "اطلاعات فردی و سوابق کاری خود را وارد کنید."],
              ["بررسی درخواست", "ادمین اطلاعات شما را بررسی می‌کند."],
              ["شروع همکاری", "پس از تأیید، حساب کاربری شما ایجاد می‌شود."],
            ].map(([title, description]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  ✓
                </span>

                <div>
                  <h2 className="font-bold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/75">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-extrabold">
            درخواست همکاری ترینر و واکر
          </h2>

          <p className="mb-7 mt-2 text-sm leading-7 text-slate-500">
            اطلاعات خود را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
          </p>

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
            >
              {success}
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
            >
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div>
              <label className="mb-3 block text-sm font-semibold">
                نوع همکاری *
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "trainer", label: "ترینر حیوانات" },
                  { value: "walker", label: "واکر حیوانات" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center justify-center rounded-xl border p-4 text-sm font-bold transition ${
                      providerType === option.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("providerType")}
                      className="ml-2 accent-blue-600"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <FieldError message={errors.providerType?.message} />
            </div>

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold">
                اطلاعات حساب کاربری
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="نام و نام خانوادگی *"
                  error={errors.fullName?.message}
                >
                  <input
                    {...register("fullName")}
                    className={inputClass}
                    placeholder="نام کامل"
                    maxLength={150}
                  />
                </Field>

                <Field label="شماره موبایل *" error={errors.phone?.message}>
                  <input
                    {...register("phone")}
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    placeholder="09123456789"
                  />
                </Field>

                <Field label="ایمیل *" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="name@example.com"
                    maxLength={254}
                  />
                </Field>

                <Field label="رمز عبور *" error={errors.password?.message}>
                  <input
                    {...register("password")}
                    type="password"
                    dir="ltr"
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder="حداقل ۸ کاراکتر"
                    maxLength={72}
                  />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold">
                محل فعالیت
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="استان *" error={errors.province?.message}>
                  <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <Select
                        ref={field.ref}
                        options={provinceOptions}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={(option) => {
                          field.onChange(option);
                          setValue("city", null, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        placeholder="انتخاب استان"
                        noOptionsMessage={() => "استانی یافت نشد"}
                        styles={selectStyles}
                        isClearable
                      />
                    )}
                  />
                </Field>

                <Field label="شهر *" error={errors.city?.message}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select
                        ref={field.ref}
                        options={cityOptions}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        isDisabled={!selectedProvince}
                        placeholder={
                          selectedProvince
                            ? "انتخاب شهر"
                            : "ابتدا استان را انتخاب کنید"
                        }
                        noOptionsMessage={() => "شهری یافت نشد"}
                        styles={selectStyles}
                        isClearable
                      />
                    )}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field
                  label="آدرس یا محدوده فعالیت"
                  error={errors.address?.message}
                >
                  <textarea
                    {...register("address")}
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="آدرس یا محدوده‌ای که در آن فعالیت می‌کنید"
                    maxLength={500}
                  />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold">
                سوابق و خدمات
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="سابقه کاری (سال) *"
                  error={errors.experienceYears?.message}
                >
                  <input
                    {...register("experienceYears")}
                    type="number"
                    min={0}
                    max={80}
                    className={inputClass}
                  />
                </Field>

                <Field label="قیمت پیشنهادی" error={errors.price?.message}>
                  <input
                    {...register("price")}
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputClass}
                    placeholder="مثلاً ۳۰۰۰۰۰"
                  />
                </Field>

                <Field label="واحد قیمت" error={errors.priceUnit?.message}>
                  <select {...register("priceUnit")} className={inputClass}>
                    <option value="جلسه">هر جلسه</option>
                    <option value="ساعت">هر ساعت</option>
                    <option value="روز">هر روز</option>
                    <option value="توافقی">توافقی</option>
                  </select>
                </Field>

                <Field
                  label="خدمات و تخصص‌ها"
                  error={errors.specialties?.message}
                >
                  <input
                    {...register("specialties")}
                    className={inputClass}
                    placeholder="مثلاً آموزش فرمان، پیاده‌روی"
                    maxLength={500}
                  />
                </Field>
              </div>

              <p className="mt-2 text-xs leading-6 text-slate-400">
                برای وارد کردن چند خدمت، آن‌ها را با ویرگول از هم جدا کنید.
              </p>

              <div className="mt-5">
                <Field label="معرفی و توضیحات" error={errors.bio?.message}>
                  <textarea
                    {...register("bio")}
                    className={`${inputClass} min-h-32 resize-y`}
                    placeholder="درباره تجربه، روش کار و خدمات خود توضیح دهید."
                    maxLength={2000}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "در حال ارسال درخواست..." : "ثبت درخواست همکاری"}
            </button>

            <p className="text-center text-xs leading-6 text-slate-400">
              ثبت درخواست به معنی تأیید نهایی یا ایجاد حساب کاربری نیست.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-2 text-xs leading-5 text-red-600">
      {message}
    </p>
  );
}
