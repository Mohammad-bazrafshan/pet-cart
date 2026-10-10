import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminClinicDetails,
  updateAdminClinic,
  type CreateClinicData,
} from "../../services/AdminService";

function EditClinic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateClinicData>({
    name: "",
    phone: "",
    address: "",
    description: "",
  });

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

        setForm({
          name: clinic.name ?? "",
          phone: clinic.phone ?? "",
          address: clinic.address ?? "",
          description: clinic.description ?? "",
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!id || !form.name.trim()) {
      setError("نام کلینیک الزامی است.");
      return;
    }

    try {
      setSaving(true);

      await updateAdminClinic(Number(id), {
        name: form.name.trim(),
        phone: form.phone?.trim() ?? "",
        address: form.address?.trim() ?? "",
        description: form.description?.trim() ?? "",
      });

      navigate(`/admin/clinics/${id}`);
    } catch (error) {
      console.error(error);
      setError("ویرایش کلینیک انجام نشد. لطفاً دوباره تلاش کن.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        <p className="text-gray-500">
          در حال دریافت اطلاعات کلینیک...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/admin/clinics/${id}`)}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← بازگشت به جزئیات کلینیک
        </button>

        <h2 className="text-2xl font-bold text-gray-800">
          ویرایش کلینیک
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          اطلاعات کلینیک را تغییر بده و ذخیره کن.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

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
            className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/clinics/${id}`)}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditClinic;