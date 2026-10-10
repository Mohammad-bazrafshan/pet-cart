import { createContext } from "react";
import type { AuthContextValue } from "./AuthContext";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  demo?: boolean;
}