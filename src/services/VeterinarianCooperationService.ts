
import { api } from "../api/client";

export interface CooperationClinic {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  description: string | null;
}

export type CooperationStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface VeterinarianCooperationRequest {
  id: number;
  clinic_id: number;
  clinic_name?: string;
  clinic_address?: string | null;
  status: CooperationStatus;
  created_at: string;
  updated_at: string;
}

export async function getCooperationClinics() {
  const response = await api.get<CooperationClinic[]>(
    "/veterinarian-cooperation/clinics",
  );

  return response.data;
}

export async function getMyCooperationRequests() {
  const response = await api.get<VeterinarianCooperationRequest[]>(
    "/veterinarian-cooperation/my-requests",
  );

  return response.data;
}

export async function sendCooperationRequest(clinicId: number) {
  const response = await api.post(
    "/veterinarian-cooperation/requests",
    { clinicId },
  );

  return response.data;
}
