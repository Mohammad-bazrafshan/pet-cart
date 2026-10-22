
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  getProvincesList,
  getCities,
} from "@code-plate/iran-cities";

import { api, getApiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/useAuth";

type Profile = {
  phone: string;
  province: string;
  city: string;
  address: string;
};

const emptyProfile: Profile = {
  phone: "",
  province: "",
  city: "",
  address: "",
};

const provinces = getProvincesList();

export default function OwnerProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const cities = useMemo(
    () => (profile.province ? getCities(profile.province) : []),
    [profile.province],
  );

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await api.get("/auth/me");

        if (!active) return;

        const savedProvince = response.data.province ?? "";
        const savedCity = response.data.city ?? "";

        // نام استان ذخیره‌شده را با فهرست کتابخانه تطبیق می‌دهیم.
        const matchedProvince = provinces.find(
          (province) =>
            province.fa === savedProvince ||
            province.en === savedProvince,
        );

        const provinceValue = matchedProvince?.en ?? savedProvince;

        // شهر قبلی فقط در صورت تعلق به استان انتخاب‌شده حفظ می‌شود.
        const provinceCities = provinceValue
          ? getCities(provinceValue)
          : [];

        const matchedCity = provinceCities.find(
          (city) => city.fa === savedCity || city.en === savedCity,
        );

        setProfile({
          phone: response.data.phone ?? "",
          province: provinceValue,
          city: matchedCity?.en ?? savedCity,
          address: response.data.address ?? "",
        });
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (user?.demo) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  function updateField(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  }

  function handleProvinceChange(value: string) {
    setProfile((current) => ({
      ...current,
      province: value,
      city: "",
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (user?.demo) {
      setError("برای ذخیرهٔ پروفایل، ابتدا با حساب واقعی وارد شوید.");
      return;
    }

    if (profile.province && profile.city) {
      const validCity = cities.some(
        (city) => city.en === profile.city || city.fa === profile.city,
      );

      if (!validCity) {
        setError("لطفاً شهر را از فهرست شهرهای استان انتخاب کن.");
        return;
      }
    }

    // نام فارسی ذخیره می‌شود تا با فیلدهای فعلی دیتابیس سازگار باشد.
    const selectedProvince = provinces.find(
      (province) =>
        province.en === profile.province ||
        province.fa === profile.province,
    );

    const selectedCity = cities.find(
      (city) => city.en === profile.city || city.fa === profile.city,
    );

    const payload = {
      ...profile,
      province: selectedProvince?.fa ?? profile.province,
      city: selectedCity?.fa ?? profile.city,
    };

    try {
      setSaving(true);

      const response = await api.patch("/auth/me", payload);
      const saved = response.data.user;

      setProfile({
        phone: saved.phone ?? "",
        province: selectedProvince?.en ?? profile.province,
        city: selectedCity?.en ?? profile.city,
        address: saved.address ?? "",
      });

      setMessage("اطلاعات پروفایل با موفقیت ذخیره شد.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

  if (loading) {
    return (
      <div dir="rtl" className="p-8 text-slate-500">
        در حال دریافت اطلاعات پروفایل...
      </div>
    );
  }

  return (
    <main dir="rtl" className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-black text-slate-900">
          پروفایل من
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          اطلاعات تماس و نشانی خودت را برای هماهنگی خدمات تکمیل کن.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <p className="font-bold text-slate-800">{user?.name}</p>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label
              htmlFor="profile-phone"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              شماره تماس
            </label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              value={profile.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              className={inputClass}
              placeholder="شماره تماس"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-province"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                استان
              </label>
              <select
                id="profile-province"
                value={profile.province}
                onChange={(event) =>
                  handleProvinceChange(event.target.value)
                }
                className={inputClass}
              >
                <option value="">انتخاب استان</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.en}>
                    {province.fa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="profile-city"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                شهر
              </label>
              <select
                id="profile-city"
                value={profile.city}
                onChange={(event) =>
                  updateField("city", event.target.value)
                }
                disabled={!profile.province}
                className={inputClass}
              >
                <option value="">
                  {profile.province
                    ? "انتخاب شهر"
                    : "ابتدا استان را انتخاب کن"}
                </option>

                {cities.map((city) => (
                  <option key={city.id} value={city.en}>
                    {city.fa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="profile-address"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              نشانی کامل
            </label>
            <textarea
              id="profile-address"
              rows={4}
              maxLength={2000}
              value={profile.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              className={inputClass}
              placeholder="خیابان، کوچه، پلاک و سایر جزئیات نشانی"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "در حال ذخیره..." : "ذخیرهٔ اطلاعات"}
          </button>
        </form>
      </section>
    </main>
  );
}
