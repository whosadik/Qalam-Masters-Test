// src/pages/SubmitArticle.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Upload,
  User,
  Globe,
  Target,
  CheckSquare,
  AlertCircle,
  BookOpen,
  ChevronsUpDown,
  Check,
} from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { createArticle, uploadArticleFile } from "@/services/articlesService";
import { useTranslation } from "react-i18next";

// ────────────────────────────────────────────────────────────────────────────────
// Вспомогательные контролы
function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none py-2">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 accent-blue-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        {hint && <div className="text-sm text-gray-600">{hint}</div>}
      </div>
    </label>
  );
}

function FileDropZone({ label, value, onFileChange }) {
  const { t } = useTranslation();
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = () => setIsDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) onFileChange(file);
  };
  const handleChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) onFileChange(file);
  };
  const handleButtonClick = () => inputRef.current?.click();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {value
              ? value.name
              : t(
                  "submission:file_choose_or_drop",
                  "Выберите или перетащите файл"
              )}
        </p>
        <p className="text-gray-600 mb-4">
          {t(
              "submission:file_supported_formats",
              "Поддерживаемые форматы: PDF, DOC, DOCX"
          )}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleChange}
        />
        <Button variant="outline" onClick={handleButtonClick}>
          <Upload className="h-4 w-4 mr-2" />
          {t("submission:file_btn_choose", "Выбрать файл")}
        </Button>
      </div>
    </div>
  );
}

