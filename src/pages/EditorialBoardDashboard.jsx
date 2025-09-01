import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, FileText, Vote } from "lucide-react";

export default function EditorialBoardDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Редакционный совет
                </h1>
                <p className="text-gray-600">Принятие решений о публикации</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">На голосовании</p>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <Vote className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Утверждено</p>
                  <p className="text-3xl font-bold">45</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Активные члены</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Заседания</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Статьи на голосовании</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Инновационные подходы в области искусственного
                        интеллекта
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>Автор: Д-р Сидоров К.М.</span>
                        <span>Рецензии: 3/3</span>
                        <Badge className="bg-green-100 text-green-800">
                          Готово к голосованию
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">За: 7</span>
                        <span className="text-red-600">Против: 1</span>
                        <span className="text-gray-600">Воздержались: 2</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Просмотр
                      </Button>
                      <Button size="sm">Голосовать</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
