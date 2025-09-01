// src/pages/editor/EditorDashboard.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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

/* ---------- назначение рецензента inline ---------- */
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
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        {open ? "Скрыть назначение" : "Назначить рецензента"}
      </Button>
      {open && (
        <div className="rounded-lg border p-3 flex flex-wrap items-center gap-2">
          <input
            type="number"
            placeholder="Reviewer userId"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            className="border rounded px-2 py-1 w-40"
          />
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={blind}
              onChange={(e) => setBlind(e.target.checked)}
            />
            Blind review
          </label>
          <Button
            onClick={submit}
            disabled={busy}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {busy ? "Назначаем..." : "Создать назначение"}
          </Button>
        </div>
      )}
    </div>
  );
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

  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [u, mi, ma] = await Promise.all([
        listArticles({
          status: "under_review",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
        }),
        listArticles({
          status: "revision_minor",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
        }),
        listArticles({
          status: "revision_major",
          journal: jid,
          ordering: "-created_at",
          page_size: 50,
        }),
      ]);
      const norm = (x) =>
        Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : [];
      setUnderReview(norm(u));
      setRevMinor(norm(mi));
      setRevMajor(norm(ma));
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
  }, [journalId]);

  // actions
  async function requestRevision(
    id,
    kind /* "revision_minor" | "revision_major" */
  ) {
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Дашборд редактора</h1>
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

      {loading ? (
        <div className="p-6 text-gray-500 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка статей…
        </div>
      ) : (
        <>
          {/* Under review */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                На рецензии (Under review){" "}
                <span className="text-gray-400">({underReview.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {underReview.length ? (
                <div className="space-y-4">
                  {underReview.map((a) => (
                    <Card
                      key={a.id}
                      className="shadow-sm border border-slate-200"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
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
                            {/* НЕТ Accept/Reject */}
                            <Button
                              variant="outline"
                              onClick={() =>
                                requestRevision(a.id, "revision_minor")
                              }
                            >
                              Minor revision
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                requestRevision(a.id, "revision_major")
                              }
                            >
                              Major revision
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
                  Сейчас нет статей на рецензии.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revision minor */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                Запрошены правки — Minor{" "}
                <span className="text-gray-400">({revMinor.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {revMinor.length ? (
                <div className="space-y-4">
                  {revMinor.map((a) => (
                    <Card
                      key={a.id}
                      className="shadow-sm border border-slate-200"
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-3">
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">
                  Нет статей с minor revision.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revision major */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                Запрошены правки — Major{" "}
                <span className="text-gray-400">({revMajor.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {revMajor.length ? (
                <div className="space-y-4">
                  {revMajor.map((a) => (
                    <Card
                      key={a.id}
                      className="shadow-sm border border-slate-200"
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-3">
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">
                  Нет статей с major revision.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
