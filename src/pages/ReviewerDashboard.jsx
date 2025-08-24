"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  Calendar,
  Check,
  X,
} from "lucide-react";

import { articlesStore } from "@/store/articlesStore";
import ReviewFormModal from "@/components/editorial/ReviewFormModal";

export default function ReviewerDashboard() {
  const [meId, setMeId] = useState(
    () => localStorage.getItem("reviewerId") || ""
  );
  const [me, setMe] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [q, setQ] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);

  useEffect(() => {
    const rid = new URLSearchParams(window.location.search).get("rid");
    if (rid) {
      localStorage.setItem("reviewerId", rid);
      setMeId(rid);
    }
  }, []);

  const load = async () => {
    if (!meId) return;
    const me = await articlesStore.getReviewerById(meId);
    setMe(me || null);
    setAssignments(await articlesStore.listAssignmentsForReviewer(meId));
    setSubmitted(await articlesStore.listReviewsByReviewer(meId));
  };

  useEffect(() => {
    if (meId) load();
  }, [meId]);

  const acceptInvite = async (articleId) => {
    await articlesStore.acceptInvite(articleId, meId);
    await load();
  };
  const declineInvite = async (articleId) => {
    await articlesStore.declineInvite(articleId, meId);
    await load();
  };

  const filteredAssignments = useMemo(() => {
    const s = q.toLowerCase();
    return assignments.filter(
      ({ article }) =>
        (article.title || "").toLowerCase().includes(s) ||
        (article.journal || "").toLowerCase().includes(s) ||
        (article.category || "").toLowerCase().includes(s)
    );
  }, [assignments, q]);

  const activeCount = assignments.length;
  const completedCount = submitted.length;
  const avgScore = submitted.length
    ? (
        submitted.reduce((acc, x) => acc + (Number(x.review?.score) || 0), 0) /
        submitted.length
      ).toFixed(1)
    : "—";

  const RecTag = ({ rec }) => {
    const map = {
      accept: "bg-emerald-100 text-emerald-700",
      minor: "bg-blue-100 text-blue-800",
      major: "bg-amber-100 text-amber-800",
      reject: "bg-red-100 text-red-800",
    };
    const txt =
      {
        accept: "Принять",
        minor: "Minor",
        major: "Major",
        reject: "Отклонить",
      }[rec] || rec;
    return (
      <Badge className={map[rec] || "bg-gray-100 text-gray-700"}>{txt}</Badge>
    );
  };

  if (!meId) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Личный кабинет рецензента</h1>
        <p className="text-gray-600">
          Перейдите по персональной ссылке вида{" "}
          <code>/reviewer?rid=rv-123</code>, либо сохраните ID вручную:
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Введите reviewerId, например rv-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = e.currentTarget.value.trim();
                if (v) {
                  localStorage.setItem("reviewerId", v);
                  setMeId(v);
                }
              }
            }}
          />
          <Button
            onClick={() => {
              const v = document.querySelector("input")?.value.trim();
              if (v) {
                localStorage.setItem("reviewerId", v);
                setMeId(v);
              }
            }}
          >
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Личный кабинет рецензента
          </h1>
          <p className="text-gray-600">
            {me
              ? `${me.name} • Нагрузка: ${me.workload ?? 0}`
              : "Рецензирование научных статей"}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Активные рецензии</p>
                <p className="text-3xl font-bold">{activeCount}</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Завершённые</p>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Средняя оценка</p>
                <p className="text-3xl font-bold">{avgScore}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Назначенные статьи */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Статьи на рецензирование</span>
            <Input
              className="w-80"
              placeholder="Поиск по названию/журналу…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-gray-600">Пока нет активных назначений.</div>
            ) : (
              filteredAssignments.map(({ article, assignment }) => (
                <div
                  key={article.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {article.title}
                      </h3>
                      <div className="text-sm text-gray-600 truncate">
                        {article.journal} • {article.category}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Срок:{" "}
                          {assignment?.deadline || "—"}
                        </span>
                        <Badge variant="secondary">
                          {assignment?.status || "invited"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assignment?.status !== "accepted" &&
                        assignment?.status !== "submitted" &&
                        assignment?.status !== "declined" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acceptInvite(article.id)}
                            >
                              <Check className="w-4 h-4 mr-1" /> Принять
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => declineInvite(article.id)}
                            >
                              <X className="w-4 h-4 mr-1" /> Отклонить
                            </Button>
                          </>
                        )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setCurrentArticle(article);
                          setOpenForm(true);
                        }}
                        disabled={assignment?.status === "declined"}
                      >
                        Рецензировать
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Отправленные мной */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Мои отправленные рецензии</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted.length === 0 ? (
            <div className="text-gray-600">
              Вы ещё не отправили ни одной рецензии.
            </div>
          ) : (
            <div className="space-y-3">
              {submitted.map(({ article, review }) => (
                <div
                  key={`${article.id}-${review.submittedAt}`}
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{article.title}</div>
                    <div className="text-xs text-gray-500">
                      Отправлено:{" "}
                      {new Date(review.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.recommendation && (
                      <RecTag rec={review.recommendation} />
                    )}
                    <Badge variant="secondary">
                      Итог: {review.score ?? "—"}/5
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модал формы рецензии */}
      <ReviewFormModal
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        article={currentArticle}
        reviewer={me ? { id: meId, name: me.name } : { id: meId, name: "Я" }}
        onSubmitted={async () => {
          setOpenForm(false);
          await load();
        }}
      />
    </div>
  );
}
