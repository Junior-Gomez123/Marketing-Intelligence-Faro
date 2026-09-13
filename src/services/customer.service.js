import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const TOKEN_KEY = "faro_token";

const customersApi = axios.create({ baseURL: `${API_BASE}/customers` });

customersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function listCustomers() {
  const { data } = await customersApi.get("/");
  return data.items;
}

export async function createCustomer({ companyName, contactEmail = "" }) {
  const { data } = await customersApi.post("/", { companyName, contactEmail });
  return data;
}

export async function updateCustomer(id, payload) {
  const { data } = await customersApi.patch(`/${id}`, payload);
  return data;
}

export async function deleteCustomer(id) {
  const { data } = await customersApi.delete(`/${id}`);
  return data;
}
