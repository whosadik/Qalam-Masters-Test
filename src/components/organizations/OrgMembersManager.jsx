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
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

/* ── local helpers ───────────────────────────────────────────── */
const ROLES = ["member", "admin"];
const ROLE_LABEL = { member: "Участник", admin: "Админ" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// если в API нет готового хелпера на деталь
const ORG_MEMBERSHIP_ID = (id) =>
  typeof API.ORG_MEMBERSHIP_ID === "function"
    ? API.ORG_MEMBERSHIP_ID(id)
    : `${API.ORG_MEMBERSHIPS}${id}/`;

const fullName = (u) => {
  const f = (u?.first_name || "").trim();
  const l = (u?.last_name || "").trim();
  return f || l ? `${f} ${l}`.trim() : "—";
};

const userEmail = (m) => m?.user?.email || "—";

/* ── network ─────────────────────────────────────────────────── */
async function fetchOrgMembers(orgId, { pageSize = 100, maxPages = 30 } = {}) {
  const all = [];
  let page = 1;
  for (let i = 0; i < maxPages; i++) {
    const { data } = await http.get(API.ORG_MEMBERSHIPS, {
      params: { page, page_size: pageSize }, // <- БЕЗ organization
    });
    const chunk = Array.isArray(data?.results) ? data.results
                : Array.isArray(data) ? data : [];
    all.push(...chunk);
    if (!data?.next || chunk.length === 0) break;
    page += 1;
  }
  // фильтруем локально по нужной организации
  return all.filter(m => Number(m.organization) === Number(orgId));
}


async function addMemberByEmail(orgId, email, role) {
  return http.post(API.ORG_MEMBERSHIPS, { organization: orgId, email, role });
}
async function patchMember(id, payload) {
  return http.patch(ORG_MEMBERSHIP_ID(id), payload);
}
async function removeMember(id) {
  return http.delete(ORG_MEMBERSHIP_ID(id));
}

/* ── component ───────────────────────────────────────────────── */
export default function OrgMembersManager({ orgId }) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

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
    setSavingId(m.id);
    try {
      await patchMember(m.id, { role: m.role, is_active: m.is_active });
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Не удалось сохранить изменения");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRemove(id) {
    if (!confirm("Удалить участника из организации?")) return;
    setRemovingId(id);
    try {
      await removeMember(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Не удалось удалить участника");
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
                {filtered.map((m) => (
                  <tr
                    key={m.id}
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
                                x.id === m.id ? { ...x, role: v } : x
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
                                x.id === m.id
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
                          disabled={savingId === m.id}
                        >
                          {savingId === m.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Сохранить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(m.id)}
                          disabled={removingId === m.id}
                        >
                          {removingId === m.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
