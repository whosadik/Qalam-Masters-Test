// src/pages/editor/EditorDashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  ClipboardList,
  FileEdit,
  Hammer,
  UserPlus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { listArticles, updateArticleStatus } from "@/services/articlesService";

/* ---------- helpers ---------- */
const STATUS_LABEL = {
  draft: "Черновик",
  submitted: "Отправлена",
  screening: "Скрининг",
  under_review: "На рецензии",
  revision_minor: "Minor revision",
  revision_major: "Major revision",
  accepted: "Принята",
  rejected: "Отклонена",
  in_production: "В производстве",
  published: "Опубликована",
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleString("ru-RU") : "—");
const isPendingAssignment = (as) => String(as?.status || "") === "assigned";

async function fetchAssignmentsFor(articleIds = []) {
  const entries = await Promise.all(
    articleIds.map(async (id) => {
      try {
        const { data } = await http.get(
          withParams(ASSIGNMENTS_URL, {
            article: id,
            page_size: 50,
            ordering: "-created_at",
          })
        );
        const list = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        return [id, list];
      } catch (e) {
        console.error("assignments load failed", id, e);
        return [id, []];
      }
    })
  );
  return Object.fromEntries(entries);
}
function statusAccent(status) {
  switch (status) {
    case "under_review":
      return "border-l-4 border-l-blue-500";
    case "revision_minor":
      return "border-l-4 border-l-amber-500";
    case "revision_major":
      return "border-l-4 border-l-rose-500";
    default:
      return "border-l-4 border-l-slate-300";
  }
}

