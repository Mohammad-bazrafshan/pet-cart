
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const navItems = [
  { title: "داشبورد", path: "/clinic", end: true, icon: "⌂" },
  { title: "مدیریت نوبت‌ها", path: "/clinic/appointments", icon: "▦" },
  { title: "پرونده بیماران", path: "/clinic/patients", icon: "▤" },
  {
    title: "درخواست‌های همکاری",
    path: "/clinic/veterinarian-applications",
    icon: "♙",
  },
];

function ClinicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[84px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-2xl text-white shadow-md shadow-blue-200">
              🐾
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                پت‌کارت
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-600">
                پنل مدیریت کلینیک
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-slate-900">
                {user?.name || "کاربر کلینیک"}
              </p>
              <p className="mt-1 text-xs font-medium text-blue-700">
                {user?.role === "veterinarian" ? "دامپزشک" : "عضو کلینیک"}
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg font-extrabold text-blue-800">
              {(user?.name || "ک").charAt(0)}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 sm:px-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="hidden sm:inline">خروج از حساب</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-3",
                  "text-sm font-bold transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  isActive
                    ? "border-blue-800 bg-blue-800 text-white shadow-md shadow-blue-900/15"
                    : "border-transparent bg-white hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800",
                ].join(" ")
              }
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-black">{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto min-h-[calc(100vh-160px)] max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-sm font-medium text-slate-600">
        پت‌کارت؛ مراقبت بهتر، زندگی سالم‌تر
      </footer>
    </div>
  );
}

export default ClinicLayout;
