import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              پنل مدیریت
            </h1>

            <p className="text-xs text-gray-500">
              مدیریت کاربران و کلینیک‌ها
            </p>
          </div>

          <div className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
            مدیر سیستم
          </div>
        </div>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;