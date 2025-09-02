// src/pages/reviewer/ReviewerDashboard.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Inbox,
  CheckCircle2,
  History,
} from "lucide-react";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

/** UI helpers */
const fmt = (iso) => (iso ? new Date(iso).toLocaleString("ru-RU") : "—");
const daysLeft = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};
const duePill = (due_at) => {
  const d = daysLeft(due_at);
  if (d === null) return <Badge variant="outline">Срок не назначен</Badge>;
  if (d < 0) return <Badge variant="destructive">Просрочено {Math.abs(d)} д.</Badge>;
  if (d <= 3)
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">До срока {d} д.</Badge>;
  return <Badge variant="secondary">До срока {d} д.</Badge>;
};
const statusBadge = (s) => {
  if (!s) return null;
  const low = String(s).toLowerCase();
  if (["accepted", "published"].includes(low))
    return <Badge className="bg-green-600 hover:bg-green-700">accepted</Badge>;
  if (["rejected"].includes(low))
    return <Badge variant="destructive">rejected</Badge>;
  if (["revision_minor", "revision_major"].includes(low))
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{low}</Badge>;
  if (["under_review", "screening", "in_production", "submitted"].includes(low))
    return <Badge variant="secondary">{low}</Badge>;
  return <Badge variant="outline">{low}</Badge>;
};

function accentByQueue(queue) {
  // сдержанные цветные полосы слева, в духе уже используемой палитры
  if (queue === "assigned") return "border-l-4 border-l-blue-500";
  if (queue === "accepted") return "border-l-4 border-l-emerald-500";
  return "border-l-4 border-l-slate-300"; // completed
}

const RECS = [
  { value: "accept", label: "Принять" },
  { value: "minor", label: "Minor revision" },
  { value: "major", label: "Major revision" },
  { value: "reject", label: "Отклонить" },
];

/** API helpers (прямые пути из OpenAPI) */
async function listMyAssignments(params = {}) {
  const { status, search } = params;
  const { data } = await http.get(API.REVIEW_ASSIGNMENTS, {
    params: { reviewer: "me", status, ordering: "-due_at", page_size: 100, search },
  });
  const arr = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return arr;
}
async function patchAssignmentStatus(id, status) {
  const { data } = await http.patch(API.REVIEW_ASSIGNMENT_ID(id), { status });
  return data;
}
async function createReview(payload) {
  const { data } = await http.post(API.REVIEWS, payload);
  return data;
}
async function getAssignment(id) {
  const { data } = await http.get(API.REVIEW_ASSIGNMENT_ID(id));
  return data;
}
async function getArticle(id) {
  const { data } = await http.get(API.ARTICLE_ID(id));
  return data;
}
async function listReviewsForAssignment(assignmentId) {
  const { data } = await http.get(API.REVIEWS, {
    params: { assignment: assignmentId, page_size: 10 },
  });
  const arr = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
  return arr;
}

