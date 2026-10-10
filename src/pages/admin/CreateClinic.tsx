import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminClinic,
  type CreateClinicData,
} from "../../services/AdminService";

function CreateClinic() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateClinicData>({
    name: "",
    phone: "",
    address: "",
    description: "",
  });

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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.name?.trim()) {
      setError("نام کلینیک الزامی است.");
      return;
    }

    try {
      setLoading(true);

      const clinic = await createAdminClinic({
        name: form.name.trim(),
        phone: form.phone?.trim(),
        address: form.address?.trim(),
        description: form.description?.trim(),
      });

      navigate(`/admin/clinics/${clinic.id}`);
    } catch (error) {
      console.error(error);
      setError("ایجاد کلینیک انجام نشد. لطفاً دوباره تلاش کن.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/clinics")}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← بازگشت به کلینیک‌ها
        </button>

        <h2 className="text-2xl font-bold text-gray-800">
          ایجاد کلینیک جدید
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          اطلاعات کلینیک جدید را وارد کن.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            شماره تماس
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="مثلاً 01112345678"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            آدرس
          </label>

          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="استان، شهر، خیابان..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
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
            className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال ثبت..." : "ایجاد کلینیک"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/clinics")}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateClinic;