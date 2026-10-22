
import { useCallback, useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../api/client";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

type Booking = {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  provider_name?: string;
  provider_type?: "trainer" | "walker";
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  cancelled: "لغو شده",
  completed: "انجام شده",
};

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
};

export default function ServiceBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<Booking[]>("/providers/bookings");
      setBookings(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  async function cancelBooking(id: number) {
    const confirmed = window.confirm("از لغو این نوبت مطمئنی؟");

    if (!confirmed) return;

    setCancellingId(id);
    setError("");

    try {
      await api.patch(`/providers/bookings/${id}/status`, {
        status: "cancelled",
      });

      await loadBookings();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            نوبت‌های من
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            نوبت‌های ثبت‌شده برای مربی‌ها و پت‌واکرها را مدیریت کن.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBookings()}
          disabled={loading}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
        >
          بروزرسانی
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          در حال دریافت نوبت‌ها...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mb-3 text-4xl">📅</div>
          <h2 className="font-bold text-slate-800">
            هنوز نوبتی ثبت نکرده‌ای
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            بعد از ثبت نوبت، اطلاعات آن در اینجا نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-800">
                    {booking.provider_name || "ارائه‌دهنده خدمات"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    نوع خدمات:{" "}
                    {booking.provider_type === "trainer"
                      ? "مربی حیوانات"
                      : booking.provider_type === "walker"
                        ? "پت‌واکر"
                        : "خدمات حیوانات"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    تاریخ: {booking.booking_date?.split("T")[0]}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    ساعت: {booking.start_time?.slice(0, 5)} تا{" "}
                    {booking.end_time?.slice(0, 5)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[booking.status]}`}
                >
                  {statusLabels[booking.status]}
                </span>
              </div>

              {(booking.status === "pending" ||
                booking.status === "confirmed") && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={cancellingId === booking.id}
                    onClick={() => void cancelBooking(booking.id)}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === booking.id
                      ? "در حال لغو..."
                      : "لغو نوبت"}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
