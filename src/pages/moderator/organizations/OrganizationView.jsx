// src/pages/moderator/OrganizationView.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganization } from "@/services/organizationsService";
import { listJournals } from "@/services/journalsService";
import {
  Building2,
  Edit3,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Globe,
  Hash,
  Calendar,
  ExternalLink,
  FilePlus2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

function toUrl(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function Initials({ text = "", className = "" }) {
  const t = String(text || "").trim();
  const letters = t
    ? t
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "OR";
  return (
    <div
      className={`h-16 w-16 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold ${className}`}
    >
      {letters}
    </div>
  );
}

function FieldRow({ icon: Icon, label, value, href }) {
  const content = value ? String(value) : "—";
  const common = (
    <>
      <span className="inline-flex items-center gap-2 text-gray-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </span>
      <span className="font-medium">{content}</span>
    </>
  );

  if (href && value) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          {content} <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg">
      {common}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, className = "" }) {
  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-80">{title}</p>
          {Icon ? <Icon className="h-5 w-5 opacity-80" /> : null}
        </div>
        <p className="text-3xl font-bold mt-1">{value ?? "—"}</p>
      </CardContent>
    </Card>
  );
}

export default function OrganizationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [org, setOrg] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const o = await getOrganization(id);
        setOrg(o);

        // если бэк не встраивает журналы — грузим отдельно
        if (Array.isArray(o?.journals)) {
          setJournals(o.journals || []);
        } else {
          try {
            const js = await listJournals({ page_size: 100 });
            const items = js?.results ?? js ?? [];

            const orgIdNum = Number(id);
            const onlyThisOrg = items.filter((j) => {
              const oid =
                Number(j?.organization) ??
                Number(j?.organization_id) ??
                Number(j?.organization?.id);
              return oid === orgIdNum;
            });

            setJournals(onlyThisOrg);
          } catch {
            setJournals([]);
          }
        }
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.error ||
            t("moderator_orgs:organization_view.load_failed", "Не удалось загрузить организацию");
        setErr(String(msg));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updatedAt = useMemo(() => {
    const d = org?.updated_at || org?.modified || org?.updated;
    return d ? new Date(d).toLocaleDateString("ru-RU") : "—";
  }, [org]);

  const websiteUrl = toUrl(org?.website);
  const socials = Array.isArray(org?.social_links)
    ? org.social_links
    : org?.social_link
      ? [org.social_link]
      : [];

  if (loading) return <div className="p-6 text-gray-500">{t("moderator_orgs:organization_view.loading", "Загрузка…")}</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!org)
    return <div className="p-6 text-red-600">
      {t("moderator_orgs:organization_view.not_found", "Организация не найдена")}
    </div>;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {org.logo ? (
            <img
              src={org.logo}
              alt={org.title || t("moderator_orgs:organization_view.logo_alt", "Логотип")}
              className="h-16 w-16 object-cover rounded-xl border"
            />
          ) : (
            <Initials text={org.title} />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {org.title ||
                  t("moderator_orgs:organization_view.org_fallback", "Организация")}
            </h1>
            <p className="text-gray-600">
              {t(
                  "moderator_orgs:organization_view.subtitle",
                  "Профиль организации • просмотр и быстрые действия"
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            {t("moderator_orgs:organization_view.back", "Назад")}
          </Button>
          <Link to={`/moderator/organizations/${id}/edit`}>
            <Button className="gap-2 bg-[#3972FE]">
              <Edit3 className="h-4 w-4" />
              {t("moderator_orgs:organization_view.edit", "Редактировать")}
            </Button>
          </Link>
          <Link to={`/moderator/organizations/${id}/add-journal`}>
            <Button className="gap-2 bg-[#3972FE]">
              <FilePlus2 className="h-4 w-4" />
              {t("moderator_orgs:organization_view.add_journal", "Добавить журнал")}
            </Button>
          </Link>
        </div>
      </div>

      {/* About + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-2">
              {t("moderator_orgs:organization_view.about_org", "О организации")}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {org.description || t(
                  "moderator_orgs:organization_view.no_description",
                  "Описание не заполнено."
              )}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <StatCard
            title={t("moderator_orgs:organization_view.stat_journals", "Журналов")}
            value={journals.length}
            icon={Building2}
            className="bg-blue-600 text-white"
          />
          <StatCard
            title={t("moderator_orgs:organization_view.stat_updated", "Обновлено")}
            value={updatedAt}
            icon={Calendar}
            className="bg-slate-800 text-white"
          />
        </div>
      </div>

      {/* Contacts & Requisites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-1">
            <h3 className="text-lg font-semibold mb-3">
              {t(
                  "moderator_orgs:organization_view.contacts_title",
                  "Контакты и реквизиты"
              )}
            </h3>
            <FieldRow
              icon={Building2}
              label={t("moderator_orgs:organization_view.head", "Руководитель")}
              value={org.head_name}
            />
            <FieldRow
              icon={Phone}
              label={t("moderator_orgs:organization_view.phone", "Телефон")}
              value={org.head_phone}
              href={org.head_phone ? `tel:${org.head_phone}` : undefined}
            />
            <FieldRow
              icon={Mail}
              label="Email"
              value={org.head_email}
              href={org.head_email ? `mailto:${org.head_email}` : undefined}
            />
            <FieldRow icon={Hash} label={t("moderator_orgs:organization_view.bin", "БИН")} value={org.bin} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-1">
            <h3 className="text-lg font-semibold mb-3">
              {t(
                  "moderator_orgs:organization_view.address_title",
                  "Адрес и веб-ресурсы"
              )}
            </h3>
            <FieldRow icon={MapPin} label={t("moderator_orgs:organization_view.address", "Адрес")} value={org.address} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">
                  {t("moderator_orgs:organization_view.country", "Страна")}
                </div>
                <div className="font-medium">{org.country || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">
                  {t("moderator_orgs:organization_view.city", "Город")}
                </div>
                <div className="font-medium">{org.city || "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">
                  {t("moderator_orgs:organization_view.postal", "Индекс")}
                </div>
                <div className="font-medium">
                  {org.postal_code || org.postal_zip || "—"}
                </div>
              </div>
            </div>

            <FieldRow
              icon={Globe}
              label={t("moderator_orgs:organization_view.site", "Сайт")}
              value={websiteUrl || org.website}
              href={websiteUrl}
            />

            {/* Соцсети */}
            <div className="mt-2">
              <div className="inline-flex items-center gap-2 text-gray-500 mb-2">
                <LinkIcon className="h-4 w-4" />
                <span className="text-sm">
                  {t("moderator_orgs:organization_view.socials", "Соцсети")}
                </span>
              </div>
              {socials.length === 0 ? (
                <div className="text-sm text-gray-700">—</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {socials.slice(0, 6).map((s, idx) => {
                    const href = toUrl(s);
                    const label = href
                      ? new URL(href).hostname.replace(/^www\./, "")
                      : s;
                    return (
                      <a
                        key={`${s}-${idx}`}
                        href={href || "#"}
                        target={href ? "_blank" : undefined}
                        rel={href ? "noreferrer" : undefined}
                        className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-1"
                        title={s}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journals */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t("moderator_orgs:organization_view.org_journals", "Журналы организации")}
        </h2>
        <Link to={`/moderator/organizations/${id}/add-journal`}>
          <Button className="gap-2 bg-[#3972FE]">
            <FilePlus2 className="h-4 w-4" />
            {t("moderator_orgs:organization_view.create_journal", "Создать журнал")}
          </Button>
        </Link>
      </div>

      {journals.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-gray-600">
            {t(
                "moderator_orgs:organization_view.no_journals_yet",
                "Пока нет журналов. Добавьте первый."
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {journals.map((j) => {
            const created = j.created_at
              ? new Date(j.created_at).toLocaleDateString("ru-RU")
              : "—";
            const cover = j.cover || j.cover_url;
            const lang = j.language ? String(j.language).toUpperCase() : "—";
            const periodicityMap = {
              monthly: t("moderator_orgs:organization_view.period.monthly", "Ежемесячно"),
              quarterly: t("moderator_orgs:organization_view.period.quarterly", "Ежеквартально"),
              biannual: t("moderator_orgs:organization_view.period.biannual", "2 раза в год"),
              annual: t("moderator_orgs:organization_view.period.annual", "Ежегодно"),
            };
            const period = periodicityMap[j.periodicity] || "—";
            return (
              <Card key={j.id} className="border-0 shadow-sm overflow-hidden">
                <div className="h-40 bg-indigo-50 relative">
                  {cover ? (
                    <img
                      src={cover}
                      alt="cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-indigo-600">
                        {(j.title || "J")[0]}
                      </span>
                    </div>
                  )}
                  {j.issn && (
                    <div className="absolute bottom-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                      ISSN: {j.issn}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight line-clamp-2">
                      {j.title ||
                          t("moderator_orgs:organization_view.no_title", "Без названия")}
                    </h3>
                    {j.status && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                        {j.status}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("moderator_orgs:organization_view.lang", "Язык")}: {lang} •{" "}
                    {t("moderator_orgs:organization_view.periodicity", "Периодичность")}: {period} •{" "}
                    {t("moderator_orgs:organization_view.created_at", "Создан")}: {created}
                  </div>
                  <div className="pt-2">
                    <Link to={`/moderator/journals/${j.id}`}>
                      <Button size="sm" className="w-full">
                        {t("moderator_orgs:organization_view.open", "Открыть")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
