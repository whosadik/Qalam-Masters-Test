"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MetaStep({ value = {}, onChange }) {
  const v = value || {};
  const upd = (k, val) => onChange?.({ ...v, [k]: val });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Название статьи</Label>
        <Input
          value={v.title || ""}
          onChange={(e) => upd("title", e.target.value)}
          placeholder="Введите название…"
        />
      </div>

      <div className="space-y-2">
        <Label>Аннотация</Label>
        <Textarea
          rows={5}
          value={v.abstract || ""}
          onChange={(e) => upd("abstract", e.target.value)}
          placeholder="Кратко опишите работу…"
        />
      </div>

      <div className="space-y-2">
        <Label>Ключевые слова (через запятую)</Label>
        <Input
          value={Array.isArray(v.keywords) ? v.keywords.join(", ") : (v.keywords || "")}
          onChange={(e) => {
            const raw = e.target.value;
            const list = raw.split(",").map(s => s.trim()).filter(Boolean);
            // храним как массив
            upd("keywords", list.length ? list : raw);
          }}
          placeholder="ML, климат, прогнозирование"
        />
      </div>
    </div>
  );
}
