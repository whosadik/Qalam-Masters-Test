import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  FilePlus2,
  ShieldCheck,
  Workflow,
  Users,
  Settings,
  Plug,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Lock,
  BookOpenCheck,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/auth/AuthContext";

/**
 * Journals/Organizations Landing
 * Цель: мотивировать создать организацию и подключить журнал(ы)
 * Цвет CTA: #3972FE
 */
export default function JournalsPage() {
  const { booted, isAuthenticated } = useAuth();

  const createOrgHref = isAuthenticated
    ? "/app/orgs/new"
    : "/register?next=/app/orgs/new";
  const createJournalHref = isAuthenticated
    ? "/app/journals/new"
    : "/register?next=/app/journals/new";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-[#EFF4FF] to-white text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient( circle at 30% 30%, #3972FE 0%, #A3C6FF 40%, transparent 70% )",
          }}
        />

        <div className="container mx-auto px-4 pt-16 pb-8 lg:pt-24 lg:pb-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Запустите журнал на платформе —
                <span className="block text-[#3972FE]">
                  приёмы статей, рецензирование и выпуск под контролем
                </span>
              </h1>
              <p className="mt-4 text-slate-600 text-lg max-w-2xl">
                Создайте организацию, подключите один или несколько журналов,
                настройте роли и процессы. Минимум ручной рутины, максимум
                прозрачности и скорости.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="h-11 px-5 text-base font-semibold bg-[#3972FE] hover:bg-[#2f63e3]"
                >
                  <Link to={createOrgHref} className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    Подключить организацию и добавить журнал
                  </Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" /> Сделайте
                  ваш журнал прибыльным
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" /> Роли и
                  права: авторы, рецензенты, редакторы
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" /> Сквозная
                  аналитика и отчёты
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" /> Интеграция
                  с Platonus и ORCID в процессе.
                </span>
              </div>
            </div>
            {/* ПРАВАЯ КОЛОНКА — «Создать журнал» */}
            <div className="relative">
              {/* мягкий блик */}
              <div
                aria-hidden="true"
                className="absolute -top-10 -right-6 h-56 w-56 rounded-full blur-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 70% 30%, #3972FE 0%, #A3C6FF 40%, transparent 70%)",
                }}
              />

              <div className="relative grid gap-4">
                {/* Главная карточка: СОЗДАТЬ ЖУРНАЛ */}
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FilePlus2 className="size-5 text-[#3972FE]" />
                        Создать журнал
                      </CardTitle>
                      <span className="text-xs text-slate-500">
                        Шаг{" "}
                        <span className="font-semibold text-[#3972FE]">1</span>
                        /3
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Организация */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Building2 className="size-4 text-[#3972FE]" />
                      <span className="truncate">
                        Организация: выберите или создайте
                      </span>
                    </div>

                    {/* Псевдо-поля формы (макап) */}
                    <div className="grid gap-2">
                      <div className="rounded-xl border bg-white px-3 py-2">
                        <p className="text-[11px] text-slate-500">
                          Название журнала
                        </p>
                        <p className="text-sm font-medium truncate">
                          "Вестник науки"{" "}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border bg-white px-3 py-2">
                          <p className="text-[11px] text-slate-500">ISSN</p>
                          <p className="text-sm font-medium">1234-5678</p>
                        </div>
                        <div className="rounded-xl border bg-white px-3 py-2">
                          <p className="text-[11px] text-slate-500">
                            Периодичность
                          </p>
                          <p className="text-sm font-medium">Ежеквартально</p>
                        </div>
                      </div>

                      {/* Секции */}
                      <div className="rounded-xl border bg-white px-3 py-2">
                        <p className="text-[11px] text-slate-500 mb-1.5">
                          Тематика
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-[11px]">
                            Экономика
                          </Badge>
                          <Badge variant="outline" className="text-[11px]">
                            IT
                          </Badge>
                          <Badge variant="outline" className="text-[11px]">
                            Педагогика
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Витрина фич карточками */}
          </div>
        </div>
      </section>

      {/* STEPS: Внедрение и запуск */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
            Как подключить журнал
          </h2>
          <div className="hidden sm:flex gap-3">
            <Button
              asChild
              variant="outline"
              className="border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
            >
              <Link to={createJournalHref}>Подключить журнал</Link>
            </Button>
            <Button asChild className="bg-[#3972FE] hover:bg-[#2f63e3]">
              <Link to={createOrgHref} className="flex items-center gap-2">
                Создать организацию <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-5 gap-4">
          {[
            {
              icon: Building2,
              title: "Организация",
              desc: "Создайте профиль вуза/издателя и пригласите команду.",
            },
            {
              icon: Settings,
              title: "Настройки журнала",
              desc: "Определите секции, политику рецензирования, шаблоны писем.",
            },
            {
              icon: Users,
              title: "Роли и доступы",
              desc: "Редакторы, тех. редакторы, модераторы, рецензенты — гибкая матрица прав.",
            },
            {
              icon: FilePlus2,
              title: "Приём статей",
              desc: "Откройте форму подачи, настройте статусы и автоматические уведомления.",
            },
            {
              icon: BarChart3,
              title: "Аналитика",
              desc: "Следите за SLA и качеством — прозрачные метрики с первого дня.",
            },
          ].map((s, i) => (
            <Card key={i} className="rounded-2xl border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#3972FE]/10 text-[#3972FE]">
                    <s.icon className="size-5" />
                  </div>
                  <p className="text-sm text-slate-500">Шаг {i + 1}</p>
                </div>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Кнопка под карточками на мобиле */}
        <div className="mt-6 sm:hidden">
          <Button
            asChild
            className="w-full h-11 bg-[#3972FE] hover:bg-[#2f63e3]"
          >
            <Link to={createOrgHref}>Создать организацию</Link>
          </Button>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА ДЛЯ РЕДАКЦИИ */}
      <section className="bg-white/60 border-y border-slate-100">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
            Преимущества для редакции
          </h2>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Сократите сроки цикла и повысьте качество выпуска без роста
            операционных затрат.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Sparkles,
                title: "Автоматизация",
                desc: "Шаблоны писем, напоминания дедлайнов, авто‑назначение рецензентов по секциям.",
              },
              {
                icon: Lock,
                title: "Безопасность",
                desc: "Разграничение прав, аудит действий, хранение артефактов и версий.",
              },
              {
                icon: ShieldCheck,
                title: "Антиплагиат",
                desc: "Проверка встроена в поток. Приложенный отчёт доступен редакции и авторам.",
              },
            ].map((f, i) => (
              <Card key={i} className="rounded-2xl border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <f.icon className="size-5 text-[#3972FE]" /> {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  {f.desc}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Мини‑стата доверия */}
        </div>
      </section>

      {/* TABS: Организация vs Журнал */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        <Tabs defaultValue="org" className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="org">Организация</TabsTrigger>
            <TabsTrigger value="journal">Журнал</TabsTrigger>
          </TabsList>

          <TabsContent value="org" className="mt-5">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6 lg:p-8 grid lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold">
                    Создайте организацию за несколько минут
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Профиль, домены, лого, команда, роли и доступы. Дальше —
                    быстрое подключение журналов и запуск процессов.
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <Button
                    asChild
                    className="h-11 px-6 bg-[#3972FE] hover:bg-[#2f63e3]"
                  >
                    <Link
                      to={createOrgHref}
                      className="flex items-center gap-2"
                    >
                      Создать организацию <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="mt-5">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6 lg:p-8 grid lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold">
                    Подключите журнал к платформе
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Секции, правила рецензирования (single/double blind),
                    шаблоны писем, публичная страница для авторов.
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-6 border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
                  >
                    <Link to={createJournalHref}>Подключить журнал</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQ */}
      <section className="bg-white/60 border-t border-slate-100">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
            Частые вопросы
          </h2>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {[
              {
                q: "Сколько журналов можно подключить?",
                a: "Неограниченно. Управляйте всеми журналами вашей организации из одного кабинета.",
              },
              {
                q: "Поддерживается double‑blind рецензирование?",
                a: "Да. Настройка шаблонов, сокрытие данных автора и рецензента, безопасная переписка внутри системы.",
              },
              {
                q: "Есть ли интеграции с Platonus и ORCID?",
                a: "Да. Доступны интеграции с LMS/СРС (например, Platonus), а также с ORCID/DOI провайдерами.",
              },
              {
                q: "Как быстро можно запуститься?",
                a: "Базовая настройка занимает 1 день: организация, журнал, роли, почта, публичная страница приёма статей.",
              },
            ].map((item, i) => (
              <Card key={i} className="rounded-2xl border-slate-200">
                <CardContent className="p-5">
                  <p className="font-medium">{item.q}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="h-11 px-6 bg-[#3972FE] hover:bg-[#2f63e3]"
            >
              <Link to={createOrgHref}>Создать организацию</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-6 border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
            >
              <Link to={createJournalHref}>Подключить журнал</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky CTA на мобильных */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
        <div className="mx-auto max-w-md rounded-2xl shadow-lg border border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="p-3 flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold">Готовы запустить журнал?</p>
              <p className="text-slate-600">
                Организация + подключение за 1 день
              </p>
            </div>
            <Button asChild className="h-10 bg-[#3972FE] hover:bg-[#2f63e3]">
              <Link to={createOrgHref}>Создать</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
