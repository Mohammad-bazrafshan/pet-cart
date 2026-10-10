import { useEffect, useState } from "react";

import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  type Appointment,
  type CreateAppointmentData,
} from "../../services/AppointmentService";

import { getPets, type Pet } from "../../services/PetService";
import { api } from "../../api/client";
import { isAxiosError } from "axios";
interface Clinic {
  id: number;
  name: string;
}

interface Veterinarian {
  id: number;
  clinic_id: number;
  name: string;
  specialty: string | null;
}

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateAppointmentData>({
    pet_id: 0,
    clinic_id: 0,
    veterinarian_id: 0,
    appointment_date: "",
    appointment_time: "",
    description: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  // دریافت اطلاعات اولیه
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [appointmentsData, petsData, clinicsResponse, vetsResponse] =
          await Promise.all([
            getAppointments(),
            getPets(),
            api.get<Clinic[]>("/clinics"),
            api.get<Veterinarian[]>("/veterinarians"),
          ]);

        setAppointments(appointmentsData);
        setPets(petsData);
        setClinics(clinicsResponse.data);
        setVeterinarians(vetsResponse.data);
      } catch (error) {
        console.error(error);
        setError("دریافت اطلاعات با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  useEffect(() => {
    if (!form.veterinarian_id || !form.appointment_date) {
      setOccupiedTimes([]);
      setAvailabilityError("");
      return;
    }

    let cancelled = false;

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");

        const response = await api.get<{
          occupied_times: string[];
        }>("/appointments/availability", {
          params: {
            veterinarian_id: form.veterinarian_id,
            date: form.appointment_date,
          },
        });

        if (!cancelled) {
          setOccupiedTimes(response.data.occupied_times);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setOccupiedTimes([]);
          setAvailabilityError("دریافت ساعت‌های رزرو با خطا مواجه شد.");
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [form.veterinarian_id, form.appointment_date]);

  // تغییر فیلدهای فرم
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "pet_id" || name === "clinic_id" || name === "veterinarian_id"
          ? Number(value)
          : value,
      ...(name === "veterinarian_id" || name === "appointment_date"
        ? { appointment_time: "" }
        : {}),
    }));
  };
  // تغییر کلینیک
  const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clinicId = Number(e.target.value);

    setForm((current) => ({
      ...current,
      clinic_id: clinicId,
      veterinarian_id: 0,
      appointment_time: "",
    }));
  };

  // ثبت نوبت
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");

    if (
      !form.pet_id ||
      !form.clinic_id ||
      !form.veterinarian_id ||
      !form.appointment_date ||
      !form.appointment_time
    ) {
      if (
        isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
      ) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError("ثبت نوبت با خطا مواجه شد.");
      }
      return;
    }

    try {
      setSubmitLoading(true);

      const newAppointment = await createAppointment(form);

      setAppointments((current) => [newAppointment, ...current]);

      setSubmitSuccess("نوبت با موفقیت ثبت شد.");

      setForm({
        pet_id: 0,
        clinic_id: 0,
        veterinarian_id: 0,
        appointment_date: "",
        appointment_time: "",
        description: "",
      });
    } catch (error) {
      console.error(error);

      if (
        isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
      ) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError("ثبت نوبت با خطا مواجه شد.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // لغو نوبت
  const handleCancelAppointment = async (id: number) => {
    try {
      setSubmitError("");
      setSubmitSuccess("");

      const updatedAppointment = await updateAppointmentStatus(id, "cancelled");

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status: updatedAppointment.status,
              }
            : appointment,
        ),
      );

      setSubmitSuccess("نوبت با موفقیت لغو شد.");
    } catch (error) {
      console.error(error);

      setSubmitError("لغو نوبت با خطا مواجه شد.");
    }
  };

  // فقط دامپزشکان همان کلینیک
  const filteredVeterinarians = veterinarians.filter(
    (vet) => vet.clinic_id === form.clinic_id,
  );
  const availableTimeSlots = Array.from({ length: 17 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  });
  // Loading
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">نوبت‌های من</h1>

        <p className="mt-1 text-gray-500">مشاهده و مدیریت نوبت‌های دامپزشکی</p>
      </div>

      {/* Create Appointment */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          ثبت نوبت جدید
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {/* Pet */}
          <div>
            <label className="mb-2 block text-sm font-medium">حیوان</label>

            <select
              name="pet_id"
              value={form.pet_id}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value={0}>انتخاب حیوان</option>

              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clinic */}
          <div>
            <label className="mb-2 block text-sm font-medium">کلینیک</label>

            <select
              name="clinic_id"
              value={form.clinic_id}
              onChange={handleClinicChange}
              className="w-full rounded-lg border p-3"
            >
              <option value={0}>انتخاب کلینیک</option>

              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Veterinarian */}
          <div>
            <label className="mb-2 block text-sm font-medium">دامپزشک</label>

            <select
              name="veterinarian_id"
              value={form.veterinarian_id}
              onChange={handleChange}
              disabled={!form.clinic_id}
              className="w-full rounded-lg border p-3 disabled:bg-gray-100"
            >
              <option value={0}>
                {form.clinic_id
                  ? "انتخاب دامپزشک"
                  : "ابتدا کلینیک را انتخاب کنید"}
              </option>

              {filteredVeterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.name}
                  {vet.specialty ? ` - ${vet.specialty}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium">تاریخ نوبت</label>

            <input
              type="date"
              name="appointment_date"
              value={form.appointment_date}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-2 block text-sm font-medium">ساعت نوبت</label>

            <select
              name="appointment_time"
              value={form.appointment_time}
              onChange={handleChange}
              disabled={
                !form.veterinarian_id ||
                !form.appointment_date ||
                availabilityLoading ||
                Boolean(availabilityError)
              }
              required
              className="w-full rounded-lg border p-3 disabled:bg-gray-100"
            >
              <option value="">
                {!form.veterinarian_id
                  ? "ابتدا دامپزشک را انتخاب کنید"
                  : !form.appointment_date
                    ? "ابتدا تاریخ را انتخاب کنید"
                    : availabilityLoading
                      ? "در حال دریافت ساعت‌ها..."
                      : availabilityError
                        ? "دریافت ساعت‌ها ناموفق بود"
                        : "انتخاب ساعت"}
              </option>

              {availableTimeSlots.map((time) => {
                const occupied = occupiedTimes.includes(time);

                return (
                  <option key={time} value={time} disabled={occupied}>
                    {time}
                    {occupied ? " — رزرو شده" : ""}
                  </option>
                );
              })}
            </select>

            {availabilityError && (
              <p className="mt-2 text-sm text-red-500">{availabilityError}</p>
            )}

            {!availabilityLoading &&
              !availabilityError &&
              form.veterinarian_id > 0 &&
              form.appointment_date &&
              availableTimeSlots.every((time) =>
                occupiedTimes.includes(time),
              ) && (
                <p className="mt-2 text-sm text-amber-600">
                  تمام ساعت‌های نمایش‌داده‌شده رزرو شده‌اند.
                </p>
              )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">توضیحات</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="مثلاً معاینه دوره‌ای..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* Messages + Submit */}
          <div className="md:col-span-2">
            {submitError && (
              <p className="mb-3 text-sm text-red-500">{submitError}</p>
            )}

            {submitSuccess && (
              <p className="mb-3 text-sm text-green-600">{submitSuccess}</p>
            )}

            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitLoading ? "در حال ثبت..." : "ثبت نوبت"}
            </button>
          </div>
        </form>
      </section>

      {/* Appointments List */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          نوبت‌های ثبت‌شده
        </h2>

        {appointments.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="text-gray-500">هنوز هیچ نوبتی ثبت نکرده‌اید.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* اطلاعات نوبت */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {appointment.pet_name}
                    </h3>

                    <p className="mt-1 text-gray-600">
                      {appointment.clinic_name}
                    </p>

                    <p className="mt-1 text-gray-500">
                      {appointment.veterinarian_name}
                    </p>

                    {appointment.specialty && (
                      <p className="mt-1 text-sm text-gray-400">
                        تخصص: {appointment.specialty}
                      </p>
                    )}
                  </div>

                  {/* تاریخ، ساعت و وضعیت */}
                  <div className="text-right">
                    <p className="font-medium text-gray-700">
                      {new Date(
                        `${appointment.appointment_date}T00:00:00`,
                      ).toLocaleDateString("fa-IR")}
                    </p>

                    <p className="mt-1 text-gray-500">
                      ساعت {appointment.appointment_time.slice(0, 5)}
                    </p>

                    {/* وضعیت */}
                    <span
                      className={`mt-3 inline-block rounded-full px-3 py-1 text-sm ${
                        appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : appointment.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                      }`}
                    >
                      {appointment.status === "pending"
                        ? "در انتظار تأیید"
                        : appointment.status === "confirmed"
                          ? "تأیید شده"
                          : appointment.status === "completed"
                            ? "انجام شده"
                            : "لغو شده"}
                    </span>

                    {/* دکمه لغو */}
                    {(appointment.status === "pending" ||
                      appointment.status === "confirmed") && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          لغو نوبت
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* توضیحات */}
                {appointment.description && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-sm text-gray-500">توضیحات</p>

                    <p className="mt-1 text-gray-700">
                      {appointment.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Appointments;
