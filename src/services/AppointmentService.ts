import { api } from "../api/client";

export interface Appointment {
  id: number;
  pet_id: number;
  clinic_id: number;
  veterinarian_id: number;

  appointment_date: string;
  appointment_time: string;

  status: "pending" | "confirmed" | "completed" | "cancelled";

  description: string | null;
  created_at: string;

  pet_name: string;
  clinic_name: string;
  veterinarian_name: string;
  specialty: string | null;
}

export interface CreateAppointmentData {
  pet_id: number;
  clinic_id: number;
  veterinarian_id: number;
  appointment_date: string;
  appointment_time: string;
  description?: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";


// دریافت تمام نوبت‌های کاربر
export const getAppointments = async () => {
  const response = await api.get<Appointment[]>("/appointments");

  return response.data;
};


// دریافت یک نوبت
export const getAppointmentById = async (id: number) => {
  const response = await api.get<Appointment>(
    `/appointments/${id}`
  );

  return response.data;
};


// ثبت نوبت جدید
export const createAppointment = async (
  data: CreateAppointmentData
) => {
  const response = await api.post<Appointment>(
    "/appointments",
    data
  );

  return response.data;
};


// تغییر وضعیت نوبت
export const updateAppointmentStatus = async (
  id: number,
  status: AppointmentStatus
) => {
  const response = await api.patch<Appointment>(
    `/appointments/${id}/status`,
    { status }
  );

  return response.data;
};