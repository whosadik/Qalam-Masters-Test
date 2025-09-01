// src/pages/moderator/ArticleScreening.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getArticle,
  patchScreening,
  listArticleFiles,
} from "@/services/articlesService";

export default function ArticleScreening() {
  const { aid } = useParams();
  const navigate = useNavigate();

  const [a, setA] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [scopeOk, setScopeOk] = useState(false);
  const [formatOk, setFormatOk] = useState(false);
  const [zgsOk, setZgsOk] = useState(false);
  const [antiplagOk, setAntiplagOk] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const art = await getArticle(aid);
        setA(art);
        const fl = await listArticleFiles(aid);
        setFiles(fl);
      } finally {
        setLoading(false);
      }
    })();
  }, [aid]);

  const submit = async (next_status) => {
    try {
      await patchScreening(aid, {
        scope_ok: !!scopeOk,
        format_ok: !!formatOk,
        zgs_ok: !!zgsOk,
        antiplag_ok: !!antiplagOk,
        notes: notes?.trim() || "",
        next_status, // 'under_review' | 'submitted'
      });
      navigate(-1);
    } catch (e) {
      alert("Не удалось сохранить скрининг");
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Загрузка…</div>;
  if (!a) return <div className="p-6 text-red-600">Статья не найдена</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Скрининг статьи</h1>
          <div className="text-gray-600">{a.title}</div>
          <div className="text-xs text-gray-500">
            Текущий статус: {a.status}
          </div>
        </div>
        <Link to={`/articles/${a.id}`}>
          <Button variant="outline">Открыть статью</Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={scopeOk}
                onChange={(e) => setScopeOk(e.target.checked)}
              />
              <span>Соответствие тематике журнала</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formatOk}
                onChange={(e) => setFormatOk(e.target.checked)}
              />
              <span>Соответствие требованиям оформления</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={zgsOk}
                onChange={(e) => setZgsOk(e.target.checked)}
              />
              <span>Экспертное заключение ЗГС загружено и ок</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={antiplagOk}
                onChange={(e) => setAntiplagOk(e.target.checked)}
              />
              <span>Антиплагиат пройден</span>
            </label>
          </div>

          <div>
            <label className="block text-sm mb-1">
              Примечания для автора/редколлегии
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="text-sm">
            <div className="font-medium mb-2">Файлы автора:</div>
            {files.length ? (
              <ul className="list-disc pl-6">
                {files.map((f) => (
                  <li key={f.id}>
                    {f.type} — {f.file}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">Файлы не загружены</div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => submit("under_review")}>
              Допустить к рецензированию
            </Button>
            <Button variant="outline" onClick={() => submit("submitted")}>
              Вернуть автору
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
