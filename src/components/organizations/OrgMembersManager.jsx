// src/components/organizations/OrgMembersManager.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCcw, Trash2, Save } from "lucide-react";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { tokenStore } from "@/lib/apiClient";

/* ── local helpers ───────────────────────────────────────────── */
const ROLES = ["member", "admin"];
const ROLE_LABEL = { member: "Участник", admin: "Админ" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// если в API нет готового хелпера на деталь
const ORG_MEMBERSHIP_ID = (id) => {
  const base =
    typeof API.ORG_MEMBERSHIP_ID === "function"
      ? API.ORG_MEMBERSHIP_ID(id)
      : `${API.ORG_MEMBERSHIPS}${id}`;
  return base.endsWith("/") ? base : `${base}/`;
};

const getOrgIdFromMembership = (m) =>
  Number(
    m?.organization?.id ?? m?.organization ?? m?.org_id ?? m?.organization_id
  );

// безопасно достаем ID membership (PK для DELETE/PATCH)
const getMembershipId = (m) => Number(m?.id ?? m?.membership_id ?? m?.pk);

const fullName = (u) => {
  const f = (u?.first_name || "").trim();
  const l = (u?.last_name || "").trim();
  return f || l ? `${f} ${l}`.trim() : "—";
};

const userEmail = (m) => m?.user?.email || m?.user_email || m?.email || "—";

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

/* ── network ─────────────────────────────────────────────────── */
async function fetchOrgMembers(orgId, { pageSize = 100, maxPages = 30 } = {}) {
  const all = [];
  let page = 1;
  for (let i = 0; i < maxPages; i++) {
    const { data } = await http.get(API.ORG_MEMBERSHIPS, {
      // если сервер не поддерживает organization — он просто проигнорит; мы отфильтруем ниже
      params: { organization: orgId, page, page_size: pageSize },
    });
    const chunk = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];
    all.push(...chunk);
    if (!data?.next || chunk.length === 0) break;
    page += 1;
  }
  // фильтруем локально по нужной организации
  return all.filter((m) => getOrgIdFromMembership(m) === Number(orgId));
}

