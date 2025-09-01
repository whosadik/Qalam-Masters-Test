// src/lib/apiClient.js
import axios from "axios";
import { BASE_URL } from "@/constants/api";

// ===== tokens in localStorage =====
const ACCESS_KEY = "qm_access_token";
const REFRESH_KEY = "qm_refresh_token";
export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  set access(v) {
    v
      ? localStorage.setItem(ACCESS_KEY, v)
      : localStorage.removeItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set refresh(v) {
    v
      ? localStorage.setItem(REFRESH_KEY, v)
      : localStorage.removeItem(REFRESH_KEY);
  },
  clear() {
    this.access = null;
    this.refresh = null;
  },
};

// ========= axios instance =========
export const http = axios.create({
  baseURL: BASE_URL, // ВАЖНО: теперь относительные пути пойдут через BASE_URL (например .../api)
  timeout: 20000,
  withCredentials: false,
});

// добавляем Authorization
http.interceptors.request.use((config) => {
  const t = tokenStore.access;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// ===== refresh логика с очередью =====
let isRefreshing = false;
let subscribers = [];

const subscribeTokenRefresh = (cb) => subscribers.push(cb);
const notifySubscribers = (token, error = null) => {
  subscribers.forEach((cb) => {
    try {
      cb(token, error);
    } catch {}
  });
  subscribers = [];
};

// абсолютный URL от BASE_URL (без лишних /api)
const abs = (path) => {
  const base = BASE_URL.replace(/\/+$/, ""); // без завершающих слешей
  const tail = path.startsWith("/") ? path : `/${path}`;
  return `${base}${tail}`; // например: https://host/api + /users/token/refresh/
};

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config || {};
    const status = error?.response?.status;

    // если сеть/таймаут без ответа — пробрасываем как есть
    if (!error?.response) throw error;

    if (status === 401 && !original._retry && tokenStore.refresh) {
      original._retry = true;

      // уже идёт рефреш — подписываемся и повторим запрос после обновления
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, err) => {
            if (err) return reject(err);
            if (newToken) {
              original.headers = {
                ...(original.headers || {}),
                Authorization: `Bearer ${newToken}`,
              };
            }
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // вызываем отдельным axios без интерсепторов
        const { data } = await axios.post(
          abs("/users/token/refresh/"), // ВАЖНО: без /api перед путём
          { refresh: tokenStore.refresh },
          { timeout: 20000, headers: { "Content-Type": "application/json" } }
        );

        const newAccess = data?.access;
        if (!newAccess) throw new Error("No access token in refresh response");

        tokenStore.access = newAccess;

        // разбудим очередь
        notifySubscribers(newAccess, null);
        isRefreshing = false;

        // повторяем оригинальный запрос
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return http(original);
      } catch (e) {
        isRefreshing = false;
        notifySubscribers(null, e); // разбудили, но с ошибкой
        tokenStore.clear();
        // опционально: редирект на /login
        // window.location.replace("/login");
        throw e;
      }
    }

    // не наш случай — пробрасываем
    throw error;
  }
);

// helper для query-параметров: возвращает путь ОТНОСИТЕЛЬНО baseURL
export const withParams = (path, params = {}) => {
  // гарантируем завершающий / у базы для корректного резолва относительных путей
  const base = new URL(BASE_URL.replace(/\/?$/, "/"));
  const url = new URL(path, base);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });

  // превращаем абсолют в относительный к baseURL (без дублирования /api)
  let relPath = url.pathname;
  // base.pathname всегда с завершающим слешом (например "/api/")
  if (relPath.startsWith(base.pathname)) {
    relPath = "/" + relPath.slice(base.pathname.length); // "/api/articles/.." -> "/articles/.."
  }
  const search = url.search ? `?${url.searchParams.toString()}` : "";
  return relPath + search;
};

// (опционально) утилита для WS адреса
export const buildWsUrl = (wsPath = "/ws") => {
  try {
    const base = new URL(BASE_URL.replace(/\/?$/, "/"));
    base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
    // аккуратное склеивание путей: "/api/" + "ws" => "/api/ws"
    base.pathname = [
      base.pathname.replace(/\/+$/, ""),
      wsPath.replace(/^\/+/, ""),
    ]
      .filter(Boolean)
      .join("/");
    return base.toString();
  } catch {
    return wsPath; // фолбэк
  }
};
