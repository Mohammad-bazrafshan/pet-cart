import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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

/* =========================
   Medical Record Schema
========================= */

const recordSchema = yup.object({
  title: yup
    .string()
    .required("عنوان سابقه الزامی است.")
    .min(2, "عنوان باید حداقل ۲ کاراکتر باشد."),

  record_type: yup
    .string()
    .required("نوع سابقه را انتخاب کنید."),

  record_date: yup
    .string()
    .required("تاریخ الزامی است."),

  description: yup
    .string()
    .required("توضیحات الزامی است.")
    .min(5, "توضیحات باید حداقل ۵ کاراکتر باشد."),
});

type RecordFormData = yup.InferType<typeof recordSchema>;

/* =========================
   Vaccination Schema
========================= */

const vaccinationSchema = yup.object({
  vaccine_name: yup
    .string()
    .required("نام واکسن الزامی است.")
    .min(2, "نام واکسن باید حداقل ۲ کاراکتر باشد."),

  vaccination_date: yup
    .string()
    .required("تاریخ تزریق الزامی است."),

  next_due_date: yup
    .string()
    .required("تاریخ نوبت بعدی الزامی است."),

  description: yup
    .string()
    .required("توضیحات الزامی است.")
    .min(5, "توضیحات باید حداقل ۵ کاراکتر باشد."),
});

type VaccinationFormData = yup.InferType<typeof vaccinationSchema>;

/* =========================
   Component
========================= */

