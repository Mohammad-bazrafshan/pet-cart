
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";import { getApiErrorMessage } from "../../api/client";
import {
  getCooperationClinics,
  getMyCooperationRequests,
  sendCooperationRequest,
  type CooperationClinic,
  type VeterinarianCooperationRequest,
} from "../../services/VeterinarianCooperationService";

const statusLabels = {
  pending: "در انتظار بررسی",
  approved: "پذیرفته‌شده",
  rejected: "ردشده",
};

export default function VeterinarianCooperationSection() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [clinics, setClinics] = useState<CooperationClinic[]>([]);
  const [requests, setRequests] = useState<
    VeterinarianCooperationRequest[]
  >([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [sendingClinicId, setSendingClinicId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isVeterinarian = user?.role === "veterinarian" && !user.demo;

  useEffect(() => {
    let active = true;

    async function loadClinics() {
      setLoadingClinics(true);
      setError("");

      try {
        const data = await getCooperationClinics();

        if (active) {
          setClinics(data);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoadingClinics(false);
        }
      }
    }

    void loadClinics();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      if (!isVeterinarian) {
        setRequests([]);
        return;
      }

      try {
        const data = await getMyCooperationRequests();

        if (active) {
          setRequests(data);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err));
        }
      }
    }

    if (!authLoading) {
      void loadRequests();
    }

    return () => {
      active = false;
    };
  }, [authLoading, isVeterinarian]);

  async function handleRequest(clinicId: number) {
    setError("");
    setSuccess("");

    if (authLoading) return;

    if (!user) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/",
            hash: "#veterinarian-cooperation",
          },
        },
      });
      return;
    }

    if (!isVeterinarian) {
      setError("ارسال درخواست همکاری فقط برای حساب‌های کاربری دامپزشک امکان‌پذیر است.");
      return;
    }

    const existingRequest = requests.find(
      (request) => request.clinic_id === clinicId,
    );

    if (existingRequest) {
      setError("برای این کلینیک قبلاً درخواست ثبت کرده‌ای.");
      return;
    }

    setSendingClinicId(clinicId);

    try {
      await sendCooperationRequest(clinicId);

      const updatedRequests = await getMyCooperationRequests();
      setRequests(updatedRequests);
      setSuccess("درخواست همکاری شما با موفقیت ثبت شد.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSendingClinicId(null);
    }
  }

  return (
    <section
      id="veterinarian-cooperation"
      dir="rtl"
      className="bg-slate-50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold text-blue-600">
            فرصت‌های شغلی
          </span>

          <h2 className="mt-3 text-3xl font-black leading-relaxed text-slate-900 sm:text-4xl">
            دامپزشک هستید؟ به کلینیک‌ها بپیوندید
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            کلینیک‌های ثبت‌شده در پت‌کارت را ببینید و برای همکاری با
            کلینیک موردنظرتان درخواست بفرستید.
          </p>
        </div>

        {success && (
          <p
            role="status"
            className="mx-auto mt-8 max-w-3xl rounded-2xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700"
          >
            {success}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mx-auto mt-8 max-w-3xl rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700"
          >
            {error}
          </p>
        )}

        {loadingClinics ? (
          <p className="mt-12 text-center text-slate-500">
            در حال دریافت فهرست کلینیک‌ها...
          </p>
        ) : clinics.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <span className="text-4xl">🏥</span>
            <p className="mt-4 font-bold text-slate-800">
              هنوز کلینیکی ثبت نشده است.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              بعداً دوباره سر بزنید.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => {
              const request = requests.find(
                (item) => item.clinic_id === clinic.id,
              );

              return (
                <article
                  key={clinic.id}
                  className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    🏥
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    {clinic.name}
                  </h3>

                  {clinic.address && (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      <span className="font-bold">آدرس: </span>
                      {clinic.address}
                    </p>
                  )}

                  {clinic.phone && (
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-bold">تلفن: </span>
                      <span dir="ltr">{clinic.phone}</span>
                    </p>
                  )}

                  {clinic.description && (
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {clinic.description}
                    </p>
                  )}

                  <div className="mt-auto pt-6">
                    {request ? (
                      <div className="rounded-xl bg-slate-100 px-4 py-3 text-center">
                        <span className="text-sm text-slate-600">
                          وضعیت درخواست:{" "}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            request.status === "approved"
                              ? "text-emerald-700"
                              : request.status === "rejected"
                                ? "text-red-700"
                                : "text-amber-700"
                          }`}
                        >
                          {statusLabels[request.status]}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={sendingClinicId !== null || authLoading}
                        onClick={() => void handleRequest(clinic.id)}
                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {sendingClinicId === clinic.id
                          ? "در حال ثبت درخواست..."
                          : "درخواست همکاری"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
