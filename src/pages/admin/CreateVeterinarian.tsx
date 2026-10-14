import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createAdminVeterinarian,
  getAdminClinics,
  type AdminClinic,
} from "../../services/AdminService";

function CreateVeterinarian() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialClinicId = searchParams.get("clinicId") || "";

  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [clinicId, setClinicId] = useState(initialClinicId);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [loadingClinics, setLoadingClinics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadClinics() {
      try {
        const data = await getAdminClinics();
        setClinics(data);
      } catch (err) {
        console.error(err);
        setError("دریافت فهرست کلینیک‌ها ناموفق بود.");
      } finally {
        setLoadingClinics(false);
      }
    }

    loadClinics();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !licenseNumber.trim() ||
      !specialty.trim() ||
      !clinicId
    ) {
      setError("لطفاً تمام فیلدهای الزامی را تکمیل کنید.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    try {
      setSubmitting(true);

      await createAdminVeterinarian({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        specialty: specialty.trim(),
        clinicId: Number(clinicId),
      });

      setSuccess(
        "حساب کاربری و اطلاعات دامپزشک با موفقیت ثبت شدند.",
      );

      setTimeout(() => {
        navigate(`/admin/clinics/${clinicId}`);
      }, 1000);
    } catch (err: unknown) {
      console.error(err);

      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err
          ? (
              err as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      setError(message || "ثبت دامپزشک با خطا مواجه شد.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← بازگشت
        </button>

        <h2 className="text-2xl font-bold text-gray-800">
          ثبت دامپزشک جدید
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          اطلاعات حرفه‌ای و مشخصات ورود دامپزشک را وارد کنید.
          با ثبت این فرم، حساب کاربری دامپزشک نیز ساخته می‌شود.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {/* اطلاعات هویتی */}

        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            نام و نام خانوادگی *
          </label>

          <input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={inputClass}
            placeholder="نام کامل دامپزشک"
            autoComplete="name"
            required
          />
        </div>

        {/* اطلاعات حساب کاربری */}

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-4">
          <h3 className="font-semibold text-gray-800">
            اطلاعات حساب کاربری
          </h3>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              ایمیل ورود *
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="vet@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              رمز عبور *
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              placeholder="حداقل ۸ کاراکتر"
              autoComplete="new-password"
              minLength={8}
              required
            />

            <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) =>
                  setShowPassword(event.target.checked)
                }
              />
              نمایش رمز عبور
            </label>

            <p className="mt-2 text-xs text-gray-500">
              این مشخصات را به‌صورت امن در اختیار دامپزشک قرار بده.
              رمز عبور در دیتابیس به‌صورت هش‌شده ذخیره می‌شود.
            </p>
          </div>
        </div>

        {/* اطلاعات حرفه‌ای */}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              شماره تماس *
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
              placeholder="شماره تماس"
              autoComplete="tel"
              required
            />
          </div>

          <div>
            <label
              htmlFor="licenseNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              شماره نظام دامپزشکی *
            </label>

            <input
              id="licenseNumber"
              value={licenseNumber}
              onChange={(event) =>
                setLicenseNumber(event.target.value)
              }
              className={inputClass}
              placeholder="شماره نظام"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="specialty"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            تخصص *
          </label>

          <input
            id="specialty"
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
            className={inputClass}
            placeholder="مثلاً بیماری‌های حیوانات خانگی"
            required
          />
        </div>

       

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || loadingClinics}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "در حال ثبت..."
              : "ثبت دامپزشک و ایجاد حساب"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateVeterinarian;