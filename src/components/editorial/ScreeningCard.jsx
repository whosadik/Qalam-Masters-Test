"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ScreeningChecklist from "./ScreeningChecklist";
import { ARTICLE_STATUS } from "@/constants/articleStatus";
import { useMemo, useState } from "react";
import { Shield, FileText, Send, Undo2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { evaluateChecklist } from "@/constants/screeningRules";

export default function ScreeningCard({ article, onAllowToReview, onReturnToAuthor, defaultChecklist }) {


  const [checklist, setChecklist] = useState();
  const verdict = useMemo(() => evaluateChecklist(checklist), [checklist]);
  const canAllow = verdict.ok;

  const originality = article?.plagiarism?.originality ?? null;
  const matches = article?.plagiarism?.matches ?? null;
  

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">{article.title}</CardTitle>
            <div className="text-sm text-gray-600 truncate">
              {article.journal} • {article.category}
            </div>
          </div>
          <Badge variant="secondary">{article.status || ARTICLE_STATUS.SUBMITTED}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {(originality != null || matches != null) && (
          <div className="text-sm flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              Оригинальность: <b>{originality ?? "—"}%</b>
            </span>
            <span className="inline-flex items-center gap-1">
              Совпадения: <b>{matches ?? "—"}%</b>
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <FileText className="w-4 h-4 mr-1" /> Открыть файл статьи
          </Button>
        </div>

        {/* ЧЕК‑ЛИСТ (тематика / оформление / антиплагиат) */}
  <ScreeningChecklist defaultValue={defaultChecklist} onChange={setChecklist} />

        {/* Итоговый статус под чек‑листом */}
        <div className="flex items-center justify-between rounded-lg border p-3 bg-white">
          <div className="flex items-center gap-2 text-sm">
            {canAllow ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Все проверки пройдены</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700">Есть замечания — допуск запрещён</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onReturnToAuthor?.(article.id, { ...checklist, verdict })}
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Вернуть автору
            </Button>
            <Button
              onClick={() => onAllowToReview?.(article.id, { ...checklist, verdict })}
              disabled={!canAllow}
              title={!canAllow ? "Пройдите все проверки" : undefined}
            >
              <Send className="w-4 h-4 mr-1" />
              Допустить к рецензированию
            </Button>
          </div>
        </div>
      </CardContent>
    </Card> 
  );
}
