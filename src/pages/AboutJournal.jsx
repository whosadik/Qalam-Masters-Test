import { BookOpen, Users, Shield, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Navbar from "../components/layout/Navbar";

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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Skip link */}
      <a
        href="#about-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:px-3 focus:py-2 focus:shadow"
      >
        Перейти к основному содержимому
      </a>

      {/* Header */}
      <Navbar />

      {/* Hero */}
      <section
        className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 py-14 sm:py-16 lg:py-20"
        aria-label="О журнале — вступительный блок"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 sm:mb-6 bg-blue-100 text-blue-800 dark:bg-slate-700 dark:text-slate-100">
            О журнале
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {journalInfo.title}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-slate-300 leading-relaxed">
            {journalInfo.description}
          </p>
        </div>
      </section>

      <main id="about-main">
        {/* Mission / Audience / Ethics */}
        <section
          className="py-14 sm:py-16 lg:py-20"
          aria-label="Миссия, аудитория и рецензирование"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:gap-8 lg:gap-10 lg:grid-cols-3">
              <Card className="border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">
                    Миссия журнала
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-slate-300 leading-relaxed">
                    {journalInfo.mission}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">
                    Целевая аудитория
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-slate-300 leading-relaxed">
                    {targetAudience}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">
                    Рецензирование и этика
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-slate-300 leading-relaxed">
                    Все статьи проходят двустороннее слепое рецензирование. Мы
                    придерживаемся принципов прозрачности, академической
                    честности и соблюдения международных стандартов
                    публикационной этики (COPE).
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Topics */}
        <section
          id="topics"
          className="py-14 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
          aria-label="Тематика публикаций"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 sm:space-y-4 mb-12 sm:mb-16">
              <Badge className="bg-green-100 text-green-800 dark:bg-slate-700 dark:text-slate-100">
                Тематика публикаций
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Направления исследований
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
                Мы принимаем к публикации оригинальные научные работы по
                широкому спектру дисциплин
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicationTopics.map((topic, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow motion-reduce:transition-none dark:bg-slate-800"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-slate-700 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {topic}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section
          className="py-14 sm:py-16 lg:py-20 bg-gray-50 dark:bg-slate-900"
          aria-label="История и качество"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 sm:space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  История и развитие
                </h2>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                  Журнал «Вестник науки» был основан с целью создания платформы
                  для обмена научными знаниями и продвижения качественных
                  исследований. Мы поддерживаем высокие стандарты научной
                  публикации и способствуем развитию сообщества.
                </p>
              </div>

              <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                <Card className="border-0 shadow-lg dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                      Наши принципы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                      <li>
                        • Открытость и прозрачность процесса рецензирования
                      </li>
                      <li>• Соблюдение этических стандартов публикации</li>
                      <li>• Поддержка молодых исследователей</li>
                      <li>• Междисциплинарный подход к науке</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                      Качество публикаций
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                      <li>• Строгий отбор рукописей</li>
                      <li>• Квалифицированные рецензенты</li>
                      <li>• Соответствие международным стандартам</li>
                      <li>• Регулярное повышение качества</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Back to top (мобилки) */}
            <div className="mt-10 text-center">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Вернуться наверх
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
