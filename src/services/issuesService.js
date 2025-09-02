// src/services/issuesService.js
import { http, withParams } from "@/lib/apiClient";
import { listArticles, updateArticleStatus } from "@/services/articlesService";

export const ISSUE_PREFIX = "[ISSUE]";

// маленький хелпер — не допустим двойной префикс и лишние пробелы
export function buildIssueTitle(label = "") {
  const clean = String(label).trim().replace(/\s+/g, " ");
  return `${ISSUE_PREFIX} ${clean}`.trim();
}

export const ISSUE_STATUS_FLOW = [
  "draft",
  "submitted",
  "screening",
  "under_review",
  "accepted",
  "in_production",
  "published",
];

// создать выпуск
export async function createIssueArticle(journalId, label) {
  const { data } = await http.post("/articles/articles/", {
    title: buildIssueTitle(label),
    journal: Number(journalId),
  });

  return data;
}

 
// перечислить выпуски: тянем все по поиску [ISSUE], а статусы не режем на уровне запроса
export async function listIssues(journalId) {
  const res = await listArticles({
    journal: journalId,
    ordering: "-created_at",
    page_size: 200,
    search: ISSUE_PREFIX,
  });
  const norm = (x) => (Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : []);
  const rows = norm(res).filter(a => String(a?.title || "").startsWith(ISSUE_PREFIX));
  // можно (опционально) приоритизировать незавершённые выпуски
  const order = { in_production: 0, accepted: 1, submitted: 2, draft: 3, published: 4, rejected: 5 };
  rows.sort((a, b) => (order[a.status] ?? 99) - (order[b.status] ?? 99) || new Date(b.created_at) - new Date(a.created_at));
  return rows;
}

export async function getIssue(issueId) {
  const { data } = await http.get(`/articles/articles/${issueId}/`);
  return data;
}


export async function advanceIssueTo(issueId, targetStatus) {
  const flow = ISSUE_STATUS_FLOW;
  const targetIdx = flow.indexOf(targetStatus);
  if (targetIdx === -1) throw new Error(`Unknown target status: ${targetStatus}`);

  // узнаём текущий
  let cur = (await getIssue(issueId))?.status || "draft";
  let curIdx = flow.indexOf(cur);
  if (curIdx === -1) curIdx = 0;

  for (let i = curIdx + 1; i <= targetIdx; i++) {
    const next = flow[i];
    try {
      await updateArticleStatus(issueId, next);
    } catch (e) {
      const code = e?.response?.status;
      const msg = e?.response?.data?.detail || e?.response?.data || e?.message || "transition failed";
      throw new Error(`Не удалось перейти ${flow[i - 1]} → ${next}${code ? ` (HTTP ${code})` : ""}. ${msg}`);
    }
  }
  return getIssue(issueId);
}
export async function forceIssueToProduction(issueId) {
  const steps = ["submitted","screening","under_review","accepted","in_production"];
  for (const st of steps) {
    try { await updateArticleStatus(issueId, st); } catch { /* ignore */ }
  }
  return getIssue(issueId);
}


// получить только URL production_pdf (как у тебя)
export async function getIssuePdfUrl(issueId) {
  const rows = await getIssueFiles(issueId);
  const prod = rows.find((x) => String(x.type) === "production_pdf");
  return prod ? prod.file : null;
}




// загрузить production_pdf
export async function uploadIssuePdf(issueId, file) {
  const fd = new FormData();
  fd.append("type", "production_pdf");
  fd.append("file", file);
  const { data } = await http.post(`/articles/articles/${issueId}/files/`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// (опционально) удалить файл выпуска — пригодится для «перезалить»
export async function deleteIssueFile(issueId, fileId) {
  await http.delete(`/articles/articles/${issueId}/files/${fileId}/`);
}
export const publishIssueStrict = (issueId) => advanceIssueTo(issueId, "published");
export const moveIssueToProductionStrict = (issueId) => advanceIssueTo(issueId, "in_production");

// красивый заголовок без префикса
export const prettyIssueTitle = (title = "") =>
  title.startsWith(ISSUE_PREFIX) ? title.slice(ISSUE_PREFIX.length).trim() : title;