async function addMemberByEmail(orgId, email, role) {
  return http.post(API.ORG_MEMBERSHIPS, { organization: orgId, email, role });
}
async function patchMember(id, payload, orgId) {
  const params = Number(orgId) ? { organization: Number(orgId) } : undefined;
  return http.patch(ORG_MEMBERSHIP_ID(id), payload, { params });
}
async function removeMember(id, orgId) {
  const params = Number(orgId) ? { organization: Number(orgId) } : undefined;
  return http.delete(ORG_MEMBERSHIP_ID(id), { params });
}
/* ── component ───────────────────────────────────────────────── */
export default function OrgMembersManager({ orgId }) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const myId = getMyIdFromJWT();

  // add form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [busyAdd, setBusyAdd] = useState(false);

  // row actions state
  const [savingId, setSavingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // client search
  const [q, setQ] = useState("");

  async function load() {
    if (!orgId) return;
    setLoading(true);
    setError("");
    try {
      const rows = await fetchOrgMembers(orgId);
      setMembers(rows);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          "Не удалось загрузить участников организации"
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return members;
    return members.filter((m) => {
      const fio =
        `${m?.user?.first_name || ""} ${m?.user?.last_name || ""}`.toLowerCase();
      const mail = (m?.user?.email || "").toLowerCase();
      const r = String(m?.role || "").toLowerCase();
      return fio.includes(query) || mail.includes(query) || r.includes(query);
    });
  }, [members, q]);

  const myMembership = useMemo(() => {
    if (!myId) return null;
    return members.find((m) => Number(m?.user?.id ?? m?.user) === myId) || null;
  }, [members, myId]);

  const adminRoles = new Set(["admin", "owner"]); // если owner приходит отдельной ролью
  const admins = useMemo(
    () =>
      members.filter((m) =>
        adminRoles.has(String(m?.role || "").toLowerCase())
      ),
    [members]
  );

  async function handleAdd() {
    const mail = email.trim();
    if (!EMAIL_RE.test(mail)) {
      alert("Введите корректный email");
      return;
    }
    setBusyAdd(true);
    try {
      await addMemberByEmail(orgId, mail, role);
      setEmail("");
      setRole("member");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.email?.[0] ||
        e?.response?.data?.error ||
        "Не удалось добавить участника";
      alert(msg);
    } finally {
      setBusyAdd(false);
    }
  }
  async function handleSaveRow(m) {
    const mid = getMembershipId(m);
    const orgIdForRow = getOrgIdFromMembership(m);
    const role = String(m.role || "").toLowerCase();
    const wasAdmin = adminRoles.has(
      String(m._prevRole || m.role || "").toLowerCase()
    ); // если нужно хранить предыдущее
    const becomingAdmin = adminRoles.has(role);
    if (!becomingAdmin && wasAdmin && admins.length <= 1) {
      alert("Нельзя убирать роль у последнего администратора организации.");
      return;
    }
    setSavingId(mid);
    try {
      await patchMember(
        mid,
        { role: m.role, is_active: m.is_active },
        orgIdForRow
      );
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Не удалось сохранить изменения");
    } finally {
      setSavingId(null);
    }
  }
  async function handleRemove(id) {
    const target = members.find((m) => getMembershipId(m) === id);
    if (!target) return;

    const targetUserId = Number(target?.user?.id ?? target?.user);
    const targetRole = String(target?.role || "").toLowerCase();
    const isTargetAdmin = adminRoles.has(targetRole);
    const isSelf = myId && targetUserId === myId;
    const adminCount = admins.length;

    // Клиентские гарды, чтобы не ловить 403/400 от сервера
    if (isSelf) {
      alert("Нельзя удалить самого себя из организации.");
      return;
    }
    if (targetRole === "owner") {
      alert("Нельзя удалить владельца организации.");
      return;
    }
    if (isTargetAdmin && adminCount <= 1) {
      alert("Нельзя удалить последнего администратора организации.");
      return;
    }

    if (!confirm("Удалить участника из организации?")) return;
    setRemovingId(id);
    try {
      const target = members.find((m) => getMembershipId(m) === id);
      const orgIdForRow = target ? getOrgIdFromMembership(target) : undefined;
      await removeMember(id, orgIdForRow);
      await load();
    } catch (e) {
      const s = e?.response?.status;
      alert(
        s === 404
          ? "Участник не найден или у вас нет прав на удаление."
          : s === 403
            ? "Недостаточно прав для удаления участника."
            : e?.response?.data?.detail || "Не удалось удалить участника"
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Участники организации</CardTitle>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Обновить
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Добавление по email */}
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium mb-3">
            Добавить участника по email
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full md:w-96 h-10 px-3 rounded-md border"
            />
            <div className="flex items-center gap-2">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={busyAdd}>
                {busyAdd && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Добавить
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Введите email существующего пользователя. Если у него ещё нет
            аккаунта, бэкенд может отклонить запрос (или создать приглашение —
            зависит от реализации).
          </p>
        </div>

        {/* Поиск */}
        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по ФИО / email / роли…"
            className="w-full md:w-96 h-10 px-3 rounded-md border"
          />
          {loading && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Загрузка списка…
            </div>
          )}
        </div>

        {/* Список участников */}
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">Участников нет.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-3">ФИО</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Роль</th>
                  <th className="py-2 pr-3">Активен</th>
                  <th className="py-2 pr-3 w-44">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const mid = getMembershipId(m);
                  return (
                    <tr
                      key={mid}
                      className="border-b last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 pr-3">{fullName(m.user)}</td>
                      <td className="py-2 pr-3">{userEmail(m)}</td>
                      <td className="py-2 pr-3">
                        <div className="w-40">
                          <Select
                            value={String(m.role)}
                            onValueChange={(v) =>
                              setMembers((prev) =>
                                prev.map((x) =>
                                  getMembershipId(x) === mid
                                    ? { ...x, role: v }
                                    : x
                                )
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {ROLE_LABEL[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!m.is_active}
                            onChange={(e) =>
                              setMembers((prev) =>
                                prev.map((x) =>
                                  getMembershipId(x) === mid
                                    ? { ...x, is_active: e.target.checked }
                                    : x
                                )
                              )
                            }
                          />
                          <span className="text-xs text-gray-600">
                            {m.is_active ? "да" : "нет"}
                          </span>
                        </label>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveRow(m)}
                            disabled={savingId === mid}
                          >
                            {savingId === mid ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Сохранить
                          </Button>
                          {(() => {
                            const role = String(m?.role || "").toLowerCase();
                            const isAdminRow = adminRoles.has(role);
                            const userIdRow = Number(m?.user?.id ?? m?.user);
                            const isSelfRow = myId && userIdRow === myId;
                            const disableDelete =
                              removingId === mid ||
                              role === "owner" ||
                              isSelfRow ||
                              (isAdminRow && admins.length <= 1);
                            const title =
                              role === "owner"
                                ? "Нельзя удалить владельца"
                                : isSelfRow
                                  ? "Нельзя удалить самого себя"
                                  : isAdminRow && admins.length <= 1
                                    ? "Нельзя удалить последнего администратора"
                                    : undefined;
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemove(mid)}
                                disabled={disableDelete}
                                title={title}
                              >
                                {removingId === mid ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                Удалить
                              </Button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
