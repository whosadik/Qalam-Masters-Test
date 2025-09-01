// src/auth/AuthContext.jsx
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

// b64url decode + user_id из access-токена
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
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

  // орг роли
  const [isOrgAdmin, setIsOrgAdmin] = useState(false); // admin/owner/moderator в организации

  // журнальные роли
  const [hasChiefEditor, setHasChiefEditor] = useState(false);
  const [hasEditor, setHasEditor] = useState(false);
  const [hasProofreader, setHasProofreader] = useState(false);
  const [hasSecretary, setHasSecretary] = useState(false);
  const [hasManager, setHasManager] = useState(false);
  const [hasReviewer, setHasReviewer] = useState(false);

  async function computeRoles() {
    const myId = getMyIdFromJWT();
    // сброс
    setIsOrgAdmin(false);
    setHasChiefEditor(false);
    setHasEditor(false);
    setHasProofreader(false);
    setHasSecretary(false);
    setHasManager(false);
    setHasReviewer(false);

    if (!myId) return;

    // 1) org-memberships
    try {
      const { data } = await http.get(`${API.ORG_MEMBERSHIPS}?page_size=200`);
      const rows = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      const mine = rows.filter((m) => Number(m?.user?.id ?? m?.user) === myId);
      // в новой схеме только admin / member
      setIsOrgAdmin(mine.some((m) => String(m.role) === "admin"));
    } catch {}

    // 2) journal-memberships
    try {
      const { data } = await http.get(
        `${API.JOURNAL_MEMBERSHIPS}?page_size=300`
      );
      const rows = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      const mine = rows.filter((m) => Number(m?.user ?? m?.user_id) === myId);
      const roleSet = new Set(mine.map((m) => String(m.role)));

      setHasChiefEditor(roleSet.has("chief_editor"));
      setHasEditor(roleSet.has("editor"));
      setHasProofreader(roleSet.has("proofreader"));
      setHasSecretary(roleSet.has("secretary"));
      setHasManager(roleSet.has("manager"));
      setHasReviewer(roleSet.has("reviewer"));
    } catch {}
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { user: u } = await bootstrapAuth();
        if (ignore) return;
        setUser(u);
        if (u) await computeRoles();
      } finally {
        if (!ignore) setBooted(true);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const login = async ({ email, password }) => {
    await apiLogin({ email, password });
    const u = await apiMe();
    setUser(u);
    await computeRoles(); // сразу посчитать флаги
    return u;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsOrgAdmin(false);
    setHasChiefEditor(false);
    setHasEditor(false);
    setHasProofreader(false);
    setHasSecretary(false);
    setHasManager(false);
    setHasReviewer(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      booted,
      isOrgAdmin,
      hasChiefEditor,
      hasEditor,
      hasProofreader,
      hasSecretary,
      hasManager,
      hasReviewer,
      login,
      logout,
    }),
    [
      user,
      booted,
      isOrgAdmin,
      hasChiefEditor,
      hasEditor,
      hasProofreader,
      hasSecretary,
      hasManager,
      hasReviewer,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
