// src/pages/moderator/JournalTeam.jsx
"use client";
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
import { Loader2, Users, Plus, Trash2, ArrowLeft } from "lucide-react";
import { API } from "@/constants/api";
import { http } from "@/lib/apiClient";
import {
  listJournalMembers,
  addJournalMember,
  updateJournalMemberRole,
  removeJournalMember,
} from "@/services/journalMembershipsService";

const ROLE_LABEL = {
  chief_editor: "Главный редактор",
  editor: "Редактор",
  proofreader: "Корректор",
  secretary: "Секретарь",
  reviewer: "Рецензент",
};
const ALL_ROLES = Object.keys(ROLE_LABEL);

const fioEmail = (u) => {
  const f = (u?.first_name || "").trim();
  const l = (u?.last_name || "").trim();
  const name = f || l ? `${f} ${l}`.trim() : "Без имени";
  return `${name} • ${u?.email || "—"}`;
};

export default function JournalTeam() {
  const { id } = useParams(); // journalId из маршрута
  const journalId = Number(id);

  const [loading, setLoading] = useState(true);
  const [journal, setJournal] = useState(null);

  // члены ЖУРНАЛА
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  // участники ОРГАНИЗАЦИИ (для выбора пользователя)
  const [orgMembers, setOrgMembers] = useState([]); // элементы вида { id, organization, user: {id,email,first_name,last_name}, role, ... }

  // форма добавления
  const [newUserId, setNewUserId] = useState(""); // выбираем из списка orgMembers
  const [newRole, setNewRole] = useState("manager");
  const [adding, setAdding] = useState(false);

  // справочник по userId -> user (для удобного отображения в таблице)
  const userById = useMemo(() => {
    const map = new Map();
    orgMembers.forEach((m) => {
      if (m?.user?.id) map.set(m.user.id, m.user);
    });
    return map;
  }, [orgMembers]);

  // чтобы не добавлять повторно
  const existingUserIds = useMemo(
    () => new Set(members.map((m) => m.user)),
    [members]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // 1) Журнал
        const { data: j } = await http.get(API.JOURNAL_ID(journalId));

        // 2) Команда журнала
        const team = await listJournalMembers(journalId, { page_size: 500 });

        // 3) Участники организации журнала (для выпадающего списка пользователей)
        const { data: orgList } = await http.get(API.ORG_MEMBERSHIPS, {
          params: { organization: j.organization, page_size: 500 },
        });
        const orgRows = Array.isArray(orgList?.results)
          ? orgList.results
          : Array.isArray(orgList)
            ? orgList
            : [];

        if (!mounted) return;
        setJournal(j);
        setMembers(team);
        setOrgMembers(orgRows);
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
    if (existingUserIds.has(Number(newUserId))) {
      alert("Этот пользователь уже есть в команде журнала.");
      return;
    }
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
          <div className="flex flex-col md:flex-row gap-3">
            {/* USER SELECT — список участников организации */}
            <div className="flex-1">
              <label className="text-sm text-gray-600">Пользователь</label>
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пользователя из организации" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {orgMembers.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      В организации пока нет участников
                    </div>
                  ) : (
                    orgMembers.map((m) => (
                      <SelectItem
                        key={m.user.id}
                        value={String(m.user.id)}
                        disabled={existingUserIds.has(m.user.id)}
                      >
                        {fioEmail(m.user)}{" "}
                        {existingUserIds.has(m.user.id)
                          ? " • уже в команде"
                          : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Список берётся из участников организации журнала.
              </p>
            </div>

            {/* ROLE SELECT */}
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
              className="gap-2  md:self-center"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Роль</th>
                  <th className="px-4 py-2">Присоединился</th>
                  <th className="px-4 py-2 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const u = userById.get(m.user);
                  const name = u
                    ? `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                      `user #${m.user}`
                    : `user #${m.user}`;
                  const email = u?.email || "—";
                  return (
                    <tr key={m.id} className="border-t">
                      <td className="px-4 py-2 font-mono">{m.id}</td>
                      <td className="px-4 py-2">{name}</td>
                      <td className="px-4 py-2">{email}</td>
                      <td className="px-4 py-2">
                        <div className="w-56">
                          <Select
                            value={m.role}
                            onValueChange={(val) => handleRoleChange(m, val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                      </td>
                      <td className="px-4 py-2">{m.date_joined || "—"}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleRemove(m)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
