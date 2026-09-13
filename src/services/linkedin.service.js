import axios from "axios";

// En local no hace falta configurar nada (cae en localhost:4000). En Vercel,
// definí VITE_API_BASE_URL en las Environment Variables del proyecto del
// frontend con la URL del backend desplegado, por ejemplo:
// https://marketing-intelligence-faro-backend.vercel.app
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// El backend monta estas rutas en la raiz ("/linkedin"), no bajo "/api"
// (ver backend/server.js), asi que usamos una instancia propia.
const linkedinApi = axios.create({
  baseURL: `${API_BASE}/linkedin`,
});

export function getLoginUrl() {
  return `${API_BASE}/linkedin/login`;
}

export async function uploadExport(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await linkedinApi.post("/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getActivity({ type = "", page = 1, limit = 25 } = {}) {
  const { data } = await linkedinApi.get("/activity", {
    params: { type: type || undefined, page, limit },
  });

  return data;
}

export async function getActivityStats() {
  const { data } = await linkedinApi.get("/activity/stats");
  return data;
}

export async function getRecommendations() {
  const { data } = await linkedinApi.get("/recommendations");
  return data;
}

export async function createPostMetric(payload) {
  const { data } = await linkedinApi.post("/post-metrics", payload);
  return data;
}

export async function getPostMetrics() {
  const { data } = await linkedinApi.get("/post-metrics");
  return data;
}

export async function deletePostMetric(id) {
  const { data } = await linkedinApi.delete(`/post-metrics/${id}`);
  return data;
}
