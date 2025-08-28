// src/pages/moderator/OrganizationList.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { listOrganizations, deleteOrganization } from "@/services/organizationsService";

export default function OrganizationList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      // если на бэке есть поиск — можно передать ?search=q
      const data = await listOrganizations(q ? { search: q } : undefined);
      // маппинг API → UI
      const rows = (data?.results ?? data ?? []).map((o) => ({
        id: o.id,
        name: o.title || "",
        head: o.head_name || "",
        journals: typeof o.journals_count === "number" ? o.journals_count : "—",
      }));
      setItems(rows);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Не удалось загрузить организации";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Удалить организацию? Это действие необратимо.")) return;
    setDeletingId(id);
    try {
      await deleteOrganization(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      alert(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          "Ошибка удаления"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (x) =>
        x.name.toLowerCase().includes(needle) ||
        x.head.toLowerCase().includes(needle)
    );
  }, [items, q]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Организации</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Поиск по названию или руководителю…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="sm:w-80"
          />
          <Button variant="outline" onClick={load}>
            Найти
          </Button>
          <Link to="/moderator/organizations/new">
            <Button>Добавить организацию</Button>
          </Link>
        </div>
      </div>

      {err && (
        <Card className="border-0">
          <CardContent className="p-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      )}

      {loading ? (
        <Card className="border-0">
          <CardContent className="p-4 text-gray-500">Загрузка…</CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0">
          <CardContent className="p-4 text-gray-500">
            Ничего не найдено.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-3 border">Название</th>
                <th className="p-3 border">Руководитель</th>
                <th className="p-3 border">Журналов</th>
                <th className="p-3 border">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{org.name}</td>
                  <td className="p-3 border">{org.head || "—"}</td>
                  <td className="p-3 border">{org.journals}</td>
                  <td className="p-3 border">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/moderator/organizations/${org.id}`}>
                        <Button size="sm" variant="outline">
                          Просмотр
                        </Button>
                      </Link>
                      <Link to={`/moderator/organizations/${org.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Редактировать
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(org.id)}
                        disabled={deletingId === org.id}
                      >
                        {deletingId === org.id ? "Удаляем…" : "Удалить"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
