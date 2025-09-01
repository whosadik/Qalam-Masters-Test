// src/pages/manager/ManagerDashboard.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Upload } from "lucide-react";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import {
  listArticles,
  patchScreening,
  listArticleFiles,
  uploadArticleFile,
  deleteArticleFile,
} from "@/services/articlesService";
import { listAssignments } from "@/services/reviewsService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- helpers / labels ---------- */

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

const FILE_TYPE_LABEL = {
  manuscript: "Manuscript",
  supplement: "Supplement",
  zgs: "ZGS clearance",
  antiplag_report: "Antiplagiarism report",
  response_to_review: "Response to review",
  production_pdf: "Production PDF",
};

const fmt = (iso, tz = "Asia/Almaty") =>
  iso ? new Date(iso).toLocaleString("ru-RU", { timeZone: tz }) : "—";

/* ---------- reusable widgets ---------- */

/** Виджет файлов статьи: список + загрузка + удаление */
function FilesWidget({
  articleId,
  allowUploadTypes = [],
  title = "Файлы статьи",
}) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await listArticleFiles(articleId, {
        ordering: "-uploaded_at",
      });
      setFiles(list || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!articleId) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  async function onUpload(type, file) {
    if (!file) return;
    setBusy(true);
    try {
      await uploadArticleFile(articleId, file, type);
      await refresh();
    } catch (e) {
      console.error("upload failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось загрузить файл");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(fileId) {
    if (!confirm("Удалить файл?")) return;
    setBusy(true);
    try {
      await deleteArticleFile(articleId, fileId);
      await refresh();
    } catch (e) {
      console.error("delete failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось удалить файл");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">{title}</div>

      {/* uploaders */}
      {allowUploadTypes.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {allowUploadTypes.map((t) => (
            <label
              key={t}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer ${
                busy ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              Загрузить {FILE_TYPE_LABEL[t] || t}
              <input
                type="file"
                className="hidden"
                onChange={(e) => onUpload(t, e.target.files?.[0])}
              />
            </label>
          ))}
        </div>
      )}

      {/* list */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-3 text-gray-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Загружаем файлы…
          </div>
        ) : files.length ? (
          <ul className="divide-y">
            {files.map((f) => (
              <li
                key={f.id}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    <a
                      href={f.file}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {FILE_TYPE_LABEL[f.type] || f.type}
                    </a>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {f.id} • {fmt(f.uploaded_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDelete(f.id)}
                  disabled={busy}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-3 text-gray-500">Файлов пока нет.</div>
        )}
      </div>
    </div>
  );
}

/** Read-only список назначений рецензентов */
function AssignmentsList({ articleId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await listAssignments({
        article: articleId,
        ordering: "-created_at",
        page_size: 50,
      });
      setRows(list || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!articleId) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Назначения рецензентов</div>
      <div className="rounded-md border">
        {loading ? (
          <div className="p-3 text-gray-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Загружаем назначения…
          </div>
        ) : rows.length ? (
          <ul className="divide-y">
            {rows.map((r) => (
              <li
                key={r.id}
                className="p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    Reviewer #{r.reviewer} • {r.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    Назначено: {fmt(r.created_at)} • Дедлайн:{" "}
                    {r.due_at ? fmt(r.due_at) : "—"}
                  </div>
                </div>
                {/* read-only; создание/редактирование — только у редакции */}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-3 text-gray-500">Назначений пока нет.</div>
        )}
      </div>
    </div>
  );
}

/** Блок управления скринингом для одной статьи */
function ScreeningControls({ article, onChanged }) {
  const [notes, setNotes] = useState("");
  const [checkAllOk, setCheckAllOk] = useState(true);
  const [busy, setBusy] = useState(false);

  async function finish(to = "under_review") {
    setBusy(true);
    try {
      const payload =
        to === "under_review"
          ? {
              scope_ok: true,
              format_ok: true,
              zgs_ok: true,
              antiplag_ok: true,
              notes,
              next_status: "under_review",
            }
          : {
              // при возврате автору можно явно указать что не ок
              scope_ok: false,
              format_ok: false,
              zgs_ok: false,
              antiplag_ok: false,
              notes: notes || "Требуются доработки по формату/документам",
              next_status: "submitted",
            };

      await patchScreening(article.id, payload);
      onChanged?.();
      setNotes("");
      setCheckAllOk(true);
    } catch (e) {
      console.error("screening action failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Операция скрининга не удалась");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 grid gap-3 ">
      <div className="space-y-2">
        <div className="text-sm font-medium">Заметки по скринингу</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Кратко: что проверить/исправить или комментарий для редакции"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={checkAllOk}
            onChange={(e) => setCheckAllOk(e.target.checked)}
          />
          Все пункты чек-листа ок (scope/format/zgs/antiplag)
        </label>
      </div>

      <div className="flex flex-col gap-2 justify-end">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            checkAllOk ? finish("under_review") : alert("Отметь чек-лист")
          }
          title="Отправить на рецензию"
        >
          Завершить скрининг → На рецензию
        </Button>
      </div>
    </div>
  );
}

/* ---------- main page ---------- */

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(true);

  // менеджерские журналы
  const [managerJournals, setManagerJournals] = useState([]); // [{id,title,organization}]
  const [journalId, setJournalId] = useState(null);

  // очереди статей
  const [submitted, setSubmitted] = useState([]);
  const [screening, setScreening] = useState([]);
  const [inProd, setInProd] = useState([]);

  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [s, sc, p] = await Promise.all([
        listArticles({
          status: "submitted",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
        }),
        listArticles({
          status: "screening",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
        }),
        listArticles({
          status: "in_production",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
        }),
      ]);
      setSubmitted(Array.isArray(s?.results) ? s.results : s || []);
      setScreening(Array.isArray(sc?.results) ? sc.results : sc || []);
      setInProd(Array.isArray(p?.results) ? p.results : p || []);
    } finally {
      setLoading(false);
    }
  }

  // подтянуть журналы, где у меня роль manager
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

        const managerRows = rows.filter(
          (m) => String(m.role) === "manager" && m.journal
        );
        const uniqueJids = [
          ...new Set(managerRows.map((m) => Number(m.journal)).filter(Boolean)),
        ];

        if (uniqueJids.length === 0) {
          if (mounted) {
            setManagerJournals([]);
            setJournalId(null);
          }
          return;
        }

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

        if (mounted) {
          setManagerJournals(fetched);
          setJournalId(
            (prev) => prev ?? (fetched.length === 1 ? fetched[0].id : null)
          );
        }
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
  }, [journalId]);

  const currentJournal = useMemo(
    () => managerJournals.find((j) => Number(j.id) === Number(journalId)),
    [managerJournals, journalId]
  );

  /* ---------- UI ---------- */

  if (membershipsLoading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Проверяем права менеджера…
      </div>
    );
  }

  if (!managerJournals.length) {
    return (
      <div className="p-6">
        Нет прав менеджера — доступных журналов не найдено.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Дашборд менеджера</h1>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Журнал:</span>
          <Select
            value={journalId ? String(journalId) : undefined}
            onValueChange={(v) => setJournalId(Number(v))}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Выберите журнал" />
            </SelectTrigger>
            <SelectContent>
              {managerJournals.map((j) => (
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

      {/* queues */}
      {loading ? (
        <div className="p-6 text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
        </div>
      ) : (
        <>
          {/* Submitted (read-only для менеджера) */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                Новые подачи (Submitted){" "}
                <span className="text-gray-400">({submitted.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {submitted.length ? (
                <ul className="divide-y divide-slate-300 space-y-3">
                  {submitted.map((a) => (
                    <li
                      key={a.id}
                      className="p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{a.title}</div>
                        <div className="text-xs text-gray-500">
                          Журнал #{a.journal} • Автор {a.author_email} •{" "}
                          {fmt(a.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                        <Link to={`/articles/${a.id}`}>
                          <Button variant="outline" className="bg-transparent">
                            Открыть
                          </Button>
                        </Link>
                        {/* Кнопок перевода в screening нет — это делает редакция */}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-gray-500">Заявок нет.</div>
              )}
            </CardContent>
          </Card>

          {/* Screening — основной рабочий блок менеджера */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                Скрининг (Screening){" "}
                <span className="text-gray-400">({screening.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              {screening.length ? (
                <ul className="divide-y divide-slate-600">
                  {screening.map((a) => (
                    <li key={a.id} className="p-4 space-y-3 mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-xs text-gray-500">
                            Журнал #{a.journal} • {fmt(a.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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

                      {/* Управление скринингом */}
                      <ScreeningControls
                        article={a}
                        onChanged={() => loadArticlesForJournal(journalId)}
                      />

                      {/* Файлы: на скрининге обычно zgs/antiplag/supplements */}
                      <FilesWidget
                        articleId={a.id}
                        title="Файлы для скрининга"
                        allowUploadTypes={[
                          "zgs",
                          "antiplag_report",
                          "supplement",
                        ]}
                      />

                      {/* Read-only назначения рецензентов */}
                      <AssignmentsList articleId={a.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-gray-500">
                  Сейчас нет статей на скрининге.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Production — менеджер может вести файлы продакшна, без смены статуса */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                В производстве (In production){" "}
                <span className="text-gray-400">({inProd.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {inProd.length ? (
                <ul className="divide-y divide-slate-100">
                  {inProd.map((a) => (
                    <li key={a.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-xs text-gray-500">
                            Журнал #{a.journal} • {fmt(a.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                          <Link to={`/articles/${a.id}`}>
                            <Button
                              variant="outline"
                              className="bg-transparent"
                            >
                              Открыть
                            </Button>
                          </Link>
                          {/* Публикацию не показываем — смена статуса у редакции */}
                        </div>
                      </div>

                      <FilesWidget
                        articleId={a.id}
                        title="Файлы продакшна"
                        allowUploadTypes={["production_pdf", "supplement"]}
                      />

                      {/* Мониторинг назначений — чтобы видеть, всё ли закрыто */}
                      <AssignmentsList articleId={a.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-gray-500">
                  Нет статей в производстве.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
