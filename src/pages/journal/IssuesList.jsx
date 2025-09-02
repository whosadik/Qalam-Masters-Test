// src/pages/journal/IssuesList.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { listIssues, getIssuePdfUrl, createIssueArticle, prettyIssueTitle } from "@/services/issuesService";

export default function IssuesList() {
  const { jid } = useParams();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [pdfMap, setPdfMap] = useState({}); // {issueId: url|null}
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const amProofreader = useMemo(() => {
    return memberships.some((m) => String(m.role) === "proofreader" && Number(m.journal) === Number(jid));
  }, [memberships, jid]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // мои роли (чтобы показать кнопки управления)
        const { data: mem } = await http.get(withParams(API.JOURNAL_MEMBERSHIPS, { mine: true, page_size: 300 }));
        const rows = Array.isArray(mem?.results) ? mem.results : Array.isArray(mem) ? mem : [];
        setMemberships(rows);

        // выпуски
        const list = await listIssues(jid);
        setIssues(list);

        // подгрузим PDF’ы
        const entries = await Promise.all(
          list.map(async (i) => [i.id, await getIssuePdfUrl(i.id)])
        );
        setPdfMap(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    })();
  }, [jid]);

  async function onCreateIssue() {
    const label = window.prompt("Название выпуска (например: Май 2025):");
    if (!label) return;
    try {
      const created = await createIssueArticle(jid, label);
      navigate(`/proofreader/issues/${created.id}`);
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.detail || "Не удалось создать выпуск");
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Загрузка выпусков…</div>;
  if (!issues.length)
    return (
      <div className="p-6 space-y-4">
        <div className="text-gray-600">Выпусков пока нет.</div>
        {amProofreader && (
          <Button onClick={onCreateIssue} className="bg-indigo-600 hover:bg-indigo-700">Создать выпуск</Button>
        )}
      </div>
    );

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Выпуски</h1>
        {amProofreader && (
          <Button onClick={onCreateIssue} className="bg-indigo-600 hover:bg-indigo-700">Создать выпуск</Button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((i) => {
          const pdf = pdfMap[i.id];
          return (
            <Card key={i.id} className="border border-slate-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{prettyIssueTitle(i.title)}</span>
                  <span className="text-xs text-gray-500">{i.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-500">Создан: {new Date(i.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2 flex-wrap">
                  {pdf ? (
                    <a href={pdf} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="bg-transparent">Скачать PDF</Button>
                    </a>
                  ) : (
                    <Button variant="outline" className="bg-transparent" disabled>PDF не загружен</Button>
                  )}
                  <Link to={`/issues/${i.id}`}>
                    <Button variant="ghost">Оглавление</Button>
                  </Link>
                  {amProofreader && (
                    <Link to={`/proofreader/issues/${i.id}`}>
                      <Button variant="ghost">Управлять</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
