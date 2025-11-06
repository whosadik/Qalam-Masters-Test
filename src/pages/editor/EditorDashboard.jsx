// src/pages/editor/EditorDashboard.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  RefreshCw,
  Search,
  ClipboardList,
  FileEdit,
  Hammer,
  UserPlus,
  PanelRightOpen,
  PanelRightClose,
  CheckSquare,
  Square,
  Filter,
  Keyboard as KeyboardIcon,
  X,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { listArticles, updateArticleStatus } from "@/services/articlesService";
import { listJournalMembers } from "@/services/journalMembershipsService";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useTranslation } from "react-i18next";

/* ---------- helpers ---------- */
const STATUS_LABEL = {
  draft: "Черновик",
  submitted: "Отправлена",
  screening: "Скрининг",
  under_review: "На рецензии",
  revision_minor: "Minor revision",
  revision_major: "Major revision",
  accepted: "Принята",
  rejected: "Отклонена",
  in_production: "В производстве",
  published: "Опубликована",
};
const fmt = (iso) => (iso ? new Date(iso).toLocaleString("ru-RU") : "—");
const ASSIGNMENTS_URL = "/reviews/assignments/";
const isPendingAssignment = (as) => String(as?.status || "") === "assigned";

const STATUS_TW = {
  under_review: "bg-blue-100 text-blue-700",
  revision_minor: "bg-amber-100 text-amber-700",
  revision_major: "bg-rose-100 text-rose-700",
  accepted: "bg-emerald-100 text-emerald-700",
};

