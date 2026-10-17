import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClinicPatients,
  type ClinicPatient,
} from "../../services/ClinicPatientService";

function Patients() {
  const [patients, setPatients] = useState<ClinicPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicPatients();
      setPatients(data);
    } catch (error) {
      console.error(error);
      setError("دریافت بیماران با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return patients;

    return patients.filter((patient) =>
      [
        patient.name,
        patient.type,
        patient.breed,
        patient.owner_name,
        patient.owner_email,
      ].some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [patients, search]);

  if (loading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="text-sm font-medium text-slate-500">
          در حال دریافت اطلاعات بیماران...
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-800 via-blue-700 to-sky-600 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              مدیریت بیماران
            </div>

            <h1 className="text-2xl font-extrabold sm:text-3xl">
              بیماران کلینیک
            </h1>

            <p className="mt-2 text-sm leading-6 text-blue-100 sm:text-base">
              مشاهده اطلاعات حیوانات، صاحبان آن‌ها و پرونده پزشکی
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-white/20 bg-white/10 sm:self-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z" />
              <path d="M8.5 12h7" />
              <path d="M12 8.5v7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                تعداد کل بیماران
              </p>
              <p className="mt-2 text-3xl font-extrabold text-blue-800">
                {patients.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                حیوانات ثبت‌شده برای این کلینیک
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                نتایج جست‌وجو
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-800">
                {filteredPatients.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                تعداد بیماران مطابق عبارت جست‌وجو
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label
          htmlFor="patient-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          جست‌وجو در بیماران
        </label>

        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            id="patient-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="نام حیوان، نوع، نژاد یا نام و ایمیل صاحب حیوان..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadPatients}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            {patients.length === 0
              ? "هنوز بیماری ثبت نشده است"
              : "بیماری پیدا نشد"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {patients.length === 0
              ? "پس از ثبت نوبت برای حیوانات، اطلاعات بیماران در این بخش نمایش داده می‌شود."
              : "عبارت دیگری را جست‌وجو کنید یا فیلد جست‌وجو را پاک کنید."}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              پاک کردن جست‌وجو
            </button>
          )}
        </section>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              فهرست بیماران
            </h2>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
              {filteredPatients.length} بیمار
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPatients.map((patient) => (
              <article
                key={patient.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5"
              >
                <div className="h-1.5 bg-gradient-to-l from-blue-800 via-blue-600 to-sky-400" />

                <div className="p-5">
                  {/* Pet info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="27"
                          height="27"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 21c-3.5 0-6-2-6-5 0-2 1.5-4 4-4 1 0 1.5.5 2 .5s1-.5 2-.5c2.5 0 4 2 4 4 0 3-2.5 5-6 5Z" />
                          <ellipse cx="5" cy="7" rx="2" ry="2.5" />
                          <ellipse cx="10" cy="4.5" rx="2" ry="2.5" />
                          <ellipse cx="15" cy="4.5" rx="2" ry="2.5" />
                          <ellipse cx="19" cy="7" rx="2" ry="2.5" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-slate-800">
                          {patient.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {patient.type}
                          {patient.breed && ` · ${patient.breed}`}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                      بیمار
                    </span>
                  </div>

                  {/* Pet details */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">سن</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {patient.age ?? "ثبت نشده"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">وزن</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {patient.weight
                          ? `${patient.weight} کیلوگرم`
                          : "ثبت نشده"}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">جنسیت</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {patient.gender ?? "ثبت نشده"}
                      </p>
                    </div>
                  </div>

                  {/* Owner info */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-700"
                      >
                        <path d="M20 21a8 8 0 0 0-16 0" />
                        <circle cx="12" cy="8" r="4" />
                      </svg>

                      <p className="text-sm font-bold text-slate-700">
                        اطلاعات صاحب حیوان
                      </p>
                    </div>

                    <p className="break-words text-sm font-medium text-slate-800">
                      {patient.owner_name || "نام ثبت نشده"}
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      {patient.owner_email || "ایمیل ثبت نشده"}
                    </p>
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => navigate(`/clinic/patients/${patient.id}`)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    مشاهده پرونده بیمار

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Patients;