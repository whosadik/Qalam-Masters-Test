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
import { useTranslation } from "react-i18next";

/**
 * HomePage (Platform-wide)
 * Бренд: primary #3972FE, нейтральные: белый/серый/чёрный, аккуратные тени/границы
 * Шрифты рекомендуемые (подключить глобально): Inter или DM Sans
 */
export default function HomePage() {
  const { t } = useTranslation();
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
                {t("home:hero_title")}
              </h1>

              <p className="[text-wrap:balance] max-w-prose text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                {t("home:hero_subtitle")}
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
                      {t("home:cta_submit")}
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
                          {t("home:hero.cta_org_dashboard", "Кабинет организации")}
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
                          {t("home:cta_create_org")}
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
                        {t("home:cta_create_org")}
                      </Button>
                    </Link>
                  ))}
              </div>

              {/* key points */}
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#3972FE]" /> {t("home:hero.point_ethics", "Этика и антиплагиат")}
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#3972FE]" /> {t("home:hero.point_roles", "Роли: авторы, рецензенты, редакторы")}
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#3972FE]" /> {t("home:hero.point_reports", "Отчёты и метрики")}
                </li>
                <li className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-[#3972FE]" /> {t("home:hero.point_issues", "Выпуски и архивы")}
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
                      <p className="font-semibold">{t("home:hero.mock.new_article", "Новая статья")}</p>
                      <p className="text-sm text-gray-600">PDF</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-600">
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-black/5">
                      {t("home:hero.mock.antiplagiarism", "Антиплагиат · 92%")}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-black/5">
                      {t("home:hero.mock.reviewers", "Рецензенты · 2")}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-black/5">
                      {t("home:hero.mock.status", "Статус · На рецензии")}
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
              {t("home:tabs.badge_how_it_works", "Как это работает")}
            </Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.01em]">
              {t("home:tabs.title_two_paths", "Два простых сценария")}
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              {t(
                  "home:tabs.subtitle_choose_path",
                  "Выберите подходящий путь — для автора или для организации/частного лица."
              )}
            </p>
          </div>

          <Tabs defaultValue="authors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="authors">{t("home:tabs.label_authors", "Авторам")}</TabsTrigger>
              <TabsTrigger value="orgs">{t("home:tabs.label_orgs", "Организациям")}</TabsTrigger>
            </TabsList>

            <TabsContent value="authors" className="mt-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: t("home:authors.steps.1.title", "Регистрация"),
                    desc: t(
                        "home:authors.steps.1.desc",
                        "Создайте аккаунт и заполните профиль автора."
                    ),
                  },
                  {
                    title: t("home:authors.steps.2.title", "Выбор журнала"),
                    desc: t(
                        "home:authors.steps.2.desc",
                        "Найдите подходящий журнал в каталоге."
                    ),
                  },
                  {
                    title: t("home:authors.steps.3.title", "Подача статьи"),
                    desc: t(
                        "home:authors.steps.3.desc",
                        "Загрузите файл, метаданные, сопроводительные документы."
                    ),
                  },
                  {
                    title: t("home:authors.steps.4.title", "Рецензия → решение"),
                    desc: t(
                        "home:authors.steps.4.desc",
                        "Отслеживайте статусы и получайте решение редакции."
                    ),
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
                    {t("home:authors.cta_submit", "Подать статью")}
                  </Button>
                </Link>
                <Link to="/journals">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-[#0B1220] hover:bg-gray-50"
                  >
                    {t("home:authors.cta_catalog", "Каталог журналов")}
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="orgs" className="mt-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: t("home:orgs.steps.1.title", "Создание организации"),
                    desc: t(
                        "home:orgs.steps.1.desc",
                        "Любое лицо/организация может создать свой аккаунт."
                    ),
                  },
                  {
                    title: t("home:orgs.steps.2.title", "Запуск журнала"),
                    desc: t(
                        "home:orgs.steps.2.desc",
                        "Назовите журнал, задайте политику, роли и процесс."
                    ),
                  },
                  {
                    title: t(
                        "home:orgs.steps.3.title",
                        "Процесс публикаций"
                    ),
                    desc: t(
                        "home:orgs.steps.3.desc",
                        "Приём статей, рецензии, решения, выпуски и архивы."
                    ),
                  },
                  {
                    title: t("home:orgs.steps.4.title", "Аналитика и отчёты"),
                    desc: t(
                        "home:orgs.steps.4.desc",
                        "Статистика по срокам, отказам/принятию, активности."
                    ),
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
                    {t("home:orgs.cta_create_org", "Создать организацию/журнал")}
                  </Button>
                </Link>
                <Link to="/docs/onboarding-org">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-[#0B1220] hover:bg-gray-50"
                  >
                    {t("home:orgs.cta_onboarding", "Онбординг для редакций")}
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
              {t("home:features.badge", "Возможности")}
            </Badge>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.01em]">
              {t("home:features.title", "Автоматизация полного цикла")}
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6 text-[#3972FE]" />,
                title: t("home:features.items.antiplag.title", "Антиплагиат и соответствие"),
                desc: t(
                    "home:features.items.antiplag.desc",
                    "Интеграции и проверки оригинальности, поддержка этики публикаций."
                ),
              },
              {
                icon: <Users className="h-6 w-6 text-[#3972FE]" />,
                title: t("home:features.items.roles.title", "Роли и маршруты"),
                desc: t(
                    "home:features.items.roles.desc",
                    "Авторы, рецензенты, редакторы и администраторы с гибкими правами."
                ),
              },
              {
                icon: <BookOpenCheck className="h-6 w-6 text-[#3972FE]" />,
                title: t("home:features.items.issues.title", "Выпуски и архивы"),
                desc: t(
                    "home:features.items.issues.desc",
                    "Публичные страницы журналов, номера, метаданные и индексация."
                ),
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-[#3972FE]" />,
                title: t("home:features.items.analytics.title", "Аналитика"),
                desc: t(
                    "home:features.items.analytics.desc",
                    "Отчёты по срокам рецензий, отказам/принятию, активности редакций."
                ),
              },
              {
                icon: <FilePlus2 className="h-6 w-6 text-[#3972FE]" />,
                title: t("home:features.items.smart_submit.title", "Умная подача"),
                desc: t(
                    "home:features.items.smart_submit.desc",
                    "Шаблоны, чек-листы, валидаторы полей и файлов для качества рукописей."
                ),
              },
              {
                icon: <Building2 className="h-6 w-6 text-[#3972FE]" />,
                title: t("home:features.items.multi_journal.title", "Мульти-журналы"),
                desc: t(
                    "home:features.items.multi_journal.desc",
                    "Одна организация — несколько журналов, независимые команды и политики."
                ),
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
                {t("home:story.title", "История и развитие")}
              </h2>
              <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                {t(
                    "home:story.paragraph",
                    "Платформа была создана как технологическая основа для современных научных журналов, стремящихся к качеству, эффективности и международному признанию. Мы поддерживаем высокие стандарты и способствуем развитию научного сообщества."
                )}
              </p>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <Card className="border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    {t("home:story.principles.title", "Наши принципы")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                    <li>{t("home:story.principles.items.1", "• Открытость и прозрачность процесса рецензирования")}</li>
                    <li>{t("home:story.principles.items.2", "• Соблюдение этических стандартов публикации")}</li>
                    <li>{t("home:story.principles.items.3", "• Поддержка молодых исследователей")}</li>
                    <li>{t("home:story.principles.items.4", "• Междисциплинарный подход к науке")}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">
                    {t("home:story.quality.title", "Качество публикаций")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                    <li>{t("home:story.quality.items.1", "• Строгий отбор рукописей")}</li>
                    <li>{t("home:story.quality.items.2", "• Квалифицированные рецензенты")}</li>
                    <li>{t("home:story.quality.items.3", "• Соответствие международным стандартам")}</li>
                    <li>{t("home:story.quality.items.4", "• Регулярное повышение качества")}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Back to top (мобилки) */}
          <div className="mt-10 text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              {t("home:story.back_to_top", "Вернуться наверх")}
            </a>
          </div>
        </div>
      </section>
      <Footer></Footer>
    </div>
  );
}
