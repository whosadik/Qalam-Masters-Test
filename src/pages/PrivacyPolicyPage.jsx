// src/pages/PrivacyPolicyPage.jsx
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Shield, FileText, Globe2, Clock, Lock, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const updatedAt = "10 сентября 2025"; // обновляй при правках
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-[#EFF4FF] to-white text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #3972FE 0%, #A3C6FF 40%, transparent 70%)",
          }}
        />
        <div className="container mx-auto px-4 pt-16 pb-8 lg:pt-24 lg:pb-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3972FE]/30 bg-[#3972FE]/10 px-3 py-1 text-[#3972FE] text-sm">
              <Shield className="h-4 w-4" /> Политика конфиденциальности
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Как мы защищаем ваши данные
            </h1>
            <p className="mt-3 text-slate-600 text-lg">
              Эта страница описывает, какие данные мы собираем на платформе
              <strong> Qalam Masters</strong>, как их используем и какие у вас
              есть права.
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              Последнее обновление: {updatedAt}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-4 pb-12 lg:pb-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* TOC */}
          <aside className="lg:sticky lg:top-24 h-max">
            <nav className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm">
              <p className="mb-2 font-semibold text-slate-700">Оглавление</p>
              <ul className="space-y-2">
                {[
                  ["scope", "1. Область действия"],
                  ["data", "2. Какие данные мы собираем"],
                  ["use", "3. Как мы используем данные"],
                  ["lawful", "4. Правовые основания обработки"],
                  ["cookies", "5. Файлы cookie и аналитика"],
                  ["sharing", "6. Передача третьим лицам"],
                  ["retention", "7. Сроки хранения"],
                  ["security", "8. Безопасность"],
                  ["rights", "9. Права пользователей"],
                  ["children", "10. Дети и уязвимые лица"],
                  ["transfer", "11. Трансграничная передача"],
                  ["changes", "12. Изменения политики"],
                  ["contact", "13. Контакты"],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a className="text-slate-600 hover:text-slate-900 hover:underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* маленький дисклеймер */}
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <strong>Важно:</strong> этот документ носит общий характер для
              платформы. У отдельных журналов могут быть дополнительные
              требования или уведомления о конфиденциальности на их публичных
              страницах «Для авторов».
            </div>
          </aside>

          {/* BODY */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 prose prose-slate max-w-none">
            <h2 id="scope">1. Область действия</h2>
            <p>
              Настоящая Политика применяется к сайту и сервисам платформы{" "}
              <strong>Qalam Masters</strong>, включая публичные страницы
              журналов, кабинеты авторов/редакций и API. Используя платформу, вы
              соглашаетесь с условиями этой Политики.
            </p>

            <h2 id="data">2. Какие данные мы собираем</h2>
            <ul>
              <li>
                <strong>Учётные данные:</strong> имя, email, пароль (хранится в
                виде хеша), роль/организация.
              </li>
              <li>
                <strong>Профиль и метаданные статей:</strong> ФИО авторов,
                ORCID, аффилиации, аннотации, ключевые слова, файлы рукописей и
                приложения.
              </li>
              <li>
                <strong>Операционные данные:</strong> статусы заявок,
                комментарии, решения редакции, история действий.
              </li>
              <li>
                <strong>Техданные:</strong> IP-адрес, user-agent, лог-записи для
                безопасности и диагностики.
              </li>
              <li>
                <strong>Платёжные/договорные данные</strong> (если применимо):
                реквизиты организации, номера договоров, счета.
              </li>
            </ul>

            <h2 id="use">3. Как мы используем данные</h2>
            <ul>
              <li>
                оказание сервисов: приём статей, рецензирование, публикация,
                аналитика;
              </li>
              <li>поддержка пользователей и обратная связь;</li>
              <li>
                обеспечение безопасности, предотвращение мошенничества и
                злоупотреблений;
              </li>
              <li>выполнение договоров и законных обязательств;</li>
              <li>
                улучшение качества сервиса (агрегированная статистика, без
                попытки идентификации).
              </li>
            </ul>

            <h2 id="lawful">4. Правовые основания обработки</h2>
            <p>
              Мы обрабатываем данные на основании: (a) исполнения договора с
              пользователем или организацией; (b) законных интересов платформы
              (без ущерба правам субъектов); (c) согласия пользователя — для
              отдельных опций (например, определённые интеграции/рассылки); (d)
              выполнения правовых обязанностей.
            </p>

            <h2 id="cookies">5. Файлы cookie и аналитика</h2>
            <p>
              Мы используем cookie для аутентификации, настроек интерфейса и
              статистики использования. В аналитике применяются обезличенные
              данные. Вы можете ограничить cookie в настройках браузера, но
              часть функций может стать недоступной.
            </p>

            <h2 id="sharing">6. Передача третьим лицам</h2>
            <ul>
              <li>
                <strong>Операторы и партнёры:</strong> хостинг-провайдеры,
                email-шлюзы, системы аналитики, платёжные/документ-сервисы.
              </li>
              <li>
                <strong>Интеграции по выбору клиента:</strong> ORCID,
                DOI-провайдеры, LMS/СРС (например, Platonus), SSO (SAML/OIDC).
              </li>
              <li>
                <strong>Требования закона:</strong> по законным запросам
                уполномоченных органов.
              </li>
            </ul>
            <p>
              Передача осуществляется по договорам с требованиями к защите и
              конфиденциальности.
            </p>

            <h2 id="retention">7. Сроки хранения</h2>
            <p>
              Данные хранятся ровно столько, сколько необходимо для целей
              обработки и требований законодательства/договоров. Отдельные
              лог-записи и резервные копии могут храниться дольше в целях
              безопасности и аудита.
            </p>

            <h2 id="security">8. Безопасность</h2>
            <ul>
              <li>
                шифрование каналов (HTTPS), изоляция сред, контроль доступа
                (RBAC);
              </li>
              <li>логирование и мониторинг аномалий, защита от brute-force;</li>
              <li>регулярные обновления и резервное копирование.</li>
            </ul>
            <p className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Несмотря на меры, ни один метод передачи и хранения не гарантирует
              абсолютной безопасности.
            </p>

            <h2 id="rights">9. Права пользователей</h2>
            <p>В пределах применимого права вы можете:</p>
            <ul>
              <li>запросить доступ к вашим данным и их копию;</li>
              <li>исправить неточности и дополнить профиль;</li>
              <li>удалить данные (кроме случаев обязательного хранения);</li>
              <li>ограничить обработку или возразить против неё;</li>
              <li>отозвать согласие (если обработка основана на нём);</li>
              <li>на переносимость (где применимо).</li>
            </ul>
            <p>
              Для реализации прав напишите нам:{" "}
              <a
                className="text-[#3972FE] hover:underline"
                href="mailto:truemasters@inbox.ru"
              >
                truemasters@inbox.ru
              </a>
              .
            </p>

            <h2 id="children">10. Дети и уязвимые лица</h2>
            <p>
              Платформа не предназначена для пользователей младше 16 лет без
              участия законных представителей. Если вы считаете, что ребёнок
              предоставил нам данные без согласия, свяжитесь с нами для
              удаления.
            </p>

            <h2 id="transfer">11. Трансграничная передача</h2>
            <p>
              Данные могут передаваться между юрисдикциями (например,
              дата-центры/провайдеры). Мы обеспечиваем эквивалентный уровень
              защиты и заключаем необходимые соглашения о передаче (включая
              стандартные договорные условия, где требуется).
            </p>

            <h2 id="changes">12. Изменения политики</h2>
            <p>
              Мы можем обновлять эту Политику. Актуальная версия всегда доступна
              по этому адресу. Существенные изменения будут дополнительно
              уведомляться в интерфейсе или по email.
            </p>

            <h2 id="contact">13. Контакты</h2>
            <p className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              Qalam Masters, РК, Астана, пр-т Мангилик Ел, 1
            </p>
            <p>
              Email для вопросов по конфиденциальности:{" "}
              <a
                className="text-[#3972FE] hover:underline"
                href="mailto:truemasters@inbox.ru"
              >
                truemasters@inbox.ru
              </a>
              . Общая поддержка:{" "}
              <a
                className="text-[#3972FE] hover:underline"
                href="mailto:support@qalam-masters.kz"
              >
                support@qalam-masters.kz
              </a>
              .
            </p>

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <FileText className="inline h-4 w-4 mr-2" />
              Этот текст предоставлен в информационных целях и не является
              юридической консультацией. При необходимости адаптируйте политику
              под требования вашей организации и применимое право.
            </div>

            <div className="mt-8">
              <Link to="/" className="text-sm text-[#3972FE] hover:underline">
                ← На главную
              </Link>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
