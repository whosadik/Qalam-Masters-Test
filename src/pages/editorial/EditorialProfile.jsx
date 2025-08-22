"use client";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import ReviewStatusRow from "@/components/editorial/ReviewStatusRow";
import DecisionCard from "@/components/editorial/DecisionCard";

import {
  FileText,
  Users,
  MessageSquare,
  Calendar,
  Shield,
  Search,
  RefreshCcw,
} from "lucide-react";

import { articlesStore } from "@/store/articlesStore";
import ScreeningCard from "@/components/editorial/ScreeningCard";
import { ARTICLE_STATUS } from "@/constants/articleStatus";

export default function EditorialProfile() {
  const [screeningItems, setScreeningItems] = useState([]);
  const [assignItems, setAssignItems] = useState([]);
  const [q, setQ] = useState("");
  const [inReviewItems, setInReviewItems] = useState([]);
const [decisionItems, setDecisionItems] = useState([]);
const loadInReview = async () => {
  const list = await articlesStore.listByStatus(ARTICLE_STATUS.IN_REVIEW);
  setInReviewItems(list || []);
};

const loadDecision = async () => {
  const list = await articlesStore.listByStatus(ARTICLE_STATUS.DECISION_PENDING);
  setDecisionItems(list || []);
};


  // Загрузка «Первичной проверки»
  const loadScreening = async () => {
    const list = await articlesStore.listForScreening();
    // При первом попадании в очередь — помечаем как INITIAL_SCREENING
    const normalized = await Promise.all(
      list.map(async (a) => {
        if (a.status === ARTICLE_STATUS.SUBMITTED) {
          return articlesStore.setStatus(a.id, ARTICLE_STATUS.INITIAL_SCREENING);
        }
        return a;
      })
    );
    setScreeningItems(normalized);
  };

  // Загрузка «Назначение рецензентов» (если в store есть метод listByStatus)
  const loadAssign = async () => {
    if (typeof articlesStore.listByStatus === "function") {
      const list = await articlesStore.listByStatus(ARTICLE_STATUS.REVIEWER_ASSIGNMENT);
      setAssignItems(list || []);
    } else {
      setAssignItems(null); // пометим как «нет метода»
    }
  };

useEffect(() => {
  loadScreening();
  loadAssign();
  loadInReview();
  loadDecision();
}, []);

const moveToDecision = async (id) => {
  await articlesStore.moveToDecision(id);
  await loadInReview();
  await loadDecision();
};

const handleDecision = async (id, decision, payload) => {
  await articlesStore.setDecision(id, decision, payload);
  await loadDecision();
};

  const filteredScreening = useMemo(
    () =>
      screeningItems.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q.toLowerCase()) ||
          (a.journal || "").toLowerCase().includes(q.toLowerCase())
      ),
    [screeningItems, q]
  );

  const newCount = screeningItems.filter(
    (a) => a.status === ARTICLE_STATUS.INITIAL_SCREENING
  ).length;

  const handleAllow = async (id, checklist) => {
    await articlesStore.addNote(id, { type: "screening", checklist, decision: "allow" });
    await articlesStore.setStatus(id, ARTICLE_STATUS.REVIEWER_ASSIGNMENT);
    await loadScreening();
    await loadAssign();
  };

  const handleReturn = async (id, checklist) => {
    await articlesStore.addNote(id, { type: "screening", checklist, decision: "return" });
    await articlesStore.setStatus(id, ARTICLE_STATUS.RETURNED_TO_AUTHOR, {
      returnReason:
        checklist?.comment || "Вернуть на доработку (оформление/тематика/антиплагиат).",
    });
    await loadScreening();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Редакционная коллегия</h1>
              <p className="text-gray-600">Управление процессом публикации</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="submissions" className="relative">
              Поданные статьи
              {newCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-xs px-1.5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                  {newCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="inreview">В рецензировании</TabsTrigger>
<TabsTrigger value="decisions">Решения</TabsTrigger>

          </TabsList>

          {/* --- Поданные статьи (Первичная проверка) --- */}
          <TabsContent value="submissions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Поданные статьи (Первичная проверка)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Поиск / Обновить */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="relative w-full sm:w-96">
                    <Input
                      placeholder="Поиск по названию/журналу…"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      className="pl-9"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadScreening} className="gap-2">
                      <RefreshCcw className="w-4 h-4" />
                      Обновить
                    </Button>
                    <Link to="/editorial/screening">
                      <Button variant="outline" className="gap-2">
                        Открыть в полноэкранном режиме
                      </Button>
                    </Link>
                  </div>
                </div>
                <TabsContent value="inreview" className="space-y-6">
  <Card className="border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        В рецензировании
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {inReviewItems.length === 0 ? (
        <p className="text-gray-600">Нет статей в рецензировании.</p>
      ) : (
        inReviewItems.map((a) => (
          <ReviewStatusRow key={a.id} article={a} onMoveToDecision={moveToDecision} />
        ))
      )}
    </CardContent>
  </Card>
</TabsContent>
<TabsContent value="decisions" className="space-y-6">
  <Card className="border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Решения (Decision Pending)
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {decisionItems.length === 0 ? (
        <p className="text-gray-600">Нет статей, готовых к решению.</p>
      ) : (
        decisionItems.map((a) => (
          <DecisionCard key={a.id} article={a} onDecision={handleDecision} />
        ))
      )}
    </CardContent>
  </Card>
</TabsContent>


                {/* Список карточек */}
                <div className="grid gap-4">
                  {filteredScreening.length === 0 ? (
                    <div className="text-gray-500">Нет статей на первичной проверке.</div>
                  ) : (
                    filteredScreening.map((a) => (
                      <ScreeningCard
                        key={a.id}
                        article={a}
                        onAllowToReview={handleAllow}
                        onReturnToAuthor={handleReturn}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Проверка структуры (инфоблок) --- */}
          <TabsContent value="structure" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Проверка структуры и форматирования
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Здесь позже подключим автоматические проверки шаблона/оформления и покажем чек-лист.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Назначение рецензентов (готово к подключению стора) --- */}
          <TabsContent value="reviewers" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Назначение рецензентов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignItems === null ? (
                  <p className="text-gray-600">
                    Для автоподгрузки сюда статей добавь в <code>articlesStore</code> метод{" "}
                    <code>listByStatus(status)</code> и верни список для статуса{" "}
                    <Badge variant="secondary" className="align-middle">
                      {ARTICLE_STATUS.REVIEWER_ASSIGNMENT}
                    </Badge>
                    .
                  </p>
                ) : assignItems.length === 0 ? (
                  <p className="text-gray-600">
                    Сейчас нет статей в статусе{" "}
                    <Badge variant="secondary" className="align-middle">
                      {ARTICLE_STATUS.REVIEWER_ASSIGNMENT}
                    </Badge>
                    .
                  </p>
                ) : (
                  <div className="space-y-3">
                    {assignItems.map((a) => (
                      <AssignRow key={a.id} article={a} onDone={loadAssign} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Антиплагиат (инфоблок) --- */}
          <TabsContent value="plagiarism" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Проверка на плагиат
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Здесь появится интеграция с системой антиплагиата и отображение отчётов.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Переписка (инфоблок) --- */}
          <TabsContent value="communication" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Переписка с авторами и рецензентами
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Встроенная система сообщений добавим позже.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Контроль сроков (инфоблок) --- */}
          <TabsContent value="deadlines" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Контроль сроков рецензирования
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Мониторинг дедлайнов, напоминания, продления — после подключения рецензентов.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/** ---------------------------------------------
 * Мини-строка назначения рецензентов (локальная)
 * --------------------------------------------*/
function AssignRow({ article, onDone }) {
  const [reviewers, setReviewers] = useState("");
  const [deadline, setDeadline] = useState("");

  const canSend = reviewers.trim().length > 0 && deadline;

  const sendInvites = async () => {
    const names = reviewers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3); // максимум 3

    await articlesStore.addNote(article.id, {
      type: "assignment",
      reviewers: names,
      deadline,
    });
    // В реале здесь будет создание инвайтов; для MVP двигаем статус
    await articlesStore.setStatus(article.id, ARTICLE_STATUS.IN_REVIEW);
    setReviewers("");
    setDeadline("");
    await onDone?.();
    // Можно всплывашку/тост подключить, пока console/info
    console.info("Invites sent:", { articleId: article.id, names, deadline });
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{article.title}</div>
          <div className="text-sm text-gray-600 truncate">
            {article.journal} • {article.category}
          </div>
        </div>
        <Badge variant="secondary">{ARTICLE_STATUS.REVIEWER_ASSIGNMENT}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Рецензенты (до 3), через запятую"
          value={reviewers}
          onChange={(e) => setReviewers(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Дедлайн рецензии"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <Button onClick={sendInvites} disabled={!canSend}>
          Разослать инвайты
        </Button>
      </div>
    </div>
  );
}
