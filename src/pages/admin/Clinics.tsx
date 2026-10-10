import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminClinics,
  type AdminClinic,
} from "../../services/AdminService";

function AdminClinics() {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        <p className="text-gray-500">
          در حال دریافت کلینیک‌ها...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* عنوان صفحه و دکمه ایجاد کلینیک */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            مدیریت کلینیک‌ها
          </h2>

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
              {clinics.map((clinic) => (
                <tr
                  key={clinic.id}
                  className="border-b border-gray-100 last:border-0"
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
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/clinics/${clinic.id}`)
                      }
                      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                    >
                      مشاهده جزئیات
                    </button>
                  </td>
                </tr>
              ))}

              {clinics.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    هنوز کلینیکی ثبت نشده است.
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