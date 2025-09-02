// 1) Полный URL: https://api.qalam-masters.kz/api
// 2) Относительный путь: /api
const RAW = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

// Превращаем в абсолютный base (важно для new URL())
export const BASE_URL = RAW.startsWith("http")
  ? RAW // уже полный URL без завершающих слешей
  : window.location.origin + RAW; // например http://localhost:5173 + /api => http://localhost:5173/api

// Хелпер на всякий случай (вдруг понадобится где-то снаружи)
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

  // ===== OPENAPI SCHEMA =====
  SCHEMA: withBase(`/schema/`), // GET
};
