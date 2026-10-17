
import { useEffect, useMemo, useState } from "react";
import {
  getClinicAppointments,
  updateClinicAppointmentStatus,
  type ClinicAppointment,
} from "../../services/ClinicAppointmentService";

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "در انتظار تأیید",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "تأیید شده",
    className: "bg-blue-50 text-blue-800 ring-blue-200",
    dot: "bg-blue-600",
  },
  completed: {
    label: "تکمیل شده",
    className: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-600",
  },
  cancelled: {
    label: "لغو شده",
    className: "bg-red-50 text-red-800 ring-red-200",
    dot: "bg-red-500",
  },
};

function Appointments() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      setError("دریافت نوبت‌ها با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (
    id: number,
    status: "confirmed" | "completed",
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      const updatedAppointment =
        await updateClinicAppointmentStatus(id, status);

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: updatedAppointment.status }
            : appointment,
        ),
      );
    } catch (error) {
      console.error(error);
      setError("تغییر وضعیت نوبت با خطا مواجه شد.");
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    }),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;

      const searchableText = [
        appointment.pet_name,
        appointment.veterinarian_name,
        appointment.specialty,
        appointment.description,
        appointment.appointment_date,
        appointment.appointment_time,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return matchesStatus && searchableText.includes(query);
    });
  }, [appointments, search, statusFilter]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[360px] flex-col items-center justify-center gap-4"
      >
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="text-sm font-semibold text-slate-600">
          در حال دریافت نوبت‌ها...
        </p>
      </div>
    );
  }

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "همه نوبت‌ها", value: "all" },
    { label: "در انتظار", value: "pending" },
    { label: "تأیید شده", value: "confirmed" },
    { label: "تکمیل شده", value: "completed" },
    { label: "لغو شده", value: "cancelled" },
  ];

  return (
    <div dir="rtl" className="space-y-7">
      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-950 via-blue-800 to-blue-700 px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8">
        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
            مدیریت کلینیک
          </span>

          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            مدیریت نوبت‌ها
          </h1>

          <p className="mt-2 text-sm leading-7 text-blue-100 sm:text-base">
            نوبت‌های ثبت‌شده را بررسی کنید و وضعیت آن‌ها را مدیریت کنید.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="absolute -left-8 -top-12 h-44 w-44 rounded-full border-[24px] border-white/5"
        />
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            type="button"
            onClick={loadAppointments}
            className="w-fit rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Summary cards */}
      <section className="grid gap-3 grid-cols-2 xl:grid-cols-5">
        {filters.map((filter) => {
          const active = statusFilter === filter.value;
          const count = counts[filter.value];

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={active}
              className={`rounded-xl border p-4 text-right transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                active
                  ? "border-blue-800 bg-blue-800 text-white shadow-md shadow-blue-900/10"
                  : "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <span
                className={`block text-xs font-bold sm:text-sm ${
                  active ? "text-blue-100" : "text-slate-600"
                }`}
              >
                {filter.label}
              </span>
              <span className="mt-2 block text-2xl font-extrabold tabular-nums">
                {count}
              </span>
            </button>
          );
        })}
      </section>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <label
          htmlFor="appointment-search"
          className="mb-2 block text-sm font-bold text-slate-800"
        >
          جست‌وجو در نوبت‌ها
        </label>

        <div className="relative">
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            id="appointment-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="نام حیوان، دامپزشک، تاریخ یا توضیحات..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pr-10 pl-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm ${
                statusFilter === filter.value
                  ? "bg-blue-100 text-blue-900 ring-1 ring-blue-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Appointment list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              فهرست نوبت‌ها
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {filteredAppointments.length} نوبت قابل نمایش
            </p>
          </div>

          <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
            {statusFilter === "all"
              ? "تمام وضعیت‌ها"
              : filters.find((filter) => filter.value === statusFilter)?.label}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-800">
              ▦
            </div>
            <h3 className="mt-4 font-bold text-slate-800">
              نوبتی پیدا نشد
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              عبارت جست‌وجو یا فیلتر انتخاب‌شده را تغییر دهید.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              نمایش همه نوبت‌ها
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];

              return (
                <article
                  key={appointment.id}
                  className="p-5 transition hover:bg-slate-50/80 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-2xl">
                        🐾
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                            {appointment.pet_name || "نام حیوان ثبت نشده"}
                          </h3>

                          {status && (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${status.className}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${status.dot}`}
                              />
                              {status.label}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
                          <p className="text-slate-700">
                            <span className="font-bold text-slate-900">
                              تاریخ:
                            </span>{" "}
                            {appointment.appointment_date}
                          </p>

                          <p className="text-slate-700">
                            <span className="font-bold text-slate-900">
                              ساعت:
                            </span>{" "}
                            {appointment.appointment_time}
                          </p>

                          <p className="text-slate-700">
                            <span className="font-bold text-slate-900">
                              دامپزشک:
                            </span>{" "}
                            {appointment.veterinarian_name || "تعیین نشده"}
                          </p>

                          {appointment.specialty && (
                            <p className="text-slate-700">
                              <span className="font-bold text-slate-900">
                                تخصص:
                              </span>{" "}
                              {appointment.specialty}
                            </p>
                          )}
                        </div>

                        {appointment.description && (
                          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                            <span className="font-bold text-slate-900">
                              توضیحات:
                            </span>{" "}
                            {appointment.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                      {appointment.status === "pending" && (
                        <button
                          type="button"
                          disabled={updatingId === appointment.id}
                          onClick={() =>
                            handleStatusChange(appointment.id, "confirmed")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === appointment.id && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          )}
                          {updatingId === appointment.id
                            ? "در حال ثبت..."
                            : "تأیید نوبت"}
                        </button>
                      )}

                      {appointment.status === "confirmed" && (
                        <button
                          type="button"
                          disabled={updatingId === appointment.id}
                          onClick={() =>
                            handleStatusChange(appointment.id, "completed")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updatingId === appointment.id && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          )}
                          {updatingId === appointment.id
                            ? "در حال ثبت..."
                            : "تکمیل نوبت"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Appointments;
