import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createOrganizationMembership,
  deleteOrganizationMembership,
  listOrganizationMemberships,
  updateOrganizationMembership,
} from "@/services/organizationsService";
import { API } from "@/constants/api";
import { Trash2, Plus, Check, X } from "lucide-react";
import { http } from "@/lib/apiClient";

// небольшая пагинация клиентом (DRF отдаёт {count, results})
async function fetchAllMemberships() {
  const all = [];
  let page = 1;
  for (;;) {
    const { data } = await listOrganizationMemberships({
      page,
      page_size: 100,
    });
    const chunk = Array.isArray(data?.results) ? data.results : [];
    all.push(...chunk);
    if (!data?.next || chunk.length === 0) break;
    page += 1;
  }
  return all;
}

// получение минимальной инфы о пользователе по id (имя/email)
// (бэк-эндпоинта «users list» нет — берём users/me если совпадает, иначе показываем id)
async function fetchUserLabel(userId) {
  try {
    const { data: me } = await http.get(API.ME); // с токеном
    if (me && Number(me.id) === Number(userId)) {
      const name = [me.first_name, me.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      return name || me.email || `user#${userId}`;
    }
  } catch {}
  return `user#${userId}`;
}

export default function OrgMembersManager({ orgId }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("");

  // поля формы «добавить»
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("member");
  const [newActive, setNewActive] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const all = await fetchAllMemberships();
      setRows(all.filter((m) => Number(m.organization) === Number(orgId)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [orgId]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.user).includes(q) ||
        String(r.role).toLowerCase().includes(q) ||
        r.user_label?.toLowerCase().includes(q)
    );
  }, [rows, filter]);

  // подставим подписи к пользователям (лениво)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const need = rows.filter((r) => !r.user_label);
      if (!need.length) return;
      const updates = await Promise.all(
        need.map(async (r) => ({
          id: r.id,
          user_label: await fetchUserLabel(r.user),
        }))
      );
      if (cancelled) return;
      setRows((prev) =>
        prev.map((r) =>
          updates.find((u) => u.id === r.id)
            ? {
                ...r,
                user_label: updates.find((u) => u.id === r.id).user_label,
              }
            : r
        )
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [rows]);

  async function addMember(e) {
    e?.preventDefault?.();
    if (!newUserId) return;
    setBusy(true);
    try {
      const payload = {
        user: Number(newUserId),
        organization: Number(orgId),
        role: newRole, // "admin" | "member"
        is_active: Boolean(newActive),
      };

      const created = await createOrganizationMembership(payload);

      // >>> получаем подпись отдельно, вне setRows
      const user_label = await fetchUserLabel(created.user);

      // >>> теперь можно обновлять стейт без async/await внутри апдейтера
      setRows((prev) => [{ ...created, user_label }, ...prev]);

      setNewUserId("");
      setNewRole("member");
      setNewActive(true);
    } catch (err) {
      alert(err.displayMessage || "Не удалось добавить участника");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(id) {
    if (!confirm("Удалить участника из организации?")) return;
    setBusy(true);
    try {
      await deleteOrganizationMembership(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.displayMessage || "Ошибка удаления");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id, role) {
    setBusy(true);
    try {
      const upd = await updateOrganizationMembership(id, { role }, "patch");
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, role: upd.role } : r))
      );
    } catch (err) {
      alert(err.displayMessage || "Не удалось изменить роль");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(id, is_active) {
    setBusy(true);
    try {
      const upd = await updateOrganizationMembership(
        id,
        { is_active },
        "patch"
      );
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: upd.is_active } : r))
      );
    } catch (err) {
      alert(err.displayMessage || "Не удалось изменить статус");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <form
            onSubmit={addMember}
            className="flex flex-col sm:flex-row gap-3 flex-1"
          >
            <Input
              type="number"
              min={1}
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="ID пользователя"
              className="w-full sm:w-48"
            />
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(newActive)}
              onValueChange={(v) => setNewActive(v === "true")}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Активен</SelectItem>
                <SelectItem value="false">Заблокирован</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              disabled={busy || !newUserId}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить
            </Button>
          </form>

          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Поиск по ID/роли"
            className="w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="text-gray-500">Загрузка участников…</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">Участников пока нет.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Пользователь</th>
                  <th className="py-2 pr-4">Роль</th>
                  <th className="py-2 pr-4">Статус</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono">#{m.id}</td>
                    <td className="py-2 pr-4">
                      <div className="font-medium">
                        {m.user_label || `user#${m.user}`}
                      </div>
                      <div className="text-xs text-gray-500">id: {m.user}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <Select
                        value={m.role}
                        onValueChange={(v) => changeRole(m.id, v)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">member</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        {m.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Check className="w-4 h-4" /> Активен
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <X className="w-4 h-4" /> Заблокирован
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(m.id, !m.is_active)}
                          disabled={busy}
                        >
                          Переключить
                        </Button>
                      </div>
                    </td>
                    <td className="py-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeMember(m.id)}
                        disabled={busy}
                        className="text-red-600"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
