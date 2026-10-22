
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const navItems = [
  { label: "داشبورد", to: "/admin", end: true, icon: "▦" },
  { label: "مدیریت کاربران", to: "/admin/users", end: false, icon: "♙" },
  { label: "مدیریت کلینیک‌ها", to: "/admin/clinics", end: false, icon: "✚" },
  {
    label: "درخواست‌های همکاری کلینیک و دامپزشک",
    to: "/admin/cooperation-requests",
    end: false,
    icon: "✉",
  },
  {
    label: "درخواست‌های ترینر و واکر",
    to: "/admin/providers",
    end: false,
    icon: "🐾",
  },
];
function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white md:min-h-screen md:w-72 md:border-b-0 md:border-l">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-100">
                P
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-slate-800">
                  Pet Card
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  پنل مدیریت سیستم
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 p-4">
            <p className="mb-3 px-3 text-xs font-semibold text-slate-400">
              منوی مدیریت
            </p>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>

                    {isActive && (
                      <span className="mr-auto h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 md:mt-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-4">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                🐾
              </div>
              <p className="font-bold text-slate-800">
                مدیریت Pet Card
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                مدیریت کاربران، کلینیک‌ها و درخواست‌های همکاری.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* هدر پنل ادمین */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  پنل مدیریت
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  مدیریت و نظارت بر سامانه Pet Card
                </p>
              </div>

              {/* اطلاعات ادمین و دکمه خروج */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {user?.name?.trim()?.charAt(0) || "A"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.name || "مدیر سیستم"}
                    </p>
                    <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                      {user?.email || "دسترسی مدیریتی"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:px-4"
                >
                  <span>↪</span>
                  <span>خروج</span>
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
