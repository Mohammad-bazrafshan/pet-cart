
import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "../../api/client";

type ApplicationStatus = "pending" | "approved" | "rejected";

type VeterinarianApplication = {
  id: number;
  full_name: string;
  phone: string;
  license_number: string;
  specialty: string;
  province: string;
  city: string;
  work_type: string | null;
  description: string | null;
  status: ApplicationStatus;
  clinic_id: number;
  clinic_name: string;
  created_at: string;
};

function VeterinarianApplications() {
  const [applications, setApplications] = useState<
    VeterinarianApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadApplications() {
    try {
      setError("");

      const response = await api.get<VeterinarianApplication[]>(
        "/veterinarian-cooperation/applications/clinic-requests",
      );

      setApplications(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  async function reviewApplication(
    id: number,
    status: "approved" | "rejected",
  ) {
    const confirmed = window.confirm(
      status === "approved"
        ? "آیا از تأیید و اضافه کردن این دامپزشک به کلینیک مطمئن هستید؟"
        : "آیا از رد این درخواست مطمئن هستید؟",
    );

    if (!confirmed) return;

    try {
      setReviewingId(id);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/veterinarian-cooperation/applications/${id}/review`,
        { status },
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === id
            ? { ...application, status }
            : application,
        ),
      );

      setSuccess(response.data.message);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        در حال دریافت درخواست‌ها...
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          درخواست‌های همکاری دامپزشکان
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          درخواست‌های همکاری مربوط به کلینیک‌هایی که در آن‌ها عضو هستید.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="font-semibold text-gray-700">
            درخواستی برای بررسی وجود ندارد.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            درخواست‌های جدید در این بخش نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {application.full_name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {application.specialty}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    application.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : application.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {application.status === "pending"
                    ? "در انتظار بررسی"
                    : application.status === "approved"
                      ? "تأیید شده"
                      : "رد شده"}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-800">
                    کلینیک:
                  </span>{" "}
                  {application.clinic_name}
                </p>

                <p>
                  <span className="font-semibold text-gray-800">
                    شماره تماس:
                  </span>{" "}
                  {application.phone}
                </p>

                <p>
                  <span className="font-semibold text-gray-800">
                    شماره نظام دامپزشکی:
                  </span>{" "}
                  {application.license_number}
                </p>

                <p>
                  <span className="font-semibold text-gray-800">
                    محل سکونت:
                  </span>{" "}
                  {application.province}، {application.city}
                </p>

                {application.work_type && (
                  <p>
                    <span className="font-semibold text-gray-800">
                      نوع همکاری:
                    </span>{" "}
                    {application.work_type}
                  </p>
                )}

                {application.description && (
                  <div>
                    <p className="font-semibold text-gray-800">
                      توضیحات متقاضی:
                    </p>
                    <p className="mt-1 whitespace-pre-wrap leading-7">
                      {application.description}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  تاریخ درخواست:{" "}
                  {new Date(application.created_at).toLocaleDateString(
                    "fa-IR",
                  )}
                </p>
              </div>

              {application.status === "pending" && (
                <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    disabled={reviewingId !== null}
                    onClick={() =>
                      void reviewApplication(application.id, "approved")
                    }
                    className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewingId === application.id
                      ? "در حال ثبت..."
                      : "تأیید درخواست"}
                  </button>

                  <button
                    type="button"
                    disabled={reviewingId !== null}
                    onClick={() =>
                      void reviewApplication(application.id, "rejected")
                    }
                    className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

export default VeterinarianApplications;