function StatusPill({ status }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TW[status] || "bg-slate-100 text-slate-700"}`}
    >
      {status === "draft"
          ? t("dashboards:editor_dashboard.status.draft", "Черновик")
          : status === "submitted"
              ? t("dashboards:editor_dashboard.status.submitted", "Отправлена")
              : status === "screening"
                  ? t("dashboards:editor_dashboard.status.screening", "Скрининг")
                  : status === "under_review"
                      ? t("dashboards:editor_dashboard.status.under_review", "На рецензии")
                      : status === "revision_minor"
                          ? t("dashboards:editor_dashboard.status.revision_minor", "Minor revision")
                          : status === "revision_major"
                              ? t("dashboards:editor_dashboard.status.revision_major", "Major revision")
                              : status === "accepted"
                                  ? t("dashboards:editor_dashboard.status.accepted", "Принята")
                                  : status === "rejected"
                                      ? t("dashboards:editor_dashboard.status.rejected", "Отклонена")
                                      : status === "in_production"
                                          ? t("dashboards:editor_dashboard.status.in_production", "В производстве")
                                          : status === "published"
                                              ? t("dashboards:editor_dashboard.status.published", "Опубликована")
                                              : STATUS_LABEL[status] || status}
    </span>
  );
}

/* ---------- assignments fetch ---------- */
async function fetchAssignmentsFor(articleIds = []) {
  const entries = await Promise.all(
    articleIds.map(async (id) => {
      try {
        const { data } = await http.get(
          withParams(ASSIGNMENTS_URL, {
            article: id,
            page_size: 50,
            ordering: "-created_at",
          })
        );
        const list = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];
        return [id, list];
      } catch (e) {
        console.error("assignments load failed", id, e);
        return [id, []];
      }
    })
  );
  return Object.fromEntries(entries);
}

/* ---------- combobox helpers ---------- */
function labelUser(u) {
  const f = (u?.first_name || "").trim();
  const l = (u?.last_name || "").trim();
  const name = f || l ? `${f} ${l}`.trim() : "Без имени";
  return { name, email: u?.email || "—" };
}

function ReviewerCombobox({
  value,
  onChange,
  options,
  disabledIds = new Set(),
  placeholder = "Выберите пользователя",
}) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const sorted = useMemo(() => {
    return [...options].sort((a, b) => {
      const A = (labelUser(a).name || labelUser(a).email).toLowerCase();
      const B = (labelUser(b).name || labelUser(b).email).toLowerCase();
      return A.localeCompare(B, "ru");
    });
  }, [options]);

  const selected = sorted.find((u) => String(u.id) === String(value));
  const selectedLabel = selected
    ? `${labelUser(selected).name} • ${selected.email}`
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? selectedLabel :
              t(
                  "dashboards:editor_dashboard.reviewer.placeholder",
                  placeholder
              )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={t(
              "dashboards:editor_dashboard.reviewer.search_placeholder",
              "Поиск: имя, email…"
          )} />
          <CommandEmpty>
            {t("dashboards:editor_dashboard.reviewer.empty", "Ничего не найдено.")}
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              {sorted.map((u) => {
                const { name, email } = labelUser(u);
                const isDisabled = disabledIds.has(u.id);
                return (
                  <CommandItem
                    key={u.id}
                    value={`${name} ${email}`}
                    onSelect={() => {
                      if (isDisabled) return;
                      onChange(String(u.id));
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm">{name}</span>
                      <span className="text-xs text-gray-500">{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {String(value) === String(u.id) && (
                        <Check className="h-4 w-4 opacity-80" />
                      )}
                      {isDisabled && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                          {t(
                              "dashboards:editor_dashboard.reviewer.already_assigned",
                              "уже назначен"
                          )}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ---------- inline assign reviewer ---------- */
function AssignReviewerInline({
  articleId,
  journalId,
  organizationId,
  assignmentsForArticle = [],
  journalTeam = [],
  orgMembers = [],
  onAssigned,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [blind, setBlind] = useState(true);
  const [addingToTeam, setAddingToTeam] = useState(true);
  const [showAllOrg, setShowAllOrg] = useState(false);
  const [busy, setBusy] = useState(false);

  const activeAssigned = useMemo(
    () =>
      (assignmentsForArticle || []).filter(
        (x) => String(x.status) === "assigned"
      ),
    [assignmentsForArticle]
  );
  const activeReviewerIds = useMemo(
    () => new Set(activeAssigned.map((a) => a.reviewer)),
    [activeAssigned]
  );

  const usersFromOrg = useMemo(() => {
    const map = new Map();
    for (const m of orgMembers) {
      const u = m?.user ?? m;
      if (u?.id && !map.has(u.id)) map.set(u.id, u);
    }
    return map;
  }, [orgMembers]);

  const journalReviewerIds = useMemo(
    () =>
      new Set(
        journalTeam.filter((m) => m.role === "reviewer").map((m) => m.user)
      ),
    [journalTeam]
  );

  const candidateUsers = useMemo(() => {
    const all = Array.from(usersFromOrg.values());
    return showAllOrg ? all : all.filter((u) => journalReviewerIds.has(u.id));
  }, [usersFromOrg, showAllOrg, journalReviewerIds]);

  const selectedIsNotJournalReviewer = useMemo(
    () => reviewerId && !journalReviewerIds.has(Number(reviewerId)),
    [reviewerId, journalReviewerIds]
  );

  async function submit() {
    if (!reviewerId) return alert(
        t(
            "dashboards:editor_dashboard.reviewer.select_required",
            "Выберите пользователя-рецензента"
        )
    );
    setBusy(true);
    try {
      if (selectedIsNotJournalReviewer && addingToTeam) {
        const { addJournalMember } = await import(
          "@/services/journalMembershipsService"
        );
        await addJournalMember({
          journal: journalId,
          user: Number(reviewerId),
          role: "reviewer",
        });
      }

      const { createAssignment } = await import("@/services/reviewsService");
      await createAssignment({
        article: articleId,
        reviewer: Number(reviewerId),
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
        blind,
      });

      setOpen(false);
      setReviewerId("");
      setDueAt("");
      setBlind(true);
      onAssigned?.();
      alert(
          t(
              "dashboards:editor_dashboard.reviewer.assigned",
              "Рецензент назначен"
          )
      );
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:editor_dashboard.reviewer.assign_failed",
              "Не удалось назначить рецензента"
          ));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        className="w-full justify-center border-dashed bg-slate-50 hover:bg-slate-100 text-slate-800 gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {open ? t(
                "dashboards:editor_dashboard.reviewer.hide_assign",
                "Скрыть назначение"
            )
            : t(
                "dashboards:editor_dashboard.reviewer.assign_button",
                "Назначить рецензента"
            )}
      </Button>

      {open && (
        <div className="rounded-xl border border-dashed bg-slate-50/60 p-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <div className="sm:col-span-2">
              <ReviewerCombobox
                value={reviewerId}
                onChange={setReviewerId}
                options={candidateUsers}
                disabledIds={activeReviewerIds}
                placeholder={
                  showAllOrg
                      ? t(
                          "dashboards:editor_dashboard.reviewer.from_org",
                          "Выберите из организации"
                      )
                      : t(
                          "dashboards:editor_dashboard.reviewer.from_journal",
                          "Выберите из рецензентов журнала"
                      )
                }
              />
              <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showAllOrg}
                    onChange={(e) => setShowAllOrg(e.target.checked)}
                  />
                  {t(
                      "dashboards:editor_dashboard.reviewer.show_all_from_org",
                      "Показать всех из организации"
                  )}
                </label>
              </div>
            </div>

            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="sm:col-span-2 h-9 rounded-md border px-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={blind}
                onChange={(e) => setBlind(e.target.checked)}
              />
              {t("dashboards:editor_dashboard.reviewer.blind", "Blind")}
            </label>
          </div>

          {selectedIsNotJournalReviewer && (
            <div className="text-xs text-gray-700">
              {t(
                  "dashboards:editor_dashboard.reviewer.not_in_team",
                  "Пользователь не является рецензентом журнала."
              )}&nbsp;
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addingToTeam}
                  onChange={(e) => setAddingToTeam(e.target.checked)}
                />
                {t(
                    "dashboards:editor_dashboard.reviewer.add_to_team",
                    "Добавить его в команду журнала как"
                )}{" "}
                <b>reviewer</b>
                {t(
                    "dashboards:editor_dashboard.reviewer.before_assign",
                    "перед назначением"
                )}
              </label>
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Button
              onClick={submit}
              disabled={busy}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {busy ? t(
                      "dashboards:editor_dashboard.reviewer.assigning",
                      "Назначаем..."
                  )
                  : t(
                      "dashboards:editor_dashboard.reviewer.create_assignment",
                      "Создать назначение"
                  )}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t("dashboards:editor_dashboard.common.cancel", "Отмена")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   MAIN DASHBOARD (3-pane)
============================ */
export default function EditorDashboard() {
  const { t } = useTranslation();

  // layout / UI
  const [dense, setDense] = useState(
    () => (localStorage.getItem("ed_dense") ?? "1") === "1"
  );
  const [showRight, setShowRight] = useState(true);
  const [queue, setQueue] = useState("under_review"); // under_review | assigned | revision_minor | revision_major
  const [lastUpdated, setLastUpdated] = useState(null);

  // access / journals
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [journals, setJournals] = useState([]);
  const [journalId, setJournalId] = useState(null);

  // data
  const [loading, setLoading] = useState(false);
  const [urAll, setUrAll] = useState([]); // все under_review
  const [urAssigned, setUrAssigned] = useState([]); // подмножество: есть active assignment
  const [urUnassigned, setUrUnassigned] = useState([]); // подмножество: нет active assignment
  const [revMinor, setRevMinor] = useState([]);
  const [revMajor, setRevMajor] = useState([]);
  const [assignmentsMap, setAssignmentsMap] = useState({});

  // org & team for combobox
  const [orgMembersForJournal, setOrgMembersForJournal] = useState([]);
  const [journalTeam, setJournalTeam] = useState([]);

  // filters
  const [globalQuery, setGlobalQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [pageSize, setPageSize] = useState(50);
  const searchTimer = useRef(null);

  // selection + detail
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailArticle, setDetailArticle] = useState(null);

  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAllVisible = (rows) =>
    setSelectedIds(new Set(rows.map((r) => r.id)));

  const visibleRows = useMemo(() => {
    switch (queue) {
      case "assigned":
        return urAssigned;
      case "revision_minor":
        return revMinor;
      case "revision_major":
        return revMajor;
      default:
        return urUnassigned;
    }
  }, [queue, urAssigned, urUnassigned, revMinor, revMajor]);

  // data loading
  async function loadArticlesForJournal(jid) {
    if (!jid) return;
    setLoading(true);
    try {
      const [u, mi, ma] = await Promise.all([
        listArticles({
          status: "under_review",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
        listArticles({
          status: "revision_minor",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
        listArticles({
          status: "revision_major",
          journal: jid,
          ordering,
          page_size: pageSize,
          search: globalQuery || undefined,
        }),
      ]);

      const norm = (x) =>
        Array.isArray(x?.results) ? x.results : Array.isArray(x) ? x : [];
      const ur = norm(u);
      setRevMinor(norm(mi));
      setRevMajor(norm(ma));

      // assignments for under_review
      const amap = await fetchAssignmentsFor(ur.map((a) => a.id));
      setAssignmentsMap(amap);

      const hasActive = (id) => (amap[id] || []).some(isPendingAssignment);
      setUrAssigned(ur.filter((a) => hasActive(a.id)));
      setUrUnassigned(ur.filter((a) => !hasActive(a.id)));
      setUrAll(ur);

      setLastUpdated(new Date());
      clearSelection();
    } finally {
      setLoading(false);
    }
  }

  // memberships where role === "editor"
  useEffect(() => {
    let mounted = true;
    (async () => {
      setMembershipsLoading(true);
      try {
        const url = withParams(API.JOURNAL_MEMBERSHIPS, {
          mine: true,
          page_size: 300,
        });
        const { data } = await http.get(url);
        const rows = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];
        const my = rows.filter((m) => String(m.role) === "editor" && m.journal);
        const jids = [
          ...new Set(my.map((m) => Number(m.journal)).filter(Boolean)),
        ];

        const fetched = [];
        for (const jid of jids) {
          try {
            const { data: j } = await http.get(API.JOURNAL_ID(jid));
            fetched.push({
              id: Number(j.id),
              title: j.title || t("dashboards:editor_dashboard.journal_fallback", "Журнал #{{id}}", { id: jid }),
              organization: j.organization,
            });
          } catch {
            fetched.push({
              id: Number(jid),
              title: t(
                  "dashboards:editor_dashboard.journal_fallback",
                  "Журнал #{{id}}",
                  { id: jid }
              ),
              organization: null,
            });
          }
        }
        if (!mounted) return;
        setJournals(fetched);
        setJournalId(
          (prev) => prev ?? (fetched.length === 1 ? fetched[0].id : null)
        );
      } finally {
        if (mounted) setMembershipsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // load data on deps
  useEffect(() => {
    if (!journalId) return;
    loadArticlesForJournal(journalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, ordering, pageSize]);

  // global search debounce
  function onGlobalSearch(value) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setGlobalQuery(value);
    searchTimer.current = setTimeout(() => {
      if (journalId) loadArticlesForJournal(journalId);
    }, 400);
  }

  // actions
  async function requestRevision(
    id,
    kind /* "revision_minor" | "revision_major" */
  ) {
    try {
      await updateArticleStatus(id, kind);
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("requestRevision failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:editor_dashboard.errors.request_revision",
              "Не удалось запросить ревизию"
          ));
    }
  }
  async function backToUnderReview(id) {
    try {
      await updateArticleStatus(id, "under_review");
      await loadArticlesForJournal(journalId);
    } catch (e) {
      console.error("backToUnderReview failed", e?.response?.data || e);
      alert(e?.response?.data?.detail ||
          t(
              "dashboards:editor_dashboard.errors.back_to_review",
              "Не удалось вернуть на рецензию"
          ));
    }
  }

  // batch actions (редактору понадобится быстро переводить пачки в minor/major)
  async function bulkMinor(ids) {
    if (!ids.size) return;
    for (const id of [...ids]) await requestRevision(id, "revision_minor");
  }
  async function bulkMajor(ids) {
    if (!ids.size) return;
    for (const id of [...ids]) await requestRevision(id, "revision_major");
  }
  async function bulkBackToUR(ids) {
    if (!ids.size) return;
    for (const id of [...ids]) await backToUnderReview(id);
  }

  // keyboard shortcuts
  const keydown = useCallback(
    (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea";
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("ed_global_search")?.focus();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        journalId && loadArticlesForJournal(journalId);
      }
      if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        const first = [...selectedIds][0];
        if (first) {
          const row = visibleRows.find((r) => r.id === first);
          if (row) {
            setDetailArticle(row);
            setShowRight(true);
          }
        }
      }
      if (
        e.key.toLowerCase() === "m" &&
        selectedIds.size &&
        queue === "under_review"
      ) {
        e.preventDefault();
        bulkMinor(selectedIds);
      }
      if (
        e.key.toLowerCase() === "j" &&
        selectedIds.size &&
        queue === "under_review"
      ) {
        e.preventDefault();
        bulkMajor(selectedIds);
      }
    },
    [journalId, selectedIds, visibleRows, queue]
  );
  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  // org members & journal team for combobox
  useEffect(() => {
    (async () => {
      if (!journalId) return;
      const j = journals.find((x) => Number(x.id) === Number(journalId));
      if (!j?.organization) {
        setOrgMembersForJournal([]);
        setJournalTeam([]);
        return;
      }
      try {
        const teamList = await listJournalMembers(journalId, {
          page_size: 500,
        });
        setJournalTeam(
          Array.isArray(teamList) ? teamList : teamList?.results || []
        );
        // org users
        try {
          const url = withParams("/organizations/memberships/", {
            organization: j.organization,
            page_size: 1000,
          });
          const { data } = await http.get(url);
          const rows = Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data)
              ? data
              : [];
          const users = rows.map((r) => r?.user ?? r).filter(Boolean);
          setOrgMembersForJournal(users);
        } catch (e) {
          console.error("org members load failed", e?.response?.data || e);
          setOrgMembersForJournal([]);
        }
      } catch (e) {
        console.error("load candidates failed", e);
        setJournalTeam([]);
        setOrgMembersForJournal([]);
      }
    })();
  }, [journalId, journals]);

  // guards
  if (membershipsLoading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t(
            "dashboards:editor_dashboard.loading_permissions",
            "Проверяем права редактора…"
        )}
      </div>
    );
  }
  if (!journals.length) {
    return (
      <div className="p-6">
        {t(
            "dashboards:editor_dashboard.no_rights",
            "Нет прав редактора — доступных журналов не найдено."
        )}
      </div>
    );
  }

  const rowPad = dense ? "py-2.5" : "py-4";
  const rowText = dense ? "text-[13px]" : "text-sm";

  // counts
  const counts = {
    under_review: urUnassigned.length,
    assigned: urAssigned.length,
    revision_minor: revMinor.length,
    revision_major: revMajor.length,
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top toolbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t(
                    "dashboards:editor_dashboard.title",
                    "Дашборд редактора"
                )}
              </h1>
              <div className="mt-1 text-xs sm:text-sm text-slate-500">
                {lastUpdated ?
                    t(
                        "dashboards:editor_dashboard.updated_at",
                        "Обновлено: {{time}}",
                        { time: fmt(lastUpdated) }
                    )
                    : "—"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={journalId ? String(journalId) : undefined}
                onValueChange={(v) => setJournalId(Number(v))}
              >
                <SelectTrigger className="w-72 bg-white">
                  <SelectValue placeholder={t(
                      "dashboards:editor_dashboard.select_journal",
                      "Выберите журнал"
                  )} />
                </SelectTrigger>
                <SelectContent>
                  {journals.map((j) => (
                    <SelectItem key={j.id} value={String(j.id)}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ordering} onValueChange={setOrdering}>
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue placeholder={t(
                      "dashboards:editor_dashboard.sorting",
                      "Сортировка"
                  )} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">
                    {t(
                        "dashboards:editor_dashboard.sort.new_old",
                        "Новее → старее"
                    )}
                  </SelectItem>
                  <SelectItem value="created_at">
                    {t(
                        "dashboards:editor_dashboard.sort.old_new",
                        "Старее → новее"
                    )}
                  </SelectItem>
                  <SelectItem value="title">
                    {t(
                        "dashboards:editor_dashboard.sort.title_az",
                        "Заголовок A→Z"
                    )}
                  </SelectItem>
                  <SelectItem value="-title">
                    {t(
                        "dashboards:editor_dashboard.sort.title_za",
                        "Заголовок Z→A"
                    )}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="w-28 bg-white">
                  <SelectValue placeholder={t(
                      "dashboards:editor_dashboard.page_limit",
                      "Порог"
                  )} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {t(
                          "dashboards:editor_dashboard.per_page",
                          "{{count}}/стр",
                          { count: n }
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => journalId && loadArticlesForJournal(journalId)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("dashboards:editor_dashboard.refresh", "Обновить")}
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  setDense((v) => {
                    localStorage.setItem("ed_dense", v ? "0" : "1");
                    return !v;
                  })
                }
              >
                {dense
                    ? t("dashboards:editor_dashboard.density.compact", "Плотно")
                    : t("dashboards:editor_dashboard.density.normal", "Обычно")}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowRight((v) => !v)}
                title={showRight
                    ? t(
                        "dashboards:editor_dashboard.panel.hide_title",
                        "Скрыть панель"
                    )
                    : t(
                        "dashboards:editor_dashboard.panel.show_title",
                        "Показать панель"
                    )
                }
              >
                {showRight ? (
                  <PanelRightClose className="h-4 w-4 mr-2" />
                ) : (
                  <PanelRightOpen className="h-4 w-4 mr-2" />
                )}
                {t("dashboards:editor_dashboard.panel.button", "Панель")}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                id="ed_global_search"
                placeholder={t(
                    "dashboards:editor_dashboard.search_placeholder",
                    "Поиск по заголовку/автору…  (нажмите / чтобы перейти к поиску)"
                )}
                className="pl-9 bg-white"
                value={globalQuery}
                onChange={(e) => onGlobalSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t(
                  "dashboards:editor_dashboard.quick_filters",
                  "Быстрые фильтры"
              )}
            </Button>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 px-2">
              <KeyboardIcon className="h-3.5 w-3.5" />
              {t(
                  "dashboards:editor_dashboard.shortcuts_hint",
                  "/ — поиск, R — обновить, O — детали, M — Вернуть автору"
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Content layout */}
      <div className="mx-auto max-w-[1400px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[260px,1fr,420px] gap-4">
        {/* LEFT: queues */}
        <aside className="rounded-xl border border-slate-200 bg-white p-2 sticky top-[68px] h-fit">
          <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-slate-500">
            {t("dashboards:editor_dashboard.queues.title", "Очереди")}
          </div>
          <nav className="p-1 space-y-1">
            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "under_review" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("under_review")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  {t("dashboards:editor_dashboard.queues.under_review", "На рецензии")}
                </span>
                <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                  {counts.under_review}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(
                    "dashboards:editor_dashboard.queues.no_assignees",
                    "Без назначенных рецензентов"
                )}
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "assigned" ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("assigned")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> {t("dashboards:editor_dashboard.queues.assigned", "Назначено")}
                </span>
                <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                  {counts.assigned}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(
                    "dashboards:editor_dashboard.queues.active_assignments",
                    "С активными назначениями"
                )}
              </div>
            </button>

            <button
              className={`w-full text-left rounded-lg px-3 py-2.5 ${queue === "revision_minor" ? "bg-amber-50 text-amber-700" : "hover:bg-slate-50"}`}
              onClick={() => setQueue("revision_minor")}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  {t(
                          "dashboards:editor_dashboard.queues.return_to_author",
                          "Вернуть автору"
                      )}
                </span>
                <span className="text-xs rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                  {counts.revision_minor}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t(
                    "dashboards:editor_dashboard.queues.waiting_fixes",
                    "Ждут корректировок"
                )}
              </div>
            </button>
          </nav>

          <div className="mt-2 border-t border-slate-200 pt-2 px-2">
            <div className="text-xs text-slate-500 mb-1">
              {t(
                  "dashboards:editor_dashboard.batch_ops.title",
                  "Батч-операции"
              )}
            </div>
            {queue === "under_review" ? (
              <div className="grid grid-cols-1 gap-1.5">
                <Button
                  size="sm"
                  className="justify-start bg-amber-600 hover:bg-amber-700"
                  disabled={!selectedIds.size}
                  onClick={() => bulkMinor(selectedIds)}
                >
                  {t(
                      "dashboards:editor_dashboard.batch_ops.return_to_author_count",
                      "Вернуть автору ({{count}})",
                      { count: selectedIds.size }
                  )}
                </Button>
              </div>
            ) : queue === "revision_minor" || queue === "revision_major" ? (
              <div className="grid grid-cols-1 gap-1.5"></div>
            ) : (
              <div className="text-xs text-slate-400">
                {t(
                    "dashboards:editor_dashboard.batch_ops.none",
                    "Нет групповых действий"
                )}
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: table */}
        <main className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-auto">
            <table className={`w-full ${rowText}`}>
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-[44px] text-left">
                    <button
                      className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
                      onClick={() =>
                        selectedIds.size === visibleRows.length
                          ? clearSelection()
                          : selectAllVisible(visibleRows)
                      }
                      title={
                        selectedIds.size === visibleRows.length
                            ? t(
                                "dashboards:editor_dashboard.table.unselect_all",
                                "Снять все"
                            )
                            : t(
                                "dashboards:editor_dashboard.table.select_all",
                                "Выбрать все"
                            )
                      }
                    >
                      {selectedIds.size === visibleRows.length &&
                      visibleRows.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("dashboards:editor_dashboard.table.article", "Статья")}
                  </th>
                  <th className="px-3 py-2 text-left w-[160px]">
                    {t("dashboards:editor_dashboard.table.author", "Автор")}
                  </th>
                  <th className="px-3 py-2 text-left w-[160px]">
                    {t("dashboards:editor_dashboard.table.created", "Создана")}
                  </th>
                  <th className="px-3 py-2 text-left w-[140px]">
                    {t("dashboards:editor_dashboard.table.status", "Статус")}
                  </th>
                  <th className="px-3 py-2 text-right w-[340px]">
                    {t("dashboards:editor_dashboard.table.actions", "Действия")}
                  </th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                  Array.from({length: 8}).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-200 animate-pulse"
                    >
                      <td className={`px-3 ${rowPad}`}></td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      </td>
                      <td className={`px-3 ${rowPad}`}>
                        <div className="h-6 bg-slate-200 rounded w-[120px]" />
                      </td>
                      <td className={`px-3 ${rowPad}`} />
                    </tr>
                  ))
                ) : visibleRows.length ? (
                  visibleRows.map((a) => {
                    const assigns = assignmentsMap[a.id] || [];
                    const active = assigns.filter(isPendingAssignment);
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className={`px-3 ${rowPad}`}>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedIds.has(a.id)}
                            onChange={() => toggleSelect(a.id)}
                            aria-label={t(
                                "dashboards:editor_dashboard.table.select_row",
                                "Выбрать строку"
                            )}
                          />
                        </td>
                        <td className={`px-3 ${rowPad}`}>
                          <div className="font-medium text-slate-900 truncate">
                            {a.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t(
                                "dashboards:editor_dashboard.table.journal_id",
                                "Журнал #{{id}}",
                                { id: a.journal }
                            )}
                          </div>
                        </td>
                        <td className={`px-3 ${rowPad}`}>
                          <div className="truncate">
                            {a.author_email ?? "—"}
                          </div>
                        </td>
                        <td className={`px-3 ${rowPad}`}>
                          {fmt(a.created_at)}
                        </td>
                        <td className={`px-3 ${rowPad}`}>
                          <StatusPill status={a.status} />
                        </td>
                        <td className={`px-3 ${rowPad}`}>
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDetailArticle(a);
                                setShowRight(true);
                              }}
                            >
                              {t(
                                  "dashboards:editor_dashboard.actions.details",
                                  "Детали"
                              )}
                            </Button>

                            {queue === "under_review" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-amber-600 hover:bg-amber-700"
                                  onClick={() =>
                                    requestRevision(a.id, "revision_minor")
                                  }
                                >
                                  {t(
                                      "dashboards:editor_dashboard.actions.return_to_author",
                                      "Вернуть автору"
                                  )}
                                </Button>
                              </>
                            )}

                            {queue === "assigned" && (
                              <Link to={`/articles/${a.id}`}>
                                <Button size="sm" variant="outline">
                                  {t(
                                      "dashboards:editor_dashboard.actions.open",
                                      "Открыть"
                                  )}
                                </Button>
                              </Link>
                            )}

                            {/* мини-сводка активных назначений для assigned */}
                            {queue === "assigned" && active.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {t(
                                    "dashboards:editor_dashboard.active_assignments_count",
                                    "Активных назначений: "
                                )} <b>{active.length}</b>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto w-full max-w-md">
                        <div className="text-2xl font-semibold">
                          {t("dashboards:editor_dashboard.empty.title", "Пока пусто")}
                        </div>
                        <p className="mt-2 text-slate-500">
                          {t("dashboards:editor_dashboard.empty.in_queue", "В очереди")}{" "}
                          <b>
                            {queue === "under_review"
                                ? t(
                                    "dashboards:editor_dashboard.queues.under_review",
                                    "На рецензии"
                                )
                                : queue === "assigned"
                                    ? t(
                                        "dashboards:editor_dashboard.queues.assigned",
                                        "Назначено"
                                    )
                                    : queue === "revision_minor"
                                        ? t(
                                            "dashboards:editor_dashboard.queues.minor",
                                            "Небольшие правки"
                                        )
                                        : t(
                                            "dashboards:editor_dashboard.queues.major",
                                            "Крупные правки"
                                        )}
                          </b>{" "}
                          {t(
                              "dashboards:editor_dashboard.empty.no_articles",
                              "нет статей под текущие фильтры."
                          )}
                        </p>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setGlobalQuery("");
                              journalId && loadArticlesForJournal(journalId);
                            }}
                          >
                            {t(
                                "dashboards:editor_dashboard.empty.reset_search",
                                "Сбросить поиск"
                            )}
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* bottom selection bar */}
          {selectedIds.size > 0 && (
            <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-slate-600">
                  {t("dashboards:editor_dashboard.selected", "Выбрано:")}{" "} <b>{selectedIds.size}</b>
                </div>
                <div className="flex items-center gap-2">
                  {queue === "under_review" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => bulkMinor(selectedIds)}
                      >
                        {t(
                            "dashboards:editor_dashboard.actions.return_to_author",
                            "Вернуть автору"
                        )}
                      </Button>
                    </>
                  )}

                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    <X className="h-4 w-4 mr-1" />
                    {t(
                        "dashboards:editor_dashboard.clear_selection",
                        "Снять выделение"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: details panel */}
        <aside
          className={`relative transition-all duration-200 ${showRight ? "opacity-100 translate-x-0" : "pointer-events-none -translate-x-2 opacity-0"}`}
        >
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
              <div className="font-semibold">
                {t(
                    "dashboards:editor_dashboard.panel.details_title",
                    "Панель деталей"
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRight(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {detailArticle ? (
              <div className="p-3 space-y-4">
                <div>
                  <div className="text-sm text-slate-500">
                    {t(
                        "dashboards:editor_dashboard.detail.article",
                        "Статья"
                    )}
                  </div>
                  <div className="font-medium break-words">
                    {detailArticle.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t(
                        "dashboards:editor_dashboard.detail.author_created",
                        "Автор: {{author}} • Создана: {{date}}",
                        {
                          author: detailArticle.author_email ?? "—",
                          date: fmt(detailArticle.created_at),
                        }
                    )}
                  </div>
                  <div className="mt-1">
                    <StatusPill status={detailArticle.status} />
                  </div>
                </div>

                {/* Назначение рецензента доступно только для under_review */}
                {["under_review", "assigned"].includes(
                  detailArticle.status
                ) && (
                  <AssignReviewerInline
                    articleId={detailArticle.id}
                    journalId={journalId}
                    organizationId={
                      journals.find((x) => x.id === journalId)?.organization
                    }
                    assignmentsForArticle={
                      assignmentsMap[detailArticle.id] || []
                    }
                    journalTeam={journalTeam}
                    orgMembers={orgMembersForJournal}
                    onAssigned={async () => {
                      await loadArticlesForJournal(journalId);
                    }}
                  />
                )}

                {/* Сводка активных назначений */}
                <div className="space-y-1.5">
                  <div className="font-medium">
                    {t(
                        "dashboards:editor_dashboard.detail.assignments",
                        "Назначения"
                    )}
                  </div>
                  {(() => {
                    const assigns = assignmentsMap[detailArticle.id] || [];
                    const active = assigns.filter(isPendingAssignment);
                    return active.length ? (
                      active.map((as) => (
                        <div
                          key={as.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <div>
                            #{as.id} •{" "}
                            {t(
                                "dashboards:editor_dashboard.detail.status",
                                "статус"
                            )}
                            <b>{as.status}</b>
                            {as.due_at
                              ? ` • ${t(
                                    "dashboards:editor_dashboard.detail.due_by",
                                    "срок до"
                                )} ${new Date(as.due_at).toLocaleDateString()}`
                                : ""}
                          </div>
                          <span className="text-xs text-slate-500">
                            {t(
                                "dashboards:editor_dashboard.detail.reviewer",
                                "Рецензент"
                            )} {as.reviewer}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">
                        {t(
                            "dashboards:editor_dashboard.detail.no_active_assignments",
                            "Активных назначений нет."
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-1">
                  <Link to={`/articles/${detailArticle.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      {t(
                          "dashboards:editor_dashboard.detail.open_article_page",
                          "Открыть страницу статьи"
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">
                {t(
                    "dashboards:editor_dashboard.detail.empty_hint",
                    "Выберите строку и нажмите Детали, чтобы назначить рецензента, посмотреть назначения и перейти к статье."
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
