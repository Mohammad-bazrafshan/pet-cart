import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import PetCard from "../../components/common/pet/PetCard";
import {
  deletePet,
  getPets,
  type Pet,
} from "../../services/PetService";

function Pets() {
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
      setError("دریافت اطلاعات حیوانات با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPets = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPets();

        if (!cancelled) {
          setPets(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setError("دریافت اطلاعات حیوانات با خطا مواجه شد.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPets();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این حیوان را حذف کنید؟",
    );

    if (!confirmed) return;

    try {
      await deletePet(id);

      setPets((currentPets) =>
        currentPets.filter((pet) => pet.id !== id),
      );
    } catch (error) {
      console.error(error);
      alert("حذف حیوان با خطا مواجه شد.");
    }
  };

  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-8">
      {/* Page heading */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-600">
            <span aria-hidden="true">✦</span>
            فضای شخصی تو
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            حیوانات من
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
            دوست‌های کوچکت را از اینجا مدیریت کن و به پرونده سلامتشان
            دسترسی داشته باش.
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

      {/* Pets summary */}
      {!loading && !error && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-3xl border border-blue-100 bg-gradient-to-l from-blue-50 to-white p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-blue-100">
              🐾
            </span>

            <div>
              <p className="text-sm text-slate-500">
                تعداد حیوانات ثبت‌شده
              </p>

              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {pets.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border border-sky-100 bg-gradient-to-l from-sky-50 to-white p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-sky-100">
              ♡
            </span>

            <div>
              <p className="text-sm font-bold text-slate-800">
                مراقبت با عشق شروع می‌شود
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-500">
                اطلاعات سلامت دوست کوچکت را همیشه به‌روز نگه دار.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Loading */}
      {loading ? (
        <div
          className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm"
          role="status"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          </span>

          <p className="mt-5 text-sm font-bold text-slate-700">
            در حال دریافت فهرست حیوانات...
          </p>

          <p className="mt-2 text-xs text-slate-400">
            کمی صبر کن، اطلاعات دوست‌هایت در حال بارگذاری است.
          </p>
        </div>
      ) : error ? (
        /* Error */
        <div
          className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm sm:p-8"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
              !
            </span>

            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-900">
                دریافت فهرست حیوانات انجام نشد
              </h2>

              <p className="mt-2 text-sm leading-7 text-red-600">
                {error}
              </p>

              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                onClick={() => void refreshPets()}
              >
                <span aria-hidden="true">↻</span>
                تلاش دوباره
              </button>
            </div>
          </div>
        </div>
      ) : pets.length ? (
        /* Pets list */
        <section aria-labelledby="pets-list-heading">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2
                id="pets-list-heading"
                className="text-lg font-extrabold text-slate-900"
              >
                دوست‌های دوست‌داشتنی تو
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                برای مشاهده و مدیریت اطلاعات هر حیوان، کارت آن را انتخاب کن.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
              {pets.length} حیوان
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      ) : (
        /* Empty state */
        <section className="flex flex-col items-center rounded-[2rem] border border-dashed border-blue-200 bg-white px-5 py-12 text-center shadow-sm sm:py-16">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
            🐾
          </span>

          <h2 className="mt-6 text-xl font-extrabold text-slate-900">
            هنوز حیوانی ثبت نکرده‌ای
          </h2>

          <p className="mt-3 max-w-md text-sm leading-8 text-slate-500">
            با افزودن اولین حیوان، پرونده سلامت او را بساز و اطلاعاتش را
            در پت‌کارت مدیریت کن.
          </p>

          <Link
            to="/dashboard/pets/new"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <span className="text-xl" aria-hidden="true">
              ＋
            </span>
            افزودن اولین حیوان
          </Link>
        </section>
      )}
    </div>
  );
}

export default Pets;