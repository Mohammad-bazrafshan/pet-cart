import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

function PatientProfile() {
  const { id } = useParams();

  const [patient, setPatient] =
    useState<ClinicPatient | null>(null);

  const [records, setRecords] =
    useState<ClinicMedicalRecord[]>([]);

  const [vaccinations, setVaccinations] =
    useState<ClinicVaccination[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingRecord, setSavingRecord] =
    useState(false);
  const [savingVaccination, setSavingVaccination] =
    useState(false);

  // =========================
  // Medical Record Form
  // =========================

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

  // =========================
  // Vaccination Form
  // =========================

  const {
    register: registerVaccination,
    handleSubmit: handleSubmitVaccination,
    reset: resetVaccination,
    formState: {
      errors: vaccinationErrors,
    },
  } = useForm<VaccinationFormData>({
    defaultValues: {
      vaccine_name: "",
      vaccination_date: "",
      next_due_date: "",
      description: "",
    },
  });

  // =========================
  // Load Patient
  // =========================

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("شناسه بیمار مشخص نیست.");
          return;
        }

        const petId = Number(id);

        const [
          patientData,
          medicalRecords,
          vaccinationData,
        ] = await Promise.all([
          getClinicPatientById(petId),
          getClinicMedicalRecords(petId),
          getClinicVaccinations(petId),
        ]);

        setPatient(patientData);
        setRecords(medicalRecords);
        setVaccinations(vaccinationData);
      } catch (error) {
        console.error(error);

        setError(
          "دریافت پرونده بیمار با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  // =========================
  // Create Medical Record
  // =========================

  const onSubmitRecord = async (
    data: MedicalRecordFormData
  ) => {
    if (!id) {
      return;
    }

    try {
      setSavingRecord(true);
      setError("");

      const newRecord =
        await createClinicMedicalRecord(
          Number(id),
          data
        );

      setRecords((currentRecords) => [
        newRecord,
        ...currentRecords,
      ]);

      resetRecord();
    } catch (error) {
      console.error(error);

      setError(
        "ثبت سابقه پزشکی با خطا مواجه شد."
      );
    } finally {
      setSavingRecord(false);
    }
  };

  // =========================
  // Create Vaccination
  // =========================

  const onSubmitVaccination = async (
    data: VaccinationFormData
  ) => {
    if (!id) {
      return;
    }

    try {
      setSavingVaccination(true);
      setError("");

      const newVaccination =
        await createClinicVaccination(
          Number(id),
          {
            vaccine_name: data.vaccine_name,
            vaccination_date:
              data.vaccination_date,
            next_due_date:
              data.next_due_date || undefined,
            description: data.description,
          }
        );

      setVaccinations(
        (currentVaccinations) => [
          newVaccination,
          ...currentVaccinations,
        ]
      );

      resetVaccination();
    } catch (error) {
      console.error(error);

      setError(
        "ثبت واکسیناسیون با خطا مواجه شد."
      );
    } finally {
      setSavingVaccination(false);
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-green-100">
          در حال دریافت پرونده بیمار...
        </p>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error && !patient) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-green-100">
        بیمار پیدا نشد.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =========================
          Page Header
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          پرونده بیمار
        </h1>

        <p className="mt-1 text-sm text-green-100">
          اطلاعات کامل بیمار و صاحب حیوان
        </p>
      </div>

      {/* =========================
          Patient Information
      ========================= */}

      <div className="rounded-xl border border-pet-line bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-pet-900">
              {patient.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {patient.type}

              {patient.breed &&
                ` - ${patient.breed}`}
            </p>
          </div>

          <span className="rounded-full bg-pet-mint px-3 py-1 text-xs font-medium text-pet-800">
            بیمار
          </span>
        </div>

        <div className="mt-6 grid gap-4 border-t border-pet-line pt-6 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-xs text-gray-400">
              سن
            </p>

            <p className="mt-1 font-medium text-pet-900">
              {patient.age ?? "ثبت نشده"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              وزن
            </p>

            <p className="mt-1 font-medium text-pet-900">
              {patient.weight
                ? `${patient.weight} کیلوگرم`
                : "ثبت نشده"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              جنسیت
            </p>

            <p className="mt-1 font-medium text-pet-900">
              {patient.gender ?? "ثبت نشده"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              نژاد
            </p>

            <p className="mt-1 font-medium text-pet-900">
              {patient.breed ?? "ثبت نشده"}
            </p>
          </div>

        </div>
      </div>

      {/* =========================
          Owner Information
      ========================= */}

      <div className="rounded-xl border border-pet-line bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-pet-900">
          اطلاعات صاحب حیوان
        </h2>

        <div className="mt-4 space-y-2 text-sm">

          <p>
            <span className="font-medium text-pet-900">
              نام:
            </span>{" "}
            {patient.owner_name}
          </p>

          <p>
            <span className="font-medium text-pet-900">
              ایمیل:
            </span>{" "}
            {patient.owner_email}
          </p>

        </div>
      </div>

      {/* =========================
          Global Error
      ========================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =========================
          Medical Record Form
      ========================= */}

      <div className="rounded-xl border border-pet-line bg-white p-6 shadow-sm">

        <div>
          <h2 className="text-lg font-semibold text-pet-900">
            ثبت سابقه پزشکی جدید
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            ثبت معاینه، دارو، آزمایش یا سایر اقدامات پزشکی
          </p>
        </div>

        <form
          onSubmit={handleSubmitRecord(
            onSubmitRecord
          )}
          className="mt-6 space-y-5"
        >

          <div className="grid gap-5 md:grid-cols-2">

            {/* Title */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                عنوان سابقه
              </label>

              <input
                type="text"
                placeholder="مثلاً معاینه دوره‌ای"
                {...registerRecord("title", {
                  required:
                    "عنوان سابقه الزامی است.",
                })}
                className="w-full rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
              />

              {recordErrors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    recordErrors.title
                      .message
                  }
                </p>
              )}
            </div>

            {/* Type */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                نوع سابقه
              </label>

              <select
                {...registerRecord(
                  "record_type",
                  {
                    required:
                      "نوع سابقه الزامی است.",
                  }
                )}
                className="w-full rounded-lg border border-pet-line bg-white px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
              >
                <option value="معاینه">
                  معاینه
                </option>

                <option value="دارو">
                  دارو
                </option>

                <option value="واکسیناسیون">
                  واکسیناسیون
                </option>

                <option value="آزمایش">
                  آزمایش
                </option>

                <option value="جراحی">
                  جراحی
                </option>

                <option value="سایر">
                  سایر
                </option>
              </select>
            </div>

          </div>

          {/* Date */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              تاریخ
            </label>

            <input
              type="date"
              {...registerRecord(
                "record_date",
                {
                  required:
                    "تاریخ سابقه الزامی است.",
                }
              )}
              className="w-full rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
            />

            {recordErrors.record_date && (
              <p className="mt-1 text-xs text-red-500">
                {
                  recordErrors.record_date
                    .message
                }
              </p>
            )}
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              توضیحات
            </label>

            <textarea
              rows={4}
              placeholder="توضیحات مربوط به این سابقه..."
              {...registerRecord(
                "description"
              )}
              className="w-full resize-none rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
            />
          </div>

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={savingRecord}
              className="rounded-lg bg-pet-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingRecord
                ? "در حال ثبت..."
                : "ثبت سابقه پزشکی"}
            </button>

          </div>

        </form>
      </div>

      {/* =========================
          Medical Records
      ========================= */}

      <div className="rounded-xl border border-pet-line bg-white p-6 shadow-sm">

        <div>
          <h2 className="text-lg font-semibold text-pet-900">
            سوابق پزشکی
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            تاریخچه معاینات و اقدامات پزشکی بیمار
          </p>
        </div>

        {records.length === 0 ? (
          <div className="mt-6 rounded-lg bg-pet-50 p-6 text-center text-sm text-gray-500">
            هنوز سابقه پزشکی ثبت نشده است.
          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {records.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border border-pet-line bg-pet-50 p-4"
              >

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h3 className="font-semibold text-pet-900">
                      {record.title}
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      {record.record_type}
                    </p>
                  </div>

                  <span className="text-sm text-gray-500">
                    {record.record_date}
                  </span>

                </div>

                {record.description && (
                  <p className="mt-3 text-sm text-gray-600">
                    {record.description}
                  </p>
                )}

              </div>
            ))}

          </div>
        )}
      </div>

      {/* =========================
          Vaccination Form
      ========================= */}

      <div className="rounded-xl border border-pet-line bg-white p-6 shadow-sm">

        <div>
          <h2 className="text-lg font-semibold text-pet-900">
            ثبت واکسیناسیون جدید
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            ثبت واکسن تزریق‌شده و تاریخ نوبت بعدی
          </p>
        </div>

        <form
          onSubmit={handleSubmitVaccination(
            onSubmitVaccination
          )}
          className="mt-6 space-y-5"
        >

          {/* Vaccine name */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              نام واکسن
            </label>

            <input
              type="text"
              placeholder="مثلاً واکسن هاری"
              {...registerVaccination(
                "vaccine_name",
                {
                  required:
                    "نام واکسن الزامی است.",
                }
              )}
              className="w-full rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
            />

            {vaccinationErrors.vaccine_name && (
              <p className="mt-1 text-xs text-red-500">
                {
                  vaccinationErrors
                    .vaccine_name.message
                }
              </p>
            )}
          </div>

          {/* Dates */}

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                تاریخ تزریق
              </label>

              <input
                type="date"
                {...registerVaccination(
                  "vaccination_date",
                  {
                    required:
                      "تاریخ تزریق الزامی است.",
                  }
                )}
                className="w-full rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
              />

              {vaccinationErrors.vaccination_date && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    vaccinationErrors
                      .vaccination_date
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                تاریخ نوبت بعدی
              </label>

              <input
                type="date"
                {...registerVaccination(
                  "next_due_date"
                )}
                className="w-full rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
              />
            </div>

          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              توضیحات
            </label>

            <textarea
              rows={4}
              placeholder="مثلاً واکسن هاری سالانه تزریق شد."
              {...registerVaccination(
                "description"
              )}
              className="w-full resize-none rounded-lg border border-pet-line px-4 py-2.5 text-sm outline-none transition focus:border-pet-700 focus:ring-2 focus:ring-pet-100"
            />
          </div>

          {/* Submit */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={savingVaccination}
              className="rounded-lg bg-pet-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-pet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingVaccination
                ? "در حال ثبت..."
                : "ثبت واکسیناسیون"}
            </button>

          </div>

        </form>
      </div>

      {/* =========================
          Vaccinations
      ========================= */}

      <div className="rounded-xl border border-pet-line bg-white p-6 shadow-sm">

        <div>
          <h2 className="text-lg font-semibold text-pet-900">
            سوابق واکسیناسیون
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            تاریخچه واکسن‌های تزریق‌شده بیمار
          </p>
        </div>

        {vaccinations.length === 0 ? (
          <div className="mt-6 rounded-lg bg-pet-50 p-6 text-center text-sm text-gray-500">
            هنوز واکسیناسیونی ثبت نشده است.
          </div>
        ) : (
          <div className="mt-6 space-y-4">

            {vaccinations.map(
              (vaccination) => (
                <div
                  key={vaccination.id}
                  className="rounded-lg border border-pet-line bg-pet-50 p-4"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <h3 className="font-semibold text-pet-900">
                        {vaccination.vaccine_name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        تاریخ تزریق:{" "}
                        {
                          vaccination.vaccination_date
                        }
                      </p>
                    </div>

                    {vaccination.next_due_date && (
                      <span className="rounded-full bg-pet-mint px-3 py-1 text-xs font-medium text-pet-800">
                        نوبت بعدی:{" "}
                        {
                          vaccination.next_due_date
                        }
                      </span>
                    )}

                  </div>

                  {vaccination.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {
                        vaccination.description
                      }
                    </p>
                  )}

                </div>
              )
            )}

          </div>
        )}
      </div>

    </div>
  );
}

export default PatientProfile;