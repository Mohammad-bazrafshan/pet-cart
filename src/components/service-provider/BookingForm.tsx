
import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../api/client";

type TimeSlot = {
  startTime: string;
  endTime: string;
};

type BookingFormProps = {
  providerId: number;
  providerName: string;
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function BookingForm({
  providerId,
  providerName,
}: BookingFormProps) {
  const [date, setDate] = useState(getToday());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      setLoadingSlots(true);
      setError("");
      setSuccess("");
      setSelectedSlot("");
      setSlots([]);

      try {
        const response = await api.get<TimeSlot[]>(
          "/providers/availability",
          {
            params: {
              providerId,
              date,
            },
          },
        );

        if (!cancelled) {
          setSlots(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    }

    if (providerId > 0 && date) {
      void loadSlots();
    }

    return () => {
      cancelled = true;
    };
  }, [providerId, date]);

  async function handleBooking() {
    if (!selectedSlot) {
      setError("لطفاً یک ساعت را انتخاب کن.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const slot = slots.find(
      (item) => item.startTime === selectedSlot,
    );

    if (!slot) {
      setError("این ساعت دیگر در دسترس نیست. ساعت‌ها را بروزرسانی کن.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/providers/bookings", {
        serviceProviderId: providerId,
        bookingDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      setSuccess("درخواست نوبت با موفقیت ثبت شد.");
      setSelectedSlot("");

      const response = await api.get<TimeSlot[]>(
        "/providers/availability",
        {
          params: {
            providerId,
            date,
          },
        },
      );

      setSlots(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-xl font-bold text-slate-800">
        رزرو نوبت
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        انتخاب زمان برای {providerName}
      </p>

      <div className="mt-5">
        <label
          htmlFor="booking-date"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          تاریخ نوبت
        </label>

        <input
          id="booking-date"
          type="date"
          min={getToday()}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label className="block text-sm font-medium text-slate-700">
            ساعت‌های آزاد
          </label>

          <button
            type="button"
            onClick={() => setDate((current) => current)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {/* تاریخ با تغییر انتخاب، ساعت‌ها را بروزرسانی می‌کند */}
          </button>
        </div>

        {loadingSlots ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            در حال دریافت ساعت‌های آزاد...
          </p>
        ) : slots.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            برای این تاریخ ساعت آزادی پیدا نشد.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.startTime;

              return (
                <button
                  key={`${slot.startTime}-${slot.endTime}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot.startTime)}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {slot.startTime.slice(0, 5)} تا{" "}
                  {slot.endTime.slice(0, 5)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleBooking()}
        disabled={
          submitting ||
          loadingSlots ||
          !selectedSlot ||
          slots.length === 0
        }
        className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "در حال ثبت نوبت..." : "ثبت نوبت"}
      </button>

      <p className="mt-3 text-xs leading-6 text-slate-500">
        ثبت نوبت به معنی ارسال درخواست است؛ وضعیت آن ممکن است تا زمان تأیید
        ارائه‌دهنده، در انتظار تأیید باقی بماند.
      </p>
    </section>
  );
}
