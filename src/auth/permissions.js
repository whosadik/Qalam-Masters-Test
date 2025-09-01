// src/auth/permissions.js
import {
  ACT,
  JOURNAL_ROLE_PERMS,
  ORG_ROLE_PERMS,
} from "@/constants/permissions";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

// кэш на время жизни страницы
const cache = new Map(); // key: `jid` -> { myId, journalRoles: Set<string>, isOrgAdmin: boolean }

async function getMyId() {
  const { data } = await http.get(API.ME);
  return Number(data?.id);
}

async function isOrgAdminForJournal(journalId, myId) {
  // 1) узнаем журнал -> organization id
  const { data: j } = await http.get(API.JOURNAL_ID(journalId));
  const orgId = Number(j.organization);
  if (!orgId) return false;

  // 2) тянем Мои membership’ы организации (можно без фильтра и проверить на фронте)
  const url = withParams(API.ORG_MEMBERSHIPS, { page_size: 200 });
  const { data } = await http.get(url);
  const rows = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
  return rows.some((m) => {
    const uid = Number(m?.user?.id ?? m?.user_id ?? m?.user);
    return (
      uid === myId &&
      Number(m.organization) === orgId &&
      String(m.role) === "admin"
    );
  });
}

async function getMyJournalRoles(journalId, myId) {
  const url = withParams(API.JOURNAL_MEMBERSHIPS, {
    journal: Number(journalId),
    page_size: 200,
  });
  const { data } = await http.get(url);
  const rows = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
  const mine = rows.filter((m) => Number(m.user) === myId);
  return new Set(mine.map((m) => String(m.role)));
}

/** Построить гранты пользователя по конкретному журналу */
export async function buildUserGrants(journalId) {
  const key = String(journalId);
  if (cache.has(key)) return cache.get(key);

  const myId = await getMyId();
  const [roles, orgAdmin] = await Promise.all([
    getMyJournalRoles(journalId, myId),
    isOrgAdminForJournal(journalId, myId),
  ]);

  const grants = { myId, journalRoles: roles, isOrgAdmin: orgAdmin };
  cache.set(key, grants);
  return grants;
}

/** Проверка права по действию */
export function hasAction(grants, action) {
  if (!grants) return false;

  // org.admin -> все
  if (grants.isOrgAdmin || ORG_ROLE_PERMS.admin === "ALL") return true;

  // объединяем разрешения по всем моим ролям в журнале
  const union = new Set();
  for (const r of grants.journalRoles) {
    const s = JOURNAL_ROLE_PERMS[r];
    if (s === undefined) continue;
    for (const a of s) union.add(a);
  }
  return union.has(action);
}

/** Хук для компонентов */
export function makeUsePermissions(react) {
  const { useEffect, useState } = react;
  return function usePermissions(journalId) {
    const [grants, setGrants] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        try {
          const g = await buildUserGrants(journalId);
          mounted && setGrants(g);
        } catch {
          mounted && setGrants(null);
        } finally {
          mounted && setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [journalId]);

    const can = (action) => hasAction(grants, action);

    return { loading, grants, can };
  };
}
