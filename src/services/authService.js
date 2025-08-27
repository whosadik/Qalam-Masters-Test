import { http, tokenStore } from "@/lib/apiClient";
import { API } from "@/constants/api";

/**
 * Логин: получает access/refresh, сохраняет их и возвращает {access, refresh}
 * Бросает ошибку, если бэкенд вернул 4xx/5xx.
 */
export async function login({ email, password }) {
  const { data } = await http.post(API.TOKEN_OBTAIN, { email, password });
  tokenStore.access  = data.access;
  tokenStore.refresh = data.refresh;
  return data;
}

export async function refresh() {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) throw new Error("No refresh token");
  const { data } = await http.post(API.TOKEN_REFRESH, { refresh: refreshToken });
  tokenStore.access = data.access;
  return data;
}

export async function signup(payload) {
  const { data } = await http.post(API.SIGNUP, payload);
  return data;
}

/**
 * Текущий пользователь (профиль)
 */
export async function me() {
  const { data } = await http.get(API.ME);
  return data;
}

/**
 * Обновление профиля (PUT/PATCH)
 */
export async function updateMe(payload, method = "patch") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.USER_UPDATE, payload);
  return data;
}

/**
 * Удаление собственного аккаунта
 * После успешного удаления чистим токены.
 */
export async function deleteMe() {
  await http.delete(API.USER_DELETE);
  logout();
}

/**
 * Полный логаут: чистим токены локально.
 */
export function logout() {
  tokenStore.clear();
}

/**
 * Утилита: авторизованы ли мы по локальному признаку (наличие access)
 * Важно: не гарантирует валидности токена на сервере.
 */
export function isLoggedIn() {
  return !!tokenStore.access;
}

/**
 * Бутстрап при старте приложения:
 *  - если есть access, пытаемся получить профиль;
 *  - если 401, пробуем refresh → снова me();
 *  - при неудаче очищаем токены.
 * Возвращает { user: object|null }.
 */
export async function bootstrapAuth() {
  if (!tokenStore.access && !tokenStore.refresh) {
    return { user: null };
  }

  try {
    const user = await me();
    return { user };
  } catch (err) {
    try {
      await refresh();
      const user = await me();
      return { user };
    } catch {
      logout();
      return { user: null };
    }
  }
}
