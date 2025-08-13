import { BookOpen, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function EditorialBoard() {
  const editorialBoard = [
    { name: "Асанов Алмас Ахатович", position: "Главный редактор", degree: "д.ф-н., профессор", location: "Казахстан" },
    {
      name: "Асанов Алмас Ахатович",
      position: "Заместитель главного редактора",
      degree: "д.ф-н., профессор",
      location: "Казахстан",
    },
    {
      name: "Асанов Алмас Ахатович",
      position: "Член редакционного совета",
      degree: "д.ф-н., профессор",
      location: "Казахстан",
    },
    {
      name: "Асанов Алмас Ахатович",
      position: "Член редакционного совета",
      degree: "д.ф-н., профессор",
      location: "Казахстан",
    },
    {
      name: "Асанов Алмас Ахатович",
      position: "Член редакционного совета",
      degree: "д.ф-н., профессор",
      location: "Казахстан",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Qalam Masters</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Главная
              </a>
              <a href="/about-journal" className="text-gray-600 hover:text-gray-900 transition-colors">
                О журнале
              </a>
              <a href="/editorial-board" className="text-blue-600 font-medium">
                Редколлегия
              </a>
              <a href="/author-info" className="text-gray-600 hover:text-gray-900 transition-colors">
                Информация для авторов
              </a>
              <a href="/publication-terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Условия публикации
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-purple-100 text-purple-800 mb-6">Редакционная коллегия</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Наша команда экспертов</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Редакционная коллегия журнала состоит из ведущих ученых и специалистов в различных областях науки
          </p>
        </div>
      </section>

      {/* Editorial Board Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {editorialBoard.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-blue-600 font-medium text-lg">{member.position}</p>
                        <p className="text-gray-600">{member.degree}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {member.location}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Роль редакционной коллегии</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Обязанности редколлегии</h3>
                  <ul className="space-y-2 text-gray-600 text-left">
                    <li>• Определение редакционной политики журнала</li>
                    <li>• Контроль качества публикуемых материалов</li>
                    <li>• Привлечение квалифицированных рецензентов</li>
                    <li>• Принятие решений о публикации статей</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Экспертиза и опыт</h3>
                  <ul className="space-y-2 text-gray-600 text-left">
                    <li>• Ведущие специалисты в своих областях</li>
                    <li>• Международный опыт научной работы</li>
                    <li>• Активная исследовательская деятельность</li>
                    <li>• Опыт рецензирования научных работ</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
