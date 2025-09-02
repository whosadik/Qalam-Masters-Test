// src/pages/proofreader/ProofreaderDashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Trash2,
  Upload as UploadIcon,
  CheckCircle2,
  Plus,
  BookOpen,
  Wrench,
  CheckCircle,
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

function statusAccent(status) {
  switch (status) {
    case "accepted":
      return "border-l-4 border-l-blue-500";
    case "in_production":
      return "border-l-4 border-l-amber-500";
    case "published":
      return "border-l-4 border-l-emerald-500";
    default:
      return "border-l-4 border-l-slate-300";
  }
}

/* ---------- Production PDF block (UI освежён, функционал прежний) ---------- */
function ProductionPdfBlock({ article, onChanged }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const isAccepted = article.status === "accepted";
  const isInProd = article.status === "in_production";
  const isPublished = article.status === "published";

  const prodPdfs = files.filter((f) => f.type === "production_pdf");
  const hasPdf = prodPdfs.length > 0;

  async function refreshFiles() {
    setLoadingFiles(true);
    try {
      const list = await listArticleFiles(article.id, { page_size: 100 });
      setFiles(list);
    } finally {
      setLoadingFiles(false);
    }
  }

  useEffect(() => {
    refreshFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  async function startProduction() {
    setBusy(true);
    try {
      await updateArticleStatus(article.id, "in_production");
      await onChanged?.();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось перевести в производство");
    } finally {
      setBusy(false);
    }
  }

  async function backToAccepted() {
    setBusy(true);
    try {
      await updateArticleStatus(article.id, "accepted");
      await onChanged?.();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось вернуть в 'Принята'");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!hasPdf) {
      alert("Нельзя опубликовать без загруженного production_pdf.");
      return;
    }
    setPublishing(true);
    try {
      await updateArticleStatus(article.id, "published");
      await onChanged?.();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось опубликовать статью");
    } finally {
      setPublishing(false);
    }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Загрузите, пожалуйста, PDF-файл.");
      return;
    }
    setBusy(true);
    try {
      await uploadProductionPdf(article.id, file);
      await refreshFiles();
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.detail || "Не удалось загрузить PDF");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function removeFile(fileId) {
    if (!confirm("Удалить этот файл?")) return;
    setBusy(true);
    try {
      await deleteArticleFile(article.id, fileId);
      await refreshFiles();
    } catch (err) {
      console.error(err?.response?.data || err);
      alert(err?.response?.data?.detail || "Не удалось удалить файл");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {isAccepted && (
          <Button
            onClick={startProduction}
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Начать производство
          </Button>
        )}

        {isInProd && (
          <>
            <label className="inline-flex items-center gap-2">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onUpload}
                disabled={busy}
              />
              <span className="inline-flex items-center gap-2 border border-dashed rounded-md px-3 py-2 cursor-pointer bg-slate-50 hover:bg-slate-100">
                <UploadIcon className="w-4 h-4" /> Загрузить production PDF
              </span>
            </label>

            <Button
              onClick={publish}
              disabled={publishing || busy || !hasPdf}
              className="bg-emerald-600 hover:bg-emerald-700"
              title={
                hasPdf
                  ? "Опубликовать статью"
                  : "Сначала загрузите production_pdf"
              }
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Публикуем…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Опубликовать
                </>
              )}
            </Button>

            <Button variant="outline" onClick={backToAccepted} disabled={busy}>
              Снять из продакшна → Принята
            </Button>
          </>
        )}

        {isPublished && <Badge className="bg-emerald-600">Опубликована</Badge>}
      </div>

      <div className="rounded-xl border border-dashed bg-slate-50/60 p-3">
        <div className="text-sm font-medium mb-2">Файлы статьи</div>
        {loadingFiles ? (
          <div className="text-gray-500 flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Загрузка файлов…
          </div>
        ) : prodPdfs.length ? (
          <ul className="space-y-2">
            {prodPdfs.map((f) => (
              <li key={f.id} className="flex items-center justify-between">
                <a
                  href={f.file}
                  target="_blank"
                  rel="noreferrer"
                  className="underline truncate"
                  title={f.file}
                >
                  production_pdf — {fmt(f.uploaded_at)}
                </a>
                {article.status !== "published" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(f.id)}
                    title="Удалить файл"
                    disabled={busy}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">
            Нет загруженных production PDF.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Главная страница корректуры ---------- */
export default function ProofreaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(true);

  // журналы, где есть роль proofreader
  const [journals, setJournals] = useState([]);
  const [journalId, setJournalId] = useState(null);

  // очереди статей
  const [accepted, setAccepted] = useState([]);
  const [inProd, setInProd] = useState([]);
  const [published, setPublished] = useState([]);

  // Выпуски
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [busyIssueId, setBusyIssueId] = useState(null);

  // Поиск по вкладкам статей
  const [qAccepted, setQAccepted] = useState("");
  const [qProd, setQProd] = useState("");
  const [qPub, setQPub] = useState("");
  const searchTimer = useRef(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [targetIssueId, setTargetIssueId] = useState(null);

  function debouncedReload(queue, value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (queue === "acc") setQAccepted(value);
    if (queue === "prod") setQProd(value);
    if (queue === "pub") setQPub(value);
    searchTimer.current = setTimeout(() => {
      if (journalId) loadArticlesForJournal(journalId);
    }, 400);
  }

  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [a, p, pub] = await Promise.all([
        listArticles({
          status: "accepted",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
          search: qAccepted || undefined,
        }),
        listArticles({
          status: "in_production",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
          search: qProd || undefined,
        }),
        listArticles({
          status: "published",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
          search: qPub || undefined,
        }),
      ]);
      const norm = (x) =>
        Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : [];
      setAccepted(norm(a));
      setInProd(norm(p));
      setPublished(norm(pub));
    } finally {
      setLoading(false);
    }
  }
  function toggleSelect(id, on = undefined) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const has = next.has(id);
      const shouldAdd = on === undefined ? !has : !!on;
      if (shouldAdd) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }
  const selectedCount = selectedIds.size;

  const candidateIssues = useMemo(
    () =>
      issues.filter(
        (i) =>
          Number(i.journal) === Number(journalId) && i.status !== "published"
      ),
    [issues, journalId]
  );

  // загрузка выпусков
  async function loadIssues(jid) {
    setIssuesLoading(true);
    try {
      const list = await listIssues(jid);
      setIssues(list);
    } finally {
      setIssuesLoading(false);
    }
  }

  useEffect(() => {
    setSelectedIds(new Set());
    setTargetIssueId(null);
  }, [journalId]);

  // создать выпуск
  async function createIssueAction() {
    const label = window.prompt("Название выпуска (например: Август 2025):");
    if (!label) return;
    try {
      await createIssue(journalId, label);
      await loadIssues(journalId);
      alert("Выпуск создан. Загрузите PDF и опубликуйте.");
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message || e?.response?.data?.detail || "Не удалось создать выпуск"
      );
    }
  }
  async function addSelectedToIssue(issueId) {
    if (!issueId) {
      alert("Выберите выпуск.");
      return;
    }
    if (!selectedCount) {
      alert("Выберите статьи чекбоксами.");
      return;
    }
    try {
      let order = await getNextOrder(issueId);
      for (const articleId of selectedIds) {
        try {
          await addArticleToIssue(issueId, { article: articleId, order });
          order += 10;
        } catch (e) {
          console.warn(
            `Не удалось добавить статью ${articleId}:`,
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
      await addSelectedToIssue(issue.id);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message || e?.response?.data?.detail || "Не удалось создать выпуск"
      );
    }
  }

  async function uploadIssueAction(id, file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Загрузите PDF.");
      return;
    }
    setBusyIssueId(id);
    try {
      await uploadIssuePdf(id, file);
      await loadIssues(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось загрузить PDF");
    } finally {
      setBusyIssueId(null);
    }
  }

  // публикация выпуска
  async function publishIssueNow(id) {
    const issue = await getIssue(id);
    const items = await listIssueArticles(id);
    if (!items.length) {
      alert("Сначала добавьте в выпуск хотя бы одну статью.");
      return;
    }
    if (!issue?.pdf) {
      alert("Сначала загрузите PDF выпуска.");
      return;
    }
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
        const proofRows = rows.filter(
          (m) => String(m.role) === "proofreader" && m.journal
        );

        const uniqueJids = [
          ...new Set(proofRows.map((m) => Number(m.journal)).filter(Boolean)),
        ];

        const fetched = [];
        for (const jid of uniqueJids) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId]);

  const currentJournal = useMemo(
    () => journals.find((j) => Number(j.id) === Number(journalId)),
    [journals, journalId]
  );

  async function backIssueToProduction(id) {
    // сохраняем как было (функция не используется здесь)
    setBusyIssueId(id);
    try {
      await forceIssueToProduction(id);
      await loadIssues(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.message || e?.response?.data?.detail || "Не удалось сменить статус"
      );
    } finally {
      setBusyIssueId(null);
    }
  }

  // guards
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

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Дашборд корректуры</h1>
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
        </div>
      </div>

      {currentJournal && (
        <div className="text-sm text-gray-600">
          Организация: <b>{currentJournal.organization ?? "—"}</b>
        </div>
      )}

      {/* ===== TABS ===== */}
      <Tabs
        defaultValue="issues"
        className="space-y-6"
        aria-label="Разделы корректуры"
      >
        <TabsList className="flex w-full overflow-x-auto gap-2 p-1 bg-white shadow-sm rounded-lg sticky top-0 z-10">
          <TabsTrigger
            value="issues"
            className="flex items-center gap-2 shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            <span>Выпуски</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700">
              {issues.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="flex items-center gap-2 shrink-0"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Accepted</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
              {accepted.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="in_production"
            className="flex items-center gap-2 shrink-0"
          >
            <Wrench className="h-4 w-4" />
            <span>In production</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
              {inProd.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="flex items-center gap-2 shrink-0"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Published</span>
            <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
              {published.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB: ISSUES ===== */}
        <TabsContent value="issues" className="space-y-4">
          {/* Header card for issues */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Выпуски журнала</span>
                <Button
                  onClick={createIssueAction}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Создать выпуск
                </Button>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Issues list (separate cards) */}
          <Card className="border-0">
            <CardContent className="p-0">
              {issuesLoading ? (
                <div className="p-4 text-gray-500 flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Загрузка
                  выпусков…
                </div>
              ) : issues.length ? (
                <div className="space-y-4">
                  {issues.map((i) => {
                    const busy = busyIssueId === i.id;
                    return (
                      <Card
                        key={i.id}
                        className="shadow-sm border border-slate-200 rounded-2xl"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium break-words">
                                {i.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                Выпуск #{i.id} • Статус: <b>{i.status}</b> •
                                Создан {fmt(i.created_at)}
                              </div>
                            </div>
                            <Badge>{i.status}</Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {i.pdf ? (
                              <a href={i.pdf} target="_blank" rel="noreferrer">
                                <Button
                                  variant="outline"
                                  className="bg-transparent"
                                >
                                  Скачать PDF
                                </Button>
                              </a>
                            ) : (
                              <Button
                                variant="outline"
                                className="bg-transparent"
                                disabled
                              >
                                PDF не загружен
                              </Button>
                            )}

                            <label className="inline-flex items-center gap-2">
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                disabled={busy}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  uploadIssueAction(i.id, f);
                                  e.target.value = "";
                                }}
                              />
                              <span className="inline-flex items-center gap-2 border border-dashed rounded-md px-3 py-2 cursor-pointer bg-slate-50 hover:bg-slate-100">
                                <UploadIcon className="w-4 h-4" /> Загрузить PDF
                              </span>
                            </label>

                            {i.status === "published" ? (
                              <Badge className="bg-emerald-600">
                                Опубликован
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => publishIssueNow(i.id)}
                                disabled={busy || !i.pdf}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                {busy ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                Опубликовать
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-gray-500">
                  Выпусков пока нет — создайте первый.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB: ACCEPTED ===== */}
        <TabsContent value="accepted" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Приняты (Accepted){" "}
                  <span className="text-gray-400">({accepted.length})</span>
                </span>
                <div className="relative w-full max-w-[480px] ml-4">
                  <Input
                    placeholder="Поиск по Accepted…"
                    value={qAccepted}
                    onChange={(e) => debouncedReload("acc", e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="p-4 text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
            </div>
          ) : accepted.length ? (
            <div className="space-y-4">
              {accepted.map((a) => (
                <Card
                  key={a.id}
                  className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium break-words">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          Журнал #{a.journal} • Автор {a.author_email} •{" "}
                          {fmt(a.created_at)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                        <Link to={`/articles/${a.id}`}>
                          <Button variant="outline" className="bg-transparent">
                            Открыть
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <ProductionPdfBlock
                      article={a}
                      onChanged={() => loadArticlesForJournal(journalId)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">
              Нет статей в состоянии “Принята”.
            </div>
          )}
        </TabsContent>

        {/* ===== TAB: IN PRODUCTION ===== */}
        <TabsContent value="in_production" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  В производстве (In production){" "}
                  <span className="text-gray-400">({inProd.length})</span>
                </span>
                <div className="relative w-full max-w-[480px] ml-4">
                  <Input
                    placeholder="Поиск по In production…"
                    value={qProd}
                    onChange={(e) => debouncedReload("prod", e.target.value)}
                  />
                  <div className="flex flex-wrap items-center gap-2 ml-4">
                    <span className="text-sm text-slate-600">
                      Выбрано: <b>{selectedCount}</b>
                    </span>

                    <Select
                      value={targetIssueId ? String(targetIssueId) : undefined}
                      onValueChange={(v) => setTargetIssueId(Number(v))}
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
                      onClick={() => addSelectedToIssue(targetIssueId)}
                      disabled={!selectedCount || !targetIssueId}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Добавить в выпуск
                    </Button>

                    <Button
                      variant="outline"
                      onClick={createIssueAndAdd}
                      disabled={!selectedCount}
                    >
                      + Создать выпуск и добавить
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={clearSelection}
                      disabled={!selectedCount}
                    >
                      Сбросить выбор
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="p-4 text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
            </div>
          ) : inProd.length ? (
            <div className="space-y-4">
              {inProd.map((a) => (
                <Card
                  key={a.id}
                  className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium break-words">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          Журнал #{a.journal} • Автор {a.author_email} •{" "}
                          {fmt(a.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedIds.has(a.id)}
                          onChange={(e) => toggleSelect(a.id, e.target.checked)}
                          title="Добавить статью в выбранный выпуск"
                        />
                        <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                        <Link to={`/articles/${a.id}`}>
                          <Button variant="outline" className="bg-transparent">
                            Открыть
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <ProductionPdfBlock
                      article={a}
                      onChanged={() => loadArticlesForJournal(journalId)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">
              Сейчас нет статей в производстве.
            </div>
          )}
        </TabsContent>

        {/* ===== TAB: PUBLISHED ===== */}
        <TabsContent value="published" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Опубликованы (Published){" "}
                  <span className="text-gray-400">({published.length})</span>
                </span>
                <div className="relative w-full max-w-[480px] ml-4">
                  <Input
                    placeholder="Поиск по Published…"
                    value={qPub}
                    onChange={(e) => debouncedReload("pub", e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="p-4 text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
            </div>
          ) : published.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {published.map((a) => (
                <Card
                  key={a.id}
                  className={`shadow-sm border border-slate-200 rounded-2xl ${statusAccent(a.status)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium break-words">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          Журнал #{a.journal} • Автор {a.author_email} •{" "}
                          {fmt(a.created_at)}
                        </div>
                      </div>
                      <Badge className="bg-emerald-600">Опубликована</Badge>
                    </div>
                    <div className="mt-3">
                      <Link to={`/articles/${a.id}`}>
                        <Button variant="outline" className="bg-transparent">
                          Открыть карточку
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Опубликованных статей пока нет.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
