import { api } from "@/lib/apiClient";

// list: ?mine=true&journal=ID&status=VALUE
export async function listArticles(params) {
  const { data } = await api.get("/api/articles/articles/", { params });
  return data; // массив
}

export async function getArticle(id) {
  const { data } = await api.get(`/api/articles/articles/${id}/`);
  return data;
}

export async function createArticle(payload) {
  const { data } = await api.post("/api/articles/articles/", payload);
  return data;
}

export async function updateArticle(id, payload) {
  const { data } = await api.patch(`/api/articles/articles/${id}/`, payload);
  return data;
}

export async function deleteArticle(id) {
  await api.delete(`/api/articles/articles/${id}/`);
}

export async function patchScreening(id, payload) {
  const { data } = await api.patch(
    `/api/articles/articles/${id}/screening/`,
    payload
  );
  return data;
}
