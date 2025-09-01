import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Eye,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Search,
  BookOpen,
  Upload,
} from "lucide-react";

import {
  getArticle,
  listArticleFiles,
  updateArticle,
} from "@/services/articlesService";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

// Метки статусов
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

// Подсказка «что дальше» по статусам
const NEXT_HINTS = {
  draft: {
    title: "Готовы отправить?",
    text: "Загрузите файл рукописи и отправьте статью в редакцию. После отправки редактирование может быть ограничено.",
    icon: Upload,
    tone: "info",
  },
  submitted: {
    title: "Ожидайте скрининг",
    text: "Редакция проверит соответствие требованиям (тематика, оформление, оригинальность). При успехе статья перейдёт на рецензирование.",
    icon: Search,
    tone: "info",
  },
  screening: {
    title: "Идёт проверка редакцией",
    text: "Редакция проводит предварительный просмотр. Возможен возврат в 'submitted' для доработки или перевод на рецензирование.",
    icon: Eye,
    tone: "info",
  },
  under_review: {
    title: "Рецензирование",
    text: "Назначены рецензенты. Ожидайте отзыв(ы). По итогам возможны: принятие, доработки (minor/major) или отклонение.",
    icon: FileText,
    tone: "info",
  },
  revision_minor: {
    title: "Небольшие правки",
    text: "Внесите правки и повторно отправьте материалы. После проверки возможен перевод в 'accepted'.",
    icon: AlertCircle,
    tone: "warning",
  },
  revision_major: {
    title: "Существенные правки",
    text: "Требуются существенные изменения. После доработки повторная проверка редакцией/рецензентами.",
    icon: AlertCircle,
    tone: "warning",
  },
  accepted: {
    title: "Статья принята",
    text: "Материал принят к публикации. Дальше — подготовка к производству и вёрстка.",
    icon: CheckCircle,
    tone: "success",
  },
  in_production: {
    title: "Подготовка к публикации",
    text: "Идёт вёрстка и финальная подготовка текста. После завершения статья будет опубликована.",
    icon: BookOpen,
    tone: "info",
  },
  published: {
    title: "Опубликовано 🎉",
    text: "Статья опубликована. Вы можете поделиться ссылкой и скачать финальный PDF (когда доступен).",
    icon: CheckCircle,
    tone: "success",
  },
  rejected: {
    title: "К сожалению, отклонена",
    text: "Статья не прошла отбор. Ознакомьтесь с комментариями редакции/рецензентов и, при желании, подайте обновлённую версию.",
    icon: AlertCircle,
    tone: "destructive",
  },
};

