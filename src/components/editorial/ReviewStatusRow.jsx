"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReviewStatusRow({ article, onMoveToDecision }) {
  const reviews = article.reviews || [];
  const total = reviews.length;
  const summary = summarize(reviews);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{article.title}</div>
          <div className="text-sm text-gray-600 truncate">
            {article.journal} • {article.category}
          </div>
        </div>
        <Badge variant="secondary">In Review · {total} рец.</Badge>
      </div>

      <div className="mt-3 text-sm text-gray-700">
        {total === 0 ? (
          <span>Пока нет загруженных рецензий.</span>
        ) : (
          <span>
            Реком.: <b>{summary.recommendation}</b> · Плюсов: {summary.acceptLike}, Минусов: {summary.rejectLike}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          onClick={() => onMoveToDecision?.(article.id)}
          disabled={total === 0}
        >
          Передать на решение
        </Button>
      </div>
    </div>
  );
}

function summarize(reviews) {
  // простая агрегация: считаем «голоса»
  let acceptLike = 0; // accept + minor
  let rejectLike = 0; // major + reject
  for (const r of reviews) {
    const rec = (r.recommendation || "").toLowerCase();
    if (rec === "accept" || rec === "minor") acceptLike++;
    if (rec === "major" || rec === "reject") rejectLike++;
  }
  let recommendation = "—";
  if (acceptLike > rejectLike) recommendation = "принять/микро-правки";
  else if (rejectLike > acceptLike) recommendation = "серьёзные правки/отклонить";
  return { acceptLike, rejectLike, recommendation };
}
