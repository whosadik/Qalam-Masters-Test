
export const API = {
  // ===== USERS / AUTH =====
  TOKEN_OBTAIN:    `/api/users/token/`,           // POST {email, password} -> {access, refresh}
  TOKEN_REFRESH:   `/api/users/token/refresh/`,   // POST {refresh} -> {access}
  SIGNUP:          `/api/users/signup/`,          // POST
  ME:              `/api/users/me/`,              // GET
  USER_UPDATE:     `/api/users/update/`,          // PUT/PATCH
  USER_DELETE:     `/api/users/delete/`,          // DELETE

  // ===== ARTICLES =====
  ARTICLES:        `/api/articles/articles/`,           // GET(list, ?mine=&journal=&status=), POST(create)
  ARTICLE_ID:      (id) => `/api/articles/articles/${id}/`, // GET/PUT/PATCH/DELETE
  ARTICLE_SCREEN:  (id) => `/api/articles/articles/${id}/screening/`, // PATCH (screening)

  // ===== JOURNALS =====
  JOURNALS:        `/api/journals/journals/`,           // GET(list paginated + search/order/page/page_size), POST
  JOURNAL_ID:      (id) => `/api/journals/journals/${id}/`, // GET/PUT/PATCH/DELETE

  JOURNAL_MEMBERSHIPS:   `/api/journals/journal-memberships/`,       // GET/POST
  JOURNAL_MEMBERSHIP_ID: (id) => `/api/journals/journal-memberships/${id}/`, // GET/PUT/PATCH/DELETE

  // ===== ORGANIZATIONS =====
  ORGS:            `/api/organizations/organizations/`,              // GET(list)/POST
  ORG_ID:          (id) => `/api/organizations/organizations/${id}/`, // GET/PUT/PATCH/DELETE

  ORG_MEMBERSHIPS:       `/api/organizations/memberships/`,               // GET/POST
  ORG_MEMBERSHIP_ID:     (id) => `/api/organizations/memberships/${id}/`, // GET/PUT/PATCH/DELETE

  // ===== OPENAPI SCHEMA (если пригодится)
  SCHEMA:          `/api/schema/`, // GET
};
