"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ScreeningChecklist from "./ScreeningChecklist";
import { ARTICLE_STATUS } from "@/constants/articleStatus";
import { useState } from "react";
import { Shield, FileText, Send, Undo2 } from "lucide-react";

export default function ScreeningCard({
  article,
  onAllowToReview,     // (articleId, checklist) => void
  onReturnToAuthor,    // (articleId, checklist) => void
}) {
  const [checklist, setChecklist] = useState();

  const originality = article?.plagiarism?.originality ?? null;
  const matches = article?.plagiarism?.matches ?? null;

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">
              {article.title}
            </CardTitle>
            <div className="text-sm text-gray-600 truncate">
              {article.journal} • {article.category}
            </div>
          </div>
          <Badge variant="secondary">
            {article.status || ARTICLE_STATUS.SUBMITTED}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Антиплагиат (если есть) */}
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

        {/* Файлы / действия */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <FileText className="w-4 h-4 mr-1" /> Открыть файл статьи
          </Button>
          {/* Добавь тут ссылки на вложения, если нужны */}
        </div>

        {/* Чеклист */}
        <ScreeningChecklist onChange={setChecklist} />

        {/* Кнопки решений */}
        <div className="flex flex-wrap gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onReturnToAuthor?.(article.id, checklist)}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Вернуть автору
          </Button>
          <Button
            onClick={() => onAllowToReview?.(article.id, checklist)}
          >
            <Send className="w-4 h-4 mr-1" />
            Допустить к рецензированию
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
