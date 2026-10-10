import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getApiErrorMessage } from "../../api/client";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "داشبورد",
  "/dashboard/pets": "حیوانات من",
  "/dashboard/pets/new": "افزودن حیوان",
  "/dashboard/appointments": "نوبت‌های دامپزشکی",
  "/dashboard/reminders": "یادآوری‌ها",
};

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const pageTitle = pathname.startsWith("/dashboard/pets/") && pathname !== "/dashboard/pets/new"
    ? "پرونده سلامت"
    : pageTitles[pathname] ?? "پت‌کارت";

  return (
    <header className="topbar">
      <div>
        <p className="topbar-title">{pageTitle}</p>
        <p className="topbar-subtitle">همراه همیشگی سلامت پت‌های شما</p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-user">
          <span className="avatar" aria-hidden="true">{user?.name.slice(0, 1) ?? "م"}</span>
          <div>
            <strong>{user?.name ?? "کاربر پت‌کارت"}</strong>
            <span>{user?.demo ? "حالت نمایشی" : "صاحب حیوان خانگی"}</span>
          </div>
        </div>
        <button
          type="button"
          className="logout-button"
          aria-label="خروج از حساب کاربری"
          onClick={async () => {
            setLogoutError("");
            try {
              await logout();
              navigate("/login", { replace: true });
            } catch (error) {
              setLogoutError(getApiErrorMessage(error));
            }
          }}
        >
          خروج
        </button>
      </div>
      {logoutError && <span className="logout-error" role="alert">{logoutError}</span>}
    </header>
  );
}

export default Header;
