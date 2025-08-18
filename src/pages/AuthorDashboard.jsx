"use client";

import { useState } from "react";
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
import { Link } from "react-router-dom";
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
  Send,
} from "lucide-react";

import EditArticleSheet from "@/components/articles/EditArticleSheet";


export default function AuthorDashboard() {
  const [reviews] = useState([
  {
    id: 1,
    articleTitle: "Применение машинного обучения в прогнозировании изменения климата",
    reviewer: "Иван Петров",
    date: "12.02.2024",
    comment: "Хорошее исследование, но требуется уточнить методы прогнозирования и добавить больше данных."
  },
  {
    id: 2,
    articleTitle: "Квантовые вычисления в криптографии",
    reviewer: "Анна Смирнова",
    date: "10.02.2024",
    comment: "Рекомендую доработать раздел с практическими примерами, чтобы укрепить выводы."
  }
]);
const [messages, setMessages] = useState([
  { id: 1, from: "editor", text: "Здравствуйте! Получили вашу статью.", time: "10:00" },
  { id: 2, from: "me", text: "Здравствуйте! Когда ждать рецензию?", time: "10:05" },
  { id: 3, from: "editor", text: "Обычно в течение двух недель.", time: "10:07" },
]);
const periodicityLabel = (p) =>
  p === "monthly" ? "Ежемесячно" :
  p === "quarterly" ? "Ежеквартально" :
  p === "yearly" ? "Ежегодно" : "—";

const journalProgress = (j) => Math.min(100, Math.round(j.completeness ?? 0));
const journalStatus = (pct) => {
  if (pct >= 80) return { label: "Готов", cls: "bg-green-100 text-green-700" };
  if (pct >= 40) return { label: "В работе", cls: "bg-amber-100 text-amber-700" };
  return { label: "Черновик", cls: "bg-slate-100 text-slate-700" };
};

const [archiveArticles] = useState([
  {
    id: 1,
    title: "Моделирование изменения климата в Центральной Азии",
    journal: "Журнал климатологии",
    category: "Экология",
    date: "15.03.2023",
    version: "v1.0"
  },
  {
    id: 2,
    title: "Развитие солнечных батарей нового поколения",
    journal: "Энергетические технологии",
    category: "Энергетика",
    date: "22.11.2022",
    version: "v2.2"
  }
]);

const [newMessage, setNewMessage] = useState("");

const sendMessage = () => {
  if (!newMessage.trim()) return;
  const newMsg = {
    id: messages.length + 1,
    from: "me",
    text: newMessage,
    time: new Date().toLocaleTimeString().slice(0, 5),
  };
  setMessages([...messages, newMsg]);
  setNewMessage("");

  // Имитация ответа редактора через 1 сек
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
  }, 1000);
};

  const [articles, setArticles] = useState([
    {
      id: 1,
      title:
        "Применение машинного обучения в прогнозировании изменения климата",
      journal: "Международный журнал экологических исследований",
      status: "На рецензировании",
      progress: 60,
      submittedDate: "15.01.2024",
      plagiarismScore: 8,
      reviews: 2,
      version: "v2.1",
      lastUpdate: "20.01.2024",
      category: "Экологические науки",
    },
    {
      id: 2,
      title: "Квантовые вычисления в криптографии",
      journal: "Журнал вычислительной физики",
      status: "Требует правок",
      progress: 40,
      submittedDate: "10.01.2024",
      plagiarismScore: 5,
      reviews: 1,
      version: "v1.3",
      lastUpdate: "18.01.2024",
      category: "Физика",
    },
    {
      id: 3,
      title: "Возобновляемые источники энергии в городской среде",
      journal: "Журнал возобновляемой энергетики",
      status: "Опубликовано",
      progress: 100,
      submittedDate: "05.12.2023",
      plagiarismScore: 3,
      reviews: 3,
      version: "v3.0",
      lastUpdate: "15.01.2024",
      category: "Энергетика",
    },
  ]);
const [editOpen, setEditOpen] = useState(false);
const [editingArticle, setEditingArticle] = useState(null);

const openEdit = (article) => {
  setEditingArticle(article);
  setEditOpen(true);
};

const handleSaveArticle = async (updated) => {
  // здесь позже будет вызов API, пока — локальное обновление
  setArticles(prev =>
    prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a))
  );
};
  const [journalQuery, setJournalQuery] = useState("");
const [journals] = useState([
  { id: 1, name: "Международный журнал экологических исследований", category: "Экология" },
  { id: 2, name: "Журнал вычислительной физики", category: "Физика" },
  { id: 3, name: "Журнал возобновляемой энергетики", category: "Энергетика" },
]);


  const [notifications] = useState([
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
  ]);

