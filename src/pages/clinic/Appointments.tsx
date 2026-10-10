import { useEffect, useState } from "react";
import {
  getClinicAppointments,
  updateClinicAppointmentStatus,
  type ClinicAppointment,
} from "../../services/ClinicAppointmentService";

function Appointments() {
  const [appointments, setAppointments] = useState<
    ClinicAppointment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicAppointments();

      setAppointments(data);
    } catch (error) {
      console.error(error);
      setError("دریافت نوبت‌ها با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusChange = async (
    id: number,
    status: "confirmed" | "completed"
  ) => {
    try {
      setUpdatingId(id);
      setError("");

      const updatedAppointment =
        await updateClinicAppointmentStatus(id, status);

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status: updatedAppointment.status,
              }
            : appointment
        )
      );
    } catch (error) {
      console.error(error);
      setError("تغییر وضعیت نوبت با خطا مواجه شد.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusLabel = (
    status: ClinicAppointment["status"]
  ) => {
    switch (status) {
      case "pending":
        return "در انتظار تأیید";

      case "confirmed":
        return "تأیید شده";

      case "completed":
        return "تکمیل شده";

      case "cancelled":
        return "لغو شده";

      default:
        return status;
    }
  };

  const getStatusClass = (
    status: ClinicAppointment["status"]
  ) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-pet-mint text-pet-800";

      case "completed":
        return "bg-pet-100 text-pet-800";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          در حال دریافت نوبت‌ها...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          مدیریت نوبت‌ها
        </h1>

        <p className="mt-1 text-sm text-green-100">
          مشاهده و مدیریت نوبت‌های ثبت‌شده برای کلینیک
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-pet-line bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            هنوز نوبتی برای کلینیک ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="rounded-xl border border-pet-line bg-white p-5 shadow-sm transition hover:border-pet-300"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-pet-900">
                    {appointment.pet_name}
                  </h2>

                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>
                      تاریخ: {appointment.appointment_date}
                    </p>

                    <p>
                      ساعت: {appointment.appointment_time}
                    </p>

                    <p>
                      دامپزشک:{" "}
                      {appointment.veterinarian_name}
                    </p>

                    {appointment.specialty && (
                      <p>
                        تخصص: {appointment.specialty}
                      </p>
                    )}

                    {appointment.description && (
                      <p>
                        توضیحات:{" "}
                        {appointment.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      appointment.status
                    )}`}
                  >
                    {getStatusLabel(
                      appointment.status
                    )}
                  </span>

                  {appointment.status === "pending" && (
                    <button
                      type="button"
                      disabled={updatingId === appointment.id}
                      onClick={() =>
                        handleStatusChange(
                          appointment.id,
                          "confirmed"
                        )
                      }
                      className="rounded-lg bg-pet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-pet-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === appointment.id
                        ? "در حال ثبت..."
                        : "تأیید نوبت"}
                    </button>
                  )}

                  {appointment.status === "confirmed" && (
                    <button
                      type="button"
                      disabled={updatingId === appointment.id}
                      onClick={() =>
                        handleStatusChange(
                          appointment.id,
                          "completed"
                        )
                      }
                      className="rounded-lg bg-pet-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-pet-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === appointment.id
                        ? "در حال ثبت..."
                        : "تکمیل نوبت"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Appointments;