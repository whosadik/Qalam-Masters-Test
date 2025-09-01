// src/pages/reviewer/ReviewerDashboard.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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
  if (d < 0)
    return <Badge variant="destructive">Просрочено {Math.abs(d)} д.</Badge>;
  if (d <= 3)
    return (
      <Badge className="bg-amber-500 hover:bg-amber-600">До срока {d} д.</Badge>
    );
  return <Badge variant="secondary">До срока {d} д.</Badge>;
};
const statusBadge = (s) => {
  if (!s) return null;
  const low = String(s).toLowerCase();
  if (["accepted", "published"].includes(low))
    return <Badge className="bg-green-600 hover:bg-green-700">{s}</Badge>;
  if (["rejected"].includes(low))
    return <Badge variant="destructive">{s}</Badge>;
  if (["revision_minor", "revision_major"].includes(low))
    return <Badge className="bg-amber-500 hover:bg-amber-600">{s}</Badge>;
  if (["under_review", "screening", "in_production", "submitted"].includes(low))
    return <Badge variant="secondary">{s}</Badge>;
  return <Badge variant="outline">{s}</Badge>;
};

const RECS = [
  { value: "accept", label: "Принять" },
  { value: "minor", label: "Minor revision" },
  { value: "major", label: "Major revision" },
  { value: "reject", label: "Отклонить" },
];

/** API helpers (используем прямые пути из OpenAPI) */
async function listMyAssignments(params = {}) {
  const { status } = params;
  const { data } = await http.get(API.REVIEW_ASSIGNMENTS, {
    params: { reviewer: "me", status, ordering: "-due_at", page_size: 100 },
  });
  const arr = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
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
  const arr = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
  return arr;
}

