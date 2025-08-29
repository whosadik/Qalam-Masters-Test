// src/pages/moderator/ModeratorDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2 ,
  Plus,
  Edit3,
  Eye,
  FilePlus2,
  Star,
  Calendar,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { http, withParams, tokenStore } from "@/lib/apiClient";
import { API } from "@/constants/api";

// ── helpers: images/urls ─────────────────────────────────────
const pickFirst = (obj, keys = []) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};

const resolveImageUrl = (raw) => {
  if (!raw) return "";
  const url = String(raw).trim();
  // абсолютная ссылка / data-uri — возвращаем как есть
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;
  // если начинается с / — считаем, что это корректный абсолютный путь на текущем домене
  if (url.startsWith("/")) return url;
  // иначе пробуем склеить с бекенд-оригином из env (или молча вернём как есть)
  const origin = import.meta.env.VITE_BACKEND_ORIGIN || "";
  return origin ? `${origin.replace(/\/$/, "")}/${url.replace(/^\//, "")}` : url;
};

const OrgLogo = ({ org }) => {
  // поддерживаем несколько возможных полей от API
  const rawLogo =
    pickFirst(org, ["logo", "logo_url", "logoUrl", "image", "avatar", "picture"]) ||
    ""; // any fallback field
  const src = resolveImageUrl(rawLogo);

  if (!src) {
    // fallback: круглая «плашка» с инициалом
    const ch = (org?.title || "O").trim().charAt(0).toUpperCase();
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
        <span className="text-white font-bold">{ch}</span>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white ring-1 ring-slate-200 flex items-center justify-center">
      <img
        src={src}
        alt={org?.title || "Организация"}
        className="w-full h-full object-contain"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.style.display = "none";
          // показываем fallback-инициал, если картинка не загрузилась
          e.currentTarget.parentElement.innerHTML =
            `<div class="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
               <span class="text-white font-bold">${(org?.title || "O").trim().charAt(0).toUpperCase()}</span>
             </div>`;
        }}
      />
    </div>
  );
};

