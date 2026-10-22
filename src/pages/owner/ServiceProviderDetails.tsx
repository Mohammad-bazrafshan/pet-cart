
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, getApiErrorMessage } from "../../api/client";
import BookingForm from "../../components/service-provider/BookingForm";

type ServiceProvider = {
  id: number;
  name: string;
  providerType: "trainer" | "walker";
  province: string;
  city: string;
  address: string | null;
  bio: string | null;
  experienceYears: number | null;
  specialties: string[] | string | null;
  price: number | string | null;
  priceUnit: string | null;
};

export default function ServiceProviderDetails() {
  const { id } = useParams<{ id: string }>();

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProvider() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get<ServiceProvider>(
          `/providers/${id}`,
        );

        if (!cancelled) {
          setProvider(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      void loadProvider();
    } else {
      setError("شناسه ارائه‌دهنده معتبر نیست.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div dir="rtl" className="p-8 text-center text-gray-600">
        در حال دریافت اطلاعات ارائه‌دهنده...
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div dir="rtl" className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error || "ارائه‌دهنده پیدا نشد."}
        </div>

        <Link
          to="/dashboard/service-providers"
          className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700"
        >
          بازگشت به فهرست ارائه‌دهندگان
        </Link>
      </div>
    );
  }

  const isTrainer = provider.providerType === "trainer";

  const specialties = Array.isArray(provider.specialties)
    ? provider.specialties
    : typeof provider.specialties === "string"
      ? provider.specialties.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  const formattedPrice =
    provider.price !== null && provider.price !== undefined
      ? Number(provider.price).toLocaleString("fa-IR")
      : null;

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard/service-providers"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <span aria-hidden="true">→</span>
          بازگشت به فهرست
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-l from-blue-700 to-blue-500 px-6 py-8 text-white sm:px-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
              {isTrainer ? "🐕" : "🚶"}
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              {provider.name}
            </h1>

            <p className="mt-2 text-blue-50">
              {isTrainer ? "مربی حیوانات خانگی" : "پت‌واکر"}
            </p>

            <p className="mt-3 text-sm text-blue-50">
              {provider.city}
              {provider.province ? `، ${provider.province}` : ""}
            </p>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                درباره ارائه‌دهنده
              </h2>

              <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">
                {provider.bio || "توضیحی برای این ارائه‌دهنده ثبت نشده است."}
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">سابقه فعالیت</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {provider.experienceYears != null
                      ? `${provider.experienceYears.toLocaleString("fa-IR")} سال`
                      : "ثبت نشده"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">محدوده فعالیت</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {provider.city}
                    {provider.province ? `، ${provider.province}` : ""}
                  </p>

                  {provider.address && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {provider.address}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">هزینه خدمات</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formattedPrice !== null
                      ? `${formattedPrice} تومان${provider.priceUnit ? ` / ${provider.priceUnit}` : ""}`
                      : "برای اطلاع از هزینه تماس بگیرید"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="font-bold text-slate-800">تخصص‌ها</h2>

                {specialties.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <span
                        key={`${specialty}-${index}`}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    تخصصی ثبت نشده است.
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800">
                  رزرو خدمات
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  تاریخ موردنظر را انتخاب کن و از میان ساعت‌های آزاد،
                  زمان مناسب را رزرو کن.
                </p>
              </div>

              <BookingForm
                providerId={provider.id}
                providerName={provider.name}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
