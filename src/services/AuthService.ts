import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const registerUser = async (
  data: RegisterData
) => {
  const response = await axios.post<User>(
    `${API_URL}/auth/register`,
    data
  );

  return response.data;
};


export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await axios.post<User>(
    `${API_URL}/auth/login`,
    {
      email,
      password,
    }
  );

  return response.data;
};