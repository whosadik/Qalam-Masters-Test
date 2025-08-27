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

export const http = axios.create({
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
const notifySubscribers = (token) => {
  subscribers.forEach((cb) => {
    try {
      cb(token);
    } catch {}
  });
  subscribers = [];
};

// для абсолютных URL (в обход baseURL)
const abs = (path) => `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    // если совсем нет ответа (сеть/таймаут) — пробрасываем как есть
    const original = error?.config || {};
    const status = error?.response?.status;

    if (status === 401 && !original._retry && tokenStore.refresh) {
      original._retry = true;

      // уже идёт рефреш — подписываемся и повторим запрос после обновления
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken)
              original.headers = {
                ...(original.headers || {}),
                Authorization: `Bearer ${newToken}`,
              };
            resolve(http(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // вызов отдельным axios с абсолютным URL (исключаем интерсепторы)
        const { data } = await axios.post(
          abs("/api/users/token/refresh/"),
          { refresh: tokenStore.refresh },
          { timeout: 20000 }
        );

        const newAccess = data?.access;
        tokenStore.access = newAccess;

        // разбудим очередь
        notifySubscribers(newAccess);
        isRefreshing = false;

        // повторяем оригинальный запрос
        original.headers = {
          ...(original.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return http(original);
      } catch (e) {
        isRefreshing = false;
        notifySubscribers(null); // разбудили, но без токена
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

// helper для query-параметров
export const withParams = (path, params = {}) => {
  // строим с учётом baseURL, чтобы корректно собрать searchParams
  const url = new URL(path, BASE_URL || window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  // возвращаем только относительную часть, чтобы http.baseURL корректно применился
  return url.pathname + (url.search ? `?${url.searchParams.toString()}` : "");
};

// (опционально) утилита для WS адреса
export const buildWsUrl = (wsPath = "/ws") => {
  try {
    const u = new URL(BASE_URL || window.location.origin);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = [u.pathname.replace(/\/+$/, ""), wsPath.replace(/^\/+/, "")]
      .filter(Boolean)
      .join("/");
    return u.toString();
  } catch {
    return wsPath; // фолбэк
  }
};
