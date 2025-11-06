"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Loader2,
  ArrowLeft,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";

import {
  getArticle,
  updateArticle,
  listArticleFiles,
  uploadArticleFile,
  deleteArticleFile,
} from "@/services/articlesService";
import { useTranslation } from "react-i18next";

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

function StatusBadge({ status }) {
  const base = "px-2 py-0.5 rounded text-xs";
  const label = (key) =>
      window.i18next
          ? window.i18next.t(`articles:edit.status.${key}`, STATUS_LABEL[key])
          : STATUS_LABEL[key];

  return (
      <Badge className={base}>
        {label(status) || status}
      </Badge>
  );
}

export default function EditArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState(null);

  // метаданные (те, что реально есть на вашей Article-схеме)
  const [meta, setMeta] = useState({
    title: "",
    // если появятся поля abstract/keywords на бэке — добавишь тут
  });

  // файлы из API: GET /articles/{id}/files/
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadType, setUploadType] = useState("manuscript");
  const [uploading, setUploading] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [a, f] = await Promise.all([
        getArticle(Number(id)),
        listArticleFiles(Number(id)),
      ]);
      setArticle(a);
      setMeta({ title: a?.title || "" });
      setFiles(Array.isArray(f) ? f : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const hasManuscript = useMemo(
    () => files?.some((f) => f.type === "manuscript"),
    [files]
  );

  async function handleSave() {
    setSaving(true);
    try {
      await updateArticle(
        Number(id),
        { title: String(meta.title || "").trim() },
        "patch"
      );
      await loadAll();
    } catch (e) {
      console.error("save failed", e);
      alert(t("articles:edit.alert.save_failed", "Не удалось сохранить изменения."));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadArticleFile(Number(id), file, uploadType);
      await loadAll();
    } catch (e) {
      console.error("upload failed", e);
      alert(t("articles:edit.alert.upload_failed", "Не удалось загрузить файл."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteFile(fileId) {
    if (!confirm(t("articles:edit.confirm.delete_file", "Удалить файл?"))) return;
    try {
      await deleteArticleFile(Number(id), Number(fileId));
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (e) {
      console.error("delete file failed", e);
      alert(t("articles:edit.alert.delete_failed", "Не удалось удалить файл."));
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("articles:edit.loading", "Загрузка…")}
      </div>
    );
  }
  if (!article) {
    return (
      <div className="p-6">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> {t("articles:edit.action.back", "Назад")}
        </Button>
        <div className="mt-6">{t("articles:edit.not_found", "Статья не найдена.")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold break-words">
            {t("articles:edit.title", "Редактирование статьи")}
          </h1>
          <p className="text-gray-600">
            <Link
              to={`/articles/${article.id}`}
              className="underline underline-offset-2"
            >
              {article.title}
            </Link>
          </p>
        </div>
        <StatusBadge status={article.status} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("articles:edit.section.form_title", "Поля статьи")}</CardTitle>
          <CardDescription>
            {t(
                "articles:edit.section.form_desc",
                "Измените метаданные и управляйте файлами"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meta" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="meta">
                {t("articles:edit.tabs.meta", "Метаданные")}
              </TabsTrigger>
              <TabsTrigger value="files">{t("articles:edit.tabs.files", "Файлы")}</TabsTrigger>
            </TabsList>

            {/* META */}
            <TabsContent value="meta" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("articles:edit.fields.title.label", "Название")}
                </label>
                <Input
                  value={meta.title}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, title: e.target.value }))
                  }
                  placeholder={t(
                      "articles:edit.fields.title.placeholder",
                      "Название статьи"
                  )}
                />
              </div>

              {/* если добавишь на бэке — раскомментируй:
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t("articles:edit.fields.abstract.label", "Аннотация")}</label>
                <Textarea
                  value={meta.abstract || ""}
                  onChange={(e) => setMeta((m) => ({ ...m, abstract: e.target.value }))}
                  placeholder={t("articles:edit.fields.abstract.placeholder", "Краткая аннотация")}
                  className="min-h-[120px]"
                />
              </div>
              */}

              <Separator />
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !meta.title.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving
                      ? t("articles:edit.action.saving", "Сохраняю…")
                      : t("articles:edit.action.save", "Сохранить")
                  }
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  {t("articles:edit.action.cancel", "Отмена")}
                </Button>
              </div>
            </TabsContent>

            {/* FILES */}
            <TabsContent value="files" className="space-y-4">
              <div className="p-3 rounded-lg border">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      {t("articles:edit.files.type.label", "Тип файла")}
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border p-2 text-sm"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                    >
                      <option value="manuscript">
                        {t(
                            "articles:edit.files.type.manuscript_label",
                            "manuscript (рукопись)"
                        )}
                      </option>
                      <option value="zgs">
                        {t(
                            "articles:edit.files.type.zgs_label",
                            "zgs (экспертное заключение)"
                        )}
                      </option>
                      <option value="antiplag_report">
                        {t(
                            "articles:edit.files.type.antiplag_label",
                            "antiplag_report (антиплагиат)"
                        )}
                      </option>
                      <option value="supplement">
                        {t(
                            "articles:edit.files.type.supplement_label",
                            "supplement (доп. материалы)"
                        )}
                      </option>
                      <option value="response_to_review">
                        {t(
                            "articles:edit.files.type.response_label",
                            "response_to_review"
                        )}
                      </option>
                      <option value="production_pdf">
                        {t(
                            "articles:edit.files.type.production_pdf_label",
                            "production_pdf"
                        )}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t("articles:edit.files.upload.label", "Загрузить файл")}
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="file"
                        onChange={handleUpload}
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx"
                      />
                      <Button disabled className="gap-2">
                        <Upload className="h-4 w-4" />
                        {uploading
                            ? t("articles:edit.files.uploading", "Загрузка…")
                            : t("articles:edit.files.upload", "Загрузить")
                        }
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t(
                          "articles:edit.files.hint.auto",
                          "После выбора файл загрузится автоматически."
                      )}
                    </p>
                  </div>
                </div>

                {!hasManuscript && (
                  <p className="mt-3 text-sm text-amber-700">
                    {t(
                        "articles:edit.files.need_manuscript",
                        "Для отправки в редакцию нужна рукопись типа "
                    )}
                    <b>manuscript</b>.
                  </p>
                )}
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("articles:edit.files.list.title", "Загруженные файлы")}</CardTitle>
                  <CardDescription>{t("articles:edit.files.list.subtitle", "Открыть / удалить")}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {files?.length ? (
                    <ul className="divide-y divide-slate-100">
                      {files.map((f) => (
                        <li
                          key={f.id}
                          className="p-4 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-medium">{f.type}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(f.uploaded_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={f.file} target="_blank" rel="noreferrer">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                {t("articles:edit.files.open", "Открыть")}
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent gap-2"
                              onClick={() => handleDeleteFile(f.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("articles:edit.files.delete", "Удалить")}
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-gray-500">
                      {t("articles:edit.files.empty", "Файлы не прикреплены.")}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">
                  {t("articles:edit.action.done", "Готово")}
                </Button>
                <Link to={`/articles/${article.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <FileText className="h-4 w-4" />
                    {t(
                        "articles:edit.action.open_card",
                        "Открыть карточку статьи"
                    )}
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
