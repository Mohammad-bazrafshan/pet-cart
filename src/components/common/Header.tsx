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

  const pageTitle =
    pathname.startsWith("/dashboard/pets/") &&
    pathname !== "/dashboard/pets/new"
      ? "پرونده سلامت"
      : pageTitles[pathname] ?? "پت‌کارت";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-extrabold text-slate-900 sm:text-xl">
            {pageTitle}
          </p>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            همراه همیشگی سلامت پت‌های شما
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-extrabold text-blue-700 ring-1 ring-blue-100">
              {user?.name.slice(0, 1) ?? "م"}
            </span>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800">
                {user?.name ?? "کاربر پت‌کارت"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {user?.demo ? "حالت نمایشی" : "صاحب حیوان خانگی"}
              </p>
            </div>
          </div>

          <button
            type="button"
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
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4"
          >
            <svg
              viewBox="0 0 24 24"
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </svg>
            خروج
          </button>
        </div>
      </div>

      {logoutError && (
        <p
          className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {logoutError}
        </p>
      )}
    </header>
  );
}

export default Header;