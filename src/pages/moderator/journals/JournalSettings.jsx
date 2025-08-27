import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2 } from "lucide-react";

const KEY_JOURNALS = "myOrgJournals";

// Пресеты
const TOPIC_OPTIONS = [
  "Естественные и технические науки",
  "Гуманитарные дисциплины",
  "Информационные технологии",
  "Экономика и менеджмент",
  "Юриспруденция",
  "Образование и педагогика",
  "Психология",
];

export default function JournalSettings() {
  const { jid } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  // загрузить запись из localStorage
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
    const j = list.find((x) => String(x.id) === String(jid));
    setForm(
      j || {
        id: Number(jid),
        name: "",
        issn: "",
        site: "",
        email: "",
        lang: "ru",
        periodicity: "quarterly",
        description: "",
        mission: "",
        audience: "",
        ethics: "",
        topics: [],
        editorial: [{ role: "Главный редактор", name: "" }],
        forAuthors: {
          fee: "",
          firstDecision: "",
          reviewTime: "",
          publication: "",
        },
        coverUrl: "",
      }
    );
  }, [jid]);

  if (!form) return null;

  // универсальные хэндлеры
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const onChangeFA = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, forAuthors: { ...f.forAuthors, [name]: value } }));
  };
  const onTopicsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, topics: selected }));
  };

  // редакколлегия
  const editEditorial = (idx, key, value) => {
    setForm((f) => {
      const arr = [...(Array.isArray(f.editorial) ? f.editorial : [])];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...f, editorial: arr };
    });
  };
  const addEditorial = () =>
    setForm((f) => ({
      ...f,
      editorial: [...(f.editorial || []), { role: "", name: "" }],
    }));
  const removeEditorial = (idx) =>
    setForm((f) => ({
      ...f,
      editorial: (f.editorial || []).filter((_, i) => i !== idx),
    }));

  // обложка
  const onCoverPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, coverUrl: String(reader.result) }));
    reader.readAsDataURL(file); // сохраняем как dataURL (base64)
  };
  const removeCover = () => setForm((f) => ({ ...f, coverUrl: "" }));

  // сохранить в localStorage
  const onSave = () => {
    const list = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
    const idx = list.findIndex((x) => String(x.id) === String(form.id));
    const next = [...list];
    if (idx >= 0) next[idx] = { ...next[idx], ...form };
    else next.push(form);
    localStorage.setItem(KEY_JOURNALS, JSON.stringify(next));
    alert("Настройки журнала сохранены");
    navigate(`/moderator/journals/${form.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки журнала</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Отмена
          </Button>
          <Button onClick={onSave}>Сохранить</Button>
        </div>
      </div>

      {/* Обложка */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Обложка журнала</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-40 h-56 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
              {form.coverUrl ? (
                <img
                  src={form.coverUrl}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-slate-500">Нет изображения</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onCoverPick}
                  className="hidden"
                  id="cover-input"
                />
                <Button asChild>
                  <label htmlFor="cover-input" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить обложку
                  </label>
                </Button>
              </label>
              {form.coverUrl && (
                <Button
                  variant="destructive"
                  onClick={removeCover}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Удалить
                </Button>
              )}
              <p className="text-xs text-slate-500">
                Рекомендуется JPG/PNG, примерно 800×1100. Изображение хранится
                локально (base64).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основные данные */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Основные данные</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Название *</label>
            <Input name="name" value={form.name} onChange={onChange} required />
          </div>
          <div>
            <label className="block text-sm mb-1">ISSN</label>
            <Input name="issn" value={form.issn || ""} onChange={onChange} />
          </div>
          <div>
            <label className="block text-sm mb-1">Сайт</label>
            <Input
              name="site"
              value={form.site || ""}
              onChange={onChange}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Язык</label>
            <select
              name="lang"
              value={form.lang || "ru"}
              onChange={(e) => setForm((f) => ({ ...f, lang: e.target.value }))}
              className="w-full border rounded-md p-2"
            >
              <option value="ru">Русский</option>
              <option value="kk">Қазақша</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Периодичность</label>
            <select
              name="periodicity"
              value={form.periodicity || "quarterly"}
              onChange={(e) =>
                setForm((f) => ({ ...f, periodicity: e.target.value }))
              }
              className="w-full border rounded-md p-2"
            >
              <option value="monthly">Ежемесячно</option>
              <option value="quarterly">Ежеквартально</option>
              <option value="biannual">2 раза в год</option>
              <option value="annual">Ежегодно</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Краткое описание</label>
            <Textarea
              name="description"
              value={form.description || ""}
              onChange={onChange}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Концепция */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Концепция журнала</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Миссия</label>
            <Textarea
              name="mission"
              value={form.mission || ""}
              onChange={onChange}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Целевая аудитория</label>
            <Textarea
              name="audience"
              value={form.audience || ""}
              onChange={onChange}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Этика и рецензирование</label>
            <Textarea
              name="ethics"
              value={form.ethics || ""}
              onChange={onChange}
              rows={3}
            />
          </div>
          <Separator />
          <div>
            <label className="block text-sm mb-1">Тематика (несколько)</label>
            <select
              multiple
              className="w-full border rounded-md p-2 h-36"
              value={form.topics || []}
              onChange={onTopicsChange}
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {(form.topics || []).map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Редакционная коллегия */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Редакционная коллегия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Array.isArray(form.editorial) ? form.editorial : []).map(
            (row, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
              >
                <div className="md:col-span-4">
                  <Input
                    placeholder="Должность/роль (напр. Главный редактор)"
                    value={row.role || ""}
                    onChange={(e) => editEditorial(i, "role", e.target.value)}
                  />
                </div>
                <div className="md:col-span-7">
                  <Input
                    placeholder="ФИО, уч. степень, должность, страна"
                    value={row.name || ""}
                    onChange={(e) => editEditorial(i, "name", e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    variant="destructive"
                    onClick={() => removeEditorial(i)}
                    className="w-full"
                    disabled={(form.editorial || []).length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          )}

          <Button variant="outline" onClick={addEditorial}>
            Добавить строку
          </Button>
        </CardContent>
      </Card>

      {/* Информация для авторов */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Информация для авторов</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Стоимость публикации</label>
            <Input
              name="fee"
              value={form.forAuthors?.fee || ""}
              onChange={onChangeFA}
              placeholder="Напр. 5 000 ₸"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Первичное решение</label>
            <Input
              name="firstDecision"
              value={form.forAuthors?.firstDecision || ""}
              onChange={onChangeFA}
              placeholder="до 5 рабочих дней"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Срок рецензирования</label>
            <Input
              name="reviewTime"
              value={form.forAuthors?.reviewTime || ""}
              onChange={onChangeFA}
              placeholder="до 21 дня"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Публикация</label>
            <Input
              name="publication"
              value={form.forAuthors?.publication || ""}
              onChange={onChangeFA}
              placeholder="в ближайшем номере"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${form.id}`}>
          <Button variant="outline">Отмена</Button>
        </Link>
        <Button onClick={onSave}>Сохранить</Button>
      </div>
    </div>
  );
}