function JournalCombobox({ value, onChange, items }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = items.find((j) => String(j.id) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            <span className="truncate text-left">
              <span className="font-medium">{selected.title}</span>
              <span className="text-gray-500 ml-2">
                • {selected.org || "—"}
              </span>
            </span>
          ) : (
              t("submission:choose_journal", "Выберите журнал")
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command
          filter={(value, search) => {
            const item = items.find((i) => String(i.id) === String(value));
            const hay = (
              (item?.title || "") +
              " " +
              (item?.org || "")
            ).toLowerCase();
            return hay.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={t(
              "submission:search_journal_placeholder",
              "Поиск журнала по названию или организации..."
          )} />
          <CommandList>
            <CommandEmpty>{t("submission:journal_empty", "Ничего не найдено.")}</CommandEmpty>
            <CommandGroup heading={t("submission:journal_group", "Журналы")}>
              {items.map((j) => (
                <CommandItem
                  key={j.id}
                  value={String(j.id)}
                  onSelect={(val) => {
                    onChange(val);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate">{j.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {j.org || "—"}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      String(value) === String(j.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ────────────────────────────────────────────────────────────────────────────────

export default function SubmitArticle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createdId, setCreatedId] = useState(null);

  // шаги (исправлено: 1..8 — разные экраны)
  const steps = [
    { id: 1, title: t("submission:step_journal", "Выбор журнала"), icon: BookOpen },
    { id: 2, title: t("submission:step_publication_info", "Информация о публикации"), icon: BookOpen },
    { id: 3, title: t("submission:step_author", "Данные автора"), icon: User },
    { id: 4, title: t("submission:step_title_abstract", "Название и аннотация"), icon: FileText },
    { id: 5, title: t("submission:step_keywords", "Ключевые слова"), icon: Target },
    { id: 6, title: t("submission:step_methods", "Цель/задачи/методы"), icon: Target },
    { id: 7, title: t("submission:step_files", "Файлы"), icon: Upload },
    { id: 8, title: t("submission:step_confirmation", "Подтверждение"), icon: CheckSquare },
  ];

  const [currentStep, setCurrentStep] = useState(1);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    // читаем ?journalId=...
    const qid = searchParams.get("journalId");
    if (!qid) return;

    // если у тебя id из списка — число, нормализуем к строке для сравнения
    // (в твоём локальном примере ids строковые: "vestnik", "tech", ...)
    const found = journals.find((j) => String(j.id) === String(qid));

    if (found) {
      // подставим выбранный журнал
      setFormData((prev) => ({
        ...prev,
        selectedJournal: String(found.id),
      }));

      // опционально: сразу перепрыгнуть на следующий шаг
      // (если не хочешь — просто удали строку ниже)
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    } else {
      // если журнал не найден в локальном массиве (например, пришёл реальный id)
      // просто сохраним значение, чтобы не терять выбор;
      // позже, когда подгрузишь журналы с бэка — подставится корректно
      setFormData((prev) => ({
        ...prev,
        selectedJournal: String(qid),
      }));
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // форма
  const [formData, setFormData] = useState({
    selectedJournal: "",
    thematicDirection: "",
    firstName: "",
    lastName: "",
    middleName: "",
    academicDegree: "",
    position: "",
    organization: "",
    email: "",
    titleRu: "",
    titleEn: "",
    abstractRu: "",
    abstractEn: "",
    keywordsRu: "",
    keywordsEn: "",
    researchGoal: "",
    researchTasks: "",
    researchMethods: "",
    articleFile: null,
    expertConclusion: null,
    originalityCertificate: null,
    authorsConsent: null,
    conflictOfInterest: null,
    ethicsApproval: null,
    dataConsent: false,
    textConsent: false,
  });

  // тумблеры для доп. файлов
  const [toggles, setToggles] = useState({
    expertConclusion: false,
    originalityCertificate: false,
    authorsConsent: false,
    conflictOfInterest: false,
    ethicsApproval: false,
  });
  const setToggle = (key, val) => setToggles((t) => ({ ...t, [key]: val }));

  // журналы из API
  const [journals, setJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingJournals(true);
        const { data } = await http.get(API.JOURNALS);
        const items = (data?.results || []).map((j) => ({
          id: String(j.id),
          title: j.title || t("submission:untitled", "Без названия"),
          org: j.organization_title || "",
        }));
        setJournals(items);

        setJournals(items);
      } catch (e) {
        console.error("journals load failed", e);
        setJournals([]);
      } finally {
        setLoadingJournals(false);
      }
    })();
  }, []);

  // статусы модал/загрузки
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // helpers
  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // сабмит — создаём статью
  const handleSubmit = async () => {
    if (!formData.selectedJournal) return alert(t("submission:alert_choose_journal", "Выберите журнал"));
    if (!formData.titleRu?.trim()) return alert(t("submission:alert_title_ru", "Укажите название статьи (RU)"));
    if (!formData.articleFile)
      return alert(
          t(
              "submission:alert_attach_file",
              "Прикрепите файл рукописи (PDF/DOC/DOCX)"
          )
      );
    if (!formData.dataConsent || !formData.textConsent) return;

    try {
      setSubmitting(true);

      // 1) Сначала создаём статью МИНИМАЛЬНЫМ JSON (по схеме Article)
      const payload = {
        journal: Number(formData.selectedJournal),
        status: "submitted",
        // Названия и аннотации
        title: (formData.titleRu || "").trim(),
        title_en: (formData.titleEn || "").trim(),

        abstract_ru: (formData.abstractRu || "").trim(),
        abstract_en: (formData.abstractEn || "").trim(),

        // ключевые слова храним строками «a, b, c»
        keywords_ru: (formData.keywordsRu || "").trim(),
        keywords_en: (formData.keywordsEn || "").trim(),

        thematic_direction: formData.thematicDirection || "",

        // цель/задачи/методы
        research_goal: formData.researchGoal || "",
        research_tasks: formData.researchTasks || "",
        research_methods: formData.researchMethods || "",

        // автор из формы подачи
        author_full_name: [
          formData.lastName,
          formData.firstName,
          formData.middleName,
        ]
          .filter(Boolean)
          .join(" "),
        author_academic_degree: formData.academicDegree || "",
        author_position: formData.position || "",
        author_organization: formData.organization || "",
        contact_email: formData.email || "",
      };
      const created = await createArticle(payload);

      // 2) Потом — загрузки файлов на /articles/{id}/files/
      const uploads = [];

      if (formData.articleFile) {
        uploads.push(
          uploadArticleFile(created.id, formData.articleFile, "manuscript")
        );
      }
      if (formData.expertConclusion) {
        uploads.push(
          uploadArticleFile(created.id, formData.expertConclusion, "zgs")
        );
      }
      if (formData.originalityCertificate) {
        uploads.push(
          uploadArticleFile(
            created.id,
            formData.originalityCertificate,
            "antiplag_report"
          )
        );
      }
      if (formData.authorsConsent) {
        uploads.push(
          uploadArticleFile(
            created.id,
            formData.authorsConsent,
            "Доп. материалы"
          )
        );
      }
      if (formData.conflictOfInterest) {
        uploads.push(
          uploadArticleFile(
            created.id,
            formData.conflictOfInterest,
            "Доп. материалы"
          )
        );
      }
      if (formData.ethicsApproval) {
        uploads.push(
          uploadArticleFile(
            created.id,
            formData.ethicsApproval,
            "Доп. материалы"
          )
        );
      }

      await Promise.all(uploads);

      setCreatedId(created.id);
      setShowSuccessModal(true);
    } catch (e) {
      console.error("submit failed", e);
      alert(
          t(
              "submission:alert_submit_failed",
              "Не удалось отправить статью. Проверьте поля и попробуйте ещё раз."
          )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("submission:submit_article", "Подача статьи")}
          </h1>
          <p className="text-gray-600">
            {t(
                "submission:fill_and_send",
                "Заполните информацию и отправьте рукопись в журнал"
            )}
          </p>
        </div>
      </div>

      {/* Steps */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-16 h-1 mx-1 sm:mx-2",
                      currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-gray-600">
              {t("submission:step_of_total", "Шаг")} {currentStep} {t("submission:step_of_total_from", "из")} {steps.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8">
          {/* Step 1: Журнал */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:step_journal", "Выбор журнала")}
                </h2>
                <p className="text-gray-600">
                  {t(
                      "submission:journal_header",
                      "Укажите, в какой журнал вы хотите отправить статью"
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("submission:journal_label", "Журнал")}
                </label>
                <JournalCombobox
                  value={formData.selectedJournal}
                  onChange={(val) => handleInputChange("selectedJournal", val)}
                  items={journals}
                />
                {loadingJournals && (
                  <p className="text-xs text-gray-500">{t("submission:journal_loading", "Загрузка журналов…")}</p>
                )}
                <p className="text-xs text-gray-500">
                  {t(
                      "submission:journal_hint",
                      "Начните печатать, чтобы отфильтровать список (по названию и организации)."
                  )}
                </p>
              </div>

              {formData.selectedJournal && (
                <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
                  {t("submission:journal_selected", "Вы выбрали:")}{" "}
                  <strong>
                    {
                      journals.find(
                        (j) => String(j.id) === String(formData.selectedJournal)
                      )?.title
                    }
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Инфо о публикации */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:step_publication_info", "Информация о публикации")}
                </h2>
                <p className="text-gray-600">
                  {t(
                      "submission:pub_info_header",
                      "Выберите тематическую направленность вашей статьи"
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  {t("submission:thematic_label", "Тематическая направленность")}
                </label>
                <Select
                  value={formData.thematicDirection || "__none__"}
                  onValueChange={(val) =>
                    handleInputChange(
                      "thematicDirection",
                      val === "__none__" ? "" : val
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t(
                        "submission:thematic_placeholder",
                        "Выберите направление исследования"
                    )} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("submission:thematic_none", "Не выбрано")}</SelectItem>
                    <SelectItem value="natural">
                      {t(
                          "submission:thematic_natural",
                          "Естественные и технические науки"
                      )}
                    </SelectItem>
                    <SelectItem value="humanities">
                      {t(
                          "submission:thematic_humanities",
                          "Гуманитарные и общественные дисциплины"
                      )}
                    </SelectItem>
                    <SelectItem value="it">
                      {t(
                          "submission:thematic_it",
                          "Информационные технологии и инженерия"
                      )}
                    </SelectItem>
                    <SelectItem value="economics">
                      {t(
                          "submission:thematic_economics",
                          "Экономика, менеджмент, юриспруденция"
                      )}
                    </SelectItem>
                    <SelectItem value="education">
                      {t(
                          "submission:thematic_education",
                          "Образование, педагогика, психология"
                      )}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">{t("submission:important_info", "Важная информация:")}
                  </p>
                  <p>
                    {t(
                        "submission:important_text",
                        "Данный материал не был ранее опубликован и не подавался в другие издания. Текст соответствует всем требованиям для авторов."
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Автор */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:step_author", "Данные автора")}
                </h2>
                <p className="text-gray-600">{t("submission:author_header", "Заполните информацию об авторе")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:author_name", "ФИО")}
                  </label>
                  <Input
                    placeholder={t(
                        "submission:author_name_placeholder",
                        "Иванов Иван Иванович"
                    )}
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:author_academic_degree", "Ученое звание")}
                  </label>
                  <Select
                    value={formData.academicDegree || "__none__"}
                    onValueChange={(val) =>
                      handleInputChange(
                        "academicDegree",
                        val === "__none__" ? "" : val
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t(
                          "submission:author_degree_placeholder",
                          "Выберите ученое звание"
                      )} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">
                        {t("submission:author_degree_none", "Не выбрано")}
                      </SelectItem>
                      <SelectItem value="professor">
                        {t("submission:author_professor", "Профессор")}
                      </SelectItem>
                      <SelectItem value="docent">
                        {t("submission:author_docent", "Доцент")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("submission:author_position", "Должность")}
                </label>
                <Input
                  placeholder={t(
                      "submission:author_position_placeholder",
                      "Кандидат наук"
                  )}
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("submission:author_organization", "Организация")}
                </label>
                <Input
                  placeholder={t(
                      "submission:author_organization_placeholder",
                      "КазНУ им. аль-Фараби"
                  )}
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange("organization", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("submission:author_email", "Электронная почта")}
                </label>
                <Input
                  type="email"
                  placeholder="author@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Название и аннотация */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:step_title_abstract", "Название и аннотация")}
                </h2>
                <p className="text-gray-600">
                  {t(
                      "submission:title_and_abstract_header",
                      "Укажите названия и аннотацию на двух языках"
                  )}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" /> {t("submission:title_ru", "Название на русском языке")}
                  </label>
                  <Input
                    placeholder={t(
                        "submission:title_ru_placeholder",
                        "Введите название статьи на русском языке"
                    )}
                    value={formData.titleRu}
                    onChange={(e) =>
                      handleInputChange("titleRu", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" /> {t("submission:title_en", "Название на английском языке")}
                  </label>
                  <Input
                    placeholder={t(
                        "submission:title_en_placeholder",
                        "Enter article title in English"
                    )}
                    value={formData.titleEn}
                    onChange={(e) =>
                      handleInputChange("titleEn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("submission:abstract", "Аннотация")}
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("submission:abstract_ru", "На русском языке")}
                    </label>
                    <Textarea
                      placeholder={t(
                          "submission:abstract_ru_placeholder",
                          "Краткое описание исследования на русском языке..."
                      )}
                      className="min-h-[120px]"
                      value={formData.abstractRu}
                      onChange={(e) =>
                        handleInputChange("abstractRu", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t("submission:abstract_en", "На английском языке")}
                    </label>
                    <Textarea
                      placeholder={t(
                          "submission:abstract_en_placeholder",
                          "Brief description of the research in English..."
                      )}
                      className="min-h-[120px]"
                      value={formData.abstractEn}
                      onChange={(e) =>
                        handleInputChange("abstractEn", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Ключевые слова */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:step_keywords", "Ключевые слова")}
                </h2>
                <p className="text-gray-600">
                  {t(
                      "submission:keywords_header",
                      "Укажите ключевые слова через запятую"
                  )}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:keywords_ru", "На русском языке")}
                  </label>
                  <Textarea
                    placeholder={t(
                        "submission:keywords_ru_placeholder",
                        "машинное обучение, искусственный интеллект, анализ данных..."
                    )}
                    className="min-h-[100px]"
                    value={formData.keywordsRu}
                    onChange={(e) =>
                      handleInputChange("keywordsRu", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:keywords_en", "На английском языке")}
                  </label>
                  <Textarea
                    placeholder={t(
                        "submission:keywords_en_placeholder",
                        "machine learning, artificial intelligence, data analysis..."
                    )}
                    className="min-h-[100px]"
                    value={formData.keywordsEn}
                    onChange={(e) =>
                      handleInputChange("keywordsEn", e.target.value)
                    }
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>{t("submission:hint", "Подсказка:")}</strong>
                    {t(
                        "submission:keywords_hint",
                        "используйте 4–8 ключевых слов, отражающих суть работы."
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Цель/задачи/методы */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:research_goal", "Цель исследования")}
                </h2>
                <p className="text-gray-600">{t("submission:methods_header", "Опишите цель, задачи и методы")}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:research_goal", "Цель исследования")}
                  </label>
                  <Textarea
                    placeholder={t("submission:placeholder_text", "Введите текст")}
                    className="min-h-[120px]"
                    value={formData.researchGoal}
                    onChange={(e) =>
                      handleInputChange("researchGoal", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:research_tasks", "Задачи исследования")}
                  </label>
                  <Textarea
                    placeholder={t("submission:placeholder_text", "Введите текст")}
                    className="min-h-[120px]"
                    value={formData.researchTasks}
                    onChange={(e) =>
                      handleInputChange("researchTasks", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("submission:research_methods", "Методы исследования")}
                  </label>
                  <Textarea
                    placeholder={t("submission:placeholder_text", "Введите текст")}
                    className="min-h-[120px]"
                    value={formData.researchMethods}
                    onChange={(e) =>
                      handleInputChange("researchMethods", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Файлы */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <FileDropZone
                label={t("submission:file_article", "Файл статьи (обязательно)")}
                value={formData.articleFile}
                onFileChange={(file) => handleInputChange("articleFile", file)}
              />

              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {t(
                      "submission:extra_docs",
                      "Дополнительные документы (по необходимости)"
                  )}
                </h4>

                <Toggle
                  label={t(
                      "submission:upload_zgs",
                      "Загрузить Экспертное заключение (ЗГС)"
                  )}
                  hint={t(
                      "submission:upload_zgs_hint",
                      "Для организаций (НИИ, вузы, госструктуры)"
                  )}
                  checked={toggles.expertConclusion}
                  onChange={(v) => {
                    setToggle("expertConclusion", v);
                    if (!v) handleInputChange("expertConclusion", null);
                  }}
                />
                {toggles.expertConclusion && (
                  <div className="pl-8 pt-2">
                    <FileDropZone
                      label={t("submission:zgs_label", "Экспертное заключение")}
                      value={formData.expertConclusion}
                      onFileChange={(file) =>
                        handleInputChange("expertConclusion", file)
                      }
                    />
                  </div>
                )}

                <Toggle
                  label={t(
                      "submission:upload_antiplag",
                      "Сертификат об оригинальности (антиплагиат)"
                  )}
                  hint={t(
                      "submission:upload_antiplag_hint",
                      "Отчёт/сертификат из системы проверки оригинальности"
                  )}
                  checked={toggles.originalityCertificate}
                  onChange={(v) => {
                    setToggle("originalityCertificate", v);
                    if (!v) handleInputChange("originalityCertificate", null);
                  }}
                />
                {toggles.originalityCertificate && (
                  <div className="pl-8 pt-2">
                    <FileDropZone
                      label={t(
                          "submission:antiplag_label",
                          "Сертификат об оригинальности"
                      )}
                      value={formData.originalityCertificate}
                      onFileChange={(file) =>
                        handleInputChange("originalityCertificate", file)
                      }
                    />
                  </div>
                )}

                <Toggle
                  label={t(
                      "submission:upload_authors_consent",
                      "Согласие авторов на публикацию"
                  )}
                  checked={toggles.authorsConsent}
                  onChange={(v) => {
                    setToggle("authorsConsent", v);
                    if (!v) handleInputChange("authorsConsent", null);
                  }}
                />
                {toggles.authorsConsent && (
                  <div className="pl-8 pt-2">
                    <FileDropZone
                      label={t("submission:authors_consent_label", "Согласие авторов")}
                      value={formData.authorsConsent}
                      onFileChange={(file) =>
                        handleInputChange("authorsConsent", file)
                      }
                    />
                  </div>
                )}

                <Toggle
                  label={t(
                      "submission:upload_conflict",
                      "Заявление об отсутствии конфликта интересов"
                  )}
                  checked={toggles.conflictOfInterest}
                  onChange={(v) => {
                    setToggle("conflictOfInterest", v);
                    if (!v) handleInputChange("conflictOfInterest", null);
                  }}
                />
                {toggles.conflictOfInterest && (
                  <div className="pl-8 pt-2">
                    <FileDropZone
                      label={t("submission:conflict_label", "Конфликт интересов")}
                      value={formData.conflictOfInterest}
                      onFileChange={(file) =>
                        handleInputChange("conflictOfInterest", file)
                      }
                    />
                  </div>
                )}

                <Toggle
                  label={t(
                      "submission:upload_ethics",
                      "Этическое одобрение (IRB/ЭКО)"
                  )}
                  hint={t(
                      "submission:upload_ethics_hint",
                      "Для исследований с участием людей/животных"
                  )}
                  checked={toggles.ethicsApproval}
                  onChange={(v) => {
                    setToggle("ethicsApproval", v);
                    if (!v) handleInputChange("ethicsApproval", null);
                  }}
                />
                {toggles.ethicsApproval && (
                  <div className="pl-8 pt-2">
                    <FileDropZone
                      label={t("submission:ethics_label", "Этическое одобрение")}
                      value={formData.ethicsApproval}
                      onFileChange={(file) =>
                        handleInputChange("ethicsApproval", file)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Подтверждение */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {t("submission:step_confirmation", "Подтверждение")}
                </h2>
                <p className="text-gray-600">
                  {t(
                      "submission:confirmation_header",
                      "Подтвердите согласие с условиями публикации"
                  )}
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {t(
                        "submission:confirmation_text",
                        "Настоящим подтверждаю, что статья не была ранее опубликована и не находится на рассмотрении в других изданиях. Автор несёт ответственность за содержание и соблюдение авторских прав."
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dataConsent"
                      checked={formData.dataConsent}
                      onCheckedChange={(checked) =>
                        handleInputChange("dataConsent", !!checked)
                      }
                    />
                    <label
                      htmlFor="dataConsent"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      {t(
                          "submission:consent_data",
                          "Материал не публиковался ранее и не подан в другие издания."
                      )}
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="textConsent"
                      checked={formData.textConsent}
                      onCheckedChange={(checked) =>
                        handleInputChange("textConsent", !!checked)
                      }
                    />
                    <label
                      htmlFor="textConsent"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      {t(
                          "submission:consent_text",
                          "Текст соответствует требованиям для авторов."
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button variant="outline" size="lg" onClick={prevStep}>
                    {t("submission:btn_back", "Назад")}
                  </Button>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={
                      !formData.dataConsent ||
                      !formData.textConsent ||
                      submitting
                    }
                    onClick={handleSubmit}
                  >
                    {submitting
                        ? t("submission:btn_submitting", "Отправляем…")
                        : t("submission:btn_finish", "Завершить отправку")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Навигация (кроме финального экрана) */}
          {currentStep < steps.length && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto bg-transparent"
              >
                {t("submission:btn_back", "Назад")}
              </Button>
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                disabled={currentStep === 1 && !formData.selectedJournal}
              >
                {t("submission:btn_next", "Далее")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">{t("submission:success_draft_created", "Черновик создан")}</h2>
            <p className="text-gray-700 mb-6">
              {t(
                  "submission:success_draft_text",
                  "Рукопись сохранена как черновик. Откройте статью и нажмите “Отправить в редакцию”, когда будете готовы."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowSuccessModal(false);
                  if (createdId) navigate(`/articles/${createdId}`);
                }}
              >
                {t("submission:btn_open_article", "Открыть статью")}
              </Button>
              <Link to="/author-dashboard">
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessModal(false)}
                >
                  {t("submission:btn_return_dashboard", "Вернуться в личный кабинет")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
