// src/services/issuesService.js
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

// ===== МОДЕЛЬ: Issue =====
// { id, journal, label, status: 'draft'|'in_production'|'published', pdf, published_at, created_by, created_at, items[] }

export async function listIssues(
  journalId,
  { page_size = 200, ordering = "-created_at" } = {}
) {
  const url = withParams(API.ISSUES, { page_size, ordering });
  const { data } = await http.get(url);
  const rows = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
  // фильтруем по журналу на клиенте (в схеме фильтра по journal нет)
  return journalId
    ? rows.filter((i) => Number(i.journal) === Number(journalId))
    : rows;
}

export async function getIssue(issueId) {
  const { data } = await http.get(API.ISSUE_ID(issueId));
  return data;
}

export async function createIssue(journalId, label) {
  const body = new URLSearchParams();
  body.append("journal", String(journalId));
  body.append("label", String(label).trim());

  const { data } = await http.post(API.ISSUES, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function addArticleToIssue(
  issueId,
  { article, order = 0, start_page = null, end_page = null }
) {
  const body = new URLSearchParams();
  body.append("article", String(article));
  body.append("order", String(order));
  if (start_page != null) body.append("start_page", String(start_page));
  if (end_page != null) body.append("end_page", String(end_page));

  const { data } = await http.post(API.ISSUE_ARTICLES(issueId), body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data; // IssueItem
}

export async function removeArticleFromIssue(issueId, articleId) {
  await http.delete(API.ISSUE_ARTICLE_ID(issueId, articleId));
}

export async function listIssueArticles(issueId) {
  const { data } = await http.get(API.ISSUE_ARTICLES(issueId));
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function getNextOrder(issueId) {
  const items = await listIssueArticles(issueId);
  if (!items.length) return 10;
  const maxOrder = Math.max(...items.map((x) => Number(x.order || 0)));
  return maxOrder + 10; // шаг 10, чтобы было куда вставлять между
}
// файлы выпуска
export async function uploadIssuePdf(
  issueId,
  file,
  { includeType = true } = {}
) {
  const fd = new FormData();
  if (includeType) fd.append("type", "issue_pdf"); // у вас работает и без, но поле не мешает
  fd.append("file", file);
  const { data } = await http.post(API.ISSUE_FILES(issueId), fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // сервер может вернуть либо весь Issue, либо объект с { pdf: url }
  if (data?.pdf) return data.pdf;
  const fresh = await getIssue(issueId);
  return fresh?.pdf ?? null;
}

export async function publishIssue(issueId) {
  const { data } = await http.post(API.ISSUE_PUBLISH(issueId));
  return data; // Issue со статусом published
}

export async function getIssueToc(issueId) {
  const { data } = await http.get(API.ISSUE_TOC(issueId));
  return data; // { journal, label, items: [...] }
}
