
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type Props = {
  providerType: "trainer" | "walker";
};

function ServiceProviderLayout({ providerType }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isTrainer = providerType === "trainer";
  const title = isTrainer ? "پنل ترینر" : "پنل واکر";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const linkClass = (path: string) =>
    `block rounded-xl px-4 py-3 text-sm font-bold transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
    }`;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link
            to={`/${providerType}`}
            className="text-xl font-black text-blue-700"
          >
            پت‌کارت
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              {title}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
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
              خروج از حساب
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-4 px-3 text-xs font-bold text-slate-400">
            منوی اصلی
          </p>

          <Link
            to={`/${providerType}`}
            className={linkClass(`/${providerType}`)}
          >
            داشبورد
          </Link>

          <Link
            to={`/${providerType}/profile`}
            className={`mt-2 ${linkClass(`/${providerType}/profile`)}`}
          >
            پروفایل من
          </Link>

          <Link
            to={`/${providerType}/schedule`}
            className={`mt-2 ${linkClass(`/${providerType}/schedule`)}`}
          >
            <span className="ml-2">🗓️</span>
            برنامه کاری
          </Link>

          <Link
            to={`/${providerType}/bookings`}
            className={`mt-2 ${linkClass(`/${providerType}/bookings`)}`}
          >
            مدیریت نوبت‌ها
          </Link>

          <Link
            to="/"
            className="mt-2 block rounded-xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            بازگشت به سایت
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 md:hidden"
          >
            خروج از حساب
          </button>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ServiceProviderLayout;
