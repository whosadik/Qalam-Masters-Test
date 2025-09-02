"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { updateArticleStatus } from "@/services/articlesService";
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
  Loader2,
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
  revision_minor: "Нужны правки (minor)",
  revision_major: "Нужны правки (major)",
  accepted: "Принята",
  rejected: "Отклонена",
  in_production: "В производстве",
  published: "Опубликована",
};
function statusBadgeClass(status) {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "published":
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "in_production":
      return "bg-violet-100 text-violet-800 hover:bg-violet-100";
    case "revision_minor":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "revision_major":
      return "bg-rose-100 text-rose-800 hover:bg-rose-100";
    case "under_review":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "screening":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
    case "submitted":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
}

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



 // Лейблы рекомендаций рецензента
 const RECOMMENDATION_LABEL = {
   accept: "Принять",
   minor: "Нужны правки (minor)",
   major: "Нужны правки (major)",
   reject: "Отклонить",
 };
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
  const [submittingId, setSubmittingId] = useState(null);
const [submitModal, setSubmitModal] = useState({
  open: false,
  title: "",
  desc: "",
  articleId: null,
});
  const [statusFilter, setStatusFilter] = useState("");
  const [journalFilter, setJournalFilter] = useState("");
  const [journals, setJournals] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [journalQuery, setJournalQuery] = useState("");
  const [filesByArticle, setFilesByArticle] = useState({});
const [assignmentsByArticle, setAssignmentsByArticle] = useState({});
const [loadingActivity, setLoadingActivity] = useState(false);
const [activityOpen, setActivityOpen] = useState(false);


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
  const TYPE_LABEL = {
  manuscript: "Рукопись",
  supplement: "Приложение",
  zgs: "Справка ЗГС",
  antiplag_report: "Отчёт антиплагиата",
  response_to_review: "Ответ рецензенту",
  production_pdf: "Верстка (PDF)",
};

