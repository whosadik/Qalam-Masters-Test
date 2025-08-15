import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileDown } from "lucide-react";

const KEY_JOURNALS = "myOrgJournals";
const KEY_ORG = "myOrg";

const SAMPLE = {
  id: 0,
  name: "Научный журнал «Вестник науки»",
  description:
    "«Вестник науки» — рецензируемый журнал, публикующий оригинальные исследования, обзоры и аналитические материалы по широкому спектру дисциплин.",
  mission:
    "Продвигать научные исследования и развивать академический диалог между представителями различных научных направлений, способствуя интеграции науки и практики.",
  topics: [
    "Естественные и технические науки",
    "Гуманитарные и общественные дисциплины",
    "Информационные технологии и инжиниринг",
    "Экономика, менеджмент, юриспруденция",
    "Образование, педагогика, психология",
  ],
  audience:
    "Научные сотрудники, преподаватели вузов, аспиранты, докторанты, а также практики, заинтересованные в научно-обоснованных решениях.",
  ethics:
    "Двустороннее слепое рецензирование. Придерживаемся принципов прозрачности, академической честности и стандартов COPE.",
  periodicity:
    "Ежеквартально (4 раза в год). Публикация возможна в электронном и печатном форматах.",
  editorial: [
    {
      role: "Главный редактор",
      name: "Асанов Алмас Ахатович, д.ф.н., проф., Казахстан",
    },
    {
      role: "Заместитель главного редактора",
      name: "Асанов Алмас Ахатович, д.ф.н., проф., Казахстан",
    },
    {
      role: "Член редсовета",
      name: "Асанов Алмас Ахатович, д.ф.н., проф., Казахстан",
    },
    {
      role: "Член редсовета",
      name: "Асанов Алмас Ахатович, д.ф.н., проф., Казахстан",
    },
  ],
  forAuthors: {
    fee: "Стоимость публикации — 5 000 ₸.",
    firstDecision: "Первичное решение — до 5 рабочих дней.",
    reviewTime: "Срок рецензирования — до 21 дня.",
    publication: "Публикация — в ближайшем номере после принятия.",
  },
  coverUrl: "", // можно положить ссылку на обложку
  site: "",
  email: "contact@example.com",
};

export default function JournalView() {
  const { jid } = useParams(); // маршрут: /moderator/journals/:jid
  const [journal, setJournal] = useState(null);
  const [org, setOrg] = useState(null);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
      const found = items.find((j) => String(j.id) === String(jid));
      setJournal(found || SAMPLE);
    } catch {
      setJournal(SAMPLE);
    }
    try {
      const o = JSON.parse(localStorage.getItem(KEY_ORG) || "null");
      setOrg(o);
    } catch {
      setOrg(null);
    }
  }, [jid]);

  const topics = useMemo(() => journal?.topics || [], [journal]);

  const onPrint = () => window.print();

  if (!journal) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
        {journal.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Левый сайдбар: обложка  CTA */}
        <aside className="md:col-span-4">
          <Card className="border shadow-sm rounded-2xl">
            <CardContent className="p-4 space-y-4">
              {/* Обложка */}
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

              {/* Кнопка «Подать статью» */}
              <Link to="/submit-article" className="block">
                <Button className="w-full">Подать статью в журнал</Button>
              </Link>

              {/* Контакты */}
              <div className="text-sm text-gray-700 space-y-1">
                {org?.name && (
                  <div>
                    <span className="font-medium">Организация: </span>
                    {org.name}
                  </div>
                )}
                {journal.site && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <a
                      href={journal.site}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-600"
                    >
                      {journal.site}
                    </a>
                  </div>
                )}
                <div>
                  <span className="font-medium">Email: </span>
                  {journal.email || SAMPLE.email}
                </div>
              </div>

              {/* Плашки-тематики */}
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Действия */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={onPrint} className="w-full">
                  <FileDown className="w-4 h-4 mr-2" />
                  Печать/PDF
                </Button>
                <Link to="/moderator">
                  <Button variant="outline" className="w-full">
                    В кабинет
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Правая колонка: контент */}
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
                <h2 className="text-xl font-semibold">Приглашение авторам</h2>
                <p className="text-gray-800">
                  Мы открыты к сотрудничеству и принимаем рукописи на русском и
                  казахском языках. Ознакомьтесь с требованиями к оформлению
                  статей и подайте работу через личный кабинет.
                </p>
              </section>

              <Separator />

              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Редакционная коллегия</h2>
                <ul className="space-y-1">
                  {(journal.editorial?.length
                    ? journal.editorial
                    : SAMPLE.editorial
                  ).map((m, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{m.role}:</span> {m.name}
                    </li>
                  ))}
                </ul>
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

      {/* print-friendly */}
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
