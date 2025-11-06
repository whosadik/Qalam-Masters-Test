import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useTranslation } from "react-i18next";

export default function RequirementsPage() {
  const { t } = useTranslation(["journal_public", "footer"]);

  return (
    <>
      <Navbar></Navbar>
      <div class="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-10 mb-10">
        <h1 class="text-2xl font-bold mb-6">
          {t(
              "journal_public:requirements.title",
              "Требования к рукописям, публикуемым в платформе «Qalam Masters»"
          )}
        </h1>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>
            {t(
                "journal_public:requirements.notice.intro",
                "Настоящие правила являются"
            )}{" "}
            <strong>
              {t(
                  "journal_public:requirements.notice.bold_common",
                  "общими требованиями "
              )}
            </strong>
            {t(
                "journal_public:requirements.notice.for_platform",
                "для платформы."
            )}{" "}
            <br />
            {t(
                "journal_public:requirements.notice.attention",
                "Обратите внимание: у каждого журнала могут быть"
            )}{" "}
            <strong>
              {t(
                  "journal_public:requirements.notice.extra_conditions",
                  "дополнительные или уточняющие условия "
              )}
            </strong>
            {t(
                "journal_public:requirements.notice.examples",
                "(объём, оформление, структура)."
            )}{" "}
            {t(
                "journal_public:requirements.notice.before_submit",
                "Перед подачей рукописи обязательно ознакомьтесь с"
            )}{" "}
            <em>
              {t(
                  "journal_public:requirements.notice.authors_section",
                  "разделом «Для авторов» "
              )}
            </em>
            {t(
                "journal_public:requirements.notice.of_specific_journal",
                "конкретного журнала."
            )}
          </p>
        </div>

        <h2 class="text-xl font-semibold mt-6 mb-3">{t("journal_public:requirements.s1.title", "1. Общие положения")}</h2>
        <p class="mb-3">
          {t(
              "journal_public:requirements.s1.p1",
              "В журнале публикуются статьи по актуальным проблемам в различных областях науки (гуманитарные, социальные, технические, естественные и др.). Принимаются только ранее не опубликованные работы, соответствующие тематике, обладающие научной новизной и содержащие результаты собственных исследований. Статьи могут быть на казахском, русском или английском языке."
          )}
        </p>
        <p class="mb-3">
          <strong>
            {t(
              "journal_public:requirements.s1.structure_label",
              "Структура статьи: "
            )}
          </strong>
          {t(
              "journal_public:requirements.s1.structure_value",
              "название, аннотация, ключевые слова, основные положения, введение, цель, материалы и методы, результаты и обсуждение, заключение, информация о финансировании (при наличии), список источников."
          )}
        </p>
        <p class="mb-3">
          <strong>
            {t("journal_public:requirements.s1.volume_label", "Объем: ")}
          </strong>
          {t(
              "journal_public:requirements.s1.volume_value",
              "от 5 до 10 страниц, включая все материалы. Каждая статья должна содержать УДК и МРНТИ."
          )}
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">
          {t(
              "journal_public:requirements.s2.title",
              "2. Технические требования"
          )}
        </h2>
        <ul class="list-disc pl-6 space-y-1">
          <li>
            {t(
                "journal_public:requirements.s2.items.format",
                "Формат MS Word 2016–2021"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s2.items.orientation",
                "Ориентация — книжная, формат А4"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s2.items.margins",
                "Поля: верх/низ — 20 мм, левое — 30 мм, правое — 15 мм"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s2.items.font",
                "Шрифт Times New Roman, 12 pt, межстрочный интервал — одинарный"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s2.items.indent",
                "Абзацный отступ — 1,25 см (без Tab и пробелов)"
            )}
          </li>
        </ul>
        <p class="mt-2">
          <strong>
            {t(
                "journal_public:requirements.s2.forbidden_label",
                "Запрещается: "
            )}
          </strong>
          {t(
              "journal_public:requirements.s2.forbidden_value",
              "нумерация страниц, разрывы страниц, автоматические сноски, переносы, изменение межбуквенного интервала."
          )}
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">
          {t(
              "journal_public:requirements.s3.title",
              "3. Оформление первой страницы"
          )}
        </h2>
        <ul class="list-disc pl-6 space-y-1">
          <li>
            {t(
                "journal_public:requirements.s3.items.udc_mrnti",
                "В левом верхнем углу — УДК, ниже — МРНТИ"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s3.items.author_name",
                "По центру — фамилия и инициалы автора (полужирным)"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s3.items.org",
                "Далее — организация (курсивом, без сокращений)"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s3.items.title",
                "Название статьи — заглавными буквами, полужирным, по центру"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s3.items.multilingual",
                "Информация дублируется на казахском, русском и английском языках"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s3.items.abstract",
                "Аннотация — 100–150 слов, ключевых слов — не менее 5"
            )}
          </li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">
          {t(
              "journal_public:requirements.s4.title",
              "4. Таблицы, рисунки, формулы"
          )}
        </h2>
        <ul class="list-disc pl-6 space-y-1">
          <li>
            {t(
                "journal_public:requirements.s4.items.tables",
                "Таблицы с номерами и названиями над ними"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s4.items.images",
                "Изображения — подписями под ними, разрешение не менее 300 dpi"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s4.items.charts",
                "Графики и диаграммы — в Microsoft Excel, вставленные как объект"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s4.items.formulas",
                "Формулы — в Microsoft Equation, курсивом, по центру"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s4.items.eq_numbers",
                "Номера формул — у правого края в круглых скобках"
            )}
          </li>
        </ul>

        <h2 class="text-xl font-semibold mt-6 mb-3">{t("journal_public:requirements.s5.title", "5. Список источников")}</h2>
        <p>
          {t(
              "journal_public:requirements.s5.text",
              "Источники нумеруются по порядку упоминания, оформляются по ГОСТ 7.1-2003 и ГОСТ 7.32-2017. Ссылки в тексте указываются в квадратных скобках: [3], [5,7]."
          )}
        </p>

        <h2 class="text-xl font-semibold mt-6 mb-3">
          {t(
              "journal_public:requirements.s6.title",
              "6. Дополнительные условия"
          )}
        </h2>
        <ul class="list-disc pl-6 space-y-1">
          <li>
            {t(
                "journal_public:requirements.s6.items.originality",
                "Оригинальность текста — не менее 75%"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s6.items.blind_review",
                "Статьи проходят слепое рецензирование"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s6.items.responsibility",
                "Автор отвечает за достоверность данных"
            )}
          </li>
          <li>
            {t(
                "journal_public:requirements.s6.items.permission",
                "При необходимости приложить разрешение на публикацию конфиденциальных материалов"
            )}
          </li>
        </ul>

        <p class="mt-6">
          {t(
              "journal_public:requirements.upload_text.part1",
              "Материалы загружаются через личный кабинет автора на платформе"
          )}{" "}
          <strong>Qalam Masters</strong>.
        </p>
      </div>
      <Footer></Footer>
    </>
  );
}