// расширяем иконки
function notificationIcon(type) {
  switch (type) {
    case "review":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "status":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "file":
      return <Upload className="h-4 w-4 text-indigo-500" />;
    case "assignment":
      return <Shield className="h-4 w-4 text-purple-500" />;
    case "message":
      return <Mail className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}



  const totalRevisions = articles.filter(
  (a) => a.status === "revision_minor" || a.status === "revision_major"
).length;
const needsRevision = (s) => s === "revision_minor" || s === "revision_major";

const revisionArticles = useMemo(
   () => articles.filter((a) => needsRevision(a.status)),
   [articles]

  );

   const [reviewsByArticle, setReviewsByArticle] = useState({});
 const [loadingReviews, setLoadingReviews] = useState(false);
const activityEvents = useMemo(() => {
  const events = [];
  const byId = Object.fromEntries(articles.map((a) => [a.id, a]));


  // РЕЦЕНЗИИ (как было)
  Object.entries(reviewsByArticle || {}).forEach(([articleId, revs]) => {
    const art = byId[Number(articleId)];
    (revs || []).forEach((r) => {
      events.push({
        id: `rev-${r.id}`,
        type: "review",
        title: "Новая рецензия",
        message: `${RECOMMENDATION_LABEL[r.recommendation] || r.recommendation} • «${art?.title || "Статья"}»`,
        time: r.created_at,
      });
    });
  });

  // СТАТУСЫ СТАТЕЙ (по created_at самой статьи — истории статусов в API нет)
  articles.forEach((a) => {
    events.push({
      id: `status-${a.id}`,
      type: "status",
      title: "Статус статьи",
      message: `«${a.title}»: ${STATUS_LABEL[a.status] || a.status}`,
      time: a.created_at,
    });
  });

  // ФАЙЛЫ (из /files)
  Object.entries(filesByArticle || {}).forEach(([articleId, files]) => {
    const art = byId[Number(articleId)];
    (files || []).forEach((f) => {
      events.push({
        id: `file-${articleId}-${f.id}`,
        type: "file",
        title: "Новый файл",
        message: `${TYPE_LABEL[f.type] || f.type} • «${art?.title || "Статья"}»`,
        time: f.uploaded_at,
      });
    });
  });

  // НАЗНАЧЕНИЯ РЕЦЕНЗЕНТОВ
  Object.entries(assignmentsByArticle || {}).forEach(([articleId, assigns]) => {
    const art = byId[Number(articleId)];
    (assigns || []).forEach((as) => {
      const statusMap = {
        assigned: "Назначен рецензент",
        accepted: "Рецензент принял назначение",
        declined: "Рецензент отклонил назначение",
        cancelled: "Назначение отменено",
        completed: "Рецензирование завершено",
      };
      events.push({
        id: `assign-${as.id}`,
        type: "assignment",
        title: statusMap[as.status] || "Назначение рецензента",
        message: `«${art?.title || "Статья"}»${as.due_at ? ` • срок до ${new Date(as.due_at).toLocaleDateString()}` : ""}`,
        time: as.created_at,
      });
    });
  });

  events.sort((a, b) => new Date(b.time) - new Date(a.time));
  return events;
}, [articles, reviewsByArticle, filesByArticle, assignmentsByArticle]);

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
      // A) только мои
      const mine = await listArticles({
        mine: true,
        journal: journalFilter || undefined,
        status: statusFilter || undefined,
      });

      // пока показываем «мои», как и задумано:
      setArticles(mine);
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
  if (!articles.length) {
    setFilesByArticle({});
    setAssignmentsByArticle({});
    return;
  }

  let aborted = false;
  (async () => {
    setLoadingActivity(true);
    try {
      // 1) последние файлы по каждой статье
      const filesEntries = await Promise.all(
        articles.map(async (a) => {
          try {
            const { data } = await http.get(
              withParams(`/api/articles/articles/${a.id}/files/`, {
                ordering: "-uploaded_at",
                page_size: 3,
              })
            );
            return [a.id, data?.results || []];
          } catch {
            return [a.id, []];
          }
        })
      );

      // 2) последние назначения рецензентов по каждой статье
      const assignEntries = await Promise.all(
        articles.map(async (a) => {
          try {
            const { data } = await http.get(
              withParams("/api/reviews/assignments/", {
                article: a.id,
                ordering: "-created_at",
                page_size: 3,
              })
            );
            return [a.id, data?.results || []];
          } catch {
            return [a.id, []];
          }
        })
      );

      if (!aborted) {
        setFilesByArticle(Object.fromEntries(filesEntries));
        setAssignmentsByArticle(Object.fromEntries(assignEntries));
      }
    } finally {
      if (!aborted) setLoadingActivity(false);
    }
  })();

  return () => {
    aborted = true;
  };
}, [articles]);


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
      // автору даём менять только title/journal
      const payload = {
        title: updated.title,
        journal: Number(updated.journal),
      };
      const saved = await updateArticle(updated.id, payload, "patch");

      setArticles((prev) => prev.map((a) => (a.id === saved.id ? saved : a)));
    } catch (e) {
      console.error("save article failed", e);
      throw e;
    }
  };

  const submitWithModal = async (article) => {
  setSubmittingId(article.id);
  try {
    const updated = await updateArticleStatus(article.id, "submitted");
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSubmitModal({
      open: true,
      title: "Отправлено!",
      desc: `Статья «${article.title}» успешно отправлена в редакцию.`,
      articleId: updated.id,
    });
  } catch (e) {
    console.error("submit failed", e);
    alert("Не удалось отправить. Попробуйте ещё раз.");
  } finally {
    setSubmittingId(null);
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

  useEffect(() => {
   const load = async () => {
     if (revisionArticles.length === 0) {
       setReviewsByArticle({});
       return;
     }
     setLoadingReviews(true);
     try {
       const entries = await Promise.all(
         revisionArticles.map(async (a) => {
           // 1) Берём назначения рецензентов по статье
           const { data: assignData } = await http.get(
             withParams("/api/reviews/assignments/", {
               article: a.id,
               ordering: "-created_at",
             })
           );
           const assignments = assignData?.results || [];

           // 2) По каждому назначению берём отзывы
           const reviews = (
             await Promise.all(
               assignments.map(async (as) => {
                 const { data: revData } = await http.get(
                   withParams("/api/reviews/reviews/", {
                     assignment: as.id,
                     ordering: "-created_at",
                   })
                 );
                 const list = revData?.results || [];
                 // приклеим само назначение — бывает полезно (due_at, blind, status)
                 return list.map((r) => ({ ...r, _assignment: as }));
               })
             )
           ).flat();

           return [a.id, reviews];
         })
       );
       setReviewsByArticle(Object.fromEntries(entries));
     } catch (e) {
       console.error("reviews load failed", e);
     } finally {
       setLoadingReviews(false);
     }
   };
   load();
 }, [revisionArticles]);

  const total = articles.length;
  const totalAccepted = articles.filter((a) => a.status === "accepted").length;
    const eventsCount = activityEvents.length;

  const totalReview = articles.filter(
    (a) => a.status === "under_review"
  ).length;

   const totalPublished = articles.filter(
    (a) => a.status === "published"
  ).length;
   const totalInProduction = articles.filter((a) => a.status === "in_production").length;




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




        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Опубликовано</p>
                <p className="text-2xl sm:text-3xl font-bold">{totalPublished}</p>
              </div>
              <Archive className="h-7 w-7 sm:h-8 sm:w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto gap-2 p-1 bg-white shadow-sm rounded-lg md:grid md:grid-cols-4 md:gap-0">
          <TabsTrigger
            value="articles"
            className="flex items-center gap-2 shrink-0"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Мои статьи</span>
            <span className="sm:hidden">Статьи</span>
          </TabsTrigger>
          <TabsTrigger
   value="reviews"
   className="flex items-center gap-2 shrink-0"
 >
   <MessageSquare className="h-4 w-4" />
   <span>Рецензии</span>
   {totalRevisions > 0 && (
     <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
       {totalRevisions}
     </span>
   )}
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
  value="activity"
  className="flex items-center gap-2 shrink-0"
>
  <Bell className="h-4 w-4" />
  <span>События</span>
  {eventsCount > 0 && (
    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
      {eventsCount > 99 ? "99+" : eventsCount}
    </span>
  )}
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

          {articles.map((article) => {
  // безопасно «распаковываем» файлы: в списке статей их может и не быть
  const files = Array.isArray(article.files) ? article.files : [];
  const hasManuscript = files.some((f) => f.type === "manuscript");
  const hasResponse   = files.some((f) => f.type === "response_to_review");
  const isRevision =
    article.status === "revision_minor" || article.status === "revision_major";

  return (
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
                {article.journal_title || `Журнал #${article.journal}`}
              </span>
            </CardDescription>
          </div>
          <div className="md:ml-4">
            <Badge className={statusBadgeClass(article.status)}>
              {STATUS_LABEL[article.status] || article.status}
            </Badge>
            {article.status === "draft" && (
              <Badge variant="outline" className="ml-2">
                манускрипт загружен
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Метаданные */}
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
              <p className="font-medium">{article.author_email || "—"}</p>
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

          <Link to={`/articles/${article.id}/edit`}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              Редактировать
            </Button>
          </Link>

          

                                         

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
  );
})}

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

        {/* ====== Рецензии ====== */}
        <TabsContent value="reviews" className="space-y-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
    Рецензии / Требуются правки
  </h2>

  {revisionArticles.length === 0 ? (
    <Card className="border-dashed">
      <CardContent className="p-6 text-gray-500">
        Пока нет статей, возвращённых на доработку.
      </CardContent>
    </Card>
  ) : loadingReviews ? (
    <Card>
      <CardContent className="p-6 text-gray-500">Загрузка отзывов…</CardContent>
    </Card>
  ) : (
    <div className="grid gap-4 sm:gap-6">
      {revisionArticles.map((article) => {
        const reviews = reviewsByArticle[article.id] || [];
        const files = Array.isArray(article.files) ? article.files : [];
        const hasManuscript = files.some((f) => f.type === "manuscript");
        const hasResponse = files.some((f) => f.type === "response_to_review");

        return (
          <Card
            key={article.id}
            className="border shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {article.journal_title || `Журнал #${article.journal}`} •{" "}
                    <Badge className={statusBadgeClass(article.status)}>
                      {STATUS_LABEL[article.status] || article.status}
                    </Badge>
                  </CardDescription>
                </div>
                <Link to={`/articles/${article.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" /> Открыть
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Список реальных отзывов */}
              {reviews.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Отзывов пока нет. Загляните позже.
                </div>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((rev) => (
                    <li
                      key={rev.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm">
                          <span className="font-medium">
                            Рекомендация:{" "}
                            {RECOMMENDATION_LABEL[rev.recommendation] ||
                              rev.recommendation}
                          </span>
                          {rev._assignment?.due_at && (
                            <span className="ml-2 text-gray-500">
                              (срок:{" "}
                              {new Date(
                                rev._assignment.due_at
                              ).toLocaleDateString()}
                              )
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(rev.created_at).toLocaleString()}
                        </div>
                      </div>

                      {rev.body && (
                        <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                          {rev.body}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Кнопки для загрузки и повторной отправки правок */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                <Link to={`/articles/${article.id}/edit?tab=files`}>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    Загрузить правки
                  </Button>
                </Link>

                <Button
                  size="sm"
                  disabled={submittingId === article.id}
  onClick={async () => {
    if (!hasManuscript) {
      alert("Загрузите обновлённую рукопись (manuscript) в «Файлы».");
      return;
    }
    if (!hasResponse) {
      alert("Загрузите ответ рецензенту (response_to_review) в «Файлы».");
      return;
    }
    await submitWithModal(article);
  }}
                >
                 {submittingId === article.id ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Отправка…
    </>
  ) : (
    "Отправить исправления"
  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  )}
</TabsContent>

<TabsContent value="activity" className="space-y-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
    Лента событий
  </h2>

  {loadingActivity ? (
    <Card>
      <CardContent className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загрузка событий…
      </CardContent>
    </Card>
  ) : activityEvents.length === 0 ? (
    <Card className="border-dashed">
      <CardContent className="p-6 text-gray-500">
        Пока нет новых событий.
      </CardContent>
    </Card>
  ) : (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-100">
          {activityEvents.map((n) => (
            <li key={n.id} className="p-4 flex items-start gap-3">
              {notificationIcon(n.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.time ? new Date(n.time).toLocaleString() : "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )}
</TabsContent>




     

       
      </Tabs>

      {/* Модалка «успешно отправлено» */}
<Dialog
  open={submitModal.open}
  onOpenChange={(open) => setSubmitModal((s) => ({ ...s, open }))}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{submitModal.title || "Успех"}</DialogTitle>
      <DialogDescription>
        {submitModal.desc || "Действие выполнено успешно."}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setSubmitModal({ open: false, title: "", desc: "", articleId: null })}>
        Ок
      </Button>
      {submitModal.articleId && (
        <Button
          onClick={() => {
            const id = submitModal.articleId;
            setSubmitModal({ open: false, title: "", desc: "", articleId: null });
            navigate(`/articles/${id}`);
          }}
        >
          Открыть статью
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>


   {editOpen && editingArticle && (
  <EditArticleSheet
    open
    onOpenChange={(o) => {
      setEditOpen(o);
      if (!o) setEditingArticle(null);
    }}
    article={editingArticle}
    onSave={handleSaveArticle}
  />
)}


{/* Модалка со всем списком событий */}
<Dialog open={activityOpen} onOpenChange={setActivityOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Все события</DialogTitle>
      <DialogDescription>
        Лента последних действий по вашим статьям.
      </DialogDescription>
    </DialogHeader>

    <div className="max-h-[60vh] overflow-auto space-y-3">
      {activityEvents.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
        >
          {notificationIcon(n.type)}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {n.time ? new Date(n.time).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      ))}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setActivityOpen(false)}>
        Закрыть
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


    </div>
  );
}