function StatusBadge({ status }) {
  const base = "px-2 py-0.5 rounded text-xs";
  switch (status) {
    case "accepted":
    case "published":
      return (
        <Badge
          className={`${base} bg-green-100 text-green-800 hover:bg-green-100`}
        >
          {STATUS_LABEL[status]}
        </Badge>
      );
    case "under_review":
    case "in_production":
      return (
        <Badge
          className={`${base} bg-blue-100 text-blue-800 hover:bg-blue-100`}
        >
          {STATUS_LABEL[status]}
        </Badge>
      );
    case "screening":
      return (
        <Badge
          className={`${base} bg-indigo-100 text-indigo-800 hover:bg-indigo-100`}
        >
          {STATUS_LABEL[status]}
        </Badge>
      );
    case "submitted":
      return (
        <Badge
          className={`${base} bg-amber-100 text-amber-800 hover:bg-amber-100`}
        >
          {STATUS_LABEL[status]}
        </Badge>
      );
    case "revision_minor":
    case "revision_major":
      return (
        <Badge
          className={`${base} bg-orange-100 text-orange-800 hover:bg-orange-100`}
        >
          {STATUS_LABEL[status]}
        </Badge>
      );
    case "rejected":
      return (
        <Badge className={`${base} bg-red-100 text-red-800 hover:bg-red-100`}>
          {STATUS_LABEL[status]}
        </Badge>
      );
    default:
      return (
        <Badge
          className={`${base} bg-gray-100 text-gray-800 hover:bg-gray-100`}
        >
          {STATUS_LABEL[status] || status}
        </Badge>
      );
  }
}

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [submittingToEditorial, setSubmittingToEditorial] = useState(false);
  const [files, setFiles] = useState([]);
  const [me, setMe] = useState(null); // чтобы знать роль/почту (опционально)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [a, f, u] = await Promise.all([
          getArticle(Number(id)),
          listArticleFiles(Number(id)),
          http
            .get(API.ME)
            .then((r) => r.data)
            .catch(() => null),
        ]);
        setArticle(a);
        setFiles(f);
        setMe(u);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const hint = useMemo(
    () => (article ? NEXT_HINTS[article.status] : null),
    [article]
  );

  const hasManuscript = useMemo(
    () => files?.some((f) => f.type === "manuscript"),
    [files]
  );

  const canSubmitToEditorial = article?.status === "draft" && hasManuscript;

  if (loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Загрузка…
      </div>
    );
  }
  if (!article) {
    return (
      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <div className="mt-6 text-gray-500">Статья не найдена.</div>
      </div>
    );
  }

  const HintIcon = hint?.icon || Info;

  async function submitToEditorial() {
    try {
      setSubmittingToEditorial(true);
      await updateArticle(article.id, { status: "submitted" }, "patch");
      // после успешной смены — перезагрузим статью и файлы
      const [a, f] = await Promise.all([
        getArticle(Number(id)),
        listArticleFiles(Number(id)),
      ]);
      setArticle(a);
      setFiles(f);
    } catch (e) {
      console.error("submit to editorial failed", e);
      alert("Не удалось отправить в редакцию. Попробуйте позже.");
    } finally {
      setSubmittingToEditorial(false);
    }
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
            {article.title}
          </h1>
          <p className="text-gray-600">
            Журнал:{" "}
            <Link
              to={`/journals/${article.journal}`}
              className="underline underline-offset-2"
            >
              {article.journal_title || `#${article.journal}`}
            </Link>
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={article.status} />
        </div>
      </div>

      {/* Meta */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Создана</p>
              <p className="font-medium">
                {article.created_at
                  ? new Date(article.created_at).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Автор</p>
              <p className="font-medium">{article.author_email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Файлы</p>
              <p className="font-medium">{files?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Что дальше */}
      {hint && (
        <Card
          className={
            hint.tone === "success"
              ? "border-0 shadow-sm bg-green-50"
              : hint.tone === "warning"
                ? "border-0 shadow-sm bg-amber-50"
                : hint.tone === "destructive"
                  ? "border-0 shadow-sm bg-red-50"
                  : "border-0 shadow-sm bg-blue-50"
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <HintIcon className="h-5 w-5" />
              {hint.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-800">
              {hint.text}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      {article.status === "draft" && !hasManuscript && (
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Загрузите рукопись</CardTitle>
            <CardDescription className="text-sm text-amber-800">
              Чтобы отправить в редакцию, прикрепите файл типа «manuscript».
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Мини-таймлайн процесса (статично) */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Этапы процесса</CardTitle>
          <CardDescription>Как статья двигается по пайплайну</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ol className="space-y-3">
            {[
              { key: "draft", label: "Черновик" },
              { key: "submitted", label: "Отправлена" },
              { key: "screening", label: "Скрининг" },
              { key: "under_review", label: "На рецензии" },
              { key: "revision_minor", label: "Minor revision" },
              { key: "revision_major", label: "Major revision" },
              { key: "accepted", label: "Принята" },
              { key: "in_production", label: "В производстве" },
              { key: "published", label: "Опубликована" },
            ].map((step) => {
              const active = article.status === step.key;
              const passed =
                [
                  "submitted",
                  "screening",
                  "under_review",
                  "revision_minor",
                  "revision_major",
                  "accepted",
                  "in_production",
                  "published",
                ].includes(step.key) &&
                [
                  "submitted",
                  "screening",
                  "under_review",
                  "revision_minor",
                  "revision_major",
                  "accepted",
                  "in_production",
                  "published",
                ].indexOf(step.key) <=
                  [
                    "submitted",
                    "screening",
                    "under_review",
                    "revision_minor",
                    "revision_major",
                    "accepted",
                    "in_production",
                    "published",
                  ].indexOf(article.status);

              return (
                <li key={step.key} className="flex items-center gap-3">
                  <span
                    className={[
                      "inline-flex h-5 w-5 rounded-full border-2",
                      active
                        ? "border-blue-600 bg-blue-600"
                        : passed
                          ? "border-blue-600"
                          : "border-gray-300",
                    ].join(" ")}
                  />
                  <span className={active ? "font-semibold" : "text-gray-700"}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {/* Файлы */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Файлы</CardTitle>
          <CardDescription>Загруженные материалы</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {files?.length ? (
            <ul className="divide-y divide-slate-100">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{f.type}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(f.uploaded_at).toLocaleString()}
                    </div>
                  </div>
                  <a href={f.file} target="_blank" rel="noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Открыть
                    </Button>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-gray-500">Файлы не прикреплены.</div>
          )}
        </CardContent>
      </Card>

      {/* Навигация */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <div className="flex gap-2">
          {article.status === "draft" && (
            <Button
              onClick={submitToEditorial}
              disabled={!canSubmitToEditorial || submittingToEditorial}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submittingToEditorial ? "Отправляем…" : "Отправить в редакцию"}
            </Button>
          )}
          <Link to="/author-dashboard">
            <Button variant="outline" className="bg-transparent">
              К списку статей
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// запасной икон-компонент, если вдруг понадобился
function Info(props) {
  return <AlertCircle {...props} />;
}
