
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getApiErrorMessage } from "../../api/client";

type Provider = {
  id: number;
  name: string;
  providerType: "trainer" | "walker";
  province: string | null;
  city: string | null;
  bio: string | null;
  experienceYears: number;
  specialties: string[];
  price: number | null;
  priceUnit: string | null;
};

export default function ServiceProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerType, setProviderType] = useState("all");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProviders() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<Provider[]>("/providers", {
          params: {
            ...(providerType !== "all" ? { providerType } : {}),
            ...(city.trim() ? { city: city.trim() } : {}),
          },
        });

        if (active) {
          setProviders(response.data);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProviders();

    return () => {
      active = false;
    };
  }, [providerType, city]);

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          مربی‌ها و پت‌واکرها
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          ارائه‌دهنده خدمات موردنظرت رو پیدا کن.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="provider-type"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            نوع خدمات
          </label>

          <select
            id="provider-type"
            value={providerType}
            onChange={(event) => setProviderType(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-500"
          >
            <option value="all">همه خدمات</option>
            <option value="trainer">مربی حیوانات</option>
            <option value="walker">پت‌واکر</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="provider-city"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            شهر
          </label>

          <input
            id="provider-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="مثلاً بابل"
            className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500">
          در حال دریافت ارائه‌دهندگان...
        </p>
      ) : providers.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          ارائه‌دهنده‌ای با این مشخصات پیدا نشد.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map((provider) => (
            <article
              key={provider.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {provider.name}
                  </h2>

                  <p className="mt-1 text-sm text-blue-700">
                    {provider.providerType === "trainer"
                      ? "مربی حیوانات"
                      : "پت‌واکر"}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  تأییدشده
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {[provider.city, provider.province]
                  .filter(Boolean)
                  .join("، ") || "موقعیت ثبت نشده"}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {provider.bio || "توضیحاتی برای این ارائه‌دهنده ثبت نشده است."}
              </p>

              <p className="mt-3 text-sm text-slate-600">
                سابقه کاری: {provider.experienceYears ?? 0} سال
              </p>

              {provider.specialties?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {provider.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              {provider.price !== null && (
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  هزینه: {Number(provider.price).toLocaleString("fa-IR")}
                  {" "}
                  {provider.priceUnit || "تومان"}
                </p>
              )}

              <Link
                to={`/dashboard/service-providers/${provider.id}`}
                className="mt-5 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                مشاهده و رزرو نوبت
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
