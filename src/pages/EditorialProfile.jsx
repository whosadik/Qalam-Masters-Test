import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, MessageSquare, Calendar, Shield } from "lucide-react"

export default function EditorialProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Редакционная коллегия</h1>
                <p className="text-gray-600">Управление процессом публикации</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="submissions">Поданные статьи</TabsTrigger>
            <TabsTrigger value="structure">Проверка структуры</TabsTrigger>
            <TabsTrigger value="reviewers">Назначение рецензентов</TabsTrigger>
            <TabsTrigger value="plagiarism">Антиплагиат</TabsTrigger>
            <TabsTrigger value="communication">Переписка</TabsTrigger>
            <TabsTrigger value="deadlines">Контроль сроков</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Поданные статьи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Исследование квантовых вычислений в криптографии
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Автор: Проф. Петров В.И.</span>
                            <span>Подано: 20.01.2024</span>
                            <Badge className="bg-blue-100 text-blue-800">Новая</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Просмотр
                          </Button>
                          <Button size="sm">Обработать</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  Автоматическая проверка структуры статей и соответствия требованиям журнала.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviewers" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Назначение рецензентов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Ручной и автоматический подбор рецензентов для статей.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plagiarism" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Проверка на плагиат
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Отправка статей на проверку антиплагиатом и анализ результатов.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Переписка с авторами и рецензентами
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Встроенная система сообщений для коммуникации.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Контроль сроков рецензирования
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Мониторинг дедлайнов и уведомления о просрочках.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
