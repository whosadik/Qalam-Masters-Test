// src/services/reviewAssignmentsService.js
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { withParams } from "@/lib/apiClient";

export async function listAssignments({
  article,
  reviewer,
  status,
  page_size = 200,
} = {}) {
  const url = withParams(API.REVIEW_ASSIGNMENTS, {
    article,
    reviewer,
    status,
    page_size,
  });
  const { data } = await http.get(url);
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}
export async function createAssignment({
  article,
  reviewer,
  due_at = null,
  blind = true,
}) {
  const { data } = await http.post(API.REVIEW_ASSIGNMENTS, {
    article,
    reviewer,
    due_at,
    blind,
  });
  return data;
}
export async function updateAssignment(id, payload) {
  const { data } = await http.patch(API.REVIEW_ASSIGNMENT_ID(id), payload);
  return data;
}
export async function deleteAssignment(id) {
  await http.delete(API.REVIEW_ASSIGNMENT_ID(id));
}
