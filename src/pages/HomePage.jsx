import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FilePlus2,
  ShieldCheck,
  Users,
  BarChart3,
  BookOpenCheck,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ContactSection from "@/components/ContactSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/auth/AuthContext";

/**
 * HomePage (Platform-wide)
 * Бренд: primary #3972FE, нейтральные: белый/серый/чёрный, аккуратные тени/границы
 * Шрифты рекомендуемые (подключить глобально): Inter или DM Sans
 */
export default function HomePage() {
  const { booted, isAuthenticated, isOrgAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-white text-[#0B1220]">
      <Navbar />

      {/* ===================== HERO ===================== */}
      <section
        id="hero"
        className="relative overflow-hidden py-16 sm:py-20 md:py-24 bg-white"
      >
        {/* blue gradient halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(57,114,254,0.18),rgba(57,114,254,0)_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(163,198,255,0.18),rgba(163,198,255,0)_60%)]"
        />

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column — slogan */}
            <div className="space-y-7">
              <h1 className="[text-wrap:balance] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                Единая платформа для авторов и журналов
              </h1>

              <p className="[text-wrap:balance] max-w-prose text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                Qalam Masters объединяет авторов и редакции: быстрая подача,
                прозрачное рецензирование, удобные журналы и аналитика — всё в
                одном месте.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {!booted ? (
                  <div className="h-12 w-56 rounded-md bg-gray-200 animate-pulse" />
                ) : (
                  <Link
                    to="/submit-article"
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3972FE] rounded-md"
                  >
                    <Button
                      size="lg"
                      className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-[#3972FE] hover:bg-[#2f62df] text-white"
                    >
                      Подать статью
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}

                {booted &&
                  (isAuthenticated ? (
                    isOrgAdmin ? (
                      <Link
                        to="/moderator"
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3972FE] rounded-md"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-gray-300"
                        >
                          Кабинет организации
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        to="/organizations/new"
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3972FE] rounded-md"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-gray-300"
                        >
                          Создать организацию / журнал
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Link
                      to="/register"
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3972FE] rounded-md"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-gray-300"
                      >
                        Создать организацию / журнал
                      </Button>
                    </Link>
                  ))}
              </div>

              {/* key points */}
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#3972FE]" /> Этика и
                  антиплагиат
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#3972FE]" /> Роли: авторы,
                  рецензенты, редакторы
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#3972FE]" /> Отчёты и
                  метрики
                </li>
                <li className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-[#3972FE]" /> Выпуски и
                  архивы
                </li>
              </ul>
            </div>

            {/* Right column — lively, minimal visual */}
            <div className="relative lg:order-last">
              <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg">
                <div className="rounded-2xl border border-black/5 bg-white shadow-xl p-6 sm:p-8">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#EFF4FF] flex items-center justify-center ring-1 ring-[#3972FE]/20">
                      <FilePlus2 className="h-5 w-5 text-[#3972FE]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Новая статья</p>
                      <p className="text-sm text-gray-600">PDF</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-600">
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-black/5">
                      Антиплагиат · 92%
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-black/5">
                      Рецензенты · 2
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-black/5">
                      Статус · На рецензии
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="h-2 w-full rounded bg-gray-100">
                      <div className="h-2 w-2/3 rounded bg-[#3972FE]/80" />
                    </div>
                  </div>
                </div>

                {/* floating chips */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== AUDIENCES TABS ===================== */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <Badge className="bg-gray-100 text-gray-900 border border-gray-200">
              Как это работает
            </Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.01em]">
              Два простых сценария
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Выберите подходящий путь — для автора или для организации/частного
              лица.
            </p>
          </div>

          <Tabs defaultValue="authors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="authors">Авторам</TabsTrigger>
              <TabsTrigger value="orgs">Организациям</TabsTrigger>
            </TabsList>

            <TabsContent value="authors" className="mt-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Регистрация",
                    desc: "Создайте аккаунт и заполните профиль автора.",
                  },
                  {
                    title: "Выбор журнала",
                    desc: "Найдите подходящий журнал в каталоге.",
                  },
                  {
                    title: "Подача статьи",
                    desc: "Загрузите файл, метаданные, сопроводительные документы.",
                  },
                  {
                    title: "Рецензия → решение",
                    desc: "Отслеживайте статусы и получайте решение редакции.",
                  },
                ].map((s, i) => (
                  <Card
                    key={i}
                    className="border border-gray-200 shadow-sm rounded-2xl"
                  >
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        {i + 1}. {s.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      {s.desc}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Link to="/submit-article">
                  <Button
                    size="lg"
                    className="bg-[#3972FE] hover:bg-[#2f64e6] text-white"
                  >
                    Подать статью
                  </Button>
                </Link>
                <Link to="/journals">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-[#0B1220] hover:bg-gray-50"
                  >
                    Каталог журналов
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="orgs" className="mt-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Создание организации",
                    desc: "Любое лицо/организация может создать свой аккаунт.",
                  },
                  {
                    title: "Запуск журнала",
                    desc: "Назовите журнал, задайте политику, роли и процесс.",
                  },
                  {
                    title: "Процесс публикаций",
                    desc: "Приём статей, рецензии, решения, выпуски и архивы.",
                  },
                  {
                    title: "Аналитика и отчёты",
                    desc: "Статистика по срокам, отказам/принятию, активности.",
                  },
                ].map((s, i) => (
                  <Card
                    key={i}
                    className="border border-gray-200 shadow-sm rounded-2xl"
                  >
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        {i + 1}. {s.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      {s.desc}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Link to="/organizations/new">
                  <Button
                    size="lg"
                    className="bg-[#3972FE] hover:bg-[#2f64e6] text-white"
                  >
                    Создать организацию/журнал
                  </Button>
                </Link>
                <Link to="/docs/onboarding-org">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-[#0B1220] hover:bg-gray-50"
                  >
                    Онбординг для редакций
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ===================== FEATURE GRID ===================== */}
      <section className="py-14 sm:py-16 lg:py-20 bg-gray-50">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-white text-gray-900 border border-gray-200">
              Возможности
            </Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.01em]">
              Автоматизация полного цикла
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6 text-[#3972FE]" />,
                title: "Антиплагиат и соответствие",
                desc: "Интеграции и проверки оригинальности, поддержка этики публикаций.",
              },
              {
                icon: <Users className="h-6 w-6 text-[#3972FE]" />,
                title: "Роли и маршруты",
                desc: "Авторы, рецензенты, редакторы и администраторы с гибкими правами.",
              },
              {
                icon: <BookOpenCheck className="h-6 w-6 text-[#3972FE]" />,
                title: "Выпуски и архивы",
                desc: "Публичные страницы журналов, номера, метаданные и индексация.",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-[#3972FE]" />,
                title: "Аналитика",
                desc: "Отчёты по срокам рецензий, отказам/принятию, активности редакций.",
              },
              {
                icon: <FilePlus2 className="h-6 w-6 text-[#3972FE]" />,
                title: "Умная подача",
                desc: "Шаблоны, чек-листы, валидаторы полей и файлов для качества рукописей.",
              },
              {
                icon: <Building2 className="h-6 w-6 text-[#3972FE]" />,
                title: "Мульти-журналы",
                desc: "Одна организация — несколько журналов, независимые команды и политики.",
              },
            ].map((f, i) => (
              <Card
                key={i}
                className="border border-gray-200 shadow-sm rounded-2xl"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#EAF1FF] flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  {f.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
                Платформа была создана как технологическая основа для
                современных научных журналов, стремящихся к качеству,
                эффективности и международному признанию. Мы поддерживаем
                высокие стандарты и способствуем развитию научного сообщества.
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
                    <li>• Открытость и прозрачность процесса рецензирования</li>
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
      <Footer></Footer>
    </div>
  );
}
