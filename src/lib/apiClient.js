import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/,'') || "";
console.log("API BASE URL:", BASE_URL);


// ===== tokens in localStorage =====
const ACCESS_KEY = "qm_access_token";
const REFRESH_KEY = "qm_refresh_token";
export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS_KEY); },
  set access(v) { v ? localStorage.setItem(ACCESS_KEY, v) : localStorage.removeItem(ACCESS_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set refresh(v) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY); },
  clear() { this.access = null; this.refresh = null; },
};

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: false,
});

// добавляем Authorization
http.interceptors.request.use((config) => {
  const t = tokenStore.access;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// refresh логика
let isRefreshing = false;
let subscribers = [];
const onRefreshed = (token) => subscribers.forEach(cb => cb(token));
const subscribeTokenRefresh = (cb) => subscribers.push(cb);

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original._retry && tokenStore.refresh) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/users/token/refresh/`,
          { refresh: tokenStore.refresh }
        );
        const newAccess = data?.access;
        tokenStore.access = newAccess;

        isRefreshing = false;
        onRefreshed(newAccess);
        subscribers = [];

        original.headers.Authorization = `Bearer ${newAccess}`;
        return http(original);
      } catch (e) {
        isRefreshing = false;
        subscribers = [];
        tokenStore.clear();
        // опционально: redirect на /login
        // window.location.replace("/login");
        throw e;
      }
    }

    throw error;
  }
);

// helper для query-параметров
export const withParams = (path, params = {}) => {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  // Возвращаем относительный путь + query, чтобы http.baseURL сработал
  return url.pathname + (url.search ? `?${url.searchParams.toString()}` : "");
};
