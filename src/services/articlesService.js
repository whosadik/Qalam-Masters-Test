// src/services/articlesService.js
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

/* ── helpers ─────────────────────────────────────────────── */
function isSet(v) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}
function toBoolStr(v) {
  return String(Boolean(v)); // "true"/"false"
}

export async function updateArticleStatus(id, status) {
  const { data } = await http.patch(API.ARTICLE_ID(id), { status });
  return data;
}

/** Полный submit-драфта: проверяет файл и переводит в submitted */
export async function submitDraftArticle({
  id,
  manuscriptFile,
  extraFiles = {},
}) {
  // 1) обязательный файл (рукопись)
  if (!manuscriptFile)
    throw new Error("Прикрепите файл рукописи (PDF/DOC/DOCX).");

  // 2) грузим файлы
  const uploads = [];
  uploads.push(uploadArticleFile(id, manuscriptFile, "manuscript"));

  if (extraFiles.zgs)
    uploads.push(uploadArticleFile(id, extraFiles.zgs, "zgs"));
  if (extraFiles.antiplag_report)
    uploads.push(
      uploadArticleFile(id, extraFiles.antiplag_report, "antiplag_report")
    );
  if (extraFiles.supplements?.length) {
    for (const f of extraFiles.supplements) {
      uploads.push(uploadArticleFile(id, f, "supplement"));
    }
  }

  await Promise.all(uploads);

  // 3) переводим в submitted
  return updateArticleStatus(id, "submitted");
}

/** Нормализуем параметры под OpenAPI и не шлём пустяки */
function normalizeListParams(params = {}) {
  const out = {};
  const { journal, status, mine, ordering, page, page_size, search } =
    params || {};

  // Жёсткая проверка на число — исключаем NaN
  if (Number.isFinite(Number(journal))) out.journal = Number(journal);
  if (isSet(status)) out.status = String(status);
  if (mine !== undefined) out.mine = toBoolStr(mine);
  if (isSet(ordering)) out.ordering = String(ordering);
  if (Number.isFinite(Number(page))) out.page = Number(page);
  if (Number.isFinite(Number(page_size))) out.page_size = Number(page_size);
  if (isSet(search)) out.search = String(search);

  return out;
}

/** Пагинированный список (унифицируем ответ) */
export async function listArticlesPaginated(params = {}) {
  const q = normalizeListParams(params);
  const url = withParams(API.ARTICLES, q);
  const { data } = await http.get(url);

  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  if (Array.isArray(data?.results)) return data;

  return { count: 0, next: null, previous: null, results: [] };
}

/** Упрощённый список (только массив results) */
export async function listArticles(params = {}) {
  const page = await listArticlesPaginated(params);
  return page.results;
}

/** Собрать все страницы */
export async function listAllArticles(params = {}, { maxPages = 50 } = {}) {
  const q = normalizeListParams(params);
  let page = 1;
  const acc = [];

  for (let i = 0; i < maxPages; i++) {
    const url = withParams(API.ARTICLES, { ...q, page });
    const { data } = await http.get(url);
    const chunk = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];
    acc.push(...chunk);

    const hasNext =
      data && typeof data.next === "string" && data.next && chunk.length > 0;
    if (!hasNext) break;
    page += 1;
  }

  return acc;
}

/** Получить одну статью */
export async function getArticle(id) {
  const { data } = await http.get(API.ARTICLE_ID(id));
  return data;
}

/** Создать статью (JSON или FormData) */
export async function createArticle(payloadOrFD) {
  const isFD =
    typeof FormData !== "undefined" && payloadOrFD instanceof FormData;
  const { data } = await http.post(API.ARTICLES, payloadOrFD, {
    headers: isFD ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return data;
}

/** Обновить статью (PUT/PATCH) */
export async function updateArticle(id, payload, method = "patch") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.ARTICLE_ID(id), payload);
  return data;
}

/** Удалить статью */
export async function deleteArticle(id) {
  await http.delete(API.ARTICLE_ID(id));
}

/** Скрининг статьи */
export async function patchScreening(id, payload) {
  const { data } = await http.patch(API.ARTICLE_SCREENING(id), payload);
  return data;
}

/** Список файлов статьи */
export async function listArticleFiles(id, params = {}) {
  const url = withParams(API.ARTICLE_FILES(id), params || {});
  const { data } = await http.get(url);
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
}

export async function uploadProductionPdf(articleId, file) {
  const form = new FormData();
  form.append("type", "production_pdf");
  form.append("file", file);
  const { data } = await http.post(API.ARTICLE_FILES(articleId), form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Загрузка файла к статье */
export async function uploadArticleFile(id, file, type, { signal } = {}) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("type", type);
  const { data } = await http.post(API.ARTICLE_FILES(id), fd, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
  return data;
}

/** Удалить файл статьи */
export async function deleteArticleFile(id, fileId) {
  await http.delete(API.ARTICLE_FILE_ID(id, fileId));
}
