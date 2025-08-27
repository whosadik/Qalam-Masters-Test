// ВАЖНО: все пути со слешем в конце, как в OpenAPI
export const BASE_URL = import.meta.env.VITE_API_BASE_URL
export const API = {
  // ===== USERS / AUTH =====
  TOKEN_OBTAIN:    `${BASE_URL}/users/token/`,           // POST {email, password} -> {access, refresh}
  TOKEN_REFRESH:   `${BASE_URL}/users/token/refresh/`,   // POST {refresh} -> {access}
  SIGNUP:          `${BASE_URL}/users/signup/`,          // POST
  ME:              `${BASE_URL}/users/me/`,              // GET
  USER_UPDATE:     `${BASE_URL}/users/update/`,          // PUT/PATCH
  USER_DELETE:     `${BASE_URL}/users/delete/`,          // DELETE

  // ===== ARTICLES =====
  ARTICLES:        `${BASE_URL}/articles/articles/`,           // GET(list, ?mine=&journal=&status=), POST(create)
  ARTICLE_ID:      (id) => `${BASE_URL}/articles/articles/${id}/`, // GET/PUT/PATCH/DELETE
  ARTICLE_SCREEN:  (id) => `${BASE_URL}/articles/articles/${id}/screening/`, // PATCH (screening)

  // ===== JOURNALS =====
  JOURNALS:        `${BASE_URL}/journals/journals/`,           // GET(list paginated + search/order/page/page_size), POST
  JOURNAL_ID:      (id) => `${BASE_URL}/journals/journals/${id}/`, // GET/PUT/PATCH/DELETE

  JOURNAL_MEMBERSHIPS:   `${BASE_URL}/journals/journal-memberships/`,       // GET/POST
  JOURNAL_MEMBERSHIP_ID: (id) => `${BASE_URL}/journals/journal-memberships/${id}/`, // GET/PUT/PATCH/DELETE

  // ===== ORGANIZATIONS =====
  ORGS:            `${BASE_URL}/organizations/organizations/`,              // GET(list)/POST
  ORG_ID:          (id) => `${BASE_URL}/organizations/organizations/${id}/`, // GET/PUT/PATCH/DELETE

  ORG_MEMBERSHIPS:       `${BASE_URL}/organizations/memberships/`,               // GET/POST
  ORG_MEMBERSHIP_ID:     (id) => `${BASE_URL}/organizations/memberships/${id}/`, // GET/PUT/PATCH/DELETE

  // ===== OPENAPI SCHEMA 
  SCHEMA:          `${BASE_URL}/schema/`, // GET
};
