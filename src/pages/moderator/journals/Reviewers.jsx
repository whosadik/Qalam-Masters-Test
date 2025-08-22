import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Mail,
  Pause,
  Play,
  Trash2,
  UsersRound,
  ChevronLeft,
} from "lucide-react";

const TOPIC_OPTIONS = [
  "Естественные науки",
  "Техника и ИТ",
  "Гуманитарные",
  "Экономика",
  "Право",
  "Образование",
  "Психология",
];

const key = (jid) => `jr_${jid}_reviewers`;

export default function Reviewers() {
  const { jid } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    affiliation: "",
    about: "",
    topics: [],
    status: "active",
    load: 0,
  });

  // load/save
  useEffect(() => {
    try {
      setList(JSON.parse(localStorage.getItem(key(jid)) || "[]"));
    } catch {}
  }, [jid]);
  const save = (arr) => localStorage.setItem(key(jid), JSON.stringify(arr));

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((r) =>
      [r.name, r.email, r.affiliation, (r.topics || []).join(", ")]
        .join(" ")
        .toLowerCase()
        .includes(qq)
    );
  }, [list, q]);

  const add = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const next = [
      ...list,
      {
        id: Date.now(),
        ...form,
        topics: Array.isArray(form.topics) ? form.topics : [],
        addedAt: new Date().toLocaleDateString("ru-RU"),
      },
    ];
    setList(next);
    save(next);
    setForm({
      name: "",
      email: "",
      affiliation: "",
      about: "",
      topics: [],
      status: "active",
      load: 0,
    });
    setShowForm(false);
  };

  const toggle = (id) => {
    const next = list.map((r) =>
      r.id === id
        ? { ...r, status: r.status === "active" ? "paused" : "active" }
        : r
    );
    setList(next);
    save(next);
  };

  const remove = (id) => {
    const next = list.filter((r) => r.id !== id);
    setList(next);
    save(next);
  };

  const invite = (id) => {
    // мок «приглашения» — просто отметим статусом
    const next = list.map((r) =>
      r.id === id ? { ...r, status: "active" } : r
    );
    setList(next);
    save(next);
    alert("Приглашение рецензенту отправлено (мок).");
  };

  const setTopics = (e) => {
    const sel = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, topics: sel }));
  };

  const statusBadge = (s) =>
    s === "active" ? (
      <Badge className="bg-emerald-100 text-emerald-800">Активен</Badge>
    ) : (
      <Badge className="bg-slate-100 text-slate-700">На паузе</Badge>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UsersRound className="w-6 h-6" /> Рецензенты журнала
          </h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Поиск по имени/почте/тематике"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Button className="gap-2" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4" /> Добавить
          </Button>
        </div>
      </div>

      {/* форма добавления */}
      {showForm && (
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Новый рецензент</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">ФИО *</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">
                Организация/должность
              </label>
              <Input
                value={form.affiliation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, affiliation: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">О себе / опыт</label>
              <Textarea
                rows={3}
                value={form.about}
                onChange={(e) =>
                  setForm((f) => ({ ...f, about: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">
                Тематики (множественный выбор)
              </label>
              <select
                multiple
                className="w-full border rounded-md p-2 h-36"
                value={form.topics}
                onChange={setTopics}
              >
                {TOPIC_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.topics || []).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Отмена
              </Button>
              <Button onClick={add}>Сохранить</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* список */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-gray-500">Пока нет рецензентов.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <li key={r.id} className="p-4 hover:bg-slate-50/70 transition">
                  <div className="flex items-start gap-4">
                    {/* аватар с инициалами */}
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0">
                      {r.name?.[0]?.toUpperCase() || "R"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold truncate">{r.name}</h3>
                            {statusBadge(r.status)}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {r.affiliation || "—"}
                          </div>
                          <div className="text-sm text-gray-600">
                            <Link  className="underline" href={`mailto:${r.email}`}>
                              {r.email}
                            </Link>{" "}
                            • Нагрузка: {r.load || 0}
                          </div>
                          {r.topics?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {r.topics.slice(0, 5).map((t) => (
                                <span
                                  key={t}
                                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {r.about && (
                            <div className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {r.about}
                            </div>
                          )}
                        </div>

                        {/* actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-36 gap-2"
                            onClick={() => invite(r.id)}
                          >
                            <Mail className="w-4 h-4" /> Пригласить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-36 gap-2"
                            onClick={() => toggle(r.id)}
                          >
                            {r.status === "active" ? (
                              <>
                                <Pause className="w-4 h-4" /> Пауза
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" /> Активировать
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-36 gap-2"
                            onClick={() => remove(r.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Удалить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* нижние кнопки */}
      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${jid}`}>
          <Button variant="outline">К журналу</Button>
        </Link>
      </div>
    </div>
  );
}
