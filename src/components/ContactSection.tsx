// src/components/sections/ContactSection.tsx
import { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactSection() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // TODO: подключи реальный эндпоинт, напр. /api/support/tickets/
    // const res = await fetch("/api/support/tickets/", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data),
    // });
    // setStatus(res.ok ? "ok" : "error");

    console.log("Contact payload:", data);
    setStatus("ok");
    form.reset();
  }

  return (
    <section id="contact" className="py-16 sm:py-20 bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.01em]">
              Нужна помощь или быстрый ответ?
            </h2>
            <p className="mt-2 text-gray-600">
              Отвечаем авторам и редакциям оперативно. Выбирайте удобный канал —
              или оставьте заявку.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-[#3972FE]" />
            <span>
              Среднее время ответа: 1–2 часа · Пн–Пт 09:00–18:00 (Asia/Almaty)
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Быстрые каналы */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-gray-200 rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Быстрые каналы связи
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <a
                  href="mailto:truemasters@gmail.com?subject=Вопрос%20по%20Qalam%20Masters"
                  className="group flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-[#3972FE] transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#3972FE]" />
                    Почта: truemasters@gmail.com
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#3972FE]" />
                </a>

                <a
                  href="tel:+77712827801"
                  className="group flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-[#3972FE] transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#3972FE]" />
                    Телефон: +7&nbsp;771&nbsp;282&nbsp;7801
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#3972FE]" />
                </a>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 rounded-2xl shadow-sm">
              <CardContent className="p-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-[#3972FE] mt-0.5" />
                  <p>
                    Ваши данные защищены. Заявки поступают только уполномоченной
                    команде поддержки Qalam Masters.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Форма — упор на скорость */}
          <Card className="lg:col-span-2 border border-gray-200 rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                Быстрая заявка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Label htmlFor="role" className="text-sm">
                    Кто вы?
                  </Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="role"
                        value="author"
                        defaultChecked
                        className="accent-[#3972FE]"
                      />
                      <span>Автор</span>
                    </label>
                    <label className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="role"
                        value="org"
                        className="accent-[#3972FE]"
                      />
                      <span>Организация</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <Label htmlFor="topic" className="text-sm">
                    Тема
                  </Label>
                  <select
                    id="topic"
                    name="topic"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3972FE]"
                    defaultValue="submit"
                  >
                    <option value="submit">Подача статьи</option>
                    <option value="review">Рецензирование</option>
                    <option value="journal">Запуск журнала</option>
                    <option value="billing">Оплата/аккаунт</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <Label htmlFor="name" className="text-sm">
                    Имя
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Иван Иванов"
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="message" className="text-sm">
                    Сообщение (кратко)
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Например: хочу подать статью, подскажите по требованиям…"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-[#3972FE] hover:bg-[#2f64e6] text-white"
                  >
                    Отправить заявку
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <a
                    href="mailto:truemasters@gmail.com?subject=Вопрос%20по%20Qalam%20Masters"
                    className="text-sm text-[#3972FE] hover:underline"
                  >
                    или напишите на почту
                  </a>

                  {status === "ok" && (
                    <span className="text-sm text-emerald-600">
                      Спасибо! Заявка отправлена — вернёмся с ответом.
                    </span>
                  )}
                  {status === "error" && (
                    <span className="text-sm text-red-600">
                      Не получилось отправить. Попробуйте ещё раз или напишите
                      на email.
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Низ секции — дополнительные ссылки */}
      </div>
    </section>
  );
}
