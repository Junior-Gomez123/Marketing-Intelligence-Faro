import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const authApi = axios.create({ baseURL: `${API_BASE}/auth` });

export async function registerAccount({ name, email, password }) {
  const { data } = await authApi.post("/register", { name, email, password });
  return data;
}

export async function loginAccount({ email, password }) {
  const { data } = await authApi.post("/login", { email, password });
  return data;
}

export async function fetchMe(token) {
  const { data } = await authApi.get("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
