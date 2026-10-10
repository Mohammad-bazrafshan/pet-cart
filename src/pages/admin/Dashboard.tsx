import { useEffect, useState } from "react";
import {
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "../../services/AdminService";

function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminDashboardStats();

        setStats(data);
      } catch (error) {
        console.error(error);

        setError("دریافت آمار داشبورد با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        <p className="text-gray-500">
          در حال دریافت آمار...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          داشبورد مدیریت
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          نمای کلی از وضعیت سامانه پت‌کارت
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            کاربران
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {stats?.users ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            کلینیک‌ها
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {stats?.clinics ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            دامپزشکان
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {stats?.veterinarians ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;