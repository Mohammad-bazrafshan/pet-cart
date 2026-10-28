import PersianDatePicker from "../../components/common/PersianDatePicker";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  LoaderCircle,
  PawPrint,
  Pencil,
  Plus,
  Syringe,
  X,
} from "lucide-react";

import { getPetById, type Pet } from "../../services/PetService";
import PetInfo from "../../components/common/pet/PetInfo";

import {
  createMedicalRecord,
  getMedicalRecords,
  type MedicalRecord,
} from "../../services/MedicalRecordService";

import {
  createVaccination,
  getVaccinations,
  type Vaccination,
} from "../../services/VaccinationService";

/* Validation schemas */

const recordSchema = yup.object({
  title: yup
    .string()
    .required("عنوان سابقه الزامی است.")
    .min(2, "عنوان باید حداقل ۲ کاراکتر باشد."),
  record_type: yup.string().required("نوع سابقه را انتخاب کنید."),
  record_date: yup.string().required("تاریخ الزامی است."),
  description: yup
    .string()
    .required("توضیحات الزامی است.")
    .min(5, "توضیحات باید حداقل ۵ کاراکتر باشد."),
});

type RecordFormData = yup.InferType<typeof recordSchema>;

const vaccinationSchema = yup.object({
  vaccine_name: yup
    .string()
    .required("نام واکسن الزامی است.")
    .min(2, "نام واکسن باید حداقل ۲ کاراکتر باشد."),
  vaccination_date: yup.string().required("تاریخ تزریق الزامی است."),
  next_due_date: yup.string().required("تاریخ نوبت بعدی الزامی است."),
  description: yup
    .string()
    .required("توضیحات الزامی است.")
    .min(5, "توضیحات باید حداقل ۵ کاراکتر باشد."),
});

type VaccinationFormData = yup.InferType<typeof vaccinationSchema>;

/* Shared Tailwind styles */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const errorClass =
  "mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

