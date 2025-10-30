// src/pages/moderator/journals/AddJournal.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
//import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { value: "kz", label: "Казахский" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "Английский" },
  { value: "uz", label: "Узбекский" },
  { value: "ky", label: "Кыргызский" },
  { value: "zh", label: "Китайский" },
  { value: "de", label: "Немецкий" },
  { value: "es", label: "Испанский" },
];

const THEMES = [
  { value: "science", label: "Наука" },
  { value: "arts", label: "Искусство" },
  { value: "technology", label: "Технологии" },
  { value: "business", label: "Бизнес" },
  { value: "health", label: "Здоровье" },
];

const TARGET_AUDIENCES = [
  { value: "students", label: "Студенты" },
  { value: "researchers", label: "Исследователи" },
  { value: "professors", label: "Преподаватели" },
  { value: "general_public", label: "Широкая общественность" },
];

const FREQUENCIES = [
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "quarterly", label: "Ежеквартально" },
  { value: "annually", label: "Ежегодно" },
];

export default function AddJournal() {
  const navigate = useNavigate();
  const { id } = useParams(); // id организации из урла: /moderator/organizations/:id/add-journal
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    theme: ["science"],
    frequency: "quarterly",
    language: ["kz"],
    phone: "",
    email: "",
    address: "",
    issn: "",
    year: new Date().getFullYear(),
    target_audience: [""],
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  // простые мемо-валидаторы
  const canSubmit = useMemo(() => {
    if (!form.title.trim()) return false;
    if (!form.email.trim()) return false;
    if (!form.phone.trim()) return false;
    if (form.language.length === 0) return false;
    if (!form.issn.trim()) return false;
    if (!String(form.year).trim()) return false;
    if (form.theme.length === 0) return false;
    if (form.target_audience.length === 0) return false;
    return true;
  }, [form]);

  const onDrop = useCallback((fileList) => {
    const file = Array.from(fileList)[0];
    if (!file) return;
    // можно ограничить типы
    if (!file.type.startsWith("image/")) {
      setErr(
          t(
              "moderator_journals:add_journal.errors.only_images",
              "Допустимы только изображения (PNG/JPEG/WebP)."
          )
      );
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  const onPickFile = (e) => {
    onDrop(e.target.files);
  };

  const onChange = (e) => {
    setErr("");
    setFieldErrors({});
    const { name, value, type, checked } = e.target;
    if (name !== "theme" && name !== "language" && name !== "target_audience") {
      setForm((f) => ({
        ...f,
        [name]: name === "year" ? Number(value) || "" : value,
      }));
    }
  };

  const onArrayChange = (name, value) => {
    setErr("");
    setFieldErrors({});
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setErr("");
    setFieldErrors({});

    // Формируем полезную нагрузку по схеме OpenAPI
    // Если бэк принимает связь с организацией — добавим organization
    const fd = new FormData();
    fd.append("title", form.title.trim());
    if (form.description) fd.append("description", form.description);
    fd.append("theme", form.theme.join(","));
    fd.append("frequency", form.frequency);
    fd.append("language", form.language.join(","));
    fd.append("phone", form.phone.trim());
    fd.append("email", form.email.trim());
    if (form.address) fd.append("address", form.address);
    fd.append("issn", form.issn.trim());
    fd.append("year", String(Number(form.year) || new Date().getFullYear()));
    if (form.target_audience.length > 0)
      fd.append("target_audience", form.target_audience.join(","));
    if (logoFile) fd.append("logo", logoFile); // ВАЖНО: имя поля из схемы
    if (id) fd.append("organization", String(Number(id)));

    try {
      const { data } = await http.post(API.JOURNALS, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // если у вас есть фильтр по организации, можно редиректить назад в орг-панель
      // иначе на настройки/страницу журнала:
      navigate(`/moderator/journals/${data?.id || ""}`, { replace: true });
    } catch (e) {
      // аккуратно достанем ошибки DRF
      const resp = e?.response;
      const data = resp?.data || {};
      if (typeof data === "object") {
        const nonField = data.detail || data.non_field_errors?.[0];
        setErr(nonField ? String(nonField) :
            t(
                "moderator_journals:add_journal.errors.create_failed",
                "Не удалось создать журнал."
            )
        );
        const perField = { ...data };
        delete perField.detail;
        delete perField.non_field_errors;
        setFieldErrors(perField);
      } else {
        setErr(t(
            "moderator_journals:add_journal.errors.create_failed",
            "Не удалось создать журнал."
        ));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {t("moderator_journals:add_journal.page_title", "Создать журнал")}
        </h1>
        <div className="text-sm text-gray-500">
          {id ? (
            <>
              {t("moderator_journals:add_journal.org_prefix", "Организация:")}{" "}
              <span className="font-medium">#{id}</span>
            </>
          ) : (
            <span>
              {t(
                  "moderator_journals:add_journal.org_none",
                  "Без привязки к организации"
              )}
            </span>
          )}
        </div>
      </div>

      {err && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {err}
        </div>
      )}

      <Card className="border rounded-lg">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t("moderator_journals:add_journal.title_label", "Название")}{" "}
                  *
                </Label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder={t(
                      "moderator_journals:add_journal.title_ph",
                      "Вестник науки"
                  )}
                  required
                />
                {fieldErrors.title && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(fieldErrors.title)}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t("moderator_journals:add_journal.theme_label", "Тема")} *
                </Label>
                <div className="flex flex-wrap gap-4">
                  {THEMES.map((t) => (
                      <div key={t.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`theme-${t.value}`}
                            checked={form.theme.includes(t.value)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                  ? [...form.theme, t.value]
                                  : form.theme.filter((v) => v !== t.value);
                              onArrayChange("theme", next);
                            }}
                        />
                        <label htmlFor={`theme-${t.value}`} className="text-sm font-medium leading-none cursor-pointer">
                          {t.label}
                        </label>
                      </div>
                  ))}
                </div>
                {fieldErrors.theme && (
                    <p className="text-xs text-red-600 mt-1">
                      {String(fieldErrors.theme)}
                    </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">
                  {t(
                      "moderator_journals:add_journal.frequency_label",
                      "Периодичность"
                  )}{" "}
                  *
                </Label>
                <select
                    name="frequency"
                    value={form.frequency}
                    onChange={onChange}
                    className="w-full border rounded-md p-2 h-10"
                >
                  {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                  ))}
                </select>
                {fieldErrors.frequency && (
                    <p className="text-xs text-red-600 mt-1">
                      {String(fieldErrors.frequency)}
                    </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t("moderator_journals:add_journal.language_label", "Язык")} *
                </Label>
                <div className="flex flex-wrap gap-4">
                  {LANGUAGES.map((lang) => (
                      <div key={lang.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`lang-${lang.value}`}
                            checked={form.language.includes(lang.value)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                  ? [...form.language, lang.value]
                                  : form.language.filter((v) => v !== lang.value);
                              onArrayChange("language", next);
                            }}
                        />
                        <label htmlFor={`lang-${lang.value}`}
                               className="text-sm font-medium leading-none cursor-pointer">
                          {lang.label}
                        </label>
                      </div>
                  ))}
                </div>
                {fieldErrors.language && (
                    <p className="text-xs text-red-600 mt-1">
                      {String(fieldErrors.language)}
                    </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">
                  {t("moderator_journals:add_journal.phone_label", "Телефон")} *
                </Label>
                <Input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="+7 777 000 00 00"
                    required
                />
                {fieldErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">
                      {String(fieldErrors.phone)}
                    </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Email *</Label>
                <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="editor@journal.kz"
                    required
                />
                {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {String(fieldErrors.email)}
                    </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t(
                      "moderator_journals:add_journal.description_label",
                      "Описание"
                  )}
                </Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder={t(
                      "moderator_journals:add_journal.description_ph",
                      "Коротко о журнале…"
                  )}
                  rows={4}
                />
                {fieldErrors.description && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(fieldErrors.description)}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">ISSN *</Label>
                <Input
                  name="issn"
                  value={form.issn}
                  onChange={onChange}
                  placeholder="1234-5678"
                  required
                />
                {fieldErrors.issn && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(fieldErrors.issn)}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">
                  {t(
                      "moderator_journals:add_journal.year_label",
                      "Год основания"
                  )}{" "}
                  *
                </Label>
                <Input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={onChange}
                  min={1800}
                  max={9999}
                  required
                />
                {fieldErrors.year && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(fieldErrors.year)}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t("moderator_journals:add_journal.address_label", "Адрес")}
                </Label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder={t(
                      "moderator_journals:add_journal.address_ph",
                      "Город, улица, дом…"
                  )}
                />
                {fieldErrors.address && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(fieldErrors.address)}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t(
                      "moderator_journals:add_journal.target_audience_label",
                      "Целевая аудитория"
                  )} *
                </Label>
                <div className="flex flex-wrap gap-4">
                  {TARGET_AUDIENCES.map((ta) => (
                      <div key={ta.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`target_audience-${ta.value}`}
                            checked={form.target_audience.includes(ta.value)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                  ? [...form.target_audience, ta.value]
                                  : form.target_audience.filter((v) => v !== ta.value);
                              onArrayChange("target_audience", next);
                            }}
                        />
                        <label htmlFor={`target_audience-${ta.value}`}
                               className="text-sm font-medium leading-none cursor-pointer">
                          {ta.label}
                        </label>
                      </div>
                  ))}
                </div>
                {fieldErrors.target_audience && (
                    <p className="text-xs text-red-600 mt-1">
                      {String(fieldErrors.target_audience)}
                    </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label className="mb-2 block">
                  {t(
                      "moderator_journals:add_journal.logo_label",
                      "Обложка (drag & drop или выбрать файл)"
                  )}
                </Label>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onDrop(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-sm text-gray-600 hover:bg-gray-50"
                >
                  {logoPreview ? (
                      <img
                          src={logoPreview}
                          alt={t(
                              "moderator_journals:add_journal.logo_preview_alt",
                              "Предпросмотр обложки"
                          )}
                          className="w-full max-w-sm h-48 object-contain"
                      />
                  ) : (
                      <div className="text-center">
                        {t(
                            "moderator_journals:add_journal.drop_here",
                            "Перетащите файл сюда"
                        )}
                      <br />
                      <span className="text-xs text-gray-500">
                        {t(
                            "moderator_journals:add_journal.upload_hint",
                            "PNG, JPG, WEBP • до ~10 МБ"
                        )}
                      </span>
                    </div>
                  )}
                  <div className="mt-3">
                    <Input type="file" accept="image/*" onChange={onPickFile} />
                  </div>
                </div>
                {fieldErrors.logo && (
                  <p className="text-xs text-red-600 mt-1">
                    {String(fieldErrors.logo)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!canSubmit || busy}>
                {busy
                    ? t(
                        "moderator_journals:add_journal.btn_creating",
                        "Создаём…"
                    )
                    : t(
                        "moderator_journals:add_journal.btn_create",
                        "Создать журнал"
                    )
                }
              </Button>
              <Link to={id ? `/moderator/organizations/${id}` : "/moderator"}>
                <Button variant="outline">{t("moderator_journals:add_journal.btn_cancel", "Отмена")}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
