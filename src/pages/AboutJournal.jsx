import { BookOpen, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  BarChart3,
  Mail,
  Phone,
  FileText,
  Globe,
  Award,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom"; // добавьте импорт

import Sardar from "../../public/sardar.png";
import Logo from "../../public/writing 1.png";
export default function AboutJournal() {
  const publicationTopics = [
    "Естественные и технические науки",
    "Гуманитарные и общественные дисциплины",
    "Информационные технологии и инженерия",
    "Экономика, менеджмент, юриспруденция",
    "Образование, педагогика, психология",
  ];

  const targetAudience =
    "Научные сотрудники, преподаватели вузов, аспиранты, докторанты, а также практики, заинтересованные в научно-обоснованных решениях.";

  const journalInfo = {
    title: 'Научный журнал "Вестник науки"',
    description:
      "Вестник науки — это научный рецензируемый журнал, публикующий оригинальные исследования, обзоры и аналитические материалы по широкому спектру дисциплин. Мы объединяем ученых, преподавателей, аспирантов и исследователей для обмена знаниями, опытом и передовыми идеями.",
    mission:
      "Продвигать научные исследования и развитие академического диалога между представителями различных научных направлений, способствуя интеграции науки и практики.",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Qalam Masters
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Главная
              </a>
              <a href="/about-journal" className="text-blue-600 font-medium">
                О журнале
              </a>
              <a
                href="/editorial-board"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Редколлегия
              </a>
              <a
                href="/author-info"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Информация для авторов
              </a>
              <a
                href="/publication-terms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Условия публикации
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-blue-100 text-blue-800 mb-6">О журнале</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {journalInfo.title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {journalInfo.description}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Миссия журнала</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {journalInfo.mission}
                </CardDescription>
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
                <CardDescription className="text-gray-600 leading-relaxed">
                  {targetAudience}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">
                  Рецензирование и этика
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Все статьи проходят двустороннее слепое рецензирование. Мы
                  придерживаемся принципов прозрачности, академической честности
                  и соблюдения международных стандартов публикационной этики
                  (COPE).
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Topics Section */}
      <section
        id="topics"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-green-100 text-green-800">
              Тематика публикаций
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Направления исследований
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Мы принимаем к публикации оригинальные научные работы по широкому
              спектру дисциплин
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicationTopics.map((topic, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
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

      {/* Additional Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                История и развитие
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Журнал "Вестник науки" был основан с целью создания платформы
                для обмена научными знаниями и продвижения качественных
                исследований. Мы стремимся поддерживать высокие стандарты
                научной публикации и способствовать развитию научного
                сообщества.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Наши принципы</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Открытость и прозрачность процесса рецензирования</li>
                    <li>• Соблюдение этических стандартов публикации</li>
                    <li>• Поддержка молодых исследователей</li>
                    <li>• Междисциплинарный подход к науке</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Качество публикаций</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Строгий отбор рукописей</li>
                    <li>• Квалифицированные рецензенты</li>
                    <li>• Соответствие международным стандартам</li>
                    <li>• Регулярное повышение качества</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
