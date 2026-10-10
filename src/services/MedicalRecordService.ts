import { api } from "../api/client";

export interface MedicalRecord {
  id: number;
  pet_id: number;
  title: string;
  description: string;
  record_type: string;
  record_date: string;
  created_at: string;
}

export interface CreateMedicalRecordData {
  title: string;
  description: string;
  record_type: string;
  record_date: string;
}

export const getMedicalRecords = async (petId: number) => {
  const response = await api.get<MedicalRecord[]>(
    `/pets/${petId}/records`
  );

  return response.data;
};

export const createMedicalRecord = async (
  petId: number,
  data: CreateMedicalRecordData
) => {
  const response = await api.post<MedicalRecord>(
    `/pets/${petId}/records`,
    data
  );

  return response.data;
};