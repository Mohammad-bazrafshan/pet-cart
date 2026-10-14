import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminClinics,
  deleteAdminClinic,
  type AdminClinic,
} from "../../services/AdminService";

function AdminClinics() {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingClinicId, setDeletingClinicId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  // وضعیت جست‌وجو و فیلتر
  const [search, setSearch] = useState("");
  const [veterinarianFilter, setVeterinarianFilter] = useState("all");

  const navigate = useNavigate();

  // دریافت کلینیک‌ها از بک‌اند
  useEffect(() => {
    async function loadClinics() {
      try {
        const data = await getAdminClinics();
        setClinics(data);
      } catch (error) {
        console.error(error);
        setError("دریافت لیست کلینیک‌ها با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    }

    loadClinics();
  }, []);

  // جست‌وجو و فیلتر کلینیک‌ها
  const filteredClinics = clinics.filter((clinic) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      clinic.name.toLowerCase().includes(searchValue) ||
      (clinic.phone ?? "").toLowerCase().includes(searchValue) ||
      (clinic.address ?? "").toLowerCase().includes(searchValue);

    const veterinariansCount = clinic.veterinarians_count ?? 0;

    const matchesVeterinarianFilter =
      veterinarianFilter === "all" ||
      (veterinarianFilter === "with-vets" && veterinariansCount > 0) ||
      (veterinarianFilter === "without-vets" && veterinariansCount === 0);

    return matchesSearch && matchesVeterinarianFilter;
  });

  async function handleDeleteClinic(clinic: AdminClinic) {
    const confirmed = window.confirm(
      `آیا از حذف کلینیک «${clinic.name}» مطمئن هستید؟\nاین عملیات قابل بازگشت نیست.`,
    );

    if (!confirmed) return;

    setDeletingClinicId(clinic.id);
    setDeleteError("");
    setDeleteSuccess("");

    try {
      await deleteAdminClinic(clinic.id);

      setClinics((previousClinics) =>
        previousClinics.filter((item) => item.id !== clinic.id),
      );

      setDeleteSuccess(`کلینیک «${clinic.name}» با موفقیت حذف شد.`);
    } catch (error: any) {
      console.error("Delete clinic error:", error);

      const message = error.response?.data?.message;

      setDeleteError(message || "حذف کلینیک با خطا مواجه شد.");
    } finally {
      setDeletingClinicId(null);
    }
  }

  // وضعیت بارگذاری
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        <p className="text-gray-500">در حال دریافت کلینیک‌ها...</p>
      </div>
    );
  }

  // وضعیت خطا
  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {deleteError && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{deleteError}</p>

          <button
            type="button"
            onClick={() => setDeleteError("")}
            className="text-sm text-red-700 hover:text-red-900"
          >
            بستن
          </button>
        </div>
      )}

      {deleteSuccess && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">{deleteSuccess}</p>

          <button
            type="button"
            onClick={() => setDeleteSuccess("")}
            className="text-sm text-green-700 hover:text-green-900"
          >
            بستن
          </button>
        </div>
      )}

      {/* عنوان صفحه و دکمه ایجاد کلینیک */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت کلینیک‌ها</h2>

          <p className="mt-1 text-sm text-gray-500">
            لیست کلینیک‌های ثبت‌شده در پت‌کارت
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/clinics/new")}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + ایجاد کلینیک جدید
        </button>
      </div>

      {/* جست‌وجو و فیلتر */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* نوار جست‌وجو */}
          <div>
            <label
              htmlFor="clinic-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              جست‌وجوی کلینیک
            </label>

            <input
              id="clinic-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام، تلفن یا آدرس کلینیک..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* فیلتر تعداد دامپزشکان */}
          <div>
            <label
              htmlFor="veterinarian-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              فیلتر بر اساس دامپزشک
            </label>

            <select
              id="veterinarian-filter"
              value={veterinarianFilter}
              onChange={(event) => setVeterinarianFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">همه کلینیک‌ها</option>
              <option value="with-vets">دارای دامپزشک</option>
              <option value="without-vets">بدون دامپزشک</option>
            </select>
          </div>
        </div>

        {/* تعداد نتایج و پاک کردن فیلترها */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">
            نمایش{" "}
            <span className="font-bold text-gray-800">
              {filteredClinics.length}
            </span>{" "}
            از <span className="font-bold text-gray-800">{clinics.length}</span>{" "}
            کلینیک
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setVeterinarianFilter("all");
            }}
            disabled={search === "" && veterinarianFilter === "all"}
            className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            پاک کردن فیلترها
          </button>
        </div>
      </div>

      {/* جدول کلینیک‌ها */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  نام کلینیک
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  تلفن
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  آدرس
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  تعداد دامپزشکان
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="border-b border-gray-100 last:border-0 transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {clinic.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {clinic.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {clinic.address || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {clinic.veterinarians_count ?? 0}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/clinics/${clinic.id}`)
                          }
                          className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          مشاهده جزئیات
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClinic(clinic)}
                          disabled={deletingClinicId !== null}
                          className="whitespace-nowrap rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingClinicId === clinic.id
                            ? "در حال حذف..."
                            : "حذف کلینیک"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {clinics.length === 0
                      ? "هنوز کلینیکی ثبت نشده است."
                      : "کلینیکی با این مشخصات پیدا نشد."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminClinics;
