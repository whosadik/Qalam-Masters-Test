// src/pages/moderator/ArticleAdmin.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Shield,
  Users,
} from "lucide-react";

import { API } from "@/constants/api";
import { http as axios } from "@/lib/apiClient";
import { listArticleFiles, updateArticle } from "@/services/articlesService";

import { ACT } from "@/constants/permissions";
import { makeUsePermissions } from "@/auth/permissions";

/* ===== метки статусов (дополнил всеми из OpenAPI) ===== */
const STATUS_LABEL = {
  draft: "Черновик",
  submitted: "Отправлена",
  screening: "Скрининг",
  under_review: "На рецензии",
  revision_minor: "Minor revision",
  revision_major: "Major revision",
  accepted: "Принята",
  rejected: "Отклонена",
  in_production: "В продакшене",
  published: "Опубликована",
};

const usePermissions = makeUsePermissions(React);

export default function ArticleAdmin() {
  const { jid, aid } = useParams();
  const journalId = Number(jid);
  const articleId = Number(aid);

  const { loading: aclLoading, can } = usePermissions(journalId);

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data: a } = await axios.get(API.ARTICLE_ID(articleId));
        const f = await listArticleFiles(articleId, { page_size: 200 });
        if (!mounted) return;
        setArticle(a);
        setFiles(f);
      } catch (e) {
        if (!mounted) return;
        const msg =
          e?.response?.data?.detail ||
          e?.message ||
          "Не удалось загрузить статью";
        setError(String(msg));
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [articleId]);

  const setStatus = async (status) => {
    try {
      const updated = await updateArticle(articleId, { status });
      setArticle(updated);
    } catch (e) {
      const msg =
        e?.response?.data?.detail || e?.message || "Не удалось изменить статус";
      alert(msg);
    }
  };

  /* ===== рендер-гарды ===== */
  if (aclLoading || loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Загрузка…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
        <Link to={`/moderator/journals/${journalId}/articles`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад к списку статей
          </Button>
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <Navigate to={`/moderator/journals/${journalId}/articles`} replace />
    );
  }

  /* ===== разрешения на действия ===== */
  const canScreening = can(ACT.ARTICLE_SCREENING);
  const canChangeStatus = can(ACT.ARTICLE_STATUS_CHANGE);
  const canPublish = can(ACT.ISSUE_PUBLISH);

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Статья #{articleId}</h1>
        <Link to={`/moderator/journals/${journalId}/articles`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{article.title}</div>
              <div className="text-sm text-gray-600">
                Автор: {article.author_email} • Журнал #{article.journal}
              </div>
            </div>
            <Badge>{STATUS_LABEL[article.status] || article.status}</Badge>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {/* Скрининг */}
            {canScreening && (
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setStatus("screening")}
              >
                <Shield className="w-4 h-4" /> Скрининг
              </Button>
            )}

            {/* Перевод на рецензию / ревизии / принятие / отклонение */}
            {canChangeStatus && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setStatus("under_review")}
                >
                  <Users className="w-4 h-4" /> На рецензию
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setStatus("revision_minor")}
                >
                  Minor
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setStatus("revision_major")}
                >
                  Major
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setStatus("accepted")}
                >
                  <CheckCircle2 className="w-4 h-4" /> Принять
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setStatus("rejected")}
                >
                  <XCircle className="w-4 h-4" /> Отклонить
                </Button>
              </>
            )}

            {/* Публикация */}
            {canPublish && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setStatus("published")}
              >
                <Send className="w-4 h-4" /> Опубликовать
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="font-semibold mb-2">Файлы</div>
          {files.length === 0 ? (
            <div className="text-gray-500">Файлы не загружены.</div>
          ) : (
            <ul className="list-disc pl-5">
              {files.map((f) => (
                <li key={f.id} className="text-sm">
                  [{f.type}]{" "}
                  <a
                    href={f.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    скачать
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
