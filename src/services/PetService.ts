import { api } from "../api/client";

export interface Pet {
  id: number;
  owner_id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
}

export interface CreatePetData {
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
}

export const getPets = async () => {
  const response = await api.get<Pet[]>("/pets");

  return response.data;
};

export const getPetById = async (id: number) => {
  const response = await api.get<Pet>(`/pets/${id}`);

  return response.data;
};

export const createPet = async (pet: CreatePetData) => {
  const response = await api.post<Pet>("/pets", pet);

  return response.data;
};

export const deletePet = async (id: number) => {
  const response = await api.delete(`/pets/${id}`);

  return response.data;
};

export const updatePet = async (
  id: number,
  pet: Omit<CreatePetData, "id">
) => {
  const response = await api.put<Pet>(`/pets/${id}`, pet);

  return response.data;
};