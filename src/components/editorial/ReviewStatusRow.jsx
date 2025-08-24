"use client";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReviewFormModal from "@/components/editorial/ReviewFormModal";
import { RECOMMENDATION } from "@/constants/review";

export default function ReviewStatusRow({ article, onMoveToDecision }) {
  const [open, setOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [localArticle, setLocalArticle] = useState(article);

  const assignments = localArticle.review?.assignments || [];
  const reviews = localArticle.review?.reviews || [];
  const submittedCount = reviews.length;

  const readyForDecision = submittedCount >= 1; // при желании поменяй на 2

  const startReview = (ass) => {
    setSelectedReviewer({ id: ass.reviewerId, name: ass.name });
    setOpen(true);
  };

  const recTag = (rec) => {
    const map = {
      [RECOMMENDATION.ACCEPT]: {
        label: "Принять",
        cls: "bg-emerald-100 text-emerald-700",
      },
      [RECOMMENDATION.MINOR]: {
        label: "Minor revision",
        cls: "bg-blue-100 text-blue-800",
      },
      [RECOMMENDATION.MAJOR]: {
        label: "Major revision",
        cls: "bg-amber-100 text-amber-800",
      },
      [RECOMMENDATION.REJECT]: {
        label: "Отклонить",
        cls: "bg-red-100 text-red-800",
      },
    };
    const m = map[rec] || { label: rec, cls: "bg-gray-100 text-gray-700" };
    return <Badge className={m.cls}>{m.label}</Badge>;
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{localArticle.title}</div>
          <div className="text-sm text-gray-600 truncate">
            {localArticle.journal} • {localArticle.category}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">In Review</Badge>
          <Button
            onClick={() => onMoveToDecision?.(localArticle.id)}
            disabled={!readyForDecision}
          >
            Отправить на решение
          </Button>
        </div>
      </div>

      {/* назначенные рецензенты */}
      <div className="mt-3 grid gap-2">
        {assignments.length === 0 ? (
          <div className="text-sm text-gray-500">Рецензенты не назначены.</div>
        ) : (
          assignments.map((a) => {
            const has = reviews.find((r) => r.reviewerId === a.reviewerId);
            return (
              <div
                key={a.reviewerId}
                className="flex items-center justify-between border rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="font-medium">{a.name}</div>
                  <Badge variant="secondary" className="text-xs">
                    {a.status}
                  </Badge>
                  {has && recTag(has.recommendation)}
                </div>
                {!has ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startReview(a)}
                  >
                    Заполнить рецензию
                  </Button>
                ) : (
                  <div className="text-xs text-gray-500">
                    получено {new Date(has.submittedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* модал формы рецензии */}
      <ReviewFormModal
        isOpen={open}
        article={localArticle}
        reviewer={selectedReviewer}
        onClose={() => setOpen(false)}
        onSubmitted={(updated) => setLocalArticle(updated)}
      />
    </div>
  );
}