function PetProfile() {
  const { id } = useParams();

  /* =========================
     Pet State
  ========================= */

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     Medical Records State
  ========================= */

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState("");

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordSubmitError, setRecordSubmitError] = useState("");
  const [recordSubmitting, setRecordSubmitting] = useState(false);

  /* =========================
     Vaccinations State
  ========================= */

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [vaccinationsLoading, setVaccinationsLoading] = useState(true);
  const [vaccinationsError, setVaccinationsError] = useState("");

  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [vaccinationSubmitError, setVaccinationSubmitError] = useState("");
  const [vaccinationSubmitting, setVaccinationSubmitting] = useState(false);

  /* =========================
     Medical Record Form
  ========================= */

  const {
    register,
    handleSubmit,
    reset,
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

  /* =========================
     Vaccination Form
  ========================= */

  const {
    register: registerVaccination,
    handleSubmit: handleVaccinationSubmit,
    reset: resetVaccination,
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

  /* =========================
     Fetch Pet
  ========================= */

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

  /* =========================
     Fetch Medical Records
  ========================= */

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

  /* =========================
     Fetch Vaccinations
  ========================= */

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

  /* =========================
     Create Medical Record
  ========================= */

  const handleCreateRecord = async (data: RecordFormData) => {
    if (!id) return;

    try {
      setRecordSubmitting(true);
      setRecordSubmitError("");

      const newRecord = await createMedicalRecord(
        Number(id),
        data
      );

      setRecords((currentRecords) => [
        newRecord,
        ...currentRecords,
      ]);

      reset();
      setShowRecordForm(false);
    } catch (error) {
      console.error(error);

      setRecordSubmitError(
        "ثبت سابقه پزشکی با خطا مواجه شد."
      );
    } finally {
      setRecordSubmitting(false);
    }
  };

  /* =========================
     Create Vaccination
  ========================= */

  const handleCreateVaccination = async (
    data: VaccinationFormData
  ) => {
    if (!id) return;

    try {
      setVaccinationSubmitting(true);
      setVaccinationSubmitError("");

      const newVaccination = await createVaccination(
        Number(id),
        data
      );

      setVaccinations((currentVaccinations) => [
        newVaccination,
        ...currentVaccinations,
      ]);

      resetVaccination();
      setShowVaccinationForm(false);
    } catch (error) {
      console.error(error);

      setVaccinationSubmitError(
        "ثبت واکسن با خطا مواجه شد."
      );
    } finally {
      setVaccinationSubmitting(false);
    }
  };

  /* =========================
     Loading
  ========================= */

  if (loading) {
    return <p>در حال دریافت اطلاعات...</p>;
  }

  /* =========================
     Error
  ========================= */

  if (error) {
    return (
      <p className="text-red-500">
        {error}
      </p>
    );
  }

  if (!pet) {
    return <p>حیوان پیدا نشد.</p>;
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="dashboard">

      {/* =========================
          Header
      ========================= */}

      <div>
        <h1 className="page-title">
          پرونده {pet.name}
        </h1>

        <p className="page-description">
          اطلاعات پایه و مراقبت‌های {pet.name}
        </p>
      </div>

      {/* =========================
          Pet Information
      ========================= */}

      <PetInfo pet={pet} />

      {/* =========================
          Edit Pet
      ========================= */}

      <Link
        to={`/dashboard/pets/${pet.id}/edit`}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
      >
        ویرایش اطلاعات
      </Link>

      {/* =========================
          Medical Records
      ========================= */}

      <div className="mt-6">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-xl font-bold">
            سوابق پزشکی
          </h2>

          <button
            type="button"
            onClick={() => {
              setShowRecordForm((prev) => !prev);
              setRecordSubmitError("");
              reset();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {showRecordForm
              ? "بستن فرم"
              : "ثبت سابقه"}
          </button>

        </div>

        {/* =========================
            Medical Record Form
        ========================= */}

        {showRecordForm && (
          <form
            onSubmit={handleSubmit(handleCreateRecord)}
            className="pet-profile-form mb-6 space-y-4 rounded-[20px] border border-[#d9e3d6] bg-[linear-gradient(145deg,#f1f6ef,#e9f0e8)] p-5 shadow-[0_12px_24px_rgba(54,82,63,0.07)]"
          >

            {/* Title */}

            <div>
              <label className="block mb-2 font-medium">
                عنوان سابقه
              </label>

              <input
                type="text"
                {...register("title")}
                placeholder="مثلاً واکسن هاری"
                className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Record Type */}

            <div>
              <label className="block mb-2 font-medium">
                نوع سابقه
              </label>

              <select
                {...register("record_type")}
                className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              >
                <option value="">
                  نوع سابقه را انتخاب کنید
                </option>

                <option value="واکسیناسیون">
                  واکسیناسیون
                </option>

                <option value="معاینه">
                  معاینه
                </option>

                <option value="دارو">
                  دارو
                </option>

                <option value="آزمایش">
                  آزمایش
                </option>

                <option value="جراحی">
                  جراحی
                </option>
              </select>

              {errors.record_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.record_type.message}
                </p>
              )}
            </div>

            {/* Date */}

            <div>
              <label className="block mb-2 font-medium">
                تاریخ
              </label>

              <input
                type="date"
                {...register("record_date")}
                className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {errors.record_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.record_date.message}
                </p>
              )}
            </div>

            {/* Description */}

            <div>
              <label className="block mb-2 font-medium">
                توضیحات
              </label>

              <textarea
                rows={4}
                {...register("description")}
                placeholder="توضیحات مربوط به این سابقه..."
                className="pet-profile-field w-full resize-none rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* API Error */}

            {recordSubmitError && (
              <p className="text-red-500">
                {recordSubmitError}
              </p>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={recordSubmitting}
              className="rounded-lg bg-[#285b48] px-5 py-2.5 text-white transition hover:bg-[#1d473a] disabled:opacity-50"
            >
              {recordSubmitting
                ? "در حال ثبت..."
                : "ثبت سابقه"}
            </button>

          </form>
        )}

        {/* =========================
            Medical Records List
        ========================= */}

        {recordsLoading && (
          <p className="text-gray-500">
            در حال دریافت سوابق پزشکی...
          </p>
        )}

        {recordsError && (
          <p className="text-red-500">
            {recordsError}
          </p>
        )}

        {!recordsLoading &&
          !recordsError &&
          records.length === 0 && (
            <div className="empty-state">
              <span aria-hidden="true">
                ♡
              </span>

              <strong>
                هنوز سابقه پزشکی ثبت نشده است.
              </strong>

              <p>
                سوابق پزشکی این حیوان بعد از ثبت توسط شما نمایش داده می‌شود.
              </p>
            </div>
          )}

        {!recordsLoading &&
          records.length > 0 && (
            <div className="space-y-4">

              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-[18px] border border-[#d9e3d6] bg-[linear-gradient(145deg,#eef5ed,#e6eee4)] p-4 shadow-[0_8px_18px_rgba(54,82,63,0.06)]"
                >
                  <h3 className="text-lg font-bold text-[#244b3b]">
                    {record.title}
                  </h3>

                  <p className="mt-1 text-sm text-[#65786c]">
                    نوع: {record.record_type}
                  </p>

                  <p className="text-sm text-[#65786c]">
                    تاریخ: {record.record_date}
                  </p>

                  {record.description && (
                    <p className="mt-3 text-[#3f5749]">
                      {record.description}
                    </p>
                  )}
                </div>
              ))}

            </div>
          )}

      </div>

      {/* =========================
          Vaccinations
      ========================= */}

      <div className="mt-8">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-xl font-bold">
            واکسن‌ها
          </h2>

          <button
            type="button"
            onClick={() => {
              setShowVaccinationForm((prev) => !prev);
              setVaccinationSubmitError("");
              resetVaccination();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {showVaccinationForm
              ? "بستن فرم"
              : "ثبت واکسن"}
          </button>

        </div>

        {/* =========================
            Vaccination Form
        ========================= */}

        {showVaccinationForm && (
          <form
            onSubmit={handleVaccinationSubmit(
              handleCreateVaccination
            )}
            className="pet-profile-form mb-6 space-y-4 rounded-[20px] border border-[#d9e3d6] bg-[linear-gradient(145deg,#f1f6ef,#e9f0e8)] p-5 shadow-[0_12px_24px_rgba(54,82,63,0.07)]"
          >

            {/* Vaccine Name */}

            <div>
              <label className="block mb-2 font-medium">
                نام واکسن
              </label>

              <input
                type="text"
                {...registerVaccination("vaccine_name")}
                placeholder="مثلاً واکسن هاری"
                className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {vaccinationErrors.vaccine_name && (
                <p className="text-red-500 text-sm mt-1">
                  {vaccinationErrors.vaccine_name.message}
                </p>
              )}
            </div>

            {/* Vaccination Date */}

            <div>
              <label className="block mb-2 font-medium">
                تاریخ تزریق
              </label>

              <input
                type="date"
                {...registerVaccination(
                  "vaccination_date"
                )}
                className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {vaccinationErrors.vaccination_date && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    vaccinationErrors.vaccination_date
                      .message
                  }
                </p>
              )}
            </div>

            {/* Next Due Date */}

            <div>
              <label className="block mb-2 font-medium">
                تاریخ نوبت بعدی
              </label>

              <input
                type="date"
                {...registerVaccination(
                  "next_due_date"
                )}
                className="pet-profile-field w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {vaccinationErrors.next_due_date && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    vaccinationErrors.next_due_date
                      .message
                  }
                </p>
              )}
            </div>

            {/* Description */}

            <div>
              <label className="block mb-2 font-medium">
                توضیحات
              </label>

              <textarea
                rows={4}
                {...registerVaccination("description")}
                placeholder="توضیحات مربوط به واکسن..."
                className="pet-profile-field w-full resize-none rounded-lg border px-4 py-2.5 outline-none focus:ring-2"
              />

              {vaccinationErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    vaccinationErrors.description
                      .message
                  }
                </p>
              )}
            </div>

            {/* API Error */}

            {vaccinationSubmitError && (
              <p className="text-red-500">
                {vaccinationSubmitError}
              </p>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={vaccinationSubmitting}
              className="rounded-lg bg-[#285b48] px-5 py-2.5 text-white transition hover:bg-[#1d473a] disabled:opacity-50"
            >
              {vaccinationSubmitting
                ? "در حال ثبت..."
                : "ثبت واکسن"}
            </button>

          </form>
        )}

        {/* =========================
            Vaccination List
        ========================= */}

        {vaccinationsLoading && (
          <p className="text-gray-500">
            در حال دریافت واکسن‌ها...
          </p>
        )}

        {vaccinationsError && (
          <p className="text-red-500">
            {vaccinationsError}
          </p>
        )}

        {!vaccinationsLoading &&
          !vaccinationsError &&
          vaccinations.length === 0 && (
            <div className="empty-state">

              <span aria-hidden="true">
                💉
              </span>

              <strong>
                هنوز واکسنی ثبت نشده است.
              </strong>

              <p>
                واکسن‌های {pet.name} بعد از ثبت در این قسمت نمایش داده می‌شوند.
              </p>

            </div>
          )}

        {!vaccinationsLoading &&
          vaccinations.length > 0 && (
            <div className="space-y-4">

              {vaccinations.map((vaccination) => (
                <div
                  key={vaccination.id}
                  className="rounded-[18px] border border-[#d9e3d6] bg-[linear-gradient(145deg,#eef5ed,#e6eee4)] p-4 shadow-[0_8px_18px_rgba(54,82,63,0.06)]"
                >

                  <h3 className="text-lg font-bold text-[#244b3b]">
                    {vaccination.vaccine_name}
                  </h3>

                  <p className="mt-1 text-sm text-[#65786c]">
                    تاریخ تزریق:{" "}
                    {vaccination.vaccination_date}
                  </p>

                  {vaccination.next_due_date && (
                    <p className="text-sm text-[#65786c]">
                      نوبت بعدی:{" "}
                      {vaccination.next_due_date}
                    </p>
                  )}

                  {vaccination.description && (
                    <p className="mt-3 text-[#3f5749]">
                      {vaccination.description}
                    </p>
                  )}

                </div>
              ))}

            </div>
          )}

      </div>

    </div>
  );
}

export default PetProfile;