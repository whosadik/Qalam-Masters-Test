// src/pages/JournalsPublicPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  Upload,
} from "lucide-react";
import { listJournals } from "@/services/journalsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// --- маленькие утилиты ---
const debounce = (fn, ms = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const truncate = (str, n = 140) =>
  typeof str === "string" && str.length > n
    ? str.slice(0, n - 1) + "…"
    : str || "";

// попытка взять красивый “аватар” по первой букве
function LetterAvatar({ name }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white grid place-items-center font-semibold">
      {letter}
    </div>
  );
}

// Карточка журнала
function JournalCard({ j }) {
  // безопасные маппинги полей
  const id = j.id ?? j.pk ?? j.uuid ?? j.slug;
  const title = j.title || "Без названия";
  const description = j.description || j.short_description || "";
  const issn = j.issn || j.ISSN || null;
  const language = j.language || j.lang || "—";
  const theme = j.theme || j.subject || "—";
  const frequency = j.frequency || j.publish_frequency || "—";
  const logo = j.logo || j.logo_url || j.cover || null;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition">
      <CardContent className="p-0">
        <div className="p-4 hover:bg-slate-50/70 transition rounded-lg">
          <div className="flex items-stretch gap-4">
            {/* мини-обложка */}
            <div className="w-32 sm:w-36 h-44 sm:h-48 rounded-md overflow-hidden relative flex-shrink-0 bg-indigo-50">
              {logo ? (
                <img
                  src={logo}
                  alt="logo"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {title.trim().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {issn && (
                <div className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                  ISSN: {issn}
                </div>
              )}
            </div>

            {/* контент */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {title}
                </h3>
              </div>

              <div className="text-sm text-gray-600 mt-0.5">
                Тема: {theme} • Язык: {language} • Периодичность: {frequency}
              </div>

              {description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {description}
                </p>
              )}
              <div className="mt-5 flex flex-col gap-2 self-center shrink-0">
                {id && (
                  <Link to={`/journals/${id}`}>
                    <Button size="sm" className="w-40">
                      <BookOpen className="w-4 h-4 mr-2" /> О журнале
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* действия */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Скелетоны
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
      <div className="mt-4 h-8 w-28 bg-muted rounded" />
    </div>
  );
}

export default function JournalsPublicPage() {
  const [params, setParams] = useSearchParams();

  // читаем состояние из URL
  const initial = useMemo(() => {
    const q = params.get("q") || "";
    const ordering = params.get("ordering") || "-created";
    const page = Number(params.get("page") || "1");
    const page_size = Number(params.get("page_size") || "12");
    return { q, ordering, page, page_size };
  }, [params]);

  const [query, setQuery] = useState(initial.q);
  const [state, setState] = useState({
    loading: true,
    error: "",
    count: 0,
    results: [],
  });

  // дебаунсим только поиск; сорт/пагинация летят сразу
  const setUrlParams = (patch) => {
    const next = {
      q: patch.q ?? params.get("q") ?? "",
      ordering: patch.ordering ?? params.get("ordering") ?? "-created",
      page: String(patch.page ?? params.get("page") ?? "1"),
      page_size: String(patch.page_size ?? params.get("page_size") ?? "12"),
    };
    setParams(next, { replace: true });
  };

  const debouncedSetUrlParams = useMemo(
    () => debounce(setUrlParams, 450),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // когда меняется query (в инпуте) — дебаунсим запись в URL и сбрасываем на 1-ю страницу
  useEffect(() => {
    debouncedSetUrlParams({ q: query, page: 1 });
  }, [query, debouncedSetUrlParams]);

  // загрузка данных при изменении URL-параметров
  useEffect(() => {
    const abort = new AbortController();
    const run = async () => {
      setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const data = await listJournals({
          search: initial.q || undefined,
          ordering: initial.ordering || undefined,
          page: initial.page || 1,
          page_size: initial.page_size || 12,
        });
        setState({
          loading: false,
          error: "",
          count: data?.count ?? (Array.isArray(data) ? data.length : 0),
          results: data?.results ?? (Array.isArray(data) ? data : []),
        });
      } catch (e) {
        setState({
          loading: false,
          error:
            e?.response?.data?.detail ||
            e?.message ||
            "Не удалось загрузить журналы.",
          count: 0,
          results: [],
        });
      }
    };
    run();
    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.q, initial.ordering, initial.page, initial.page_size]);

  // вычисляем пагинацию
  const totalPages = Math.max(
    1,
    Math.ceil((state.count || 0) / (initial.page_size || 12))
  );
  const canPrev = initial.page > 1;
  const canNext = initial.page < totalPages;

  const goPage = (p) =>
    setUrlParams({ page: Math.min(Math.max(1, p), totalPages) });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Журналы
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Просматривайте каталог журналов до регистрации.
            </p>
          </div>

          {/* Контролы: поиск, сортировка, page_size */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {/* Search */}
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по названию, ISSN…"
                className="w-full sm:w-72 rounded-lg border px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Ordering */}
            <div className="relative">
              <select
                value={initial.ordering}
                onChange={(e) =>
                  setUrlParams({ ordering: e.target.value, page: 1 })
                }
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                title="Сортировка"
              >
                <option value="-created">Сначала новые</option>
                <option value="created">Сначала старые</option>
                <option value="title">Название A–Z</option>
                <option value="-title">Название Z–A</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Page size */}
            <select
              value={String(initial.page_size)}
              onChange={(e) =>
                setUrlParams({ page_size: Number(e.target.value), page: 1 })
              }
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
              title="На странице"
            >
              {[12, 24, 36, 48].map((n) => (
                <option key={n} value={n}>
                  {n} на странице
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Список / Скелетоны / Ошибка / Пусто */}
        {state.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: initial.page_size || 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : state.error ? (
          <div className="rounded-xl border p-6 text-red-600">
            Ошибка: {state.error}
          </div>
        ) : state.results.length === 0 ? (
          <div className="rounded-xl border p-10 text-center text-muted-foreground">
            По вашему запросу ничего не найдено.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {state.results.map((j) => (
                <li key={j.id || j.slug || j.title} className="py-2">
                  <JournalCard j={j} />
                </li>
              ))}
            </ul>
            {/* PAGINATION */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Найдено: {state.count}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goPage(initial.page - 1)}
                  disabled={!canPrev}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </Button>

                {/* короткая полоска страниц */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages })
                    .slice(
                      Math.max(0, initial.page - 3),
                      Math.max(0, initial.page - 3) + 5
                    )
                    .map((_, idx) => {
                      const p =
                        Math.max(1, initial.page - 2) + idx > totalPages
                          ? totalPages - (5 - 1 - idx)
                          : Math.max(1, initial.page - 2) + idx;
                      const pageNum = Math.min(Math.max(1, p), totalPages);
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === initial.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => goPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goPage(initial.page + 1)}
                  disabled={!canNext}
                  className="gap-1"
                >
                  Вперёд
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* подсказка снизу */}
        <div className="mt-10">
          <div className="rounded-xl border p-4 text-sm text-muted-foreground">
            Подсказка: нажмите на «О журнале», чтобы посмотреть описание,
            выпуски и инструкции для авторов.
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
