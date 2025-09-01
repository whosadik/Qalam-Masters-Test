// src/services/reviewsService.js
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

/** Создать назначение рецензента (POST /reviews/assignments/) */
export async function createAssignment({ article, reviewer, due_at, blind }) {
  const payload = {
    article: Number(article),
    reviewer: Number(reviewer),
    blind: Boolean(blind),
  };
  if (due_at) payload.due_at = due_at; // ISO-string, например 2025-09-15T23:59:00Z

  const { data } = await http.post(API.REVIEW_ASSIGNMENTS, payload);
  return data;
}

/** Список назначений (GET /reviews/assignments/?article=&reviewer=&status=) */
export async function listAssignments(params = {}) {
  const { data } = await http.get(API.REVIEW_ASSIGNMENTS, { params });
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

/** (опционально) Обновить назначение (PATCH /reviews/assignments/{id}/) */
export async function updateAssignment(id, partial) {
  const { data } = await http.patch(API.REVIEW_ASSIGNMENT_ID(id), partial);
  return data;
}

/** (опционально) Удалить назначение (DELETE /reviews/assignments/{id}/) */
export async function deleteAssignment(id) {
  await http.delete(API.REVIEW_ASSIGNMENT_ID(id));
}
