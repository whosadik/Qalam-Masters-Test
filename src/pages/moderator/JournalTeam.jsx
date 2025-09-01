import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  Users,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { API } from "@/constants/api";
import { http, withParams } from "@/lib/apiClient";
import {
  listJournalMembers,
  addJournalMember,
  updateJournalMemberRole,
  removeJournalMember,
} from "@/services/journalMembershipsService";

const ROLE_LABEL = {
  chief_editor: "Главный редактор",
  editor: "Редактор",
  manager: "Менеджер",
  proofreader: "Корректор",
  secretary: "Секретарь",
  reviewer: "Рецензент",
};
const ALL_ROLES = Object.keys(ROLE_LABEL);

export default function JournalTeam() {
  const { id } = useParams(); // journalId из маршрута
  const journalId = Number(id);

  const [loading, setLoading] = useState(true);
  const [journal, setJournal] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  // форма добавления
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("manager");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // журнал (карточка заголовка)
        const { data: j } = await http.get(API.JOURNAL_ID(journalId));
        const list = await listJournalMembers(journalId, { page_size: 500 });
        if (!mounted) return;
        setJournal(j);
        setMembers(list);
      } catch (e) {
        if (!mounted) return;
        const msg =
          e?.response?.data?.detail ||
          e?.message ||
          "Не удалось загрузить команду журнала";
        setError(String(msg));
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [journalId]);

  const handleAdd = async () => {
    if (!newUserId || !newRole) return;
    setAdding(true);
    try {
      const created = await addJournalMember({
        user: Number(newUserId),
        journal: journalId,
        role: newRole,
      });
      setMembers((prev) => [created, ...prev]);
      setNewUserId("");
      setNewRole("manager");
    } catch (e) {
      alert(e?.response?.data?.detail || "Ошибка добавления");
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (m, role) => {
    try {
      const updated = await updateJournalMemberRole(m.id, role);
      setMembers((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
    } catch (e) {
      alert(e?.response?.data?.detail || "Не удалось обновить роль");
    }
  };

  const handleRemove = async (m) => {
    if (!confirm("Удалить участника из команды журнала?")) return;
    try {
      await removeJournalMember(m.id);
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e) {
      alert(e?.response?.data?.detail || "Не удалось удалить участника");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Загрузка…</span>
      </div>
    );
  if (error)
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
        <Link to="/moderator">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />К модератору
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Команда журнала</h1>
            <p className="text-gray-600">{journal?.title}</p>
          </div>
        </div>
        <Link to="/moderator">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Назад
          </Button>
        </Link>
      </div>

      {/* Добавление участника */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-600">ID пользователя</label>
              <Input
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="Напр. 42"
                type="number"
                min={1}
              />
              <p className="text-xs text-gray-500 mt-1">
                Пользователь должен быть участником организации этого журнала.
                Сначала добавьте его в организацию, если нужно.
              </p>
            </div>

            <div className="w-full md:w-64">
              <label className="text-sm text-gray-600">Роль</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAdd}
              disabled={!newUserId || !newRole || adding}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Таблица участников */}
      {/* Таблица участников */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          {members.length === 0 ? (
            <div className="p-6 text-gray-500">Пока нет участников.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Пользователь</th>
                  <th className="px-4 py-2">Роль</th>
                  <th className="px-4 py-2">Присоединился</th>
                  <th className="px-4 py-2 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-4 py-2 font-mono">{m.id}</td>
                    <td className="px-4 py-2">user #{m.user}</td>
                    <td className="px-4 py-2">{m.role}</td>
                    <td className="px-4 py-2">{m.date_joined || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <Button size="sm" variant="outline" className="mr-2">
                        Сохранить
                      </Button>
                      <Button size="sm" variant="outline">
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
