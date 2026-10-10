import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createPet } from "../../services/PetService";
import { useAuth } from "../../context/useAuth";
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

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await createPet({
        owner_id: Number(user?.id),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="page-heading">
        <div>
          <h1>افزودن حیوان</h1>
          <p>اطلاعات دوست کوچکت را وارد کن تا پرونده سلامت او ساخته شود.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="form-card space-y-6">
        {submitError && (
          <p className="auth-message" role="alert">
            {submitError}
          </p>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نام حیوان
            <span className="text-red-500 mr-1">*</span>
          </label>

          <input
            {...register("name")}
            type="text"
            placeholder="مثلاً Max"
            className={`w-full border rounded-lg px-4 py-3 outline-none transition
              ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-green-500"
              }
            `}
          />

          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Type & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع حیوان
              <span className="text-red-500 mr-1">*</span>
            </label>

            <select
              {...register("type")}
              className={`w-full border rounded-lg px-4 py-3 outline-none transition
                ${
                  errors.type
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-green-500"
                }
              `}
            >
              <option value="">انتخاب کنید</option>
              <option value="سگ">سگ</option>
              <option value="گربه">گربه</option>
              <option value="پرنده">پرنده</option>
              <option value="خرگوش">خرگوش</option>
              <option value="سایر">سایر</option>
            </select>

            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              جنسیت
              <span className="text-red-500 mr-1">*</span>
            </label>

            <select
              {...register("gender")}
              className={`w-full border rounded-lg px-4 py-3 outline-none transition
                ${
                  errors.gender
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-green-500"
                }
              `}
            >
              <option value="">انتخاب کنید</option>
              <option value="نر">نر</option>
              <option value="ماده">ماده</option>
            </select>

            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نژاد
            <span className="text-red-500 mr-1">*</span>
          </label>

          <input
            {...register("breed")}
            type="text"
            placeholder="مثلاً Golden Retriever"
            className={`w-full border rounded-lg px-4 py-3 outline-none transition
              ${
                errors.breed
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-green-500"
              }
            `}
          />

          {errors.breed && (
            <p className="text-red-500 text-sm mt-1">{errors.breed.message}</p>
          )}
        </div>

        {/* Age & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سن
              <span className="text-red-500 mr-1">*</span>
            </label>

            <input
              {...register("age", {
                valueAsNumber: true,
              })}
              type="number"
              min="0"
              max="30"
              placeholder="مثلاً 3"
              className={`w-full border rounded-lg px-4 py-3 outline-none transition
                ${
                  errors.age
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-green-500"
                }
              `}
            />

            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وزن (کیلوگرم)
              <span className="text-red-500 mr-1">*</span>
            </label>

            <input
              {...register("weight", {
                valueAsNumber: true,
              })}
              type="number"
              min="0.1"
              max="200"
              step="0.1"
              placeholder="مثلاً 12"
              className={`w-full border rounded-lg px-4 py-3 outline-none transition
                ${
                  errors.weight
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-green-500"
                }
              `}
            />

            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">
                {errors.weight.message}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/dashboard/pets")}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            انصراف
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "در حال ثبت..." : "ثبت حیوان"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPet;