function ErrorMessage({ children }: { children: string }) {
  return (
    <p className={errorClass}>
      <AlertCircle size={15} />
      <span>{children}</span>
    </p>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <LoaderCircle className="shrink-0 animate-spin text-blue-600" size={21} />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

function PetProfile() {
  const { id } = useParams();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState("");
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordSubmitError, setRecordSubmitError] = useState("");
  const [recordSubmitting, setRecordSubmitting] = useState(false);

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccinationsLoading, setVaccinationsLoading] = useState(true);
  const [vaccinationsError, setVaccinationsError] = useState("");
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [vaccinationSubmitError, setVaccinationSubmitError] = useState("");
  const [vaccinationSubmitting, setVaccinationSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: yupResolver(recordSchema),
    defaultValues: {
      title: "",
      record_type: "",
      record_date: "",
      description: "",
    },
  });

  const {
    register: registerVaccination,
    handleSubmit: handleVaccinationSubmit,
    reset: resetVaccination,
    watch: watchVaccination,
    setValue: setVaccinationValue,
    formState: { errors: vaccinationErrors },
  } = useForm<VaccinationFormData>({
    resolver: yupResolver(vaccinationSchema),
    defaultValues: {
      vaccine_name: "",
      vaccination_date: "",
      next_due_date: "",
      description: "",
    },
  });

  /* Fetch pet */

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPetById(Number(id));
        setPet(data);
      } catch (error) {
        console.error(error);
        setError("دریافت اطلاعات حیوان با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  /* Fetch medical records */

  useEffect(() => {
    if (!id) return;

    const fetchRecords = async () => {
      try {
        setRecordsLoading(true);
        setRecordsError("");

        const data = await getMedicalRecords(Number(id));
        setRecords(data);
      } catch (error) {
        console.error(error);
        setRecordsError("دریافت سوابق پزشکی با خطا مواجه شد.");
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchRecords();
  }, [id]);

  /* Fetch vaccinations */

  useEffect(() => {
    if (!id) return;

    const fetchVaccinations = async () => {
      try {
        setVaccinationsLoading(true);
        setVaccinationsError("");

        const data = await getVaccinations(Number(id));
        setVaccinations(data);
      } catch (error) {
        console.error(error);
        setVaccinationsError("دریافت واکسن‌ها با خطا مواجه شد.");
      } finally {
        setVaccinationsLoading(false);
      }
    };

    fetchVaccinations();
  }, [id]);

  /* Create medical record */

  const handleCreateRecord = async (data: RecordFormData) => {
    if (!id) return;

    try {
      setRecordSubmitting(true);
      setRecordSubmitError("");

      const newRecord = await createMedicalRecord(Number(id), data);

      setRecords((currentRecords) => [newRecord, ...currentRecords]);

      reset();
      setShowRecordForm(false);
    } catch (error) {
      console.error(error);
      setRecordSubmitError("ثبت سابقه پزشکی با خطا مواجه شد.");
    } finally {
      setRecordSubmitting(false);
    }
  };

  /* Create vaccination */

  const handleCreateVaccination = async (data: VaccinationFormData) => {
    if (!id) return;

    try {
      setVaccinationSubmitting(true);
      setVaccinationSubmitError("");

      const newVaccination = await createVaccination(Number(id), data);

      setVaccinations((currentVaccinations) => [
        newVaccination,
        ...currentVaccinations,
      ]);

      resetVaccination();
      setShowVaccinationForm(false);
    } catch (error) {
      console.error(error);
      setVaccinationSubmitError("ثبت واکسن با خطا مواجه شد.");
    } finally {
      setVaccinationSubmitting(false);
    }
  };

  /* Loading state */

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <LoaderCircle size={28} className="animate-spin text-blue-600" />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-800">در حال بارگذاری پرونده</p>
          <p className="mt-2 text-sm text-slate-500">لطفاً منتظر بمانید...</p>
        </div>
      </div>
    );
  }

  /* Error state */

  if (error) {
    return (
      <div
        dir="rtl"
        className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={28} />
        </div>
        <h2 className="font-bold text-slate-900">دریافت اطلاعات ناموفق بود</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <p className="mt-2 text-sm text-slate-500">لطفاً دوباره تلاش کنید.</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div
        dir="rtl"
        className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <PawPrint size={30} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">حیوان پیدا نشد</h2>
        <p className="mt-2 text-sm text-slate-500">
          اطلاعات این حیوان در دسترس نیست.
        </p>
        <Link to="/dashboard/pets" className={`${primaryButtonClass} mt-6`}>
          <ArrowRight size={17} />
          بازگشت به حیوانات
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-8 pb-10 text-slate-800">
      {/* Page header */}

      <header className="relative isolate overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-blue-50 via-white to-white" />
        <div className="absolute -left-12 -top-16 -z-10 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 -z-10 h-40 w-40 rounded-full bg-sky-100/50 blur-3xl" />

        <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-9">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
              <Activity size={15} />
              پرونده سلامت حیوان
            </div>

            <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              پرونده {pet.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              اطلاعات پایه، سوابق پزشکی و برنامه واکسیناسیون {pet.name} را در یک
              نگاه مدیریت کنید.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                <ClipboardList size={15} className="text-blue-600" />
                {records.length} سابقه پزشکی
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                <Syringe size={15} className="text-blue-600" />
                {vaccinations.length} واکسن ثبت‌شده
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
            <Link to="/dashboard/pets" className={secondaryButtonClass}>
              <ArrowRight size={17} />
              بازگشت
            </Link>
            <Link
              to={`/dashboard/pets/${pet.id}/edit`}
              className={primaryButtonClass}
            >
              <Pencil size={16} />
              ویرایش اطلاعات
            </Link>
          </div>
        </div>
      </header>

      {/* Pet information */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <PawPrint size={23} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              اطلاعات حیوان
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              مشخصات ثبت‌شده در پرونده
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <PetInfo pet={pet} />
        </div>
      </section>

      {/* Medical records */}

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
              <ClipboardList size={26} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
                سوابق پزشکی
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                بیماری‌ها، معاینات و درمان‌های ثبت‌شده
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowRecordForm((prev) => !prev);
              setRecordSubmitError("");
              reset();
            }}
            className={primaryButtonClass}
          >
            {showRecordForm ? <X size={18} /> : <Plus size={19} />}
            {showRecordForm ? "بستن فرم" : "ثبت سابقه پزشکی"}
          </button>
        </div>

        {/* Medical record form */}

        {showRecordForm && (
          <form
            onSubmit={handleSubmit(handleCreateRecord)}
            className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"
          >
            <div className="border-b border-blue-50 bg-blue-50/50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900">
                    ثبت سابقه پزشکی جدید
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    اطلاعات معاینه یا درمان را تکمیل کنید.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>عنوان سابقه</label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="مثلاً معاینه دوره‌ای"
                    className={inputClass}
                  />
                  {errors.title && (
                    <ErrorMessage>{errors.title.message!}</ErrorMessage>
                  )}
                </div>

                <div>
                  <label className={labelClass}>نوع سابقه</label>
                  <select {...register("record_type")} className={inputClass}>
                    <option value="">نوع سابقه را انتخاب کنید</option>
                    <option value="واکسیناسیون">واکسیناسیون</option>
                    <option value="معاینه">معاینه</option>
                    <option value="دارو">دارو</option>
                    <option value="آزمایش">آزمایش</option>
                    <option value="جراحی">جراحی</option>
                  </select>
                  {errors.record_type && (
                    <ErrorMessage>{errors.record_type.message!}</ErrorMessage>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>تاریخ سابقه</label>

                  <PersianDatePicker
                    value={watch("record_date") ?? ""}
                    onChange={(date) =>
                      setValue("record_date", date, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="تاریخ سابقه را انتخاب کنید"
                    required
                  />

                  {errors.record_date && (
                    <ErrorMessage>{errors.record_date.message!}</ErrorMessage>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>توضیحات</label>
                  <textarea
                    rows={4}
                    {...register("description")}
                    placeholder="توضیحات مربوط به معاینه، درمان یا دارو..."
                    className={`${inputClass} resize-y leading-7`}
                  />
                  {errors.description && (
                    <ErrorMessage>{errors.description.message!}</ErrorMessage>
                  )}
                </div>
              </div>

              {recordSubmitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{recordSubmitError}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={recordSubmitting}
                  className={primaryButtonClass}
                >
                  {recordSubmitting ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {recordSubmitting ? "در حال ثبت..." : "ثبت سابقه"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecordForm(false);
                    setRecordSubmitError("");
                    reset();
                  }}
                  className={secondaryButtonClass}
                >
                  انصراف
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Medical records loading/error */}

        {recordsLoading && (
          <LoadingPanel message="در حال دریافت سوابق پزشکی..." />
        )}

        {recordsError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{recordsError}</p>
          </div>
        )}

        {!recordsLoading && !recordsError && records.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ClipboardList size={30} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              هنوز سابقه پزشکی ثبت نشده است
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              سوابق معاینات و درمان‌های {pet.name} پس از ثبت در این قسمت نمایش
              داده می‌شوند.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowRecordForm(true);
                setRecordSubmitError("");
              }}
              className={`${secondaryButtonClass} mt-6`}
            >
              <Plus size={17} />
              ثبت اولین سابقه
            </button>
          </div>
        )}

        {!recordsLoading && !recordsError && records.length > 0 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {records.map((record) => (
              <article
                key={record.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-100">
                    <Activity size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold leading-6 text-slate-900">
                      {record.title}
                    </h3>
                    <span className="mt-2 inline-flex rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {record.record_type}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <CalendarDays size={18} className="shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">تاریخ سابقه</p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {record.record_date}
                    </p>
                  </div>
                </div>

                {record.description && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-bold text-slate-500">
                      توضیحات
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {record.description}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Vaccinations */}

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
              <Syringe size={26} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
                واکسیناسیون
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                مدیریت تاریخ تزریق و نوبت‌های بعدی واکسن
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowVaccinationForm((prev) => !prev);
              setVaccinationSubmitError("");
              resetVaccination();
            }}
            className={primaryButtonClass}
          >
            {showVaccinationForm ? <X size={18} /> : <Plus size={19} />}
            {showVaccinationForm ? "بستن فرم" : "ثبت واکسن"}
          </button>
        </div>

        {/* Vaccination form */}

        {showVaccinationForm && (
          <form
            onSubmit={handleVaccinationSubmit(handleCreateVaccination)}
            className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm"
          >
            <div className="border-b border-sky-50 bg-sky-50/50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                  <Syringe size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900">
                    ثبت واکسن جدید
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    اطلاعات تزریق و تاریخ نوبت بعدی را وارد کنید.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>نام واکسن</label>
                  <input
                    type="text"
                    {...registerVaccination("vaccine_name")}
                    placeholder="مثلاً واکسن هاری"
                    className={inputClass}
                  />
                  {vaccinationErrors.vaccine_name && (
                    <ErrorMessage>
                      {vaccinationErrors.vaccine_name.message!}
                    </ErrorMessage>
                  )}
                </div>

                <div>
                  <label className={labelClass}>تاریخ تزریق</label>

                  <PersianDatePicker
                    value={watchVaccination("vaccination_date") ?? ""}
                    onChange={(date) =>
                      setVaccinationValue("vaccination_date", date, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="تاریخ تزریق را انتخاب کنید"
                    required
                  />

                  {vaccinationErrors.vaccination_date && (
                    <ErrorMessage>
                      {vaccinationErrors.vaccination_date.message!}
                    </ErrorMessage>
                  )}
                </div>
                <div>
                  <label className={labelClass}>تاریخ نوبت بعدی</label>

                  <PersianDatePicker
                    value={watchVaccination("next_due_date") ?? ""}
                    onChange={(date) =>
                      setVaccinationValue("next_due_date", date, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    placeholder="تاریخ نوبت بعدی را انتخاب کنید"
                    required
                  />

                  {vaccinationErrors.next_due_date && (
                    <ErrorMessage>
                      {vaccinationErrors.next_due_date.message!}
                    </ErrorMessage>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>توضیحات</label>
                  <textarea
                    rows={4}
                    {...registerVaccination("description")}
                    placeholder="توضیحات مربوط به واکسن..."
                    className={`${inputClass} resize-y leading-7`}
                  />
                  {vaccinationErrors.description && (
                    <ErrorMessage>
                      {vaccinationErrors.description.message!}
                    </ErrorMessage>
                  )}
                </div>
              </div>

              {vaccinationSubmitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{vaccinationSubmitError}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={vaccinationSubmitting}
                  className={primaryButtonClass}
                >
                  {vaccinationSubmitting ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {vaccinationSubmitting ? "در حال ثبت..." : "ثبت واکسن"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVaccinationForm(false);
                    setVaccinationSubmitError("");
                    resetVaccination();
                  }}
                  className={secondaryButtonClass}
                >
                  انصراف
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Vaccinations loading/error */}

        {vaccinationsLoading && (
          <LoadingPanel message="در حال دریافت واکسن‌ها..." />
        )}

        {vaccinationsError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{vaccinationsError}</p>
          </div>
        )}

        {!vaccinationsLoading &&
          !vaccinationsError &&
          vaccinations.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Syringe size={30} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                هنوز واکسنی ثبت نشده است
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                اطلاعات واکسیناسیون {pet.name} پس از ثبت در این قسمت نمایش داده
                می‌شوند.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowVaccinationForm(true);
                  setVaccinationSubmitError("");
                }}
                className={`${secondaryButtonClass} mt-6`}
              >
                <Plus size={17} />
                ثبت اولین واکسن
              </button>
            </div>
          )}

        {!vaccinationsLoading &&
          !vaccinationsError &&
          vaccinations.length > 0 && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {vaccinations.map((vaccination) => (
                <article
                  key={vaccination.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition group-hover:bg-sky-100">
                      <Syringe size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold leading-6 text-slate-900">
                        {vaccination.vaccine_name}
                      </h3>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        <CheckCircle2 size={13} />
                        ثبت‌شده
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CalendarDays size={16} />
                        <p className="text-xs">تاریخ تزریق</p>
                      </div>
                      <p className="mt-2 break-words text-sm font-bold text-slate-800">
                        {vaccination.vaccination_date}
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                      <div className="flex items-center gap-2 text-blue-700">
                        <CalendarDays size={16} />
                        <p className="text-xs">نوبت بعدی</p>
                      </div>
                      <p className="mt-2 break-words text-sm font-bold text-blue-900">
                        {vaccination.next_due_date || "تعیین نشده"}
                      </p>
                    </div>
                  </div>

                  {vaccination.description && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-bold text-slate-500">
                        توضیحات
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                        {vaccination.description}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

export default PetProfile;
