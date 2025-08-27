// src/pages/JournalView.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileDown } from "lucide-react";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

const SAMPLE = {
  id: 0,
  name: "Научный журнал «Вестник науки»",
  description:
    "«Вестник науки» — рецензируемый журнал, публикующий оригинальные исследования, обзоры и аналитические материалы по широкому спектру дисциплин.",
  mission:
    "Продвигать научные исследования и развивать академический диалог между представителями различных научных направлений.",
  topics: [
    "Естественные и технические науки",
    "Гуманитарные и общественные дисциплины",
    "Информационные технологии и инжиниринг",
    "Экономика, менеджмент, юриспруденция",
    "Образование, педагогика, психология",
  ],
  audience:
    "Научные сотрудники, преподаватели вузов, аспиранты, докторанты и практики.",
  ethics: "Двустороннее слепое рецензирование; стандарты COPE.",
  periodicity: "Ежеквартально.",
  editorial: [
    { role: "Главный редактор", name: "Асанов Алмас Ахатович, д.ф.н., проф." },
  ],
  forAuthors: {
    fee: "Стоимость публикации — 5 000 ₸.",
    firstDecision: "Первичное решение — до 5 рабочих дней.",
    reviewTime: "Срок рецензирования — до 21 дня.",
    publication: "Публикация — в ближайшем номере после принятия.",
  },
  coverUrl: "",
  site: "",
  email: "contact@example.com",
};

export default function JournalView() {
  const { jid } = useParams(); // Роут: /journals/:jid (НЕ модераторский)
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const normalize = (raw) => ({
    id: raw?.id ?? SAMPLE.id,
    name: raw?.title || raw?.name || SAMPLE.name,
    description: raw?.description ?? SAMPLE.description,
    mission: raw?.mission ?? SAMPLE.mission,
    topics: raw?.topics?.length
      ? raw.topics
      : [
          raw?.theme && `Тема: ${raw.theme}`,
          raw?.language && `Язык: ${raw.language}`,
          raw?.frequency && `Периодичность: ${raw.frequency}`,
        ].filter(Boolean),
    audience: raw?.audience ?? SAMPLE.audience,
    ethics: raw?.ethics ?? SAMPLE.ethics,
    periodicity: raw?.frequency ?? raw?.periodicity ?? SAMPLE.periodicity,
    editorial:
      Array.isArray(raw?.editorial) && raw.editorial.length
        ? raw.editorial
        : SAMPLE.editorial,
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
    theme: raw?.theme,
    language: raw?.language,
    frequency: raw?.frequency,
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr("");
      setForbidden(false);
      try {
        // ВАЖНО: API.JOURNALS должен быть `/api/journals/journals/`
        // тогда получится `/api/journals/journals/{id}/`
        const { data } = await http.get(`${API.JOURNALS}${jid}/`);
        if (!ignore) setJournal(normalize(data));
      } catch (e) {
        const code = e?.response?.status;
        if (code === 403) {
          if (!ignore) setForbidden(true);
        } else if (code === 404) {
          navigate("/journals", { replace: true });
          return;
        } else {
          if (!ignore) {
            setErr("Не удалось загрузить данные журнала. Показан пример.");
            setJournal(SAMPLE);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }

      // опционально: организация из localStorage
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

  if (loading) return <div className="p-6 text-gray-500">Загрузка…</div>;

  // Экран «Нет доступа»
  if (forbidden) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-4">
        <div className="text-2xl font-semibold">Доступ запрещён (403)</div>
        <p className="text-gray-600">
          Просмотр этого журнала доступен только авторизованным пользователям с
          соответствующими правами.
        </p>
        <div className="flex gap-2 justify-center">
          <Link to={`/login?next=/journals/${encodeURIComponent(jid)}`}>
            <Button>Войти</Button>
          </Link>
          <Link to="/journals">
            <Button variant="outline">К списку журналов</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!journal) return null;

  const onPrint = () => window.print();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
      {err && (
        <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          {err}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
        {journal.name}
      </h1>

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
                    <div className="font-semibold">Обложка журнала</div>
                    <div className="text-sm opacity-70">
                      (загрузите в настройках журнала)
                    </div>
                  </div>
                </div>
              )}

              <Link
                to={`/submit-article?journalId=${encodeURIComponent(journal.id)}`}
                className="block"
              >
                <Button className="w-full">Подать статью в журнал</Button>
              </Link>

              <div className="text-sm text-gray-700 space-y-1">
                {org?.name && (
                  <div>
                    <span className="font-medium">Организация: </span>
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

              <div className="flex gap-2">
                <Button variant="outline" onClick={onPrint} className="w-full">
                  <FileDown className="w-4 h-4 mr-2" />
                  Печать/PDF
                </Button>
                <Link to="/author-dashboard">
                  <Button variant="outline" className="w-full">
                    В кабинет
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Правая колонка */}
        <main className="md:col-span-7 xl:col-span-7">
          <Card className="border shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-6">
              <section className="space-y-2">
                <p className="text-gray-800">
                  {journal.description || SAMPLE.description}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Миссия журнала</h2>
                <p className="text-gray-800">
                  {journal.mission || SAMPLE.mission}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Тематика публикаций</h2>
                <ul className="list-disc pl-6 space-y-1">
                  {(topics.length ? topics : SAMPLE.topics).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Целевая аудитория</h2>
                <p className="text-gray-800">
                  {journal.audience || SAMPLE.audience}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">
                  Рецензирование и этика
                </h2>
                <p className="text-gray-800">
                  {journal.ethics || SAMPLE.ethics}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Периодичность выхода</h2>
                <p className="text-gray-800">
                  {journal.periodicity || SAMPLE.periodicity}
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">
                  Информация для авторов
                </h2>
                <ul className="list-disc pl-6 space-y-1 text-gray-800">
                  <li>{journal.forAuthors?.fee || SAMPLE.forAuthors.fee}</li>
                  <li>
                    {journal.forAuthors?.firstDecision ||
                      SAMPLE.forAuthors.firstDecision}
                  </li>
                  <li>
                    {journal.forAuthors?.reviewTime ||
                      SAMPLE.forAuthors.reviewTime}
                  </li>
                  <li>
                    {journal.forAuthors?.publication ||
                      SAMPLE.forAuthors.publication}
                  </li>
                </ul>
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
