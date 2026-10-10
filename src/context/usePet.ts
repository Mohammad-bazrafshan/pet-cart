import { useContext } from "react";
import { PetContext } from "./PetContextValue";

export function usePet() {
  const context = useContext(PetContext);

  if (!context) {
    throw new Error("usePet must be used inside PetProvider");
  }

  return context;
}
