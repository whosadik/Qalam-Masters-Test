// src/pages/moderator/ModeratorDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Plus,
  Edit3,
  Eye,
  FilePlus2,
  Star,
  Calendar,
} from "lucide-react";

// ── простое локальное "хранилище" (без бэка)
const KEY_ORG = "myOrg";
const KEY_JOURNALS = "myOrgJournals";

function loadOrg() {
  try {
    return JSON.parse(localStorage.getItem(KEY_ORG) || "null");
  } catch {
    return null;
  }
}
function saveOrg(org) {
  localStorage.setItem(KEY_ORG, JSON.stringify(org));
}
function loadJournals() {
  try {
    return JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
  } catch {
    return [];
  }
}
function saveJournals(arr) {
  localStorage.setItem(KEY_JOURNALS, JSON.stringify(arr));
}

export default function ModeratorDashboard() {
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    setOrg(loadOrg());
    setJournals(loadJournals());
  }, []);

  const completeness = useMemo(() => {
    if (!org) return 0;
    // грубая оценка заполненности
    const fields = [
      "name",
      "description",
      "head",
      "phone",
      "email",
      "address",
      "bin",
    ];
    const filled = fields.filter(
      (f) => String(org?.[f] || "").trim().length > 0
    ).length;
    return Math.round((filled / fields.length) * 100);
  }, [org]);

  const stats = useMemo(
    () => ({
      journals: journals.length,
      avgRating: journals.length ? 4.6 : 0, // мок
      updatedAt: org?.updatedAt || "—",
    }),
    [journals.length, org?.updatedAt]
  );

  // helpers
  const safeArray = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

  const periodicityLabel = (p) =>
    ({
      monthly: "Ежемесячно",
      quarterly: "Ежеквартально",
      biannual: "2 раза в год",
      annual: "Ежегодно",
    })[p] || "—";

  const journalProgress = (j) => {
    const fields = [
      "name",
      "description",
      "mission",
      "audience",
      "ethics",
      "coverUrl",
    ];
    let filled = fields.filter((k) => String(j?.[k] || "").trim()).length;
    if (safeArray(j?.topics).length) filled++;
    if (Array.isArray(j?.editorial) && j.editorial.length) filled++;
    const total = fields.length + 2; // topics + editorial
    return Math.round((filled / total) * 100);
  };

  const journalStatus = (pct) =>
    pct >= 80
      ? { label: "Готов к публикации", cls: "bg-emerald-100 text-emerald-800" }
      : pct >= 40
        ? { label: "Заполняется", cls: "bg-amber-100 text-amber-800" }
        : { label: "Черновик", cls: "bg-slate-100 text-slate-700" };

  const handleCreateOrg = () => {
    // перенаправляем на твою существующую страницу создания
    navigate("/moderator/organizations/new");
  };

  const handleAddJournal = (j) => {
    const next = [
      ...journals,
      {
        id: Date.now(),
        name: j.name,
        issn: j.issn,
        lang: "ru",
        periodicity: "quarterly",
        createdAt: new Date().toLocaleDateString("ru-RU"),
        orgId: org?.id || 1,
      },
    ];
    setJournals(next);
    saveJournals(next);
  };

  // ── пустое состояние (нет организации)
  if (!org) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Модератор организации
            </h1>
            <p className="text-gray-600">
              У вас ещё нет профиля организации. Создайте его — и сможете
              добавлять свои журналы.
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <Building2 className="w-12 h-12 text-blue-600" />
            <h2 className="text-xl font-semibold">
              Создайте профиль вашей организации
            </h2>
            <p className="text-gray-600 max-w-xl">
              Заполните основные данные (название, руководитель, контакты).
              После создания вы сможете добавить журнал(ы) вашей организации.
            </p>
            <Button size="lg" className="gap-2" onClick={handleCreateOrg}>
              <Plus className="w-4 h-4" /> Создать организацию
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── обычный режим (организация уже есть)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <p className="text-gray-600">
              Ваш профиль организации • управляйте журналами и данными
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/moderator/organizations/${org.id || 1}`}>
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" /> Просмотр
            </Button>
          </Link>
          <Link to={`/moderator/organizations/${org.id || 1}/edit`}>
            <Button className="gap-2">
              <Edit3 className="w-4 h-4" /> Редактировать
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-blue-600 text-white">
          <CardContent className="p-5">
            <p className="opacity-90">Журналов</p>
            <p className="text-3xl font-bold">{stats.journals}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-600 text-white">
          <CardContent className="p-5">
            <p className="opacity-90">Средний рейтинг</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              {stats.avgRating || "—"} <Star className="w-6 h-6" />
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-600 text-white">
          <CardContent className="p-5">
            <p className="opacity-90">Заполненность профиля</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold">{completeness}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-slate-700 text-white">
          <CardContent className="p-5">
            <p className="opacity-90">Обновлено</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6" /> {org.updatedAt || "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Прогресс заполнения */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              Заполненность профиля организации
            </span>
            <span className="font-medium">{completeness}%</span>
          </div>
          <Progress value={completeness} />
          <p className="text-sm text-gray-500 mt-2">
            Заполните все поля профиля (описание, руководитель, контакты, адрес,
            БИН), чтобы улучшить видимость вашей организации.
          </p>
        </CardContent>
      </Card>

      {/* Журналы организации */}
      {/* Журналы организации */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Журналы организации</h2>
        <Link to={`/moderator/organizations/${org.id || 1}/add-journal`}>
          <Button className="gap-2">
            <FilePlus2 className="w-4 h-4" /> Создать журнал
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {journals.length === 0 ? (
            <div className="p-6 text-gray-500">
              Пока нет журналов. Добавьте первый.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {journals.map((j) => {
                const pct = journalProgress(j);
                const st = journalStatus(pct);
                const topics = safeArray(j.topics).slice(0, 3);
                const more = Math.max(
                  0,
                  safeArray(j.topics).length - topics.length
                );

                return (
                  <li
                    key={j.id}
                    className="p-4 hover:bg-slate-50/70 transition rounded-lg mx-2 my-2"
                  >
                    <div className="flex items-stretch gap-4">
                      {/* mini-cover */}
                      <div className="w-32 sm:w-36 h-44 sm:h-48 rounded-md overflow-hidden relative flex-shrink-0 bg-indigo-50">
                        {j.coverUrl ? (
                          <img
                            src={j.coverUrl}
                            alt="cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-indigo-600">
                              {(j.name || "J")[0]}
                            </span>
                          </div>
                        )}
                        {j.issn && (
                          <div className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                            ISSN: {j.issn}
                          </div>
                        )}
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg leading-tight truncate">
                            {j.name || "Без названия"}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded shrink-0 ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mt-0.5">
                          Язык: {j.lang?.toUpperCase() || "—"} • Периодичность:{" "}
                          {periodicityLabel(j.periodicity)} • Создан:{" "}
                          {j.createdAt}
                        </div>

                        {topics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {topics.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                              >
                                {t}
                              </span>
                            ))}
                            {more > 0 && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                +{more}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-3 max-w-xl">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Заполненность</span>
                            <span className="font-medium">{pct}%</span>
                          </div>
                          <Progress value={pct} />
                        </div>
                      </div>

                      {/* actions */}
                      <div className="flex flex-col gap-2 self-center shrink-0">
                        <Link to={`/moderator/journals/${j.id}`}>
                          <Button size="sm" className="w-36">
                            Открыть
                          </Button>
                        </Link>
                        <Link to={`/moderator/journals/${j.id}/settings`}>
                          <Button size="sm" variant="outline" className="w-36">
                            Настройки
                          </Button>
                        </Link>
                        <Link to={`/moderator/journals/${j.id}/reviewers`}>
                          <Button size="sm" variant="outline" className="w-36">
                            Рецензенты
                          </Button>
                        </Link>
                        <Link to={`/moderator/journals/${j.id}/workflow`}>
                          <Button size="sm" variant="outline" className="w-36">
                            Публикационный процесс
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
