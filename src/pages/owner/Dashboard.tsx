import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/useAuth";
import { getPets, type Pet } from "../../services/PetService";

function Dashboard() {
  const { user } = useAuth();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshPets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPets();

      setPets(data);
    } catch (error) {
      console.error(error);
      setError("دریافت اطلاعات حیوانات انجام نشد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPets();
  }, [refreshPets]);

  return (
    <div className="dashboard">
      {user?.demo && (
        <div className="demo-notice" role="status">
          این یک پیش‌نمایش است؛ حیوانات نمونه‌اند و تغییرات پس از بستن نشست
          ذخیره نمی‌شوند.
        </div>
      )}

      <div className="welcome-row">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true">✦</span> فضای شخصی تو
          </p>

          <h1>سلام {user?.name}، خوش اومدی 👋</h1>

          <p>
            همه‌چیز برای مراقبت از دوست‌های کوچکت آماده است.
          </p>
        </div>

        <Link
          to="/dashboard/pets/new"
          className="button-primary"
        >
          <span aria-hidden="true">＋</span>
          افزودن حیوان جدید
        </Link>
      </div>

      <section
        className="welcome-banner"
        aria-label="مراقبت از حیوان خانگی"
      >
        <div className="banner-content">
          <span className="banner-label">
            <span aria-hidden="true">✦</span>
            مراقبت هوشمند پت‌کارت
          </span>

          <h2>یک قدم کوچک برای سلامتی بیشتر</h2>

          <p>
            سوابق پزشکی، یادآوری واکسن‌ها و نوبت‌های دامپزشکی را همیشه
            همراه خودت داشته باش.
          </p>

          <Link
            to="/dashboard/reminders"
            className="banner-link"
          >
            دیدن یادآوری‌ها{" "}
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        <div className="banner-art" aria-hidden="true">
          <div className="pet-orbit">
            <span className="pet-face">🐱</span>
            <span className="orbit-dot">♡</span>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="خلاصه وضعیت">
        <article className="stat-card">
          <span className="stat-icon green">
            <span aria-hidden="true">🐾</span>
          </span>

          <div>
            <p className="stat-label">حیوانات من</p>
            <p className="stat-value">{pets.length}</p>
            <p className="stat-note">
              دوست‌های دوست‌داشتنی تو
            </p>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon yellow">
            <span aria-hidden="true">▦</span>
          </span>

          <div>
            <p className="stat-label">نوبت‌های پیش رو</p>
            <p className="stat-value">۰</p>
            <p className="stat-note">
              ماژول نوبت‌ها به‌زودی
            </p>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon blue">
            <span aria-hidden="true">♧</span>
          </span>

          <div>
            <p className="stat-label">یادآوری‌های فعال</p>
            <p className="stat-value">۰</p>
            <p className="stat-note">
              یادآوری‌ها به‌زودی
            </p>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon rose">
            <span aria-hidden="true">♡</span>
          </span>

          <div>
            <p className="stat-label">آخرین ویزیت</p>
            <p className="stat-value">—</p>
            <p className="stat-note">
              هنوز ویزیتی ثبت نشده
            </p>
          </div>
        </article>
      </section>

      <section aria-labelledby="my-pets-heading">
        <div className="section-heading">
          <div>
            <h2 id="my-pets-heading">دوست‌های من</h2>
            <p>نگاهی سریع به وضعیت حیوانات خانگی‌ات</p>
          </div>

          <Link
            to="/dashboard/pets"
            className="text-link"
          >
            مشاهده همه{" "}
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        {loading ? (
          <div className="empty-state" role="status">
            در حال دریافت اطلاعات دوست‌هایت...
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <strong>دریافت اطلاعات حیوانات انجام نشد</strong>

            <p>{error}</p>

            <button
              type="button"
              className="button-secondary"
              onClick={() => void refreshPets()}
            >
              تلاش دوباره
            </button>
          </div>
        ) : pets.length ? (
          <div className="pet-grid">
            {pets.slice(0, 2).map((pet) => (
              <article
                className="pet-card"
                key={pet.id}
              >
                <div className="pet-card-top">
                  <span
                    className="pet-avatar"
                    aria-hidden="true"
                  >
                    {pet.type === "گربه"
                      ? "🐱"
                      : pet.type === "سگ"
                        ? "🐶"
                        : "🐾"}
                  </span>

                  <div>
                    <h3>{pet.name}</h3>

                    <p className="pet-meta">
                      {pet.type} · {pet.breed}
                    </p>
                  </div>

                  <span className="pet-status">
                    پرونده فعال
                  </span>
                </div>

                <div className="pet-card-details">
                  <div>
                    <span className="pet-detail-label">
                      سن
                    </span>

                    <span className="pet-detail-value">
                      {pet.age} سال
                    </span>
                  </div>

                  <div>
                    <span className="pet-detail-label">
                      وزن
                    </span>

                    <span className="pet-detail-value">
                      {pet.weight} کیلوگرم
                    </span>
                  </div>

                  <div>
                    <span className="pet-detail-label">
                      جنسیت
                    </span>

                    <span className="pet-detail-value">
                      {pet.gender}
                    </span>
                  </div>
                </div>

                <div className="pet-card-footer">
                  <span className="pet-meta">
                    اطلاعات پایه سلامت
                  </span>

                  <Link
                    to={`/dashboard/pets/${pet.id}`}
                    className="record-link"
                  >
                    پرونده سلامت{" "}
                    <span aria-hidden="true">←</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">🐾</span>

            <strong>هنوز دوستی اضافه نکردی</strong>

            <p>
              برای شروع، مشخصات حیوان خانگی‌ات را ثبت کن.
            </p>

            <Link
              to="/dashboard/pets/new"
              className="button-primary"
            >
              افزودن حیوان
            </Link>
          </div>
        )}
      </section>

      <section
        className="dashboard-columns"
        aria-label="نوبت و یادآوری"
      >
        <div className="panel">
          <div className="section-heading">
            <div>
              <h2>نوبت بعدی</h2>
              <p>برای اینکه هیچ ویزیتی از دست نرود</p>
            </div>

            <Link
              to="/dashboard/appointments"
              className="text-link"
            >
              همه نوبت‌ها{" "}
              <span aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="appointment-card">
            <div className="appointment-date">
              <strong>♡</strong>
              <span>پت‌کارت</span>
            </div>

            <div className="appointment-info">
              <strong>نوبتی ثبت نشده است</strong>
              <span>
                امکان ثبت نوبت در مرحله بعد به سامانه اضافه می‌شود.
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <h2>یادآوری‌های نزدیک</h2>
              <p>مراقبت‌های پیش رو</p>
            </div>

            <Link
              to="/dashboard/reminders"
              className="text-link"
            >
              همه{" "}
              <span aria-hidden="true">←</span>
            </Link>
          </div>

          <div className="reminder-card">
            <span
              className="reminder-bullet"
              aria-hidden="true"
            >
              ♧
            </span>

            <div>
              <strong>یادآوری ثبت نشده است</strong>

              <span>
                ثبت و زمان‌بندی یادآوری‌ها به‌زودی اضافه می‌شود.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;