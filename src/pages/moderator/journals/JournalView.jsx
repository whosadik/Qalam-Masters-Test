// src/pages/JournalView.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileDown } from "lucide-react";
import { API } from "@/constants/api";
import { useAuth } from "@/auth/AuthContext";
import { http } from "@/lib/apiClient";
import { useTranslation } from "react-i18next";

const SAMPLE = {
  id: "sample",
  name: "Демонстрационный журнал",
  description:
    "Это пример карточки журнала. Здесь будет краткое описание целей, тематики и аудитории издания.",
  mission:
    "Продвижение научных исследований, прозрачное рецензирование и качественная публикация.",
  topics: ["Наука и образование", "Инженерия", "Информатика", "Экономика"],
  audience: "Исследователи, преподаватели, студенты магистратуры и PhD.",
  ethics: "Следуем принципам COPE. Антиплагиат на этапе скрининга.",
  periodicity: "Ежеквартально",
  editorial: [],
  forAuthors: {
    fee: "Публикационный взнос отсутствует",
    firstDecision: "7–14 дней (первичное решение)",
    reviewTime: "2–4 недели",
    publication: "Онлайн-публикация после приёма",
  },
  coverUrl: "",
  site: "",
  email: "info@example.com",
  issn: "",
  theme: "Междисциплинарный",
  language: "ru / en",
  frequency: "Ежеквартально",
};

const FREQUENCY_MAP = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  monthly: "Ежемесячно",
  quarterly: "Ежеквартально",
  annually: "Ежегодно",
};

const THEME_MAP = {
  science: "Наука",
  arts: "Искусство",
  technology: "Технологии",
  business: "Бизнес",
  health: "Здоровье",
};

const LANGUAGE_MAP = {
  kz: "Казахский",
  ru: "Русский",
  en: "Английский",
  uz: "Узбекский",
  ky: "Кыргызский",
  zh: "Китайский",
  de: "Немецкий",
  es: "Испанский",
  // Добавьте другие языки, если используются
};

