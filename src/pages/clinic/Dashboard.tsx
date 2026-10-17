
import { useEffect, useState } from "react";
import {
  getClinicAppointments,
  type ClinicAppointment,
} from "../../services/ClinicAppointmentService";

const statusConfig = {
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

function Dashboard() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      setError("دریافت اطلاعات داشبورد با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "pending",
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "confirmed",
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "completed",
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "cancelled",
  ).length;

  const statistics = [
    {
      title: "در انتظار تأیید",
      count: pendingCount,
      description: "نوبت‌های نیازمند بررسی",
      icon: "◷",
      color: "amber",
    },
    {
      title: "تأیید شده",
      count: confirmedCount,
      description: "نوبت‌های تأییدشده",
      icon: "✓",
      color: "blue",
    },
    {
      title: "تکمیل شده",
      count: completedCount,
      description: "ویزیت‌های انجام‌شده",
      icon: "▣",
      color: "indigo",
    },
    {
      title: "لغو شده",
      count: cancelledCount,
      description: "نوبت‌های لغوشده",
      icon: "×",
      color: "red",
    },
  ];

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[360px] flex-col items-center justify-center gap-4"
      >
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="text-sm font-semibold text-slate-600">
          در حال دریافت اطلاعات داشبورد...
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-7">
      {/* Page heading */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-950 via-blue-800 to-blue-700 px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8">
        <div className="relative z-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
            نمای کلی کلینیک
          </span>

          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            داشبورد کلینیک
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
            وضعیت نوبت‌ها را بررسی کنید و از آخرین فعالیت‌های کلینیک مطلع شوید.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="absolute -left-8 -top-12 h-44 w-44 rounded-full border-[24px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 left-32 h-40 w-40 rounded-full bg-white/5"
        />
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-medium text-red-800">{error}</p>

          <button
            type="button"
            onClick={loadData}
            className="w-fit rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Statistics */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">
            آمار نوبت‌ها
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            خلاصه‌ای از وضعیت نوبت‌های ثبت‌شده
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item) => {
            const colors = {
              amber: {
                icon: "bg-amber-100 text-amber-800",
                border: "border-amber-200",
                number: "text-amber-800",
                accent: "bg-amber-500",
              },
              blue: {
                icon: "bg-blue-100 text-blue-800",
                border: "border-blue-200",
                number: "text-blue-800",
                accent: "bg-blue-600",
              },
              indigo: {
                icon: "bg-indigo-100 text-indigo-800",
                border: "border-indigo-200",
                number: "text-indigo-800",
                accent: "bg-indigo-600",
              },
              red: {
                icon: "bg-red-100 text-red-800",
                border: "border-red-200",
                number: "text-red-800",
                accent: "bg-red-500",
              },
            };

            const style = colors[item.color as keyof typeof colors];

            return (
              <article
                key={item.title}
                className={`relative overflow-hidden rounded-2xl border ${style.border} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {item.title}
                    </p>

                    <p
                      className={`mt-4 text-4xl font-extrabold tabular-nums ${style.number}`}
                    >
                      {item.count}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold ${style.icon}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium text-slate-600">
                  {item.description}
                </p>

                <div
                  className={`absolute bottom-0 right-0 h-1 w-full ${style.accent}`}
                />
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent appointments */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              آخرین نوبت‌ها
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {appointments.length === 0
                ? "هنوز نوبتی ثبت نشده است"
                : `${appointments.length} نوبت در اطلاعات دریافتی`}
            </p>
          </div>

          <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
            نمایش ۵ نوبت اخیر
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-700">
              ▦
            </div>
            <h3 className="mt-4 font-bold text-slate-800">
              نوبتی برای نمایش وجود ندارد
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              با ثبت نوبت جدید، اطلاعات آن در این قسمت نمایش داده می‌شود.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.slice(0, 5).map((appointment) => {
              const status =
                statusConfig[
                  appointment.status as keyof typeof statusConfig
                ];

              return (
                <article
                  key={appointment.id}
                  className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xl text-blue-800">
                      🐾
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-extrabold text-slate-900">
                        {appointment.pet_name || "نامشخص"}
                      </h3>

                      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-600">
                        <span>{appointment.appointment_date}</span>
                        <span className="text-slate-400">|</span>
                        <span>{appointment.appointment_time}</span>
                      </p>

                      {appointment.description && (
                        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pr-14 sm:pr-0">
                    {status ? (
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ring-1 ring-inset ${status.className}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
                        وضعیت نامشخص
                      </span>
                    )}
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

export default Dashboard;
