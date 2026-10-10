import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, register } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      setLoading(true);

      await register({
        name,
        email,
        password,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);

      setError("ثبت‌نام با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <span aria-hidden="true">🐾</span>
          </span>

          <span>
            <span className="brand-name">پت‌کارت</span>
            <span className="brand-caption">
              سلامت پت، خیال آسوده
            </span>
          </span>
        </Link>

        <p className="auth-eyebrow">به جمع ما خوش آمدی</p>

        <h1>یک حساب برای همه پنجه‌ها</h1>

        <p className="auth-description">
          حساب بساز و مراقبت از دوست کوچکت را ساده‌تر دنبال کن.
        </p>

        {error && (
          <p className="auth-message" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-name">
            نام و نام خانوادگی
          </label>

          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="مثلاً محمد رضایی"
            required
            minLength={2}
            maxLength={100}
          />

          <label htmlFor="register-email">
            ایمیل
          </label>

          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            required
          />

          <label htmlFor="register-password">
            گذرواژه
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="حداقل ۸ کاراکتر"
            required
            minLength={8}
            maxLength={72}
          />

          <button
            className="button-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "در حال ساخت حساب..."
              : "ساخت حساب کاربری"}{" "}
            <span aria-hidden="true">←</span>
          </button>
        </form>

        <p className="auth-switch">
          قبلاً ثبت‌نام کرده‌ای؟{" "}
          <Link to="/login">وارد شو</Link>
        </p>

        <Link className="auth-back" to="/">
          بازگشت به صفحه اصلی
        </Link>
      </section>

      <aside className="auth-aside">
        <span className="auth-pet" aria-hidden="true">
          🐱
        </span>

        <p>
          هر مراقبت کوچک،
          <br />
          یک عمر دوست‌داشتن است.
        </p>

        <span>همراه سلامت پت‌های عزیزت</span>
      </aside>
    </main>
  );
}

export default Register;