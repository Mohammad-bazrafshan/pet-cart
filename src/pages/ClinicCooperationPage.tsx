import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getCities, getProvincesList } from "@code-plate/iran-cities";
import axios from "axios";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HeartPulse,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  UserRound,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
type SelectOption = {
  value: string;
  label: string;
};

type CooperationForm = {
  clinicName: string;
  managerName: string;
  vetLicenseNumber: string;
  vetPhone: string;
  vetSpecialty: string;
  phone: string;
  province: SelectOption | null;
  city: SelectOption | null;
  address: string;
  description: string;
  licenseDocument: File | null;
  email: string;
  password: string;
};

const provinceOptions: SelectOption[] = getProvincesList().map((province) => ({
  value: province.en,
  label: province.fa,
}));

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

const schema: yup.ObjectSchema<CooperationForm> = yup.object({
  clinicName: yup
    .string()
    .trim()
    .required("نام کلینیک الزامی است.")
    .max(150, "نام کلینیک نباید بیشتر از ۱۵۰ کاراکتر باشد."),

  managerName: yup
    .string()
    .trim()
    .required("نام دامپزشک مسئول الزامی است.")
    .max(150, "نام نباید بیشتر از ۱۵۰ کاراکتر باشد."),

  vetLicenseNumber: yup
    .string()
    .trim()
    .required("کد نظام پزشکی الزامی است.")
    .matches(
      /^[a-zA-Z0-9۰-۹٠-٩-]{5,50}$/,
      "کد نظام پزشکی باید بین ۵ تا ۵۰ کاراکتر معتبر باشد.",
    ),

  phone: yup
    .string()
    .trim()
    .required("شماره تماس الزامی است.")
    .matches(
      /^(?:(?:\+|00)98|0)?9\d{9}$|^0\d{2,3}\d{7,8}$/,
      "شماره تماس معتبر وارد کنید.",
    ),

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
    .required("آدرس دقیق کلینیک الزامی است.")
    .max(500, "آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد."),

  description: yup
    .string()
    .trim()
    .max(2000, "توضیحات نباید بیشتر از ۲۰۰۰ کاراکتر باشد.")
    .defined(),

  licenseDocument: yup
    .mixed<File>()
    .nullable()
    .required("بارگذاری پروانه فعالیت الزامی است.")
    .test(
      "file-size",
      "حجم فایل نباید بیشتر از ۵ مگابایت باشد.",
      (file) => !file || file.size <= MAX_FILE_SIZE,
    )
    .test(
      "file-type",
      "فقط فایل PDF، JPG یا PNG مجاز است.",
      (file) => !file || allowedTypes.includes(file.type),
    ),

  vetPhone: yup
    .string()
    .trim()
    .required("شماره تماس دامپزشک الزامی است.")
    .matches(/^(?:(?:\+|00)98|0)?9\d{9}$/, "شماره موبایل معتبر وارد کنید."),

  vetSpecialty: yup
    .string()
    .trim()
    .required("تخصص دامپزشک الزامی است.")
    .max(150, "تخصص نباید بیشتر از ۱۵۰ کاراکتر باشد."),

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
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: "49px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#3b82f6" : "#e2e8f0",
    backgroundColor: "#ffffff",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(59,130,246,.10)" : "none",
    "&:hover": {
      borderColor: "#93c5fd",
    },
  }),

  valueContainer: (base: object) => ({
    ...base,
    padding: "4px 12px",
  }),

  placeholder: (base: object) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "13px",
  }),

  input: (base: object) => ({
    ...base,
    fontSize: "14px",
  }),

  menu: (base: object) => ({
    ...base,
    zIndex: 50,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 16px 40px -12px rgba(15,23,42,.18)",
  }),

  option: (
    base: object,
    state: { isFocused: boolean; isSelected: boolean },
  ) => ({
    ...base,
    fontSize: "14px",
    padding: "12px 16px",
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    cursor: "pointer",
  }),
};

