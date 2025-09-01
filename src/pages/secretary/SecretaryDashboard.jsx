// src/pages/secretary/SecretaryDashboard.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  RefreshCw,
  Search,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
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

/* ============================================================
   File manager for an article (list/upload/delete)
============================================================ */
function ArticleFiles({ articleId }) {
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
    if (!file) return alert("Выберите файл");
    setUploadBusy(true);
    try {
      await uploadArticleFile(articleId, file, type);
      fileRef.current.value = "";
      await load();
    } catch (e) {
      console.error("upload failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось загрузить файл");
    } finally {
      setUploadBusy(false);
    }
  }

  async function onDelete(fileId) {
    if (!confirm("Удалить файл?")) return;
    try {
      await deleteArticleFile(articleId, fileId);
      await load();
    } catch (e) {
      console.error("delete failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось удалить файл");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">Файлы статьи</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={load}
          title="Обновить файлы"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Upload row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Тип файла" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zgs">ZGS clearance</SelectItem>
            <SelectItem value="antiplag_report">
              Antiplagiarism report
            </SelectItem>
            <SelectItem value="supplement">Supplement</SelectItem>
            {/* manuscript обычно грузит автор; при необходимости раскройте: */}
            {/* <SelectItem value="manuscript">Manuscript</SelectItem> */}
          </SelectContent>
        </Select>
        <Input type="file" ref={fileRef} className="flex-1" />
        <Button onClick={onUpload} disabled={uploadBusy} className="sm:w-48">
          {uploadBusy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Загрузка…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Загрузить
            </>
          )}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Загрузка файлов…
          </div>
        ) : files.length ? (
          files.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {f.type} • {f.file?.split("/").pop() || "file"}
                </div>
                <div className="text-xs text-gray-500">
                  Загружено: {fmt(f.uploaded_at)}
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
                    Открыть
                  </a>
                ) : null}
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onDelete(f.id)}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">Файлов нет.</div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Inline screening form (checklist + actions)
============================================================ */
function InlineScreeningForm({ articleId, onDone }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      onDone?.();
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(
        e?.response?.data?.detail || "Не удалось сохранить результаты скрининга"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium">Скрининг</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-3 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopeOk}
                onChange={(e) => setScopeOk(e.target.checked)}
              />
              Соответствует тематике (scope_ok)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formatOk}
                onChange={(e) => setFormatOk(e.target.checked)}
              />
              Оформление корректно (format_ok)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={zgsOk}
                onChange={(e) => setZgsOk(e.target.checked)}
              />
              Допуск ЗГС получен (zgs_ok)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={antiplagOk}
                onChange={(e) => setAntiplagOk(e.target.checked)}
              />
              Антиплагиат пройден (antiplag_ok)
            </label>
          </div>

          <textarea
            className="w-full border rounded-md p-2 text-sm"
            rows={3}
            placeholder="Заметки/комментарии (необязательно)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={busy}
              onClick={() => submit("under_review")}
              className="bg-blue-600 hover:bg-blue-700"
              title="Все ОК → на рецензию"
            >
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Завершить скрининг → На рецензию
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => submit("submitted")}
              title="Вернуть в очередь подач (например, если не проходит формальные требования)"
            >
              Вернуть в Submitted
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Main dashboard
============================================================ */
export default function SecretaryDashboard() {
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(true);

  // журналы секретаря
  const [journals, setJournals] = useState([]); // [{id,title,organization}]
  const [journalId, setJournalId] = useState(null);

  // очереди
  const [submitted, setSubmitted] = useState([]);
  const [screening, setScreening] = useState([]);

  // поиск/сортировка
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [screeningQuery, setScreeningQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [pageSize, setPageSize] = useState(50);
  const searchTimer = useRef(null);

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
          search: submittedQuery || undefined,
        }),
        listArticles({
          status: "screening",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: screeningQuery || undefined,
        }),
      ]);
      setSubmitted(
        Array.isArray(s?.results) ? s.results : Array.isArray(s) ? s : []
      );
      setScreening(
        Array.isArray(sc?.results) ? sc.results : Array.isArray(sc) ? sc : []
      );
    } finally {
      setLoading(false);
    }
  }

  // подтянуть журналы, где у меня роль secretary
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

  // автоподгрузка статей при смене журнала / сортировки / размера
  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, ordering, pageSize]);

  // debounced поиск
  function onSearchChange(queue, value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (queue === "submitted") setSubmittedQuery(value);
    if (queue === "screening") setScreeningQuery(value);
    searchTimer.current = setTimeout(() => {
      if (journalId) loadArticlesForJournal(journalId);
    }, 400);
  }

  // --- actions ---
  async function moveToScreening(articleId) {
    try {
      await updateArticleStatus(articleId, "screening");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("submitted → screening failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось перевести на скрининг");
    }
  }

  async function returnToDraft(articleId) {
    try {
      await updateArticleStatus(articleId, "draft");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("return to draft failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось вернуть в черновик");
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
        <Loader2 className="h-4 w-4 animate-spin" /> Проверяем права секретаря…
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        Нет прав секретаря — доступных журналов не найдено.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Дашборд секретаря</h1>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Журнал:</span>
          <Select
            value={journalId ? String(journalId) : undefined}
            onValueChange={(v) => setJournalId(Number(v))}
          >
            <SelectTrigger className="w-64">
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

          <Button
            variant="outline"
            onClick={() => journalId && loadArticlesForJournal(journalId)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
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
        <>
          {/* Submitted */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Новые подачи (Submitted){" "}
                  <span className="text-gray-400">({submitted.length})</span>
                </span>
                <div className="relative w-full max-w-[380px] ml-4">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Поиск в Submitted…"
                    className="pl-9"
                    value={submittedQuery}
                    onChange={(e) =>
                      onSearchChange("submitted", e.target.value)
                    }
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {submitted.length ? (
                <div className="grid gap-4">
                  {submitted.map((a) => (
                    <Card
                      key={a.id}
                      className="shadow-sm border border-slate-200 rounded-2xl"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {a.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              Журнал #{a.journal} • Автор {a.author_email} •{" "}
                              {fmt(a.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                            <Link to={`/articles/${a.id}`}>
                              <Button
                                variant="outline"
                                className="bg-transparent"
                              >
                                Открыть
                              </Button>
                            </Link>
                            <Button
                              onClick={() => moveToScreening(a.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              На скрининг
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => returnToDraft(a.id)}
                              title="Вернуть автору как черновик"
                            >
                              В черновик
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <ArticleFiles articleId={a.id} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">Заявок нет.</div>
              )}
            </CardContent>
          </Card>

          {/* Screening */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Скрининг (Screening){" "}
                  <span className="text-gray-400">({screening.length})</span>
                </span>
                <div className="relative w-full max-w-[380px] ml-4">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Поиск в Screening…"
                    className="pl-9"
                    value={screeningQuery}
                    onChange={(e) =>
                      onSearchChange("screening", e.target.value)
                    }
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {screening.length ? (
                <div className="grid gap-4">
                  {screening.map((a) => (
                    <Card
                      key={a.id}
                      className="shadow-sm border border-slate-200 rounded-2xl"
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">
                              {a.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              Журнал #{a.journal} • {fmt(a.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                            <Link to={`/articles/${a.id}`}>
                              <Button
                                variant="outline"
                                className="bg-transparent"
                              >
                                Открыть
                              </Button>
                            </Link>
                          </div>
                        </div>

                        <InlineScreeningForm
                          articleId={a.id}
                          onDone={() => loadArticlesForJournal(journalId)}
                        />

                        <ArticleFiles articleId={a.id} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">
                  Сейчас нет статей на скрининге.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
