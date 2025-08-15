import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  XCircle,
  ChevronLeft,
} from "lucide-react";

const KEY_JOURNALS = "myOrgJournals";
const msKey = (jid) => `jr_${jid}_manuscripts`;

const DECISIONS = [
  { v: "accept", l: "Принять" },
  { v: "minor", l: "Принять после незначительных правок" },
  { v: "major", l: "Нужны существенные правки" },
  { v: "reject", l: "Отклонить" },
];

// ——— helpers
const parseDate = (d) =>
  typeof d === "string" ? new Date(d) : d instanceof Date ? d : new Date();
const fmt = (d) => new Date(d).toLocaleDateString("ru-RU");
const daysLeft = (due) =>
  Math.ceil((parseDate(due) - new Date()) / (1000 * 60 * 60 * 24));

const seedIfEmpty = (jid) => {
  const raw = localStorage.getItem(msKey(jid));
  if (raw) return;
  const today = new Date();
  const plus = (n) => new Date(today.getTime() + n * 86400000).toISOString();
  const seed = [
    {
      id: Date.now() - 2,
      title: "Цифровая криминалистика в эпоху ИИ",
      authors: "Ермеков Д., Алиева А.",
      submittedAt: plus(-10),
      dueAt: plus(7),
      status: "assigned", // assigned | in_review | submitted | declined | completed
      abstract: "Краткая аннотация о применении ML в криминалистике.",
    },
    {
      id: Date.now() - 1,
      title: "Модели оценки академической успеваемости",
      authors: "Садыкова А., Иванов С.",
      submittedAt: plus(-5),
      dueAt: plus(3),
      status: "in_review",
      abstract: "Исследование факторов, влияющих на успеваемость студентов.",
      score: 0,
      decision: "",
      commentsPublic: "",
      commentsConf: "",
    },
    {
      id: Date.now(),
      title: "Этика рецензирования в открытой науке",
      authors: "Тлеулин Р.",
      submittedAt: plus(-20),
      dueAt: plus(-2),
      status: "assigned",
      abstract: "Обзор практик открытого рецензирования и конфликта интересов.",
    },
  ];
  localStorage.setItem(msKey(jid), JSON.stringify(seed));
};

