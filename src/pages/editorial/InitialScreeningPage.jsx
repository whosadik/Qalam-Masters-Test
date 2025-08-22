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
import ReviewerPicker from "@/components/editorial/ReviewerPicker";
import ScreeningRow from "@/components/editorial/ScreeningRow";
import ReviewerSelectModal from "@/components/editorial/ReviewerSelectModal";



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
const [selected, setSelected] = useState(null); // article | null
const openArticle = (a) => setSelected(a);
const closeArticle = () => setSelected(null);

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
  <TabsTrigger value="reviewers">Назначение рецензентов</TabsTrigger>   {/* ← ДОБАВЬ */}

          </TabsList>

          {/* --- Поданные статьи (Первичная проверка) --- */}
       <TabsContent value="submissions" className="space-y-6">
  {!selected ? (
    <>
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
              {/* при желании можешь оставить линк на полноэкранную страницу */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* СПИСОК */}
      <div className="grid gap-3">
        {filteredScreening.length === 0 ? (
          <div className="text-gray-500">Нет статей на первичной проверке.</div>
        ) : (
          filteredScreening.map((a) => (
            <ScreeningRow key={a.id} article={a} onOpen={setSelected} />
          ))
        )}
      </div>
    </>
  ) : (
    /* ДЕТАЛЬ СТАТЬИ — ПОЛНОЭКРАННО */
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{selected.title}</CardTitle>
            <div className="text-sm text-gray-600">
              {selected.journal} • {selected.category}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>← К списку</Button>
          </div>
        </div>
      </CardHeader>

      {/* КНОПКА АНТИПЛАГИАТ + быстрые проценты */}
      <CardContent className="border-b p-4 flex items-center gap-3">
        <Button
          onClick={async () => {
            const updated = await articlesStore.runPlagiarism(selected.id);
            setSelected(updated);
            await loadScreening(); // список тоже обновим
          }}
        >
          Провести антиплагиат
        </Button>
        {selected.plagiarism && (
          <div className="text-sm text-gray-700">
            Оригинальность: <b>{selected.plagiarism.originality}%</b> •
            Совпадения: <b>{selected.plagiarism.matches}%</b>
          </div>
        )}
      </CardContent>

      {/* ЧЕК-ЛИСТ и КНОПКИ «Вернуть»/«Допустить» */}
      <CardContent className="p-4">
        <ScreeningCard
          article={selected}
          // ВАЖНО: префилл полей антиплагиата в чек-листе
          defaultChecklist={{
            plagiarism: {
              originality: selected?.plagiarism?.originality ?? "",
              matches: selected?.plagiarism?.matches ?? "",
              reportUrl: selected?.plagiarism?.reportUrl ?? "",
            },
          }}
          onAllowToReview={async (id, checklist) => {
            await handleAllow(id, checklist);
            await loadScreening();
            setSelected(null); // вернёмся к списку
          }}
          onReturnToAuthor={async (id, checklist) => {
            await handleReturn(id, checklist);
            await loadScreening();
            setSelected(null);
          }}
        />
      </CardContent>
    </Card>
  )}
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



         
        
        </Tabs>
      </main>
    </div>
  );
}
function AssignRow({ article, onDone }) {
  const [selected, setSelected] = useState([]); // [{id,name,email}]
  const [deadline, setDeadline] = useState("");
  const [showSelect, setShowSelect] = useState(false);

  const canSend = selected.length >= 1 && selected.length <= 2 && !!deadline;

  const sendInvites = async () => {
    await articlesStore.assignReviewers(article.id, selected, deadline);
    setSelected([]);
    setDeadline("");
    await onDone?.();
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{article.title}</div>
          <div className="text-sm text-gray-600 truncate">
            {article.journal} • {article.category}
          </div>
        </div>
        <Badge variant="secondary">Reviewer Assignment</Badge>
      </div>

      <div className="mt-3 space-y-3">
        {/* выбранные */}
        <div className="flex flex-wrap gap-2">
          {selected.map((p) => (
            <Badge key={p.id} className="bg-blue-100 text-blue-800">{p.name}</Badge>
          ))}
          <Button variant="outline" onClick={() => setShowSelect(true)}>
            Выбрать из списка
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            type="date"
            placeholder="Дедлайн рецензии"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <div className="sm:col-span-2 flex items-center justify-end">
            <Button onClick={sendInvites} disabled={!canSend}>
              Разослать инвайты (1–2 рецензента)
            </Button>
          </div>
        </div>
      </div>

      {/* МОДАЛ-ВЫБОР */}
      <ReviewerSelectModal
        isOpen={showSelect}
        initialSelected={selected}
        onClose={() => setShowSelect(false)}
        onSubmit={(arr) => { setSelected(arr); setShowSelect(false); }}
      />
    </div>
  );
}