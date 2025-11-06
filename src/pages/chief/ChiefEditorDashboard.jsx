// src/pages/chief/ChiefEditorDashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  RefreshCw,
  PanelRightOpen,
  PanelRightClose,
  CheckSquare,
  Square,
  Keyboard as KeyboardIcon,
  X,
  CheckCircle2,
  Hammer,
  BookOpenCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { listArticles, updateArticleStatus } from "@/services/articlesService";
import { useTranslation } from "react-i18next";

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

const ASSIGNMENTS_URL = "/api/reviews/assignments/";
const isForChief = (as) =>
  ["accepted", "completed"].includes(String(as?.status || ""));

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
      } catch {
        return [id, []];
      }
    })
  );
  return Object.fromEntries(entries);
}

function StatusPill({ status }) {
  const { t } = useTranslation();
  const map = {
    under_review: "bg-indigo-100 text-indigo-700",
    accepted: "bg-emerald-100 text-emerald-700",
    in_production: "bg-cyan-100 text-cyan-700",
    published: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[status] || "bg-slate-100 text-slate-700"}`}
    >
      {t(
          `dashboards:chief_editor_dashboard.status.${status}`,
          STATUS_LABEL[status] || status
      )}
    </span>
  );
}

/* =========================
   Main Dashboard (3-pane)
========================= */
export default function ChiefEditorDashboard() {
  const { t } = useTranslation();

  // layout
  const [dense, setDense] = useState(
    () => (localStorage.getItem("chief_dense") ?? "1") === "1"
  );
  const [showRight, setShowRight] = useState(true);
  const [queue, setQueue] = useState("chief"); // chief | production | published
  const [lastUpdated, setLastUpdated] = useState(null);

  // access / journals
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [journals, setJournals] = useState([]); // [{id,title,organization}]
  const [journalId, setJournalId] = useState(null);

  // data
  const [loading, setLoading] = useState(true);
  const [ceQueue, setCeQueue] = useState([]); // под главреда (UR с accepted/completed назначениями)
  const [inProduction, setInProduction] = useState([]);
  const [published, setPublished] = useState([]);

  // filters
  const [ordering, setOrdering] = useState("-created_at");
  const [pageSize, setPageSize] = useState(50);
  const [globalQuery, setGlobalQuery] = useState("");
  const searchTimer = useRef(null);

  // selection + detail
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailArticle, setDetailArticle] = useState(null);

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
      case "production":
        return inProduction;
      case "published":
        return published;
      default:
        return ceQueue;
    }
  }, [queue, ceQueue, inProduction, published]);

  // API load
  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [ur, prod, pub] = await Promise.all([
        listArticles({
          status: "under_review",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
        listArticles({
          status: "in_production",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
        listArticles({
          status: "published",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
      ]);

      const norm = (x) =>
        Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : [];
      const urRows = norm(ur);

      // выбираем только те, где есть accepted/completed назначения
      const amap = await fetchAssignmentsFor(urRows.map((a) => a.id));
      const onlyAccepted = urRows.filter((a) =>
        (amap[a.id] || []).some(isForChief)
      );

      setCeQueue(onlyAccepted);
      setInProduction(norm(prod));
      setPublished(norm(pub));
      setLastUpdated(new Date());
      clearSelection();
    } finally {
      setLoading(false);
    }
  }

  // memberships where role === "chief_editor"
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMembersipsLoadingSafe(true);
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
        const my = rows.filter(
          (m) => String(m.role) === "chief_editor" && m.journal
        );
        const jids = [
          ...new Set(my.map((m) => Number(m.journal)).filter(Boolean)),
        ];

        const fetched = [];
        for (const jid of jids) {
          try {
            const { data: j } = await http.get(API.JOURNAL_ID(jid));
            fetched.push({
              id: Number(j.id),
              title: j.title || t("dashboards:chief_editor_dashboard.journal_fallback", `Журнал #${jid}`),
              organization: j.organization,
            });
          } catch {
            fetched.push({
              id: Number(jid),
              title:  t("dashboards:chief_editor_dashboard.journal_fallback", `Журнал #${jid}`),
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
        if (mounted) setMembersipsLoadingSafe(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // small helper to avoid setState on unmounted typo
  const setMembersipsLoadingSafe = (v) => setMembershipsLoading(v);

  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, ordering, pageSize]);

  // debounced global search
  function onGlobalSearch(value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setGlobalQuery(value);
    searchTimer.current = setTimeout(() => {
      if (journalId) loadArticlesForJournal(journalId);
    }, 400);
  }

  // actions
  async function sendToProofreader(id) {
    try {
      // сохраняем исходный контракт: backend переводит в "accepted"
      await updateArticleStatus(id, "accepted");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("sendToProofreader failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:chief_editor_dashboard.errors.send_to_proofreader",
              "Не удалось отправить корректору"
          )
      );
    }
  }
  async function bulkSendToProofreader(ids) {
    if (!ids.size) return;
    for (const id of ids) {
      await sendToProofreader(id);
    }
  }

  const currentJournal = useMemo(
    () => journals.find((j) => Number(j.id) === Number(journalId)),
    [journals, journalId]
  );

  // keyboard shortcuts
  const keydown = useCallback(
    (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("chief_global_search")?.focus();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        journalId && loadArticlesForJournal(journalId);
      }
      if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        const first = [...selectedIds][0];
        if (first) {
          const row = visibleRows.find((r) => r.id === first);
          if (row) {
            setDetailArticle(row);
            setShowRight(true);
          }
        }
      }
      if (
        e.key.toLowerCase() === "s" &&
        selectedIds.size &&
        queue === "chief"
      ) {
        e.preventDefault();
        bulkSendToProofreader(selectedIds);
      }
    },
    [journalId, selectedIds, visibleRows, queue]
  );
  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  // guards
  if (membershipsLoading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t(
          "dashboards:chief_editor_dashboard.loading.memberships",
          "Проверяем права главреда…"
      )}
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        {t(
            "dashboards:chief_editor_dashboard.no_rights",
            "Нет прав главреда — доступных журналов не найдено."
        )}
      </div>
    );
  }

  const rowPad = dense ? "py-2.5" : "py-4";
  const rowText = dense ? "text-[13px]" : "text-sm";
  const counts = {
    chief: ceQueue.length,
    production: inProduction.length,
    published: published.length,
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t(
                    "dashboards:chief_editor_dashboard.title",
                    "Дашборд главного редактора"
                )}
              </h1>
              <div className="mt-1 text-xs sm:text-sm text-slate-500">
                {lastUpdated
                    ? `${t(
                        "dashboards:chief_editor_dashboard.updated",
                        "Обновлено:"
                    )} ${fmt(lastUpdated)}`
                    : t("dashboards:chief_editor_dashboard.dash", "—")}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={journalId ? String(journalId) : undefined}
                onValueChange={(v) => setJournalId(Number(v))}
              >
                <SelectTrigger className="w-72 bg-white">
                  <SelectValue placeholder={t(
                      "dashboards:chief_editor_dashboard.placeholders.select_journal",
                      "Выберите журнал"
                  )} />
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
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue placeholder={t(
                      "dashboards:chief_editor_dashboard.placeholders.sort",
                      "Сортировка"
                  )} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">
                    {t(
                        "dashboards:chief_editor_dashboard.sort.new_old",
                        "Новее → старее"
                    )}
                  </SelectItem>
                  <SelectItem value="created_at">
                    {t(
                        "dashboards:chief_editor_dashboard.sort.old_new",
                        "Старее → новее"
                    )}
                  </SelectItem>
                  <SelectItem value="title">
                    {t(
                        "dashboards:chief_editor_dashboard.sort.title_az",
                        "Заголовок A→Z"
                    )}
                  </SelectItem>
                  <SelectItem value="-title">
                    {t(
                        "dashboards:chief_editor_dashboard.sort.title_za",
                        "Заголовок Z→A"
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-28 bg-white">
                  <SelectValue placeholder={t(
                      "dashboards:chief_editor_dashboard.placeholders.limit",
                      "Порог"
                  )} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}{t(
                        "dashboards:chief_editor_dashboard.per_page",
                        "/стр"
                    )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => journalId && loadArticlesForJournal(journalId)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t(
                    "dashboards:chief_editor_dashboard.actions.refresh",
                    "Обновить"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setDense((v) => {
                    localStorage.setItem("chief_dense", v ? "0" : "1");
                    return !v;
                  });
                }}
              >
                {dense
                    ? t(
                        "dashboards:chief_editor_dashboard.view.compact",
                        "Плотно"
                    )
                    : t(
                        "dashboards:chief_editor_dashboard.view.normal",
                        "Обычно"
                    )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRight((v) => !v)}
                title={showRight
                    ? t(
                        "dashboards:chief_editor_dashboard.titles.hide_panel",
                        "Скрыть панель"
                    )
                    : t(
                        "dashboards:chief_editor_dashboard.titles.show_panel",
                        "Показать панель"
                    )
                }
              >
                {showRight ? (
                  <PanelRightClose className="h-4 w-4 mr-2" />
                ) : (
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                )}
                {t("dashboards:chief_editor_dashboard.panel", "Панель")}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="chief_global_search"
                placeholder={t(
                    "dashboards:chief_editor_dashboard.placeholders.search",
                    "Поиск по заголовку/автору…  (нажмите /)"
                )}
                className="pl-9 bg-white"
                value={globalQuery}
                onChange={(e) => onGlobalSearch(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 px-2">
              <KeyboardIcon className="h-3.5 w-3.5" />
              {t(
                  "dashboards:chief_editor_dashboard.hints.shortcuts",
                  " / — поиск, R — обновить, O — детали, S — отправить корректору"
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Content layout */}
      <div className="mx-auto max-w-[1400px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[260px,1fr,420px] gap-4">
        {/* LEFT: queues */}
        <aside className="rounded-xl border border-slate-200 bg-white p-2 sticky top-[68px] h-fit">
          <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-slate-500">
            {t("dashboards:chief_editor_dashboard.queues.title", "Очереди")}
          </div>
          <nav className="p-1 space-y-1">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "chief" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("chief")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t(
                      "dashboards:chief_editor_dashboard.queues.chief",
                      "Ожидают решения"
                  )}
                </span>
                <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                  {counts.chief}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(
                    "dashboards:chief_editor_dashboard.queues.chief_desc",
                    "UR с accepted/completed отзывами"
                )}
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "production" ? "bg-cyan-50 text-cyan-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("production")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <Hammer className="h-4 w-4" />
                  {t(
                      "dashboards:chief_editor_dashboard.queues.production",
                      "В производстве"
                  )}
                </span>
                <span className="text-xs rounded-full bg-cyan-100 text-cyan-700 px-2 py-0.5">
                  {counts.production}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(
                    "dashboards:chief_editor_dashboard.queues.production_desc",
                    "Этап корректора/верстки"
                )}
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "published" ? "bg-green-50 text-green-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("published")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4" />
                  {t(
                          "dashboards:chief_editor_dashboard.queues.published",
                          "Опубликовано"
                      )}
                </span>
                <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-0.5">
                  {counts.published}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(
                    "dashboards:chief_editor_dashboard.queues.published_desc",
                    "Для обзора"
                )}
              </div>
            </button>
          </nav>

          <div className="mt-2 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">
              {t(
                  "dashboards:chief_editor_dashboard.batch.title",
                  "Батч-операции"
              )}
            </div>
            {queue === "chief" ? (
              <div className="grid grid-cols-1 gap-1.5">
                <Button
                  size="sm"
                  className="justify-start bg-indigo-600 hover:bg-indigo-700"
                  disabled={!selectedIds.size}
                  onClick={() => bulkSendToProofreader(selectedIds)}
                >
                  {t(
                      "dashboards:chief_editor_dashboard.actions.send_to_proofreader_count",
                      "Отправить корректору"
                  )}{" "} ({selectedIds.size})
                </Button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                {t(
                    "dashboards:chief_editor_dashboard.batch.none",
                    "Нет групповых действий"
                )}
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
                            ? t(
                                "dashboards:chief_editor_dashboard.table.deselect_all",
                                "Снять все"
                            )
                            : t(
                                "dashboards:chief_editor_dashboard.table.select_all",
                                "Выбрать все"
                            )
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
                  <th className="px-3 py-2 text-left">
                    {t("dashboards:chief_editor_dashboard.table.article", "Статья")}
                  </th>
                  <th className="px-3 py-2 text-left w-[180px]">
                    {t("dashboards:chief_editor_dashboard.table.created", "Создана")}
                  </th>
                  <th className="px-3 py-2 text-left w-[160px]">
                    {t("dashboards:chief_editor_dashboard.table.status", "Статус")}
                  </th>
                  <th className="px-3 py-2 text-right w-[360px]">
                    {t("dashboards:chief_editor_dashboard.table.actions", "Действия")}
                  </th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                  Array.from({length: 8}).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-200 animate-pulse"
                    >
                      <td className={`px-3 ${rowPad}`}></td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-6 bg-slate-200 rounded w-[120px]" />
                      </td>
                      <td className={`px-3 ${rowPad}`} />
                    </tr>
                  ))
                ) : visibleRows.length ? (
                  visibleRows.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className={`px-3 ${rowPad}`}>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedIds.has(a.id)}
                          onChange={() => toggleSelect(a.id)}
                          aria-label={t(
                              "dashboards:chief_editor_dashboard.table.aria.select_row",
                              "Выбрать строку"
                          )}
                        />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="font-medium text-slate-900 truncate">
                          {a.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {t(
                              "dashboards:chief_editor_dashboard.table.journal_author",
                              "Журнал"
                          )}{" "}
                          #{a.journal} •{" "}
                          {t(
                              "dashboards:chief_editor_dashboard.table.author",
                              "Автор"
                          )}{" "}
                          {a.author_email ?? t("dashboards:chief_editor_dashboard.dash", "—")}
                        </div>
                      </td>
                      <td className={`px-3 ${rowPad}`}>{fmt(a.created_at)}</td>
                      <td className={`px-3 ${rowPad}`}>
                        <StatusPill status={a.status} />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDetailArticle(a);
                              setShowRight(true);
                            }}
                          >
                            {t("dashboards:chief_editor_dashboard.buttons.details", "Детали")}
                          </Button>
                          <Link to={`/articles/${a.id}`}>
                            <Button size="sm" variant="outline">
                              {t("dashboards:chief_editor_dashboard.buttons.open", "Открыть")}
                            </Button>
                          </Link>

                          {queue === "chief" && (
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => sendToProofreader(a.id)}
                            >
                              {t(
                                  "dashboards:chief_editor_dashboard.actions.send_to_proofreader",
                                  "Отправить корректору"
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="mx-auto w-full max-w-md">
                        <div className="text-2xl font-semibold">
                          {t(
                              "dashboards:chief_editor_dashboard.empty.title",
                              "Пока пусто"
                          )}
                        </div>
                        <p className="mt-2 text-slate-500">
                          {t(
                              "dashboards:chief_editor_dashboard.empty.desc_prefix",
                              "В очереди"
                          )}{" "}
                          <b>
                            {queue === "chief"
                                ? t(
                                    "dashboards:chief_editor_dashboard.queues.chief",
                                    "Ожидают решения"
                                )
                                : queue === "production"
                                    ? t(
                                        "dashboards:chief_editor_dashboard.queues.production",
                                        "В производстве"
                                    )
                                    : t(
                                        "dashboards:chief_editor_dashboard.queues.published",
                                        "Опубликовано"
                                    )}
                          </b>{" "}
                          {t(
                              "dashboards:chief_editor_dashboard.empty.desc_suffix",
                              "нет статей под текущие фильтры."
                          )}
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGlobalQuery("");
                              journalId && loadArticlesForJournal(journalId);
                            }}
                          >
                            {t(
                                "dashboards:chief_editor_dashboard.actions.reset_search",
                                "Сбросить поиск"
                            )}
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* bottom selection bar */}
          {selectedIds.size > 0 && (
            <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-slate-600">
                  {t(
                      "dashboards:chief_editor_dashboard.selection.selected",
                      "Выбрано:"
                  )}{" "}<b>{selectedIds.size}</b>
                </div>
                <div className="flex items-center gap-2">
                  {queue === "chief" && (
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => bulkSendToProofreader(selectedIds)}
                    >
                      {t(
                          "dashboards:chief_editor_dashboard.actions.send_to_proofreader",
                          "Отправить корректору"
                      )}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-1" />
                    {t(
                        "dashboards:chief_editor_dashboard.selection.clear",
                        "Снять выделение"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: details panel */}
        <aside
          className={`relative transition-all duration-200 ${showRight ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-2 opacity-0"}`}
        >
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="font-semibold">
                {t(
                    "dashboards:chief_editor_dashboard.details_panel.title",
                    "Панель деталей"
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRight(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {detailArticle ? (
              <div className="p-3 space-y-4">
                <div>
                  <div className="text-sm text-slate-500">
                    {t(
                        "dashboards:chief_editor_dashboard.details_panel.article",
                        "Статья"
                    )}
                  </div>
                  <div className="font-medium break-words">
                    {detailArticle.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t(
                        "dashboards:chief_editor_dashboard.details_panel.author",
                        "Автор:"
                    )}{" "}
                    {detailArticle.author_email ?? t("dashboards:chief_editor_dashboard.dash", "—")}{" "}
                    •{" "}
                    {t(
                        "dashboards:chief_editor_dashboard.details_panel.created",
                        "Создана:"
                    )}{" "}
                    {fmt(detailArticle.created_at)}
                  </div>
                  <div className="mt-1">
                    <StatusPill status={detailArticle.status} />
                  </div>
                </div>

                {queue === "chief" && (
                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => sendToProofreader(detailArticle.id)}
                    >
                      {t(
                          "dashboards:chief_editor_dashboard.actions.send_to_proofreader",
                          "Отправить корректору"
                      )}
                    </Button>
                    <Link to={`/articles/${detailArticle.id}`}>
                      <Button variant="outline">{t(
                          "dashboards:chief_editor_dashboard.details_panel.open_article",
                          "Открыть страницу статьи"
                      )}</Button>
                    </Link>
                  </div>
                )}

                {queue !== "chief" && (
                  <Link to={`/articles/${detailArticle.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {t(
                          "dashboards:chief_editor_dashboard.details_panel.open_article",
                          "Открыть страницу статьи"
                      )}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">
                {t(
                    "dashboards:chief_editor_dashboard.details_panel.helper",
                    "Выберите строку и нажмите "
                )}
                <b>
                  {t(
                      "dashboards:chief_editor_dashboard.buttons.details",
                      "Детали"
                  )}
                </b>
                {t(
                    "dashboards:chief_editor_dashboard.details_panel.helper_tail",
                    ", чтобы принять решение и перейти к статье."
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
