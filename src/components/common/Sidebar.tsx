import { NavLink } from "react-router-dom";

const menuItems = [
  { title: "خانه", path: "/dashboard", icon: "home" },
  { title: "حیوانات من", path: "/dashboard/pets", icon: "paw" },
  { title: "نوبت‌ها", path: "/dashboard/appointments", icon: "calendar" },
  { title: "یادآوری‌ها", path: "/dashboard/reminders", icon: "bell" },
];

function NavIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  if (name === "paw") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...common}>
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
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...common}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M7.5 3.5v3M16.5 3.5v3M4 9.5h16" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...common}>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...common}>
      <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="منوی اصلی">
      <NavLink to="/" className="brand" aria-label="پت‌کارت، صفحه اصلی">
        <span className="brand-mark">
          <NavIcon name="paw" />
        </span>
        <span>
          <span className="brand-name">پت‌کارت</span>
          <span className="brand-caption">همراه سلامت دوست کوچکت</span>
        </span>
      </NavLink>

      <p className="sidebar-label">فضای شخصی</p>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={index === 0}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <span className="nav-icon"><NavIcon name={item.icon} /></span>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-care">
        <span className="sidebar-care-icon"><NavIcon name="paw" /></span>
        <strong>مراقبت با عشق شروع می‌شود</strong>
        <p>پرونده سلامت پتت را همیشه همراه داشته باش.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
