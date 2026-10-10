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
  const { user: currentUser } = useAuth();
  const [roleError, setRoleError] = useState("");
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

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6">
        <p className="text-gray-500">در حال دریافت کاربران...</p>
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h2>

        <p className="mt-1 text-sm text-gray-500">
          لیست کاربران ثبت‌نام‌شده در پت‌کارت
        </p>
      </div>

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
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>

                  {roleError && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                      {roleError}
                    </div>
                  )}

                  <td className="px-6 py-4">
                    {currentUser?.id === user.id ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {user.role}
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        disabled={changingRoleId === user.id}
                        onChange={(event) =>
                          handleRoleChange(user.id, event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
