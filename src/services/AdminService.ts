import { api } from "../api/client";

export interface AdminDashboardStats {
  users: number;
  clinics: number;
  veterinarians: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AdminClinic {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  created_at: string;
  manager_name?: string | null;
  province?: string | null;
  city?: string | null;
  vet_license_number?: string | null;
  veterinarians_count?: number;
}

export interface AdminClinicDetails extends AdminClinic {
  veterinarians: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
    license_number: string | null;
    specialty: string | null;
  }[];
}

export interface AvailableVeterinarian {
  id: number;
  name: string;
  email: string;
}

export interface CreateClinicData {
  name: string;
  phone?: string;
  address?: string;
  description?: string;
}

export interface CreateVeterinarianData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
  specialty: string;
  clinicId: number;
}
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get<AdminDashboardStats>("/admin/dashboard");

  return response.data;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>("/admin/users");

  return response.data;
}

export async function updateAdminUserRole(
  userId: number,
  role: string,
): Promise<AdminUser> {
  const response = await api.patch<{ user: AdminUser }>(
    `/admin/users/${userId}/role`,
    {
      role,
    },
  );

  return response.data.user;
}

export async function getAdminClinics(): Promise<AdminClinic[]> {
  const response = await api.get<AdminClinic[]>("/admin/clinics");

  return response.data;
}
export async function getAdminClinicDetails(
  clinicId: number,
): Promise<AdminClinicDetails> {
  const response = await api.get<AdminClinicDetails>(
    `/admin/clinics/${clinicId}`,
  );

  return response.data;
}
export async function getAvailableVeterinarians(): Promise<
  AvailableVeterinarian[]
> {
  const response = await api.get<AvailableVeterinarian[]>(
    "/admin/veterinarians/available",
  );

  return response.data;
}

export async function assignVeterinarianToClinic(
  clinicId: number,
  userId: number,
  specialty: string,
): Promise<void> {
  await api.post(`/admin/clinics/${clinicId}/veterinarians`, {
    userId,
    specialty,
  });
}

export async function createAdminClinic(
  data: CreateClinicData,
): Promise<AdminClinic> {
  const response = await api.post<{
    message: string;
    clinic: AdminClinic;
  }>("/admin/clinics", data);

  return response.data.clinic;
}

export async function updateAdminClinic(
  clinicId: number,
  data: CreateClinicData,
): Promise<AdminClinic> {
  const response = await api.patch<{
    message: string;
    clinic: AdminClinic;
  }>(`/admin/clinics/${clinicId}`, data);

  return response.data.clinic;
}

export async function createAdminVeterinarian(data: CreateVeterinarianData) {
  const response = await api.post("/admin/veterinarians", data);

  return response.data;
}
