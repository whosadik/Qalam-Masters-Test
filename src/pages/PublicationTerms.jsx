import { BookOpen, Award, Clock, Eye, BarChart3, FileText, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function PublicationTerms() {
  const journalStats = [
    { label: "Стоимость публикации", value: "5 000 тенге", icon: Award },
    { label: "Срок первичного отклика", value: "до 5 рабочих дней", icon: Clock },
    { label: "Срок рецензирования", value: "до 21 дня", icon: Eye },
    { label: "Период публикации", value: "в следующем номере после принятия публикации", icon: BarChart3 },
    { label: "Допустимый объем", value: "от 4 до 12 страниц", icon: FileText },
    { label: "Языки публикации", value: "английский, русский, казахский", icon: Globe },
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
              <a href="/editorial-board" className="text-gray-600 hover:text-gray-900 transition-colors">
                Редколлегия
              </a>
              <a href="/author-info" className="text-gray-600 hover:text-gray-900 transition-colors">
                Информация для авторов
              </a>
              <a href="/publication-terms" className="text-blue-600 font-medium">
                Условия публикации
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-orange-100 text-orange-800 mb-6">Условия публикации</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Условия и сроки публикации</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Подробная информация о стоимости, сроках и условиях публикации статей в журнале
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{stat.label}</h3>
                    <p className="text-blue-600 font-medium">{stat.value}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Дополнительная информация</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Периодичность выхода</h3>
                <p className="text-gray-600 mb-4">
                  Журнал выходит ежеквартально (4 раза в год). Публикация осуществляется как в электронном, так и в
                  печатном формате.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Март - весенний номер</li>
                  <li>• Июнь - летний номер</li>
                  <li>• Сентябрь - осенний номер</li>
                  <li>• Декабрь - зимний номер</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Оплата публикации</h3>
                <p className="text-gray-600 mb-4">
                  Стоимость публикации составляет 5 000 тенге за статью. Оплата производится после принятия статьи к
                  публикации.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Банковский перевод</li>
                  <li>• Онлайн-оплата</li>
                  <li>• Оплата через Kaspi</li>
                  <li>• Льготы для студентов и аспирантов</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Авторские права</h3>
                <p className="text-gray-600 mb-4">
                  Авторы сохраняют авторские права на свои работы. Журнал получает право на первую публикацию.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Лицензия Creative Commons</li>
                  <li>• Свободный доступ к статьям</li>
                  <li>• Право на перепечатку с указанием источника</li>
                  <li>• Архивирование в электронных базах</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Индексация</h3>
                <p className="text-gray-600 mb-4">
                  Журнал индексируется в ведущих научных базах данных для обеспечения максимальной видимости публикаций.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Google Scholar</li>
                  <li>• РИНЦ (Российский индекс научного цитирования)</li>
                  <li>• КазНЭБ (Казахстанская национальная электронная библиотека)</li>
                  <li>• Crossref DOI</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Приглашение к авторам</h2>
          <p className="text-gray-600 mb-8">
            Мы открыты к сотрудничеству с авторами из разных стран и научных школ. Ознакомьтесь с требованиями к
            оформлению статей и подайте вашу работу через личный кабинет.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/submit-article"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Подать статью в журнал
            </a>
            <a
              href="/author-info"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Требования к оформлению
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
