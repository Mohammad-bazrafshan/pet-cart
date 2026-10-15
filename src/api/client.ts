
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petcard.token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join("، ");
    }

    if (message) {
      return message;
    }

    if (!error.response) {
      return "ارتباط با سرور برقرار نشد. از روشن بودن بک‌اند مطمئن شو.";
    }
  }

  return "خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کن.";
}
