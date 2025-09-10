// src/pages/moderator/ModeratorDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, Plus, Eye, FilePlus2, Star, Calendar } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { http, tokenStore, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import OrgMembersManager from "@/components/organizations/OrgMembersManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ── helpers: images/urls ─────────────────────────────────── */
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
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;
  if (url.startsWith("/")) return url;
  const origin = import.meta.env.VITE_BACKEND_ORIGIN || "";
  return origin
    ? `${origin.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
    : url;
};

const OrgLogo = ({ org }) => {
  const rawLogo =
    pickFirst(org, [
      "logo",
      "logo_url",
      "logoUrl",
      "image",
      "avatar",
      "picture",
    ]) || "";
  const src = resolveImageUrl(rawLogo);

  if (!src) {
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
          e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600">
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
      "logo",
      "logo_url",
      "logoUrl",
      "cover",
      "cover_url",
      "coverUrl",
      "image",
      "image_url",
      "thumbnail",
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
            e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center">
                 <span class="text-2xl font-bold text-indigo-600">${(title || "J").trim().charAt(0).toUpperCase()}</span>
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

/* === JWT helpers === */
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

/* === журнал: заполненность === */
const isFilled = (v) =>
  v !== null && v !== undefined && String(v).trim().length > 0;

const REQUIRED_JOURNAL_FIELDS = [
  "title",
  "email",
  "language",
  "frequency",
  "year",
];
const OPTIONAL_JOURNAL_FIELDS = [
  "description",
  "phone",
  "address",
  "issn",
  "target_audience",
  "logo",
];
const FIELD_LABELS = {
  title: "Название",
  description: "Описание",
  email: "Email",
  language: "Язык",
  frequency: "Периодичность",
  year: "Год основания",
  phone: "Телефон",
  address: "Адрес",
  issn: "ISSN",
  target_audience: "Целевая аудитория",
  logo: "Обложка",
};

function journalCompletenessFromAPI(j) {
  const reqFilled = REQUIRED_JOURNAL_FIELDS.filter((k) =>
    isFilled(j?.[k])
  ).length;
  const optFilled = OPTIONAL_JOURNAL_FIELDS.filter((k) =>
    isFilled(j?.[k])
  ).length;
  const total = REQUIRED_JOURNAL_FIELDS.length + OPTIONAL_JOURNAL_FIELDS.length;
  const pct = Math.round(((reqFilled + optFilled) / total) * 100);
  return Math.max(0, Math.min(100, pct));
}

function journalMissingFields(j) {
  const missing = [];
  [...REQUIRED_JOURNAL_FIELDS, ...OPTIONAL_JOURNAL_FIELDS].forEach((f) => {
    if (!isFilled(j?.[f])) missing.push(FIELD_LABELS[f] || f);
  });
  return missing;
}

/* === доступные редакционные роли === */
const EDITORIAL_ROLES = new Set([
  "chief_editor",
  "editor",
  "manager",
  "proofreader",
  "secretary",
  // reviewer — не даём модераторский доступ
]);

/* === сетевые помощники === */
// страницы по /journals/journals/ (только листинг — без /{id}/!)
async function fetchAllJournals({ pageSize = 100, maxPages = 30 } = {}) {
  const all = [];
  let page = 1;
  for (let i = 0; i < maxPages; i++) {
    try {
      const url = withParams(API.JOURNALS, { page, page_size: pageSize });
      const { data } = await http.get(url);
      const chunk = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      all.push(...chunk);
      if (!data?.next || chunk.length === 0) break;
      page += 1;
    } catch (e) {
      // если бэк даёт 500 — прекращаем листинг и возвращаем то, что собрали
      console.warn("journals list failed on page", page, e);
      break;
    }
  }
  return all;
}

async function fetchAllOrgMemberships({ pageSize = 100, maxPages = 30 } = {}) {
  const all = [];
  let page = 1;
  for (let i = 0; i < maxPages; i++) {
    const { data } = await http.get(API.ORG_MEMBERSHIPS, {
      params: { page, page_size: pageSize },
    });
    const chunk = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];
    all.push(...chunk);
    if (!data?.next || chunk.length === 0) break;
    page += 1;
  }
  return all;
}

async function fetchAllJournalMemberships({
  pageSize = 100,
  maxPages = 50,
} = {}) {
  const all = [];
  let page = 1;
  for (let i = 0; i < maxPages; i++) {
    const { data } = await http.get(API.JOURNAL_MEMBERSHIPS, {
      params: { page, page_size: pageSize },
    });
    const chunk = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];
    all.push(...chunk);
    if (!data?.next || chunk.length === 0) break;
    page += 1;
  }
  return all;
}

export default function ModeratorDashboard() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const myId = getMyIdFromJWT();

  // 1) гард доступа
  const [allowed, setAllowed] = useState(null);

  // 2) данные страницы
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orgs, setOrgs] = useState([]); // [{ org, journals }]

  /* ── A. Проверка прав доступа ─────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!myId) {
        mounted && setAllowed(false);
        return;
      }
      try {
        const [orgMs, jmAll] = await Promise.all([
          fetchAllOrgMemberships({ pageSize: 100 }),
          fetchAllJournalMemberships({ pageSize: 200 }),
        ]);

        const isOrgAdmin = orgMs.some((m) => {
          const uid = Number(m?.user?.id ?? m?.user_id ?? m?.user);
          return uid === myId && String(m.role) === "admin";
        });

        const hasEditorialRole = jmAll.some(
          (m) =>
            (m.user == null || Number(m.user) === myId) &&
            EDITORIAL_ROLES.has(String(m.role))
        );

        mounted && setAllowed(isOrgAdmin || hasEditorialRole);
      } catch {
        mounted && setAllowed(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [myId]);

  // если доступа нет — уводим
  useEffect(() => {
    if (allowed === false) {
      navigate("/author-dashboard", { replace: true });
    }
  }, [allowed, navigate]);

  /* ── B. Загрузка данных ───────────────────────────────────── */
  useEffect(() => {
    if (allowed !== true || !myId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");

      try {
        // мои орг.админки и все мои журнал-мембершипы
        const [orgMs, jmAll] = await Promise.all([
          fetchAllOrgMemberships({ pageSize: 100 }),
          fetchAllJournalMemberships({ pageSize: 300 }),
        ]);

        const myOrgAdmins = orgMs.filter((m) => {
          const uid = Number(m?.user?.id ?? m?.user_id ?? m?.user);
          return uid === myId && String(m.role) === "admin";
        });
        const myEditorialJids = new Set(
          jmAll
            .filter(
              (m) =>
                (m.user == null || Number(m.user) === myId) &&
                EDITORIAL_ROLES.has(String(m.role))
            )
            .map((m) => m.journal)
            .filter(Boolean)
        );

        // тянем все журналы (листинг; если упадёт — будет пусто, но страница откроется)
        const allJournals = await fetchAllJournals({ pageSize: 100 });

        // карта журналов по id
        const journalById = new Map(allJournals.map((j) => [Number(j.id), j]));

        // сгруппируем по организациям
        const byOrgId = new Map();

        // A) организации, где я админ: показываем все журналы этой org
        for (const m of myOrgAdmins) {
          const orgId = Number(m.organization);
          if (!orgId) continue;

          try {
            const { data: orgDetail } = await http.get(API.ORG_ID(orgId));
            const jOfOrg = allJournals.filter(
              (j) => Number(j.organization) === orgId
            );
            byOrgId.set(orgId, { org: orgDetail, journals: jOfOrg });
          } catch (err) {
            console.warn("Не удалось загрузить организацию", orgId, err);
          }
        }

        // B) журналы, где у меня редакционная роль (даже если я не админ org)
        for (const jId of myEditorialJids) {
          const jDetail = journalById.get(Number(jId));
          if (!jDetail) continue; // если не попал в листинг или битый — пропускаем

          const orgId = Number(jDetail.organization);
          if (!orgId) continue;

          if (!byOrgId.has(orgId)) {
            // подтянем организацию (деталь) и добавим журнал
            try {
              const { data: orgDetail } = await http.get(API.ORG_ID(orgId));
              byOrgId.set(orgId, { org: orgDetail, journals: [jDetail] });
            } catch {
              // если не удалось — пропустим
            }
          } else {
            const entry = byOrgId.get(orgId);
            if (
              !entry.journals.some((x) => Number(x.id) === Number(jDetail.id))
            ) {
              entry.journals.push(jDetail);
            }
          }
        }

        const items = [...byOrgId.values()];
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

  /* ── UI helpers ───────────────────────────────────────────── */
  const frequencyLabel = (f) =>
    ({
      daily: "Ежедневно",
      weekly: "Еженедельно",
      monthly: "Ежемесячно",
      quarterly: "Ежеквартально",
      annually: "Ежегодно",
    })[f] || "—";

  const journalStatus = (pct) =>
    pct >= 80
      ? { label: "Готов к публикации", cls: "bg-emerald-100 text-emerald-800" }
      : pct >= 40
        ? { label: "Заполняется", cls: "bg-amber-100 text-amber-800" }
        : { label: "Черновик", cls: "bg-slate-100 text-slate-700" };

  const handleCreateOrg = () => navigate("/moderator/organizations/new");

  /* ── render guards ────────────────────────────────────────── */
  if (allowed === null)
    return <div className="p-6 text-gray-500">Загрузка…</div>;
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
              У вас нет организаций или журналов с правами модерации. Создайте
              свою организацию или попросите доступ.
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

  /* ── основной контент ─────────────────────────────────────── */
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
          orgRating: org.rating,
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
                    <Eye className="w-4 h-4" /> Профиль организации
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
                  <p className="opacity-90">Рейтинг организации</p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                    {stats.orgRating || "—"} <Star className="w-6 h-6" />
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-emerald-600 text-white">
                <CardContent className="p-5">
                  <p className="opacity-90">Статус</p>
                  <p className="text-3xl font-bold">
                    {org.is_active ? "Активна" : "Не активна"}
                  </p>
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
            {/* Вкладки по организации */}
            <Tabs defaultValue="journals" className="mt-2">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="journals">Журналы</TabsTrigger>
                <TabsTrigger value="members">Участники</TabsTrigger>
              </TabsList>

              {/* Вкладка ЖУРНАЛЫ (то, что уже было) */}
              <TabsContent value="journals" className="space-y-4">
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
                          const pct = journalCompletenessFromAPI(j);
                          const st = journalStatus(pct);
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
                                      ? new Date(
                                          j.created_at
                                        ).toLocaleDateString("ru-RU")
                                      : "—"}
                                  </div>
                                  <div className="mt-3 max-w-xl">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-gray-600">
                                        Заполненность
                                      </span>
                                      <span className="font-medium">
                                        {pct}%
                                      </span>
                                    </div>
                                    <Progress value={pct} />
                                    {pct < 100 && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        <p className="font-medium mb-1">
                                          Советы для заполнения:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-0.5">
                                          {journalMissingFields(j)
                                            .slice(0, 4)
                                            .map((field) => (
                                              <li key={field}>
                                                Добавьте {field}
                                              </li>
                                            ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 self-center shrink-0">
                                  <Link to={`/moderator/journals/${j.id}`}>
                                    <Button size="sm" className="w-36">
                                      Открыть
                                    </Button>
                                  </Link>
                                  <Link
                                    to={`/moderator/journals/${j.id}/settings`}
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-36"
                                    >
                                      Настройки
                                    </Button>
                                  </Link>
                                  <Link to={`/moderator/journals/${j.id}/team`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-36"
                                    >
                                      Команда журнала
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
              </TabsContent>

              {/* Вкладка УЧАСТНИКИ */}
              <TabsContent value="members" className="space-y-4">
                <h2 className="text-xl font-semibold">Участники организации</h2>
                <OrgMembersManager orgId={org.id} />
              </TabsContent>
            </Tabs>
          </div>
        );
      })}
    </div>
  );
}
