"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"

export default function AuthorDashboard() {
  const [articles] = useState([
    {
      id: 1,
      title: "Применение машинного обучения в прогнозировании изменения климата",
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
  ])

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
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "Опубликовано":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "На рецензировании":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Требует правок":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "Отклонено":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "review":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "status":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "message":
        return <Mail className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Личный кабинет автора</h1>
            <p className="text-gray-600">Управляйте своими научными публикациями</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button variant="outline" size="sm" className="relative bg-transparent">
              <Bell className="h-4 w-4 mr-2" />
              Уведомления
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </Button>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Новая статья
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Всего статей</p>
                <p className="text-3xl font-bold">{articles.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Опубликовано</p>
                <p className="text-3xl font-bold">{articles.filter((a) => a.status === "Опубликовано").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">На рецензировании</p>
                <p className="text-3xl font-bold">{articles.filter((a) => a.status === "На рецензировании").length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Средний рейтинг</p>
                <p className="text-3xl font-bold">4.8</p>
              </div>
              <Star className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Мои статьи
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Создать статью
          </TabsTrigger>
          <TabsTrigger value="journals" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Поиск журналов
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Рецензии
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Переписка
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Архив
          </TabsTrigger>
        </TabsList>

        {/* Мои статьи */}
        <TabsContent value="articles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Мои статьи</h2>
            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статьи</SelectItem>
                  <SelectItem value="published">Опубликованные</SelectItem>
                  <SelectItem value="review">На рецензировании</SelectItem>
                  <SelectItem value="revision">Требуют правок</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Поиск статей..." className="w-64" />
            </div>
          </div>

          <div className="grid gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl text-gray-900">{article.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {article.version}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600">
                        <span className="font-medium">{article.journal}</span> • {article.category}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(article.status)}>{article.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Прогресс публикации</span>
                      <span className="font-medium text-gray-900">{article.progress}%</span>
                    </div>
                    <Progress value={article.progress} className="h-2" />
                  </div>

                  {/* Article Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <p className="font-medium text-green-600">{article.plagiarismScore}%</p>
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
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      Просмотр
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Скачать
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                      <MessageSquare className="h-4 w-4" />
                      Обсуждение
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Создать статью */}
        <TabsContent value="create" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Создать новую статью</h2>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Название статьи</label>
                    <Input placeholder="Введите название вашей статьи..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Область науки</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите область" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="environmental">Экологические науки</SelectItem>
                        <SelectItem value="physics">Физика</SelectItem>
                        <SelectItem value="energy">Энергетика</SelectItem>
                        <SelectItem value="computer">Информатика</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Аннотация</label>
                  <Textarea placeholder="Краткое описание вашего исследования..." className="min-h-[120px]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ключевые слова</label>
                  <Input placeholder="машинное обучение, климат, прогнозирование..." />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Загрузите файл статьи</p>
                  <p className="text-gray-600 mb-4">Поддерживаемые форматы: PDF, DOC, DOCX (до 10 МБ)</p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Выбрать файл
                  </Button>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Сохранить черновик</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Создать статью</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Остальные TabsContent остаются такими же, как в оригинале */}
      </Tabs>

      {/* Notifications Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Последние уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  !notification.read ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Показать все уведомления
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
