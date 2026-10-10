import { useEffect, useState } from "react";
import {
  getClinicAppointments,
  type ClinicAppointment,
} from "../../services/ClinicAppointmentService";

function Dashboard() {
  const [appointments, setAppointments] = useState<
    ClinicAppointment[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClinicAppointments();

      setAppointments(data);
    } catch (error) {
      console.error(error);

      setError(
        "دریافت اطلاعات داشبورد با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = appointments.filter(
    (appointment) =>
      appointment.status === "pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) =>
      appointment.status === "confirmed"
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status === "completed"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) =>
      appointment.status === "cancelled"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">
          در حال دریافت اطلاعات...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          داشبورد کلینیک
        </h1>

        <p className="mt-1 text-sm text-green-100">
          نمای کلی نوبت‌ها و وضعیت بیماران
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Pending */}
        <div className="rounded-xl border border-yellow-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            در انتظار تأیید
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingCount}
          </p>
        </div>

        {/* Confirmed */}
        <div className="rounded-xl border border-pet-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            تأیید شده
          </p>

          <p className="mt-2 text-3xl font-bold text-pet-700">
            {confirmedCount}
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-pet-200 bg-pet-50 p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            تکمیل شده
          </p>

          <p className="mt-2 text-3xl font-bold text-pet-800">
            {completedCount}
          </p>
        </div>

        {/* Cancelled */}
        <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            لغو شده
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {cancelledCount}
          </p>
        </div>

      </div>

      {/* Recent Appointments */}
      <div className="rounded-xl border border-pet-line bg-white shadow-sm">

        <div className="border-b border-pet-line p-5">
          <h2 className="text-lg font-semibold text-pet-900">
            آخرین نوبت‌ها
          </h2>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            هنوز نوبتی ثبت نشده است.
          </div>
        ) : (
          <div className="divide-y divide-pet-line">

            {appointments
              .slice(0, 5)
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div>
                    <h3 className="font-semibold text-pet-900">
                      {appointment.pet_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {appointment.appointment_date}
                      {" - "}
                      {appointment.appointment_time}
                    </p>

                    {appointment.description && (
                      <p className="mt-1 text-sm text-gray-400">
                        {appointment.description}
                      </p>
                    )}
                  </div>

                  <div>
                    {appointment.status ===
                      "pending" && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                        در انتظار تأیید
                      </span>
                    )}

                    {appointment.status ===
                      "confirmed" && (
                      <span className="rounded-full bg-pet-mint px-3 py-1 text-xs font-medium text-pet-800">
                        تأیید شده
                      </span>
                    )}

                    {appointment.status ===
                      "completed" && (
                      <span className="rounded-full bg-pet-100 px-3 py-1 text-xs font-medium text-pet-800">
                        تکمیل شده
                      </span>
                    )}

                    {appointment.status ===
                      "cancelled" && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        لغو شده
                      </span>
                    )}
                  </div>

                </div>
              ))}
          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;