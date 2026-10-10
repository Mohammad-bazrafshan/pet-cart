
import { useEffect, useState } from "react";
import axios from "axios";
import { api, getApiErrorMessage } from "../../api/client";
type RequestStatus = "pending" | "approved" | "rejected";

interface CooperationRequest {
  id: number;
  clinic_name: string;
  manager_name: string;
  phone: string;
  city: string;
  description: string | null;
  status: RequestStatus;
  created_at: string;
}

function getStatusLabel(status: RequestStatus) {
  switch (status) {
    case "pending":
      return "در انتظار بررسی";
    case "approved":
      return "تأیید شده";
    case "rejected":
      return "رد شده";
  }
}

export default function CooperationRequests() {
  const [requests, setRequests] = useState<CooperationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchRequests() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<CooperationRequest[]>(
        "/admin/cooperation-requests"
      );

      setRequests(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;

      setError(
        errorMessage || "دریافت درخواست‌های همکاری ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchRequests();
  }, []);

  async function handleReview(
    requestId: number,
    status: "approved" | "rejected"
  ) {
    const action = status === "approved" ? "تأیید" : "رد";

    const confirmed = window.confirm(
      `آیا از ${action} این درخواست اطمینان داری؟`
    );

    if (!confirmed) return;

    try {
      setProcessingId(requestId);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/cooperation-requests/${requestId}`,
        { status }
      );

      setMessage(response.data.message);

      // به‌روزرسانی فهرست پس از انجام عملیات
      await fetchRequests();
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;

      setError(errorMessage || "تغییر وضعیت درخواست ناموفق بود.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div dir="rtl" className="p-6 text-slate-600">
        در حال دریافت درخواست‌ها...
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          درخواست‌های همکاری کلینیک
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          درخواست‌های ثبت‌شده را بررسی و مدیریت کن.
        </p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          هنوز درخواست همکاری ثبت نشده است.
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {request.clinic_name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    درخواست شماره {request.id}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    request.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : request.status === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {getStatusLabel(request.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">نام مسئول</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {request.manager_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">شماره تماس</p>
                  <p dir="ltr" className="mt-1 text-right font-medium text-slate-800">
                    {request.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">شهر</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {request.city}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">تاریخ ثبت</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {new Date(request.created_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              </div>

              {request.description && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">توضیحات</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {request.description}
                  </p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={processingId !== null}
                    onClick={() =>
                      void handleReview(request.id, "approved")
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingId === request.id
                      ? "در حال پردازش..."
                      : "تأیید درخواست"}
                  </button>

                  <button
                    type="button"
                    disabled={processingId !== null}
                    onClick={() =>
                      void handleReview(request.id, "rejected")
                    }
                    className="rounded-xl bg-red-50 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
