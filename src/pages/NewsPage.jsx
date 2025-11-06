import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  CalendarDays,
  Megaphone,
  BookPlus,
  Handshake,
  FileText,
  ArrowRight,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useTranslation } from "react-i18next";

/* ---------------------------------- MOCK DATA ---------------------------------- */
// Категории: platform (обновления), journals (новые журналы), events (встречи), memos (меморандумы/соглашения)
const NEWS = [
  {
    id: "n-2025-09-09-01",
    title: "Запущена публичная страница каталога журналов",
    description:
      "Появилась новая публичная страница со списком журналов: поиск, сортировка, адаптивная сетка карточек.",
    date: "2025-09-09",
    category: "platform",
    tags: ["release", "ui", "journals"],
    link: "/journals",
  },

  {
    id: "n-2025-08-10-01",
    title: "Улучшены отчёты по скринингу",
    description:
      "Добавлены фильтры, выгрузка в PDF, фикс частых UX-блокеров для новых авторов.",
    date: "2025-08-10",
    category: "platform",
    tags: ["reports", "ux", "pdf"],
    link: "/app/reports",
  },
];

const CATEGORIES = [
  { key: "all", label: "Все", icon: Newspaper },
  { key: "platform", label: "Обновления платформы", icon: Megaphone },
  { key: "journals", label: "Новые журналы", icon: BookPlus },
  { key: "events", label: "Встречи", icon: CalendarDays },
  { key: "memos", label: "Меморандумы", icon: Handshake },
];

/* ---------------------------------- HELPERS ---------------------------------- */
const formatDate = (iso) => {
  try {
    const dt = new Date(iso + "T00:00:00");
    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
};

const isRecent = (iso) => {
  const now = new Date();
  const dt = new Date(iso + "T00:00:00");
  const diffDays = (now - dt) / (1000 * 60 * 60 * 24);
  return diffDays <= 14; // метка «New» 2 недели
};

/* ---------------------------------- CHIP ---------------------------------- */
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- NEWS CARD ---------------------------------- */
function NewsCard({ item }) {
  const { t } = useTranslation("news");
  const CatIcon =
    CATEGORIES.find((c) => c.key === item.category)?.icon || Megaphone;
  return (
    <Card className="h-full border-0 shadow-sm hover:shadow-md transition">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <CatIcon className="w-4 h-4" />
          <span>
            {
              t(`categories.${item.category}`, CATEGORIES.find((c) => c.key === item.category)?.label || "Новости")
            }
          </span>
          <span className="mx-1">•</span>
          <span>{formatDate(item.date)}</span>
          {isRecent(item.date) && (
            <Badge className="ml-2" variant="secondary">
              {t("badges.new", "New")}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base sm:text-lg leading-snug line-clamp-2 mt-2">
          {item.title}
        </CardTitle>
        {item.tags?.length ? (
          <CardDescription className="mt-1">
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[11px]">
                  #{t}
                </Badge>
              ))}
            </div>
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-3">
          {item.description}
        </p>
        <div className="mt-4">
          {item.link ? (
            <Button asChild size="sm" className="gap-2">
              <Link to={item.link}>
                {t("actions.more", "Подробнее")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-slate-400">{t("labels.link_unavailable", "Ссылка недоступна")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- TIMELINE ---------------------------------- */
function Timeline({ items }) {
  const { t } = useTranslation("news");

  return (
    <div className="relative pl-6 sm:pl-8">
      <div className="absolute left-2 sm:left-3 top-0 bottom-0 w-px bg-slate-200" />
      <div className="space-y-6">
        {items.map((it) => (
          <div key={it.id} className="relative">
            <div className="absolute -left-[7px] sm:-left-[9px] top-1.5 h-3.5 w-3.5 rounded-full bg-blue-600 ring-2 ring-white shadow" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="text-xs sm:text-sm text-slate-500 w-32 flex-shrink-0">
                {formatDate(it.date)}
              </div>
              <div className="text-sm sm:text-base font-medium">
                {it.title}
                {isRecent(it.date) && (
                  <Badge className="ml-2 align-middle" variant="secondary">
                    New
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-1 text-sm text-slate-600">{it.description}</div>
            {it.link && (
              <div className="mt-2">
                <Link
                  to={it.link}
                  className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  {t("actions.more", "Подробнее")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- PAGE ---------------------------------- */
export default function NewsUpdatesPage() {
  const { t } = useTranslation(["news", "common", "footer"])

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [year, setYear] = useState("all");
  const [pageSize, setPageSize] = useState(9);
  const [page, setPage] = useState(1);

  const years = useMemo(() => {
    const ys = Array.from(
      new Set(NEWS.map((n) => new Date(n.date).getFullYear()))
    ).sort((a, b) => b - a);
    return ["all", ...ys];
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return NEWS.filter((n) => {
      if (cat !== "all" && n.category !== cat) return false;
      if (
        year !== "all" &&
        String(new Date(n.date).getFullYear()) !== String(year)
      )
        return false;
      if (!text) return true;
      const hay =
        `${n.title} ${n.description} ${n.tags?.join(" ") ?? ""}`.toLowerCase();
      return hay.includes(text);
    }).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [q, cat, year]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // сбрасываем страницу, если меняются фильтры/поиск
  const resetAnd = (fn) => {
    setPage(1);
    fn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] to-white">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            {t("page.title", "Новости")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {t(
                "page.subtitle",
                "Обновления платформы, добавление журналов, встречи, меморандумы."
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              value={q}
              onChange={(e) => resetAnd(() => setQ(e.target.value))}
              placeholder={t(
                  "controls.search_placeholder",
                  "Поиск по заголовку и тегам…"
              )}
              className="w-full rounded-lg border px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label={t("controls.search_aria", "Поиск новостей")}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.key}
                  active={cat === c.key}
                  onClick={() => resetAnd(() => setCat(c.key))}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="ml-0 sm:ml-auto flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => resetAnd(() => setYear(e.target.value))}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              title={t("controls.year_title", "Год")}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "all" ? t("controls.all_years", "Все годы") : y}
                </option>
              ))}
            </select>

            <select
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              title={t("controls.per_page_title", "На странице")}
            >
              {[6, 9, 12, 18].map((n) => (
                <option key={n} value={n}>
                  {t("controls.per_page_option", "{{count}} на странице", {
                    count: n,
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {pageItems.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            {t(
                "empty.no_results",
                "Ничего не найдено по текущим фильтрам."
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {pageItems.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {t("pagination.summary", "Найдено: {{total}} • Стр. {{page}} из {{totalPages}}", {
              total,
              page,
              totalPages,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="gap-1"
            >
              {t("pagination.prev", "← Назад")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="gap-1"
            >
              {t("pagination.next", "Вперёд →")}
            </Button>
          </div>
        </div>

        {/* Timeline (сводка) */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-lg sm:text-xl font-semibold">{t("timeline.title", "Лента событий")}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t(
                "timeline.subtitle",
                "Сжатая хронология ключевых обновлений и событий."
            )}
          </p>
          <Separator className="my-4" />
          <Timeline
            items={NEWS.slice().sort((a, b) => (a.date < b.date ? 1 : -1))}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
