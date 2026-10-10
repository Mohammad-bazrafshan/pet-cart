import { api } from "../api/client";

export interface Vaccination {
  id: number;
  pet_id: number;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
  description: string | null;
  created_at: string;
}

export interface CreateVaccinationData {
  vaccine_name: string;
  vaccination_date: string;
  next_due_date?: string;
  description?: string;
}

export const getVaccinations = async (petId: number) => {
  const response = await api.get<Vaccination[]>(
    `/pets/${petId}/vaccinations`
  );

  return response.data;
};

export const createVaccination = async (
  petId: number,
  data: CreateVaccinationData
) => {
  const response = await api.post<Vaccination>(
    `/pets/${petId}/vaccinations`,
    data
  );

  return response.data;
};