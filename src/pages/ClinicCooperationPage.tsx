import { useState } from "react";
import { getCities, getProvincesList } from "@code-plate/iran-cities";
import axios from "axios";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
};

// دریافت فهرست استان‌های ایران از کتابخانه
const provinceOptions: SelectOption[] = getProvincesList().map(
  (province) => ({
    value: province.en,
    label: province.fa,
  }),
);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

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
    .matches(
      /^(?:(?:\+|00)98|0)?9\d{9}$/,
      "شماره موبایل معتبر وارد کنید.",
    ),

  vetSpecialty: yup
    .string()
    .trim()
    .required("تخصص دامپزشک الزامی است.")
    .max(150, "تخصص نباید بیشتر از ۱۵۰ کاراکتر باشد."),
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

const selectStyles = {
  control: (base: object) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "12px",
    borderColor: "#e2e8f0",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#0d9488",
    },
  }),

  menu: (base: object) => ({
    ...base,
    zIndex: 20,
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
    },
  });

  const selectedProvince = watch("province");
  const selectedFile = watch("licenseDocument");

  // دریافت شهرهای استان انتخاب‌شده
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
    formData.append(
      "vetLicenseNumber",
      data.vetLicenseNumber.trim(),
    );
    formData.append("vetPhone", data.vetPhone.trim());
    formData.append("vetSpecialty", data.vetSpecialty.trim());
    formData.append("phone", data.phone.trim());

    // ارسال نام فارسی استان و شهر
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

      // پاک کردن فایل انتخاب‌شده از ورودی فایل
      const fileInput = document.getElementById(
        "licenseDocument",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
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

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800 sm:py-16"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* معرفی */}
        <section className="rounded-3xl bg-gradient-to-br from-teal-800 to-emerald-600 p-7 text-white shadow-lg sm:p-10">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
            همکاری با PetCard
          </span>

          <h1 className="mt-6 text-3xl font-extrabold leading-relaxed sm:text-4xl">
            کلینیک شما،
            <br />
            همراه سلامت حیوانات
          </h1>

          <p className="mt-5 text-sm leading-8 text-white/85 sm:text-base">
            اطلاعات کلینیک و دامپزشک مسئول را وارد کنید. درخواست
            شما پس از ثبت، توسط ادمین بررسی خواهد شد.
          </p>

          <div className="mt-8 space-y-5">
            {[
              [
                "ثبت اطلاعات",
                "مشخصات کلینیک و دامپزشک را وارد کنید.",
              ],
              [
                "ارسال مدرک",
                "پروانه فعالیت را برای بررسی بارگذاری کنید.",
              ],
              [
                "بررسی ادمین",
                "پس از تأیید، مراحل شروع همکاری انجام می‌شود.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex items-start gap-3"
              >
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

        {/* فرم */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-extrabold">
            درخواست همکاری کلینیک
          </h2>

          <p className="mb-7 mt-2 text-sm leading-7 text-slate-500">
            تمام فیلدهای ستاره‌دار الزامی هستند.
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
            {/* اطلاعات کلینیک */}
            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold">
                اطلاعات کلینیک
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    نام کلینیک *
                  </label>

                  <input
                    {...register("clinicName")}
                    className={inputClass}
                    placeholder="مثلاً کلینیک مهر"
                    maxLength={150}
                  />

                  <FieldError message={errors.clinicName?.message} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    شماره تماس کلینیک *
                  </label>

                  <input
                    {...register("phone")}
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    placeholder="09123456789"
                  />

                  <FieldError message={errors.phone?.message} />
                </div>

                {/* انتخاب استان */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    استان *
                  </label>

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

                          // پاک کردن شهر قبلی هنگام تغییر استان
                          setValue("city", null, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        placeholder="جست‌وجو و انتخاب استان"
                        noOptionsMessage={() => "استانی یافت نشد"}
                        styles={selectStyles}
                        isClearable
                      />
                    )}
                  />

                  <FieldError message={errors.province?.message} />
                </div>

                {/* انتخاب شهر */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    شهر *
                  </label>

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
                            ? "جست‌وجو و انتخاب شهر"
                            : "ابتدا استان را انتخاب کنید"
                        }
                        noOptionsMessage={() => "شهری یافت نشد"}
                        styles={selectStyles}
                        isClearable
                      />
                    )}
                  />

                  <FieldError message={errors.city?.message} />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  آدرس دقیق کلینیک *
                </label>

                <textarea
                  {...register("address")}
                  className={`${inputClass} min-h-24 resize-y`}
                  placeholder="خیابان، کوچه، پلاک و سایر جزئیات آدرس"
                  maxLength={500}
                />

                <FieldError message={errors.address?.message} />
              </div>
            </div>

            {/* اطلاعات دامپزشک */}
            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold">
                اطلاعات دامپزشک مسئول
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    نام و نام خانوادگی دامپزشک *
                  </label>

                  <input
                    {...register("managerName")}
                    className={inputClass}
                    placeholder="نام دامپزشک مسئول"
                    maxLength={150}
                  />

                  <FieldError message={errors.managerName?.message} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    کد نظام پزشکی *
                  </label>

                  <input
                    {...register("vetLicenseNumber")}
                    className={inputClass}
                    dir="ltr"
                    placeholder="کد نظام پزشکی"
                    maxLength={50}
                  />

                  <FieldError
                    message={errors.vetLicenseNumber?.message}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    شماره موبایل دامپزشک *
                  </label>

                  <input
                    {...register("vetPhone")}
                    type="tel"
                    dir="ltr"
                    className={inputClass}
                    placeholder="09123456789"
                    maxLength={15}
                  />

                  <FieldError message={errors.vetPhone?.message} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    تخصص دامپزشک *
                  </label>

                  <input
                    {...register("vetSpecialty")}
                    className={inputClass}
                    placeholder="مثلاً دامپزشکی عمومی"
                    maxLength={150}
                  />

                  <FieldError message={errors.vetSpecialty?.message} />
                </div>
              </div>
            </div>

            {/* مدارک و توضیحات */}
            <div>
              <h3 className="mb-4 border-b border-slate-100 pb-3 font-bold">
                مدارک و توضیحات
              </h3>

              <label className="mb-2 block text-sm font-semibold">
                پروانه فعالیت کلینیک *
              </label>

              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <input
                  id="licenseDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="block w-full text-sm file:ml-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2 file:font-semibold file:text-white"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;

                    setValue("licenseDocument", file, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    clearErrors("licenseDocument");
                  }}
                />

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  فرمت مجاز PDF، JPG و PNG؛ حداکثر حجم ۵ مگابایت.
                </p>

                {selectedFile && (
                  <p className="mt-2 break-all text-sm text-teal-800">
                    فایل انتخاب‌شده: {selectedFile.name}
                  </p>
                )}
              </div>

              <FieldError
                message={errors.licenseDocument?.message}
              />

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  توضیحات تکمیلی
                </label>

                <textarea
                  {...register("description")}
                  className={`${inputClass} min-h-28 resize-y`}
                  placeholder="خدمات کلینیک و زمینه همکاری..."
                  maxLength={2000}
                />

                <FieldError message={errors.description?.message} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-teal-700 px-5 py-3.5 font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "در حال ارسال درخواست..."
                : "ثبت درخواست همکاری"}
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-2 text-xs leading-5 text-red-600">
      {message}
    </p>
  );
}