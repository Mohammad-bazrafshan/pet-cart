
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
  control: (base) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "12px",
    borderColor: "#e5e7eb",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#10b981",
    },
  }),

  menu: (base) => ({
    ...base,
    zIndex: 50,
    borderRadius: "12px",
    overflow: "hidden",
  }),

  option: (base, state) => ({
    ...base,
    textAlign: "right",
    backgroundColor: state.isSelected
      ? "#047857"
      : state.isFocused
        ? "#d1fae5"
        : "white",
    color: state.isSelected ? "white" : "#374151",
    cursor: "pointer",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
  }),
};

export default function VeterinarianCooperation() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicId, setClinicId] = useState("");

  const [form, setForm] = useState<ApplicationForm>(initialForm);

  const [loadingClinics, setLoadingClinics] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // دریافت فهرست کلینیک‌های ثبت‌شده
  useEffect(() => {
    async function loadClinics() {
      try {
        setError("");

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

  // فهرست شهرهای استان انتخاب‌شده
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

  // پیشنهاد کلینیک‌های همان شهر
  const filteredClinics = clinics.filter((clinic) => {
    return (
      clinic.province?.trim() === form.province &&
      clinic.city?.trim() === form.city
    );
  });

  function updateField(
    field: keyof ApplicationForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,

      // با تغییر استان، شهر قبلی پاک شود
      ...(field === "province" ? { city: "" } : {}),
    }));

    // با تغییر استان یا شهر، کلینیک قبلی پاک شود
    if (field === "province" || field === "city") {
      setClinicId("");
    }
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

    try {
      setSubmitting(true);

      const response = await api.post(
        "/veterinarian-cooperation/applications",
        {
          ...form,
          clinicId: Number(clinicId),
        },
      );

      setSuccess(
        response.data.message ||
          "درخواست همکاری شما با موفقیت ثبت شد.",
      );

      setForm(initialForm);
      setClinicId("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 px-4 py-10 sm:py-14"
    >
      <div className="mx-auto max-w-4xl">
        {/* سربرگ */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            بازگشت به صفحه اصلی
          </Link>

          <div className="mt-5 inline-flex rounded-2xl bg-emerald-100 p-4 text-3xl">
            🩺
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            درخواست همکاری دامپزشک
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            شهر موردنظرت را انتخاب کن، کلینیک‌های همان شهر را
            ببین و درخواست همکاری خودت را برای کلینیک دلخواه
            بفرست.
          </p>
        </div>

        {/* فرم */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* انتخاب محل و کلینیک */}
          <section>
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              ۱. انتخاب شهر و کلینیک
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  استان
                </label>

                <Select<SelectOption, false>
                  isRtl
                  isSearchable
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
                <label className={labelClass}>
                  شهر
                </label>

                <Select<SelectOption, false>
                  isRtl
                  isSearchable
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

            {/* پیشنهاد کلینیک‌ها */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-800">
                  کلینیک‌های پیشنهادی
                </h3>

                {form.city && (
                  <span className="text-xs text-gray-500">
                    {filteredClinics.length} کلینیک
                  </span>
                )}
              </div>

              {!form.city ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <div className="text-3xl">📍</div>

                  <p className="mt-2 text-sm text-gray-500">
                    برای مشاهده کلینیک‌ها ابتدا استان و شهر را
                    انتخاب کن.
                  </p>
                </div>
              ) : loadingClinics ? (
                <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                  در حال دریافت کلینیک‌ها...
                </div>
              ) : filteredClinics.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <div className="text-2xl">🏥</div>

                  <p className="mt-2 font-semibold text-amber-800">
                    کلینیکی در این شهر پیدا نشد.
                  </p>

                  <p className="mt-1 text-sm text-amber-700">
                    شهر دیگری را انتخاب کن یا بعداً دوباره بررسی
                    کن.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredClinics.map((clinic) => {
                    const isSelected =
                      clinicId === String(clinic.id);

                    return (
                      <button
                        key={clinic.id}
                        type="button"
                        onClick={() =>
                          setClinicId(String(clinic.id))
                        }
                        className={`rounded-2xl border p-4 text-right transition ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-100"
                            : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                            🏥
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-gray-900">
                                {clinic.name}
                              </span>

                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                                  isSelected
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-gray-300 text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-500">
                              {clinic.province}، {clinic.city}
                            </p>

                            {clinic.address && (
                              <p className="mt-1 text-xs leading-5 text-gray-400">
                                {clinic.address}
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

          <div className="border-t border-gray-100" />

          {/* اطلاعات دامپزشک */}
          <section>
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              ۲. اطلاعات دامپزشک
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  نام و نام خانوادگی
                </label>

                <input
                  required
                  minLength={3}
                  maxLength={100}
                  className={inputClass}
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="مثلاً علی رضایی"
                />
              </div>

              <div>
                <label className={labelClass}>
                  شماره تماس
                </label>

                <input
                  required
                  type="tel"
                  maxLength={30}
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
                <label className={labelClass}>
                  تخصص
                </label>

                <input
                  required
                  maxLength={100}
                  className={inputClass}
                  value={form.specialty}
                  onChange={(event) =>
                    updateField("specialty", event.target.value)
                  }
                  placeholder="مثلاً حیوانات خانگی"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  نوع همکاری
                </label>

                <select
                  className={inputClass}
                  value={form.workType}
                  onChange={(event) =>
                    updateField("workType", event.target.value)
                  }
                >
                  <option value="full_time">
                    تمام‌وقت
                  </option>

                  <option value="part_time">
                    پاره‌وقت
                  </option>

                  <option value="shift">
                    شیفتی
                  </option>

                  <option value="consultant">
                    مشاور
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  توضیحات تکمیلی
                </label>

                <textarea
                  rows={4}
                  maxLength={2000}
                  className={`${inputClass} resize-y`}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="سابقه کاری، مهارت‌ها و توضیحات بیشتر..."
                />
              </div>
            </div>
          </section>

          {/* پیام‌ها */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
            >
              {success}
            </div>
          )}

          {/* ثبت درخواست */}
          <button
            type="submit"
            disabled={submitting || loadingClinics}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "در حال ثبت درخواست..."
              : "ثبت درخواست همکاری"}
          </button>

          <p className="text-center text-xs leading-6 text-gray-400">
            درخواست شما برای بررسی به کلینیک انتخاب‌شده ارسال
            می‌شود.
          </p>
        </form>
      </div>
    </div>
  );
}
