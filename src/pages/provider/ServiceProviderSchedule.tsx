
import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../api/client";

type ScheduleDay = {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export default function ServiceProviderSchedule() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setError("");

        const response = await api.get<ScheduleDay[]>(
          "/providers/schedule",
        );

        setSchedule(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const updateDay = (
    dayOfWeek: number,
    changes: Partial<ScheduleDay>,
  ) => {
    setSchedule((previousSchedule) =>
      previousSchedule.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, ...changes }
          : day,
      ),
    );

    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await api.put("/providers/schedule", { schedule });

      setSuccess("برنامه کاری شما با موفقیت ذخیره شد.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-64 items-center justify-center text-blue-700"
      >
        در حال دریافت برنامه کاری...
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto w-full max-w-5xl space-y-6">
      {/* عنوان صفحه */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          برنامه کاری من
        </h1>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          روزهای کاری و ساعت‌هایی را که برای ارائه خدمات در دسترس
          هستید مشخص کنید.
        </p>
      </div>

      {/* راهنما */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm leading-7 text-blue-800">
          روزهایی را که امکان ارائه خدمات دارید فعال کنید و ساعت
          شروع و پایان فعالیت خود را وارد کنید.
        </p>
      </div>

      {/* پیام‌ها */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700"
        >
          {success}
        </div>
      )}

      {/* روزهای هفته */}
      <div className="space-y-4">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
              day.isAvailable
                ? "border-blue-200"
                : "border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* نام روز و وضعیت */}
              <div className="flex items-center justify-between gap-4 sm:min-w-36 sm:justify-start">
                <h2 className="font-bold text-slate-800">
                  {day.dayName}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    day.isAvailable
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {day.isAvailable ? "روز کاری" : "تعطیل"}
                </span>
              </div>

              {/* ساعت شروع و پایان */}
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`start-${day.dayOfWeek}`}
                    className="mb-2 block text-sm text-slate-600"
                  >
                    ساعت شروع
                  </label>

                  <input
                    id={`start-${day.dayOfWeek}`}
                    type="time"
                    value={day.startTime}
                    disabled={!day.isAvailable}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        startTime: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`end-${day.dayOfWeek}`}
                    className="mb-2 block text-sm text-slate-600"
                  >
                    ساعت پایان
                  </label>

                  <input
                    id={`end-${day.dayOfWeek}`}
                    type="time"
                    value={day.endTime}
                    disabled={!day.isAvailable}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        endTime: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* فعال یا غیرفعال کردن روز */}
              <label className="flex cursor-pointer items-center gap-3 sm:min-w-32 sm:justify-end">
                <input
                  type="checkbox"
                  checked={day.isAvailable}
                  onChange={(event) =>
                    updateDay(day.dayOfWeek, {
                      isAvailable: event.target.checked,
                    })
                  }
                  className="h-5 w-5 cursor-pointer accent-blue-600"
                />

                <span className="text-sm text-slate-700">
                  در دسترس هستم
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* ذخیره برنامه */}
      <div className="flex justify-start pb-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || schedule.length !== 7}
          className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "در حال ذخیره..." : "ذخیره برنامه کاری"}
        </button>
      </div>
    </div>
  );
}
