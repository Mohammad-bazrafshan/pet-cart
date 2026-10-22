
import { useEffect, useState } from "react";
import { api } from "../../api/client";

type ProviderRequest = {
  id: number;
  provider_type: "trainer" | "walker";
  full_name: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  address: string | null;
  bio: string | null;
  experience_years: number;
  specialties: string[];
  price: number | null;
  price_unit: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function ProviderCooperationRequests() {
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("pending");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ProviderRequest[]>(
        "/provider-cooperation-requests",
      );

      setRequests(response.data);
    } catch (err) {
      console.error(err);
      setError("دریافت درخواست‌های همکاری ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function reviewRequest(
    request: ProviderRequest,
    status: "approved" | "rejected",
  ) {
    const action = status === "approved" ? "تأیید" : "رد";

    if (
      !window.confirm(
        `آیا از ${action} درخواست ${request.full_name} مطمئن هستید؟`,
      )
    ) {
      return;
    }

    try {
      setProcessingId(request.id);
      setError("");

      await api.patch(
        `/provider-cooperation-requests/${request.id}`,
        { status },
      );

      await loadRequests();
    } catch (err) {
      console.error(err);
      setError(
        "بررسی درخواست انجام نشد. ممکن است درخواست قبلاً بررسی شده باشد.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((request) => request.status === filter);

  const pendingCount = requests.filter(
    (request) => request.status === "pending",
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved",
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected",
  ).length;

  function statusLabel(status: ProviderRequest["status"]) {
    if (status === "pending") return "در انتظار بررسی";
    if (status === "approved") return "تأیید شده";
    return "رد شده";
  }

  function typeLabel(type: ProviderRequest["provider_type"]) {
    return type === "trainer" ? "ترینر" : "واکر";
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          درخواست‌های همکاری ترینر و واکر
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          درخواست‌ها را بررسی کن و در صورت تأیید، حساب کاربری متقاضی ساخته
          می‌شود.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-700">در انتظار بررسی</p>
          <p className="mt-2 text-2xl font-bold text-amber-800">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm text-blue-700">تأیید شده</p>
          <p className="mt-2 text-2xl font-bold text-blue-800">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-sm text-rose-700">رد شده</p>
          <p className="mt-2 text-2xl font-bold text-rose-800">
            {rejectedCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "pending", label: "در انتظار بررسی" },
            { value: "approved", label: "تأیید شده" },
            { value: "rejected", label: "رد شده" },
            { value: "all", label: "همه درخواست‌ها" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void loadRequests()}
          disabled={loading}
          className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
        >
          به‌روزرسانی
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          در حال دریافت درخواست‌ها...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-700">
            درخواستی برای نمایش وجود ندارد.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            درخواست‌های جدید در این بخش نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">
                      {request.full_name}
                    </h2>

                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {typeLabel(request.provider_type)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    درخواست شماره {request.id}
                  </p>
                </div>

                <span
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    request.status === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : request.status === "approved"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {statusLabel(request.status)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-slate-400">ایمیل</p>
                  <p className="mt-1 break-all font-medium text-slate-700">
                    {request.email}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">شماره تماس</p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.phone}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">شهر و استان</p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.province}، {request.city}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">سابقه کاری</p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.experience_years} سال
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">هزینه پیشنهادی</p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.price != null
                      ? `${Number(request.price).toLocaleString("fa-IR")} ${
                          request.price_unit ?? ""
                        }`
                      : "ثبت نشده"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">تاریخ درخواست</p>
                  <p className="mt-1 font-medium text-slate-700">
                    {new Date(request.created_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              </div>

              {request.address && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400">آدرس</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {request.address}
                  </p>
                </div>
              )}

              {request.bio && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400">معرفی و توضیحات</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {request.bio}
                  </p>
                </div>
              )}

              {request.specialties.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400">تخصص‌ها</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {request.specialties.map((specialty, index) => (
                      <span
                        key={`${specialty}-${index}`}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {request.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={processingId === request.id}
                    onClick={() =>
                      void reviewRequest(request, "approved")
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingId === request.id
                      ? "در حال بررسی..."
                      : "تأیید و ساخت حساب"}
                  </button>

                  <button
                    type="button"
                    disabled={processingId === request.id}
                    onClick={() =>
                      void reviewRequest(request, "rejected")
                    }
                    className="rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    رد درخواست
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
