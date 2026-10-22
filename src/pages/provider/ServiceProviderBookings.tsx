import { useCallback, useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../api/client";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type Booking = {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;

  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerProvince?: string;
  customerCity?: string;
  customerAddress?: string;

  providerName?: string;
  providerType?: "trainer" | "walker";
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

function formatDate(date?: string) {
  if (!date) return "تاریخ نامشخص";

  const normalizedDate = date.split("T")[0];
  const parts = normalizedDate.split("-");

  if (parts.length !== 3) return normalizedDate;

  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

function formatTime(time?: string) {
  if (!time) return "--:--";

  return time.slice(0, 5);
}

export default function ServiceProviderBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  async function changeStatus(bookingId: number, status: BookingStatus) {
    setUpdatingId(bookingId);
    setError("");

    try {
      await api.patch(`/providers/bookings/${bookingId}/status`, {
        status,
      });

      await loadBookings();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">مدیریت نوبت‌ها</h1>
          <p className="mt-2 text-sm text-slate-500">
            درخواست‌های نوبت را مشاهده و وضعیت آن‌ها را مدیریت کن.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBookings()}
          disabled={loading}
          className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
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
          <h2 className="font-bold text-slate-800">هنوز نوبتی ثبت نشده است</h2>
          <p className="mt-2 text-sm text-slate-500">
            درخواست‌های جدید در این بخش نمایش داده می‌شوند.
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
                    {booking.customerName || "صاحب حیوان"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    تاریخ: {formatDate(booking.bookingDate)}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    ساعت: {formatTime(booking.startTime)} تا{" "}
                    {formatTime(booking.endTime)}
                  </p>

                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <h3 className="mb-3 font-bold text-slate-800">
                      اطلاعات تماس و آدرس مشتری
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">شماره تماس</p>
                        {booking.customerPhone ? (
                          <a
                            href={`tel:${booking.customerPhone}`}
                            className="mt-1 inline-block font-medium text-blue-700 hover:underline"
                            dir="ltr"
                          >
                            {booking.customerPhone}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">
                            ثبت نشده است
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">ایمیل</p>
                        <p
                          className="mt-1 break-all text-sm text-slate-700"
                          dir="ltr"
                        >
                          {booking.customerEmail || "ثبت نشده است"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">استان</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {booking.customerProvince || "ثبت نشده است"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">شهر</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {booking.customerCity || "ثبت نشده است"}
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-500">آدرس کامل</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {booking.customerAddress || "آدرسی ثبت نشده است"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[booking.status] ??
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {statusLabels[booking.status] ?? booking.status}
                </span>
              </div>

              {booking.status !== "cancelled" &&
                booking.status !== "completed" && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {booking.status === "pending" && (
                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          void changeStatus(booking.id, "confirmed")
                        }
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        تأیید نوبت
                      </button>
                    )}

                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        disabled={updatingId === booking.id}
                        onClick={() =>
                          void changeStatus(booking.id, "completed")
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        ثبت انجام نوبت
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => void changeStatus(booking.id, "cancelled")}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      لغو نوبت
                    </button>
                  </div>
                )}

              {updatingId === booking.id && (
                <p className="mt-3 text-xs text-slate-500">
                  در حال بروزرسانی وضعیت...
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
