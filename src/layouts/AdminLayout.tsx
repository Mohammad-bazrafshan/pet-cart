
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  UserRoundCog,
  PawPrint,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const navItems = [
  {
    label: "داشبورد",
    to: "/admin",
    end: true,
    icon: LayoutDashboard,
  },
  {
    label: "مدیریت کاربران",
    to: "/admin/users",
    end: false,
    icon: Users,
  },
  {
    label: "مدیریت کلینیک‌ها",
    to: "/admin/clinics",
    end: false,
    icon: Building2,
  },
  {
    label: "درخواست‌های همکاری کلینیک و دامپزشک",
    to: "/admin/cooperation-requests",
    end: false,
    icon: Handshake,
  },
  {
    label: "درخواست‌های ترینر و واکر",
    to: "/admin/providers",
    end: false,
    icon: UserRoundCog,
  },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-800"
    >
      {/* نوار بالای صفحه */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* دکمه منوی موبایل */}
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
            >
              {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            {/* عنوان Navbar موبایل */}
            <div className="min-w-0 md:hidden">
              <h1 className="truncate text-base font-bold text-slate-800">
                پنل مدیریت
              </h1>
              <p className="text-xs text-slate-500">
                مدیریت کاربران و کلینیک‌ها
              </p>
            </div>

            {/* عنوان Navbar دسکتاپ */}
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-slate-800">
                پنل مدیریت
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                مدیریت کاربران و کلینیک‌ها
              </p>
            </div>
          </div>

          {/* اطلاعات کاربر و دکمه خروج */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "مدیر سیستم"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:gap-2 sm:px-4"
            >
              <LogOut size={17} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* پس‌زمینه تیره هنگام باز بودن سایدبار موبایل */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          />
        )}

        {/* سایدبار */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out md:sticky md:top-16 md:z-20 md:h-[calc(100vh-4rem)] md:max-w-none md:translate-x-0 md:shadow-none ${
            sidebarOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          {/* سربرگ سایدبار */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <PawPrint size={24} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  PetCard
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  پنل مدیریت
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="بستن سایدبار"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* لینک‌های سایدبار */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            <p className="mb-3 px-3 text-xs font-semibold text-slate-400">
              منوی اصلی
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={20}
                        className={
                          isActive
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      />

                      <span className="flex-1 leading-6">
                        {item.label}
                      </span>

                      {isActive && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* بخش اطلاعات پنل؛ بدون دکمه خروج */}
          <div className="border-t border-slate-100 p-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    دسترسی مدیر
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    مدیریت سامانه PetCard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* محتوای اصلی */}
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