/* ---------- назначение рецензента inline (UI обновлён) ---------- */
function AssignReviewerInline({ articleId, onAssigned }) {
  const [open, setOpen] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [blind, setBlind] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!reviewerId) return alert("Укажи ID пользователя-рецензента");
    setBusy(true);
    try {
      const iso = dueAt ? new Date(dueAt).toISOString() : undefined;
      const { createAssignment } = await import("@/services/reviewsService");
      await createAssignment({
        article: articleId,
        reviewer: Number(reviewerId),
        due_at: iso,
        blind,
      });
      setOpen(false);
      setReviewerId("");
      setDueAt("");
      setBlind(true);
      onAssigned?.();
      alert("Рецензент назначен");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.detail || "Не удалось назначить рецензента");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        className="w-full sm:w-60 justify-center border-dashed bg-slate-50 hover:bg-slate-100 text-slate-800 gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {open ? "Скрыть назначение" : "Назначить рецензента"}
      </Button>

      {open && (
        <div className="rounded-xl border border-dashed bg-slate-50/60 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="number"
              placeholder="Reviewer userId"
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              className="col-span-1 sm:col-span-2 h-9 rounded-md border px-2 text-sm"
            />
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="col-span-1 sm:col-span-2 h-9 rounded-md border px-2 text-sm"
            />
            <label className="col-span-1 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={blind}
                onChange={(e) => setBlind(e.target.checked)}
              />
              Blind
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              onClick={submit}
              disabled={busy}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {busy ? "Назначаем..." : "Создать назначение"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

async function hasAssignedForArticle(articleId) {
  try {
    const { data } = await http.get(
      withParams("/api/reviews/assignments/", {
        article: articleId,
        status: "assigned",
        page_size: 1,
      })
    );
    // пагинация: если server вернёт count — используем его, иначе смотрим на results
    const count =
      typeof data?.count === "number"
        ? data.count
        : Array.isArray(data?.results)
        ? data.results.length
        : Array.isArray(data)
        ? data.length
        : 0;
    return count > 0;
  } catch {
    return false;
  }
}

/* ---------- main ---------- */
export default function EditorDashboard() {
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(true);

  const [journals, setJournals] = useState([]); // [{id,title,organization}]
  const [journalId, setJournalId] = useState(null);

  const [underReview, setUnderReview] = useState([]);
  const [revMinor, setRevMinor] = useState([]);
  const [revMajor, setRevMajor] = useState([]);

  // поиск/сортировка/страница
  const [ordering, setOrdering] = useState("-created_at");
  const [pageSize, setPageSize] = useState(50);

  const [urQuery, setUrQuery] = useState("");
  const [miQuery, setMiQuery] = useState("");
  const [maQuery, setMaQuery] = useState("");
  const searchTimer = useRef(null);
// рядом с остальными useState:
const [urUnassigned, setUrUnassigned] = useState([]); // under_review БЕЗ assigned
const [urAssigned, setUrAssigned]   = useState([]);   // under_review С assigned
const [assignmentsMap, setAssignmentsMap] = useState({});




  function onSearchChange(queue, value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (queue === "ur") setUrQuery(value);
    if (queue === "mi") setMiQuery(value);
    if (queue === "ma") setMaQuery(value);
    searchTimer.current = setTimeout(() => {
      if (journalId) loadArticlesForJournal(journalId);
    }, 400);
  }

async function loadArticlesForJournal(jid) {
  if (!jid) return;
  setLoading(true);
  try {
    const [u, mi, ma] = await Promise.all([
      listArticles({ status: "under_review", journal: jid, ordering, page_size: pageSize, search: urQuery || undefined }),
      listArticles({ status: "revision_minor", journal: jid, ordering, page_size: pageSize, search: miQuery || undefined }),
      listArticles({ status: "revision_major", journal: jid, ordering, page_size: pageSize, search: maQuery || undefined }),
    ]);

    const norm = (x) => (Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : []);
    const ur = norm(u);

    setRevMinor(norm(mi));
    setRevMajor(norm(ma));

    // грузим все назначения разом и делим under_review на назначенные/неназначенные
    const amap = await fetchAssignmentsFor(ur.map((a) => a.id));
    setAssignmentsMap(amap);

    const hasActive = (id) => (amap[id] || []).some(isPendingAssignment);
    setUrAssigned(ur.filter((a) => hasActive(a.id)));
    setUrUnassigned(ur.filter((a) => !hasActive(a.id)));
  } finally {
    setLoading(false);
  }
}




  // memberships where role === "editor"
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMembershipsLoading(true);
      try {
        const url = withParams(API.JOURNAL_MEMBERSHIPS, {
          mine: true,
          page_size: 300,
        });
        const { data } = await http.get(url);
        const rows = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        const my = rows.filter((m) => String(m.role) === "editor" && m.journal);
        const jids = [
          ...new Set(my.map((m) => Number(m.journal)).filter(Boolean)),
        ];

        const fetched = [];
        for (const jid of jids) {
          try {
            const { data: j } = await http.get(API.JOURNAL_ID(jid));
            fetched.push({
              id: Number(j.id),
              title: j.title || `Журнал #${jid}`,
              organization: j.organization,
            });
          } catch {
            fetched.push({
              id: Number(jid),
              title: `Журнал #${jid}`,
              organization: null,
            });
          }
        }
        if (!mounted) return;
        setJournals(fetched);
        setJournalId(
          (prev) => prev ?? (fetched.length === 1 ? fetched[0].id : null)
        );
      } finally {
        if (mounted) setMembershipsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, ordering, pageSize]);

  // actions
  async function requestRevision(id, kind /* "revision_minor" | "revision_major" */) {
    try {
      await updateArticleStatus(id, kind);
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("requestRevision failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось запросить ревизию");
    }
  }
  async function backToUnderReview(id) {
    try {
      await updateArticleStatus(id, "under_review");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("backToUnderReview failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось вернуть на рецензию");
    }
  }

  const currentJournal = useMemo(
    () => journals.find((j) => Number(j.id) === Number(journalId)),
    [journals, journalId]
  );

  // guards
  if (membershipsLoading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Проверяем права редактора…
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        Нет прав редактора — доступных журналов не найдено.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Дашборд редактора</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Журнал:</span>
          <Select
            value={journalId ? String(journalId) : undefined}
            onValueChange={(v) => setJournalId(Number(v))}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Выберите журнал" />
            </SelectTrigger>
            <SelectContent>
              {journals.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ordering} onValueChange={setOrdering}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">Новее → старее</SelectItem>
              <SelectItem value="created_at">Старее → новее</SelectItem>
              <SelectItem value="title">Заголовок A→Z</SelectItem>
              <SelectItem value="-title">Заголовок Z→A</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Порог" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}/стр
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentJournal && (
        <div className="text-sm text-gray-600">
          Организация: <b>{currentJournal.organization ?? "—"}</b>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
        </div>
      ) : (
        <Tabs
          defaultValue="under_review"
          className="space-y-6"
          aria-label="Очереди редактора"
        >
          <TabsList className="grid w-full grid-cols-4 gap-2 p-1 bg-white shadow-sm rounded-lg sticky top-0 z-10">
            <TabsTrigger value="under_review" className="flex items-center gap-2 shrink-0">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">На рецензии</span>
              <span className="sm:hidden">Рецензии</span>
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                {urUnassigned.length}
              </span>
            </TabsTrigger>
              <TabsTrigger value="assigned" className="flex items-center gap-2 shrink-0">
    <UserPlus className="h-4 w-4" />
    <span>Назначено</span>
    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
      {urAssigned.length}
    </span>
  </TabsTrigger>
            <TabsTrigger value="minor" className="flex items-center gap-2 shrink-0">
              <FileEdit className="h-4 w-4" />
              <span>Небольшие правки</span>
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                {revMinor.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="major" className="flex items-center gap-2 shrink-0">
              <Hammer className="h-4 w-4" />
              <span>Крупные правки</span>
              <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700">
                {revMajor.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB: UNDER REVIEW ===== */}
          <TabsContent value="under_review" className="space-y-4">
            {/* отдельная карточка заголовка+поиска */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    На рецензии (Under review){" "}
                    <span className="text-gray-400">({urUnassigned.length})</span>
                  </span>
                  <div className="relative w-full max-w-[480px] ml-4">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Поиск по Under review…"
                      className="pl-9"
                      value={urQuery}
                      onChange={(e) => onSearchChange("ur", e.target.value)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* отдельные карточки статей */}
            {urUnassigned.length ? (
  <div className="space-y-4">
    {urUnassigned.map((a) => (
      <Card
        key={a.id}
        className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="font-medium break-words">{a.title}</div>
              <div className="text-xs text-gray-500">
                Журнал #{a.journal} • Автор {a.author_email} • {fmt(a.created_at)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
              <Link to={`/articles/${a.id}`}>
                <Button variant="outline" className="bg-transparent">
                  Открыть
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                onClick={() => requestRevision(a.id, "revision_minor")}
              >
                Небольшие правки
              </Button>
              <Button
                variant="outline"
                className="border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                onClick={() => requestRevision(a.id, "revision_major")}
              >
                Крупные правки
              </Button>
            </div>
          </div>

          <AssignReviewerInline
            articleId={a.id}
            onAssigned={() => loadArticlesForJournal(journalId)}
          />
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <div className="p-6 text-gray-500">
    Сейчас нет статей, требующих назначения рецензента.
  </div>
)}

          </TabsContent>

          {/* ===== TAB: REVISION MINOR ===== */}
          <TabsContent value="minor" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Запрошены правки — Minor{" "}
                    <span className="text-gray-400">({revMinor.length})</span>
                  </span>
                  <div className="relative w-full max-w-[480px] ml-4">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Поиск по Minor…"
                      className="pl-9"
                      value={miQuery}
                      onChange={(e) => onSearchChange("mi", e.target.value)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {revMinor.length ? (
              <div className="space-y-4">
                {revMinor.map((a) => (
                  <Card
                    key={a.id}
                    className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium break-words">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          Журнал #{a.journal} • {fmt(a.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                        <Link to={`/articles/${a.id}`}>
                          <Button variant="outline" className="bg-transparent">
                            Открыть
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={() => backToUnderReview(a.id)}>
                          Вернуть на рецензию
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-6 text-gray-500">Нет статей с Небольшими правками.</div>
            )}
          </TabsContent>

          {/* ===== TAB: REVISION MAJOR ===== */}
          <TabsContent value="major" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Запрошены правки — Major{" "}
                    <span className="text-gray-400">({revMajor.length})</span>
                  </span>
                  <div className="relative w-full max-w-[480px] ml-4">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Поиск по Major…"
                      className="pl-9"
                      value={maQuery}
                      onChange={(e) => onSearchChange("ma", e.target.value)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {revMajor.length ? (
              <div className="space-y-4">
                {revMajor.map((a) => (
                  <Card
                    key={a.id}
                    className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium break-words">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          Журнал #{a.journal} • {fmt(a.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                        <Link to={`/articles/${a.id}`}>
                          <Button variant="outline" className="bg-transparent">
                            Открыть
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={() => backToUnderReview(a.id)}>
                          Вернуть на рецензию
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-6 text-gray-500">Нет статей с Крупными правками.</div>
            )}
          </TabsContent>
         <TabsContent value="assigned" className="space-y-4">
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>
          Назначено <span className="text-gray-400">({urAssigned.length})</span>
        </span>
        {/* можно реиспользовать urQuery для поиска */}
        <div className="relative w-full max-w-[480px] ml-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск по Under review…"
            className="pl-9"
            value={urQuery}
            onChange={(e) => onSearchChange("ur", e.target.value)}
          />
        </div>
      </CardTitle>
    </CardHeader>
  </Card>

  {urAssigned.length ? (
    <div className="space-y-4">
      {urAssigned.map((a) => {
        const assigns = assignmentsMap[a.id] || [];
        const active = assigns.filter(isPendingAssignment);
        return (
          <Card
            key={a.id}
            className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium break-words">{a.title}</div>
                  <div className="text-xs text-gray-500">
                    Журнал #{a.journal} • Автор {a.author_email} • {fmt(a.created_at)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                  <Link to={`/articles/${a.id}`}>
                    <Button variant="outline" className="bg-transparent">Открыть</Button>
                  </Link>
                </div>
              </div>

              {/* мини-сводка назначений */}
              {active.length ? (
                <div className="text-sm text-gray-700">
                  {active.map((as) => (
                    <div
                      key={as.id}
                      className="flex items-center justify-between py-1 border-t border-slate-100 first:border-t-0"
                    >
                      <div>
                        Назначение #{as.id} • статус: <b>{as.status}</b>
                        {as.due_at && <> • срок до {new Date(as.due_at).toLocaleDateString()}</>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Активных назначений нет.</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  ) : (
    <div className="p-6 text-gray-500">Нет статей с назначенными рецензентами.</div>
  )}
</TabsContent>

        </Tabs>
      )}
    </div>
  );
}
