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

export default function EditArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState(null);
  if (!open) return null;      
  if (!article) return null;  

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
      alert("Не удалось сохранить изменения.");
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
      alert("Не удалось загрузить файл.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteFile(fileId) {
    if (!confirm("Удалить файл?")) return;
    try {
      await deleteArticleFile(Number(id), Number(fileId));
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (e) {
      console.error("delete file failed", e);
      alert("Не удалось удалить файл.");
    }
  }

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
          className="gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <div className="mt-6">Статья не найдена.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold break-words">
            Редактирование статьи
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
        <Badge>{STATUS_LABEL[article.status] || article.status}</Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Поля статьи</CardTitle>
          <CardDescription>
            Измените метаданные и управляйте файлами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meta" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="meta">Метаданные</TabsTrigger>
              <TabsTrigger value="files">Файлы</TabsTrigger>
            </TabsList>

            {/* META */}
            <TabsContent value="meta" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Название
                </label>
                <Input
                  value={meta.title}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, title: e.target.value }))
                  }
                  placeholder="Название статьи"
                />
              </div>


              <Separator />
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !meta.title.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? "Сохраняю…" : "Сохранить"}
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Отмена
                </Button>
              </div>
            </TabsContent>

            {/* FILES */}
            <TabsContent value="files" className="space-y-4">
              <div className="p-3 rounded-lg border">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      Тип файла
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border p-2 text-sm"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                    >
                      <option value="manuscript">manuscript (рукопись)</option>
                      <option value="zgs">zgs (экспертное заключение)</option>
                      <option value="antiplag_report">
                        antiplag_report (антиплагиат)
                      </option>
                      <option value="supplement">
                        supplement (доп. материалы)
                      </option>
                      <option value="response_to_review">
                        response_to_review
                      </option>
                      <option value="production_pdf">production_pdf</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Загрузить файл
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
                        {uploading ? "Загрузка…" : "Загрузить"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      После выбора файл загрузится автоматически.
                    </p>
                  </div>
                </div>

                {!hasManuscript && (
                  <p className="mt-3 text-sm text-amber-700">
                    Для отправки в редакцию нужна рукопись типа{" "}
                    <b>manuscript</b>.
                  </p>
                )}
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Загруженные файлы</CardTitle>
                  <CardDescription>Открыть / удалить</CardDescription>
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
                                Открыть
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent gap-2"
                              onClick={() => handleDeleteFile(f.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Удалить
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-gray-500">
                      Файлы не прикреплены.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">
                  Готово
                </Button>
                <Link to={`/articles/${article.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <FileText className="h-4 w-4" />
                    Открыть карточку статьи
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
