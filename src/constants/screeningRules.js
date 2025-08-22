export const SCREENING_RULES = {
  // Тематика: must be "in_scope" (соответствует профилю журнала)
  thematic: {
    allowed: ["in_scope", "borderline"], // borderline допустим, но потребует комментарий
  },

  // Оформление: все чекбоксы true
  formatting: {
    required: [
      "usesTemplate",
      "hasRequiredSections",
      "citationsStyleOk",
      "figuresTablesOk",
    ],
  },

  // Антиплагиат: порог оригинальности
  plagiarism: {
    minOriginality: 80, // можно поменять на ваш порог журнала
    maxMatches: 20,     // необязательно, но полезно
    requireReportUrl: true, // просить ссылку/ID отчёта
  },
};

// Вспомогательная проверка валидности чеклиста
export function evaluateChecklist(cl) {
  if (!cl) return { ok: false, problems: ["Не заполнен чек‑лист"] };

  const problems = [];

  // Тематика
  if (!SCREENING_RULES.thematic.allowed.includes(cl.thematic?.value)) {
    problems.push("Тематика не соответствует профилю журнала");
  }
  if (cl.thematic?.value === "borderline" && !cl.thematic?.comment?.trim()) {
    problems.push("Для пограничной тематики нужен комментарий");
  }

  // Оформление
  const req = SCREENING_RULES.formatting.required;
  const missing = req.filter((k) => !cl.formatting?.[k]);
  if (missing.length) {
    problems.push("Оформление не соответствует требованиям шаблона");
  }

  // Антиплагиат
  const orig = Number(cl.plagiarism?.originality ?? NaN);
  const matches = Number(cl.plagiarism?.matches ?? NaN);
  if (Number.isNaN(orig) || orig < SCREENING_RULES.plagiarism.minOriginality) {
    problems.push(`Оригинальность ниже порога (${SCREENING_RULES.plagiarism.minOriginality}%)`);
  }
  if (!Number.isNaN(matches) && matches > SCREENING_RULES.plagiarism.maxMatches) {
    problems.push(`Совпадения выше допустимого уровня (${SCREENING_RULES.plagiarism.maxMatches}%)`);
  }
  if (SCREENING_RULES.plagiarism.requireReportUrl && !cl.plagiarism?.reportUrl?.trim()) {
    problems.push("Добавьте ссылку/ID отчёта антиплагиата");
  }

  return { ok: problems.length === 0, problems };
}
