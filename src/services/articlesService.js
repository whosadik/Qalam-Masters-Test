import { http, withParams } from "@/lib/http";
import { API } from "@/constants/api";

// GET ?mine=true&journal=ID&status=VALUE (+ page/page_size если есть пагинация)
export async function listArticles({ mine, journal, status, page, page_size } = {}) {
  const url = withParams(API.ARTICLES, { mine, journal, status, page, page_size });
  const { data } = await http.get(url);
  return data; // может быть массив или пагинация — обработай на уровне UI
}

export async function createArticle(payload) {
  const { data } = await http.post(API.ARTICLES, payload);
  return data;
}

export async function getArticle(id) {
  const { data } = await http.get(API.ARTICLE_ID(id));
  return data;
}

export async function updateArticle(id, payload, method = "put") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.ARTICLE_ID(id), payload);
  return data;
}

export async function deleteArticle(id) {
  await http.delete(API.ARTICLE_ID(id));
}

// screening partial update
export async function screeningArticle(id, payload) {
  const { data } = await http.patch(API.ARTICLE_SCREEN(id), payload);
  return data;
}
