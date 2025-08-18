"use client";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";     // если нет — твой прост. Label из прошл. шага
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ScreeningChecklist({
  defaultValue,
  onChange,        // (value) => void
}) {
  const [v, setV] = useState({
    topicOk: false,
    formattingOk: false,
    templateOk: false,
    plagiarismOk: false,
    plagiarismThreshold: 80, // % originality min
    comment: "",
  });

  useEffect(() => {
    if (defaultValue) setV(d => ({ ...d, ...defaultValue }));
  }, [defaultValue]);

  useEffect(() => {
    onChange?.(v);
  }, [v, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChecklistItem
          label="Соответствие тематике журнала"
          checked={v.topicOk}
          onChange={(c) => setV(prev => ({ ...prev, topicOk: c }))}
        />
        <ChecklistItem
          label="Оформление по правилам журнала"
          checked={v.formattingOk}
          onChange={(c) => setV(prev => ({ ...prev, formattingOk: c }))}
        />
        <ChecklistItem
          label="Использован шаблон журнала"
          checked={v.templateOk}
          onChange={(c) => setV(prev => ({ ...prev, templateOk: c }))}
        />
        <ChecklistItem
          label="Антиплагиат проходит порог"
          checked={v.plagiarismOk}
          onChange={(c) => setV(prev => ({ ...prev, plagiarismOk: c }))}
        />
      </div>

      <div className="space-y-1">
        <Label>Порог оригинальности (%)</Label>
        <Input
          type="number"
          value={v.plagiarismThreshold}
          onChange={(e) =>
            setV(prev => ({ ...prev, plagiarismThreshold: Number(e.target.value || 0) }))
          }
        />
      </div>

      <div className="space-y-1">
        <Label>Комментарий (для автора/внутренний)</Label>
        <Textarea
          rows={4}
          value={v.comment}
          onChange={(e) => setV(prev => ({ ...prev, comment: e.target.value }))}
          placeholder="Кратко укажите, что нужно поправить (если будет возврат)"
        />
      </div>
    </div>
  );
}

function ChecklistItem({ label, checked, onChange }) {
  return (
    <label className="flex gap-2 items-center">
      <input
        type="checkbox"
        className="h-5 w-5 accent-blue-600"
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
