"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils"; // если нет — см. примечание ниже


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
export default function SubmitArticle() {
  const journals = [
  { id: "vestnik", title: "Вестник науки", org: "Qalam University" },
  { id: "tech", title: "Технические науки и инновации", org: "Tech Institute" },
  { id: "edu", title: "Образование и педагогика", org: "PedAcad" },
  { id: "econ", title: "Экономика и менеджмент", org: "BizSchool" },
  { id: "it", title: "Информационные технологии", org: "Digital Lab" },
];

  const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  selectedJournal: "",   // новый шаг

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
  dataConsent: false,
  textConsent: false,
});


const steps = [
  { id: 1, title: "Выбор журнала", icon: BookOpen },
  { id: 2, title: "Информация о публикации", icon: BookOpen },
  { id: 3, title: "Данные автора", icon: User },
  { id: 4, title: "Название статьи", icon: FileText },
  { id: 5, title: "Ключевые слова", icon: Target },
  { id: 6, title: "Цель исследования", icon: Target },
  { id: 7, title: "Файлы", icon: Upload },
  { id: 8, title: "Подтверждение", icon: CheckSquare },
];


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    setShowSuccessModal(true);
  };
        const [toggles, setToggles] = useState({
        expertConclusion: !!formData.expertConclusion,
        originalityCertificate: !!formData.originalityCertificate,
        authorsConsent: !!formData.authorsConsent,
        conflictOfInterest: !!formData.conflictOfInterest,
        ethicsApproval: !!formData.ethicsApproval,
      });

      const setToggle = (key, val) =>
        setToggles((t) => ({ ...t, [key]: val }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Научный журнал "Вестник науки"
          </h1>
          <p className="text-gray-600">Подача статьи в журнал</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-200"}`}
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
              Шаг {currentStep} из {steps.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8">


        {currentStep === 1 && (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Выбор журнала</h2>
      <p className="text-gray-600">Укажите, в какой журнал вы хотите отправить статью</p>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Журнал</label>
      <JournalCombobox
        value={formData.selectedJournal}
        onChange={(val) => handleInputChange("selectedJournal", val)}
        items={journals}
      />
      <p className="text-xs text-gray-500">
        Начните печатать, чтобы отфильтровать список (по названию и организации).
      </p>
    </div>

    {/* Пример подсказки: можно отобразить выбранный журнал */}
    {formData.selectedJournal && (
      <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
        Вы выбрали:{" "}
        <strong>
          {journals.find((j) => j.id === formData.selectedJournal)?.title}
        </strong>
      </div>
    )}
  </div>
)}


          {/* Шаг 1: Информация о публикации */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Информация о публикации
                </h2>
                <p className="text-gray-600">
                  Выберите тематическую направленность вашей статьи
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Тематическая направленность
                </label>
                <Select
                  value={formData.thematicDirection}
                  onValueChange={(value) =>
                    handleInputChange("thematicDirection", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите направление исследования" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">
                      Естественные и технические науки
                    </SelectItem>
                    <SelectItem value="humanities">
                      Гуманитарные и общественные дисциплины
                    </SelectItem>
                    <SelectItem value="it">
                      Информационные технологии и инженерия
                    </SelectItem>
                    <SelectItem value="economics">
                      Экономика, менеджмент, юриспруденция
                    </SelectItem>
                    <SelectItem value="education">
                      Образование, педагогика, психология
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Важная информация:</p>
                  <p>
                    Данный материал не был ранее опубликован и не подавался в
                    другие издания. Текст соответствует всем требованиям,
                    указанным в Требованиях к оформлению рукописи для авторов.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 2: Данные автора */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Данные автора
                </h2>
                <p className="text-gray-600">
                  Заполните информацию об авторе статьи
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ФИО
                  </label>
                  <Input
                    placeholder="Иванов Иван Иванович"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ученое звание
                  </label>
                  <Select
                    value={formData.academicDegree}
                    onValueChange={(value) =>
                      handleInputChange("academicDegree", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите ученое звание" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professor">Профессор</SelectItem>
                      <SelectItem value="docent">Доцент</SelectItem>
                      <SelectItem value="senior">
                        Старший преподаватель
                      </SelectItem>
                      <SelectItem value="assistant">Ассистент</SelectItem>
                      <SelectItem value="researcher">
                        Научный сотрудник
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Должность
                </label>
                <Input
                  placeholder="Заведующий кафедрой"
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Организация
                </label>
                <Input
                  placeholder="Казахстанский Национальный университет им. аль-Фараби"
                  value={formData.organization}
                  onChange={(e) =>
                    handleInputChange("organization", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Электронная почта
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

          {/* Шаг 3: Название статьи */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Название статьи
                </h2>
                <p className="text-gray-600">
                  Укажите название на русском и английском языках
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Название на русском языке
                  </label>
                  <Input
                    placeholder="Введите название статьи на русском языке"
                    value={formData.titleRu}
                    onChange={(e) =>
                      handleInputChange("titleRu", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Название на английском языке
                  </label>
                  <Input
                    placeholder="Enter article title in English"
                    value={formData.titleEn}
                    onChange={(e) =>
                      handleInputChange("titleEn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Аннотация
                  </h3>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      На русском языке
                    </label>
                    <Textarea
                      placeholder="Краткое описание исследования на русском языке..."
                      className="min-h-[120px]"
                      value={formData.abstractRu}
                      onChange={(e) =>
                        handleInputChange("abstractRu", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      На английском языке
                    </label>
                    <Textarea
                      placeholder="Brief description of the research in English..."
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

          {/* Шаг 4: Ключевые слова */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Ключевые слова
                </h2>
                <p className="text-gray-600">
                  Укажите ключевые слова через запятую, не более двух слов
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    На русском языке
                  </label>
                  <Textarea
                    placeholder="машинное обучение, искусственный интеллект, анализ данных..."
                    className="min-h-[100px]"
                    value={formData.keywordsRu}
                    onChange={(e) =>
                      handleInputChange("keywordsRu", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    На английском языке
                  </label>
                  <Textarea
                    placeholder="machine learning, artificial intelligence, data analysis..."
                    className="min-h-[100px]"
                    value={formData.keywordsEn}
                    onChange={(e) =>
                      handleInputChange("keywordsEn", e.target.value)
                    }
                  />
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Добавить ключевые слова:</strong> Ключевые слова
                    должны отражать основные темы и концепции вашего
                    исследования.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 5: Цель исследования */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Цель исследования
                </h2>
                <p className="text-gray-600">
                  Опишите цель, задачи и методы вашего исследования
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Цель исследования
                  </label>
                  <Textarea
                    placeholder="Введите текст"
                    className="min-h-[120px]"
                    value={formData.researchGoal}
                    onChange={(e) =>
                      handleInputChange("researchGoal", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Задачи исследования
                  </label>
                  <Textarea
                    placeholder="Введите текст"
                    className="min-h-[120px]"
                    value={formData.researchTasks}
                    onChange={(e) =>
                      handleInputChange("researchTasks", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Методы исследования
                  </label>
                  <Textarea
                    placeholder="Введите текст"
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

          {/* Шаг 6: Файлы */}



{/* === Вставь внутрь твоего компонента, где есть formData и handleInputChange === */}
{currentStep === 6 && (
  <div className="space-y-6">
    {/* 1) Главный файл статьи — сразу drag&drop */}
    <FileDropZone
      label="Файл статьи (обязательно)"
      value={formData.articleFile}
      onFileChange={(file) => handleInputChange("articleFile", file)}
      required
    />

    {(() => {


      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Дополнительные документы (по необходимости)
            </h4>
            <div className="space-y-2">
              <Toggle
                label="Загрузить Экспертное заключение (ЗГС)"
                hint="Для организаций с режимом (НИИ, вузы, госструктуры)"
                checked={toggles.expertConclusion}
                onChange={(v) => {
                  setToggle("expertConclusion", v);
                  if (!v) handleInputChange("expertConclusion", null);
                }}
              />
              {toggles.expertConclusion && (
                <div className="pl-8 pt-2">
                  <FileDropZone
                    label="Экспертное заключение"
                    value={formData.expertConclusion}
                    onFileChange={(file) =>
                      handleInputChange("expertConclusion", file)
                    }
                  />
                </div>
              )}

              <Toggle
                label="Загрузить Сертификат об оригинальности (антиплагиат)"
                hint="Отчёт/сертификат из системы проверки оригинальности"
                checked={toggles.originalityCertificate}
                onChange={(v) => {
                  setToggle("originalityCertificate", v);
                  if (!v) handleInputChange("originalityCertificate", null);
                }}
              />
              {toggles.originalityCertificate && (
                <div className="pl-8 pt-2">
                  <FileDropZone
                    label="Сертификат об оригинальности"
                    value={formData.originalityCertificate}
                    onFileChange={(file) =>
                      handleInputChange("originalityCertificate", file)
                    }
                  />
                </div>
              )}

              <Toggle
                label="Согласие авторов на публикацию"
                hint="Подписанное письмо/форма согласия всех соавторов"
                checked={toggles.authorsConsent}
                onChange={(v) => {
                  setToggle("authorsConsent", v);
                  if (!v) handleInputChange("authorsConsent", null);
                }}
              />
              {toggles.authorsConsent && (
                <div className="pl-8 pt-2">
                  <FileDropZone
                    label="Согласие авторов"
                    value={formData.authorsConsent}
                    onFileChange={(file) =>
                      handleInputChange("authorsConsent", file)
                    }
                  />
                </div>
              )}

              <Toggle
                label="Заявление об отсутствии конфликта интересов"
                checked={toggles.conflictOfInterest}
                onChange={(v) => {
                  setToggle("conflictOfInterest", v);
                  if (!v) handleInputChange("conflictOfInterest", null);
                }}
              />
              {toggles.conflictOfInterest && (
                <div className="pl-8 pt-2">
                  <FileDropZone
                    label="Конфликт интересов"
                    value={formData.conflictOfInterest}
                    onFileChange={(file) =>
                      handleInputChange("conflictOfInterest", file)
                    }
                  />
                </div>
              )}

              <Toggle
                label="Этическое одобрение (IRB/ЭКО)"
                hint="Для исследований с участием людей/животных"
                checked={toggles.ethicsApproval}
                onChange={(v) => {
                  setToggle("ethicsApproval", v);
                  if (!v) handleInputChange("ethicsApproval", null);
                }}
              />
              {toggles.ethicsApproval && (
                <div className="pl-8 pt-2">
                  <FileDropZone
                    label="Этическое одобрение"
                    value={formData.ethicsApproval}
                    onFileChange={(file) =>
                      handleInputChange("ethicsApproval", file)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {/* 3) Блок оплаты — как у тебя было */}
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-semibold text-blue-900 mb-2">Оплата</h4>
      <p className="text-sm text-blue-800 mb-2">
        Стоимость публикации: 10 000 тенге/статья. Оплата производится после
        принятия статьи к публикации.
      </p>
      <p className="text-sm text-blue-800">
        Оплата производится через банковский перевод. Банковские реквизиты будут
        предоставлены после принятия статьи.
      </p>
    </div>
  </div>
)}


          {/* Шаг 7: Подтверждение */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Подтверждение
                </h2>
                <p className="text-gray-600">
                  Подтвердите согласие с условиями публикации
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Настоящим подтверждаю, что статья не была ранее опубликована
                    ни в одном из изданий и не находится на рассмотрении в
                    других изданиях. Автор несет полную ответственность за
                    содержание статьи, достоверность представленных данных и
                    соблюдение авторских прав. При выявлении нарушений автор
                    обязуется возместить ущерб, причиненный журналу.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dataConsent"
                      checked={formData.dataConsent}
                      onCheckedChange={(checked) =>
                        handleInputChange("dataConsent", checked)
                      }
                    />
                    <label
                      htmlFor="dataConsent"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      Данный материал не был ранее опубликован и не подавался в
                      другие издания.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="textConsent"
                      checked={formData.textConsent}
                      onCheckedChange={(checked) =>
                        handleInputChange("textConsent", checked)
                      }
                    />
                    <label
                      htmlFor="textConsent"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      Текст соответствует всем требованиям, указанным в
                      Требованиях к оформлению рукописи для авторов.
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button variant="outline" size="lg" onClick={prevStep}>
                    Назад
                  </Button>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.dataConsent || !formData.textConsent}
                    onClick={handleSubmit}
                  >
                    Завершить отправку
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">
                  🎉 Статья отправлена!
                </h2>
                <p className="text-gray-700 mb-6">
                  Ваша статья успешно отправлена. Мы свяжемся с вами после
                  рецензирования.
                </p>
                <Link to="/author-dashboard">
                  <Button
                    onClick={() => {
                      setShowSuccessModal(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Вернуться в личный кабинет
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 7 && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full sm:w-auto bg-transparent"
              >
                Назад
              </Button>
             <Button
  onClick={nextStep}
  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
  disabled={currentStep === 1 && !formData.selectedJournal}
>
  Далее
</Button>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Добавьте этот компонент внизу файла:
function FileDropZone({ label, value, onFileChange }) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {value ? value.name : "Выберите или перетащите файл"}
        </p>
        <p className="text-gray-600 mb-4">
          Поддерживаемые форматы: PDF, DOC, DOCX
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          id={label}
          onChange={handleChange}
        />
        <Button variant="outline" onClick={handleButtonClick}>
          <Upload className="h-4 w-4 mr-2" />
          Выбрать файл
        </Button>
      </div>
    </div>
  );
}

function JournalCombobox({ value, onChange, items }) {
  const [open, setOpen] = useState(false);
  const selected = items.find((j) => j.id === value);

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
              <span className="text-gray-500 ml-2">• {selected.org}</span>
            </span>
          ) : (
            "Выберите журнал"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command filter={(value, search) => {
          // Кастомная фильтрация: ищет по названию и по организации
          const item = items.find(i => i.id === value);
          const hay = (item?.title + " " + item?.org).toLowerCase();
          return hay.includes(search.toLowerCase()) ? 1 : 0;
        }}>
          <CommandInput placeholder="Поиск журнала по названию или организации..." />
          <CommandList>
            <CommandEmpty>Ничего не найдено.</CommandEmpty>
            <CommandGroup heading="Журналы">
              {items.map((j) => (
                <CommandItem
                  key={j.id}
                  value={j.id}
                  onSelect={(val) => {
                    onChange(val);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate">{j.title}</div>
                    <div className="text-xs text-gray-500 truncate">{j.org}</div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      value === j.id ? "opacity-100" : "opacity-0"
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


