import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCities,
  getProvincesList,
} from "@code-plate/iran-cities";
import {
  getAdminClinicDetails,
  updateAdminClinic,
  type CreateClinicData,
} from "../../services/AdminService";

function EditClinic() {
  const { id } = useParams<{ id: string }>();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClinic() {
      if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        setError("شناسه کلینیک معتبر نیست.");
        setLoading(false);
        return;
      }

      try {
        const clinic = await getAdminClinicDetails(Number(id));

        const province = provinces.find(
          (item) => item.fa === clinic.province
        );

        setSelectedProvince(province?.en ?? "");

        setForm({
          name: clinic.name ?? "",
          phone: clinic.phone ?? "",
          address: clinic.address ?? "",
          description: clinic.description ?? "",
          province: clinic.province ?? "",
          city: clinic.city ?? "",
        });
      } catch (error) {
        console.error(error);
        setError("دریافت اطلاعات کلینیک با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    }

    loadClinic();
  }, [id]);

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

    if (!id || !form.name.trim()) {
      setError("نام کلینیک الزامی است.");
      return;
    }

    if (!form.province || !form.city) {
      setError("انتخاب استان و شهر الزامی است.");
      return;
    }

    try {
      setSaving(true);

      await updateAdminClinic(Number(id), {
        name: form.name.trim(),
        phone: form.phone?.trim() ?? "",
        address: form.address?.trim() ?? "",
        description: form.description?.trim() ?? "",
        province: form.province,
        city: form.city,
      });

      navigate(`/admin/clinics/${id}`);
    } catch (error) {
      console.error(error);
      setError("ویرایش کلینیک انجام نشد. لطفاً دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  if (loading) {
    return (
      <div
        dir="rtl"
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <p className="text-sm text-slate-500">
          در حال دریافت اطلاعات کلینیک...
        </p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="mx-auto max-w-3xl space-y-6 text-slate-800"
    >
      <div>
        <button
          type="button"
          onClick={() => navigate(`/admin/clinics/${id}`)}
          className="mb-4 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          ← بازگشت به جزئیات کلینیک
        </button>

        <h2 className="text-2xl font-bold">
          ویرایش کلینیک
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          اطلاعات و موقعیت مکانی کلینیک را ویرایش کن.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

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
          <label htmlFor="description" className={labelClass}>
            توضیحات
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/clinics/${id}`)}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditClinic;