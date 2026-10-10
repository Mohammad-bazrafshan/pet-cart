import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, login, enterDemo } = useAuth();
  const navigate = useNavigate();
  const getRolePath = (role?: string) => {
  switch (role?.toLowerCase()) {
    case "veterinarian":
      return "/clinic";

    case "admin":
      return "/admin";

    case "owner":
    default:
      return "/dashboard";
  }
};
  if (user) {
    return <Navigate to={getRolePath(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      setLoading(true);

      await login({
        email,
        password,
      });

      // فعلاً هدایت بر اساس نقش را
      // بعد از بررسی ساختار useAuth اضافه می‌کنیم.
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      setError("ایمیل یا رمز عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  };

  function handleDemoLogin() {
    enterDemo();
    navigate("/dashboard", { replace: true });
  }

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <span aria-hidden="true">🐾</span>
          </span>

          <span>
            <span className="brand-name">پت‌کارت</span>
            <span className="brand-caption">سلامت پت، خیال آسوده</span>
          </span>
        </Link>

        <p className="auth-eyebrow">خوش برگشتی</p>

        <h1>ورود به حساب کاربری</h1>

        <p className="auth-description">
          برای دیدن پرونده سلامت دوست کوچکت وارد شو.
        </p>

        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">ایمیل</label>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
          />

          <label htmlFor="login-password">گذرواژه</label>

          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="گذرواژه خود را وارد کنید"
            required
            minLength={4}
          />

          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود به پت‌کارت"}{" "}
            <span aria-hidden="true">←</span>
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="demo-access">
            <span>فقط برای مشاهده‌ی طراحی؛ بدون نیاز به دیتابیس</span>

            <button
              className="button-secondary"
              type="button"
              onClick={handleDemoLogin}
            >
              ورود نمایشی و دیدن داشبورد
            </button>
          </div>
        )}

        <p className="auth-switch">
          هنوز حساب نداری؟ <Link to="/register">ثبت‌نام کن</Link>
        </p>

        <Link className="auth-back" to="/">
          بازگشت به صفحه اصلی
        </Link>
      </section>

      <aside className="auth-aside">
        <span className="auth-pet" aria-hidden="true">
          🐶
        </span>

        <p>
          «مراقبت از آن‌ها،
          <br />
          قشنگ‌ترین بخش روز ماست.»
        </p>

        <span>پت‌کارت، همراه لحظه‌های دوست‌داشتنی</span>
      </aside>
    </main>
  );
}

export default Login;
