import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  getClinicPatientById,
  getClinicMedicalRecords,
  createClinicMedicalRecord,
  getClinicVaccinations,
  createClinicVaccination,
  type ClinicPatient,
  type ClinicMedicalRecord,
  type ClinicVaccination,
} from "../../services/ClinicPatientService";

interface MedicalRecordFormData {
  title: string;
  description: string;
  record_type: string;
  record_date: string;
}

interface VaccinationFormData {
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string;
  description: string;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<ClinicPatient | null>(null);
  const [records, setRecords] = useState<ClinicMedicalRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<ClinicVaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingVaccination, setSavingVaccination] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register: registerRecord,
    handleSubmit: handleSubmitRecord,
    reset: resetRecord,
    formState: { errors: recordErrors },
  } = useForm<MedicalRecordFormData>({
    defaultValues: {
      title: "",
      description: "",
      record_type: "معاینه",
      record_date: "",
    },
  });

  const {
    register: registerVaccination,
    handleSubmit: handleSubmitVaccination,
    reset: resetVaccination,
    formState: { errors: vaccinationErrors },
  } = useForm<VaccinationFormData>({
    defaultValues: {
      vaccine_name: "",
      vaccination_date: "",
      next_due_date: "",
      description: "",
    },
  });

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id || !Number.isFinite(Number(id)) || Number(id) <= 0) {
          setError("شناسه بیمار معتبر نیست.");
          return;
        }

        const petId = Number(id);

        const [patientData, medicalRecords, vaccinationData] =
          await Promise.all([
            getClinicPatientById(petId),
            getClinicMedicalRecords(petId),
            getClinicVaccinations(petId),
          ]);

        setPatient(patientData);
        setRecords(medicalRecords);
        setVaccinations(vaccinationData);
      } catch (error) {
        console.error(error);
        setError("دریافت پرونده بیمار با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  const onSubmitRecord = async (data: MedicalRecordFormData) => {
    if (!id) return;

    try {
      setSavingRecord(true);
      setError("");
      setSuccessMessage("");

      const newRecord = await createClinicMedicalRecord(Number(id), data);

      setRecords((currentRecords) => [newRecord, ...currentRecords]);
      resetRecord();

      setSuccessMessage("سابقه پزشکی با موفقیت ثبت شد.");
    } catch (error) {
      console.error(error);
      setError("ثبت سابقه پزشکی با خطا مواجه شد.");
    } finally {
      setSavingRecord(false);
    }
  };

  const onSubmitVaccination = async (data: VaccinationFormData) => {
    if (!id) return;

    try {
      setSavingVaccination(true);
      setError("");
      setSuccessMessage("");

      const newVaccination = await createClinicVaccination(Number(id), {
        vaccine_name: data.vaccine_name,
        vaccination_date: data.vaccination_date,
        next_due_date: data.next_due_date || undefined,
        description: data.description,
      });

      setVaccinations((currentVaccinations) => [
        newVaccination,
        ...currentVaccinations,
      ]);

      resetVaccination();
      setSuccessMessage("اطلاعات واکسیناسیون با موفقیت ثبت شد.");
    } catch (error) {
      console.error(error);
      setError("ثبت واکسیناسیون با خطا مواجه شد.");
    } finally {
      setSavingVaccination(false);
    }
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[350px] flex-col items-center justify-center gap-4"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
        <p className="text-sm font-medium text-slate-500">
          در حال دریافت پرونده بیمار...
        </p>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div dir="rtl" className="space-y-4">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/clinic/patients")}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          بازگشت به فهرست بیماران
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div
        dir="rtl"
        className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600"
      >
        بیمار پیدا نشد.
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-l from-blue-900 via-blue-700 to-sky-600 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
        <button
          type="button"
          onClick={() => navigate("/clinic/patients")}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          بازگشت به بیماران
        </button>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              پرونده پزشکی
            </span>

            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              {patient.name}
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              {patient.type}
              {patient.breed && ` · ${patient.breed}`}
            </p>

            <p className="mt-3 text-sm text-blue-100">
              صاحب حیوان: {patient.owner_name || "ثبت نشده"}
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-2xl border border-white/20 bg-white/10 sm:self-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z" />
              <path d="M8.5 12h7M12 8.5v7" />
            </svg>
          </div>
        </div>
      </section>

      {/* Patient information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              اطلاعات بیمار
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              مشخصات ثبت‌شده حیوان
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "نام حیوان", value: patient.name },
            { label: "نوع حیوان", value: patient.type },
            { label: "سن", value: patient.age ?? "ثبت نشده" },
            {
              label: "وزن",
              value: patient.weight
                ? `${patient.weight} کیلوگرم`
                : "ثبت نشده",
            },
            { label: "جنسیت", value: patient.gender ?? "ثبت نشده" },
            { label: "نژاد", value: patient.breed ?? "ثبت نشده" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-xs font-medium text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 break-words font-semibold text-slate-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Owner information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21a7 7 0 0 1 14 0" />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              اطلاعات صاحب حیوان
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              اطلاعات تماس ثبت‌شده
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">نام و نام خانوادگی</p>
            <p className="mt-2 break-words font-semibold text-slate-800">
              {patient.owner_name || "ثبت نشده"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">ایمیل</p>
            <p className="mt-2 break-all font-semibold text-slate-800">
              {patient.owner_email || "ثبت نشده"}
            </p>
          </div>
        </div>
      </section>

      {/* Feedback messages */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800"
        >
          {successMessage}
        </div>
      )}

      {/* Medical record form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
              <rect x="3" y="3" width="18" height="18" rx="3" />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ثبت سابقه پزشکی جدید
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              ثبت معاینه، دارو، آزمایش، جراحی یا سایر اقدامات پزشکی
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmitRecord(onSubmitRecord)}
          className="mt-6 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>عنوان سابقه</label>
              <input
                type="text"
                placeholder="مثلاً معاینه دوره‌ای"
                {...registerRecord("title", {
                  required: "عنوان سابقه الزامی است.",
                })}
                className={inputClass}
              />
              {recordErrors.title && (
                <p className="mt-2 text-xs text-red-600">
                  {recordErrors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>نوع سابقه</label>
              <select
                {...registerRecord("record_type", {
                  required: "نوع سابقه الزامی است.",
                })}
                className={inputClass}
              >
                <option value="معاینه">معاینه</option>
                <option value="دارو">دارو</option>
                <option value="واکسیناسیون">واکسیناسیون</option>
                <option value="آزمایش">آزمایش</option>
                <option value="جراحی">جراحی</option>
                <option value="سایر">سایر</option>
              </select>
              {recordErrors.record_type && (
                <p className="mt-2 text-xs text-red-600">
                  {recordErrors.record_type.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>تاریخ سابقه</label>
              <input
                type="date"
                {...registerRecord("record_date", {
                  required: "تاریخ سابقه الزامی است.",
                })}
                className={inputClass}
              />
              {recordErrors.record_date && (
                <p className="mt-2 text-xs text-red-600">
                  {recordErrors.record_date.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>توضیحات</label>
            <textarea
              rows={4}
              placeholder="توضیحات مربوط به معاینه یا اقدام پزشکی..."
              {...registerRecord("description")}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={savingRecord}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingRecord && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {savingRecord ? "در حال ثبت..." : "ثبت سابقه پزشکی"}
            </button>
          </div>
        </form>
      </section>

      {/* Medical records list */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              سوابق پزشکی
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              تاریخچه معاینات و اقدامات پزشکی بیمار
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
            {records.length} سابقه
          </span>
        </div>

        {records.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="font-medium text-slate-700">
              هنوز سابقه پزشکی ثبت نشده است.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              از فرم بالا برای ثبت اولین سابقه استفاده کنید.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {records.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {record.title}
                    </h3>
                    <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                      {record.record_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M16 3v4M8 3v4M3 11h18" />
                    </svg>
                    {record.record_date}
                  </div>
                </div>

                {record.description && (
                  <p className="mt-4 whitespace-pre-wrap border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">
                    {record.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Vaccination form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m19 3 2 2-9 9-4 1 1-4 9-9Z" />
              <path d="m14 6 4 4M4 20h16" />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ثبت واکسیناسیون جدید
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              ثبت واکسن تزریق‌شده و تاریخ نوبت بعدی
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmitVaccination(onSubmitVaccination)}
          className="mt-6 space-y-5"
        >
          <div>
            <label className={labelClass}>نام واکسن</label>
            <input
              type="text"
              placeholder="مثلاً واکسن هاری"
              {...registerVaccination("vaccine_name", {
                required: "نام واکسن الزامی است.",
              })}
              className={inputClass}
            />
            {vaccinationErrors.vaccine_name && (
              <p className="mt-2 text-xs text-red-600">
                {vaccinationErrors.vaccine_name.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>تاریخ تزریق</label>
              <input
                type="date"
                {...registerVaccination("vaccination_date", {
                  required: "تاریخ تزریق الزامی است.",
                })}
                className={inputClass}
              />
              {vaccinationErrors.vaccination_date && (
                <p className="mt-2 text-xs text-red-600">
                  {vaccinationErrors.vaccination_date.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>تاریخ نوبت بعدی</label>
              <input
                type="date"
                {...registerVaccination("next_due_date")}
                className={inputClass}
              />
              <p className="mt-2 text-xs text-slate-400">
                در صورت نیاز، تاریخ یادآوری بعدی را وارد کنید.
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>توضیحات</label>
            <textarea
              rows={4}
              placeholder="توضیحات مربوط به واکسن..."
              {...registerVaccination("description")}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={savingVaccination}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingVaccination && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {savingVaccination
                ? "در حال ثبت..."
                : "ثبت واکسیناسیون"}
            </button>
          </div>
        </form>
      </section>

      {/* Vaccination history */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              سوابق واکسیناسیون
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              تاریخچه واکسن‌های ثبت‌شده برای بیمار
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
            {vaccinations.length} واکسن
          </span>
        </div>

        {vaccinations.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="font-medium text-slate-700">
              هنوز واکسیناسیونی ثبت نشده است.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              از فرم بالا برای ثبت واکسن استفاده کنید.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {vaccinations.map((vaccination) => (
              <article
                key={vaccination.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {vaccination.vaccine_name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      تاریخ تزریق: {vaccination.vaccination_date}
                    </p>
                  </div>

                  {vaccination.next_due_date && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="text-xs font-medium text-blue-700">
                        تاریخ نوبت بعدی
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-900">
                        {vaccination.next_due_date}
                      </p>
                    </div>
                  )}
                </div>

                {vaccination.description && (
                  <p className="mt-4 whitespace-pre-wrap border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">
                    {vaccination.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PatientProfile;