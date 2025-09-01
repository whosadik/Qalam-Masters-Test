// src/pages/articles/ArticleView.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getArticle,
  listArticleFiles,
  uploadArticleFile,
  deleteArticleFile,
} from "@/services/articlesService";

export default function ArticleView() {
  const { aid } = useParams();
  const [a, setA] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const art = await getArticle(aid);
      setA(art);
      setFiles(await listArticleFiles(aid));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [aid]);

  const onUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadArticleFile(aid, file, type);
    await reload();
  };

  if (loading) return <div className="p-6 text-gray-500">Загрузка…</div>;
  if (!a) return <div className="p-6 text-red-600">Статья не найдена</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{a.title}</h1>
      <div className="text-gray-600">
        Статус: <b>{a.status}</b>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="font-medium">Файлы</div>
          {files.length ? (
            <ul className="list-disc pl-6">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-3">
                  <span>{f.type}</span>
                  <a
                    href={f.file}
                    className="text-blue-600 underline break-all"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {f.file}
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteArticleFile(a.id, f.id).then(reload)}
                  >
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">Пока нет файлов</div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">
              Загрузить рукопись (manuscript)
              <input
                type="file"
                className="block mt-1"
                onChange={(e) => onUpload(e, "manuscript")}
              />
            </label>
            <label className="text-sm">
              Антиплагиат (antiplag_report)
              <input
                type="file"
                className="block mt-1"
                onChange={(e) => onUpload(e, "antiplag_report")}
              />
            </label>
            <label className="text-sm">
              Экспертное заключение ЗГС (zgs)
              <input
                type="file"
                className="block mt-1"
                onChange={(e) => onUpload(e, "zgs")}
              />
            </label>
            <label className="text-sm">
              Прочее (supplement)
              <input
                type="file"
                className="block mt-1"
                onChange={(e) => onUpload(e, "supplement")}
              />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
