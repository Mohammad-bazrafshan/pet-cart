import { api } from "../api/client";
export interface ClinicMedicalRecord {
  id: number;
  pet_id: number;
  title: string;
  description: string | null;
  record_type: string;
  record_date: string;
  created_at: string;
}

export interface ClinicVaccination {
  id: number;
  pet_id: number;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
  description: string | null;
  created_at: string;
}

export interface CreateClinicVaccinationData {
  vaccine_name: string;
  vaccination_date: string;
  next_due_date?: string;
  description?: string;
}
export interface ClinicPatient {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  gender: string | null;
  owner_name: string;
  owner_email: string;
}

export const getClinicPatients = async () => {
  const response = await api.get<ClinicPatient[]>(
    "/appointments/clinic/patients"
  );

  return response.data;
};

export const getClinicPatientById = async (id: number) => {
  const response = await api.get<ClinicPatient>(
    `/appointments/clinic/patients/${id}`
  );

  return response.data;
};




export const getClinicMedicalRecords = async (
  petId: number
) => {
  const response = await api.get<ClinicMedicalRecord[]>(
    `/clinic/patients/${petId}/records`
  );

  return response.data;
};

export interface CreateClinicMedicalRecordData {
  title: string;
  description?: string;
  record_type: string;
  record_date: string;
}

export const createClinicMedicalRecord = async (
  petId: number,
  data: CreateClinicMedicalRecordData
) => {
  const response = await api.post<ClinicMedicalRecord>(
    `/clinic/patients/${petId}/records`,
    data
  );

  return response.data;
};

export const getClinicVaccinations = async (
  petId: number
) => {
  const response = await api.get<ClinicVaccination[]>(
    `/clinic/patients/${petId}/vaccinations`
  );

  return response.data;
};

export const createClinicVaccination = async (
  petId: number,
  data: CreateClinicVaccinationData
) => {
  const response = await api.post<ClinicVaccination>(
    `/clinic/patients/${petId}/vaccinations`,
    data
  );

  return response.data;
};