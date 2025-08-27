// src/pages/ArticlePage.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getArticle,
  updateArticle,
  deleteArticle,
} from "@/services/articlesService";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

const STATUS_LABEL = {
  draft: "Черновик",
  submitted: "Отправлена",
  screening: "Скрининг",
  under_review: "На рецензии",
  accepted: "Принята",
  rejected: "Отклонена",
};

function statusBadgeClass(status) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800";
    case "under_review":
      return "bg-blue-100 text-blue-800";
    case "screening":
      return "bg-indigo-100 text-indigo-800";
    case "submitted":
      return "bg-amber-100 text-amber-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [journals, setJournals] = useState([]);
  const [form, setForm] = useState({ title: "", journal: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [aRes, jRes] = await Promise.all([
          getArticle(id),
          http.get(API.JOURNALS),
        ]);
        setArticle(aRes);
        setForm({
          title: aRes.title || "",
          journal: String(aRes.journal || ""),
        });
        setJournals(jRes?.data?.results || []);
      } catch (e) {
        setErr("Не удалось загрузить статью");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e) => {
    setErr("");
    setMsg("");
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      // ВАЖНО: автор НЕ отправляет статус. Меняем только то, что ему позволено.
      const payload = {
        title: form.title,
        journal: Number(form.journal),
      };
      const updated = await updateArticle(id, payload, "patch");
      setArticle(updated);
      setMsg("Сохранено");
    } catch (e) {
      const m =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Ошибка сохранения";
      setErr(String(m));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Удалить статью безвозвратно?")) return;
    try {
      await deleteArticle(id);
      navigate("/author-dashboard", { replace: true });
    } catch (e) {
      const m =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Ошибка удаления";
      setErr(String(m));
    }
  };

  const journalTitle = useMemo(() => {
    const j = journals.find((x) => String(x.id) === String(article?.journal));
    return j?.title || (article ? `Журнал #${article.journal}` : "—");
  }, [journals, article]);

  if (loading) return <div className="p-6 text-gray-500">Загрузка…</div>;
  if (!article)
    return <div className="p-6 text-red-600">Статья не найдена</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Назад
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Статья #{article.id}</CardTitle>

            {/* статус — только чтение */}
            <span
              className={`px-2.5 py-1 rounded text-sm ${statusBadgeClass(article.status)}`}
            >
              {STATUS_LABEL[article.status] || article.status || "—"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Журнал: <span className="font-medium">{journalTitle}</span>
          </p>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4">
          {/* Заголовок */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              Заголовок
            </label>
            <Input
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Название статьи"
            />
          </div>

          {/* Журнал — автор может поменять до определённых этапов, бэк всё равно валидирует */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Журнал</label>
            <Select
              value={form.journal}
              onValueChange={(v) => setForm((f) => ({ ...f, journal: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выбрать" />
              </SelectTrigger>
              <SelectContent>
                {journals.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Уведомления об ошибке/успехе */}
          {err && <p className="md:col-span-2 text-sm text-red-600">{err}</p>}
          {msg && <p className="md:col-span-2 text-sm text-green-600">{msg}</p>}

          {/* Действия (без контроля статуса и без "Отправить на скрининг") */}
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> Сохранить
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Удалить
            </Button>
          </div>

          {/* Подсказка по процессу */}
          <div className="md:col-span-2 mt-2 text-sm text-gray-500">
            Статусы меняет редакция в процессе скрининга и рецензирования. Вы
            будете получать уведомления о каждом изменении. Если запросят
            правки, здесь появится возможность загрузить новую версию.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
