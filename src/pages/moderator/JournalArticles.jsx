// src/pages/moderator/JournalArticles.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ArrowLeft } from "lucide-react";
import { listArticles } from "@/services/articlesService";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { useTranslation } from "react-i18next";

const STATUS = {
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

export default function JournalArticles() {
  const { t } = useTranslation("review");

  // ВАЖНО: если твой роут выглядит как /moderator/journals/:jid/articles,
  // то нужно доставать jid. Оставим fallback на id на всякий случай.
  const { jid, id } = useParams();
  const journalId = Number(jid ?? id);

  const [loading, setLoading] = useState(true);
  const [journal, setJournal] = useState(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    // Если journalId не число — сразу показываем ошибку и не делаем запросы
    if (!Number.isFinite(journalId)) {
      setError(
          t(
          "journal_articles.errors.bad_journal_id",
          "Некорректный ID журнала в URL"
        )
      );
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoading(true);
      setError("");
      try {
        const [{ data: j }, list] = await Promise.all([
          http.get(API.JOURNAL_ID(journalId)),
          listArticles({
            journal: journalId,
            status: status || undefined,
            search: search || undefined,
            page_size: 200,
          }),
        ]);
        if (!mounted) return;
        setJournal(j);
        setItems(list);
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.detail ||
            e?.message ||
            t(
                "journal_articles.errors.load_failed",
                "Не удалось загрузить статьи журнала"
            )
        );
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [journalId, status, search]);

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t("journal_articles.title", "Статьи журнала")}
            </h1>
            <p className="text-gray-600">{journal?.title ||  t("journal_articles.journal_fallback", "Журнал")}</p>
          </div>
        </div>
        <Link to="/moderator">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("journal_articles.back", "Назад")}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-72">
          <Select
            value={status || "__all__"}
            onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t(
                  "journal_articles.filters.status_placeholder",
                  "Статус"
              )} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                {t("journal_articles.filters.all_statuses", "Все статусы")}
              </SelectItem>
              {Object.keys(STATUS).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Input
            placeholder={t(
                "journal_articles.filters.search_placeholder",
                "Поиск по названию/автору…"
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("journal_articles.loading", "Загрузка…")}
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-gray-500">
              {t("journal_articles.empty", "Статей не найдено.")}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((a) => (
                <li key={a.id} className="p-4 hover:bg-slate-50/70 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">
                          {a.title}
                        </h3>
                        <Badge>{STATUS[a.status] || a.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {t("journal_articles.item.author", "Автор:")}{" "}
                         {a.author_email || `user #${a.author}`} •
                        {t("journal_articles.item.created", "Создана:")}{" "}
                        {a.created_at
                          ? new Date(a.created_at).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Link
                        to={`/moderator/journals/${journalId}/articles/${a.id}`}
                      >
                        <Button size="sm" variant="outline" className="gap-2">
                          {t("journal_articles.open", "Открыть")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
