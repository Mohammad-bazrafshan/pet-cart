import { createContext } from "react";
import type { PetContextType } from "./PetContext";

export const PetContext = createContext<PetContextType | undefined>(undefined);
