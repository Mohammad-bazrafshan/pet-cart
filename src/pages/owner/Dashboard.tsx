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
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50/70 px-4 py-6 text-slate-800 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-600">
              <span aria-hidden="true">✦</span>
              فضای شخصی تو
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              سلام {user?.name}، خوش اومدی 👋
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
              همه‌چیز برای مراقبت از دوست‌های کوچکت آماده است.
            </p>
          </div>

          <Link
            to="/dashboard/pets/new"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl sm:self-auto"
          >
            <span className="text-xl" aria-hidden="true">
              ＋
            </span>
            افزودن حیوان جدید
          </Link>
        </section>

        {/* Welcome Banner */}
        <section
          aria-label="مراقبت از حیوان خانگی"
          className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-l from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-blue-200/50 sm:p-9 lg:p-10"
        >
          <div
            aria-hidden="true"
            className="absolute -left-12 -top-16 -z-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 right-1/3 -z-10 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"
          />

          <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur">
                <span aria-hidden="true">✦</span>
                مراقبت هوشمند پت‌کارت
              </span>

              <h2 className="mt-5 text-2xl font-extrabold leading-relaxed sm:text-3xl">
                یک قدم کوچک برای سلامتی بیشتر
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-8 text-blue-50 sm:text-base">
                سوابق پزشکی، یادآوری واکسن‌ها و نوبت‌های دامپزشکی را
                همیشه همراه خودت داشته باش.
              </p>

              <Link
                to="/dashboard/reminders"
                className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
               <span className="text-blue-700"> دیدن یادآوری‌ها</span>
                <span aria-hidden="true" className="text-blue-700">←</span>
              </Link>
            </div>

            <div
              aria-hidden="true"
              className="hidden h-44 w-44 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-inner backdrop-blur-sm sm:flex lg:ml-8"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/15 text-7xl">
                🐱
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section aria-label="خلاصه وضعیت">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              خلاصه وضعیت
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              نگاهی سریع به وضعیت مراقبت از پت‌هایت
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    حیوانات من
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    {pets.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    دوست‌های دوست‌داشتنی تو
                  </p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition group-hover:bg-blue-100">
                  🐾
                </span>
              </div>
            </article>

            <article className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    نوبت‌های پیش رو
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    ۰
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    ماژول نوبت‌ها به‌زودی
                  </p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl transition group-hover:bg-amber-100">
                  ▦
                </span>
              </div>
            </article>

            <article className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-100/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    یادآوری‌های فعال
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    ۰
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    یادآوری‌ها به‌زودی
                  </p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl transition group-hover:bg-sky-100">
                  ♧
                </span>
              </div>
            </article>

            <article className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    آخرین ویزیت
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    —
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    هنوز ویزیتی ثبت نشده
                  </p>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-2xl transition group-hover:bg-rose-100">
                  ♡
                </span>
              </div>
            </article>
          </div>
        </section>

        {/* My Pets */}
        <section aria-labelledby="my-pets-heading">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="my-pets-heading"
                className="text-xl font-extrabold text-slate-900"
              >
                دوست‌های من
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                نگاهی سریع به وضعیت حیوانات خانگی‌ات
              </p>
            </div>

            <Link
              to="/dashboard/pets"
              className="inline-flex items-center gap-2 self-start text-sm font-bold text-blue-600 transition hover:text-blue-700 sm:self-auto"
            >
              مشاهده همه
              <span aria-hidden="true">←</span>
            </Link>
          </div>

          {loading ? (
            <div
              className="flex min-h-40 items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm"
              role="status"
            >
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              در حال دریافت اطلاعات دوست‌هایت...
            </div>
          ) : error ? (
            <div
              className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm"
              role="alert"
            >
              <strong className="text-base font-bold text-slate-800">
                دریافت اطلاعات حیوانات انجام نشد
              </strong>

              <p className="mt-2 text-sm leading-6 text-red-600">
                {error}
              </p>

              <button
                type="button"
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                onClick={() => void refreshPets()}
              >
                تلاش دوباره
              </button>
            </div>
          ) : pets.length ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {pets.slice(0, 2).map((pet) => (
                <article
                  className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg hover:shadow-blue-100/50"
                  key={pet.id}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-4xl">
                        {pet.type === "گربه"
                          ? "🐱"
                          : pet.type === "سگ"
                            ? "🐶"
                            : "🐾"}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-extrabold text-slate-900">
                          {pet.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {pet.type} · {pet.breed}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <span aria-hidden="true">● </span>
                        پرونده فعال
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">سن</p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {pet.age} سال
                        </p>
                      </div>

                      <div className="border-x border-slate-200 text-center">
                        <p className="text-xs text-slate-400">وزن</p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {pet.weight} کیلوگرم
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-slate-400">جنسیت</p>
                        <p className="mt-2 text-sm font-bold text-slate-800">
                          {pet.gender}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-slate-400">
                        اطلاعات پایه سلامت
                      </span>

                      <Link
                        to={`/dashboard/pets/${pet.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                      >
                        پرونده سلامت
                        <span aria-hidden="true">←</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-blue-200 bg-white px-5 py-12 text-center shadow-sm">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
                🐾
              </span>

              <strong className="mt-5 text-lg font-extrabold text-slate-900">
                هنوز دوستی اضافه نکردی
              </strong>

              <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
                برای شروع، مشخصات حیوان خانگی‌ات را ثبت کن.
              </p>

              <Link
                to="/dashboard/pets/new"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <span aria-hidden="true">＋</span>
                افزودن حیوان
              </Link>
            </div>
          )}
        </section>

        {/* Appointments and Reminders */}
        <section
          className="grid grid-cols-1 gap-5 xl:grid-cols-2"
          aria-label="نوبت و یادآوری"
        >
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  نوبت بعدی
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  برای اینکه هیچ ویزیتی از دست نرود
                </p>
              </div>

              <Link
                to="/dashboard/appointments"
                className="inline-flex items-center gap-2 self-start text-sm font-bold text-blue-600 transition hover:text-blue-700 sm:self-auto"
              >
                همه نوبت‌ها
                <span aria-hidden="true">←</span>
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl text-blue-600 shadow-sm">
                ♡
              </span>

              <div>
                <strong className="text-sm font-bold text-slate-800">
                  نوبتی ثبت نشده است
                </strong>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  امکان ثبت نوبت در مرحله بعد به سامانه اضافه می‌شود.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  یادآوری‌های نزدیک
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  مراقبت‌های پیش رو
                </p>
              </div>

              <Link
                to="/dashboard/reminders"
                className="inline-flex items-center gap-2 self-start text-sm font-bold text-blue-600 transition hover:text-blue-700 sm:self-auto"
              >
                همه یادآوری‌ها
                <span aria-hidden="true">←</span>
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl text-sky-600 shadow-sm">
                ♧
              </span>

              <div>
                <strong className="text-sm font-bold text-slate-800">
                  یادآوری ثبت نشده است
                </strong>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  ثبت و زمان‌بندی یادآوری‌ها به‌زودی اضافه می‌شود.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;