import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileText,
  Shield,
  Users,
  BarChart3,
  Mail,
  Phone,
  Globe,
  Award,
  Clock,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const journalInfo = {
    title: 'Научный журнал "Вестник науки"',
    description:
      "Вестник науки — это научный рецензируемый журнал, публикующий оригинальные исследования, обзоры и аналитические материалы по широкому спектру дисциплин. Мы объединяем ученых, преподавателей, аспирантов и исследователей для обмена знаниями, опытом и передовыми идеями.",
    mission:
      "Продвигать научные исследования и развитие академического диалога между представителями различных научных направлений, способствуя интеграции науки и практики.",
  }

  const publicationTopics = [
    "Естественные и технические науки",
    "Гуманитарные и общественные дисциплины",
    "Информационные технологии и инженерия",
    "Экономика, менеджмент, юриспруденция",
    "Образование, педагогика, психология",
  ]

  const targetAudience =
    "Научные сотрудники, преподаватели вузов, аспиранты, докторанты, а также практики, заинтересованные в научно-обоснованных решениях."

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

  const journalStats = [
    { label: "Стоимость публикации", value: "5 000 тенге" },
    { label: "Срок первичного отклика", value: "до 5 рабочих дней" },
    { label: "Срок рецензирования", value: "до 21 дня" },
    { label: "Период публикации", value: "в следующем номере после принятия публикации" },
    { label: "Допустимый объем", value: "от 4 до 12 страниц" },
    { label: "Языки публикации", value: "английский, русский, казахский" },
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
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                О журнале
              </a>
              <a href="#topics" className="text-gray-600 hover:text-gray-900 transition-colors">
                Тематика
              </a>
              <a href="#editorial" className="text-gray-600 hover:text-gray-900 transition-colors">
                Редколлегия
              </a>
              <a href="#info" className="text-gray-600 hover:text-gray-900 transition-colors">
                Информация
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Контакты
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline">Войти</Button>
              <Button>Подать статью в журнал</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">📚 Научный рецензируемый журнал</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">{journalInfo.title}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{journalInfo.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6">
                  Подать статью в журнал
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                  Требования к оформлению
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Рецензируемый журнал</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Быстрое рецензирование</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Международные стандарты</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <img
                  src="/vestnik-nauki-cover.png"
                  alt="Обложка журнала Вестник науки"
                  className="w-full max-w-md mx-auto h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-blue-100 text-blue-800">Миссия журнала</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">О нашем журнале</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Миссия журнала</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{journalInfo.mission}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Целевая аудитория</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">{targetAudience}</CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Рецензирование и этика</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Все статьи проходят двустороннее слепое рецензирование. Мы придерживаемся принципов прозрачности,
                  академической честности и соблюдения международных стандартов публикационной этики (COPE).
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-green-100 text-green-800">Тематика публикаций</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Направления исследований</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Мы принимаем к публикации оригинальные научные работы по широкому спектру дисциплин
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicationTopics.map((topic, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{topic}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Board Section */}
      <section id="editorial" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-purple-100 text-purple-800">Редакционная коллегия</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Наша команда экспертов</h2>
          </div>

          <div className="space-y-6">
            {editorialBoard.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-blue-600 font-medium">{member.position}</p>
                      <p className="text-gray-600">{member.degree}</p>
                    </div>
                    <Badge variant="outline">{member.location}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Info Section */}
      <section id="info" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-orange-100 text-orange-800">Информация для авторов</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Условия публикации</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {index === 0 && <Award className="h-6 w-6 text-orange-600" />}
                    {index === 1 && <Clock className="h-6 w-6 text-orange-600" />}
                    {index === 2 && <Eye className="h-6 w-6 text-orange-600" />}
                    {index === 3 && <BarChart3 className="h-6 w-6 text-orange-600" />}
                    {index === 4 && <FileText className="h-6 w-6 text-orange-600" />}
                    {index === 5 && <Globe className="h-6 w-6 text-orange-600" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{stat.label}</h3>
                  <p className="text-blue-600 font-medium">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Журнал выходит ежеквартально (4 раза в год). Публикация осуществляется как в электронном, так и в печатном
              формате.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Приглашение к авторам</h3>
            <p className="text-gray-600 max-w-4xl mx-auto">
              Мы открыты к сотрудничеству с авторами из разных стран и научных школ. Ознакомьтесь с требованиями к
              оформлению статей и подайте вашу работу через личный кабинет.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Готовы опубликовать свое исследование?</h2>
            <p className="text-xl text-gray-600">
              Присоединяйтесь к научному сообществу и поделитесь своими открытиями с коллегами по всему миру.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Подать статью в журнал
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Требования к оформлению
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">Вестник науки</span>
              </div>
              <p className="text-gray-400">
                Научный рецензируемый журнал для публикации оригинальных исследований и обзоров по широкому спектру
                дисциплин.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Журнал</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    О журнале
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Архив номеров
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Требования к статьям
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Этика публикации
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Авторам</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Подача статьи
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Процесс рецензирования
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Шаблоны оформления
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Часто задаваемые вопросы
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Контакты редакции</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+7 777 888 55 44</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Научный журнал "Вестник науки". Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
