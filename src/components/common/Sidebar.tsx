
import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "داشبورد", path: "/dashboard", icon: "home" },
  { title: "پروفایل من", path: "/dashboard/profile", icon: "user" },
  { title: "حیوانات من", path: "/dashboard/pets", icon: "paw" },
  {
    title: "نوبت‌های دامپزشکی",
    path: "/dashboard/appointments",
    icon: "calendar",
  },
  { title: "یادآوری‌ها", path: "/dashboard/reminders", icon: "bell" },
  {
    title: "مربی‌ها و پت‌واکرها",
    path: "/dashboard/service-providers",
    icon: "users",
  },
  {
    title: "رزروهای خدمات",
    path: "/dashboard/service-bookings",
    icon: "clipboard",
  },
];

function NavIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </svg>
    );
  }

  if (name === "paw") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
        <path d="M12 13.2c-2.4-2.5-6.8-.5-6.8 3.2 0 2.2 1.6 3.6 3.8 3.1 2-.5 4-.5 6 0 2.2.5 3.8-.9 3.8-3.1 0-3.7-4.4-5.7-6.8-3.2Z" />
        <ellipse cx="5.1" cy="9.2" rx="1.8" ry="2.5" transform="rotate(-25 5.1 9.2)" />
        <ellipse cx="9.5" cy="6.1" rx="1.8" ry="2.5" transform="rotate(-10 9.5 6.1)" />
        <ellipse cx="14.5" cy="6.1" rx="1.8" ry="2.5" transform="rotate(10 14.5 6.1)" />
        <ellipse cx="18.9" cy="9.2" rx="1.8" ry="2.5" transform="rotate(25 18.9 9.2)" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M7.5 3.5v3M16.5 3.5v3M4 9.5h16" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "clipboard") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5h6a1.5 1.5 0 0 0-3-1.5h0a1.5 1.5 0 0 0-3 1.5ZM9 11h6M9 15h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" {...common}>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside
      className="flex min-h-full w-full flex-col border-b border-slate-200 bg-white px-4 py-5 sm:px-5 lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:w-72 lg:border-b-0 lg:border-l lg:px-6 lg:py-7"
      aria-label="منوی اصلی"
    >
      <NavLink
        to="/"
        className="flex items-center gap-3 rounded-2xl px-2 py-2"
        aria-label="پت‌کارت، صفحه اصلی"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
          <NavIcon name="paw" />
        </span>

        <span className="min-w-0">
          <span className="block text-xl font-extrabold text-slate-900">
            پت‌کارت
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            همراه سلامت دوست کوچکت
          </span>
        </span>
      </NavLink>

      <div className="mt-8">
        <p className="mb-3 px-3 text-xs font-bold text-slate-400">
          فضای شخصی
        </p>

        <nav
          className="flex flex-wrap gap-2 lg:flex-col"
          aria-label="صفحات داشبورد"
        >
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={index === 0}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-current/5">
                <NavIcon name={item.icon} />
              </span>

              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-7 hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 lg:mt-auto lg:block">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
          <NavIcon name="paw" />
        </span>

        <strong className="mt-4 block text-sm leading-7 text-slate-800">
          مراقبت با عشق شروع می‌شود
        </strong>

        <p className="mt-2 text-xs leading-6 text-slate-500">
          پرونده سلامت پتت را همیشه همراه داشته باش.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
