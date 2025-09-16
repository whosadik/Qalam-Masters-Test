// src/pages/journal/IssueTocPage.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIssueToc, getIssue } from "@/services/issuesService";
import { useTranslation } from "react-i18next";

export default function IssueTocPage() {
  const { t } = useTranslation(["journal_issues"]);

  const { jid, iid } = useParams();
  const [toc, setToc] = useState(null);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [t, i] = await Promise.all([getIssueToc(iid), getIssue(iid)]);
        setToc(t || null);
        setIssue(i || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [iid]);

  if (loading)
    return <div className="p-6 text-gray-500">{t("toc.loading", "Загрузка оглавления…")}</div>;
  if (!toc) return <div className="p-6">{t("toc.unavailable", "Оглавление недоступно.")}</div>;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {toc.journal ? `«${toc.journal}»` : t("toc.journal_fallback", "Журнал")} —{" "}
          {toc.label || issue?.label || `${t("toc.issue_fallback", "Выпуск")} #${iid}`}
        </h1>
        <Link to={`/journals/${jid}/issues`}>
          <Button variant="outline" className="bg-transparent">
            {t("toc.back_to_all", "← Ко всем выпускам")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("toc.title", "Оглавление")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.isArray(toc.items) && toc.items.length ? (
            <ul className="space-y-2">
              {toc.items.map((it) => (
                <li
                  key={it.article_id}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{it.title}</div>
                    <div className="text-xs text-gray-500">
                      {it.author_email}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {it.start_page}–{it.end_page}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">{t("toc.empty", "Пока пусто.")}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
