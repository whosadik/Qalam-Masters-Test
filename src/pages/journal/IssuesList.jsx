// src/pages/journal/IssuesList.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { http, withParams } from "@/lib/apiClient";
import { API, BASE_URL } from "@/constants/api";
import { listIssues /*, createIssue*/ } from "@/services/issuesService";
import { useTranslation } from "react-i18next";

// аккуратный формат дат
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU") : "—";

export default function IssuesList() {
  const { t } = useTranslation(["journal_issues"]);

  const { jid } = useParams();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  // роль корректуры в ЭТОМ журнале (только чтобы скрывать/показывать служебные кнопки)
  const amProofreader = useMemo(
    () =>
      memberships.some(
        (m) =>
          String(m.role) === "proofreader" && Number(m.journal) === Number(jid)
      ),
    [memberships, jid]
  );

  const apiOrigin = (() => {
    try {
      return new URL(BASE_URL).origin;
    } catch {
      return window.location.origin;
    }
  })();

  function mediaUrl(u) {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u; // уже абсолютный
    return `${apiOrigin}${u.startsWith("/") ? u : `/${u}`}`;
  }

  // публикуем только опубликованные И для proofreader на этой странице тоже только опубликованные
  const visibleIssues = useMemo(
    () =>
      Array.isArray(issues)
        ? issues.filter((i) => i.status === "published")
        : [],
    [issues]
  );

  // вычисляем адрес ToC (чтобы не улетать на дашборд автора)
  const tocHref = (iid) => `/journals/${jid}/issues/${iid}`;

  const coverUrl = useMemo(() => {
    const raw =
      journal?.logo ||
      journal?.cover ||
      journal?.cover_url ||
      journal?.cover_image ||
      journal?.image ||
      journal?.avatar ||
      null;
    return mediaUrl(raw);
  }, [journal]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 1) мои роли — чтобы скрыть служебные кнопки (но на этой странице мы их всё равно прячем)
        const { data: mem } = await http.get(
          withParams(API.JOURNAL_MEMBERSHIPS, { mine: true, page_size: 300 })
        );
        const rows = Array.isArray(mem?.results)
          ? mem.results
          : Array.isArray(mem)
            ? mem
            : [];
        setMemberships(rows);

        // 2) данные журнала (для обложки и заголовка)
        try {
          const { data: j } = await http.get(API.JOURNAL_ID(jid));
          setJournal(j || null);
        } catch {
          setJournal(null);
        }

        // 3) выпуски журнала
        const list = await listIssues(jid);
        // сортируем опубликованные по published_at (свежие выше)
        list.sort(
          (a, b) =>
            new Date(b.published_at || b.created_at) -
            new Date(a.published_at || a.created_at)
        );
        setIssues(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [jid]);

  // Если очень нужно, можно оставить создание выпуска для корректуры прямо отсюда.
  // Ты писал, что публичная страница — только просмотр, поэтому кнопку убираем полностью.
  // Если захочешь вернуть: раскомментируй createIssue в импорте и этот хэндлер.
  // async function onCreateIssue() {
  //   const label = window.prompt(t("create_issue.prompt_label", "Название выпуска (например: Август 2025):"));
  //   if (!label) return;
  //   try {
  //     const created = await createIssue(jid, label);
  //     navigate(`/proofreader/issues/${created.id}`);
  //   } catch (e) {
  //     console.error(e?.response?.data || e);
  //     alert(e?.response?.data?.detail || t("create_issue.error", "Не удалось создать выпуск"));
  //   }
  // }

  if (loading) {
    return <div className="p-6 text-gray-500">{t("loading", "Загрузка выпусков…")}</div>;
  }

  if (!visibleIssues.length) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">
          {t("issues_title", "Выпуски")}{" "}
           {journal?.title ? `«${journal.title}»` : ""}
        </h1>
        <div className="text-gray-600">{t("no_published_yet", "Опубликованных выпусков пока нет.")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("issues_title", "Выпуски")}{" "} {journal?.title ? `«${journal.title}»` : ""}
        </h1>
        {/* Кнопки для корректора на этой странице скрываем умышленно,
            управление — через ProofreaderDashboard */}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleIssues.map((i) => (
          <Card
            key={i.id}
            className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Обложка журнала */}
            <div className="aspect-[16/9] bg-slate-100">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={journal?.title || t("cover_alt", "Обложка журнала")}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
              )}
            </div>

            <CardHeader>
              <CardTitle className="truncate">{i.label}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="text-xs text-gray-500 space-y-1">
                <div>{t("published_on", "Опубликован:")} {fmtDate(i.published_at)}</div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {i.pdf ? (
                  <a href={i.pdf} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="bg-transparent">
                      {t("download_pdf", "Скачать PDF")}
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" className="bg-transparent" disabled>
                    {t("pdf_missing", "PDF не загружен")}
                  </Button>
                )}

                {/* Оглавление — доступно всем, т.к. показываем только published */}
                <Link to={tocHref(i.id)}>
                  <Button variant="ghost">{t("toc_button", "Оглавление")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
