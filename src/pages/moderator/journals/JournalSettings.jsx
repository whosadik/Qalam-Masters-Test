// src/pages/moderator/journals/JournalSettings.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2 } from "lucide-react";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { useTranslation } from "react-i18next";

const THEME_OPTIONS = [
  { value: "science", label: "Science" },
  { value: "arts", label: "Arts" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "health", label: "Health" },
];

const FREQ_OPTIONS = [
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "quarterly", label: "Ежеквартально" },
  { value: "annually", label: "Ежегодно" },
];

export default function JournalSettings() {
  const { jid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState(null); // только API-поля
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // загрузка журнала
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await http.get(`${API.JOURNALS}${jid}/`);
        if (ignore) return;
        setForm({
          id: data.id,
          title: data.title || "",
          description: data.description || "",
          theme: data.theme || "science",
          frequency: data.frequency || "quarterly",
          language: data.language || "ru",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          issn: data.issn || "",
          year: data.year || new Date().getFullYear(),
          target_audience: data.target_audience || "",
          logo: data.logo || "", // URL лого на бэке
        });
        setLogoPreview(data.logo || "");
      } catch {
        if (!ignore) setErr(
            t(
                "moderator_journals:journal_settings.errors.load_failed",
                "Не удалось загрузить журнал."
            )
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [jid]);

  // изменения формы (API-поля)
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // работа с логотипом (logo)
  const onCoverPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr(
          t(
              "moderator_journals:journal_settings.errors.image_required",
              "Нужен файл изображения"
          )
      );
      return;
    }
    setErr("");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onDrop = useCallback((files) => {
    const file = Array.from(files)[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr(
          t(
              "moderator_journals:journal_settings.errors.image_required",
              "Нужен файл изображения"
          )
      );
      return;
    }
    setErr("");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  const removeCover = () => {
    setLogoFile(null);
    setLogoPreview("");
    // ВНИМАНИЕ: фактическое удаление на бэке зависит от его поддержки.
    // Если сервер понимает пустую строку или null — можно отправить это в onSave.
    // Иначе оставьте как есть, чтобы не отправлять ничего по logo.
  };

  // сохранение (PATCH multipart/form-data)
  const onSave = async () => {
    if (!form?.title?.trim()) {
      setErr(
          t(
              "moderator_journals:journal_settings.errors.title_required",
              "Поле «Название» обязательно"
          )
      );
      return;
    }
    // минимальная клиентская валидация года
    const yearNum = Number(form.year);
    if (!Number.isFinite(yearNum) || yearNum < 0) {
      setErr(
          t(
              "moderator_journals:journal_settings.errors.year_invalid",
              "Год должен быть числом ≥ 0"
          )
      );
      return;
    }

    setErr("");
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      if (form.description) fd.append("description", form.description);
      fd.append("theme", form.theme || "science");
      fd.append("frequency", form.frequency || "quarterly");
      fd.append("language", form.language || "ru");
      fd.append("phone", form.phone || "");
      fd.append("email", form.email || "");
      if (form.address) fd.append("address", form.address);
      if (form.issn) fd.append("issn", form.issn);
      fd.append("year", String(yearNum));
      if (form.target_audience) fd.append("target_audience", form.target_audience);

      // логотип — только если выбран новый файл
      if (logoFile) {
        fd.append("logo", logoFile);
      }
      // Если нужно очищать лого на бэке и он поддерживает это —
      // раскомментируйте одну из строк ниже (и настройте бэк):
      // fd.append("logo", "");        // вариант 1: пустая строка
      // fd.append("logo", new Blob([]), ""); // вариант 2: «пустой файл»

      await http.patch(`${API.JOURNALS}${jid}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/moderator/journals/${jid}`);
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        typeof data === "string"
          ? data
          : data?.detail
          ? data.detail
          : // показать словарь ошибок по полям от DRF, если пришёл
            data
            ? Object.entries(data)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join("\n")
            : "";
      setErr(msg ||
          t(
              "moderator_journals:journal_settings.errors.save_failed",
              "Не удалось сохранить журнал."
          ));
    }
  };

  if (loading) return <div className="p-6 text-gray-500">
    {t("moderator_journals:journal_settings.loading", "Загрузка…")}
  </div>;
  if (!form) return <div className="p-6 text-red-600">{t("moderator_journals:journal_settings.not_found", "Журнал не найден.")}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {err && (
        <div className="text-sm whitespace-pre-wrap text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("moderator_journals:journal_settings.page_title", "Настройки журнала")}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t("moderator_journals:journal_settings.btn_cancel", "Отмена")}
          </Button>
          <Button onClick={onSave}>
            {t("moderator_journals:journal_settings.btn_save", "Сохранить")}
          </Button>
        </div>
      </div>

      {/* Обложка (logo) */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            {t(
                "moderator_journals:journal_settings.cover_title",
                "Обложка / логотип"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-start">
            <div
              className="w-40 h-56 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(e.dataTransfer.files);
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-slate-500 text-center px-2">
                  {t(
                      "moderator_journals:journal_settings.drop_hint",
                      "Перетащите сюда изображение (JPG/PNG/WebP)"
                  )}
                </span>
              )}
            </div>

            <div className="space-y-2">
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
                  {t(
                      "moderator_journals:journal_settings.btn_upload_cover",
                      "Загрузить обложку"
                  )}
                </label>
              </Button>

              {(logoPreview || logoFile) && (
                <Button variant="destructive" onClick={removeCover} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t(
                      "moderator_journals:journal_settings.btn_remove_preview",
                      "Удалить (только превью)"
                  )}
                </Button>
              )}

              <p className="text-xs text-slate-500">
                {t(
                    "moderator_journals:journal_settings.cover_recommendation",
                    "Рекомендуется JPG/PNG/WebP, ~800×1100. Файл отправится на бэкенд в поле"
                )}{" "}
                <code>logo</code>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основные данные — только поля из OpenAPI */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            {t(
                "moderator_journals:journal_settings.main_title",
                "Основные данные"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.title_label", "Название")} *
            </label>
            <Input name="title" value={form.title} onChange={onChange} required />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.theme_label", "Тематика (Theme)")}
            </label>
            <select
              name="theme"
              value={form.theme || "science"}
              onChange={onChange}
              className="w-full border rounded-md p-2"
            >
              {THEME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(
                      `moderator_journals:journal_settings.theme.options.${o.value}`,
                      o.label
                  )}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.frequency_label", "Периодичность")}
            </label>
            <select
              name="frequency"
              value={form.frequency || "quarterly"}
              onChange={onChange}
              className="w-full border rounded-md p-2"
            >
              {FREQ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(
                      `moderator_journals:journal_settings.frequency.options.${o.value}`,
                      o.label
                  )}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.language_label", "Язык")}
            </label>
            <select
              name="language"
              value={form.language || "ru"}
              onChange={onChange}
              className="w-full border rounded-md p-2"
            >
              <option value="ru">
                {t("moderator_journals:journal_settings.lang.ru", "Русский")}
              </option>
              <option value="kk">
                {t("moderator_journals:journal_settings.lang.kk", "Қазақша")}
              </option>
              <option value="en">
                {t("moderator_journals:journal_settings.lang.en", "English")}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.phone_label", "Телефон")}
            </label>
            <Input name="phone" value={form.phone || ""} onChange={onChange} />
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

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.address_label", "Адрес")}
            </label>
            <Input name="address" value={form.address || ""} onChange={onChange} />
          </div>

          <div>
            <label className="block text-sm mb-1">ISSN</label>
            <Input name="issn" value={form.issn || ""} onChange={onChange} />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("moderator_journals:journal_settings.year_label", "Год основания")}
            </label>
            <Input
              type="number"
              name="year"
              value={form.year ?? ""}
              onChange={onChange}
              min={0}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t(
                "moderator_journals:journal_settings.target_audience_label",
                "Целевая аудитория"
            )}</label>
            <Textarea
              name="target_audience"
              value={form.target_audience || ""}
              onChange={onChange}
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">{t(
                "moderator_journals:journal_settings.description_label",
                "Краткое описание"
            )}</label>
            <Textarea
              name="description"
              value={form.description || ""}
              onChange={onChange}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${form.id}`}>
          <Button variant="outline">
            {t("moderator_journals:journal_settings.btn_cancel", "Отмена")}
          </Button>
        </Link>
        <Button onClick={onSave}>
          {t("moderator_journals:journal_settings.btn_save", "Сохранить")}
        </Button>
      </div>
    </div>
  );
}
