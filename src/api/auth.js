import { api, setPair, clearPair } from "@/lib/apiClient";

export async function login({ email, password }) {
  const { data } = await api.post("/api/users/token/", { email, password });
  setPair(data); // {access, refresh}
  return data;
}

export async function signup(payload) {
  const { data } = await api.post("/api/users/signup/", payload);
  return data;
}

export async function me() {
  const { data } = await api.get("/api/users/me/");
  return data;
}

export function logout() {
  clearPair();
}
