import { api } from "../api/client";

export interface Reminder {
  id: number;
  pet_id: number;
  title: string;
  description: string | null;
  reminder_date: string;
  type: "vaccination" | "medication" | "appointment" | "general";
  is_completed: boolean;
  created_at: string;

  pet_name: string;
}

export interface CreateReminderData {
  pet_id: number;
  title: string;
  description?: string;
  reminder_date: string;
  type: "vaccination" | "medication" | "appointment" | "general";
}

export const getReminders = async () => {
  const response = await api.get<Reminder[]>("/reminders");

  return response.data;
};

export const createReminder = async (
  data: CreateReminderData
) => {
  const response = await api.post<Reminder>(
    "/reminders",
    data
  );

  return response.data;
};

export const updateReminderStatus = async (
  id: number,
  is_completed: boolean
) => {
  const response = await api.patch<Reminder>(
    `/reminders/${id}/status`,
    {
      is_completed,
    }
  );

  return response.data;
};

export const deleteReminder = async (id: number) => {
  const response = await api.delete(
    `/reminders/${id}`
  );

  return response.data;
};