import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ожидается существующий компонент
// props: { label, value, onFileChange, required? }
import FileDropZone from "@/components/files/FileDropZone";

export default function FilesStep({
  formData,
  onChange, // (key, value) => void
  priceTenge = 10000,
}) {
  const [toggles, setToggles] = useState({
    expertConclusion: !!formData?.expertConclusion,
    originalityCertificate: !!formData?.originalityCertificate,
    authorsConsent: !!formData?.authorsConsent,
    conflictOfInterest: !!formData?.conflictOfInterest,
    ethicsApproval: !!formData?.ethicsApproval,
  });

  // синхронизация при внешних сбросах формы
  useEffect(() => {
    setToggles({
      expertConclusion: !!formData?.expertConclusion,
      originalityCertificate: !!formData?.originalityCertificate,
      authorsConsent: !!formData?.authorsConsent,
      conflictOfInterest: !!formData?.conflictOfInterest,
      ethicsApproval: !!formData?.ethicsApproval,
    });
  }, [
    formData?.expertConclusion,
    formData?.originalityCertificate,
    formData?.authorsConsent,
    formData?.conflictOfInterest,
    formData?.ethicsApproval,
  ]);

  const setToggle = (key, val) => {
    setToggles((t) => ({ ...t, [key]: val }));
    if (!val) onChange?.(key, null);
  };

  return (
    <div className="space-y-6">
      {/* Главный файл статьи — всегда d&d */}
      <FileDropZone
        label="Файл статьи (обязательно)"
        value={formData?.articleFile}
        onFileChange={(file) => onChange?.("articleFile", file)}
        required
      />

      {/* Доп. документы через переключатели */}
      <Card className="p-4 space-y-4">
        <h4 className="font-semibold text-gray-900">
          Дополнительные документы (по необходимости)
        </h4>

        <DocToggle
          id="expertConclusion"
          label="Экспертное заключение (ЗГС)"
          hint="Для организаций с режимом (НИИ, вузы, госструктуры)"
          checked={toggles.expertConclusion}
          onCheckedChange={(v) => setToggle("expertConclusion", v)}
        />
        {toggles.expertConclusion && (
          <div className="pl-7">
            <FileDropZone
              label="Экспертное заключение"
              value={formData?.expertConclusion}
              onFileChange={(file) => onChange?.("expertConclusion", file)}
            />
          </div>
        )}

        <DocToggle
          id="originalityCertificate"
          label="Сертификат об оригинальности (антиплагиат)"
          hint="Отчёт/сертификат из системы проверки оригинальности"
          checked={toggles.originalityCertificate}
          onCheckedChange={(v) => setToggle("originalityCertificate", v)}
        />
        {toggles.originalityCertificate && (
          <div className="pl-7">
            <FileDropZone
              label="Сертификат об оригинальности"
              value={formData?.originalityCertificate}
              onFileChange={(file) => onChange?.("originalityCertificate", file)}
            />
          </div>
        )}

        <DocToggle
          id="authorsConsent"
          label="Согласие авторов на публикацию"
          hint="Подписанная форма согласия всех соавторов"
          checked={toggles.authorsConsent}
          onCheckedChange={(v) => setToggle("authorsConsent", v)}
        />
        {toggles.authorsConsent && (
          <div className="pl-7">
            <FileDropZone
              label="Согласие авторов"
              value={formData?.authorsConsent}
              onFileChange={(file) => onChange?.("authorsConsent", file)}
            />
          </div>
        )}

        <DocToggle
          id="conflictOfInterest"
          label="Заявление об отсутствии конфликта интересов"
          checked={toggles.conflictOfInterest}
          onCheckedChange={(v) => setToggle("conflictOfInterest", v)}
        />
        {toggles.conflictOfInterest && (
          <div className="pl-7">
            <FileDropZone
              label="Конфликт интересов"
              value={formData?.conflictOfInterest}
              onFileChange={(file) => onChange?.("conflictOfInterest", file)}
            />
          </div>
        )}

        <DocToggle
          id="ethicsApproval"
          label="Этическое одобрение (IRB/ЭКО)"
          hint="Для исследований с участием людей/животных"
          checked={toggles.ethicsApproval}
          onCheckedChange={(v) => setToggle("ethicsApproval", v)}
        />
        {toggles.ethicsApproval && (
          <div className="pl-7">
            <FileDropZone
              label="Этическое одобрение"
              value={formData?.ethicsApproval}
              onFileChange={(file) => onChange?.("ethicsApproval", file)}
            />
          </div>
        )}
      </Card>

      {/* Блок оплаты — как у тебя было */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Оплата</h4>
        <p className="text-sm text-blue-800 mb-2">
          Стоимость публикации: {priceTenge.toLocaleString("ru-RU")} тенге/статья.
          Оплата производится после принятия статьи к публикации.
        </p>
        <p className="text-sm text-blue-800">
          Оплата производится через банковский перевод. Банковские реквизиты будут
          предоставлены после принятия статьи.
        </p>
      </div>
    </div>
  );
}

function DocToggle({ id, label, hint, checked, onCheckedChange }) {
  return (
    <div className="flex items-start gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <div>
        <Label htmlFor={id} className="font-medium cursor-pointer">
          {label}
        </Label>
        {hint && <div className="text-sm text-gray-600">{hint}</div>}
      </div>
    </div>
  );
}
