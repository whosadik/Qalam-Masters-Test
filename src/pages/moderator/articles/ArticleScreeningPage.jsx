// src/pages/moderator/articles/ArticleScreeningPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import PlagiarismPanel from "@/components/plagiarism/PlagiarismPanel";
const typeLabel = {
  manuscript: "Рукопись",
  supplement: "Доп. файл",
  zgs: "Заключение ЗГС",
  antiplag_report: "Отчёт Антиплагиат",
  response_to_review: "Ответ рецензентам",
  production_pdf: "Финальный PDF",
};

export default function ArticleScreeningPage() {
  const { aid } = useParams(); // /moderator/articles/:aid/screening
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [article, setArticle] = useState(null);
  const [files, setFiles] = useState([]);

  // форма скрининга
  const [scopeOk, setScopeOk] = useState(false);
  const [formatOk, setFormatOk] = useState(false);
  const [zgsOk, setZgsOk] = useState(false);
  const [antiplagOk, setAntiplagOk] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data: a } = await http.get(API.ARTICLE_ID(aid));
        const { data: fl } = await http.get(
          withParams(API.ARTICLE_FILES(aid), { page_size: 200 })
        );

        if (!mounted) return;
        setArticle(a);

        const list = Array.isArray(fl?.results)
          ? fl.results
          : Array.isArray(fl)
            ? fl
            : [];
        setFiles(list);

        // опционально: автозаполнение чеков по наличию файлов
        setZgsOk(list.some((f) => f.type === "zgs"));
        setAntiplagOk(list.some((f) => f.type === "antiplag_report"));
      } catch (e) {
        if (!mounted) return;
        const msg =
          e?.response?.data?.detail ||
          e?.message ||
          "Не удалось загрузить статью";
        setErr(String(msg));
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [aid]);

  const patchScreening = async (next_status) => {
    setErr("");
    try {
      await http.patch(API.ARTICLE_SCREENING(aid), {
        scope_ok: scopeOk,
        format_ok: formatOk,
        zgs_ok: zgsOk,
        antiplag_ok: antiplagOk,
        notes: notes || "",
        next_status, // "under_review" | "submitted"
      });
      // после успешного скрининга — назад в карточку статьи/список
      navigate(`/moderator/articles/${aid}`, { replace: true });
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        typeof data === "string"
          ? data
          : data?.detail
            ? data.detail
            : JSON.stringify(data, null, 2);
      setErr(msg || "Не удалось сохранить скрининг.");
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Загрузка…</div>;
  if (!article) {
    return (
      <div className="p-6 text-red-600">
        Не найдена статья #{aid}. <Link to="/moderator">Назад</Link>
      </div>
    );
  }

  const mustDisable =
    article.status !== "submitted" && article.status !== "screening";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Скрининг статьи</h1>
        <div className="flex gap-2">
          <Link to={`/moderator/articles/${aid}`}>
            <Button variant="outline">Назад к статье</Button>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Статья</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-lg font-semibold">{article.title}</div>
          <div className="text-sm text-gray-600">
            Журнал: {article.journal_title || article.journal} • Статус:{" "}
            <span className="font-medium">{article.status}</span> • Автор:{" "}
            {article.author} • Создана:{" "}
            {article.created_at
              ? new Date(article.created_at).toLocaleString("ru-RU")
              : "—"}
          </div>
        </CardContent>
      </Card>

       <PlagiarismPanel
        article={article}
        files={files}
        currentUser={{role:"secretary"}}
        authorAccess="submit"
        onStoreStrike={null}
      />

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Файлы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {files.length === 0 ? (
            <div className="text-gray-500">Файлы не загружены.</div>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {typeLabel[f.type] || f.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {f.id} • Загружен:{" "}
                      {f.uploaded_at
                        ? new Date(f.uploaded_at).toLocaleString("ru-RU")
                        : "—"}
                    </div>
                  </div>
                  <a
                    href={f.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline text-sm shrink-0"
                  >
                    Открыть
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Чек-лист скрининга</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3">
            <Input
              type="checkbox"
              checked={scopeOk}
              onChange={(e) => setScopeOk(e.target.checked)}
            />
            <span>Соответствует тематике журнала</span>
          </label>

          <label className="flex items-center gap-3">
            <Input
              type="checkbox"
              checked={formatOk}
              onChange={(e) => setFormatOk(e.target.checked)}
            />
            <span>Оформление по правилам (шаблон, ссылки, структура)</span>
          </label>

          <label className="flex items-center gap-3">
            <Input
              type="checkbox"
              checked={zgsOk}
              onChange={(e) => setZgsOk(e.target.checked)}
            />
            <span>Есть заключение ЗГС (при необходимости)</span>
          </label>

          <label className="flex items-center gap-3">
            <Input
              type="checkbox"
              checked={antiplagOk}
              onChange={(e) => setAntiplagOk(e.target.checked)}
            />
            <span>Пройден антиплагиат / загружен отчёт</span>
          </label>

          <div>
            <label className="block text-sm mb-1">Примечания</label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => patchScreening("submitted")}
              disabled={mustDisable}
              title={
                mustDisable
                  ? "Доступно для статусов submitted/screening"
                  : undefined
              }
            >
              Вернуть автору (исправить)
            </Button>
            <Button
              onClick={() => patchScreening("under_review")}
              disabled={mustDisable || !(scopeOk && formatOk)}
              title={
                mustDisable
                  ? "Доступно для статусов submitted/screening"
                  : !(scopeOk && formatOk)
                    ? "Отметьте соответствие тематике и оформлению"
                    : undefined
              }
            >
              Допустить к рецензированию
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
