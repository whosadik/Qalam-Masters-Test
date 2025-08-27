import { http, tokenStore } from "@/lib/apiClient";
import { API } from "@/constants/api";

// login -> получает access/refresh
export async function login({ email, password }) {
  const { data } = await http.post(API.TOKEN_OBTAIN, { email, password });
  tokenStore.access  = data.access;
  tokenStore.refresh = data.refresh;
  return data;
}

export async function refresh() {
  const { data } = await http.post(API.TOKEN_REFRESH, { refresh: tokenStore.refresh });
  tokenStore.access = data.access;
  return data;
}

export async function signup(payload) {
  const { data } = await http.post(API.SIGNUP, payload);
  return data;
}

export async function me() {
  const { data } = await http.get(API.ME);
  return data;
}

export async function updateMe(payload, method = "patch") {
  const fn = method === "put" ? http.put : http.patch;
  const { data } = await fn(API.USER_UPDATE, payload);
  return data;
}

export async function deleteMe() {
  await http.delete(API.USER_DELETE);
  tokenStore.clear();
}