export default function JournalView() {
  const { t } = useTranslation(["journal_public", "auth", "common"]);
  const { jid } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const { isOrgAdmin } = useAuth();

  const normalize = (raw) => {
    // helper: привести значение (строку/массив/число) к массиву строк
    const toList = (v) => {
      if (v == null) return [];
      if (Array.isArray(v)) return v.map((x) => (x == null ? "" : String(x).trim())).filter(Boolean);
      // строка или другое
      return String(v)
          .split(/[,;/]\s*|\s+/) // "a, b", "a/b", "a b"
          .map((s) => s.trim())
          .filter(Boolean);
    };

    const mapList = (v, map, i18nNs, i18nKeyPrefix) => {
      const list = toList(v);
      const mapped = list
          .map((item) => {
            const key = String(item).trim();
            // сначала попробуем по карте (case-insensitive)
            const mappedByMap = map[String(key).toLowerCase()];
            if (mappedByMap) return mappedByMap;
            // затем попробуем i18n ключ (если нужен перевод)
            try {
              const translated = t(`${i18nNs}:${i18nKeyPrefix}.${key}`, undefined);
              if (translated && translated !== `${i18nNs}:${i18nKeyPrefix}.${key}`) return translated;
            } catch (e) {
              // ignore
            }
            // fallback — вернуть исходный item
            return key;
          })
          .filter(Boolean);
      return mapped;
    };

    const mapTheme = (val) => {
      const mapped = mapList(val, THEME_MAP, "journal_public", "view.theme");
      return mapped.length ? mapped.join(", ") : SAMPLE.theme;
    };

    const mapLanguage = (val) => {
      const mapped = mapList(val, LANGUAGE_MAP, "journal_public", "view.language");
      return mapped.length ? mapped.join(", ") : SAMPLE.language;
    };

    const mapFrequency = (val) => {
      // частотность иногда приходит как 'monthly' или как ['monthly','quarterly']
      const mapped = mapList(val, FREQUENCY_MAP, "journal_public", "view.frequency");
      return mapped.length ? mapped.join(", ") : SAMPLE.frequency;
    };

    // topics: если есть явные topics — используем их (они могут быть уже человекочитаемыми)
    // иначе — собираем fallback из theme/language/frequency (человекочитаемые)
    const fallbackTopics =
        raw?.topics?.length && Array.isArray(raw.topics)
            ? raw.topics
            : raw?.theme || raw?.language || raw?.frequency
                ? [
                  raw?.theme && `${t("journal_public:view.meta.theme", "Тема")}: ${mapTheme(raw.theme)}`,
                  raw?.language && `${t("journal_public:view.meta.language", "Язык")}: ${mapLanguage(raw.language)}`,
                  raw?.frequency && `${t("journal_public:view.meta.frequency", "Периодичность")}: ${mapFrequency(raw.frequency)}`,
                ].filter(Boolean)
                : SAMPLE.topics;

    return {
      id: raw?.id ?? SAMPLE.id,
      name: raw?.title || raw?.name || SAMPLE.name,
      description: raw?.description ?? SAMPLE.description,
      mission: raw?.mission ?? SAMPLE.mission,
      topics: Array.isArray(raw?.topics) && raw.topics.length ? raw.topics : fallbackTopics,
      audience: raw?.audience ?? SAMPLE.audience,
      ethics: raw?.ethics ?? SAMPLE.ethics,
      periodicity: mapFrequency(raw?.frequency ?? raw?.periodicity),
      editorial: Array.isArray(raw?.editorial) && raw.editorial.length ? raw.editorial : SAMPLE.editorial,
      forAuthors: {
        fee: raw?.fee ?? SAMPLE.forAuthors.fee,
        firstDecision: raw?.first_decision ?? SAMPLE.forAuthors.firstDecision,
        reviewTime: raw?.review_time ?? SAMPLE.forAuthors.reviewTime,
        publication: raw?.publication ?? SAMPLE.forAuthors.publication,
      },
      coverUrl: raw?.logo || raw?.cover || "",
      site: raw?.site || raw?.website || "",
      email: raw?.email || SAMPLE.email,
      issn: raw?.issn,
      theme: raw?.theme ? mapTheme(raw.theme) : undefined,
      language: raw?.language ? mapLanguage(raw.language) : undefined,
      frequency: raw?.frequency ? mapFrequency(raw.frequency) : undefined,
    };
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      setForbidden(false);
      try {
        // API.JOURNALS должен быть вида "/api/journals/journals/"
        const { data } = await http.get(`${API.JOURNALS}${jid}/`);
        if (!ignore) setJournal(normalize(data));
      } catch (e) {
        const code = e?.response?.status;
        if (code === 403 || code === 401) {
          if (!ignore) {
            setErr(
                t(
                    "journal_public:view.errors.load_failed_auth",
                    "Не удалось загрузить данные журнала (требуется авторизация). Показан пример."
                )
            );
            setJournal(SAMPLE);
          }
        } else if (code === 404) {
          navigate("/journals", { replace: true });
          return;
        } else {
          if (!ignore) {
            setErr(
                t(
                    "journal_public:view.errors.load_failed",
                    "Не удалось загрузить данные журнала. Показан пример."
                )
            );
            setJournal(SAMPLE);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }

      // организация (если клали в localStorage)
      try {
        const o = JSON.parse(localStorage.getItem("myOrg") || "null");
        if (!ignore) setOrg(o);
      } catch {
        if (!ignore) setOrg(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [jid, navigate]);

  const topics = useMemo(() => journal?.topics || [], [journal]);

  if (loading) return <div className="p-6 text-gray-500">{t("journal_public:view.loading", "Загрузка…")}</div>;

  {/*}
  if (forbidden) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-4">
        <div className="text-2xl font-semibold">{t("journal_public:view.forbidden.title", "Доступ запрещён (403)")}</div>
        <p className="text-gray-600">
          {t(
              "journal_public:view.forbidden.subtitle",
              "Просмотр этого журнала доступен только авторизованным пользователям с соответствующими правами."
          )}
        </p>
        <div className="flex gap-2 justify-center">
          <Link to={`/login?next=/journals/${encodeURIComponent(jid)}`}>
            <Button>{t("auth:login.login_btn", "Войти")}</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">{t("common:actions.go_home", "На главную страницу")}</Button>
          </Link>
        </div>
      </div>
    );
  }
  */}

  if (!journal) return null;

  const onPrint = () => window.print();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
      {err && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          {err}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          {journal.name}
        </h1>
        {org &&
          (org.is_verified ? (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
              {t("journal_public:view.org.verified", "Верифицирована")}
              {org.verification_date
                ? ` • ${new Date(org.verification_date).toLocaleDateString("ru-RU")}`
                : ""}
            </span>
          ) : (
            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              {t("journal_public:view.org.not_verified", "Не верифицирована")}
            </span>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Левый сайдбар */}
        <aside className="md:col-span-4">
          <Card className="border shadow-sm rounded-2xl">
            <CardContent className="p-4 space-y-4">
              {journal.coverUrl ? (
                <img
                  src={journal.coverUrl}
                  alt="Обложка журнала"
                  className="w-full h-80 md:h-[28rem] xl:h-[32rem] rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-80 md:h-[28rem] xl:h-[32rem] rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-center p-4">
                  <div className="text-slate-700">
                    <div className="font-semibold">{t("journal_public:view.cover.placeholder.title", "Обложка журнала")}</div>
                    <div className="text-sm opacity-70">
                      {t(
                          "journal_public:view.cover.placeholder.hint",
                          "(загрузите в настройках журнала)"
                      )}
                    </div>
                  </div>
                </div>
              )}
              {!isOrgAdmin && (
                <Link
                  to={`/submit-article?journalId=${encodeURIComponent(journal.id)}`}
                  className="block"
                >
                  <Button className="w-full">
                    {t(
                        "journal_public:view.actions.submit",
                        "Подать статью в журнал"
                    )}
                  </Button>
                </Link>
              )}
              <Link to={`/journals/${journal.id}/issues`} className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  {t(
                      "journal_public:view.actions.issues",
                      "Выпуски / Архив"
                  )}
                </Button>
              </Link>
              <div className="text-sm text-gray-700 space-y-1">
                {org?.name && (
                  <div>
                    <span className="font-medium">{t("journal_public:view.labels.organization", "Организация")}:{" "} </span>
                    {org.name}
                  </div>
                )}
                {journal.issn && (
                  <div>
                    <span className="font-medium">ISSN: </span>
                    {journal.issn}
                  </div>
                )}
                {journal.site && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <a
                      href={journal.site}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600 break-all"
                    >
                      {journal.site}
                    </a>
                  </div>
                )}
                <div>
                  <span className="font-medium">Email: </span>
                  {journal.email}
                </div>
                <div className="text-xs text-gray-500">
                  {[journal.theme, journal.language, journal.frequency]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Правая колонка */}
        <main className="md:col-span-7 xl:col-span-7">
          <Card className="border shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-6">
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">
                  {t(
                      "journal_public:view.sections.description",
                      "Описание журнала"
                  )}
                </h2>
                <p className="text-gray-800">
                  {journal.description || SAMPLE.description}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">
                  {t(
                      "journal_public:view.sections.topics",
                      "Тематика публикаций"
                  )}
                </h2>
                <ul className="list-disc pl-6 space-y-1">
                  {(topics.length ? topics : SAMPLE.topics).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">
                  {t(
                      "journal_public:view.sections.periodicity",
                      "Периодичность выхода"
                  )}
                </h2>
                <p className="text-gray-800">
                  {journal.periodicity || SAMPLE.periodicity}
                </p>
              </section>
            </CardContent>
          </Card>
        </main>
      </div>

      <style>{`
        @media print {
          a, button { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .shadow-sm, .border { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
