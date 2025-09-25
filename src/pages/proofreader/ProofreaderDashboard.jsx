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
  Wand2
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
  generateIssuePdf,
  publishIssue,
  getIssue,
  addArticleToIssue,
  listIssueArticles,
  getNextOrder,
} from "@/services/issuesService";
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

function StatusPill({ status }) {
  const { t } = useTranslation();
  const map = {
    accepted: "bg-blue-100 text-blue-700",
    in_production: "bg-amber-100 text-amber-700",
    published: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[status] || "bg-slate-100 text-slate-700"}`}
    >
      {t(`dashboards:proofreader_dashboard.status.${status}`, STATUS_LABEL[status] || status)}
    </span>
  );
}

/* ---------- Files: production PDF mini-view ---------- */
function ProductionFilesCell({ article, onChanged }) {
  const { t } = useTranslation();
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
      alert(
          t("dashboards:proofreader_dashboard.alert.upload_pdf_only", "Загрузите PDF.")
      );
      e.target.value = "";
      return;
    }
    setBusy(true);
    try {
      await uploadProductionPdf(article.id, file);
      await refresh();
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.detail ||
          t("dashboards:proofreader_dashboard.alert.upload_pdf_failed", "Не удалось загрузить PDF"));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removeFile(id) {
    if (!confirm(t("dashboards:proofreader_dashboard.confirm.delete_pdf", "Удалить PDF?"))) return;
    setBusy(true);
    try {
      await deleteArticleFile(article.id, id);
      await refresh();
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.detail ||
          t("dashboards:proofreader_dashboard.alert.delete_pdf_failed", "Не удалось удалить файл"));
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
              title={t("dashboards:proofreader_dashboard.tooltip.delete_pdf", "Удалить PDF")}
            >
              {t("dashboards:proofreader_dashboard.actions.delete_pdf", "Удалить")}
            </button>
          )}
        </div>
      ) : (
        <span className="text-xs text-slate-500">{t("dashboards:proofreader_dashboard.pdf.none", "нет")}</span>
      )}
    </div>
  );
}

/* =========================
   Main: Proofreader console
========================= */
export default function ProofreaderDashboard() {
  const { t } = useTranslation();

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
              title: j.title || t("dashboards:proofreader_dashboard.journal.fallback_title", "Журнал") + ` #${jid}`,
              organization: j.organization,
            });
          } catch {
            fetched.push({
              id: Number(jid),
              title: t("dashboards:proofreader_dashboard.journal.fallback_title", "Журнал") + ` #${jid}`,
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
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:proofreader_dashboard.alert.to_production_failed",
              "Не удалось перевести в производство"
          )
      );
    }
  }
  async function backToAccepted(id) {
    try {
      await updateArticleStatus(id, "accepted");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:proofreader_dashboard.alert.back_to_accepted_failed",
              "Не удалось вернуть в 'Принята'"
          )
      );
    }
  }
  async function publishArticle(id) {
    // Требуем наличие production PDF — проверим быстро
    try {
      const files = await listArticleFiles(id, { page_size: 20 });
      const hasPdf = (files || []).some((f) => f.type === "production_pdf");
      if (!hasPdf) {
        alert(
            t(
                "dashboards:proofreader_dashboard.alert.need_production_pdf",
                "Перед публикацией загрузите production PDF."
            )
        );
        return;
      }
    } catch {}
    try {
      await updateArticleStatus(id, "published");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:proofreader_dashboard.alert.publish_article_failed",
              "Не удалось опубликовать статью"
          )
      );
    }
  }

  async function addSelectedToIssue(issueId) {
    if (!issueId) return alert(
        t("dashboards:proofreader_dashboard.alert.choose_issue", "Выберите выпуск.")
    );
    if (selectedIds.size === 0) return alert(
        t(
            "dashboards:proofreader_dashboard.alert.choose_articles",
            "Выберите статьи чекбоксами."
        )
    );
    try {
      let order = await getNextOrder(issueId);
      for (const articleId of selectedIds) {
        try {
          await addArticleToIssue(issueId, { article: articleId, order });
          order += 10;
        } catch (e) {
          console.warn(
              t(
                  "dashboards:proofreader_dashboard.alert.add_article_to_issue_failed_prefix",
                  "Не удалось добавить"
              ) +
              ` ${articleId}:`,
              e?.response?.data || e
          );
        }
      }
      clearSelection();
      await loadIssues(journalId);
      alert(t("dashboards:proofreader_dashboard.alert.added_to_issue", "Статьи добавлены в выпуск."));
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail ||  t("dashboards:proofreader_dashboard.alert.add_to_issue_failed", "Не удалось добавить статьи."));
    }
  }

  async function createIssueAndAdd() {
    const label = window.prompt(
        t(
            "dashboards:proofreader_dashboard.prompt.issue_title",
            "Название выпуска (например: Август 2025):"
        )
    );
    if (!label) return;
    try {
      const issue = await createIssue(journalId, label);
      setSelectedIssueId(issue.id);
      await addSelectedToIssue(issue.id);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message || e?.response?.data?.detail || t("dashboards:proofreader_dashboard.alert.create_issue_failed", "Не удалось создать выпуск")
      );
    }
  }

  async function generateIssuePdfNow(id) {
    setBusyIssueId(id);
    try {
      // Бэк соберёт обложку + статьи и вернёт ссылку на PDF
      const res = await generateIssuePdf(id);
      await loadIssues(journalId);         // обновим список выпусков, чтобы подтянулся issue.pdf
      alert(
          res?.pdf
              ? t("dashboards:proofreader_dashboard.alert.generate_issue_passed", "PDF сгенерирован и прикреплён к выпуску.")
              : t("dashboards:proofreader_dashboard.alert.generate_issue_pass", "PDF сгенерирован.")
      );
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
          e?.response?.data?.detail ||
          "Не удалось сгенерировать PDF. Убедитесь, что в выпуске есть хотя бы одна статья."
      );
    } finally {
      setBusyIssueId(null);
    }
  }


  async function uploadIssuePdfAction(id, file) {
    if (!file) return;
    if (file.type !== "application/pdf") return alert(t("dashboards:proofreader_dashboard.alert.upload_pdf_only", "Загрузите PDF."));
    setBusyIssueId(id);
    try {
      await uploadIssuePdf(id, file);
      await loadIssues(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:proofreader_dashboard.alert.upload_issue_pdf_failed",
              "Не удалось загрузить PDF выпуска"
          )
      );
    } finally {
      setBusyIssueId(null);
    }
  }

  async function publishIssueNow(id) {
    const issue = await getIssue(id);
    const items = await listIssueArticles(id);
    if (!items.length) return alert(
        t(
            "dashboards:proofreader_dashboard.alert.add_at_least_one_article",
            "Добавьте в выпуск хотя бы одну статью."
        )
    );
    if (!issue?.pdf) return alert(
        t(
            "dashboards:proofreader_dashboard.alert.upload_issue_pdf_first",
            "Сначала загрузите PDF выпуска."
        )
    );
    setBusyIssueId(id);
    try {
      await publishIssue(id);
      await loadIssues(journalId);
      alert(t("dashboards:proofreader_dashboard.alert.issue_published", "Выпуск опубликован"));
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message ||
          e?.response?.data?.detail ||
          t("dashboards:proofreader_dashboard.alert.issue_publish_failed", "Не удалось опубликовать выпуск")
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
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("dashboards:proofreader_dashboard.loading.membership", "Проверяем права корректуры…")}
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        {t(
            "dashboards:proofreader_dashboard.empty.no_journals",
            "Нет прав корректуры — доступных журналов не найдено."
        )}
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
                {t("dashboards:proofreader_dashboard.title", "Дашборд корректуры")}
              </h1>
              <div className="mt-1 text-xs sm:text-sm text-slate-500">
                {currentJournal ? (
                  <>
                    {t("dashboards:proofreader_dashboard.journal.label", "Журнал:")}{" "}
                    <b>{currentJournal.title}</b> •{" "}
                    {t("dashboards:proofreader_dashboard.organization.label", "Организация:")}{" "}
                    <b>{currentJournal.organization ?? "—"}</b>
                  </>
                ) : (
                  "—"
                )}
                {"  "}
                {lastUpdated
                    ? `• ${t("dashboards:proofreader_dashboard.updated", "Обновлено:")} ${fmt(lastUpdated)}`
                    : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={journalId ? String(journalId) : undefined}
                onValueChange={(v) => setJournalId(Number(v))}
              >
                <SelectTrigger className="w-72 bg-white">
                  <SelectValue placeholder={t("dashboards:proofreader_dashboard.placeholders.select_journal", "Выберите журнал")} />
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
                  <SelectValue placeholder={t("dashboards:proofreader_dashboard.placeholders.sort", "Сортировка")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">{t("dashboards:proofreader_dashboard.sort.new_old", "Новее → старее")}</SelectItem>
                  <SelectItem value="created_at">{t("dashboards:proofreader_dashboard.sort.old_new", "Старее → новее")}</SelectItem>
                  <SelectItem value="title">{t("dashboards:proofreader_dashboard.sort.title_az", "Заголовок A→Z")}</SelectItem>
                  <SelectItem value="-title">{t("dashboards:proofreader_dashboard.sort.title_za", "Заголовок Z→A")}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-28 bg-white">
                  <SelectValue placeholder={t("dashboards:proofreader_dashboard.placeholders.page_size", "Порог")} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}/{t("dashboards:proofreader_dashboard.per_page", "стр")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => journalId && loadArticlesForJournal(journalId)}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> {t("dashboards:proofreader_dashboard.actions.refresh", "Обновить")}
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
                {dense
                    ? t("dashboards:proofreader_dashboard.density.compact", "Плотно")
                    : t("dashboards:proofreader_dashboard.density.normal", "Обычно")}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRight((v) => !v)}
                title={showRight
                    ? t("dashboards:proofreader_dashboard.tooltip.hide_panel", "Скрыть панель")
                    : t("dashboards:proofreader_dashboard.tooltip.show_panel", "Показать панель")}
              >
                {showRight ? (
                  <PanelRightClose className="h-4 w-4 mr-2" />
                ) : (
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                )}
                {t("dashboards:proofreader_dashboard.panel.title", "Панель")}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="proof_global_search"
                placeholder={t("dashboards:proofreader_dashboard.search.placeholder", "Поиск по заголовку/автору…  (нажмите /)")}
                className="pl-9 bg-white"
                value={globalQuery}
                onChange={(e) => onGlobalSearch(e.target.value)}
              />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 px-2">
              <KeyboardIcon className="h-3.5 w-3.5" />
              {t("dashboards:proofreader_dashboard.hotkeys.hint", "/ — поиск, R — обновить, A — добавить в выпуск, C — создать выпуск и добавить")}
            </span>
          </div>
        </div>
      </header>

      {/* Content layout */}
      <div className="mx-auto max-w-[1400px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[280px,1fr,420px] gap-4">
        {/* LEFT: queues + issues */}
        <aside className="rounded-xl border border-slate-200 bg-white p-2 sticky top-[68px] h-fit">
          <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-slate-500">
            {t("dashboards:proofreader_dashboard.queues.title", "Очереди")}
          </div>
          <nav className="p-1 space-y-1">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "accepted" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("accepted")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> {t("dashboards:proofreader_dashboard.queues.accepted", "Приняты")}
                </span>
                <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                  {counts.accepted}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t("dashboards:proofreader_dashboard.queues.accepted_desc", "Готовы к старту производства")}
              </div>
            </button>
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "in_production" ? "bg-amber-50 text-amber-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("in_production")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <Hammer className="h-4 w-4" /> {t("dashboards:proofreader_dashboard.queues.in_production", "В производстве")}
                </span>
                <span className="text-xs rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                  {counts.in_production}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t("dashboards:proofreader_dashboard.queues.in_production_desc", "PDF, корректура, добавление в выпуск")}
              </div>
            </button>
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "published" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("published")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {t("dashboards:proofreader_dashboard.queues.published", "Опубликовано")}
                </span>
                <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                  {counts.published}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t("dashboards:proofreader_dashboard.queues.published_desc", "Готово, для обзора")}
              </div>
            </button>
          </nav>

          <div className="mt-3 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">
              {t("dashboards:proofreader_dashboard.issues.title", "Выпуски")}
            </div>
            <div className="space-y-2 max-h-[38vh] overflow-auto pr-1">
              {issuesLoading ? (
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("dashboards:proofreader_dashboard.loading.issues", "Загрузка…")}
                </div>
              ) : issues.length ? (
                issues.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setSelectedIssueId(i.id)}
                    className={`w-full text-left rounded-md px-2 py-1.5 border ${selectedIssueId === i.id ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:bg-slate-50"}`}
                    title={`${t("dashboards:proofreader_dashboard.issue", "Выпуск")} #${i.id} • ${i.status}`}
                  >
                    <div className="truncate text-sm">{i.label}</div>
                    <div className="text-xs text-slate-500">
                      #{i.id} • {i.status}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-500">
                  {t("dashboards:proofreader_dashboard.issues.none", "Выпусков нет")}
                </div>
              )}
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1.5">
              <Button
                size="sm"
                className="justify-start"
                onClick={async () => {
                  const label = window.prompt(
                      t(
                          "dashboards:proofreader_dashboard.prompt.issue_title",
                          "Название выпуска (например: Август 2025):"
                      )
                  );
                  if (!label) return;
                  const iss = await createIssue(journalId, label);
                  await loadIssues(journalId);
                  setSelectedIssueId(iss.id);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> {t("dashboards:proofreader_dashboard.actions.create_issue", "Создать выпуск")}
              </Button>
            </div>
          </div>

          {/* Batch */}
          <div className="mt-3 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">
              {t("dashboards:proofreader_dashboard.batch.title", "Групповые действия")}
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <Select
                value={selectedIssueId ? String(selectedIssueId) : undefined}
                onValueChange={(v) => setSelectedIssueId(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("dashboards:proofreader_dashboard.placeholders.choose_issue", "Выбрать выпуск…")} />
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
                {t("dashboards:proofreader_dashboard.actions.add_to_issue_count", "Добавить в выпуск")} ({selectedIds.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedIds.size}
                onClick={createIssueAndAdd}
              >
                {t("dashboards:proofreader_dashboard.actions.create_and_add", "+ Создать выпуск и добавить")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={!selectedIds.size}
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-1" /> {t("dashboards:proofreader_dashboard.actions.clear_selection", "Снять выделение")}
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
                            ? t("dashboards:proofreader_dashboard.tooltip.unselect_all", "Снять все")
                            : t("dashboards:proofreader_dashboard.tooltip.select_all", "Выбрать все")
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
                  <th className="px-3 py-2 text-left">{t("dashboards:proofreader_dashboard.table.article", "Статья")}</th>
                  <th className="px-3 py-2 text-left w-[180px]">{t("dashboards:proofreader_dashboard.table.created", "Создана")}</th>
                  <th className="px-3 py-2 text-left w-[150px]">{t("dashboards:proofreader_dashboard.table.status", "Статус")}</th>
                  <th className="px-3 py-2 text-left w-[170px]">Production PDF</th>
                  <th className="px-3 py-2 text-right w-[420px]">{t("dashboards:proofreader_dashboard.table.actions", "Действия")}</th>
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
                          {t("dashboards:proofreader_dashboard.row.journal", "Журнал")} #{a.journal} • {t("dashboards:proofreader_dashboard.row.author", "Автор")} {a.author_email ?? "—"}
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
                              {t("dashboards:proofreader_dashboard.actions.start_production", "Начать производство")}
                            </Button>
                          )}
                          {a.status === "in_production" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => backToAccepted(a.id)}
                              >
                                {t("dashboards:proofreader_dashboard.actions.remove_from_prod", "Снять из прод.")}
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => publishArticle(a.id)}
                              >
                                {t("dashboards:proofreader_dashboard.actions.publish", "Опубликовать")}
                              </Button>
                            </>
                          )}
                          {a.status === "published" && (
                            <Badge className="bg-emerald-600">
                              {t("dashboards:proofreader_dashboard.badge.published", "Опубликована")}
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
                            {t("dashboards:proofreader_dashboard.actions.details", "Детали")}
                          </Button>
                          <Link to={`/articles/${a.id}`}>
                            <Button size="sm" variant="outline">
                              {t("dashboards:proofreader_dashboard.actions.open", "Открыть")}
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
                          {t("dashboards:proofreader_dashboard.empty.no_articles_for_journal", "Нет статей под выбранный журнал.")}
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          {t("dashboards:proofreader_dashboard.empty.queue_or_search_empty", "Пусто в этой очереди или ничего не найдено.")}
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
                  {t("dashboards:proofreader_dashboard.selected", "Выбрано:")} <b>{selectedIds.size}</b>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={
                      selectedIssueId ? String(selectedIssueId) : undefined
                    }
                    onValueChange={(v) => setSelectedIssueId(Number(v))}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder={t("dashboards:proofreader_dashboard.placeholders.choose_issue", "Выберите выпуск…")} />
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
                    {t("dashboards:proofreader_dashboard.actions.add_to_issue", "Добавить в выпуск")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={createIssueAndAdd}
                  >
                    {t("dashboards:proofreader_dashboard.actions.create_and_add", "+ Создать выпуск и добавить")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-1" />
                    {t("dashboards:proofreader_dashboard.actions.clear_selection", "Снять выделение")}
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
              <div className="font-semibold">
                {t("dashboards:proofreader_dashboard.panel.title", "Панель")}
              </div>
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
                  <div className="text-sm text-slate-500">
                    {t("dashboards:proofreader_dashboard.detail.article", "Статья")}
                  </div>
                  <div className="font-medium break-words">
                    {detailArticle.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t("dashboards:proofreader_dashboard.detail.author", "Автор:")} {detailArticle.author_email ?? "—"} •{" "}
                    {t("dashboards:proofreader_dashboard.detail.created", "Создана:")} {fmt(detailArticle.created_at)}
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
                        {t("dashboards:proofreader_dashboard.actions.start_production", "Начать производство")}
                      </Button>
                    )}
                    {detailArticle.status === "in_production" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => backToAccepted(detailArticle.id)}
                        >
                          {t("dashboards:proofreader_dashboard.actions.remove_from_prod", "Снять из прод.")}
                        </Button>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => publishArticle(detailArticle.id)}
                        >
                          {t("dashboards:proofreader_dashboard.actions.publish", "Опубликовать")}
                        </Button>
                      </>
                    )}
                    <Link to={`/articles/${detailArticle.id}`}>
                      <Button variant="outline">
                        {t("dashboards:proofreader_dashboard.actions.open_card", "Открыть карточку")}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  {t("dashboards:proofreader_dashboard.detail.pick_row", "Выберите строку и нажмите")} <b>{t("dashboards:proofreader_dashboard.actions.details", "Детали")}</b>.
                </div>
              )}

              {/* Issue controls */}
              <div className="mt-4 border-t border-slate-200 pt-3">
                <div className="text-sm font-medium mb-2">
                  {t("dashboards:proofreader_dashboard.issue.title", "Выпуск")}
                </div>
                {selectedIssueId ? (
                  <IssuePanel
                    issueId={selectedIssueId}
                    busyIssueId={busyIssueId}
                    onUploadPdf={uploadIssuePdfAction}
                    onPublish={publishIssueNow}
                    onGenerate={generateIssuePdfNow}
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    {t("dashboards:proofreader_dashboard.issue.pick_left", "Выберите выпуск слева, чтобы загрузить PDF и опубликовать.")}
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
function IssuePanel({ issueId, busyIssueId, onUploadPdf, onPublish, onGenerate  }) {
  const { t } = useTranslation();
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
          #{issue.id} • {t("dashboards:proofreader_dashboard.detail.status", "Статус:")} <b>{issue.status}</b> • {t("dashboards:proofreader_dashboard.detail.created", "Создан:")}{" "}
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
            {t("dashboards:proofreader_dashboard.pdf.download", "Скачать PDF")}
          </a>
        ) : (
          <span className="text-xs text-slate-500">
            {t("dashboards:proofreader_dashboard.pdf.not_uploaded", "PDF не загружен")}
          </span>
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
            <UploadIcon className="h-4 w-4" /> {t("dashboards:proofreader_dashboard.pdf.upload", "Загрузить PDF")}
          </span>
        </label>

        <Button
            variant="outline"
            onClick={() => onGenerate(issueId)}
            disabled={busy || issue?.status === "published"}
            title={t("dashboards:proofreader_dashboard.actions.generate_pdf_hint", "Собрать обложку и подшить статьи")}
        >
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
          {t("dashboards:proofreader_dashboard.actions.generate_pdf", "Сгенерировать PDF")}
        </Button>

        {issue.status === "published" ? (
          <Badge className="bg-emerald-600">{t("dashboards:proofreader_dashboard.badge.issue_published", "Опубликован")}</Badge>
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
            {t("dashboards:proofreader_dashboard.actions.publish", "Опубликовать")}
          </Button>
        )}
      </div>
    </div>
  );
}
