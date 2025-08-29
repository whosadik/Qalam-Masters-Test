"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  me as apiMe,
  logout as apiLogout,
  bootstrapAuth,
} from "@/services/authService";
import { http, tokenStore } from "@/lib/apiClient";
import { API } from "@/constants/api";

/** безопасно декодим payload из JWT (base64url) */
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
/** достаем мой user id из access-токена (SimpleJWT: user_id / OIDC: sub) */
function getMyIdFromJWT() {
  const t = tokenStore.access;
  if (!t) return null;
  const p = decodeJwtPayload(t);
  const raw = p?.user_id ?? p?.sub ?? p?.id ?? p?.uid ?? null;
  return raw != null ? Number(raw) : null;
}

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  /** один источник истины: считаем флаг модератора строго по своим membership-ам */
  const computeIsModerator = async () => {
    const myId = getMyIdFromJWT();
    if (!myId) {
      setIsModerator(false);
      return;
    }
    try {
      // пробуем mine=true (сервер всё равно должен отдавать только мои записи)
      const resp = await http.get(`${API.ORG_MEMBERSHIPS}?mine=true&page_size=200`);
      const rows = Array.isArray(resp?.data?.results) ? resp.data.results : resp?.data || [];
      // на всякий случай дополнительно фильтруем по user === myId
      const mine = rows.filter((m) => Number(m.user) === Number(myId));
      const ADMIN_ROLES = ["admin", "owner", "moderator"];
      setIsModerator(mine.some((m) => ADMIN_ROLES.includes(String(m.role))));
    } catch {
      setIsModerator(false);
    }
  };

  // Бутстрап при загрузке приложения
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { user: u } = await bootstrapAuth(); // тянет /me если есть токены
        if (ignore) return;
        setUser(u);
        if (u) await computeIsModerator();
      } finally {
        if (!ignore) setBooted(true);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Логин
  const login = async ({ email, password }) => {
    await apiLogin({ email, password }); // сохраняет токены
    const u = await apiMe();             // профиль (id может не быть — ок)
    setUser(u);
    await computeIsModerator();          // сразу посчитали роли
    return u;
  };

  // Логаут
  const logout = () => {
    apiLogout();
    setUser(null);
    setIsModerator(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      isModerator,
      booted,
      login,
      logout,
    }),
    [user, isModerator, booted]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
