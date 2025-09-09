import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  FileQuestion,
  HelpCircle,
  Globe2,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ContactsPage() {
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
          <div className="max-w-3xl">
            <Badge className="mb-3 bg-[#3972FE]/10 text-[#3972FE] hover:bg-[#3972FE]/10 border border-[#3972FE]/30">
              Свяжитесь с нами
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Контакты и поддержка
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Мы рядом, чтобы помочь: вопросы по публикации, интеграциям,
              договорам и технической поддержке.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="h-11 px-5 text-base font-semibold bg-[#3972FE] hover:bg-[#2f63e3]"
              >
                <a href="#form" className="flex items-center gap-2">
                  <MessageSquare className="size-4" /> Написать сообщение
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 px-5 text-base border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
              >
                <a href="tel:+77000000000" className="flex items-center gap-2">
                  <Phone className="size-4" /> Позвонить
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* КОНТАКТЫ — БЕЗ КАРТОЧЕК */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        {/* Плашки с основными контактами */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Mail className="size-5 text-[#3972FE]" /> Email
            </div>
            <a
              className="mt-2 inline-block text-[#3972FE] hover:underline"
              href="mailto:support@qalam-masters.kz"
            >
              support@qalam-masters.kz
            </a>
            <p className="mt-1 text-sm text-slate-600">
              Для авторов и редакций
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Phone className="size-5 text-[#3972FE]" /> Телефон
            </div>
            <a
              className="mt-2 inline-block text-[#3972FE] hover:underline"
              href="tel:+77000000000"
            >
              +7 (700) 000‑00‑00
            </a>
            <p className="mt-1 text-sm text-slate-600">Пн–Пт, 9:00–18:00</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="size-5 text-[#3972FE]" /> Офис
            </div>
            <p className="mt-2 text-slate-700">
              г. Астана, пр‑т Мангилик Ел, 1
            </p>
            <p className="mt-1 text-sm text-slate-600">Приём по записи</p>
          </div>
        </div>

        {/* Тонкая разделительная линия */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Двухколоночный блок: форма + инфо без карточек */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Форма */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
              <h2 className="text-xl font-semibold">Написать нам</h2>
              <div className="mt-5 grid gap-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ваше имя</Label>
                    <Input id="name" placeholder="Иван Иванов" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Тема обращения</Label>
                    <Select defaultValue="authors">
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тему" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="authors">
                          Подача/статус статьи
                        </SelectItem>
                        <SelectItem value="journals">
                          Подключение журнала
                        </SelectItem>
                        <SelectItem value="integrations">
                          Интеграции (Platonus/ORCID/DOI)
                        </SelectItem>
                        <SelectItem value="billing">
                          Договор и оплата
                        </SelectItem>
                        <SelectItem value="technical">
                          Техническая поддержка
                        </SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Заголовок</Label>
                    <Input id="subject" placeholder="Коротко о вопросе" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Сообщение</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Опишите ваш вопрос или задачу…"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="h-11 px-6 bg-[#3972FE] hover:bg-[#2f63e3]">
                    <Send className="size-4 mr-2" /> Отправить
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-6 border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
                  >
                    <a href="mailto:support@qalam-masters.kz">
                      Написать на email
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  Нажимая «Отправить», вы соглашаетесь с обработкой персональных
                  данных.
                </p>
              </div>
            </div>
          </div>

          {/* Информация: расписание, помощь, ссылки — списками */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Clock className="size-5 text-[#3972FE]" /> График работы
              </div>
              <ul className="mt-3 text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>Пн–Пт: 09:00–18:00</li>
                <li>Перерыв: 13:00–14:00</li>
                <li>Сб–Вс: выходные</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="size-5 text-[#3972FE]" /> Поддержка
              </div>
              <ul className="mt-3 text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <HelpCircle className="size-4 text-[#3972FE]" /> База знаний и
                  FAQ
                </li>
                <li className="flex items-center gap-2">
                  <FileQuestion className="size-4 text-[#3972FE]" /> Руководство
                  по подаче статьи
                </li>
                <li className="flex items-center gap-2">
                  <Globe2 className="size-4 text-[#3972FE]" /> Статус сервисов
                </li>
                <li className="pt-1">
                  <Link
                    to="/faq"
                    className="inline-flex items-center text-[#3972FE] hover:underline"
                  >
                    Открыть FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-slate-700 font-medium">Полезные ссылки</div>
              <ul className="mt-3 text-sm text-[#3972FE] space-y-2">
                <li>
                  <Link className="hover:underline" to="/requirements">
                    Требования к оформлению
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/publication-terms">
                    Условия публикации
                  </Link>
                </li>
                <li>
                  <Link className="hover:underline" to="/privacy">
                    Политика конфиденциальности
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* КАРТА */}
      {/*  <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <div className="aspect-[16/9] w-full grid place-items-center text-slate-500">
            <div className="text-center px-6">
              <MapPin className="mx-auto mb-3" />
              <p className="font-medium">Здесь будет карта</p>
              <p className="text-sm">
                Встроим Google Maps / 2GIS embed, когда будет готов iframe
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* НИЖНИЙ CTA */}
      <section className="bg-white/60 border-t border-slate-100">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                Есть вопрос по подаче или подключению журнала?
              </h2>
              <p className="mt-2 text-slate-600">
                Напишите нам — поможем настроить процесс и ускорить публикации.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Button
                asChild
                className="h-11 px-6 bg-[#3972FE] hover:bg-[#2f63e3]"
              >
                <a href="#form" className="flex items-center gap-2">
                  <MessageSquare className="size-4" /> Задать вопрос
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 px-6 border-[#3972FE] text-[#3972FE] hover:bg-[#3972FE]/5"
              >
                <a
                  href="mailto:sales@qalam-masters.kz"
                  className="flex items-center gap-2"
                >
                  Связаться с отделом
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
