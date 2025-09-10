// src/pages/proofreader/ProofreaderDashboard.jsx
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
  CheckSquare,
  Square,
  Upload as UploadIcon,
  BookOpen,
  Plus,
  Hammer,
  CheckCircle2,
  PanelRightOpen,
  PanelRightClose,
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
  listArticleFiles,
  updateArticleStatus,
  uploadProductionPdf,
  deleteArticleFile,
} from "@/services/articlesService";
import {
  listIssues,
  createIssue,
  uploadIssuePdf,
  publishIssue,
  getIssue,
  addArticleToIssue,
  listIssueArticles,
  getNextOrder,
} from "@/services/issuesService";

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

function StatusPill({ status }) {
  const map = {
    accepted: "bg-blue-100 text-blue-700",
    in_production: "bg-amber-100 text-amber-700",
    published: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[status] || "bg-slate-100 text-slate-700"}`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

/* ---------- Files: production PDF mini-view ---------- */
function ProductionFilesCell({ article, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState(null);

  async function refresh() {
    try {
      const list = await listArticleFiles(article.id, { page_size: 50 });
      setFiles(list.filter((f) => f.type === "production_pdf"));
    } catch {
      setFiles([]);
    }
  }

  useEffect(() => {
    refresh(); /* eslint-disable-next-line */
  }, [article.id]);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Загрузите PDF.");
      e.target.value = "";
      return;
    }
    setBusy(true);
    try {
      await uploadProductionPdf(article.id, file);
      await refresh();
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.detail || "Не удалось загрузить PDF");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removeFile(id) {
    if (!confirm("Удалить PDF?")) return;
    setBusy(true);
    try {
      await deleteArticleFile(article.id, id);
      await refresh();
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.detail || "Не удалось удалить файл");
    } finally {
      setBusy(false);
    }
  }

  const hasPdf = (files || []).length > 0;

  return (
    <div className="flex items-center gap-2">
      <label className="inline-flex items-center gap-2">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={busy || article.status === "published"}
          onChange={onUpload}
        />
        <span className="inline-flex items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs">
          <UploadIcon className="h-4 w-4" /> PDF
        </span>
      </label>
      {files === null ? (
        <span className="text-xs text-slate-500">—</span>
      ) : hasPdf ? (
        <div className="flex items-center gap-2">
          {files.map((f) => (
            <a
              key={f.id}
              href={f.file}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline truncate max-w-[140px]"
              title={f.file}
            >
              {fmt(f.uploaded_at)}
            </a>
          ))}
          {article.status !== "published" && (
            <button
              className="text-xs text-slate-500 hover:text-rose-600"
              onClick={() => removeFile(files[0].id)}
              disabled={busy}
              title="Удалить PDF"
            >
              Удалить
            </button>
          )}
        </div>
      ) : (
        <span className="text-xs text-slate-500">нет</span>
      )}
    </div>
  );
}

/* =========================
   Main: Proofreader console
========================= */
export default function ProofreaderDashboard() {
  // layout & UX
  const [dense, setDense] = useState(
    () => (localStorage.getItem("proof_dense") ?? "1") === "1"
  );
  const [showRight, setShowRight] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // access / journals
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [journalId, setJournalId] = useState(null);

  // queues
  const [queue, setQueue] = useState("accepted"); // accepted | in_production | published
  const [accepted, setAccepted] = useState([]);
  const [inProd, setInProd] = useState([]);
  const [published, setPublished] = useState([]);
  const visibleRows = useMemo(
    () =>
      queue === "accepted"
        ? accepted
        : queue === "in_production"
          ? inProd
          : published,
    [queue, accepted, inProd, published]
  );

  // issues
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const candidateIssues = useMemo(
    () =>
      issues.filter(
        (i) =>
          Number(i.journal) === Number(journalId) && i.status !== "published"
      ),
    [issues, journalId]
  );
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [busyIssueId, setBusyIssueId] = useState(null);

  // filters
  const [globalQuery, setGlobalQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [pageSize, setPageSize] = useState(50);
  const searchTimer = useRef(null);

  // selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAllVisible = () =>
    setSelectedIds(new Set(visibleRows.map((r) => r.id)));

  // details
  const [detailArticle, setDetailArticle] = useState(null);

  /* ------------ data loaders ------------ */
  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    try {
      const [a, p, pub] = await Promise.all([
        listArticles({
          status: "accepted",
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
      setAccepted(norm(a));
      setInProd(norm(p));
      setPublished(norm(pub));
      setLastUpdated(new Date());
      clearSelection();
    } catch (e) {
      console.error(e);
    }
  }
  async function loadIssues(jid) {
    setIssuesLoading(true);
    try {
      const list = await listIssues(jid);
      setIssues(Array.isArray(list) ? list : []);
    } finally {
      setIssuesLoading(false);
    }
  }

  // memberships where role === proofreader
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
        const my = rows.filter(
          (m) => String(m.role) === "proofreader" && m.journal
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
    loadIssues(journalId);
    setSelectedIssueId(null);
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, ordering, pageSize]);

  // debounced search
  function onGlobalSearch(v) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setGlobalQuery(v);
    searchTimer.current = setTimeout(
      () => journalId && loadArticlesForJournal(journalId),
      400
    );
  }

  /* ------------ actions ------------ */
  async function startProduction(id) {
    try {
      await updateArticleStatus(id, "in_production");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось перевести в производство");
    }
  }
  async function backToAccepted(id) {
    try {
      await updateArticleStatus(id, "accepted");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось вернуть в 'Принята'");
    }
  }
  async function publishArticle(id) {
    // Требуем наличие production PDF — проверим быстро
    try {
      const files = await listArticleFiles(id, { page_size: 20 });
      const hasPdf = (files || []).some((f) => f.type === "production_pdf");
      if (!hasPdf) {
        alert("Перед публикацией загрузите production PDF.");
        return;
      }
    } catch {}
    try {
      await updateArticleStatus(id, "published");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось опубликовать статью");
    }
  }

  async function addSelectedToIssue(issueId) {
    if (!issueId) return alert("Выберите выпуск.");
    if (selectedIds.size === 0) return alert("Выберите статьи чекбоксами.");
    try {
      let order = await getNextOrder(issueId);
      for (const articleId of selectedIds) {
        try {
          await addArticleToIssue(issueId, { article: articleId, order });
          order += 10;
        } catch (e) {
          console.warn(
            `Не удалось добавить ${articleId}:`,
            e?.response?.data || e
          );
        }
      }
      clearSelection();
      await loadIssues(journalId);
      alert("Статьи добавлены в выпуск.");
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось добавить статьи.");
    }
  }

  async function createIssueAndAdd() {
    const label = window.prompt("Название выпуска (например: Август 2025):");
    if (!label) return;
    try {
      const issue = await createIssue(journalId, label);
      setSelectedIssueId(issue.id);
      await addSelectedToIssue(issue.id);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message || e?.response?.data?.detail || "Не удалось создать выпуск"
      );
    }
  }

  async function uploadIssuePdfAction(id, file) {
    if (!file) return;
    if (file.type !== "application/pdf") return alert("Загрузите PDF.");
    setBusyIssueId(id);
    try {
      await uploadIssuePdf(id, file);
      await loadIssues(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось загрузить PDF выпуска");
    } finally {
      setBusyIssueId(null);
    }
  }

  async function publishIssueNow(id) {
    const issue = await getIssue(id);
    const items = await listIssueArticles(id);
    if (!items.length) return alert("Добавьте в выпуск хотя бы одну статью.");
    if (!issue?.pdf) return alert("Сначала загрузите PDF выпуска.");
    setBusyIssueId(id);
    try {
      await publishIssue(id);
      await loadIssues(journalId);
      alert("Выпуск опубликован");
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message ||
          e?.response?.data?.detail ||
          "Не удалось опубликовать выпуск"
      );
    } finally {
      setBusyIssueId(null);
    }
  }

  // keyboard shortcuts
  const keydown = useCallback(
    (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("proof_global_search")?.focus();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        journalId && loadArticlesForJournal(journalId);
      }
      if (e.key.toLowerCase() === "a") {
        if (selectedIds.size) {
          e.preventDefault();
          if (selectedIssueId) addSelectedToIssue(selectedIssueId);
          else createIssueAndAdd();
        }
      }
      if (e.key.toLowerCase() === "c") {
        if (selectedIds.size) {
          e.preventDefault();
          createIssueAndAdd();
        }
      }
    },
    [journalId, selectedIds, selectedIssueId]
  );
  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  const currentJournal = useMemo(
    () => journals.find((j) => Number(j.id) === Number(journalId)),
    [journals, journalId]
  );

  /* ------------ guards & constants ------------ */
  if (membershipsLoading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Проверяем права корректуры…
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        Нет прав корректуры — доступных журналов не найдено.
      </div>
    );
  }

  const rowPad = dense ? "py-2.5" : "py-4";
  const rowText = dense ? "text-[13px]" : "text-sm";

  const counts = {
    accepted: accepted.length,
    in_production: inProd.length,
    published: published.length,
  };

  /* ------------ UI ------------ */
  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Дашборд корректуры
              </h1>
              <div className="mt-1 text-xs sm:text-sm text-slate-500">
                {currentJournal ? (
                  <>
                    Журнал: <b>{currentJournal.title}</b> • Организация:{" "}
                    <b>{currentJournal.organization ?? "—"}</b>
                  </>
                ) : (
                  "—"
                )}
                {"  "}
                {lastUpdated ? `• Обновлено: ${fmt(lastUpdated)}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={journalId ? String(journalId) : undefined}
                onValueChange={(v) => setJournalId(Number(v))}
              >
                <SelectTrigger className="w-72 bg-white">
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
                <SelectTrigger className="w-44 bg-white">
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
                <SelectTrigger className="w-28 bg-white">
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

              <Button
                variant="outline"
                onClick={() => journalId && loadArticlesForJournal(journalId)}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Обновить
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setDense((v) => {
                    localStorage.setItem("proof_dense", v ? "0" : "1");
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
                id="proof_global_search"
                placeholder="Поиск по заголовку/автору…  (нажмите /)"
                className="pl-9 bg-white"
                value={globalQuery}
                onChange={(e) => onGlobalSearch(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 px-2">
              <KeyboardIcon className="h-3.5 w-3.5" /> / — поиск, R — обновить,
              A — добавить в выпуск, C — создать выпуск и добавить
            </span>
          </div>
        </div>
      </header>

      {/* Content layout */}
      <div className="mx-auto max-w-[1400px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[280px,1fr,420px] gap-4">
        {/* LEFT: queues + issues */}
        <aside className="rounded-xl border border-slate-200 bg-white p-2 sticky top-[68px] h-fit">
          <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-slate-500">
            Очереди
          </div>
          <nav className="p-1 space-y-1">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "accepted" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("accepted")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Приняты
                </span>
                <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                  {counts.accepted}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Готовы к старту производства
              </div>
            </button>
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "in_production" ? "bg-amber-50 text-amber-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("in_production")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <Hammer className="h-4 w-4" /> В производстве
                </span>
                <span className="text-xs rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                  {counts.in_production}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                PDF, корректура, добавление в выпуск
              </div>
            </button>
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "published" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("published")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Опубликовано
                </span>
                <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                  {counts.published}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Готово, для обзора
              </div>
            </button>
          </nav>

          <div className="mt-3 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">Выпуски</div>
            <div className="space-y-2 max-h-[38vh] overflow-auto pr-1">
              {issuesLoading ? (
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Загрузка…
                </div>
              ) : issues.length ? (
                issues.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setSelectedIssueId(i.id)}
                    className={`w-full text-left rounded-md px-2 py-1.5 border ${selectedIssueId === i.id ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:bg-slate-50"}`}
                    title={`Выпуск #${i.id} • ${i.status}`}
                  >
                    <div className="truncate text-sm">{i.label}</div>
                    <div className="text-xs text-slate-500">
                      #{i.id} • {i.status}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-500">Выпусков нет</div>
              )}
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1.5">
              <Button
                size="sm"
                className="justify-start"
                onClick={async () => {
                  const label = window.prompt(
                    "Название выпуска (например: Август 2025):"
                  );
                  if (!label) return;
                  const iss = await createIssue(journalId, label);
                  await loadIssues(journalId);
                  setSelectedIssueId(iss.id);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Создать выпуск
              </Button>
            </div>
          </div>

          {/* Batch */}
          <div className="mt-3 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">
              Групповые действия
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Select
                value={selectedIssueId ? String(selectedIssueId) : undefined}
                onValueChange={(v) => setSelectedIssueId(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выбрать выпуск…" />
                </SelectTrigger>
                <SelectContent>
                  {candidateIssues.map((iss) => (
                    <SelectItem key={iss.id} value={String(iss.id)}>
                      #{iss.id} — {iss.label} ({iss.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedIds.size || !selectedIssueId}
                onClick={() => addSelectedToIssue(selectedIssueId)}
              >
                Добавить в выпуск ({selectedIds.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedIds.size}
                onClick={createIssueAndAdd}
              >
                + Создать выпуск и добавить
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={!selectedIds.size}
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-1" /> Снять выделение
              </Button>
            </div>
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
                          : selectAllVisible()
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
                  <th className="px-3 py-2 text-left w-[180px]">Создана</th>
                  <th className="px-3 py-2 text-left w-[150px]">Статус</th>
                  <th className="px-3 py-2 text-left w-[170px]">
                    Production PDF
                  </th>
                  <th className="px-3 py-2 text-right w-[420px]">Действия</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length ? (
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
                        />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="font-medium text-slate-900 truncate">
                          {a.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          Журнал #{a.journal} • Автор {a.author_email ?? "—"}
                        </div>
                      </td>
                      <td className={`px-3 ${rowPad}`}>{fmt(a.created_at)}</td>
                      <td className={`px-3 ${rowPad}`}>
                        <StatusPill status={a.status} />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <ProductionFilesCell
                          article={a}
                          onChanged={() => loadArticlesForJournal(journalId)}
                        />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {a.status === "accepted" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => startProduction(a.id)}
                            >
                              Начать производство
                            </Button>
                          )}
                          {a.status === "in_production" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => backToAccepted(a.id)}
                              >
                                Снять из прод.
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => publishArticle(a.id)}
                              >
                                Опубликовать
                              </Button>
                            </>
                          )}
                          {a.status === "published" && (
                            <Badge className="bg-emerald-600">
                              Опубликована
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDetailArticle(a);
                              setShowRight(true);
                            }}
                          >
                            Детали
                          </Button>
                          <Link to={`/articles/${a.id}`}>
                            <Button size="sm" variant="outline">
                              Открыть
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      {accepted.length + inProd.length + published.length ===
                      0 ? (
                        <div className="text-slate-500">
                          Нет статей под выбранный журнал.
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          Пусто в этой очереди или ничего не найдено.
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* selection bar */}
          {selectedIds.size > 0 && (
            <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-slate-600">
                  Выбрано: <b>{selectedIds.size}</b>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={
                      selectedIssueId ? String(selectedIssueId) : undefined
                    }
                    onValueChange={(v) => setSelectedIssueId(Number(v))}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Выберите выпуск…" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidateIssues.map((iss) => (
                        <SelectItem key={iss.id} value={String(iss.id)}>
                          #{iss.id} — {iss.label} ({iss.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedIssueId}
                    onClick={() => addSelectedToIssue(selectedIssueId)}
                  >
                    Добавить в выпуск
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={createIssueAndAdd}
                  >
                    + Создать выпуск и добавить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-1" />
                    Снять выделение
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: details & issue panel */}
        <aside
          className={`relative transition-all duration-200 ${showRight ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-2 opacity-0"}`}
        >
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="font-semibold">Панель</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRight(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Article detail */}
            <div className="p-3 space-y-4">
              {detailArticle ? (
                <div className="space-y-2">
                  <div className="text-sm text-slate-500">Статья</div>
                  <div className="font-medium break-words">
                    {detailArticle.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    Автор: {detailArticle.author_email ?? "—"} • Создана:{" "}
                    {fmt(detailArticle.created_at)}
                  </div>
                  <div>
                    <StatusPill status={detailArticle.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    {detailArticle.status === "accepted" && (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => startProduction(detailArticle.id)}
                      >
                        Начать производство
                      </Button>
                    )}
                    {detailArticle.status === "in_production" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => backToAccepted(detailArticle.id)}
                        >
                          Снять из прод.
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => publishArticle(detailArticle.id)}
                        >
                          Опубликовать
                        </Button>
                      </>
                    )}
                    <Link to={`/articles/${detailArticle.id}`}>
                      <Button variant="outline">Открыть карточку</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Выберите строку и нажмите <b>Детали</b>.
                </div>
              )}

              {/* Issue controls */}
              <div className="mt-4 border-t border-slate-200 pt-3">
                <div className="text-sm font-medium mb-2">Выпуск</div>
                {selectedIssueId ? (
                  <IssuePanel
                    issueId={selectedIssueId}
                    busyIssueId={busyIssueId}
                    onUploadPdf={uploadIssuePdfAction}
                    onPublish={publishIssueNow}
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    Выберите выпуск слева, чтобы загрузить PDF и опубликовать.
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Side: single issue controls ---------- */
function IssuePanel({ issueId, busyIssueId, onUploadPdf, onPublish }) {
  const [issue, setIssue] = useState(null);
  const busy = busyIssueId === issueId;

  async function refresh() {
    try {
      const i = await getIssue(issueId);
      setIssue(i);
    } catch {
      setIssue(null);
    }
  }
  useEffect(() => {
    refresh(); /* eslint-disable-next-line */
  }, [issueId, busyIssueId]);

  if (!issue) return <div className="text-sm text-slate-500">—</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm">
        <div className="font-medium break-words">{issue.label}</div>
        <div className="text-xs text-slate-500">
          #{issue.id} • Статус: <b>{issue.status}</b> • Создан:{" "}
          {fmt(issue.created_at)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {issue.pdf ? (
          <a
            href={issue.pdf}
            target="_blank"
            rel="noreferrer"
            className="underline text-sm"
          >
            Скачать PDF
          </a>
        ) : (
          <span className="text-xs text-slate-500">PDF не загружен</span>
        )}

        <label className="inline-flex items-center gap-2">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              onUploadPdf(issueId, f);
              e.target.value = "";
            }}
          />
          <span className="inline-flex items-center gap-2 rounded-md border border-dashed px-3 py-2 cursor-pointer bg-slate-50 hover:bg-slate-100 text-sm">
            <UploadIcon className="h-4 w-4" /> Загрузить PDF
          </span>
        </label>

        {issue.status === "published" ? (
          <Badge className="bg-emerald-600">Опубликован</Badge>
        ) : (
          <Button
            onClick={() => onPublish(issueId)}
            disabled={busy || !issue.pdf}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}{" "}
            Опубликовать
          </Button>
        )}
      </div>
    </div>
  );
}
