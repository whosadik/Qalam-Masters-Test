const PROD_API = "https://api.qalam-masters.kz/api";

// распознаём продовый фронт (app.* и pages.dev превью)
const isProdHost =
  typeof window !== "undefined" &&
  (/^app\.qalam-masters\.kz$/.test(window.location.hostname) ||
   /\.qalam-masters-front\.pages\.dev$/.test(window.location.hostname));

// читаем из ENV (если задано при билде)
const RAW_ENV = (import.meta.env?.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

// если ENV пуст — на прод-хосте берём PROD_API, локально — "/api"
const RAW = RAW_ENV || (isProdHost ? PROD_API : "/api");

// превращаем в абсолютный URL при необходимости
export const BASE_URL = RAW.startsWith("http") ? RAW : `${window.location.origin}${RAW}`;

// Хелпер (как у тебя было)
const withBase = (p) => `${BASE_URL}${p}`;
// Полная карта эндпоинтов по твоей OpenAPI схеме
export const API = {
  // ===== USERS / AUTH =====
  TOKEN_OBTAIN: withBase(`/users/token/`), // POST {email, password} -> {access, refresh}
  TOKEN_REFRESH: withBase(`/users/token/refresh/`), // POST {refresh} -> {access}
  SIGNUP: withBase(`/users/signup/`), // POST
  ME: withBase(`/users/me/`), // GET
  USER_UPDATE: withBase(`/users/update/`), // PUT/PATCH
  USER_DELETE: withBase(`/users/delete/`), // DELETE

  // ===== ARTICLES =====
  ARTICLES: withBase(`/articles/articles/`), // GET(list: ?mine=&journal=&status=), POST(create)
  ARTICLE_ID: (id) => withBase(`/articles/articles/${id}/`), // GET/PUT/PATCH/DELETE
  ARTICLE_FILES: (id) => withBase(`/articles/articles/${id}/files/`), // GET/POST multipart
  ARTICLE_FILE_ID: (id, fileId) =>
    withBase(`/articles/articles/${id}/files/${fileId}/`), // DELETE
  ARTICLE_SCREENING: (id) => withBase(`/articles/articles/${id}/screening/`), // PATCH

  // ===== JOURNALS =====
  JOURNALS: withBase(`/journals/journals/`), // GET(list)/POST
  JOURNAL_ID: (id) => withBase(`/journals/journals/${id}/`), // GET/PUT/PATCH/DELETE
  JOURNAL_MEMBERSHIPS: withBase(`/journals/journal-memberships/`), // GET/POST
  JOURNAL_MEMBERSHIP_ID: (id) =>
    withBase(`/journals/journal-memberships/${id}/`), // GET/PUT/PATCH/DELETE

  // ===== ORGANIZATIONS =====
  ORGS: withBase(`/organizations/organizations/`), // GET(list)/POST
  ORG_ID: (id) => withBase(`/organizations/organizations/${id}/`), // GET/PUT/PATCH/DELETE
  ORG_MEMBERSHIPS: withBase(`/organizations/memberships/`), // GET/POST
  ORG_MEMBERSHIP_ID: (id) => withBase(`/organizations/memberships/${id}/`), // GET/PUT/PATCH/DELETE

  // ===== REVIEWS =====
  REVIEW_ASSIGNMENTS: withBase(`/reviews/assignments/`),
  REVIEW_ASSIGNMENT_ID: (id) => withBase(`/reviews/assignments/${id}/`),
  REVIEWS: withBase(`/reviews/reviews/`),
  REVIEW_ID: (id) => withBase(`/reviews/reviews/${id}/`),

  // ===== ISSUES (новые) =====
  ISSUES: withBase(`/issuesissues/`), // GET(list)/POST(create)
  ISSUE_ID: (id) => withBase(`/issuesissues/${id}/`), // GET/PATCH/DELETE
  ISSUE_ARTICLES: (id) => withBase(`/issuesissues/${id}/articles/`), // GET/POST (добавить в выпуск)
  ISSUE_ARTICLE_ID: (id, articleId) =>
    withBase(`/issuesissues/${id}/articles/${articleId}/`), // DELETE
  ISSUE_FILES: (id) => withBase(`/issuesissues/${id}/files/`), // GET/POST (аплоад PDF)
  ISSUE_PUBLISH: (id) => withBase(`/issuesissues/${id}/publish/`), // POST
  ISSUE_TOC: (id) => withBase(`/issuesissues/${id}/toc/`), // GET

  // ===== OPENAPI SCHEMA =====
  SCHEMA: withBase(`/schema/`), // GET
};
