import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Star, FileText, Clock } from "lucide-react"

export default function ReviewerProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Профиль рецензента
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Петрова Анна Владимировна</h2>
                <p className="text-gray-600">Доктор физико-математических наук</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-100 text-green-800">Эксперт</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-sm text-gray-600">Рецензий выполнено</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-gray-600">Дней средний срок</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-gray-600">Средняя оценка</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Области экспертизы</h3>
              <div className="space-y-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Квантовая физика
                </span>
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm ml-2">
                  Математическое моделирование
                </span>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Вычислительная физика
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button>Редактировать профиль</Button>
              <Button variant="outline">История рецензий</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
