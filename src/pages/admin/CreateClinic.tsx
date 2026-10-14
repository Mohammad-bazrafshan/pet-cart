import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCities,
  getProvincesList,
} from "@code-plate/iran-cities";
import {
  createAdminClinic,
  type CreateClinicData,
} from "../../services/AdminService";

function CreateClinic() {
  const navigate = useNavigate();

  const provinces = getProvincesList();

  const [selectedProvince, setSelectedProvince] = useState("");

  const [form, setForm] = useState<CreateClinicData>({
    name: "",
    phone: "",
    address: "",
    description: "",
    province: "",
    city: "",
  });

  const cities = selectedProvince
    ? getCities(selectedProvince)
    : [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleProvinceChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const provinceCode = event.target.value;

    const province = provinces.find(
      (item) => item.en === provinceCode
    );

    setSelectedProvince(provinceCode);

    setForm((previous) => ({
      ...previous,
      province: province?.fa ?? "",
      city: "",
    }));
  }

  function handleCityChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const cityCode = event.target.value;

    const city = cities.find(
      (item) => item.en === cityCode
    );

    setForm((previous) => ({
      ...previous,
      city: city?.fa ?? "",
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("نام کلینیک الزامی است.");
      return;
    }

    if (!form.province || !form.city) {
      setError("انتخاب استان و شهر الزامی است.");
      return;
    }

    try {
      setLoading(true);

      const clinic = await createAdminClinic({
        name: form.name.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
        description: form.description?.trim(),
        province: form.province,
        city: form.city,
      });

      navigate(`/admin/clinics/${clinic.id}`);
    } catch (error) {
      console.error(error);
      setError(
        "ایجاد کلینیک انجام نشد. اطلاعات و اتصال سرور را بررسی کن."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-3xl space-y-6 text-slate-800"
    >
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/clinics")}
          className="mb-4 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← بازگشت به کلینیک‌ها
        </button>

        <h2 className="text-2xl font-bold">
          ایجاد کلینیک جدید
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          اطلاعات کلینیک و موقعیت مکانی آن را وارد کن.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8"
      >
        <div>
          <label htmlFor="name" className={labelClass}>
            نام کلینیک *
          </label>

          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="مثلاً کلینیک دامپزشکی پت‌کارت"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            شماره تماس
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="مثلاً 01112345678"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className={labelClass}>
              استان کلینیک *
            </label>

            <select
              id="province"
              value={selectedProvince}
              onChange={handleProvinceChange}
              required
              className={inputClass}
            >
              <option value="">استان را انتخاب کن</option>

              {provinces.map((province) => (
                <option
                  key={province.id}
                  value={province.en}
                >
                  {province.fa}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className={labelClass}>
              شهر کلینیک *
            </label>

            <select
              id="city"
              value={
                cities.find((city) => city.fa === form.city)
                  ?.en ?? ""
              }
              onChange={handleCityChange}
              disabled={!selectedProvince}
              required
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
            >
              <option value="">
                {selectedProvince
                  ? "شهر را انتخاب کن"
                  : "ابتدا استان را انتخاب کن"}
              </option>

              {cities.map((city) => (
                <option key={city.id} value={city.en}>
                  {city.fa}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>
            آدرس دقیق کلینیک
          </label>

          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="خیابان، کوچه، پلاک و..."
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className={labelClass}
          >
            توضیحات
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="توضیح مختصری درباره خدمات کلینیک..."
            className={`${inputClass} resize-y`}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ایجاد کلینیک"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/clinics")}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateClinic;