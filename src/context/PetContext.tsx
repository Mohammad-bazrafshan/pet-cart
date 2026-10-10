import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, getApiErrorMessage } from "../api/client";
import { useAuth } from "./useAuth";
import { PetContext } from "./PetContextValue";

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
}

export interface PetContextType {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  addPet: (pet: Omit<Pet, "id">) => Promise<void>;
  refreshPets: () => Promise<void>;
}

interface PetState {
  ownerId: string | null;
  pets: Pet[];
  loading: boolean;
  error: string | null;
}

interface PetProviderProps {
  children: ReactNode;
}

export function PetProvider({ children }: PetProviderProps) {
  const { user } = useAuth();
  const [state, setState] = useState<PetState>({
    ownerId: null,
    pets: [],
    loading: false,
    error: null,
  });

  const refreshPets = useCallback(async () => {
    if (!user) {
      return;
    }

    const ownerId = user.id;
    if (user.demo) {
      const demoPets: Pet[] = [
        { id: "demo-max", name: "مکس", type: "سگ", breed: "گلدن رتریور", age: 3, weight: 12, gender: "نر" },
        { id: "demo-milo", name: "میلو", type: "گربه", breed: "پرشین", age: 2, weight: 4, gender: "نر" },
      ];
      setState({ ownerId, pets: demoPets, loading: false, error: null });
      return;
    }

    setState((current) => current.ownerId === ownerId
      ? { ...current, loading: true, error: null }
      : { ownerId, pets: [], loading: true, error: null });
    try {
      const response = await api.get<Pet[]>("/pets");
      setState((current) => current.ownerId === ownerId
        ? { ...current, pets: response.data, error: null }
        : current);
    } catch (requestError) {
      setState((current) => current.ownerId === ownerId
        ? { ...current, error: getApiErrorMessage(requestError) }
        : current);
      throw requestError;
    } finally {
      setState((current) => current.ownerId === ownerId
        ? { ...current, loading: false }
        : current);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refreshPets().catch((requestError: unknown) => {
      console.error("Unable to load pets from the API:", requestError);
    });
  }, [user, refreshPets]);

  const addPet = async (pet: Omit<Pet, "id">) => {
    if (!user) {
      throw new Error("You must be signed in to add a pet.");
    }
    const ownerId = user.id;
    if (user.demo) {
      const newPet = { ...pet, id: `demo-${crypto.randomUUID()}` };
      setState((current) => current.ownerId === ownerId
        ? { ...current, pets: [...current.pets, newPet] }
        : current);
      return;
    }

    setState((current) => current.ownerId === ownerId
      ? { ...current, error: null }
      : current);
    try {
      const response = await api.post<Pet>("/pets", pet);
      setState((current) => current.ownerId === ownerId
        ? { ...current, pets: [...current.pets, response.data] }
        : current);
    } catch (requestError) {
      setState((current) => current.ownerId === ownerId
        ? { ...current, error: getApiErrorMessage(requestError) }
        : current);
      throw requestError;
    }
  };

  const currentState = user && state.ownerId === user.id
    ? state
    : { ownerId: user?.id ?? null, pets: [], loading: Boolean(user), error: null };

  return (
    <PetContext.Provider value={{ ...currentState, addPet, refreshPets }}>
      {children}
    </PetContext.Provider>
  );
}
