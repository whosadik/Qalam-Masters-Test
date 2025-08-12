import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, MapPin, Calendar } from "lucide-react"

export default function AuthorProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Профиль автора
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Иванов Алексей Сергеевич</h2>
                <p className="text-gray-600">Кандидат технических наук</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    alexey.ivanov@university.edu
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Москва, Россия
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Регистрация: 15.01.2024
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Области исследований</h3>
                <div className="space-y-2">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Машинное обучение
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm ml-2">
                    Экологические науки
                  </span>
                  <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Анализ данных
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Статистика</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Опубликованных статей:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Цитирований:</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">H-индекс:</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button>Редактировать профиль</Button>
              <Button variant="outline">Экспорт CV</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
