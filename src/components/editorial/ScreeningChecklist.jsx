"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // если у вас нет — замените обычным <textarea>
import { SCREENING_RULES, evaluateChecklist } from "@/constants/screeningRules";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Props:
 *  - defaultValue?: объект чеклиста если редактируем
 *  - onChange?: (checklist) => void
 */
export default function ScreeningChecklist({ defaultValue, onChange }) {
  const [thematic, setThematic] = useState({
    value: "in_scope", // in_scope | borderline | out_of_scope
    comment: "",
  });
  const [formatting, setFormatting] = useState({
    usesTemplate: false,
    hasRequiredSections: false,
    citationsStyleOk: false,
    figuresTablesOk: false,
    comment: "",
  });
  const [plagiarism, setPlagiarism] = useState({
    originality: "",
    matches: "",
    reportUrl: "",
    comment: "",
  });

  // preload if defaultValue provided
  useEffect(() => {
    if (!defaultValue) return;
    if (defaultValue.thematic) setThematic((p) => ({ ...p, ...defaultValue.thematic }));
    if (defaultValue.formatting) setFormatting((p) => ({ ...p, ...defaultValue.formatting }));
    if (defaultValue.plagiarism) setPlagiarism((p) => ({ ...p, ...defaultValue.plagiarism }));
  }, [defaultValue]);

  // aggregate + notify parent
  const payload = useMemo(
    () => ({ thematic, formatting, plagiarism }),
    [thematic, formatting, plagiarism]
  );
  useEffect(() => onChange?.(payload), [payload]); // eslint-disable-line

  const verdict = evaluateChecklist(payload);

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="space-y-6 pt-6">
        {/* STATUS */}
        <div className="flex items-center gap-2">
          {verdict.ok ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <Badge className="bg-emerald-100 text-emerald-700">Готово к рецензированию</Badge>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                Требует исправлений
              </Badge>
            </>
          )}
        </div>
        {!verdict.ok && (
          <ul className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 list-disc pl-5">
            {verdict.problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}

        {/* 1) ТЕМАТИКА */}
        <section className="space-y-2">
          <div className="font-semibold">Тематика (соответствие профилю журнала)</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="thematic"
                value="in_scope"
                checked={thematic.value === "in_scope"}
                onChange={(e) => setThematic((t) => ({ ...t, value: e.target.value }))}
              />
              Соответствует профилю
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="thematic"
                value="borderline"
                checked={thematic.value === "borderline"}
                onChange={(e) => setThematic((t) => ({ ...t, value: e.target.value }))}
              />
              Пограничная тематика
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="thematic"
                value="out_of_scope"
                checked={thematic.value === "out_of_scope"}
                onChange={(e) => setThematic((t) => ({ ...t, value: e.target.value }))}
              />
              Не соответствует
            </label>
          </div>
          <Textarea
            placeholder="Комментарий по тематике (обязательно при «пограничной»/«не соответствует»)"
            value={thematic.comment}
            onChange={(e) => setThematic((t) => ({ ...t, comment: e.target.value }))}
          />
        </section>

        {/* 2) ОФОРМЛЕНИЕ */}
        <section className="space-y-2">
          <div className="font-semibold">Оформление (правила, шаблон)</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <CheckboxRow
              label="Использован шаблон журнала"
              checked={formatting.usesTemplate}
              onChange={(v) => setFormatting((f) => ({ ...f, usesTemplate: v }))}
            />
            <CheckboxRow
              label="Обязательные разделы присутствуют (аннотация, ключевые слова, выводы, литература)"
              checked={formatting.hasRequiredSections}
              onChange={(v) => setFormatting((f) => ({ ...f, hasRequiredSections: v }))}
            />
            <CheckboxRow
              label="Оформление ссылок/цитирования соответствует стилю журнала"
              checked={formatting.citationsStyleOk}
              onChange={(v) => setFormatting((f) => ({ ...f, citationsStyleOk: v }))}
            />
            <CheckboxRow
              label="Рисунки/таблицы имеют подписи, качество и нумерацию"
              checked={formatting.figuresTablesOk}
              onChange={(v) => setFormatting((f) => ({ ...f, figuresTablesOk: v }))}
            />
          </div>
          <Textarea
            placeholder="Замечания по оформлению (если есть)"
            value={formatting.comment}
            onChange={(e) => setFormatting((f) => ({ ...f, comment: e.target.value }))}
          />
        </section>

        {/* 3) АНТИПЛАГИАТ */}
        <section className="space-y-2">
          <div className="font-semibold">Антиплагиат</div>
          <div className="grid sm:grid-cols-3 gap-2">
            <div>
              <label className="text-sm text-gray-600">Оригинальность, %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={plagiarism.originality}
                onChange={(e) => setPlagiarism((p) => ({ ...p, originality: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Совпадения, %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={plagiarism.matches}
                onChange={(e) => setPlagiarism((p) => ({ ...p, matches: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Ссылка/ID отчёта</label>
              <Input
                placeholder="https://… или ID"
                value={plagiarism.reportUrl}
                onChange={(e) => setPlagiarism((p) => ({ ...p, reportUrl: e.target.value }))}
              />
            </div>
          </div>
          <Textarea
            placeholder="Комментарий по результатам антиплагиата (источники совпадений, рекомендации)"
            value={plagiarism.comment}
            onChange={(e) => setPlagiarism((p) => ({ ...p, comment: e.target.value }))}
          />
          <div className="text-xs text-gray-500">
            Порог оригинальности: {SCREENING_RULES.plagiarism.minOriginality}% • Допустимые
            совпадения: ≤ {SCREENING_RULES.plagiarism.maxMatches}%.
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