const getStatusColor = (status) => {
  switch (status) {
    case "Опубликовано":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "На рецензировании":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Требует правок":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "Отклонено":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};


  const getNotificationIcon = (type) => {
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
  };

  return (
    <div className="space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Dashboard Header */}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Всего статей</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {articles.length}
                </p>
              </div>
              <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Опубликовано</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {articles.filter((a) => a.status === "Опубликовано").length}
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
                <p className="text-orange-100 text-sm">На рецензировании</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {
                    articles.filter((a) => a.status === "На рецензировании")
                      .length
                  }
                </p>
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
                <p className="text-2xl sm:text-3xl font-bold">4.8</p>
              </div>
              <Star className="h-7 w-7 sm:h-8 sm:w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        {/* Tabs header becomes horizontally scrollable on small screens */}
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

        {/* Мои статьи */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Мои статьи
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Select>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статьи</SelectItem>
                  <SelectItem value="published">Опубликованные</SelectItem>
                  <SelectItem value="review">На рецензировании</SelectItem>
                  <SelectItem value="revision">Требуют правок</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Поиск статей..." className="w-full sm:w-64" />
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6">
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
                        <Badge
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                        >
                          {article.version}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600 truncate">
                        <span className="font-medium">{article.journal}</span> •{" "}
                        {article.category}
                      </CardDescription>
                    </div>
                    <div className="md:ml-4">
                      <Badge className={getStatusColor(article.status)}>
                        {article.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Прогресс публикации</span>
                      <span className="font-medium text-gray-900">
                        {article.progress}%
                      </span>
                    </div>
                    <Progress value={article.progress} className="h-2" />
                  </div>

                  {/* Article Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Подано</p>
                        <p className="font-medium">{article.submittedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-gray-500">Антиплагиат</p>
                        <p className="font-medium text-green-600">
                          {article.plagiarismScore}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-gray-500">Рецензии</p>
                        <p className="font-medium">{article.reviews}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-gray-500">Обновлено</p>
                        <p className="font-medium">{article.lastUpdate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-gray-100">
<Link to={`/articles/${article.id}`}>
  <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
    <Eye className="h-4 w-4" />
    <span>Просмотр</span>
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
                    >
                      <Download className="h-4 w-4" />
                      <span>Скачать</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
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

     <TabsContent value="journals" className="space-y-6">
  <div className="flex items-center justify-between gap-3">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Поиск журналов</h2>
  </div>

  <Input
    value={journalQuery}
    onChange={(e) => setJournalQuery(e.target.value)}
    placeholder="Введите название журнала..."
    className="w-full sm:w-96"
  />

  <Card className="border-0 shadow-sm">
    <CardContent className="p-0">
      {journals
        .filter((j) => (j.name || "").toLowerCase().includes(journalQuery.toLowerCase()))
        .length === 0 ? (
        <div className="p-6 text-gray-500">Журналы не найдены.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {journals
            .filter((j) => (j.name || "").toLowerCase().includes(journalQuery.toLowerCase()))
            .map((j) => {
              const pct = journalProgress(j);
              const st = journalStatus(pct);
              const topics = Array.isArray(j.topics) ? j.topics.slice(0, 3) : [];
              const more = Math.max(0, (Array.isArray(j.topics) ? j.topics.length : 0) - topics.length);

              return (
                <li key={j.id} className="p-4 hover:bg-slate-50/70 transition rounded-lg mx-2 my-2">
                  <div className="flex items-stretch gap-4">
                    {/* мини-обложка */}
                    <div className="w-32 sm:w-36 h-44 sm:h-48 rounded-md overflow-hidden relative flex-shrink-0 bg-indigo-50">
                      {j.coverUrl ? (
                        <img src={j.coverUrl} alt="cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-indigo-600">
                            {(j.name || "J")[0]}
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
                          {j.name || "Без названия"}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${st.cls}`}>{st.label}</span>
                      </div>

                      <div className="text-sm text-gray-600 mt-0.5">
                        {(j.field || j.category || "—")} • Язык: {j.lang?.toUpperCase() || "—"} • Периодичность: {periodicityLabel(j.periodicity)}
                      </div>

                      {topics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {topics.map((t) => (
                            <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {t}
                            </span>
                          ))}
                          {more > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              +{more}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 max-w-xl">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Заполненность</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <Progress value={pct} />
                      </div>

                      {j.description && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{j.description}</p>
                      )}
                    </div>

                    {/* действия — оставь свою логику обработчиков */}
                    <div className="flex flex-col gap-2 self-center shrink-0">
                     <Link to={`/journals/${j.id}`}>
    <Button size="sm" className="w-40">
      <Eye className="w-4 h-4 mr-2" /> Открыть
    </Button>
  </Link>
                     <Link to={`/submit-article?journalId=${j.id}`}>
    <Button size="sm" variant="outline" className="w-40">
      <Upload className="w-4 h-4 mr-2" /> Отправить статью
    </Button>
  </Link>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </CardContent>
  </Card>
</TabsContent>


{/* Рецензии */}
<TabsContent value="reviews" className="space-y-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
    Мои рецензии
  </h2>

  <div className="grid gap-4 sm:gap-6">
    {reviews.map((review) => (
      <Card
        key={review.id}
        className="border shadow-sm hover:shadow-md transition-all duration-200"
      >
        <CardHeader>
          <CardTitle className="text-lg">{review.articleTitle}</CardTitle>
          <CardDescription>
            Рецензент: {review.reviewer} • Дата: {review.date}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">{review.comment}</p>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert(`Открыть полный текст рецензии на "${review.articleTitle}"`)}
            >
              <Eye className="h-4 w-4 mr-1" /> Посмотреть
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert(`Написать ответ рецензенту ${review.reviewer}`)}
            >
              <MessageSquare className="h-4 w-4 mr-1" /> Ответить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert(`Принять правки по статье "${review.articleTitle}"`)}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Принять правки
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>

{/* Переписка */}
<TabsContent value="messages" className="space-y-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
    Переписка с редактором
  </h2>

  {/* Окно чата */}
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

    {/* Поле ввода */}
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

{/* Архив */}
<TabsContent value="archive" className="space-y-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
    Архив публикаций
  </h2>

  <div className="grid gap-4 sm:gap-6">
    {archiveArticles.map((item) => (
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
            <p>Дата публикации: <span className="font-medium">{item.date}</span></p>
            <p>Версия: <span className="font-medium">{item.version}</span></p>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert(`Просмотр архива: ${item.title}`)}
            >
              <Eye className="h-4 w-4 mr-1" /> Просмотр
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const blob = new Blob([`Архивная версия статьи: ${item.title}`], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${item.title} (архив).txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-1" /> Скачать
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => alert(`Восстановить статью "${item.title}" в работу`)}
            >
              <History className="h-4 w-4 mr-1" /> Восстановить
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>




      </Tabs>
      <EditArticleSheet
  open={editOpen}
  onOpenChange={setEditOpen}
  article={editingArticle}
  onSave={handleSaveArticle}
/>


      {/* Notifications Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span className="text-base sm:text-lg">Последние уведомления</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  !notification.read
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gray-50"
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Показать все уведомления
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function JournalsSearchSection({ journals = [], query, setQuery, onView, onSubmit }) {
  return (
    <div className="space-y-4">
      {/* Заголовок + поиск */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Поиск журналов</h2>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery?.(e.target.value)}
        placeholder="Введите название журнала..."
        className="max-w-xl"
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {journals.length === 0 ? (
            <div className="p-6 text-gray-500">Журналы не найдены.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {journals.map((j) => {
                const pct = journalProgress(j);
                const st = journalStatus(pct);

                return (
                  <li
                    key={j.id}
                    className="p-4 hover:bg-slate-50/70 transition rounded-lg mx-2 my-2"
                  >
                    <div className="flex items-stretch gap-4">
                      {/* mini-cover */}
                      <div className="w-32 sm:w-36 h-44 sm:h-48 rounded-md overflow-hidden relative flex-shrink-0 bg-indigo-50">
                        {j.coverUrl ? (
                          <img
                            src={j.coverUrl}
                            alt="cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-indigo-600">
                              {(j.name || "J")[0]}
                            </span>
                          </div>
                        )}

                        {j.issn && (
                          <div className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                            ISSN: {j.issn}
                          </div>
                        )}
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg leading-tight truncate">
                            {j.name || "Без названия"}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded shrink-0 ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mt-0.5">
                          {j.field || j.subject || "—"} • Язык: {j.lang?.toUpperCase() || "—"} • Периодичность: {periodicityLabel(j.periodicity)}
                        </div>

                        {/* прогресс */}
                        <div className="mt-3 max-w-xl">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Заполненность</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <Progress value={pct} />
                        </div>

                        {/* описание (опционально) */}
                        {j.description && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {j.description}
                          </p>
                        )}
                      </div>

                      {/* actions (сохраняем функционал) */}
                      <div className="flex flex-col gap-2 self-center shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-40"
                          onClick={() => onView?.(j)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Смотреть
                        </Button>
                        <Button
                          size="sm"
                          className="w-40"
                          onClick={() => onSubmit?.(j)}
                        >
                          <Send className="w-4 h-4 mr-2" /> Отправить статью
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}