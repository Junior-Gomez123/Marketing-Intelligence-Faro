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

// Conectar la cuenta de LinkedIn del cliente. El backend devuelve la URL de
// autorizacion como JSON (en vez de redirigir el mismo) para que el pedido
// pueda llevar el Authorization: Bearer normal -- el redirect real del
// navegador lo hacemos aca, con window.location.href.
export async function getLinkedinConnectUrl(customerId) {
  const { data } = await api.get(customerPath(customerId, "/linkedin/connect-url"));
  return data;
}

export async function getLinkedinStatus(customerId) {
  const { data } = await api.get(customerPath(customerId, "/linkedin/status"));
  return data;
}

export async function disconnectLinkedin(customerId) {
  const { data } = await api.delete(customerPath(customerId, "/linkedin"));
  return data;
}

export async function publishLinkedinPost(customerId, text) {
  const { data } = await api.post(customerPath(customerId, "/linkedin/publish"), { text });
  return data;
}

export async function getPostSuggestion(customerId) {
  const { data } = await api.get(customerPath(customerId, "/suggestions/post"));
  return data;
}
