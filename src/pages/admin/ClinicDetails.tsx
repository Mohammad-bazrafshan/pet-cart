import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  assignVeterinarianToClinic,
  getAdminClinicDetails,
  getAvailableVeterinarians,
  type AdminClinicDetails,
  type AvailableVeterinarian,
} from "../../services/AdminService";

function ClinicDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [clinic, setClinic] = useState<AdminClinicDetails | null>(null);
  const [veterinarians, setVeterinarians] = useState<
    AvailableVeterinarian[]
  >([]);

  const [selectedVeterinarian, setSelectedVeterinarian] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingVeterinarians, setLoadingVeterinarians] = useState(true);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAssignVeterinarian() {
    setFormError("");

    if (!id) {
      setFormError("شناسه کلینیک نامعتبر است.");
      return;
    }

    if (!selectedVeterinarian) {
      setFormError("لطفاً یک دامپزشک انتخاب کنید.");
      return;
    }

    if (!specialty.trim()) {
      setFormError("لطفاً تخصص دامپزشک را وارد کنید.");
      return;
    }

    try {
      setSubmitting(true);

      await assignVeterinarianToClinic(
        Number(id),
        Number(selectedVeterinarian),
        specialty.trim()
      );

      const [clinicData, veterinariansData] = await Promise.all([
        getAdminClinicDetails(Number(id)),
        getAvailableVeterinarians(),
      ]);

      setClinic(clinicData);
      setVeterinarians(veterinariansData);

      setSelectedVeterinarian("");
      setSpecialty("");
    } catch (error) {
      console.error(error);
      setFormError("اتصال دامپزشک به کلینیک با خطا مواجه شد.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
          setError("شناسه کلینیک معتبر نیست.");
          return;
        }

        const [clinicData, veterinariansData] = await Promise.all([
          getAdminClinicDetails(Number(id)),
          getAvailableVeterinarians(),
        ]);

        setClinic(clinicData);
        setVeterinarians(veterinariansData);
      } catch (error) {
        console.error(error);
        setError("دریافت اطلاعات کلینیک با خطا مواجه شد.");
      } finally {
        setLoading(false);
        setLoadingVeterinarians(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        در حال دریافت اطلاعات کلینیک...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
        کلینیک پیدا نشد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* عنوان و دکمه‌های صفحه */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/clinics")}
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← بازگشت به کلینیک‌ها
          </button>

          <h2 className="text-2xl font-bold text-gray-800">
            {clinic.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            جزئیات کلینیک و مدیریت دامپزشکان
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/admin/clinics/${id}/edit`)}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          ویرایش کلینیک
        </button>
      </div>

      {/* اطلاعات کلینیک */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          اطلاعات کلینیک
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">نام کلینیک</p>
            <p className="mt-1 font-medium text-gray-800">
              {clinic.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">شماره تماس</p>
            <p className="mt-1 font-medium text-gray-800">
              {clinic.phone || "ثبت نشده"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">آدرس</p>
            <p className="mt-1 font-medium text-gray-800">
              {clinic.address || "ثبت نشده"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">توضیحات</p>
            <p className="mt-1 font-medium text-gray-800">
              {clinic.description || "توضیحی ثبت نشده"}
            </p>
          </div>
        </div>
      </section>

      {/* اتصال دامپزشک */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          اتصال دامپزشک به کلینیک
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="veterinarian"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              دامپزشک
            </label>

            <select
              id="veterinarian"
              value={selectedVeterinarian}
              onChange={(event) =>
                setSelectedVeterinarian(event.target.value)
              }
              disabled={loadingVeterinarians}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="">
                {loadingVeterinarians
                  ? "در حال دریافت دامپزشکان..."
                  : "انتخاب دامپزشک"}
              </option>

              {veterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.name} - {vet.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="specialty"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              تخصص
            </label>

            <input
              id="specialty"
              type="text"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              placeholder="مثلاً حیوانات خانگی"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {formError}
          </p>
        )}

        <button
          type="button"
          onClick={handleAssignVeterinarian}
          disabled={submitting || loadingVeterinarians}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "در حال اتصال..." : "اتصال به کلینیک"}
        </button>
      </section>

      {/* دامپزشکان کلینیک */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            دامپزشکان کلینیک
          </h3>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {clinic.veterinarians.length} دامپزشک
          </span>
        </div>

        {clinic.veterinarians.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
            هنوز دامپزشکی به این کلینیک اضافه نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="px-4 py-3">نام</th>
                  <th className="px-4 py-3">ایمیل</th>
                  <th className="px-4 py-3">تخصص</th>
                </tr>
              </thead>

              <tbody>
                {clinic.veterinarians.map((vet) => (
                  <tr
                    key={vet.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {vet.name}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {vet.email}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {vet.specialty || "ثبت نشده"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ClinicDetails;