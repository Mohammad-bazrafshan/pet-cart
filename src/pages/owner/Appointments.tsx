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
import { getCities, getProvincesList } from "@code-plate/iran-cities";

interface Clinic {
  id: number;
  name: string;
  province: string | null;
  city: string | null;
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

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const provinces = getProvincesList();

  const selectedProvinceData = provinces.find(
    (province) => province.en === selectedProvince,
  );

  const cities = selectedProvince ? getCities(selectedProvince) : [];

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
      } catch (err) {
        console.error(err);
        setError("دریافت اطلاعات با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // دریافت ساعت‌های رزروشده
  useEffect(() => {
    if (!form.veterinarian_id || !form.appointment_date) {
      setOccupiedTimes([]);
      setAvailabilityError("");
      setAvailabilityLoading(false);
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
      } catch (err) {
        console.error(err);

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
        name === "pet_id" ||
        name === "clinic_id" ||
        name === "veterinarian_id"
          ? Number(value)
          : value,
      ...(name === "veterinarian_id" || name === "appointment_date"
        ? { appointment_time: "" }
        : {}),
    }));
  };

  // تغییر استان
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity("");

    setForm((current) => ({
      ...current,
      clinic_id: 0,
      veterinarian_id: 0,
      appointment_time: "",
    }));

    setOccupiedTimes([]);
    setSubmitError("");
    setSubmitSuccess("");
  };

  // تغییر شهر
  const handleCityChange = (value: string) => {
    setSelectedCity(value);

    setForm((current) => ({
      ...current,
      clinic_id: 0,
      veterinarian_id: 0,
      appointment_time: "",
    }));

    setOccupiedTimes([]);
    setSubmitError("");
    setSubmitSuccess("");
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

    setOccupiedTimes([]);
    setSubmitError("");
    setSubmitSuccess("");
  };

  // ثبت نوبت
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");

    if (
      !form.pet_id ||
      !selectedProvince ||
      !selectedCity ||
      !form.clinic_id ||
      !form.veterinarian_id ||
      !form.appointment_date ||
      !form.appointment_time
    ) {
      setSubmitError("لطفاً تمام فیلدهای الزامی را تکمیل کن.");
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

      setSelectedProvince("");
      setSelectedCity("");
      setOccupiedTimes([]);
    } catch (err) {
      console.error(err);

      if (
        isAxiosError<{ message?: string }>(err) &&
        err.response?.data?.message
      ) {
        setSubmitError(err.response.data.message);
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

      const updatedAppointment = await updateAppointmentStatus(
        id,
        "cancelled",
      );

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: updatedAppointment.status }
            : appointment,
        ),
      );

      setSubmitSuccess("نوبت با موفقیت لغو شد.");
    } catch (err) {
      console.error(err);

      if (
        isAxiosError<{ message?: string }>(err) &&
        err.response?.data?.message
      ) {
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError("لغو نوبت با خطا مواجه شد.");
      }
    }
  };

  // کلینیک‌های استان و شهر انتخاب‌شده
  const selectedCityData = cities.find((city) => city.en === selectedCity);

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.province === selectedProvinceData?.fa &&
      clinic.city === selectedCityData?.fa,
  );

  // دامپزشکان کلینیک انتخاب‌شده
  const filteredVeterinarians = veterinarians.filter(
    (vet) => vet.clinic_id === form.clinic_id,
  );

  // ساعت‌های قابل انتخاب
  const availableTimeSlots = Array.from({ length: 17 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  });

  const inputClass =
    "w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  // Loading
  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[50vh] items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm text-slate-500">
            در حال دریافت اطلاعات نوبت‌ها...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        dir="rtl"
        className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <span className="text-xl">!</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-800">
              دریافت اطلاعات ناموفق بود
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto w-full max-w-7xl space-y-8">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-lg shadow-blue-100 sm:p-8">
        <div className="pointer-events-none absolute -left-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-sky-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              مدیریت خدمات دامپزشکی
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              نوبت‌های من
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-7 text-blue-50 sm:text-base">
              نوبت دامپزشکی ثبت کن و زمان مراجعه و وضعیت نوبت‌هایت را مدیریت
              کن.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl shadow-inner backdrop-blur-sm sm:h-20 sm:w-20">
            🐾
          </div>
        </div>
      </header>

      {/* Create Appointment */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              📅
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                ثبت نوبت جدید
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                اطلاعات لازم را وارد و زمان مراجعه را انتخاب کن.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 p-5 sm:p-8">
          {/* Pet */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                ۱
              </span>
              <h3 className="font-bold text-slate-800">انتخاب حیوان خانگی</h3>
            </div>

            <div className="max-w-2xl">
              <label className={labelClass}>حیوان خانگی *</label>
              <select
                name="pet_id"
                value={form.pet_id}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value={0}>حیوان موردنظر را انتخاب کن</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>

              {pets.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  ابتدا باید یک حیوان خانگی ثبت کنی.
                </p>
              )}
            </div>
          </div>

          {/* Province, City, Clinic */}
          <div className="border-t border-slate-100 pt-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                ۲
              </span>
              <h3 className="font-bold text-slate-800">
                انتخاب محل مراجعه
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={labelClass}>استان *</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">استان را انتخاب کن</option>
                  {provinces.map((province) => (
                    <option key={province.en} value={province.en}>
                      {province.fa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>شهر *</label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedProvince}
                  required
                  className={inputClass}
                >
                  <option value="">شهر را انتخاب کن</option>
                  {cities.map((city) => (
                    <option key={city.en} value={city.en}>
                      {city.fa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>کلینیک *</label>
                <select
                  name="clinic_id"
                  value={form.clinic_id}
                  onChange={handleClinicChange}
                  disabled={!selectedCity}
                  required
                  className={inputClass}
                >
                  <option value={0}>
                    {!selectedProvince
                      ? "ابتدا استان را انتخاب کن"
                      : !selectedCity
                        ? "ابتدا شهر را انتخاب کن"
                        : "کلینیک را انتخاب کن"}
                  </option>
                  {filteredClinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>

                {selectedCity && filteredClinics.length === 0 && (
                  <p className="mt-2 text-xs leading-5 text-amber-600">
                    کلینیکی برای این شهر پیدا نشد. ممکن است اطلاعات شهر کلینیک
                    هنوز در سامانه ثبت نشده باشد.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Veterinarian, Date, Time */}
          <div className="border-t border-slate-100 pt-7">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                ۳
              </span>
              <h3 className="font-bold text-slate-800">
                انتخاب دامپزشک و زمان
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={labelClass}>دامپزشک *</label>
                <select
                  name="veterinarian_id"
                  value={form.veterinarian_id}
                  onChange={handleChange}
                  disabled={!form.clinic_id}
                  required
                  className={inputClass}
                >
                  <option value={0}>
                    {form.clinic_id
                      ? "دامپزشک را انتخاب کن"
                      : "ابتدا کلینیک را انتخاب کن"}
                  </option>
                  {filteredVeterinarians.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.name}
                      {vet.specialty ? ` — ${vet.specialty}` : ""}
                    </option>
                  ))}
                </select>

                {form.clinic_id && filteredVeterinarians.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    دامپزشکی برای این کلینیک ثبت نشده است.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>تاریخ نوبت *</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={form.appointment_date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>ساعت نوبت *</label>
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
                  className={inputClass}
                >
                  <option value="">
                    {!form.veterinarian_id
                      ? "ابتدا دامپزشک را انتخاب کن"
                      : !form.appointment_date
                        ? "ابتدا تاریخ را انتخاب کن"
                        : availabilityLoading
                          ? "در حال دریافت ساعت‌ها..."
                          : availabilityError
                            ? "دریافت ساعت‌ها ناموفق بود"
                            : "ساعت را انتخاب کن"}
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

                {availabilityLoading && (
                  <p className="mt-2 text-xs text-blue-600">
                    در حال بررسی زمان‌های رزروشده...
                  </p>
                )}

                {availabilityError && (
                  <p className="mt-2 text-xs leading-5 text-red-600">
                    {availabilityError}
                  </p>
                )}

                {!availabilityLoading &&
                  !availabilityError &&
                  form.veterinarian_id > 0 &&
                  form.appointment_date &&
                  availableTimeSlots.every((time) =>
                    occupiedTimes.includes(time),
                  ) && (
                    <p className="mt-2 text-xs text-amber-600">
                      تمام ساعت‌های نمایش‌داده‌شده رزرو شده‌اند.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-7">
            <label className={labelClass}>توضیحات (اختیاری)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="علت مراجعه یا توضیحات لازم را بنویس..."
              className={`${inputClass} min-h-28 resize-y leading-7`}
            />
          </div>

          {/* Messages */}
          {(submitError || submitSuccess) && (
            <div
              role="status"
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                submitError
                  ? "border-red-100 bg-red-50 text-red-700"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className="text-lg">{submitError ? "!" : "✓"}</span>
              <p className="text-sm leading-6">
                {submitError || submitSuccess}
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-6 text-slate-400">
              فیلدهای دارای * الزامی هستند.
            </p>

            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  در حال ثبت نوبت...
                </>
              ) : (
                <>
                  <span>+</span>
                  ثبت نوبت
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Appointments List */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
              نوبت‌های ثبت‌شده
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              سوابق مراجعه و وضعیت نوبت‌های تو
            </p>
          </div>

          <span className="w-fit rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {appointments.length} نوبت
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-3xl">
              📅
            </div>
            <h3 className="mt-4 font-bold text-slate-800">
              هنوز نوبتی ثبت نکرده‌ای
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-slate-500">
              از فرم بالا برای انتخاب کلینیک، دامپزشک و زمان مراجعه استفاده کن.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {appointments.map((appointment) => (
              <article
                key={appointment.id}
                className="group min-w-0 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 sm:p-6"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition group-hover:bg-blue-100">
                      🐾
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold text-slate-800">
                        {appointment.pet_name}
                      </h3>
                      <p className="mt-1 break-words text-sm font-medium text-slate-600">
                        {appointment.clinic_name}
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-500">
                        دکتر {appointment.veterinarian_name}
                      </p>
                      {appointment.specialty && (
                        <p className="mt-1 text-xs text-slate-400">
                          تخصص: {appointment.specialty}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      appointment.status === "pending"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                        : appointment.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : appointment.status === "completed"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                            : "bg-red-50 text-red-700 ring-1 ring-red-100"
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
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                    <p className="text-xs text-slate-400">تاریخ مراجعه</p>
                    <p className="mt-2 break-words text-sm font-bold text-slate-700">
                      {new Date(
                        `${appointment.appointment_date}T00:00:00`,
                      ).toLocaleDateString("fa-IR")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                    <p className="text-xs text-slate-400">ساعت مراجعه</p>
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {appointment.appointment_time.slice(0, 5)}
                    </p>
                  </div>
                </div>

                {appointment.description && (
                  <div className="mt-4 rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-400">
                      توضیحات
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {appointment.description}
                    </p>
                  </div>
                )}

                {(appointment.status === "pending" ||
                  appointment.status === "confirmed") && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleCancelAppointment(appointment.id)
                      }
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-100 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                    >
                      لغو نوبت
                    </button>
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

export default Appointments;