/** Форма отзыва для конкретного назначения */
function ReviewForm({ assignment, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [recommendation, setRecommendation] = useState("accept");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [already, setAlready] = useState(false);
  const [articleStatus, setArticleStatus] = useState(null); // для прехека

  useEffect(() => {
    let mounted = true;
    (async () => {
      const reviews = await listReviewsForAssignment(assignment.id);
      if (!mounted) return;
      setAlready(reviews.length > 0);
      try {
        const art = await getArticle(assignment.article);
        if (mounted) setArticleStatus(art?.status ?? null);
      } catch (e) {
        // молча
      }
    })();
    return () => (mounted = false);
  }, [assignment.id]);

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
      // === Верификация на сервере ===
      // 1) назначение должно стать completed
      let a = null,
        artAfter = null;
      try {
        a = await getAssignment(assignment.id);
      } catch {}
      // 2) статус статьи: сравним до/после
      try {
        artAfter = await getArticle(assignment.article);
      } catch {}

      const isCompleted = String(a?.status || "") === "completed";
      const before = articleStatus ?? "(неизвестно)";
      const after = artAfter?.status ?? "(неизвестно)";

      // Сообщение пользователю
      if (isCompleted) {
        if (before !== after) {
          alert(
            `Отзыв отправлен. Назначение: completed. Статус статьи изменился: ${before} → ${after}`
          );
        } else {
          alert(
            `Отзыв отправлен. Назначение: completed. Статус статьи не изменился (${after}). Это нормально, если решение принимает редактор.`
          );
        }
      } else {
        alert(
          "Отзыв отправлен, но назначение пока не в статусе completed. Обновляю список…"
        );
      }

      onSubmitted?.(); // перезагрузим списки
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
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        disabled={already}
      >
        {already
          ? "Отзыв уже отправлен"
          : open
            ? "Свернуть форму"
            : "Написать отзыв"}
      </Button>
      {open && !already && (
        <div className="rounded-lg border p-3 space-y-3">
          <div className="flex flex-wrap gap-3">
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
            <Button
              onClick={submit}
              disabled={busy}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {busy ? "Отправляем…" : "Отправить отзыв"}
            </Button>
            <span className="text-xs text-gray-500">
              После отправки статус назначения может измениться на «completed»
              автоматически.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Основной экран рецензента */
export default function ReviewerDashboard() {
  const [loading, setLoading] = useState(true);

  const [assigned, setAssigned] = useState([]); // ждут решения (accept/decline)
  const [accepted, setAccepted] = useState([]); // принял — можно писать отзыв
  const [completed, setCompleted] = useState([]); // история (по факту — где уже есть отзыв/закрыто)
  const [articleStatuses, setArticleStatuses] = useState({}); // { articleId: status }

  async function load() {
    setLoading(true);
    try {
      const [a, ac, comp] = await Promise.all([
        listMyAssignments({ status: "assigned" }),
        listMyAssignments({ status: "accepted" }),
        listMyAssignments({ status: "completed" }),
      ]);
      setAssigned(a);
      setAccepted(ac);
      setCompleted(comp);
      // Подтянем статусы статей одним махом (насколько возможно)
      const ids = Array.from(
        new Set(
          [...a, ...ac, ...comp].map((x) => x?.article).filter((v) => v != null)
        )
      );
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

  useEffect(() => {
    load();
  }, []);

  async function accept(id) {
    try {
      await patchAssignmentStatus(id, "accepted");
      await load();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось принять назначение");
    }
  }
  async function decline(id) {
    try {
      await patchAssignmentStatus(id, "declined");
      await load();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось отклонить назначение");
    }
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
      <h1 className="text-2xl font-bold">Дашборд рецензента</h1>

      {/* Назначения — ждут решения */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            Новые назначения{" "}
            <span className="text-gray-400">({assigned.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {assigned.length ? (
            <div className="space-y-4">
              {assigned.map((as) => (
                <Card key={as.id} className="shadow-sm border border-slate-200">
                  <CardContent className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        Статья #{as.article}
                      </div>
                      <div className="text-xs text-gray-500">
                        Назначено: {fmt(as.created_at)}{" "}
                        {as.due_at ? `• Дедлайн: ${fmt(as.due_at)}` : ""}
                      </div>
                      <div className="mt-2">{duePill(as.due_at)}</div>
                      {statusBadge(articleStatuses[as.article])}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge>assigned</Badge>
                      <Link to={`/articles/${as.article}`}>
                        <Button variant="outline" className="bg-transparent">
                          Открыть статью
                        </Button>
                      </Link>
                      <Button
                        onClick={() => accept(as.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Принять
                      </Button>
                      <Button
                        onClick={() => decline(as.id)}
                        variant="destructive"
                      >
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
        </CardContent>
      </Card>

      {/* Принятые — можно отправлять отзыв */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            Принятые к рецензированию{" "}
            <span className="text-gray-400">({accepted.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {accepted.length ? (
            <div className="space-y-4">
              {accepted.map((as) => (
                <Card key={as.id} className="shadow-sm border border-slate-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          Статья #{as.article}
                        </div>
                        <div className="text-xs text-gray-500">
                          Принято: {fmt(as.created_at)}{" "}
                          {as.due_at ? `• Дедлайн: ${fmt(as.due_at)}` : ""}
                        </div>
                        <div className="mt-2">{duePill(as.due_at)}</div>
                        {statusBadge(articleStatuses[as.article])}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge>accepted</Badge>
                        <Link to={`/articles/${as.article}`}>
                          <Button variant="outline" className="bg-transparent">
                            Открыть статью
                          </Button>
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
        </CardContent>
      </Card>

      {/* История */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            История (завершённые){" "}
            <span className="text-gray-400">({completed.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {completed.length ? (
            <div className="space-y-4">
              {completed.map((as) => (
                <Card key={as.id} className="shadow-sm border border-slate-200">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        Статья #{as.article}
                      </div>
                      <div className="text-xs text-gray-500">
                        Завершено • Назначено: {fmt(as.created_at)}{" "}
                        {as.due_at ? `• Дедлайн: ${fmt(as.due_at)}` : ""}
                      </div>
                      <div className="mt-2">
                        {statusBadge(articleStatuses[as.article])}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>completed</Badge>
                      <Link to={`/articles/${as.article}`}>
                        <Button variant="outline" className="bg-transparent">
                          Открыть статью
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-gray-500">История пуста.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
