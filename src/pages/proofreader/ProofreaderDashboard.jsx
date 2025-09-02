// src/pages/proofreader/ProofreaderDashboard.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Upload as UploadIcon, CheckCircle2, Plus } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import {
  listArticles, listArticleFiles, updateArticleStatus,
  uploadProductionPdf, deleteArticleFile,
} from "@/services/articlesService";

import {
  listIssues, createIssueArticle, getIssuePdfUrl, uploadIssuePdf,
  advanceIssueTo, forceIssueToProduction, getIssue, prettyIssueTitle,
} from "@/services/issuesService";

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

/* ---------- Блок работы с production_pdf для одной статьи (как было) ---------- */
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

  useEffect(() => { refreshFiles(); /* eslint-disable-next-line */ }, [article.id]);

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
    if (!hasPdf) { alert("Нельзя опубликовать без загруженного production_pdf."); return; }
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
    if (file.type !== "application/pdf") { alert("Загрузите, пожалуйста, PDF-файл."); return; }
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
          <Button onClick={startProduction} disabled={busy}>Начать производство</Button>
        )}

        {isInProd && (
          <>
            <label className="inline-flex items-center gap-2">
              <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={busy}/>
              <span className="inline-flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                <UploadIcon className="w-4 h-4" /> Загрузить production PDF
              </span>
            </label>

            <Button onClick={publish} disabled={publishing || busy || !hasPdf}
              className="bg-green-600 hover:bg-green-700"
              title={hasPdf ? "Опубликовать статью" : "Сначала загрузите production_pdf"}>
              {publishing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Публикуем…</>) :
                (<><CheckCircle2 className="w-4 h-4 mr-2" /> Опубликовать</>)}
            </Button>

            <Button variant="outline" onClick={backToAccepted} disabled={busy}>
              Снять из продакшна → Принята
            </Button>
          </>
        )}

        {isPublished && <Badge className="bg-green-600">Опубликована</Badge>}
      </div>

      <div className="rounded-md border p-3">
        <div className="text-sm font-medium mb-2">Файлы статьи</div>
        {loadingFiles ? (
          <div className="text-gray-500 flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Загрузка файлов…
          </div>
        ) : prodPdfs.length ? (
          <ul className="space-y-2">
            {prodPdfs.map((f) => (
              <li key={f.id} className="flex items-center justify-between">
                <a href={f.file} target="_blank" rel="noreferrer" className="underline truncate" title={f.file}>
                  production_pdf — {fmt(f.uploaded_at)}
                </a>
                {article.status !== "published" && (
                  <Button variant="ghost" size="sm" onClick={() => removeFile(f.id)} title="Удалить файл" disabled={busy}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">Нет загруженных production PDF.</div>
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

  // очереди статей (как было)
  const [accepted, setAccepted]   = useState([]);
  const [inProd, setInProd]       = useState([]);
  const [published, setPublished] = useState([]);

  // 🔹 NEW: выпуски
  const [issues, setIssues] = useState([]);
  const [pdfMap, setPdfMap] = useState({}); // {issueId: url|null}
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [busyIssueId, setBusyIssueId] = useState(null);

  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [a, p, pub] = await Promise.all([
        listArticles({ status: "accepted",       journal: jid, ordering: "-created_at", page_size: 50 }),
        listArticles({ status: "in_production",  journal: jid, ordering: "-created_at", page_size: 50 }),
        listArticles({ status: "published",      journal: jid, ordering: "-created_at", page_size: 50 }),
      ]);
      const norm = (x) => (Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : []);
      setAccepted(norm(a));
      setInProd(norm(p));
      setPublished(norm(pub));
    } finally {
      setLoading(false);
    }
  }

  // 🔹 NEW: загрузка выпусков
  async function loadIssues(jid) {
    setIssuesLoading(true);
    try {
      const list = await listIssues(jid);
      setIssues(list);
      const entries = await Promise.all(list.map(async (i) => [i.id, await getIssuePdfUrl(i.id)]));
      setPdfMap(Object.fromEntries(entries));
    } finally {
      setIssuesLoading(false);
    }
  }



  useEffect(() => {
    let mounted = true;
    (async () => {
      setMembershipsLoading(true);
      try {
        const url = withParams(API.JOURNAL_MEMBERSHIPS, { mine: true, page_size: 300 });
        const { data } = await http.get(url);
        const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        const proofRows = rows.filter((m) => String(m.role) === "proofreader" && m.journal);

        const uniqueJids = [...new Set(proofRows.map((m) => Number(m.journal)).filter(Boolean))];

        const fetched = [];
        for (const jid of uniqueJids) {
          try {
            const { data: j } = await http.get(API.JOURNAL_ID(jid));
            fetched.push({ id: Number(j.id), title: j.title || `Журнал #${jid}`, organization: j.organization });
          } catch {
            fetched.push({ id: Number(jid), title: `Журнал #${jid}`, organization: null });
          }
        }

        if (!mounted) return;
        setJournals(fetched);
        setJournalId((prev) => prev ?? (fetched.length === 1 ? fetched[0].id : null));
      } finally {
        if (mounted) setMembershipsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
    loadIssues(journalId); // 🔹 NEW
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId]);

  const currentJournal = useMemo(
    () => journals.find((j) => Number(j.id) === Number(journalId)),
    [journals, journalId]
  );

  // 🔹 NEW: действия с выпуском (inline)
  async function createIssue() {
    const label = window.prompt("Название выпуска (например: Май 2025):");
    if (!label) return;
    try {
 const created = await createIssueArticle(journalId, label);
    // Сразу проталкиваем выпуск в in_production, чтобы был доступен аплоад PDF
    await forceIssueToProduction(created.id); // мягко доводим до in_production
    await loadIssues(journalId);
    alert("Выпуск создан и переведён в производство. Загрузите PDF и опубликуйте.");
    } catch (e) {
      console.error(e?.response?.data || e);
alert(e?.message || e?.response?.data?.detail || "Не удалось создать выпуск");
    }
  }

  async function uploadIssue(id, file) {
    if (!file) return;
    if (file.type !== "application/pdf") { alert("Загрузите PDF."); return; }
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

 async function publishIssueNow(id) {
  if (!pdfMap[id]) { alert("Сначала загрузите PDF."); return; }
  setBusyIssueId(id);
  try {

    const cur = await getIssue(id);
   if (cur.status !== "in_production") await forceIssueToProduction(id);
    await advanceIssueTo(id, "published");
     await loadIssues(journalId);
     alert("Выпуск опубликован");
  } catch (e) {
    console.error(e?.response?.data || e);
alert(e?.message || e?.response?.data?.detail || "Не удалось опубликовать выпуск");
  } finally {
    setBusyIssueId(null);
  }
}

  async function backIssueToProduction(id) {
    setBusyIssueId(id);
    try {
      await forceIssueToProduction(id);
      await loadIssues(journalId);
    } catch (e) {
      console.error(e?.response?.data || e);
 alert(e?.message || e?.response?.data?.detail || "Не удалось сменить статус");
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
    return <div className="p-6">Нет прав корректуры — доступных журналов не найдено.</div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Дашборд корректуры</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Журнал:</span>
          <Select value={journalId ? String(journalId) : undefined} onValueChange={(v) => setJournalId(Number(v))}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Выберите журнал" />
            </SelectTrigger>
            <SelectContent>
              {journals.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentJournal && (
        <div className="text-sm text-gray-600">Организация: <b>{currentJournal.organization ?? "—"}</b></div>
      )}

      {/* 🔹 NEW: Выпуски журнала */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Выпуски журнала</span>
            <Button onClick={createIssue}>
              <Plus className="w-4 h-4 mr-2" /> Создать выпуск
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {issuesLoading ? (
            <div className="text-gray-500 flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Загрузка выпусков…
            </div>
          ) : issues.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {issues.map((i) => {
                const pdf = pdfMap[i.id];
                const busy = busyIssueId === i.id;
                return (
                  <Card key={i.id} className="shadow-sm border border-slate-200 rounded-2xl">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{prettyIssueTitle(i.title)}</div>
                          <div className="text-xs text-gray-500">
                            Выпуск #{i.id} • Статус: <b>{STATUS_LABEL[i.status] || i.status}</b> • Создан {fmt(i.created_at)}
                          </div>
                        </div>
                        <Badge>{STATUS_LABEL[i.status] || i.status}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {pdf ? (
                          <a href={pdf} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="bg-transparent">Скачать PDF</Button>
                          </a>
                        ) : (
                          <Button variant="outline" className="bg-transparent" disabled>PDF не загружен</Button>
                        )}

                        <label className="inline-flex items-center gap-2">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            disabled={busy}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              uploadIssue(i.id, f);
                              e.target.value = "";
                            }}
                          />
                          <span className="inline-flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer">
                            <UploadIcon className="w-4 h-4" /> Загрузить PDF
                          </span>
                        </label>

                        {i.status === "published" ? (
                          <Badge className="bg-green-600">Опубликован</Badge>
                        ) : (
                          <>
                            <Button onClick={() => publishIssueNow(i.id)}
                              disabled={busy || !pdf}
                              className="bg-green-600 hover:bg-green-700">
                              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                              Опубликовать
                            </Button>
                           {i.status !== "in_production" && (
   <Button variant="outline" onClick={() => backIssueToProduction(i.id)} disabled={busy}>
     В производство
   </Button>
 )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500">Выпусков пока нет — создайте первый.</div>
          )}
        </CardContent>
      </Card>

      {/* ===== Ниже оставляем твои существующие очереди по одиночным статьям ===== */}
      {loading ? (
        <div className="p-6 text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
        </div>
      ) : (
        <>
          {/* Accepted */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle>Приняты (Accepted) <span className="text-gray-400">({accepted.length})</span></CardTitle></CardHeader>
            <CardContent className="p-4">
              {accepted.length ? (
                <div className="space-y-4">
                  {accepted.map((a) => (
                    <Card key={a.id} className="shadow-sm border border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{a.title}</div>
                            <div className="text-xs text-gray-500">
                              Журнал #{a.journal} • Автор {a.author_email} • {fmt(a.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                            <Link to={`/articles/${a.id}`}>
                              <Button variant="outline" className="bg-transparent">Открыть</Button>
                            </Link>
                          </div>
                        </div>
                        <ProductionPdfBlock article={a} onChanged={() => loadArticlesForJournal(journalId)} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (<div className="text-gray-500">Нет статей в состоянии “Принята”.</div>)}
            </CardContent>
          </Card>

          {/* In production */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle>В производстве (In production) <span className="text-gray-400">({inProd.length})</span></CardTitle></CardHeader>
            <CardContent className="p-4">
              {inProd.length ? (
                <div className="space-y-4">
                  {inProd.map((a) => (
                    <Card key={a.id} className="shadow-sm border border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{a.title}</div>
                            <div className="text-xs text-gray-500">
                              Журнал #{a.journal} • Автор {a.author_email} • {fmt(a.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                            <Link to={`/articles/${a.id}`}>
                              <Button variant="outline" className="bg-transparent">Открыть</Button>
                            </Link>
                          </div>
                        </div>
                        <ProductionPdfBlock article={a} onChanged={() => loadArticlesForJournal(journalId)} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (<div className="text-gray-500">Сейчас нет статей в производстве.</div>)}
            </CardContent>
          </Card>

          {/* Published (read-only) */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle>Опубликованы (Published) <span className="text-gray-400">({published.length})</span></CardTitle></CardHeader>
            <CardContent className="p-4">
              {published.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {published.map((a) => (
                    <Card key={a.id} className="shadow-sm border border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{a.title}</div>
                            <div className="text-xs text-gray-500">
                              Журнал #{a.journal} • Автор {a.author_email} • {fmt(a.created_at)}
                            </div>
                          </div>
                          <Badge className="bg-green-600">Опубликована</Badge>
                        </div>
                        <div className="mt-3">
                          <Link to={`/articles/${a.id}`}>
                            <Button variant="outline" className="bg-transparent">Открыть карточку</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (<div className="text-gray-500">Опубликованных статей пока нет.</div>)}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
