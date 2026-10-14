
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../../api/client";

type RequestStatus = "pending" | "approved" | "rejected";

interface CooperationRequest {
  id: number;
  clinic_name: string;
  manager_name: string;
  vet_license_number: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  description: string | null;
  has_license_document: boolean;
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

function getStatusStyle(status: RequestStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-red-100 text-red-700";
  }
}

export default function CooperationRequests() {
  const [requests, setRequests] = useState<CooperationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
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
        typeof errorMessage === "string"
          ? errorMessage
          : "دریافت درخواست‌های همکاری ناموفق بود."
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

    if (!window.confirm(`آیا از ${action} این درخواست اطمینان داری؟`)) {
      return;
    }

    try {
      setProcessingId(requestId);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/admin/cooperation-requests/${requestId}`,
        { status }
      );

      setMessage(response.data.message || "وضعیت درخواست تغییر کرد.");
      await fetchRequests();
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;

      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "تغییر وضعیت درخواست ناموفق بود."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDownload(request: CooperationRequest) {
    try {
      setDownloadingId(request.id);
      setError("");

      const response = await api.get<Blob>(
        `/admin/cooperation-requests/${request.id}/license-document`,
        { responseType: "blob" }
      );

      const contentType = String(
        response.headers["content-type"] || ""
      ).toLowerCase();

      const extension = contentType.includes("pdf")
        ? ".pdf"
        : contentType.includes("png")
          ? ".png"
          : ".jpg";

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `clinic-license-${request.id}${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch {
      setError("دریافت پروانه فعالیت ناموفق بود. دوباره تلاش کن.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            درخواست‌های همکاری کلینیک
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            اطلاعات کلینیک و مدارک دامپزشک را بررسی و درخواست‌ها را مدیریت کن.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchRequests()}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "در حال دریافت..." : "به‌روزرسانی"}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-xl bg-emerald-50 p-4 text-emerald-700"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          در حال دریافت درخواست‌ها...
        </div>
      ) : requests.length === 0 ? (
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
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                    request.status
                  )}`}
                >
                  {getStatusLabel(request.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">نام مسئول کلینیک</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {request.manager_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    شماره نظام دامپزشکی
                  </p>
                  <p
                    dir="ltr"
                    className="mt-1 text-right font-medium text-slate-800"
                  >
                    {request.vet_license_number || "ثبت نشده"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">شماره تماس</p>
                  <p
                    dir="ltr"
                    className="mt-1 text-right font-medium text-slate-800"
                  >
                    {request.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">استان</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {request.province || "ثبت نشده"}
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

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">آدرس کلینیک</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {request.address || "آدرسی ثبت نشده است."}
                </p>
              </div>

              {request.description && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">توضیحات</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {request.description}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium text-slate-800">
                    پروانه فعالیت کلینیک
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {request.has_license_document
                      ? "مدرک در سامانه ثبت شده است."
                      : "مدرکی برای این درخواست ثبت نشده است."}
                  </p>
                </div>

                {request.has_license_document && (
                  <button
                    type="button"
                    disabled={downloadingId !== null}
                    onClick={() => void handleDownload(request)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloadingId === request.id
                      ? "در حال دریافت..."
                      : "دریافت پروانه"}
                  </button>
                )}
              </div>

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
                    {processingId === request.id
                      ? "در حال پردازش..."
                      : "رد درخواست"}
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
