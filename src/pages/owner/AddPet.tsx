import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { createPet } from "../../services/PetService";
import { useAuth } from "../../context/useAuth";
import { getApiErrorMessage } from "../../api/client";

const schema = yup.object({
  name: yup
    .string()
    .required("نام حیوان الزامی است")
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(30, "نام نمی‌تواند بیشتر از ۳۰ کاراکتر باشد"),

  type: yup.string().required("نوع حیوان را انتخاب کنید"),

  gender: yup.string().required("جنسیت را انتخاب کنید"),

  breed: yup
    .string()
    .required("نژاد حیوان الزامی است")
    .min(2, "نژاد باید حداقل ۲ کاراکتر باشد")
    .max(50, "نژاد نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),

  age: yup
    .number()
    .typeError("سن باید عدد باشد")
    .required("سن الزامی است")
    .min(0, "سن نمی‌تواند منفی باشد")
    .max(30, "سن نمی‌تواند بیشتر از ۳۰ سال باشد"),

  weight: yup
    .number()
    .typeError("وزن باید عدد باشد")
    .required("وزن الزامی است")
    .moreThan(0, "وزن باید بیشتر از صفر باشد")
    .max(200, "وزن نمی‌تواند بیشتر از ۲۰۰ کیلوگرم باشد"),
});

type FormData = yup.InferType<typeof schema>;

function AddPet() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const inputClass = (hasError: boolean) =>
    `w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 ${
      hasError
        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    }`;

  const labelClass =
    "mb-2 block text-sm font-bold text-slate-700";

  const errorClass = "mt-2 text-xs font-medium text-red-600";

  const onSubmit = async (data: FormData) => {
    setSubmitError("");

    if (!user?.id) {
      setSubmitError("برای ثبت حیوان ابتدا وارد حساب کاربری شوید.");
      return;
    }

    try {
      setLoading(true);

      await createPet({
        owner_id: Number(user.id),
        name: data.name,
        type: data.type,
        breed: data.breed,
        age: data.age,
        weight: data.weight,
        gender: data.gender,
      });

      navigate("/dashboard/pets");
    } catch (error) {
      console.error("Error creating pet:", error);
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-3xl space-y-6 pb-8"
    >
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            پرونده سلامت
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            افزودن حیوان
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
            اطلاعات دوست کوچکت را وارد کن تا پرونده سلامت او ساخته شود.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/pets")}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-blue-600"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          بازگشت به حیوانات من
        </button>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
      >
        {/* Card header */}
        <div className="border-b border-slate-100 bg-gradient-to-l from-blue-50/80 via-white to-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 13.2c-2.4-2.5-6.8-.5-6.8 3.2 0 2.2 1.6 3.6 3.8 3.1 2-.5 4-.5 6 0 2.2.5 3.8-.9 3.8-3.1 0-3.7-4.4-5.7-6.8-3.2Z" />
                <ellipse cx="5.1" cy="9.2" rx="1.8" ry="2.5" transform="rotate(-25 5.1 9.2)" />
                <ellipse cx="9.5" cy="6.1" rx="1.8" ry="2.5" transform="rotate(-10 9.5 6.1)" />
                <ellipse cx="14.5" cy="6.1" rx="1.8" ry="2.5" transform="rotate(10 14.5 6.1)" />
                <ellipse cx="18.9" cy="9.2" rx="1.8" ry="2.5" transform="rotate(25 18.9 9.2)" />
              </svg>
            </div>

            <div>
              <h2 className="font-extrabold text-slate-800">
                اطلاعات حیوان خانگی
              </h2>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                فیلدهای ستاره‌دار الزامی هستند.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-8">
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <p>{submitError}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="pet-name" className={labelClass}>
              نام حیوان <span className="text-red-500">*</span>
            </label>

            <input
              id="pet-name"
              {...register("name")}
              type="text"
              placeholder="مثلاً Max"
              aria-invalid={!!errors.name}
              className={inputClass(!!errors.name)}
            />

            {errors.name && (
              <p className={errorClass} role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Type & Gender */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pet-type" className={labelClass}>
                نوع حیوان <span className="text-red-500">*</span>
              </label>

              <select
                id="pet-type"
                {...register("type")}
                aria-invalid={!!errors.type}
                className={inputClass(!!errors.type)}
                defaultValue=""
              >
                <option value="" disabled>
                  نوع حیوان را انتخاب کنید
                </option>
                <option value="سگ">سگ</option>
                <option value="گربه">گربه</option>
                <option value="پرنده">پرنده</option>
                <option value="خرگوش">خرگوش</option>
                <option value="سایر">سایر</option>
              </select>

              {errors.type && (
                <p className={errorClass} role="alert">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pet-gender" className={labelClass}>
                جنسیت <span className="text-red-500">*</span>
              </label>

              <select
                id="pet-gender"
                {...register("gender")}
                aria-invalid={!!errors.gender}
                className={inputClass(!!errors.gender)}
                defaultValue=""
              >
                <option value="" disabled>
                  جنسیت را انتخاب کنید
                </option>
                <option value="نر">نر</option>
                <option value="ماده">ماده</option>
              </select>

              {errors.gender && (
                <p className={errorClass} role="alert">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          {/* Breed */}
          <div>
            <label htmlFor="pet-breed" className={labelClass}>
              نژاد <span className="text-red-500">*</span>
            </label>

            <input
              id="pet-breed"
              {...register("breed")}
              type="text"
              placeholder="مثلاً Golden Retriever"
              aria-invalid={!!errors.breed}
              className={inputClass(!!errors.breed)}
            />

            {errors.breed && (
              <p className={errorClass} role="alert">
                {errors.breed.message}
              </p>
            )}
          </div>

          {/* Age & Weight */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pet-age" className={labelClass}>
                سن (سال) <span className="text-red-500">*</span>
              </label>

              <input
                id="pet-age"
                {...register("age", { valueAsNumber: true })}
                type="number"
                min="0"
                max="30"
                step="1"
                placeholder="مثلاً 3"
                aria-invalid={!!errors.age}
                className={inputClass(!!errors.age)}
              />

              {errors.age && (
                <p className={errorClass} role="alert">
                  {errors.age.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pet-weight" className={labelClass}>
                وزن (کیلوگرم) <span className="text-red-500">*</span>
              </label>

              <input
                id="pet-weight"
                {...register("weight", { valueAsNumber: true })}
                type="number"
                min="0.1"
                max="200"
                step="0.1"
                placeholder="مثلاً 12"
                aria-invalid={!!errors.weight}
                className={inputClass(!!errors.weight)}
              />

              {errors.weight && (
                <p className={errorClass} role="alert">
                  {errors.weight.message}
                </p>
              )}
            </div>
          </div>

          {/* Required fields note */}
          <p className="text-xs leading-6 text-slate-400">
            <span className="text-red-500">*</span>
            {" "}تکمیل تمام فیلدهای بالا الزامی است.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/dashboard/pets")}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {loading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                  />
                </svg>
                در حال ثبت...
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                ثبت حیوان
              </>
            )}
          </button>
        </div>
      </form>

      <p className="text-center text-xs leading-6 text-slate-400">
        اطلاعات ثبت‌شده برای ساخت پرونده سلامت حیوان خانگی شما استفاده می‌شود.
      </p>
    </div>
  );
}

export default AddPet;