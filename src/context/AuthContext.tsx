import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { api, getApiErrorMessage } from "../api/client";
import { AuthContext } from "./AuthContextValue";
export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role?: string;
  demo?: boolean;
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface RegistrationData extends AuthCredentials {
  name: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}
export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (details: RegistrationData) => Promise<void>;
  logout: () => void;
  enterDemo: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

function saveSession(response: AxiosResponse<AuthResponse>) {
  return response.data.user;
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log("API URL:", import.meta.env.VITE_API_URL);
  const demoAllowed = import.meta.env.DEV;
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (
      !demoAllowed ||
      sessionStorage.getItem("petcart.demoSession") !== "true"
    )
      return null;
    return {
      id: "demo-owner",
      name: "کاربر مهمان",
      email: "demo@petcart.local",
      demo: true,
    };
  });
  const [loading, setLoading] = useState(
    () =>
      !(
        demoAllowed && sessionStorage.getItem("petcart.demoSession") === "true"
      ),
  );

  useEffect(() => {
    let active = true;

    if (
      demoAllowed &&
      sessionStorage.getItem("petcart.demoSession") === "true"
    ) {
      return () => {
        active = false;
      };
    }

    api
      .get<AuthUser>("/auth/me")
      .then(({ data }) => {
        if (
          active &&
          !(
            demoAllowed &&
            sessionStorage.getItem("petcart.demoSession") === "true"
          )
        ) {
          setUser(data);
        }
      })
      .catch((error: unknown) => {
        if (
          active &&
          !(axios.isAxiosError(error) && error.response?.status === 401)
        ) {
          console.error(
            "Unable to restore the PetCart session:",
            getApiErrorMessage(error),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [demoAllowed]);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);

    sessionStorage.removeItem("petcart.demoSession");

    localStorage.setItem("petcard.token", response.data.token);

    setUser(response.data.user);
  }, []);
  const register = useCallback(async (details: RegistrationData) => {
    const response = await api.post<AuthResponse>("/auth/register", details);

    sessionStorage.removeItem("petcart.demoSession");

    localStorage.setItem("petcard.token", response.data.token);

    setUser(response.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("petcard.token");
    sessionStorage.removeItem("petcart.demoSession");

    setUser(null);
  }, []);

  const enterDemo = useCallback(() => {
    if (!demoAllowed) return;
    sessionStorage.setItem("petcart.demoSession", "true");
    setUser({
      id: "demo-owner",
      name: "کاربر مهمان",
      email: "demo@petcart.local",
      demo: true,
    });
  }, [demoAllowed]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, enterDemo }),
    [user, loading, login, register, logout, enterDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
