import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Plus,
  UserPlus2,
  Calendar,
  ArrowLeftRight,
} from "lucide-react";

// storage keys
const KEY_JOURNALS = "myOrgJournals";
const msKey = (jid) => `jr_${jid}_manuscripts`;
const rvKey = (jid) => `jr_${jid}_reviewers`;

// колонки канбана
const COLUMNS = [
  { id: "new", title: "Новые" },
  { id: "screening", title: "На проверке" },
  { id: "review", title: "На рецензии" },
  { id: "revision", title: "Доработка" },
  { id: "decision", title: "Решение" },
];

// утилиты
const fmt = (d) => (d ? new Date(d).toLocaleDateString("ru-RU") : "—");
const daysLeft = (due) => Math.ceil((new Date(due) - new Date()) / 86400000);
const uniq = (arr, field = "id") => {
  const seen = new Set();
  return arr.filter((x) =>
    seen.has(x[field]) ? false : (seen.add(x[field]), true)
  );
};

// попытка нормализации старых записей
const ensureStage = (m) => {
  if (m.stage) return m.stage;
  if (m.status === "submitted") return "decision";
  if (m.status === "in_review" || m.status === "assigned") return "review";
  return "new";
};

export default function EditorialWorkflow() {
  const { jid } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [q, setQ] = useState("");
  const [assignFor, setAssignFor] = useState(null); // id рукописи, где открыт панель назначения
  const [searchRv, setSearchRv] = useState("");
  const [draftDue, setDraftDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [selectedRv, setSelectedRv] = useState({}); // {rid: true}

  // load data
  useEffect(() => {
    const js = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
    setJournal(js.find((j) => String(j.id) === String(jid)) || null);

    try {
      const list = JSON.parse(localStorage.getItem(msKey(jid)) || "[]");
      // нормализуем stage и assignments
      const normalized = list.map((m) => ({
        ...m,
        stage: ensureStage(m),
        assignments: Array.isArray(m.assignments) ? m.assignments : [],
      }));
      setManuscripts(normalized);
      localStorage.setItem(msKey(jid), JSON.stringify(normalized));
    } catch {
      setManuscripts([]);
    }

    try {
      setReviewers(JSON.parse(localStorage.getItem(rvKey(jid)) || "[]"));
    } catch {
      setReviewers([]);
    }
  }, [jid]);

  const save = (arr) => {
    localStorage.setItem(msKey(jid), JSON.stringify(arr));
    setManuscripts(arr);
  };

  // фильтры
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let arr = manuscripts;
    if (qq) {
      arr = arr.filter((m) =>
        [m.title, m.authors, m.abstract]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(qq)
      );
    }
    return arr;
  }, [manuscripts, q]);

  // разложить по колонкам
  const byCol = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    for (const m of filtered) map[m.stage]?.push(m);
    return map;
  }, [filtered]);

  // DnD
  const onDragStart = (e, id) =>
    e.dataTransfer.setData("text/plain", String(id));
  const onDrop = (e, stageId) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    save(
      manuscripts.map((m) =>
        String(m.id) === String(id) ? { ...m, stage: stageId } : m
      )
    );
  };

  const onAllowDrop = (e) => e.preventDefault();

  // назначение рецензентов
  const openAssign = (mid) => {
    setAssignFor(mid);
    setSelectedRv({});
    setSearchRv("");
    // предустановим срок
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDraftDue(d.toISOString().slice(0, 10));
  };

  const toggleSelectRv = (rid) =>
    setSelectedRv((s) => ({ ...s, [rid]: !s[rid] }));

  const saveAssignment = () => {
    const ids = Object.entries(selectedRv)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    if (!ids.length) {
      setAssignFor(null);
      return;
    }

    const picked = reviewers.filter((r) => ids.includes(r.id));
    const next = manuscripts.map((m) => {
      if (m.id !== assignFor) return m;
      const newAssignments = uniq(
        [
          ...(Array.isArray(m.assignments) ? m.assignments : []),
          ...picked.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            status: "invited",
            invitedAt: new Date().toISOString(),
            dueAt: new Date(draftDue).toISOString(),
          })),
        ],
        "id"
      );
      // если не было срока — задаём общий dueAt как максимальный из назначений
      const dueAt =
        m.dueAt ||
        newAssignments.reduce((acc, a) => {
          const d = new Date(a.dueAt).getTime();
          return isNaN(d) ? acc : Math.max(acc, d);
        }, 0);
      return {
        ...m,
        assignments: newAssignments,
        stage: m.stage === "new" ? "screening" : m.stage, // после назначения можно считать, что проверка началась
        dueAt: dueAt ? new Date(dueAt).toISOString() : m.dueAt,
      };
    });
    save(next);
    setAssignFor(null);
  };

  const removeAssignment = (mid, rid) => {
    save(
      manuscripts.map((m) =>
        m.id === mid
          ? {
              ...m,
              assignments: (m.assignments || []).filter((a) => a.id !== rid),
            }
          : m
      )
    );
  };

  const nextStage = (s) => {
    const order = COLUMNS.map((c) => c.id);
    const i = order.indexOf(s);
    return order[Math.min(order.length - 1, i + 1)];
  };
  const prevStage = (s) => {
    const order = COLUMNS.map((c) => c.id);
    const i = order.indexOf(s);
    return order[Math.max(0, i - 1)];
  };

  // список рецензентов с поиском
  const rvFiltered = useMemo(() => {
    const qq = searchRv.trim().toLowerCase();
    if (!qq) return reviewers;
    return reviewers.filter((r) =>
      [r.name, r.email, r.affiliation, (r.topics || []).join(", ")]
        .join(" ")
        .toLowerCase()
        .includes(qq)
    );
  }, [reviewers, searchRv]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Публикационный процесс — {journal?.name || "Журнал"}
            </h1>
            <p className="text-slate-600">
              Управление стадиями, назначение рецензентов, сроки
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по названию/авторам/аннотации"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* полоска KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {COLUMNS.map((c) => (
          <Card key={c.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-600">{c.title}</div>
              <div className="text-3xl font-bold">
                {byCol[c.id]?.length || 0}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KANBAN */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="space-y-3">
            <div className="px-2 py-2 bg-white shadow-sm rounded-xl border text-sm font-semibold">
              {col.title}
            </div>

            <div
              onDragOver={onAllowDrop}
              onDrop={(e) => onDrop(e, col.id)}
              className="min-h-[220px] p-2 rounded-xl bg-slate-50 border border-dashed"
            >
              {(byCol[col.id] || []).map((m) => {
                const assigned = Array.isArray(m.assignments)
                  ? m.assignments
                  : [];
                const dLeft = m.dueAt ? daysLeft(m.dueAt) : null;
                const reviewersShort = assigned.slice(0, 2);
                const more = Math.max(
                  0,
                  assigned.length - reviewersShort.length
                );
                const prog =
                  m.stage === "new"
                    ? 10
                    : m.stage === "screening"
                      ? 25
                      : m.stage === "review"
                        ? 60
                        : m.stage === "revision"
                          ? 80
                          : 100;

                return (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, m.id)}
                    className="mb-2 last:mb-0 bg-white border rounded-xl p-3 shadow-sm hover:shadow transition"
                  >
                    {/* заголовок */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold leading-tight truncate">
                          {m.title || "Без названия"}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {m.authors || "—"} • Получена: {fmt(m.submittedAt)}
                        </div>
                      </div>
                      <Link to={`/moderator/journals/${jid}/reviewer`}>
                        <Badge variant="secondary" className="shrink-0">
                          Детали
                        </Badge>
                      </Link>
                    </div>

                    {/* прогресс + срок */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600">Прогресс</span>
                        <span className="font-medium">{prog}%</span>
                      </div>
                      <Progress value={prog} />
                      <div className="mt-1 text-xs flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5" />
                        {m.dueAt ? (
                          dLeft < 0 ? (
                            <span className="text-rose-600">
                              Просрочено {Math.abs(dLeft)} дн.
                            </span>
                          ) : (
                            <span>
                              Срок: {fmt(m.dueAt)} ({dLeft} дн.)
                            </span>
                          )
                        ) : (
                          <span>Срок не задан</span>
                        )}
                      </div>
                    </div>

                    {/* рецензенты */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {reviewersShort.map((a) => (
                        <span
                          key={a.id}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {a.name}
                        </span>
                      ))}
                      {more > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          +{more}
                        </span>
                      )}
                    </div>

                    {/* действия */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => openAssign(m.id)}
                      >
                        <UserPlus2 className="w-4 h-4" />
                        Назначить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                          save(
                            manuscripts.map((x) =>
                              x.id === m.id
                                ? { ...x, stage: prevStage(m.stage) }
                                : x
                            )
                          )
                        }
                        disabled={m.stage === COLUMNS[0].id}
                        title="Предыдущая стадия"
                      >
                        ←
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          save(
                            manuscripts.map((x) =>
                              x.id === m.id
                                ? { ...x, stage: nextStage(m.stage) }
                                : x
                            )
                          )
                        }
                        disabled={m.stage === COLUMNS[COLUMNS.length - 1].id}
                        title="Следующая стадия"
                      >
                        →
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          const due = prompt(
                            "Задайте срок (YYYY-MM-DD):",
                            (m.dueAt || "").slice(0, 10)
                          );
                          if (!due) return;
                          const iso = new Date(due).toISOString();
                          save(
                            manuscripts.map((x) =>
                              x.id === m.id ? { ...x, dueAt: iso } : x
                            )
                          );
                        }}
                      >
                        Срок
                      </Button>
                    </div>

                    {/* Панель назначения (инлайн) */}
                    {assignFor === m.id && (
                      <div className="mt-3 p-3 border rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm">
                            Назначение рецензентов
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAssignFor(null)}
                          >
                            Закрыть
                          </Button>
                        </div>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Input
                              placeholder="Поиск рецензента"
                              value={searchRv}
                              onChange={(e) => setSearchRv(e.target.value)}
                            />
                            <div className="max-h-48 overflow-auto border rounded-md bg-white">
                              {rvFiltered.length === 0 ? (
                                <div className="p-2 text-sm text-slate-500">
                                  Нет рецензентов
                                </div>
                              ) : (
                                <ul className="divide-y">
                                  {rvFiltered.map((r) => {
                                    const checked = !!selectedRv[r.id];
                                    return (
                                      <li
                                        key={r.id}
                                        className="p-2 text-sm flex items-center justify-between"
                                      >
                                        <label className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                              toggleSelectRv(r.id)
                                            }
                                          />
                                          <span className="truncate">
                                            {r.name}
                                          </span>
                                        </label>
                                        <span className="text-xs text-slate-500 truncate">
                                          {r.topics?.[0] || ""}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm">
                              Срок рецензии
                            </label>
                            <Input
                              type="date"
                              value={draftDue}
                              onChange={(e) => setDraftDue(e.target.value)}
                            />
                            <div className="text-xs text-slate-600">
                              Выбранные получат статус «invited». Срок
                              сохранится в карточке.
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="gap-2"
                                onClick={saveAssignment}
                              >
                                <Plus className="w-4 h-4" /> Назначить
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setAssignFor(null)}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Уже назначенные */}
                        {assigned.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-slate-600 mb-1">
                              Назначены:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {assigned.map((a) => (
                                <span
                                  key={a.id}
                                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1"
                                >
                                  {a.name}
                                  <button
                                    className="ml-1 text-slate-500 hover:text-rose-600"
                                    title="Убрать"
                                    onClick={() => removeAssignment(m.id, a.id)}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${jid}`}>
          <Button variant="outline">К журналу</Button>
        </Link>
        <Link to={`/moderator/journals/${jid}/reviewer`}>
          <Button className="gap-2">
            <ArrowLeftRight className="w-4 h-4" />В дашборд рецензента
          </Button>
        </Link>
        <Link to={`/moderator/journals/${jid}/council`}>
          <Button size="sm" variant="outline" className="w-36">
            Редакц. совет
          </Button>
        </Link>
      </div>
    </div>
  );
}
