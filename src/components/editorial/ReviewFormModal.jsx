"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ReviewFormModal({
  isOpen,
  onClose,
  article,
  reviewer,
  onSubmitted,
}) {
  const [novelty, setNovelty] = useState(3);
  const [validity, setValidity] = useState(3);
  const [style, setStyle] = useState(3);
  const [errorsQuality, setErrorsQuality] = useState(3);
  const [recommendation, setRecommendation] = useState("");
  const [commentForAuthors, setCommentForAuthors] = useState("");
  const [confidentialNote, setConfidentialNote] = useState("");

  const score = useMemo(
    () =>
      Math.round(((+novelty + +validity + +style + +errorsQuality) / 4) * 10) /
      10,
    [novelty, validity, style, errorsQuality]
  );

  useEffect(() => {
    if (!isOpen) {
      setNovelty(3);
      setValidity(3);
      setStyle(3);
      setErrorsQuality(3);
      setRecommendation("");
      setCommentForAuthors("");
      setConfidentialNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!article) return null;

  const canSubmit = recommendation && commentForAuthors.trim().length > 0;

  const submit = async () => {
    await import("@/store/articlesStore").then(async ({ articlesStore }) => {
      await articlesStore.submitReview(article.id, reviewer.id, {
        novelty,
        validity,
        style,
        errorsQuality,
        commentForAuthors,
        confidentialNote,
        recommendation,
        score,
      });
    });
    await onSubmitted?.();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 md:top-10 mx-auto max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">
              Рецензент: {reviewer?.name || "—"}
            </div>
            <div className="font-semibold">Рецензия на: {article.title}</div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <Section title="Критерии (1–5)">
            <GridTwo>
              <SelectField
                label="Научная новизна"
                value={novelty}
                onChange={setNovelty}
              />
              <SelectField
                label="Обоснованность"
                value={validity}
                onChange={setValidity}
              />
              <SelectField
                label="Стиль/ясность"
                value={style}
                onChange={setStyle}
              />
              <SelectField
                label="Качество/ошибки"
                value={errorsQuality}
                onChange={setErrorsQuality}
              />
            </GridTwo>
            <div className="text-sm text-gray-600">
              Итоговый балл: <b>{score}</b> / 5
            </div>
          </Section>

          <Section title="Рекомендация">
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "accept", l: "Принять" },
                { v: "minor", l: "Доработать (Minor)" },
                { v: "major", l: "Доработать (Major)" },
                { v: "reject", l: "Отклонить" },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className={`border rounded-md p-2 cursor-pointer ${recommendation === opt.v ? "border-emerald-500 bg-emerald-50" : "hover:bg-slate-50"}`}
                >
                  <input
                    type="radio"
                    name="rec"
                    className="mr-2"
                    checked={recommendation === opt.v}
                    onChange={() => setRecommendation(opt.v)}
                  />
                  {opt.l}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Комментарий для авторов (обязательно)">
            <textarea
              className="w-full border rounded-md p-2 min-h-[100px]"
              placeholder="Подробные рекомендации авторам…"
              value={commentForAuthors}
              onChange={(e) => setCommentForAuthors(e.target.value)}
            />
          </Section>

          <Section title="Конфиденциально для редколлегии (не видит автор)">
            <textarea
              className="w-full border rounded-md p-2 min-h-[80px]"
              placeholder="Замечания только для редакции…"
              value={confidentialNote}
              onChange={(e) => setConfidentialNote(e.target.value)}
            />
          </Section>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            Отправить рецензию
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      {children}
    </section>
  );
}
function GridTwo({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
  );
}
function SelectField({ label, value, onChange }) {
  return (
    <label className="text-sm">
      <div className="mb-1 text-gray-700">{label}</div>
      <select
        className="w-full border rounded-md p-2"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
