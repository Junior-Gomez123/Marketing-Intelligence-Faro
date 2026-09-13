import axios from "axios";

// El backend monta estas rutas en la raiz ("/linkedin"), no bajo "/api"
// (ver backend/server.js), asi que usamos una instancia propia.
const linkedinApi = axios.create({
  baseURL: "http://localhost:4000/linkedin",
});

export function getLoginUrl() {
  return "http://localhost:4000/linkedin/login";
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
