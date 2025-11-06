// src/pages/secretary/SecretaryDashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  RefreshCw,
  Search,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldCheck,
  PanelRightOpen,
  PanelRightClose,
  CheckSquare,
  Square,
  Filter,
  Sparkles,
  X,
  Keyboard as KeyboardIcon,
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
import {
  listArticles,
  updateArticleStatus,
  patchScreening,
  listArticleFiles,
  uploadArticleFile,
  deleteArticleFile,
} from "@/services/articlesService";
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

const STATUS_TW = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-100 text-blue-700",
  screening: "bg-amber-100 text-amber-700",
  under_review: "bg-indigo-100 text-indigo-700",
  revision_minor: "bg-yellow-100 text-yellow-800",
  revision_major: "bg-orange-100 text-orange-800",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  in_production: "bg-cyan-100 text-cyan-700",
  published: "bg-green-100 text-green-700",
};
const StatusPill = ({ status }) => {
  const { t } = useTranslation();

  const label =
      {
        draft: t("dashboards:secretary_dashboard.status.draft", "Черновик"),
        submitted: t("dashboards:secretary_dashboard.status.submitted", "Отправлена"),
        screening: t("dashboards:secretary_dashboard.status.screening", "Скрининг"),
        under_review: t("dashboards:secretary_dashboard.status.under_review", "На рецензии"),
        revision_minor: t("dashboards:secretary_dashboard.status.revision_minor", "Minor revision"),
        revision_major: t("dashboards:secretary_dashboard.status.revision_major", "Major revision"),
        accepted: t("dashboards:secretary_dashboard.status.accepted", "Принята"),
        rejected: t("dashboards:secretary_dashboard.status.rejected", "Отклонена"),
        in_production: t("dashboards:secretary_dashboard.status.in_production", "В производстве"),
        published: t("dashboards:secretary_dashboard.status.published", "Опубликована"),
      }[status] || status;

  return (
      <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TW[status] || "bg-slate-100 text-slate-700"}`}
      >
      {label}
    </span>
  );
};

/* ============================================================
   FILES
============================================================ */
function ArticleFiles({ articleId }) {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [type, setType] = useState("zgs");
  const fileRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listArticleFiles(articleId, {
        ordering: "-uploaded_at",
      });
      setFiles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("files load failed", e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  }

  async function onUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert(
        t("dashboards:secretary_dashboard.files.pick_file", "Выберите файл")
    );
    setUploadBusy(true);
    try {
      await uploadArticleFile(articleId, file, type);
      fileRef.current.value = "";
      await load();
    } catch (e) {
      console.error("upload failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t("dashboards:secretary_dashboard.files.upload_failed", "Не удалось загрузить файл")
      );
    } finally {
      setUploadBusy(false);
    }
  }

  async function onDelete(fileId) {
    if (!confirm(t("dashboards:secretary_dashboard.files.confirm_delete", "Удалить файл?"))) return;
    try {
      await deleteArticleFile(articleId, fileId);
      await load();
    } catch (e) {
      console.error("delete failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t("dashboards:secretary_dashboard.files.delete_failed", "Не удалось удалить файл")
      );
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-slate-800">
          {t("dashboards:secretary_dashboard.files.title", "Файлы")}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={load}
          title={t("dashboards:secretary_dashboard.files.refresh_title", "Обновить файлы")}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-56 bg-white">
            <SelectValue placeholder={t("dashboards:secretary_dashboard.files.type_placeholder", "Тип файла")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zgs">
              {t("dashboards:secretary_dashboard.files.type.zgs", "Допуск ЗГС")}
            </SelectItem>
            <SelectItem value="antiplag_report">
              {t("dashboards:secretary_dashboard.files.type.antiplag_report", "Отчет об оригинальности")}
            </SelectItem>
            <SelectItem value="supplement">{t("dashboards:secretary_dashboard.files.type.supplement", "Дополнительно")}</SelectItem>
          </SelectContent>
        </Select>
        <Input type="file" ref={fileRef} className="flex-1 bg-white" />
      </div>

      <div className="space-y-1.5">
        {loading ? (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("dashboards:secretary_dashboard.files.loading", "Загрузка файлов…")}
          </div>
        ) : files.length ? (
          files.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate text-slate-800">
                  {f.type} • {f.file?.split("/").pop() || "file"}
                </div>
                <div className="text-xs text-slate-500">
                  {t("dashboards:secretary_dashboard.files.uploaded_at", "Загружено: {{date}}", {
                    date: fmt(f.uploaded_at),
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {f.file ? (
                  <a
                    href={f.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline"
                  >
                    {t("dashboards:secretary_dashboard.files.open", "Открыть")}
                  </a>
                ) : null}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onDelete(f.id)}
                  title={t("dashboards:secretary_dashboard.files.delete", "Удалить")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-500">
            {t("dashboards:secretary_dashboard.files.empty", "Файлов нет.")}
          </div>
        )}
      </div>
      <Button onClick={onUpload} disabled={uploadBusy} className="sm:w-44">
        {uploadBusy ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("dashboards:secretary_dashboard.files.uploading", "Загрузка…")}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {t("dashboards:secretary_dashboard.files.upload", "Загрузить")}
          </>
        )}
      </Button>
    </div>
  );
}

/* ============================================================
   SCREENING
============================================================ */
function InlineScreeningForm({ articleId, onDone }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [scopeOk, setScopeOk] = useState(false);
  const [formatOk, setFormatOk] = useState(false);
  const [zgsOk, setZgsOk] = useState(false);
  const [antiplagOk, setAntiplagOk] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(next_status) {
    setBusy(true);
    try {
      await patchScreening(articleId, {
        scope_ok: scopeOk,
        format_ok: formatOk,
        zgs_ok: zgsOk,
        antiplag_ok: antiplagOk,
        notes,
        next_status,
      });
      onDone?.();
      setOpen(false);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.response?.data?.detail || t("dashboards:secretary_dashboard.screening.save_failed", "Не удалось сохранить результаты скрининга")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-slate-800">
          {t("dashboards:secretary_dashboard.screening.title", "Скрининг")}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="p-3 space-y-3 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopeOk}
                onChange={(e) => setScopeOk(e.target.checked)}
              />{" "}
              {t("dashboards:secretary_dashboard.screening.scope_ok", "Соответствует тематике")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formatOk}
                onChange={(e) => setFormatOk(e.target.checked)}
              />{" "}
              {t("dashboards:secretary_dashboard.screening.format_ok", "Оформление корректно")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={zgsOk}
                onChange={(e) => setZgsOk(e.target.checked)}
              />{" "}
              {t("dashboards:secretary_dashboard.screening.zgs_ok", "Допуск ЗГС получен")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={antiplagOk}
                onChange={(e) => setAntiplagOk(e.target.checked)}
              />{" "}
              {t("dashboards:secretary_dashboard.screening.antiplag_ok", "Антиплагиат пройден")}
            </label>
          </div>

          <textarea
            className="w-full border rounded-md p-2 text-sm"
            rows={3}
            placeholder={t("dashboards:secretary_dashboard.screening.notes_placeholder", "Заметки/комментарии (необязательно)")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={busy}
              onClick={() => submit("under_review")}
              className="bg-blue-600 hover:bg-blue-700"
              title={t("dashboards:secretary_dashboard.screening.finish_to_review_title", "Все ОК → на рецензию")}
            >
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t("dashboards:secretary_dashboard.screening.finish_to_review", "Завершить → На рецензию")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN
============================================================ */
export default function SecretaryDashboard() {
  const { t } = useTranslation();

  // layout / UI state
  const [dense, setDense] = useState(
    () => (localStorage.getItem("sec_dense") ?? "1") === "1"
  );
  const [showRight, setShowRight] = useState(true);
  const [queue, setQueue] = useState("submitted"); // submitted | screening
  const [lastUpdated, setLastUpdated] = useState(null);

  // data state
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState([]);
  const [journalId, setJournalId] = useState(null);

  const [submitted, setSubmitted] = useState([]);
  const [screening, setScreening] = useState([]);

  // filters/search
  const [globalQuery, setGlobalQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [pageSize, setPageSize] = useState(50);

  // selection & details
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailArticle, setDetailArticle] = useState(null);

  const searchTimer = useRef(null);

  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAllVisible = (rows) =>
    setSelectedIds(new Set(rows.map((r) => r.id)));

  const visibleRows = queue === "submitted" ? submitted : screening;

  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [s, sc] = await Promise.all([
        listArticles({
          status: "submitted",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
        listArticles({
          status: "screening",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
      ]);
      setSubmitted(
        Array.isArray(s?.results) ? s.results : Array.isArray(s) ? s : []
      );
      setScreening(
        Array.isArray(sc?.results) ? sc.results : Array.isArray(sc) ? sc : []
      );
      setLastUpdated(new Date());
      clearSelection();
    } finally {
      setLoading(false);
    }
  }

  // fetch journals where I am secretary
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMembershipsLoading(true);
      try {
        const jmUrl = withParams(API.JOURNAL_MEMBERSHIPS, {
          mine: true,
          page_size: 300,
        });
        const { data: jmData } = await http.get(jmUrl);
        const rows = Array.isArray(jmData?.results)
          ? jmData.results
          : Array.isArray(jmData)
            ? jmData
            : [];
        const secretRows = rows.filter(
          (m) => String(m.role) === "secretary" && m.journal
        );
        const uniqueJids = [
          ...new Set(secretRows.map((m) => Number(m.journal)).filter(Boolean)),
        ];

        const fetched = [];
        for (const jid of uniqueJids) {
          try {
            const { data: j } = await http.get(API.JOURNAL_ID(jid));
            fetched.push({
              id: Number(j.id),
              title: j.title || t("dashboards:secretary_dashboard.journal.fallback_title", "Журнал #{{id}}", {
                id: jid,
              }),
              organization: j.organization,
            });
          } catch {
            fetched.push({
              id: Number(jid),
              title: t("dashboards:secretary_dashboard.journal.fallback_title", "Журнал #{{id}}", {
                id: jid,
              }),
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

  // autoload on deps
  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, ordering, pageSize]);

  // global search debounce
  function onGlobalSearch(value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setGlobalQuery(value);
    searchTimer.current = setTimeout(() => {
      if (journalId) loadArticlesForJournal(journalId);
    }, 400);
  }

  // actions
  async function moveToScreening(articleId) {
    await updateArticleStatus(articleId, "screening").catch((e) => {
      console.error("submitted → screening failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t("dashboards:secretary_dashboard.actions.move_to_screening_failed", "Не удалось перевести на скрининг"));
    });
  }
  async function returnToDraft(articleId) {
    await updateArticleStatus(articleId, "draft").catch((e) => {
      console.error("return to draft failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t("dashboards:secretary_dashboard.actions.return_to_draft_failed", "Не удалось вернуть в черновик"));
    });
  }
  async function bulkMoveToScreening(ids) {
    if (!ids.size) return;
    const arr = [...ids];
    for (const id of arr) {
      await moveToScreening(id);
    }
    await loadArticlesForJournal(journalId);
  }
  async function bulkReturnToDraft(ids) {
    if (!ids.size) return;
    const arr = [...ids];
    for (const id of arr) {
      await returnToDraft(id);
    }
    await loadArticlesForJournal(journalId);
  }

  // keyboard shortcuts
  const keydown = useCallback(
    (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        const el = document.getElementById("sec_global_search");
        el?.focus();
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
        queue === "submitted" &&
        selectedIds.size
      ) {
        e.preventDefault();
        bulkMoveToScreening(selectedIds);
      }
    },
    [journalId, selectedIds, visibleRows, queue]
  );
  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  // UI helpers
  const rowPad = dense ? "py-2.5" : "py-4";
  const rowText = dense ? "text-[13px]" : "text-sm";

  // guards
  if (membershipsLoading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("dashboards:secretary_dashboard.loading_rights", "Проверяем права секретаря…")}
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        {t("dashboards:secretary_dashboard.no_rights", "Нет прав секретаря — доступных журналов не найдено.")}
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t("dashboards:secretary_dashboard.title", "Дашборд секретаря")}
              </h1>
              <div className="mt-1 text-xs sm:text-sm text-slate-500">
                {lastUpdated
                    ? t("dashboards:secretary_dashboard.updated_at", "Обновлено: {{date}}", {
                      date: fmt(lastUpdated),
                    })
                    : "—"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={journalId ? String(journalId) : undefined}
                onValueChange={(v) => setJournalId(Number(v))}
              >
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue placeholder={t("dashboards:secretary_dashboard.pick_journal", "Выберите журнал")} />
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
                  <SelectValue placeholder={t("dashboards:secretary_dashboard.sort.placeholder", "Сортировка")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">
                    {t("dashboards:secretary_dashboard.sort.new_old", "Новее → старее")}
                  </SelectItem>
                  <SelectItem value="created_at">
                    {t("dashboards:secretary_dashboard.sort.old_new", "Старее → новее")}
                  </SelectItem>
                  <SelectItem value="title">
                    {t("dashboards:secretary_dashboard.sort.title_az", "Заголовок A→Z")}
                  </SelectItem>
                  <SelectItem value="-title">
                    {t("dashboards:secretary_dashboard.sort.title_za", "Заголовок Z→A")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-28 bg-white">
                  <SelectValue placeholder={t("dashboards:secretary_dashboard.page_size.placeholder", "Порог")} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {t("dashboards:secretary_dashboard.page_size.option", "{{n}}/стр", { n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => journalId && loadArticlesForJournal(journalId)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("dashboards:secretary_dashboard.refresh", "Обновить")}
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setDense((v) => {
                    localStorage.setItem("sec_dense", v ? "0" : "1");
                    return !v;
                  })
                }
              >
                {dense
                    ? t("dashboards:secretary_dashboard.density.compact", "Плотно")
                    : t("dashboards:secretary_dashboard.density.normal", "Обычно")}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRight((v) => !v)}
                title={showRight
                    ? t("dashboards:secretary_dashboard.panel.hide", "Скрыть панель")
                    : t("dashboards:secretary_dashboard.panel.show", "Показать панель")
              }
              >
                {showRight ? (
                  <PanelRightClose className="h-4 w-4 mr-2" />
                ) : (
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                )}
                {t("dashboards:secretary_dashboard.panel.title", "Панель")}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="sec_global_search"
                placeholder={t(
                    "dashboards:secretary_dashboard.search.placeholder",
                    "Поиск по заголовку/автору…  (нажмите / чтобы перейти к поиску)"
                )}
                className="pl-9 bg-white"
                value={globalQuery}
                onChange={(e) => onGlobalSearch(e.target.value)}
              />
            </div>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t("dashboards:secretary_dashboard.quick_filters", "Быстрые фильтры")}
            </Button>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 px-2">
              <KeyboardIcon className="h-3.5 w-3.5" />
              {t(
                  "dashboards:secretary_dashboard.hotkeys_hint",
                  "/ — поиск, R — обновить, O — открыть, S — на скрининг"
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
            {t("dashboards:secretary_dashboard.queues.title", "Очереди")}
          </div>
          <nav className="p-1 space-y-1">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "submitted" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("submitted")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t("dashboards:secretary_dashboard.queues.submitted.title", "Подачи")}
                </span>
                <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                  {submitted.length}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t("dashboards:secretary_dashboard.queues.submitted.desc", "Новые подачи авторов")}
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "screening" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("screening")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  {t("dashboards:secretary_dashboard.queues.screening.title", "Скрининг")}
                </span>
                <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                  {screening.length}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t("dashboards:secretary_dashboard.queues.screening.desc", "Формальная проверка")}
              </div>
            </button>
          </nav>

          <div className="mt-2 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">
              {t("dashboards:secretary_dashboard.batch.title", "Батч-операции")}
            </div>
            {queue === "submitted" ? (
              <div className="grid grid-cols-1 gap-1.5">
                <Button
                  size="sm"
                  className="justify-start bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedIds.size}
                  onClick={() => bulkMoveToScreening(selectedIds)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("dashboards:secretary_dashboard.batch.to_screening", "На скрининг")} ({selectedIds.size})
                </Button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                {t("dashboards:secretary_dashboard.batch.none", "Нет групповых действий")}
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
                            ? t("dashboards:secretary_dashboard.table.select_none", "Снять все")
                            : t("dashboards:secretary_dashboard.table.select_all", "Выбрать все")
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
                    {t("dashboards:secretary_dashboard.table.col_article", "Статья")}
                  </th>
                  <th className="px-3 py-2 text-left w-[160px]">
                    {t("dashboards:secretary_dashboard.table.col_author", "Автор")}
                  </th>
                  <th className="px-3 py-2 text-left w-[160px]">
                    {t("dashboards:secretary_dashboard.table.col_created", "Создана")}
                  </th>
                  <th className="px-3 py-2 text-left w-[140px]">
                    {t("dashboards:secretary_dashboard.table.col_status", "Статус")}
                  </th>
                  <th className="px-3 py-2 text-right w-[260px]">
                    {t("dashboards:secretary_dashboard.table.col_actions", "Действия")}
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
                        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
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
                          aria-label={t("dashboards:secretary_dashboard.table.row_select_aria", "Выбрать строку")}
                        />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="font-medium text-slate-900 truncate">
                          {a.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {t("dashboards:secretary_dashboard.table.journal_id", "Журнал #{{id}}", { id: a.journal })}
                        </div>
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="truncate">{a.author_email ?? "—"}</div>
                      </td>
                      <td className={`px-3 ${rowPad}`}>{fmt(a.created_at)}</td>
                      <td className={`px-3 ${rowPad}`}>
                        <StatusPill status={a.status} />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDetailArticle(a);
                              setShowRight(true);
                            }}
                          >
                            {t("dashboards:secretary_dashboard.actions.details", "Детали")}
                          </Button>

                          {queue === "submitted" ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={async () => {
                                  await moveToScreening(a.id);
                                  await loadArticlesForJournal(journalId);
                                }}
                              >
                                {t("dashboards:secretary_dashboard.actions.to_screening", "На скрининг")}
                              </Button>
                            </>
                          ) : (
                            <Link to={`/articles/${a.id}`}>
                              <Button size="sm" variant="outline">
                                {t("dashboards:secretary_dashboard.actions.open", "Открыть")}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto w-full max-w-md">
                        <div className="text-2xl font-semibold">
                          {t("dashboards:secretary_dashboard.empty.title", "Пока пусто")}
                        </div>
                        <p className="mt-2 text-slate-500">
                          {t("dashboards:secretary_dashboard.empty.desc_prefix", "В очереди")}{" "}
                          <b>
                            {queue === "submitted"
                                ? t("dashboards:secretary_dashboard.empty.queue_submitted", "Submitted")
                                : t("dashboards:secretary_dashboard.empty.queue_screening", "Скрининг")}
                          </b>{" "}
                          {t("dashboards:secretary_dashboard.empty.desc_suffix", "нет статей под текущие фильтры.")}
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGlobalQuery("");
                              journalId && loadArticlesForJournal(journalId);
                            }}
                          >
                            {t("dashboards:secretary_dashboard.empty.reset_search", "Сбросить поиск")}
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
                  {t("dashboards:secretary_dashboard.selection.count", "Выбрано: {{count}}", {
                    count: selectedIds.size,
                  })}
                </div>
                <div className="flex items-center gap-2">
                  {queue === "submitted" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => bulkMoveToScreening(selectedIds)}
                      >
                        {t("dashboards:secretary_dashboard.actions.to_screening", "На скрининг")}
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-1" />
                    {t("dashboards:secretary_dashboard.selection.clear", "Снять выделение")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: details panel (slideover) */}
        <aside
          className={`relative transition-all duration-200 ${showRight ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-2 opacity-0"} `}
        >
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="font-semibold">
                {t("dashboards:secretary_dashboard.details_panel.title", "Панель деталей")}
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
                    {t("dashboards:secretary_dashboard.details.article", "Статья")}
                  </div>
                  <div className="font-medium break-words">
                    {detailArticle.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t("dashboards:secretary_dashboard.details.author_created", "Автор: {{author}} • Создана: {{date}}", {
                      author: detailArticle.author_email ?? "—",
                      date: fmt(detailArticle.created_at),
                    })}
                  </div>
                  <div className="mt-1">
                    <StatusPill status={detailArticle.status} />
                  </div>
                </div>

                {queue === "screening" ? (
                  <InlineScreeningForm
                    articleId={detailArticle.id}
                    onDone={async () => {
                      await loadArticlesForJournal(journalId);
                    }}
                  />
                ) : null}

                <ArticleFiles articleId={detailArticle.id} />

                <div className="pt-1">
                  <Link to={`/articles/${detailArticle.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {t("dashboards:secretary_dashboard.details.open_article_page", "Открыть страницу статьи")}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">
                {t(
                    "dashboards:secretary_dashboard.details.empty_hint",
                    "Выберите строку и нажмите Детали, чтобы посмотреть файлы и скрининг."
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