export default function ReviewerDashboard() {
  const { jid } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("active"); // active | assigned | in_review | submitted | declined | all
  const [openId, setOpenId] = useState(null); // раскрытый элемент для отзывов

  // load
  useEffect(() => {
    // журнал (для заголовка)
    const js = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
    setJournal(js.find((j) => String(j.id) === String(jid)) || null);

    // рукописи
    seedIfEmpty(jid);
    try {
      setList(JSON.parse(localStorage.getItem(msKey(jid)) || "[]"));
    } catch {
      setList([]);
    }
  }, [jid]);

  const save = (arr) => {
    localStorage.setItem(msKey(jid), JSON.stringify(arr));
    setList(arr);
  };

  // KPI
  const kpi = useMemo(() => {
    const assigned = list.filter((m) => m.status === "assigned");
    const inRev = list.filter((m) => m.status === "in_review");
    const submitted = list.filter((m) => m.status === "submitted");
    const overdue = list.filter(
      (m) =>
        daysLeft(m.dueAt) < 0 &&
        (m.status === "assigned" || m.status === "in_review")
    );
    const dueSoon = list.filter(
      (m) =>
        daysLeft(m.dueAt) >= 0 &&
        daysLeft(m.dueAt) <= 3 &&
        (m.status === "assigned" || m.status === "in_review")
    );
    return {
      assigned: assigned.length,
      inRev: inRev.length,
      submitted: submitted.length,
      overdue: overdue.length,
      dueSoon: dueSoon.length,
    };
  }, [list]);

  // фильтрация
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let arr = [...list];
    if (tab === "active")
      arr = arr.filter((m) => ["assigned", "in_review"].includes(m.status));
    if (["assigned", "in_review", "submitted", "declined"].includes(tab))
      arr = arr.filter((m) => m.status === tab);
    if (qq)
      arr = arr.filter((m) =>
        [m.title, m.authors, m.abstract].join(" ").toLowerCase().includes(qq)
      );
    // порядок: сначала скоро дедлайн/просрочено
    return arr.sort(
      (a, b) => (daysLeft(a.dueAt) || 0) - (daysLeft(b.dueAt) || 0)
    );
  }, [list, q, tab]);

  // действия
  const acceptAssign = (id) => {
    save(list.map((m) => (m.id === id ? { ...m, status: "in_review" } : m)));
  };
  const declineAssign = (id) => {
    save(list.map((m) => (m.id === id ? { ...m, status: "declined" } : m)));
  };
  const saveDraft = (id, patch) => {
    save(list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };
  const submitReview = (id, payload) => {
    save(
      list.map((m) =>
        m.id === id
          ? {
              ...m,
              ...payload,
              status: "submitted",
              submittedAt: new Date().toISOString(),
            }
          : m
      )
    );
    setOpenId(null);
  };

  const statusBadge = (m) => {
    if (m.status === "submitted")
      return (
        <Badge className="bg-emerald-100 text-emerald-800">Отправлено</Badge>
      );
    if (m.status === "in_review")
      return <Badge className="bg-blue-100 text-blue-800">В работе</Badge>;
    if (m.status === "assigned")
      return <Badge className="bg-amber-100 text-amber-800">Назначено</Badge>;
    if (m.status === "declined")
      return <Badge className="bg-slate-100 text-slate-700">Отклонено</Badge>;
    return <Badge>—</Badge>;
  };

  const urgency = (m) => {
    const d = daysLeft(m.dueAt);
    if (d < 0)
      return (
        <span className="text-sm text-rose-600">
          Просрочено {Math.abs(d)} дн.
        </span>
      );
    if (d <= 3)
      return <span className="text-sm text-amber-600">Срок через {d} дн.</span>;
    return <span className="text-sm text-slate-600">Срок: {fmt(m.dueAt)}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              Рецензирование — {journal?.name || "Журнал"}
            </h1>
            <p className="text-slate-600">
              Ваши назначенные рукописи и отправленные отзывы
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

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="opacity-90">В работе</div>
                <div className="text-3xl font-bold">{kpi.inRev}</div>
              </div>
              <FileText className="w-7 h-7 opacity-90" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="opacity-90">Назначено</div>
                <div className="text-3xl font-bold">{kpi.assigned}</div>
              </div>
              <Clock className="w-7 h-7 opacity-90" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-rose-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="opacity-90">Просрочено</div>
                <div className="text-3xl font-bold">{kpi.overdue}</div>
              </div>
              <Calendar className="w-7 h-7 opacity-90" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-600 text-white sm:col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="opacity-90">Отправлено</div>
                <div className="text-3xl font-bold">{kpi.submitted}</div>
              </div>
              <CheckCircle2 className="w-7 h-7 opacity-90" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="w-full overflow-x-auto rounded-lg bg-white shadow-sm px-1 py-1 gap-1">
          {[
            ["active", "Активные"],
            ["assigned", "Назначено"],
            ["in_review", "В работе"],
            ["submitted", "Отправлено"],
            ["declined", "Отклонено"],
            ["all", "Все"],
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="whitespace-nowrap data-[state=active]:bg-slate-100"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab}>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="p-6 text-slate-500">Пока нет рукописей.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filtered.map((m) => (
                    <li
                      key={m.id}
                      className="p-4 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* индекс/прогресс */}
                        <div className="w-16 hidden sm:block">
                          <div className="text-xs text-slate-600 mb-1">
                            Прогресс
                          </div>
                          <Progress
                            value={
                              m.status === "submitted"
                                ? 100
                                : m.status === "in_review"
                                  ? 60
                                  : 20
                            }
                          />
                        </div>

                        {/* контент */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold leading-tight truncate">
                                  {m.title}
                                </h3>
                                {statusBadge(m)}
                              </div>
                              <div className="text-sm text-slate-600 truncate">
                                {m.authors} • Получена: {fmt(m.submittedAt)}
                              </div>
                              <div className="mt-1">{urgency(m)}</div>
                              {m.abstract && (
                                <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                                  {m.abstract}
                                </p>
                              )}
                            </div>

                            {/* действия */}
                            <div className="flex flex-col gap-2 shrink-0">
                              {m.status === "assigned" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => acceptAssign(m.id)}
                                  >
                                    Принять
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => declineAssign(m.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />{" "}
                                    Отклонить
                                  </Button>
                                </>
                              )}

                              {m.status === "in_review" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      setOpenId(openId === m.id ? null : m.id)
                                    }
                                  >
                                    Оставить отзыв
                                  </Button>
                                  <Link to="/requirements">
                                    <Button size="sm" variant="outline">
                                      Требования
                                    </Button>
                                  </Link>
                                </>
                              )}

                              {m.status === "submitted" && (
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  Отправлено {fmt(m.submittedAt)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* редактор отзыва */}
                          {openId === m.id && (
                            <div className="mt-4 p-4 border rounded-lg bg-white">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-1">
                                  <label className="block text-sm mb-1">
                                    Оценка (1–5)
                                  </label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={m.score ?? 0}
                                    onChange={(e) =>
                                      saveDraft(m.id, {
                                        score: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-sm mb-1">
                                    Решение
                                  </label>
                                  <select
                                    className="w-full border rounded-md p-2"
                                    value={m.decision || ""}
                                    onChange={(e) =>
                                      saveDraft(m.id, {
                                        decision: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="">— выберите —</option>
                                    {DECISIONS.map((d) => (
                                      <option key={d.v} value={d.v}>
                                        {d.l}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-3">
                                  <label className="block text-sm mb-1">
                                    Комментарии авторам
                                  </label>
                                  <Textarea
                                    rows={4}
                                    value={m.commentsPublic || ""}
                                    onChange={(e) =>
                                      saveDraft(m.id, {
                                        commentsPublic: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <label className="block text-sm mb-1">
                                    Конфиденциально для редакции
                                  </label>
                                  <Textarea
                                    rows={3}
                                    value={m.commentsConf || ""}
                                    onChange={(e) =>
                                      saveDraft(m.id, {
                                        commentsConf: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  className="gap-2"
                                  onClick={() =>
                                    submitReview(m.id, {
                                      score: m.score ?? 0,
                                      decision: m.decision || "",
                                      commentsPublic: m.commentsPublic || "",
                                      commentsConf: m.commentsConf || "",
                                    })
                                  }
                                  disabled={!m.decision}
                                >
                                  <Send className="w-4 h-4" /> Отправить отзыв
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenId(null)}
                                >
                                  Свернуть
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${jid}`}>
          <Button variant="outline">К журналу</Button>
        </Link>
      </div>
    </div>
  );
}
