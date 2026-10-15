import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  {
    title: "داشبورد",
    path: "/clinic",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-house preview-icon"
      >
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
    end: true,
  },
  {
    title: "مدیریت نوبت‌ها",
    path: "/clinic/appointments",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-calendar-range preview-icon"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M16 2v3" />
        <path d="M3 9h18" />
        <path d="M8 2v3" />
        <path d="M17 13h-6" />
        <path d="M13 17H7" />
        <path d="M7 13h.01" />
        <path d="M17 17h.01" />
      </svg>
    ),
  },
  {
    title: "پرونده بیماران",
    path: "/clinic/patients",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-notepad-text preview-icon"
      >
        <path d="M8 2v4" />
        <path d="M12 2v4" />
        <path d="M16 2v4" />
        <rect width="16" height="18" x="4" y="4" rx="2" />
        <path d="M8 10h6" />
        <path d="M8 14h8" />
        <path d="M8 18h5" />
      </svg>
    ),
  },
  
  {
    title: "درخواست‌های همکاری",
    path: "/clinic/veterinarian-applications",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </svg>
    ),
  },

];

function ClinicLayout() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[linear-gradient(108deg,#286a50,#397d5c_62%,#65966b)]"
    >
      {/* Header */}
      <header className="border-b border-pet-line bg-white/90">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-bold text-pet-900">
              پنل کلینیک پت‌کارت
            </h1>

            <p className="text-xs text-gray-500">مدیریت نوبت‌ها و بیماران</p>
          </div>

          <div className="rounded-lg bg-pet-700 px-4 py-2 text-sm font-medium text-white">
            پنل دامپزشک
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-pet-line">
        <div className="flex flex-wrap gap-2 px-6 py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-pet-800 text-white shadow-sm"
                    : "text-gray-600  hover:bg-pet-800"
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="text-white">{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default ClinicLayout;
