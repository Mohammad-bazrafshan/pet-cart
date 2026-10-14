import { useEffect, useState } from "react";
import {
  getAdminUsers,
  updateAdminUserRole,
  type AdminUser,
} from "../../services/AdminService";
import { useAuth } from "../../context/useAuth";

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changingRoleId, setChangingRoleId] = useState<number | null>(null);
  const [roleError, setRoleError] = useState("");

  // وضعیت جست‌وجو و فیلتر
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const { user: currentUser } = useAuth();

  // تغییر نقش کاربر
  async function handleRoleChange(userId: number, role: string) {
    try {
      setChangingRoleId(userId);
      setRoleError("");

      const updatedUser = await updateAdminUserRole(userId, role);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );
    } catch (error) {
      console.error(error);
      setRoleError("تغییر نقش کاربر با خطا مواجه شد.");
    } finally {
      setChangingRoleId(null);
    }
  }

  // دریافت کاربران از بک‌اند
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        setError("دریافت لیست کاربران با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // جست‌وجو و فیلتر کاربران
  const filteredUsers = users.filter((user) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const matchesRole =
      selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  // نمایش وضعیت بارگذاری
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        <p className="text-gray-500">در حال دریافت کاربران...</p>
      </div>
    );
  }

  // نمایش خطای دریافت اطلاعات
  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* عنوان صفحه */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          مدیریت کاربران
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          لیست کاربران ثبت‌نام‌شده در پت‌کارت
        </p>
      </div>

      {/* بخش جست‌وجو و فیلتر */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* جست‌وجو */}
          <div>
            <label
              htmlFor="user-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              جست‌وجوی کاربر
            </label>

            <input
              id="user-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="نام یا ایمیل کاربر را وارد کنید..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* فیلتر نقش */}
          <div>
            <label
              htmlFor="role-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              فیلتر بر اساس نقش
            </label>

            <select
              id="role-filter"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">همه کاربران</option>
              <option value="owner">مالک حیوان</option>
              <option value="veterinarian">دامپزشک</option>
              <option value="admin">مدیر</option>
            </select>
          </div>
        </div>

        {/* تعداد نتایج و پاک کردن فیلترها */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600">
            نمایش{" "}
            <span className="font-bold text-gray-800">
              {filteredUsers.length}
            </span>{" "}
            از{" "}
            <span className="font-bold text-gray-800">
              {users.length}
            </span>{" "}
            کاربر
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedRole("all");
            }}
            disabled={search === "" && selectedRole === "all"}
            className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            پاک کردن فیلترها
          </button>
        </div>
      </div>

      {/* پیام خطای تغییر نقش */}
      {roleError && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {roleError}
        </div>
      )}

      {/* جدول کاربران */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  نام
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  ایمیل
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  نقش
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  تاریخ ثبت‌نام
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      {currentUser?.id === user.id ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                          {user.role === "owner"
                            ? "مالک حیوان"
                            : user.role === "veterinarian"
                              ? "دامپزشک"
                              : "مدیر"}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={changingRoleId === user.id}
                          onChange={(event) =>
                            handleRoleChange(user.id, event.target.value)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="owner">مالک حیوان</option>
                          <option value="veterinarian">دامپزشک</option>
                          <option value="admin">مدیر</option>
                        </select>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    کاربری با این مشخصات پیدا نشد.
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

export default AdminUsers;