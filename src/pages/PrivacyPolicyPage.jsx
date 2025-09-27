// src/pages/PrivacyPolicyPage.jsx
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Shield, FileText, Globe2, Clock, Lock, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation(["info_pages", "common"]);

  const updatedAt = "10 сентября 2025"; // обновляйте при правках
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
              <Shield className="h-4 w-4" />{" "}
              {t("info_pages:privacy.badge", "Политика конфиденциальности")}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {t(
                "info_pages:privacy.hero_title",
                "Как мы защищаем ваши данные"
              )}
            </h1>
            <p className="mt-3 text-slate-600 text-lg">
              {t(
                "info_pages:privacy.hero_desc",
                "Эта страница описывает, какие данные мы собираем на платформе {{brand}}, как их используем и какие у вас есть права.",
                { brand: "Qalam Masters" }
              )}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              {t(
                "info_pages:privacy.updated_at",
                "Последнее обновление: {{date}}",
                {
                  date: updatedAt,
                }
              )}
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
              <p className="mb-2 font-semibold text-slate-700">
                {t("info_pages:privacy.toc.title", "Оглавление")}
              </p>
              <ul className="space-y-2">
                {[
                  [
                    "scope",
                    t("info_pages:privacy.toc.scope", "1. Область действия"),
                  ],
                  [
                    "data",
                    t(
                      "info_pages:privacy.toc.data",
                      "2. Какие данные мы собираем"
                    ),
                  ],
                  [
                    "use",
                    t(
                      "info_pages:privacy.toc.use",
                      "3. Как мы используем данные"
                    ),
                  ],
                  [
                    "lawful",
                    t(
                      "info_pages:privacy.toc.lawful",
                      "4. Правовые основания обработки"
                    ),
                  ],
                  [
                    "cookies",
                    t(
                      "info_pages:privacy.toc.cookies",
                      "5. Файлы cookie и аналитика"
                    ),
                  ],
                  [
                    "sharing",
                    t(
                      "info_pages:privacy.toc.sharing",
                      "6. Передача третьим лицам"
                    ),
                  ],
                  [
                    "retention",
                    t("info_pages:privacy.toc.retention", "7. Сроки хранения"),
                  ],
                  [
                    "security",
                    t("info_pages:privacy.toc.security", "8. Безопасность"),
                  ],
                  [
                    "rights",
                    t(
                      "info_pages:privacy.toc.rights",
                      "9. Права пользователей"
                    ),
                  ],
                  [
                    "children",
                    t(
                      "info_pages:privacy.toc.children",
                      "10. Дети и уязвимые лица"
                    ),
                  ],
                  [
                    "transfer",
                    t(
                      "info_pages:privacy.toc.transfer",
                      "11. Трансграничная передача"
                    ),
                  ],
                  [
                    "changes",
                    t(
                      "info_pages:privacy.toc.changes",
                      "12. Изменения политики"
                    ),
                  ],
                  // Новая секция про Закон РК
                  ["kzlaw", "13. Закон РК о персональных данных"],
                  [
                    "contact",
                    t("info_pages:privacy.toc.contact", "14. Контакты"),
                  ],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* маленький дисклеймер */}
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              <strong>{t("info_pages:privacy.note_strong", "Важно:")}</strong>{" "}
              {t(
                "info_pages:privacy.note_text",
                "этот документ носит общий характер для платформы. У отдельных журналов могут быть дополнительные требования или уведомления о конфиденциальности на их публичных страницах «Для авторов»."
              )}
            </div>
          </aside>

          {/* BODY */}
          <article className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 prose prose-slate max-w-none">
            <h2 id="scope">
              {t("info_pages:privacy.h.scope", "1. Область действия")}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.scope",
                "Настоящая Политика применяется к сайту и сервисам платформы {{brand}}, включая публичные страницы журналов, кабинеты авторов/редакций и API. Используя платформу, вы соглашаетесь с условиями этой Политики.",
                { brand: "Qalam Masters" }
              )}
            </p>

            <h2 id="data">
              {t("info_pages:privacy.h.data", "2. Какие данные мы собираем")}
            </h2>
            <ul>
              <li>
                <strong>
                  {t("info_pages:privacy.li.account_bold", "Учётные данные: ")}
                </strong>
                {t(
                  "info_pages:privacy.li.account_text",
                  "имя, email, пароль (хранится в виде хеша), роль/организация."
                )}
              </li>
              <li>
                <strong>
                  {t(
                    "info_pages:privacy.li.profile_bold",
                    "Профиль и метаданные статей: "
                  )}
                </strong>
                {t(
                  "info_pages:privacy.li.profile_text",
                  "ФИО авторов, ORCID, аффилиации, аннотации, ключевые слова, файлы рукописей и приложения."
                )}
              </li>
              <li>
                <strong>
                  {t("info_pages:privacy.li.ops_bold", "Операционные данные: ")}
                </strong>
                {t(
                  "info_pages:privacy.li.ops_text",
                  "статусы заявок, комментарии, решения редакции, история действий."
                )}
              </li>
              <li>
                <strong>
                  {t("info_pages:privacy.li.tech_bold", "Техданные: ")}
                </strong>
                {t(
                  "info_pages:privacy.li.tech_text",
                  "IP-адрес, user-agent, лог-записи для безопасности и диагностики."
                )}
              </li>
              <li>
                <strong>
                  {t(
                    "info_pages:privacy.li.billing_bold",
                    "Платёжные/договорные данные"
                  )}
                </strong>{" "}
                ({t("info_pages:privacy.li.if_applicable", "если применимо")}):
                {t(
                  "info_pages:privacy.li.billing_text",
                  "реквизиты организации, номера договоров, счета."
                )}
              </li>
            </ul>

            <h2 id="use">
              {t("info_pages:privacy.h.use", "3. Как мы используем данные")}
            </h2>
            <ul>
              <li>
                {t(
                  "info_pages:privacy.li.use.services",
                  "оказание сервисов: приём статей, рецензирование, публикация, аналитика;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.use.support",
                  "поддержка пользователей и обратная связь;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.use.security",
                  "обеспечение безопасности, предотвращение мошенничества и злоупотреблений;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.use.contracts",
                  "выполнение договоров и законных обязательств;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.use.improve",
                  "улучшение качества сервиса (агрегированная статистика, без попытки идентификации)."
                )}
              </li>
            </ul>

            <h2 id="lawful">
              {t(
                "info_pages:privacy.h.lawful",
                "4. Правовые основания обработки"
              )}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.lawful",
                "Мы обрабатываем данные на основании: (a) исполнения договора с пользователем или организацией; (b) законных интересов платформы (без ущерба правам субъектов); (c) согласия пользователя — для отдельных опций (например, определённые интеграции/рассылки); (d) выполнения правовых обязанностей."
              )}
            </p>

            <h2 id="cookies">
              {t("info_pages:privacy.h.cookies", "5. Файлы cookie и аналитика")}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.cookies",
                "Мы используем cookie для аутентификации, настроек интерфейса и статистики использования. В аналитике применяются обезличенные данные. Вы можете ограничить cookie в настройках браузера, но часть функций может стать недоступной."
              )}
            </p>

            <h2 id="sharing">
              {t("info_pages:privacy.h.sharing", "6. Передача третьим лицам")}
            </h2>
            <ul>
              <li>
                <strong>
                  {t(
                    "info_pages:privacy.li.sharing.ops_bold",
                    "Операторы и партнёры:"
                  )}
                </strong>{" "}
                {t(
                  "info_pages:privacy.li.sharing.ops_text",
                  "хостинг-провайдеры, email-шлюзы, системы аналитики, платёжные/документ-сервисы."
                )}
              </li>
              <li>
                <strong>
                  {t(
                    "info_pages:privacy.li.sharing.integrations_bold",
                    "Интеграции по выбору клиента:"
                  )}
                </strong>{" "}
                {t(
                  "info_pages:privacy.li.sharing.integrations_text",
                  "ORCID, DOI-провайдеры, LMS/СРС (например, Platonus), SSO (SAML/OIDC)."
                )}
              </li>
              <li>
                <strong>
                  {t(
                    "info_pages:privacy.li.sharing.law_bold",
                    "Требования закона:"
                  )}
                </strong>{" "}
                {t(
                  "info_pages:privacy.li.sharing.law_text",
                  "по законным запросам уполномоченных органов."
                )}
              </li>
            </ul>
            <p>
              {t(
                "info_pages:privacy.p.sharing_contracts",
                "Передача осуществляется по договорам с требованиями к защите и конфиденциальности."
              )}
            </p>

            <h2 id="retention">
              {t("info_pages:privacy.h.retention", "7. Сроки хранения")}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.retention",
                "Данные хранятся ровно столько, сколько необходимо для целей обработки и требований законодательства/договоров. Отдельные лог-записи и резервные копии могут храниться дольше в целях безопасности и аудита."
              )}
            </p>

            <h2 id="security">
              {t("info_pages:privacy.h.security", "8. Безопасность")}
            </h2>
            <ul>
              <li>
                {t(
                  "info_pages:privacy.li.security.transport",
                  "шифрование каналов (HTTPS), изоляция сред, контроль доступа (RBAC);"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.security.logging",
                  "логирование и мониторинг аномалий, защита от brute-force;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.security.updates",
                  "регулярные обновления и резервное копирование."
                )}
              </li>
            </ul>
            <p className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {t(
                "info_pages:privacy.p.security_disclaimer",
                "Несмотря на меры, ни один метод передачи и хранения не гарантирует абсолютной безопасности."
              )}
            </p>

            <h2 id="rights">
              {t("info_pages:privacy.h.rights", "9. Права пользователей")}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.rights_intro",
                "В пределах применимого права вы можете:"
              )}
            </p>
            <ul>
              <li>
                {t(
                  "info_pages:privacy.li.rights.access",
                  "запросить доступ к вашим данным и их копию;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.rights.rectify",
                  "исправить неточности и дополнить профиль;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.rights.erase",
                  "удалить данные (кроме случаев обязательного хранения);"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.rights.restrict",
                  "ограничить обработку или возразить против неё;"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.rights.withdraw",
                  "отозвать согласие (если обработка основана на нём);"
                )}
              </li>
              <li>
                {t(
                  "info_pages:privacy.li.rights.portability",
                  "на переносимость (где применимо)."
                )}
              </li>
            </ul>
            <p>
              {t(
                "info_pages:privacy.p.rights_contact_prefix",
                "Для реализации прав напишите нам:"
              )}{" "}
              <a
                className="text-[#3972FE] hover:underline"
                href="mailto:truemasters@inbox.ru"
              >
                truemasters@inbox.ru
              </a>
              .
            </p>

            <h2 id="children">
              {t("info_pages:privacy.h.children", "10. Дети и уязвимые лица")}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.children",
                "Платформа не предназначена для пользователей младше 16 лет без участия законных представителей. Если вы считаете, что ребёнок предоставил нам данные без согласия, свяжитесь с нами для удаления."
              )}
            </p>

            <h2 id="transfer">
              {t(
                "info_pages:privacy.h.transfer",
                "11. Трансграничная передача"
              )}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.transfer",
                "Данные могут передаваться между юрисдикциями (например, дата-центры/провайдеры). Мы обеспечиваем эквивалентный уровень защиты и заключаем необходимые соглашения о передаче (включая стандартные договорные условия, где требуется)."
              )}
            </p>

            <h2 id="changes">
              {t("info_pages:privacy.h.changes", "12. Изменения политики")}
            </h2>
            <p>
              {t(
                "info_pages:privacy.p.changes",
                "Мы можем обновлять эту Политику. Актуальная версия всегда доступна по этому адресу. Существенные изменения будут дополнительно уведомляться в интерфейсе или по email."
              )}
            </p>

            {/* NEW: Закон РК и контакт для ПД */}
            <h2 id="kzlaw">13. Закон РК о персональных данных</h2>
            <p>
              ТОО «True Masters» обязуется соблюдать конфиденциальность
              персональных данных клиентов и обрабатывать их в соответствии с{" "}
              <em>
                Законом Республики Казахстан «О персональных данных и их защите»
              </em>
              . Персональные данные собираются и используются исключительно для
              оказания IT-услуг, поддержки клиентов и выполнения обязательств по
              договорам. Данные не передаются третьим лицам, за исключением
              случаев, предусмотренных законодательством РК.
            </p>
            <p>
              Контакт по вопросам, связанным с персональными данными:{" "}
              <a
                href="mailto:info@truemasters.kz"
                className="text-[#3972FE] hover:underline"
              >
                info@truemasters.kz
              </a>
              , тел.:{" "}
              <a
                href="tel:+77712827801"
                className="text-[#3972FE] hover:underline"
              >
                +7&nbsp;771&nbsp;282&nbsp;78&nbsp;01
              </a>
              .
            </p>

            <h2 id="contact">
              {t("info_pages:privacy.h.contact", "14. Контакты")}
            </h2>
            <p className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              {t(
                "info_pages:privacy.p.address",
                "Qalam Masters, РК, Астана, пр-т Мангилик Ел, 1"
              )}
            </p>
            <p>
              {t(
                "info_pages:privacy.p.contact_privacy_label",
                "Email для вопросов по конфиденциальности:"
              )}{" "}
              <a
                className="text-[#3972FE] hover:underline"
                href="mailto:truemasters@inbox.ru"
              >
                truemasters@inbox.ru
              </a>
              {t(
                "info_pages:privacy.p.contact_support_label",
                ". Общая поддержка:"
              )}{" "}
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
              {t(
                "info_pages:privacy.disclaimer",
                "Этот текст предоставлен в информационных целях и не является юридической консультацией. При необходимости адаптируйте политику под требования вашей организации и применимое право."
              )}
            </div>

            <div className="mt-8">
              <Link to="/" className="text-sm text-[#3972FE] hover:underline">
                {t("info_pages:privacy.back_home", "← На главную")}
              </Link>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