/** Форма отзыва */
function ReviewForm({ assignment, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [recommendation, setRecommendation] = useState("accept");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [already, setAlready] = useState(false);
  const [articleStatus, setArticleStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const reviews = await listReviewsForAssignment(assignment.id);
      if (!mounted) return;
      setAlready(reviews.length > 0);
      try {
        const art = await getArticle(assignment.article);
        if (mounted) setArticleStatus(art?.status ?? null);
      } catch {}
    })();
    return () => (mounted = false);
  }, [assignment.id, assignment.article]);

  async function submit() {
    if (!body.trim()) return alert("Напишите текст отзыва.");
    setBusy(true);
    try {
      await createReview({
        assignment: assignment.id,
        recommendation,
        body,
      });
      setOpen(false);
      setBody("");

      let a = null, artAfter = null;
      try { a = await getAssignment(assignment.id); } catch {}
      try { artAfter = await getArticle(assignment.article); } catch {}

      const isCompleted = String(a?.status || "") === "completed";
      const before = articleStatus ?? "(неизвестно)";
      const after = artAfter?.status ?? "(неизвестно)";

      if (isCompleted) {
        if (before !== after) {
          alert(`Отзыв отправлен. Назначение: completed. Статус статьи изменился: ${before} → ${after}`);
        } else {
          alert(`Отзыв отправлен. Назначение: completed. Статус статьи не изменился (${after}).`);
        }
      } else {
        alert("Отзыв отправлен, но назначение пока не в статусе completed. Обновляю список…");
      }

      onSubmitted?.();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось отправить отзыв");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        disabled={already}
        className="w-full sm:w-60 justify-center border-dashed bg-slate-50 hover:bg-slate-100 text-slate-800"
      >
        {already ? "Отзыв уже отправлен" : open ? "Свернуть форму" : "Написать отзыв"}
      </Button>

      {open && !already && (
        <div className="rounded-xl border border-dashed bg-slate-50/60 p-3 space-y-3">
          <div className="flex flex-wrap gap-4">
            {RECS.map((r) => (
              <label key={r.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`rec_${assignment.id}`}
                  value={r.value}
                  checked={recommendation === r.value}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
                {r.label}
              </label>
            ))}
          </div>
          <textarea
            rows={5}
            className="w-full border rounded-md p-2 text-sm"
            placeholder="Ваш подробный отзыв для редакции и автора…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Button onClick={submit} disabled={busy} className="bg-blue-600 hover:bg-blue-700">
              {busy ? "Отправляем…" : "Отправить отзыв"}
            </Button>
            <span className="text-xs text-gray-500">
              После отправки статус назначения может измениться на «completed» автоматически.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Основной экран рецензента (Tabs) */
export default function ReviewerDashboard() {
  const [loading, setLoading] = useState(true);

  const [assigned, setAssigned] = useState([]);  // ждут решения
  const [accepted, setAccepted] = useState([]);  // приняты — пишем отзыв
  const [completed, setCompleted] = useState([]); // история
  const [articleStatuses, setArticleStatuses] = useState({}); // { articleId: status }

  // простые поиски по каждой вкладке (опционально)
  const [qAssigned, setQAssigned] = useState("");
  const [qAccepted, setQAccepted] = useState("");
  const [qCompleted, setQCompleted] = useState("");
  const [timer, setTimer] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [a, ac, comp] = await Promise.all([
        listMyAssignments({ status: "assigned", search: qAssigned || undefined }),
        listMyAssignments({ status: "accepted", search: qAccepted || undefined }),
        listMyAssignments({ status: "completed", search: qCompleted || undefined }),
      ]);
      setAssigned(a);
      setAccepted(ac);
      setCompleted(comp);

      const ids = Array.from(new Set([...a, ...ac, ...comp].map((x) => x?.article).filter(Boolean)));
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const art = await getArticle(id);
            return [id, art?.status ?? null];
          } catch {
            return [id, null];
          }
        })
      );
      setArticleStatuses(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  function debouncedReload(setter, value) {
    if (timer) clearTimeout(timer);
    setter(value);
    const t = setTimeout(() => load(), 400);
    setTimer(t);
  }

  async function accept(id) {
    try { await patchAssignmentStatus(id, "accepted"); await load(); }
    catch (e) { console.error(e?.response?.data || e); alert(e?.response?.data?.detail || "Не удалось принять назначение"); }
  }
  async function decline(id) {
    try { await patchAssignmentStatus(id, "declined"); await load(); }
    catch (e) { console.error(e?.response?.data || e); alert(e?.response?.data?.detail || "Не удалось отклонить назначение"); }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Загрузка назначений…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Дашборд рецензента</h1>
      </div>

      <Tabs defaultValue="assigned" className="space-y-6" aria-label="Назначения рецензента">
        <TabsList className="flex w-full overflow-x-auto gap-2 p-1 bg-white shadow-sm rounded-lg sticky top-0 z-10">
          <TabsTrigger value="assigned" className="flex items-center gap-2 shrink-0">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Новые назначения</span>
            <span className="sm:hidden">Новые</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              {assigned.length}
            </span>
          </TabsTrigger>

          <TabsTrigger value="accepted" className="flex items-center gap-2 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
            <span>Принятые</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
              {accepted.length}
            </span>
          </TabsTrigger>

          <TabsTrigger value="completed" className="flex items-center gap-2 shrink-0">
            <History className="h-4 w-4" />
            <span>История</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700">
              {completed.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ====== TAB: ASSIGNED ====== */}
        <TabsContent value="assigned" className="space-y-4">
          {/* Отдельная карточка заголовка + поиск */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Новые назначения <span className="text-gray-400">({assigned.length})</span></span>
                <div className="relative w-full max-w-[480px] ml-4">
                  <Input
                    placeholder="Поиск по новым назначениям…"
                    className="pl-3"
                    value={qAssigned}
                    onChange={(e) => debouncedReload(setQAssigned, e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Отдельные карточки без вложенности */}
          {assigned.length ? (
            <div className="space-y-4">
              {assigned.map((as) => (
                <Card key={as.id} className={`shadow-sm border border-slate-200 rounded-2xl ${accentByQueue("assigned")}`}>
                  <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium break-words">Статья #{as.article}</div>
                      <div className="text-xs text-gray-500">
                        Назначено: {fmt(as.created_at)} {as.due_at ? `• Дедлайн: ${fmt(as.due_at)}` : ""}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {duePill(as.due_at)}
                        {statusBadge( /* статус статьи */ as.article ? null : null )}
                        {/* фактический статус статьи ниже, если известен */}
                        {articleStatuses[as.article] ? statusBadge(articleStatuses[as.article]) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Badge>assigned</Badge>
                      <Link to={`/articles/${as.article}`}>
                        <Button variant="outline" className="bg-transparent">Открыть статью</Button>
                      </Link>
                      <Button onClick={() => accept(as.id)} className="bg-green-600 hover:bg-green-700">
                        Принять
                      </Button>
                      <Button onClick={() => decline(as.id)} variant="destructive">
                        Отклонить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-gray-500">Нет новых назначений.</div>
          )}
        </TabsContent>

        {/* ====== TAB: ACCEPTED ====== */}
        <TabsContent value="accepted" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Принятые к рецензированию <span className="text-gray-400">({accepted.length})</span></span>
                <div className="relative w-full max-w-[480px] ml-4">
                  <Input
                    placeholder="Поиск по принятым…"
                    className="pl-3"
                    value={qAccepted}
                    onChange={(e) => debouncedReload(setQAccepted, e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {accepted.length ? (
            <div className="space-y-4">
              {accepted.map((as) => (
                <Card key={as.id} className={`shadow-sm border border-slate-200 rounded-2xl ${accentByQueue("accepted")}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium break-words">Статья #{as.article}</div>
                        <div className="text-xs text-gray-500">
                          Принято: {fmt(as.created_at)} {as.due_at ? `• Дедлайн: ${fmt(as.due_at)}` : ""}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {duePill(as.due_at)}
                          {articleStatuses[as.article] ? statusBadge(articleStatuses[as.article]) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge>accepted</Badge>
                        <Link to={`/articles/${as.article}`}>
                          <Button variant="outline" className="bg-transparent">Открыть статью</Button>
                        </Link>
                      </div>
                    </div>

                    <ReviewForm assignment={as} onSubmitted={load} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-gray-500">Нет принятых назначений.</div>
          )}
        </TabsContent>

        {/* ====== TAB: COMPLETED ====== */}
        <TabsContent value="completed" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>История (завершённые) <span className="text-gray-400">({completed.length})</span></span>
                <div className="relative w-full max-w-[480px] ml-4">
                  <Input
                    placeholder="Поиск в истории…"
                    className="pl-3"
                    value={qCompleted}
                    onChange={(e) => debouncedReload(setQCompleted, e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {completed.length ? (
            <div className="space-y-4">
              {completed.map((as) => (
                <Card key={as.id} className={`shadow-sm border border-slate-200 rounded-2xl ${accentByQueue("completed")}`}>
                  <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium break-words">Статья #{as.article}</div>
                      <div className="text-xs text-gray-500">
                        Завершено • Назначено: {fmt(as.created_at)} {as.due_at ? `• Дедлайн: ${fmt(as.due_at)}` : ""}
                      </div>
                      <div className="mt-2">
                        {articleStatuses[as.article] ? statusBadge(articleStatuses[as.article]) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>completed</Badge>
                      <Link to={`/articles/${as.article}`}>
                        <Button variant="outline" className="bg-transparent">Открыть статью</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-gray-500">История пуста.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
