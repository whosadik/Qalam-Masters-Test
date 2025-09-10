// src/pages/reviewer/ReviewerDashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Inbox,
  CheckCircle2,
  History,
  RefreshCw,
  Search,
  PanelRightOpen,
  PanelRightClose,
  CheckSquare,
  Square,
  Keyboard as KeyboardIcon,
  X,
} from "lucide-react";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

/* =========================
   Helpers
========================= */
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
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        До срока {d} д.
      </Badge>
    );
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
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        {low}
      </Badge>
    );
  if (["under_review", "screening", "in_production", "submitted"].includes(low))
    return <Badge variant="secondary">{low}</Badge>;
  return <Badge variant="outline">{low}</Badge>;
};

const RECS = [
  { value: "accept", label: "Принять" },
  { value: "minor", label: "Minor revision" },
  { value: "major", label: "Major revision" },
  { value: "reject", label: "Отклонить" },
];

/* =========================
   API
========================= */
async function listMyAssignments(params = {}) {
  const { status, search } = params;
  const { data } = await http.get(API.REVIEW_ASSIGNMENTS, {
    params: {
      reviewer: "me",
      status,
      ordering: "-due_at",
      page_size: 100,
      search,
    },
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

/* =========================
   Review Form (inline)
========================= */
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
      await createReview({ assignment: assignment.id, recommendation, body });
      setOpen(false);
      setBody("");

      let a = null,
        artAfter = null;
      try {
        a = await getAssignment(assignment.id);
      } catch {}
      try {
        artAfter = await getArticle(assignment.article);
      } catch {}

      const isCompleted = String(a?.status || "") === "completed";
      const before = articleStatus ?? "(неизвестно)";
      const after = artAfter?.status ?? "(неизвестно)";

      if (isCompleted) {
        if (before !== after) {
          alert(
            `Отзыв отправлен. Назначение: completed. Статус статьи изменился: ${before} → ${after}`
          );
        } else {
          alert(
            `Отзыв отправлен. Назначение: completed. Статус статьи не изменился (${after}).`
          );
        }
      } else {
        alert("Отзыв отправлен. Обновляю список…");
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
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        disabled={already}
        className="w-full justify-center border-dashed bg-slate-50 hover:bg-slate-100 text-slate-800"
      >
        {already
          ? "Отзыв уже отправлен"
          : open
            ? "Свернуть форму"
            : "Написать отзыв"}
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
            <Button
              onClick={submit}
              disabled={busy}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {busy ? "Отправляем…" : "Отправить отзыв"}
            </Button>
            <span className="text-xs text-gray-500">
              После отправки статус назначения может измениться на «completed».
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Main Dashboard (3-pane)
========================= */
export default function ReviewerDashboard() {
  // layout
  const [dense, setDense] = useState(
    () => (localStorage.getItem("rev_dense") ?? "1") === "1"
  );
  const [showRight, setShowRight] = useState(true);
  const [queue, setQueue] = useState("assigned"); // assigned | accepted | completed
  const [lastUpdated, setLastUpdated] = useState(null);

  // data
  const [loading, setLoading] = useState(true);
  const [assigned, setAssigned] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [articleStatuses, setArticleStatuses] = useState({}); // { [articleId]: status }

  // search
  const [globalQuery, setGlobalQuery] = useState("");
  const searchTimer = useRef(null);

  // selection + details
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailAssignment, setDetailAssignment] = useState(null);

  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAllVisible = (rows) =>
    setSelectedIds(new Set(rows.map((r) => r.id)));

  const visibleRows = useMemo(() => {
    switch (queue) {
      case "accepted":
        return accepted;
      case "completed":
        return completed;
      default:
        return assigned;
    }
  }, [queue, assigned, accepted, completed]);

  // load
  async function load() {
    setLoading(true);
    try {
      const [a, ac, comp] = await Promise.all([
        listMyAssignments({
          status: "assigned",
          search: globalQuery || undefined,
        }),
        listMyAssignments({
          status: "accepted",
          search: globalQuery || undefined,
        }),
        listMyAssignments({
          status: "completed",
          search: globalQuery || undefined,
        }),
      ]);
      setAssigned(a);
      setAccepted(ac);
      setCompleted(comp);

      const ids = Array.from(
        new Set([...a, ...ac, ...comp].map((x) => x?.article).filter(Boolean))
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
      setLastUpdated(new Date());
      clearSelection();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);
  function onGlobalSearch(value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setGlobalQuery(value);
    searchTimer.current = setTimeout(() => load(), 400);
  }

  // actions
  async function acceptOne(id) {
    try {
      await patchAssignmentStatus(id, "accepted");
      await load();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось принять назначение");
    }
  }
  async function declineOne(id) {
    try {
      await patchAssignmentStatus(id, "declined");
      await load();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось отклонить назначение");
    }
  }

  // batch (для assigned)
  async function bulkAccept(ids) {
    if (!ids.size) return;
    for (const id of ids) await acceptOne(id);
  }
  async function bulkDecline(ids) {
    if (!ids.size) return;
    for (const id of ids) await declineOne(id);
  }

  // keyboard
  const keydown = useCallback(
    (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("rev_global_search")?.focus();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        load();
      }
      if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        const first = [...selectedIds][0];
        if (first) {
          const row = visibleRows.find((r) => r.id === first);
          if (row) {
            setDetailAssignment(row);
            setShowRight(true);
          }
        }
      }
      if (queue === "assigned") {
        if (e.key.toLowerCase() === "a" && selectedIds.size) {
          e.preventDefault();
          bulkAccept(selectedIds);
        }
        if (e.key.toLowerCase() === "d" && selectedIds.size) {
          e.preventDefault();
          bulkDecline(selectedIds);
        }
      }
    },
    [queue, selectedIds, visibleRows]
  );
  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  // guards
  if (loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Загрузка назначений…
      </div>
    );
  }

  const rowPad = dense ? "py-2.5" : "py-4";
  const rowText = dense ? "text-[13px]" : "text-sm";
  const counts = {
    assigned: assigned.length,
    accepted: accepted.length,
    completed: completed.length,
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Дашборд рецензента
              </h1>
              <div className="mt-1 text-xs sm:text-sm text-slate-500">
                {lastUpdated ? `Обновлено: ${fmt(lastUpdated)}` : "—"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => load()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDense((v) => {
                    localStorage.setItem("rev_dense", v ? "0" : "1");
                    return !v;
                  });
                }}
              >
                {dense ? "Плотно" : "Обычно"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRight((v) => !v)}
                title={showRight ? "Скрыть панель" : "Показать панель"}
              >
                {showRight ? (
                  <PanelRightClose className="h-4 w-4 mr-2" />
                ) : (
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                )}
                Панель
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="rev_global_search"
                placeholder="Поиск по статьям/дедлайнам…  (нажмите /)"
                className="pl-9 bg-white"
                value={globalQuery}
                onChange={(e) => onGlobalSearch(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 px-2">
              <KeyboardIcon className="h-3.5 w-3.5" /> / — поиск, R — обновить,
              O — детали, A — принять, D — отклонить
            </span>
          </div>
        </div>
      </header>

      {/* Content layout */}
      <div className="mx-auto max-w-[1400px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[260px,1fr,420px] gap-4">
        {/* LEFT: queues */}
        <aside className="rounded-xl border border-slate-200 bg-white p-2 sticky top-[68px] h-fit">
          <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-slate-500">
            Очереди
          </div>
          <nav className="p-1 space-y-1">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "assigned" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("assigned")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <Inbox className="h-4 w-4" /> Новые назначения
                </span>
                <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                  {counts.assigned}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Требуют принять/отклонить
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "accepted" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("accepted")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Принятые
                </span>
                <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                  {counts.accepted}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Готовы к написанию отзыва
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "completed" ? "bg-slate-50 text-slate-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("completed")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <History className="h-4 w-4" /> История
                </span>
                <span className="text-xs rounded-full bg-slate-200 text-slate-700 px-2 py-0.5">
                  {counts.completed}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Завершённые назначения
              </div>
            </button>
          </nav>

          <div className="mt-2 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">Батч-операции</div>
            {queue === "assigned" ? (
              <div className="grid grid-cols-1 gap-1.5">
                <Button
                  size="sm"
                  className="justify-start bg-emerald-600 hover:bg-emerald-700"
                  disabled={!selectedIds.size}
                  onClick={() => bulkAccept(selectedIds)}
                >
                  Принять ({selectedIds.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="justify-start"
                  disabled={!selectedIds.size}
                  onClick={() => bulkDecline(selectedIds)}
                >
                  Отклонить ({selectedIds.size})
                </Button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Нет групповых действий
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: table */}
        <main className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-auto">
            <table className={`w-full ${rowText}`}>
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-[44px] text-left">
                    <button
                      className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
                      onClick={() =>
                        selectedIds.size === visibleRows.length
                          ? clearSelection()
                          : selectAllVisible(visibleRows)
                      }
                      title={
                        selectedIds.size === visibleRows.length
                          ? "Снять все"
                          : "Выбрать все"
                      }
                    >
                      {selectedIds.size === visibleRows.length &&
                      visibleRows.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left">Статья</th>
                  <th className="px-3 py-2 text-left w-[180px]">Назначено</th>
                  <th className="px-3 py-2 text-left w-[180px]">Дедлайн</th>
                  <th className="px-3 py-2 text-left w-[160px]">
                    Статус статьи
                  </th>
                  <th className="px-3 py-2 text-right w-[360px]">Действия</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length ? (
                  visibleRows.map((as) => (
                    <tr
                      key={as.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className={`px-3 ${rowPad}`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedIds.has(as.id)}
                          onChange={() => toggleSelect(as.id)}
                          aria-label="Выбрать строку"
                        />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="font-medium text-slate-900 truncate">
                          Статья #{as.article}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          Назначение #{as.id}
                        </div>
                      </td>
                      <td className={`px-3 ${rowPad}`}>{fmt(as.created_at)}</td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="flex items-center gap-2">
                          {duePill(as.due_at)}
                        </div>
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        {articleStatuses[as.article] ? (
                          statusBadge(articleStatuses[as.article])
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDetailAssignment(as);
                              setShowRight(true);
                            }}
                          >
                            Детали
                          </Button>
                          <Link to={`/articles/${as.article}`}>
                            <Button size="sm" variant="outline">
                              Открыть статью
                            </Button>
                          </Link>

                          {queue === "assigned" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => acceptOne(as.id)}
                              >
                                Принять
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => declineOne(as.id)}
                              >
                                Отклонить
                              </Button>
                            </>
                          )}

                          {queue === "accepted" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                setDetailAssignment(as);
                                setShowRight(true);
                              }}
                            >
                              Написать отзыв
                            </Button>
                          )}

                          {queue === "completed" && <Badge>completed</Badge>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto w-full max-w-md">
                        <div className="text-2xl font-semibold">Пока пусто</div>
                        <p className="mt-2 text-slate-500">
                          В очереди{" "}
                          <b>
                            {queue === "assigned"
                              ? "Новые назначения"
                              : queue === "accepted"
                                ? "Принятые"
                                : "История"}
                          </b>{" "}
                          нет записей под текущий поиск.
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGlobalQuery("");
                              load();
                            }}
                          >
                            Сбросить поиск
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom selection bar */}
          {selectedIds.size > 0 && (
            <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-slate-600">
                  Выбрано: <b>{selectedIds.size}</b>
                </div>
                <div className="flex items-center gap-2">
                  {queue === "assigned" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => bulkAccept(selectedIds)}
                      >
                        Принять
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => bulkDecline(selectedIds)}
                      >
                        Отклонить
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-1" />
                    Снять выделение
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: details / review panel */}
        <aside
          className={`relative transition-all duration-200 ${showRight ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-2 opacity-0"}`}
        >
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="font-semibold">Панель деталей</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRight(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {detailAssignment ? (
              <div className="p-3 space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Назначение</div>
                  <div className="font-medium break-words">
                    #{detailAssignment.id} • Статья #{detailAssignment.article}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Назначено: {fmt(detailAssignment.created_at)}{" "}
                    {detailAssignment.due_at
                      ? `• Дедлайн: ${fmt(detailAssignment.due_at)}`
                      : ""}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {duePill(detailAssignment.due_at)}
                    {articleStatuses[detailAssignment.article]
                      ? statusBadge(articleStatuses[detailAssignment.article])
                      : null}
                  </div>
                </div>

                {/* Для "assigned": быстрые действия */}
                {queue === "assigned" && (
                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => acceptOne(detailAssignment.id)}
                    >
                      Принять
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => declineOne(detailAssignment.id)}
                    >
                      Отклонить
                    </Button>
                  </div>
                )}

                {/* Для "accepted": форма отзыва */}
                {queue === "accepted" && (
                  <ReviewForm
                    assignment={detailAssignment}
                    onSubmitted={load}
                  />
                )}

                <div className="pt-1">
                  <Link
                    to={`/articles/${detailAssignment.article}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Открыть страницу статьи
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">
                Выберите строку и нажмите <b>Детали</b>, чтобы принять/отклонить
                назначение или написать отзыв.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
