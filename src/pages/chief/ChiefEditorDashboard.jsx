// src/pages/chief/ChiefEditorDashboard.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const ASSIGNMENTS_URL = "/api/reviews/assignments/";
const isForChief = (as) => ["accepted", "completed"].includes(String(as?.status || ""));

async function fetchAssignmentsFor(articleIds = []) {
  const entries = await Promise.all(
    articleIds.map(async (id) => {
      try {
        const { data } = await http.get(
          withParams(ASSIGNMENTS_URL, { article: id, page_size: 50, ordering: "-created_at" })
        );
        const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        return [id, list];
      } catch {
        return [id, []];
      }
    })
  );
  return Object.fromEntries(entries);
}

/* ---------- main ---------- */
export default function ChiefEditorDashboard() {
  const [loading, setLoading] = useState(true);
  const [membershipsLoading, setMembershipsLoading] = useState(true);

  const [journals, setJournals] = useState([]); // [{id,title,organization}]
  const [journalId, setJournalId] = useState(null);

  const [ceQueue, setCeQueue] = useState([]);        // under_review + accepted/completed assignments
  const [inProduction, setInProduction] = useState([]); // для корректора
  const [published, setPublished] = useState([]);

  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [ur, prod, pub] = await Promise.all([
        listArticles({ status: "under_review", journal: jid, ordering: "-created_at", page_size: 50 }),
        listArticles({ status: "in_production", journal: jid, ordering: "-created_at", page_size: 50 }),
        listArticles({ status: "published", journal: jid, ordering: "-created_at", page_size: 50 }),
      ]);

      const norm = (x) => (Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : []);
      const urRows = norm(ur);

      // выбрать из under_review только те, у которых есть accepted/completed назначения
      const amap = await fetchAssignmentsFor(urRows.map(a => a.id));
      const onlyAccepted = urRows.filter(a => (amap[a.id] || []).some(isForChief));

      setCeQueue(onlyAccepted);
      setInProduction(norm(prod));
      setPublished(norm(pub));
    } finally {
      setLoading(false);
    }
  }

  // memberships where role === "chief_editor"
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMembershipsLoading(true);
      try {
        const url = withParams(API.JOURNAL_MEMBERSHIPS, { mine: true, page_size: 300 });
        const { data } = await http.get(url);
        const rows = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        const my = rows.filter((m) => String(m.role) === "chief_editor" && m.journal);
        const jids = [...new Set(my.map((m) => Number(m.journal)).filter(Boolean))];

        const fetched = [];
        for (const jid of jids) {
          try {
            const { data: j } = await http.get(API.JOURNAL_ID(jid));
            fetched.push({ id: Number(j.id), title: j.title || `Журнал #${jid}`, organization: j.organization });
          } catch {
            fetched.push({ id: Number(jid), title: `Журнал #${jid}`, organization: null });
          }
        }
        if (!mounted) return;
        setJournals(fetched);
        setJournalId(prev => prev ?? (fetched.length === 1 ? fetched[0].id : null));
      } finally {
        if (mounted) setMembershipsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
  }, [journalId]);

  // действия: только маршрутизация дальше
  async function sendToProofreader(id) {
    try {
      await updateArticleStatus(id, "accepted");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("sendToProofreader failed", e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось отправить корректору");
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
        <Loader2 className="h-4 w-4 animate-spin" /> Проверяем права главреда…
      </div>
    );
  }
  if (!journals.length) {
    return <div className="p-6">Нет прав главреда — доступных журналов не найдено.</div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Дашборд главного редактора</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Журнал:</span>
          <Select value={journalId ? String(journalId) : undefined} onValueChange={(v) => setJournalId(Number(v))}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Выберите журнал" /></SelectTrigger>
            <SelectContent>
              {journals.map((j) => (<SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>))}
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
          {/* Очередь главреда: under_review + accepted/completed assignments */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Ожидают решения главреда <span className="text-gray-400">({ceQueue.length})</span></CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {ceQueue.length ? (
                <div className="space-y-4">
                  {ceQueue.map((a) => (
                    <Card key={a.id} className="shadow-sm border border-slate-200">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-xs text-gray-500">
                            Журнал #{a.journal} • Автор {a.author_email} • {fmt(a.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                          <Link to={`/articles/${a.id}`}>
                            <Button variant="outline" className="bg-transparent">Открыть</Button>
                          </Link>
                          <Button onClick={() => sendToProofreader(a.id)} className="bg-indigo-600 hover:bg-indigo-700">
                            Отправить корректору
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">Нет статей, принятых рецензентом.</div>
              )}
            </CardContent>
          </Card>

          {/* В производстве */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>В производстве <span className="text-gray-400">({inProduction.length})</span></CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {inProduction.length ? (
                <div className="space-y-4">
                  {inProduction.map((a) => (
                    <Card key={a.id} className="shadow-sm border border-slate-200">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-xs text-gray-500">Журнал #{a.journal} • {fmt(a.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                          <Link to={`/articles/${a.id}`}>
                            <Button variant="outline" className="bg-transparent">Открыть</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">Пока нет статей в производстве.</div>
              )}
            </CardContent>
          </Card>

          {/* Опубликовано (для обзора) */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Опубликовано <span className="text-gray-400">({published.length})</span></CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {published.length ? (
                <div className="space-y-4">
                  {published.map((a) => (
                    <Card key={a.id} className="shadow-sm border border-slate-200">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-xs text-gray-500">Журнал #{a.journal} • {fmt(a.created_at)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{STATUS_LABEL[a.status] || a.status}</Badge>
                          <Link to={`/articles/${a.id}`}>
                            <Button variant="outline" className="bg-transparent">Открыть</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-gray-500">Пока нет опубликованных статей.</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
