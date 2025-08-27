"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FileText,
  Upload,
  Search,
  CheckCircle,
  Clock,
  MessageSquare,
  Archive,
  PlusCircle,
  Eye,
  Edit,
  Download,
  AlertCircle,
  Bell,
  Shield,
  Calendar,
  Star,
  History,
  Mail,
} from "lucide-react";

import EditArticleSheet from "@/components/articles/EditArticleSheet";

import { listArticles, updateArticle } from "@/services/articlesService";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

const STATUS_LABEL = {
  draft: "Черновик",
  submitted: "Отправлена",
  screening: "Скрининг",
  under_review: "На рецензии",
  accepted: "Принята",
  rejected: "Отклонена",
};
function statusBadgeClass(status) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "under_review":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "screening":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
    case "submitted":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

const demoReviews = [
  {
    id: 1,
    articleTitle:
      "Применение машинного обучения в прогнозировании изменения климата",
    reviewer: "Иван Петров",
    date: "12.02.2024",
    comment:
      "Хорошее исследование, но требуется уточнить методы прогнозирования и добавить больше данных.",
  },
  {
    id: 2,
    articleTitle: "Квантовые вычисления в криптографии",
    reviewer: "Анна Смирнова",
    date: "10.02.2024",
    comment:
      "Рекомендую доработать раздел с практическими примерами, чтобы укрепить выводы.",
  },
];
const demoArchive = [
  {
    id: 1,
    title: "Моделирование изменения климата в Центральной Азии",
    journal: "Журнал климатологии",
    category: "Экология",
    date: "15.03.2023",
    version: "v1.0",
  },
  {
    id: 2,
    title: "Развитие солнечных батарей нового поколения",
    journal: "Энергетические технологии",
    category: "Энергетика",
    date: "22.11.2022",
    version: "v2.2",
  },
];
const demoNotifications = [
  {
    id: 1,
    type: "review",
    title: "Новая рецензия получена",
    message: "Рецензент оставил отзыв на вашу статью о машинном обучении",
    time: "2 часа назад",
    read: false,
  },
  {
    id: 2,
    type: "status",
    title: "Статус статьи изменен",
    message: "Ваша статья о квантовых вычислениях требует правок",
    time: "1 день назад",
    read: false,
  },
  {
    id: 3,
    type: "message",
    title: "Сообщение от редактора",
    message: "Редактор журнала оставил комментарий к вашей статье",
    time: "3 дня назад",
    read: true,
  },
];
function notificationIcon(type) {
  switch (type) {
    case "review":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "status":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "message":
      return <Mail className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}

export default function AuthorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [journalFilter, setJournalFilter] = useState("");
  const [journals, setJournals] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [journalQuery, setJournalQuery] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "editor",
      text: "Здравствуйте! Получили вашу статью.",
      time: "10:00",
    },
    {
      id: 2,
      from: "me",
      text: "Здравствуйте! Когда ждать рецензию?",
      time: "10:05",
    },
    {
      id: 3,
      from: "editor",
      text: "Обычно в течение двух недель.",
      time: "10:07",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [notifications] = useState(demoNotifications);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get(API.JOURNALS);
        setJournals(data?.results || []);
      } catch (e) {
        console.error("journals load failed", e);
      }
    })();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await listArticles({
        mine: true,
        journal: journalFilter || undefined,
        status: statusFilter || undefined,
      });
      setArticles(data);
    } catch (e) {
      console.error("articles load failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [statusFilter, journalFilter]);

  const filteredJournals = useMemo(() => {
    return journals.filter((j) =>
      (j.title || "").toLowerCase().includes(journalQuery.toLowerCase())
    );
  }, [journals, journalQuery]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const url = withParams(API.JOURNALS, {
          search: journalQuery || undefined,
        });
        const { data } = await http.get(url);
        setJournals(data?.results || []);
      } catch {}
    }, 300);
    return () => clearTimeout(handler);
  }, [journalQuery]);

  const openEdit = (article) => {
    setEditingArticle(article);
    setEditOpen(true);
  };

  const handleSaveArticle = async (updated) => {
    try {
      const saved = await updateArticle(
        updated.id,
        {
          title: updated.title,
          journal: Number(updated.journal),
          status: updated.status,
        },
        "patch"
      );

      setArticles((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
    } catch (e) {
      console.error("save article failed", e);
      throw e;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      from: "me",
      text: newMessage,
      time: new Date().toLocaleTimeString().slice(0, 5),
    };
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          from: "editor",
          text: "Спасибо за сообщение! Мы рассмотрим.",
          time: new Date().toLocaleTimeString().slice(0, 5),
        },
      ]);
    }, 800);
  };

  const total = articles.length;
  const totalAccepted = articles.filter((a) => a.status === "accepted").length;
  const totalReview = articles.filter(
    (a) => a.status === "under_review"
  ).length;

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Личный кабинет автора
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Управляйте своими научными публикациями
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative order-2 sm:order-1">
            <Button
              variant="outline"
              size="sm"
              className="relative bg-transparent w-full sm:w-auto"
            >
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Уведомления</span>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </Button>
          </div>
          <Link to="/submit-article">
            <Button className="order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" />
              Новая статья
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats (считаются по реальным данным) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Всего статей</p>
                <p className="text-2xl sm:text-3xl font-bold">{total}</p>
              </div>
              <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Принято</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {totalAccepted}
                </p>
              </div>
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">На рецензии</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalReview}</p>
              </div>
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Средний рейтинг</p>
                <p className="text-2xl sm:text-3xl font-bold">—</p>
              </div>
              <Star className="h-7 w-7 sm:h-8 sm:w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto gap-2 p-1 bg-white shadow-sm rounded-lg md:grid md:grid-cols-6 md:gap-0">
          <TabsTrigger
            value="articles"
            className="flex items-center gap-2 shrink-0"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Мои статьи</span>
            <span className="sm:hidden">Статьи</span>
          </TabsTrigger>
          <TabsTrigger
            value="journals"
            className="flex items-center gap-2 shrink-0"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Поиск журналов</span>
            <span className="sm:hidden">Журналы</span>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Рецензии</span>
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="flex items-center gap-2 shrink-0"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Переписка</span>
            <span className="sm:hidden">Почта</span>
          </TabsTrigger>
          <TabsTrigger
            value="archive"
            className="flex items-center gap-2 shrink-0"
          >
            <Archive className="h-4 w-4" />
            <span>Архив</span>
          </TabsTrigger>
        </TabsList>

        {/* ====== Мои статьи (БОЕВЫЕ ДАННЫЕ) ====== */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Мои статьи
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Фильтр по статусу */}
              <Select
                value={statusFilter || undefined}
                onValueChange={(v) => setStatusFilter(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Все статусы</SelectItem>
                  {Object.keys(STATUS_LABEL).map((v) => (
                    <SelectItem key={v} value={v}>
                      {STATUS_LABEL[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Фильтр по журналу */}
              <Select
                value={journalFilter || undefined}
                onValueChange={(v) =>
                  setJournalFilter(v === "__all__" ? "" : v)
                }
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Фильтр по журналу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Все журналы</SelectItem>
                  {journals.map((j) => (
                    <SelectItem key={j.id} value={String(j.id)}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {!loading && articles.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-gray-500">
                  У вас пока нет статей. Нажмите “Новая статья”, чтобы создать
                  черновик.
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card>
                <CardContent className="p-6 text-gray-500">
                  Загрузка…
                </CardContent>
              </Card>
            )}

            {articles.map((article) => (
              <Card
                key={article.id}
                className="w-full max-w-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <CardTitle className="text-lg sm:text-xl text-gray-900 truncate">
                          {article.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-gray-600 truncate">
                        <span className="font-medium">
                          {article.journal_title ||
                            `Журнал #${article.journal}`}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="md:ml-4">
                      <Badge className={statusBadgeClass(article.status)}>
                        {STATUS_LABEL[article.status] || article.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Немного метаданных (из того, что даёт API) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Создана</p>
                        <p className="font-medium">
                          {article.created_at
                            ? new Date(article.created_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      <div>
                        <p className="text-gray-500">Автор</p>
                        <p className="font-medium">
                          {article.author_email || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                    <Link to={`/articles/${article.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Открыть</span>
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => openEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Редактировать</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      disabled
                    >
                      <Download className="h-4 w-4" />
                      <span>Скачать</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      disabled
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Обсуждение</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ====== ЖУРНАЛЫ (БОЕВАЯ ЗАГРУЗКА, ПОИСК) ====== */}
        <TabsContent value="journals" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Поиск журналов
            </h2>
          </div>

          <Input
            value={journalQuery}
            onChange={(e) => setJournalQuery(e.target.value)}
            placeholder="Введите название журнала..."
            className="w-full sm:w-96"
          />

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {filteredJournals.length === 0 ? (
                <div className="p-6 text-gray-500">Журналы не найдены.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredJournals.map((j) => (
                    <li
                      key={j.id}
                      className="p-4 hover:bg-slate-50/70 transition rounded-lg mx-2 my-2"
                    >
                      <div className="flex items-stretch gap-4">
                        {/* мини-обложка */}
                        <div className="w-32 sm:w-36 h-44 sm:h-48 rounded-md overflow-hidden relative flex-shrink-0 bg-indigo-50">
                          {j.logo ? (
                            <img
                              src={j.logo}
                              alt="logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-indigo-600">
                                {(j.title || "J")[0]}
                              </span>
                            </div>
                          )}
                          {j.issn && (
                            <div className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                              ISSN: {j.issn}
                            </div>
                          )}
                        </div>

                        {/* контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg leading-tight truncate">
                              {j.title}
                            </h3>
                          </div>

                          <div className="text-sm text-gray-600 mt-0.5">
                            Тема: {j.theme} • Язык: {j.language} •
                            Периодичность: {j.frequency}
                          </div>

                          {j.description && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                              {j.description}
                            </p>
                          )}
                        </div>

                        {/* действия */}
                        <div className="flex flex-col gap-2 self-center shrink-0">
                          <Link to={`/journals/${j.id}`}>
                            <Button size="sm" className="w-40">
                              <Eye className="w-4 h-4 mr-2" /> Открыть
                            </Button>
                          </Link>
                          <Link to={`/submit-article?journalId=${j.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-40"
                            >
                              <Upload className="w-4 h-4 mr-2" /> Отправить
                              статью
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== Рецензии (МОК) ====== */}
        <TabsContent value="reviews" className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Мои рецензии
          </h2>
          <div className="grid gap-4 sm:gap-6">
            {demoReviews.map((review) => (
              <Card
                key={review.id}
                className="border shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {review.articleTitle}
                  </CardTitle>
                  <CardDescription>
                    Рецензент: {review.reviewer} • Дата: {review.date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-700">{review.comment}</p>
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Button size="sm" variant="outline" disabled>
                      <Eye className="h-4 w-4 mr-1" /> Посмотреть
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      <MessageSquare className="h-4 w-4 mr-1" /> Ответить
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle className="h-4 w-4 mr-1" /> Принять правки
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ====== Переписка (МОК) ====== */}
        <TabsContent value="messages" className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Переписка с редактором
          </h2>

          <div className="border rounded-lg shadow-sm flex flex-col h-[400px] bg-white">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.from === "me"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="block text-xs opacity-70 mt-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-3 flex gap-2">
              <Input
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====== Архив (МОК) ====== */}
        <TabsContent value="archive" className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Архив публикаций
          </h2>

          <div className="grid gap-4 sm:gap-6">
            {demoArchive.map((item) => (
              <Card
                key={item.id}
                className="border shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>
                    {item.journal} • {item.category}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-500">
                    <p>
                      Дата публикации:{" "}
                      <span className="font-medium">{item.date}</span>
                    </p>
                    <p>
                      Версия:{" "}
                      <span className="font-medium">{item.version}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    <Button size="sm" variant="outline" disabled>
                      <Eye className="h-4 w-4 mr-1" /> Просмотр
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob(
                          [`Архивная версия статьи: ${item.title}`],
                          { type: "text/plain;charset=utf-8" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${item.title} (архив).txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" /> Скачать
                    </Button>

                    <Button size="sm" variant="outline" disabled>
                      <History className="h-4 w-4 mr-1" /> Восстановить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Sheet (боевое сохранение) */}
      <EditArticleSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        article={editingArticle}
        onSave={handleSaveArticle}
      />

      {/* Уведомления (моки) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span className="text-base sm:text-lg">Последние уведомления</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  !n.read ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                {notificationIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {n.title}
                  </p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              disabled
            >
              Показать все уведомления
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
