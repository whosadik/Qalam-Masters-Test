// src/services/articlesService.js
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

// список статей (массив)
export async function listArticles({ mine, journal, status } = {}) {
  const url = withParams(API.ARTICLES, {
    mine: mine ? "true" : undefined,
    journal: journal || undefined,
    status: status || undefined,
  });
  const { data } = await http.get(url);
  return data; // array of Article
}

// создать черновик / статью
export async function createArticle(payload) {
  // payload: {title, journal, status?}
  const { data } = await http.post(API.ARTICLES, payload);
  return data;
}

// получить одну статью
export async function getArticle(id) {
  const { data } = await http.get(API.ARTICLE_ID(id));
  return data;
}

// обновить статью (put/patch)
export async function updateArticle(id, payload, method = "patch") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.ARTICLE_ID(id), payload);
  return data;
}

// удалить статью
export async function deleteArticle(id) {
  await http.delete(API.ARTICLE_ID(id));
}

// изменить статус/скрининг
export async function patchScreening(id, payload) {
  // payload может включать { status: 'screening' } или иные поля PatchedArticle
  const { data } = await http.patch(API.ARTICLE_SCREEN(id), payload);
  return data;
}