const JournalCover = ({ journal }) => {
 const raw =
    pickFirst(journal, [
      "logo", "logo_url", "logoUrl",     // ← главное
      "cover", "cover_url", "coverUrl",  // ← на случай старых данных
      "image", "image_url", "thumbnail"
    ]) || "";
  const src = resolveImageUrl(raw);
  const title = journal?.title || "Журнал";

  return (
    <div className="w-32 sm:w-36 h-44 sm:h-48 rounded-md overflow-hidden relative flex-shrink-0 bg-indigo-50">
      {src ? (
        <img
          src={src}
          alt={`${title} — обложка`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.innerHTML =
              `<div class="w-full h-full flex items-center justify-center">
                 <span class="text-2xl font-bold text-indigo-600">${(title || "J")
                   .trim()
                   .charAt(0)
                   .toUpperCase()}</span>
               </div>`;
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-2xl font-bold text-indigo-600">
            {(title || "J").trim().charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      {journal?.issn && (
        <div className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
          ISSN: {journal.issn}
        </div>
      )}
    </div>
  );
};


/* === помощники для JWT (base64url) === */
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}
function getMyIdFromJWT() {
  const t = tokenStore.access;
  if (!t) return null;
  const p = decodeJwtPayload(t);
  if (!p) return null;
  const raw = p.user_id ?? p.sub ?? p.id ?? p.uid ?? null;
  return raw != null ? Number(raw) : null;
}

export default function ModeratorDashboard() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // вычисляем свой id из токена (а не из me)
  const myId = getMyIdFromJWT();

  // 1) гард доступа
  const [allowed, setAllowed] = useState(null); // null = проверяем, true/false

  // 2) данные страницы
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orgs, setOrgs] = useState([]); // [{ org, journals }]

  // ── A. ПРОВЕРКА ПРАВ ДОСТУПА ─────────────────────────────────
  useEffect(() => {
    let mounted = true;

    (async () => {
      // если не можем определить свой id — нет доступа
      if (!myId) {
        mounted && setAllowed(false);
        return;
      }

      try {
        // mine=true → fallback ?user=
        let resp;
        try {
          resp = await http.get(`${API.ORG_MEMBERSHIPS}?mine=true&page_size=1`);
        } catch {
          resp = await http.get(
            `${API.ORG_MEMBERSHIPS}?user=${myId}&page_size=50`
          );
        }

        const rows = Array.isArray(resp?.data)
          ? resp.data
          : Array.isArray(resp?.data?.results)
            ? resp.data.results
            : [];

        const isAdmin = rows.some(
          (m) =>
            ["admin", "owner", "moderator"].includes(String(m.role)) &&
            Number(m.user) === myId
        );

        mounted && setAllowed(isAdmin);
      } catch {
        mounted && setAllowed(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [myId]); // важно: завязываемся на myId, а не на me?.id

  // если доступа нет — уводим
  useEffect(() => {
    if (allowed === false) {
      navigate("/author-dashboard", { replace: true });
    }
  }, [allowed, navigate]);

  // ── B. ЗАГРУЗКА ДАННЫХ (только при allowed === true) ─────────
  useEffect(() => {
    if (allowed !== true || !myId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");

      try {
        // свои членства
        let membResp;
        try {
          membResp = await http.get(
            withParams(API.ORG_MEMBERSHIPS, { mine: "true", page_size: 200 })
          );
        } catch {
          membResp = await http.get(
            withParams(API.ORG_MEMBERSHIPS, { user: myId, page_size: 200 })
          );
        }

        const all = Array.isArray(membResp?.data)
          ? membResp.data
          : Array.isArray(membResp?.data?.results)
            ? membResp.data.results
            : [];

        const memberships = all.filter(
          (m) =>
            Number(m.user) === myId &&
            ["admin", "owner", "moderator"].includes(String(m.role))
        );

        if (memberships.length === 0) {
          mounted && setOrgs([]);
          mounted && setLoading(false);
          return;
        }

        // грузим организации  журналы
        const items = [];
        for (const m of memberships) {
          const orgId = m.organization ?? m.organization_id;
          if (!orgId) continue;

          try {
            const { data: orgDetail } = await http.get(API.ORG_ID(orgId));

            let jList = [];
            try {
              const urlA = withParams(API.JOURNALS, { organization: orgId });
              const { data: ja } = await http.get(urlA);
              jList = Array.isArray(ja?.results)
                ? ja.results
                : Array.isArray(ja)
                  ? ja
                  : [];
            } catch {
              const urlB = withParams(API.JOURNALS, { organization_id: orgId });
              const { data: jb } = await http.get(urlB);
              jList = Array.isArray(jb?.results)
                ? jb.results
                : Array.isArray(jb)
                  ? jb
                  : [];
            }

            items.push({ org: orgDetail, journals: jList });
          } catch (err) {
            console.error("Ошибка при загрузке организации", orgId, err);
          }
        }

        mounted && setOrgs(items);
      } catch (e) {
        if (!mounted) return;
        let msg =
          e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          "Не удалось загрузить данные модератора";
        if (e?.response?.status === 401) msg = "Сессия истекла. Войдите снова.";
        if (e?.response?.status === 403) msg = "У вас нет прав модератора.";
        setError(String(msg));
        setOrgs([]);
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [allowed, myId]);

  // ── helpers ──────────────────────────────────────────────────
  const safeArray = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

   const frequencyLabel = (f) =>
    ({
      daily: "Ежедневно",
      weekly: "Еженедельно",
      monthly: "Ежемесячно",
      quarterly: "Ежеквартально",
      annually: "Ежегодно",
    })[f] || "—";

  const journalProgress = (j) => {
    const fields = [
      "title",
      "description",
      "mission",
      "audience",
      "ethics",
      "cover",
    ];
    let filled = fields.filter((k) => String(j?.[k] || "").trim()).length;
    if (safeArray(j?.topics).length) filled += 1;
    if (Array.isArray(j?.editorial) && j.editorial.length) filled += 1;

    const total = fields.length + 2;
    return Math.round((filled / total) * 100);
  };

  const journalStatus = (pct) =>
    pct >= 80
      ? { label: "Готов к публикации", cls: "bg-emerald-100 text-emerald-800" }
      : pct >= 40
        ? { label: "Заполняется", cls: "bg-amber-100 text-amber-800" }
        : { label: "Черновик", cls: "bg-slate-100 text-slate-700" };

  const handleCreateOrg = () => navigate("/moderator/organizations/new");

  // ── render guards ────────────────────────────────────────────
  if (allowed === null)
    return <div className="p-6 text-gray-500">Проверка прав…</div>;
  // if allowed === false → редирект произойдёт в useEffect

  if (loading) return <div className="p-6 text-gray-500">Загрузка…</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
        <Button onClick={() => window.location.reload()}>Повторить</Button>
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Модератор</h1>
            <p className="text-gray-600">
              У вас нет организаций, где вы админ. Создайте свою.
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <Building2 className="w-12 h-12 text-blue-600" />
            <h2 className="text-xl font-semibold">Создайте организацию</h2>
            <p className="text-gray-600 max-w-xl">
              Заполните основные данные (название, руководитель, контакты).
            </p>
            <Button size="lg" className="gap-2" onClick={handleCreateOrg}>
              <Plus className="w-4 h-4" /> Создать организацию
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── основной контент ─────────────────────────────────────────
  return (
    <div className="space-y-10">
      {orgs.map(({ org, journals }) => {
        const completeness = (() => {
          const fields = [
            "title",
            "description",
            "head_name",
            "head_phone",
            "head_email",
            "address",
            "bin",
          ];
          const filled = fields.filter(
            (f) => String(org?.[f] ?? "").trim().length > 0
          ).length;
          return Math.round((filled / fields.length) * 100);
        })();

        const stats = {
          journals: journals.length,
          avgRating: journals.length ? 4.6 : 0,
          updatedAt: org?.updated_at
            ? new Date(org.updated_at).toLocaleDateString("ru-RU")
            : "—",
        };

        return (
          <div key={org.id} className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                     <OrgLogo org={org} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {org.title || "Организация"}
                  </h1>
                  <p className="text-gray-600">
                    Управление журналами и данными организации
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/moderator/organizations/${org.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" /> Просмотр
                  </Button>
                </Link>
                <Link to={`/moderator/organizations/${org.id}/edit`}>
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
                  <span className="text-3xl font-bold">{completeness}%</span>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-slate-700 text-white">
                <CardContent className="p-5">
                  <p className="opacity-90">Обновлено</p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                    <Calendar className="w-6 h-6" /> {stats.updatedAt}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Журналы */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Журналы</h2>
              <Link to={`/moderator/organizations/${org.id}/add-journal`}>
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
                            <JournalCover journal={j} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-lg leading-tight truncate">
                                  {j.title || "Без названия"}
                                </h3>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded shrink-0 ${st.cls}`}
                                >
                                  {st.label}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 mt-0.5">
                                Язык: {j.language?.toUpperCase() || "—"} •
                                Периодичность: {frequencyLabel(j.frequency)}{" "}
                                • Создан:{" "}
                                {j.created_at
                                  ? new Date(j.created_at).toLocaleDateString(
                                      "ru-RU"
                                    )
                                  : "—"}
                              </div>

                              <div className="mt-3 max-w-xl">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600">
                                    Заполненность
                                  </span>
                                  <span className="font-medium">{pct}%</span>
                                </div>
                                <Progress value={pct} />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 self-center shrink-0">
                              <Link to={`/moderator/journals/${j.id}`}>
                                <Button size="sm" className="w-36">
                                  Открыть
                                </Button>
                              </Link>
                              <Link to={`/moderator/journals/${j.id}/settings`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-36"
                                >
                                  Настройки
                                </Button>
                              </Link>
                              <Link
                                to={`/moderator/journals/${j.id}/reviewers`}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-36"
                                >
                                  Рецензенты
                                </Button>
                              </Link>
                              <Link to={`/moderator/journals/${j.id}/workflow`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-36"
                                >
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
      })}
    </div>
  );
}
