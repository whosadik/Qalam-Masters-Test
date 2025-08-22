import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Users,
  Database,
  Shield,
  BarChart3,
  HelpCircle,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl flex items-center justify-center">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Администратор платформы
          </h1>
          <p className="text-gray-600">Управление системой и пользователями</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        {/* гибкие табы: скролл на мобилке, центр на md+ */}
        <TabsList
          className="
            relative flex w-full overflow-x-auto rounded-lg bg-white shadow-sm
            px-1 py-1 gap-1
            md:justify-center
            motion-reduce:transition-none
          "
          aria-label="Разделы админ-панели"
        >
          {[
            ["users", "Пользователи"],
            ["roles", "Роли"],
            ["settings", "Настройки"],
            ["integrations", "Интеграции"],
            ["journals", "База журналов"],
            ["analytics", "Аналитика"],
            ["support", "Техподдержка"],
          ].map(([val, label]) => (
            <TabsTrigger
              key={val}
              value={val}
              className="
                whitespace-nowrap flex-1 md:flex-none
                data-[state=active]:bg-slate-100
              "
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* USERS */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Управление пользователями
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="border rounded-lg p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">
                            Иванов Алексей Сергеевич
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            alexey.ivanov@university.edu
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                        <Badge className="self-start sm:self-auto">Автор</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          Редактировать
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Всего пользователей</p>
                    <p className="text-3xl font-bold">1,234</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Активные сессии</p>
                    <p className="text-3xl font-bold">89</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Время работы</p>
                    <p className="text-3xl font-bold">99.9%</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Хранилище</p>
                    <p className="text-3xl font-bold">2.1TB</p>
                  </div>
                  <Database className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SUPPORT */}
        <TabsContent value="support" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Техническая поддержка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border rounded-lg p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          Проблема с загрузкой файлов
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className="truncate">
                            Пользователь: user@example.com
                          </span>
                          <span className="opacity-50">•</span>
                          <span>Создано: 22.01.2024</span>
                          <Badge className="bg-red-100 text-red-800">
                            Высокий приоритет
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          Просмотр
                        </Button>
                        <Button size="sm" className="w-full sm:w-auto">
                          Ответить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Пустые табы — задел под будущее, чтобы не ломать вёрстку */}
        <TabsContent value="roles">
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center text-gray-500">
              Раздел «Роли» в разработке.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center text-gray-500">
              Раздел «Настройки» в разработке.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations">
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center text-gray-500">
              Раздел «Интеграции» в разработке.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="journals">
          <Card className="border-dashed border-2">
            <CardContent className="p-8 text-center text-gray-500">
              Раздел «База журналов» в разработке.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
