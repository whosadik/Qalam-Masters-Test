import { Link } from "react-router-dom";
import {
  ArrowRight,
  FilePlus2,
  ShieldCheck,
  Gauge,
  Wand2,
  BarChart3,
  Users,
  ClipboardList,
  CheckCircle2,
  Sparkles,
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
 * AuthorsPage
 * Цвет бренда: #3972FE
 * Цель: максимально просто и быстро подвезти автора к действию «Подать статью»
 * Тон: современно, чисто, доверительно
 */
export default function AuthorsPage() {
  const { booted, isAuthenticated } = useAuth();

  const ctaHref = isAuthenticated ? "/app/author/submit" : "/register";
  const ctaLabel = isAuthenticated
    ? "Подать статью"
    : "Зарегистрироваться и подать статью";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-[#EFF4FF] to-white text-slate-900">
      <Navbar />

      {/* Hero */}
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
                Подача статьи за минуты —
                <span className="block text-[#3972FE]">
                  без сложностей и писем
                </span>
              </h1>
              <p className="mt-4 text-slate-600 text-lg max-w-2xl">
                Единое окно для загрузки рукописи, проверки на плагиат,
                коммуникации с редакцией и получения решения. Прозрачно, быстро
                и удобно.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="h-11 px-5 text-base font-semibold bg-[#3972FE] hover:bg-[#2f63e3]"
                >
                  <Link to={ctaHref}>{ctaLabel}</Link>
                </Button>
              </div>

              {/* Быстрые преимущества */}
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" /> Антиплагиат
                  по умолчанию
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" />{" "}
                  Авто‑форматирование метаданных
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#3972FE]" /> Уведомления
                  о статусе
                </span>
              </div>
            </div>
            <div className="relative">
              {/* мягкий фон-блик */}
              <div
                aria-hidden="true"
                className="absolute -top-10 -right-6 h-56 w-56 rounded-full blur-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 70% 30%, #3972FE 0%, #A3C6FF 40%, transparent 70%)",
                }}
              />

              <div className="relative grid gap-4">
                {/* Главная карточка: превью загрузки рукописи */}
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FilePlus2 className="size-5 text-[#3972FE]" />
                      Загрузка рукописи
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* “файл” */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          manuscript_v3_final.docx
                        </p>
                        <p className="text-xs text-slate-500">1.8 MB • DOCX</p>
                      </div>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        Готово к отправке
                      </Badge>
                    </div>

                    {/* шаги */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border p-3 text-center">
                        <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-[#3972FE]/10 text-[#3972FE]">
                          <ShieldCheck className="size-4" />
                        </div>
                        <p className="text-xs font-medium">Антиплагиат</p>
                        <p className="text-[11px] text-slate-500">пройден</p>
                      </div>
                      <div className="rounded-xl border p-3 text-center">
                        <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-[#3972FE]/10 text-[#3972FE]">
                          <ClipboardList className="size-4" />
                        </div>
                        <p className="text-xs font-medium">Метаданные</p>
                        <p className="text-[11px] text-slate-500">заполнены</p>
                      </div>
                      <div className="rounded-xl border p-3 text-center">
                        <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-[#3972FE]/10 text-[#3972FE]">
                          <BookOpenCheck className="size-4" />
                        </div>
                        <p className="text-xs font-medium">Требования</p>
                        <p className="text-[11px] text-slate-500">OK</p>
                      </div>
                    </div>

                    {/* прогресс */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600">
                          Подготовка заявки
                        </span>
                        <span className="font-medium text-[#3972FE]">80%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#3972FE]"
                          style={{ width: "80%" }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps: Как это работает */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
            Как подать статью
          </h2>
          <div className="hidden sm:flex gap-3">
            <Button
              asChild
              variant="outline"
              className="border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
            >
              <Link to={ctaHref}>Начать сейчас</Link>
            </Button>
            <Button asChild className="bg-[#3972FE] hover:bg-[#2f63e3]">
              <Link to={ctaHref} className="flex items-center gap-2">
                Подать статью <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-4 gap-4">
          {[
            {
              icon: FilePlus2,
              title: "Загрузка",
              desc: "Прикрепите DOCX/PDF и заполните минимальные поля — остальное заполним автоматически.",
            },
            {
              icon: ClipboardList,
              title: "Требования",
              desc: "Онлайн‑чеки списка требований и шаблонов оформления.",
            },
            {
              icon: Users,
              title: "Рецензирование",
              desc: "Получайте запросы на доработку и оставляйте ответы прямо в карточке статьи.",
            },
            {
              icon: BookOpenCheck,
              title: "Решение и выпуск",
              desc: "Прозрачный статус: принято/правки/отклонено. Готовим к публикации.",
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
            <Link to={ctaHref}>Подать статью</Link>
          </Button>
        </div>
      </section>

      {/* Преимущества для автора */}
      <section className="bg-white/60 border-y border-slate-100">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
            Почему авторам удобно у нас
          </h2>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Сфокусируйтесь на исследовании — рутину мы возьмём на себя.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Wand2,
                title: "Умные формы",
                desc: "Автозаполнение авторов, ORCID, аффилиаций, литературы. Меньше кликов — меньше ошибок.",
              },
              {
                icon: Sparkles,
                title: "Готовые шаблоны",
                desc: "Экспорт в формат журнала, чек‑листы требований и подсказки оформления.",
              },
              {
                icon: ShieldCheck,
                title: "Антиплагиат встроен",
                desc: "Отчёт прикладывается к заявке, редакция видит результаты сразу.",
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
          {/* <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { n: "30+", t: "вузов доверяют" },
              { n: "500 000+", t: "работ проверено" },
              { n: "24/7", t: "поддержка" },
            ].map((s, i) => (
              <Card
                key={i}
                className="rounded-2xl border-slate-200 bg-[#3972FE]/5"
              >
                <CardContent className="p-5">
                  <p className="text-2xl font-bold text-[#3972FE]">{s.n}</p>
                  <p className="text-slate-600">{s.t}</p>
                </CardContent>
              </Card>
            ))}
          </div> */}
        </div>
      </section>

      {/* Tabs: Новая заявка vs Отслеживание */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="submit">Подать новую статью</TabsTrigger>
            <TabsTrigger value="track">Отслеживать статус</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="mt-5">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6 lg:p-8 grid lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold">
                    Готовы отправить рукопись?
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Загрузите файл, добавьте соавторов, прикрепите
                    сопроводительное письмо — система всё аккуратно соберёт и
                    передаст редакции.
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <Button
                    asChild
                    className="h-11 px-6 bg-[#3972FE] hover:bg-[#2f63e3]"
                  >
                    <Link to={ctaHref} className="flex items-center gap-2">
                      Подать статью <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="mt-5">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6 lg:p-8 grid lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold">
                    Следите за статусом онлайн
                  </h3>
                  <p className="mt-2 text-slate-600">
                    От «На рассмотрении» до «Принято к печати»: таймлайн,
                    комментарии, сроки ответов и уведомления — всё в личном
                    кабинете.
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-6 border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
                  >
                    <Link to={isAuthenticated ? "/app" : "/login"}>
                      Открыть кабинет
                    </Link>
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
                q: "Какие форматы файлов поддерживаются?",
                a: "DOCX и PDF. При необходимости система конвертирует предварительный просмотр.",
              },
              {
                q: "Нужно ли отдельно проходить проверку на плагиат?",
                a: "Нет. Проверка встроена: редакция сразу получает отчёт, а вы — сводку в кабинете.",
              },
              {
                q: "Сколько занимает первичная проверка?",
                a: "Обычно 1–3 рабочих дня в зависимости от журнала и загрузки редакции.",
              },
              {
                q: "Можно ли редактировать отправленную заявку?",
                a: "Да, до передачи на рецензирование. Дальше — по запросу редакции через переписку внутри карточки.",
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
              <Link to={ctaHref}>Подать статью</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-6 border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
            >
              <Link to="/requirements">Требования к оформлению</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky CTA на мобильных */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
        <div className="mx-auto max-w-md rounded-2xl shadow-lg border border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="p-3 flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold">Готовы отправить рукопись?</p>
              <p className="text-slate-600">
                Потребуется всего несколько минут
              </p>
            </div>
            <Button asChild className="h-10 bg-[#3972FE] hover:bg-[#2f63e3]">
              <Link to={ctaHref}>Подать</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
