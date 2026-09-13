import axios from "axios";

// En local no hace falta configurar nada (cae en localhost:4000). En Vercel,
// definí VITE_API_BASE_URL en las Environment Variables del proyecto del
// frontend con la URL del backend desplegado, por ejemplo:
// https://marketing-intelligence-faro-backend.vercel.app
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const TOKEN_KEY = "faro_token";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function customerPath(customerId, path) {
  return `/customers/${customerId}${path}`;
}

export async function uploadExport(customerId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(customerPath(customerId, "/import"), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getActivity(customerId, { type = "", page = 1, limit = 25 } = {}) {
  const { data } = await api.get(customerPath(customerId, "/activity"), {
    params: { type: type || undefined, page, limit },
  });

  return data;
}

export async function getActivityStats(customerId) {
  const { data } = await api.get(customerPath(customerId, "/activity/stats"));
  return data;
}

export async function getRecommendations(customerId) {
  const { data } = await api.get(customerPath(customerId, "/recommendations"));
  return data;
}

export async function createPostMetric(customerId, payload) {
  const { data } = await api.post(customerPath(customerId, "/post-metrics"), payload);
  return data;
}

export async function getPostMetrics(customerId) {
  const { data } = await api.get(customerPath(customerId, "/post-metrics"));
  return data;
}

export async function deletePostMetric(customerId, id) {
  const { data } = await api.delete(customerPath(customerId, `/post-metrics/${id}`));
  return data;
}

// El flujo de "Conectar con LinkedIn" (OAuth) sigue siendo un tema aparte, sin
// atar todavia a un cliente especifico.
export function getLoginUrl() {
  return `${API_BASE}/linkedin/login`;
}