export default function ClinicCooperationPage() {
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CooperationForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      clinicName: "",
      managerName: "",
      vetLicenseNumber: "",
      phone: "",
      province: null,
      city: null,
      address: "",
      description: "",
      licenseDocument: null,
      vetPhone: "",
      vetSpecialty: "",
      email: "",
      password: "",
    },
  });

  const selectedProvince = watch("province");
  const selectedCity = watch("city");
  const selectedFile = watch("licenseDocument");
  const clinicName = watch("clinicName");
  const managerName = watch("managerName");

  const cityOptions: SelectOption[] = selectedProvince
    ? getCities(selectedProvince.value).map((city) => ({
        value: city.en,
        label: city.fa,
      }))
    : [];

  const onSubmit: SubmitHandler<CooperationForm> = async (data) => {
    setSuccess("");
    setServerError("");

    const formData = new FormData();

    formData.append("clinicName", data.clinicName.trim());
    formData.append("managerName", data.managerName.trim());
    formData.append("vetFullName", data.managerName.trim());
    formData.append("vetLicenseNumber", data.vetLicenseNumber.trim());
    formData.append("vetPhone", data.vetPhone.trim());
    formData.append("vetSpecialty", data.vetSpecialty.trim());
    formData.append("phone", data.phone.trim());
    formData.append("email", data.email.trim().toLowerCase());
    formData.append("password", data.password);
    formData.append("province", data.province!.label);
    formData.append("city", data.city!.label);
    formData.append("address", data.address.trim());
    formData.append("description", data.description.trim());
    formData.append("licenseDocument", data.licenseDocument!);

    try {
      await axios.post(
        "http://localhost:5000/api/clinics/cooperation-requests",
        formData,
      );

      setSuccess(
        "درخواست همکاری با موفقیت ثبت شد. پس از بررسی ادمین، نتیجه اعلام خواهد شد.",
      );

      reset();

      const fileInput = document.getElementById(
        "licenseDocument",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ||
            "ثبت درخواست انجام نشد. دوباره تلاش کنید.",
        );
      } else {
        setServerError("خطای غیرمنتظره‌ای رخ داد.");
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f8ff] text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {" "}
              <LogOut size={18} />
              بازگشت به صفحه اصلی
            </Link>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <HeartPulse size={23} />
            </span>

            <span>
              <span className="block text-lg font-black tracking-tight text-slate-900">
                PetCard
              </span>

              <span className="block text-[11px] font-medium text-slate-400">
                سلامت هوشمند حیوانات
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 sm:flex">
            <ShieldCheck size={16} />
            درخواست همکاری کلینیک
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-[28px] bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-700/80 via-blue-800/40 to-slate-950" />
          <div className="absolute -left-16 -top-24 size-72 rounded-full border-[36px] border-white/5" />
          <div className="absolute -left-2 top-8 size-40 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-blue-100">
                <Building2 size={15} />
                به شبکه درمان پت‌کارت بپیوندید
              </span>

              <h1 className="mt-5 text-3xl font-black leading-relaxed sm:text-4xl lg:text-[42px]">
                تجربه‌ای بهتر برای
                <span className="block text-blue-300">
                  کلینیک شما و صاحبان حیوانات
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-8 text-slate-300 sm:text-base">
                اطلاعات کلینیک و دامپزشک مسئول را ثبت کنید. پس از بررسی مدارک
                توسط تیم پت‌کارت، نتیجه درخواست به شما اعلام می‌شود.
              </p>
            </div>

            <div className="hidden w-56 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm lg:flex">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
                  <ClipboardCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold">ثبت درخواست</p>
                  <p className="mt-1 text-xs text-slate-400">اطلاعات و مدارک</p>
                </div>
              </div>

              <div className="mr-5 h-5 border-r border-dashed border-white/20" />

              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-slate-300">
                  <BadgeCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold">بررسی و تأیید</p>
                  <p className="mt-1 text-xs text-slate-400">توسط تیم مدیریت</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800"
          >
            <CheckCircle2 size={21} className="mt-1 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700"
          >
            {serverError}
          </div>
        )}

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="min-w-0 space-y-6"
          >
            <FormSection
              number="۰۱"
              title="مشخصات کلینیک"
              subtitle="اطلاعات تماس و نشانی محل فعالیت"
              icon={<Building2 size={20} />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="نام کلینیک *"
                  error={errors.clinicName?.message}
                >
                  <input
                    {...register("clinicName")}
                    className={inputClass}
                    placeholder="مثلاً کلینیک مهر"
                    maxLength={150}
                  />
                </FormField>

                <FormField
                  label="شماره تماس کلینیک *"
                  error={errors.phone?.message}
                >
                  <input
                    {...register("phone")}
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    placeholder="02112345678 یا 09123456789"
                  />
                </FormField>

                <FormField label="استان *" error={errors.province?.message}>
                  <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <Select
                        name={field.name}
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
                </FormField>

                <FormField label="شهر *" error={errors.city?.message}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select
                        name={field.name}
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
                </FormField>

                <div className="sm:col-span-2">
                  <FormField
                    label="آدرس دقیق کلینیک *"
                    error={errors.address?.message}
                  >
                    <textarea
                      {...register("address")}
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="خیابان، کوچه، پلاک و جزئیات آدرس"
                      maxLength={500}
                    />
                  </FormField>
                </div>
              </div>
            </FormSection>

            <FormSection
              number="۰۲"
              title="دامپزشک مسئول"
              subtitle="اطلاعات هویتی و تخصصی مسئول کلینیک"
              icon={<Stethoscope size={20} />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="نام و نام خانوادگی *"
                  error={errors.managerName?.message}
                >
                  <input
                    {...register("managerName")}
                    className={inputClass}
                    placeholder="نام دامپزشک مسئول"
                    maxLength={150}
                  />
                </FormField>

                <FormField
                  label="کد نظام پزشکی *"
                  error={errors.vetLicenseNumber?.message}
                >
                  <input
                    {...register("vetLicenseNumber")}
                    className={inputClass}
                    dir="ltr"
                    placeholder="کد نظام پزشکی"
                    maxLength={50}
                  />
                </FormField>

                <FormField
                  label="شماره موبایل دامپزشک *"
                  error={errors.vetPhone?.message}
                >
                  <input
                    {...register("vetPhone")}
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    placeholder="09123456789"
                    maxLength={15}
                  />
                </FormField>

                <FormField
                  label="تخصص دامپزشک *"
                  error={errors.vetSpecialty?.message}
                >
                  <input
                    {...register("vetSpecialty")}
                    className={inputClass}
                    placeholder="مثلاً دامپزشکی عمومی"
                    maxLength={150}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection
              number="۰۳"
              title="حساب کاربری"
              subtitle="اطلاعات ورود دامپزشک به پنل پت‌کارت"
              icon={<UserRound size={20} />}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="ایمیل دامپزشک *"
                  error={errors.email?.message}
                >
                  <input
                    {...register("email")}
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="doctor@example.com"
                    maxLength={254}
                  />
                </FormField>

                <FormField label="رمز عبور *" error={errors.password?.message}>
                  <input
                    {...register("password")}
                    type="password"
                    dir="ltr"
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder="حداقل ۸ کاراکتر"
                    maxLength={72}
                  />
                </FormField>
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs leading-6 text-slate-500">
                <LockKeyhole size={15} className="shrink-0 text-blue-600" />
                رمز عبور را در اختیار دیگران قرار ندهید.
              </p>
            </FormSection>

            <FormSection
              number="۰۴"
              title="مدارک و توضیحات"
              subtitle="مدرک لازم برای بررسی درخواست همکاری"
              icon={<FileCheck2 size={20} />}
            >
              <FormField
                label="پروانه فعالیت کلینیک *"
                error={errors.licenseDocument?.message}
              >
                <label
                  htmlFor="licenseDocument"
                  className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                    selectedFile
                      ? "border-blue-300 bg-blue-50/70"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    {selectedFile ? (
                      <FileCheck2 size={27} />
                    ) : (
                      <UploadCloud size={27} />
                    )}
                  </span>

                  <span className="mt-4 break-all text-sm font-extrabold text-slate-800">
                    {selectedFile
                      ? selectedFile.name
                      : "برای انتخاب فایل کلیک کنید"}
                  </span>

                  <span className="mt-2 text-xs leading-6 text-slate-500">
                    PDF، JPG یا PNG · حداکثر ۵ مگابایت
                  </span>

                  <input
                    id="licenseDocument"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;

                      setValue("licenseDocument", file, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });

                      clearErrors("licenseDocument");
                    }}
                  />
                </label>
              </FormField>

              <div className="mt-5">
                <FormField
                  label="توضیحات تکمیلی (اختیاری)"
                  error={errors.description?.message}
                >
                  <textarea
                    {...register("description")}
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="خدمات کلینیک یا توضیحات تکمیلی درباره درخواست همکاری..."
                    maxLength={2000}
                  />
                </FormField>
              </div>
            </FormSection>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-700"
                />
                <p className="text-xs leading-7 text-slate-600">
                  با ثبت این فرم، درخواست شما برای بررسی ارسال می‌شود. فعال‌شدن
                  همکاری پس از تأیید مدیر سیستم انجام خواهد شد.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                "در حال ارسال درخواست..."
              ) : (
                <>
                  ارسال درخواست همکاری
                  <ArrowLeft
                    size={18}
                    className="transition group-hover:-translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Side panel */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-extrabold text-slate-900">خلاصه درخواست</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  اطلاعاتی که تاکنون وارد کرده‌اید
                </p>
              </div>

              <div className="space-y-4 p-5">
                <SummaryRow
                  icon={<Building2 size={17} />}
                  label="نام کلینیک"
                  value={clinicName || "هنوز وارد نشده"}
                />

                <SummaryRow
                  icon={<UserRound size={17} />}
                  label="دامپزشک مسئول"
                  value={managerName || "هنوز وارد نشده"}
                />

                <SummaryRow
                  icon={<MapPin size={17} />}
                  label="موقعیت"
                  value={
                    selectedProvince && selectedCity
                      ? `${selectedProvince.label}، ${selectedCity.label}`
                      : "استان و شهر انتخاب نشده"
                  }
                />

                <SummaryRow
                  icon={<FileCheck2 size={17} />}
                  label="مدرک فعالیت"
                  value={selectedFile ? "فایل انتخاب شده" : "هنوز انتخاب نشده"}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                  <ShieldCheck size={21} />
                </span>
                <h3 className="font-extrabold">بعد از ارسال چه می‌شود؟</h3>
              </div>

              <ul className="mt-5 space-y-4">
                {[
                  "اطلاعات و مدارک بررسی می‌شوند.",
                  "در صورت نیاز، برای تکمیل اطلاعات با شما تماس گرفته می‌شود.",
                  "پس از تأیید، امکان ادامه همکاری فراهم خواهد شد.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-xs leading-6 text-slate-300"
                  >
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                      <Check size={12} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Stethoscope size={19} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">پیش از ارسال</p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  از صحت اطلاعات تماس و خوانا بودن پروانه فعالیت مطمئن شوید.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
          <span>© PetCard · سلامت هوشمند حیوانات</span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} />
            ثبت درخواست همکاری
          </span>
        </footer>
      </div>
    </main>
  );
}

function FormSection({
  number,
  title,
  subtitle,
  icon,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-7">
      <div className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-extrabold text-slate-900">{title}</h2>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
              {number}
            </span>
          </div>

          <p className="mt-1 text-xs leading-6 text-slate-500">{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-bold text-slate-700">
        {label}
      </label>

      {children}

      <FieldError message={error} />
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-700">
          {value}
        </p>
      </div>
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
