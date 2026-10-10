import { api } from "../api/client";

export interface ClinicAppointment {
  id: number;

  pet_id: number;
  clinic_id: number;
  veterinarian_id: number;

  appointment_date: string;
  appointment_time: string;

  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";

  description: string | null;
  created_at: string;

  pet_name: string;
  clinic_name: string;
  veterinarian_name: string;
  specialty: string | null;
}

export const getClinicAppointments = async () => {
  const response = await api.get<ClinicAppointment[]>(
    "/appointments/clinic"
  );

  return response.data;
};

export const updateClinicAppointmentStatus = async (
  id: number,
  status: "confirmed" | "completed"
) => {
  const response = await api.patch<ClinicAppointment>(
    `/appointments/clinic/${id}/status`,
    { status }
  );

  return response.data;
};