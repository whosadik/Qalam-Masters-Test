import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ClipboardCheck,
} from "lucide-react";

const KEY_JOURNALS = "myOrgJournals";
const msKey = (jid) => `jr_${jid}_manuscripts`;
const councilKey = (jid) => `jr_${jid}_council`;

// ——— утилиты
const fmt = (d) => (d ? new Date(d).toLocaleDateString("ru-RU") : "—");
const ensureStage = (m) => {
  if (m.stage) return m.stage;
  if (m.status === "submitted") return "decision";
  if (m.status === "in_review" || m.status === "assigned") return "review";
  return "new";
};
const uniqBy = (arr, f = (x) => x.id) => {
  const s = new Set();
  return arr.filter((x) => (s.has(f(x)) ? false : (s.add(f(x)), true)));
};

export default function EditorialCouncil() {
  const { jid } = useParams();
  const navigate = useNavigate();

  // данные
  const [journal, setJournal] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [council, setCouncil] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending"); // pending | decided
  const [openId, setOpenId] = useState(null); // раскрытая карточка
  const [protoText, setProtoText] = useState(""); // протокол (генерация)

  // загрузка
  useEffect(() => {
    const js = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
    setJournal(js.find((j) => String(j.id) === String(jid)) || null);

    const raw = JSON.parse(localStorage.getItem(msKey(jid)) || "[]");
    const norm = raw.map((m) => ({
      ...m,
      stage: ensureStage(m),
      councilVotes: Array.isArray(m.councilVotes) ? m.councilVotes : [], // [{memberId, vote, comment, at}]
      finalDecision: m.finalDecision || "",
      finalizedAt: m.finalizedAt || "",
    }));
    setManuscripts(norm);
    localStorage.setItem(msKey(jid), JSON.stringify(norm));

    setCouncil(JSON.parse(localStorage.getItem(councilKey(jid)) || "[]"));
  }, [jid]);

  const saveMs = (arr) => {
    setManuscripts(arr);
    localStorage.setItem(msKey(jid), JSON.stringify(arr));
  };
  const saveCouncil = (arr) => {
    setCouncil(arr);
    localStorage.setItem(councilKey(jid), JSON.stringify(arr));
  };

  // добавить члена совета
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const addMember = () => {
    if (!newMember.name.trim()) return;
    const next = [...council, { id: Date.now(), ...newMember }];
    saveCouncil(next);
    setNewMember({ name: "", role: "" });
  };
  const removeMember = (id) => saveCouncil(council.filter((m) => m.id !== id));

  // фильтрация заявок
  const listFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = [...manuscripts];
    if (tab === "pending") {
      arr = arr.filter((m) => !m.finalDecision);
    } else {
      arr = arr.filter((m) => !!m.finalDecision);
    }
    if (q)
      arr = arr.filter((m) =>
        [m.title, m.authors, m.abstract]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    // сортировка: решённые по дате решения, остальные — по дате подачи
    return arr.sort((a, b) =>
      (b.finalizedAt || b.submittedAt || 0) >
      (a.finalizedAt || a.submittedAt || 0)
        ? 1
        : -1
    );
  }, [manuscripts, search, tab]);

  // подсчёт голосов и кворум
  const tally = (m) => {
    const kv = (m.councilVotes || []).reduce(
      (acc, v) => {
        acc.total++;
        acc.by[v.vote] = (acc.by[v.vote] || 0) + 1;
        return acc;
      },
      { total: 0, by: {} }
    );
    const totalMembers = council.length || 0;
    const quorum = Math.max(1, Math.ceil(totalMembers / 2)); // половина вверх
    // мажоритарное решение
    const entries = Object.entries(kv.by).sort((a, b) => b[1] - a[1]);
    const leader = entries[0] || ["", 0];
    const majorityReached = kv.total >= quorum && leader[1] > kv.total / 2;
    return { ...kv, quorum, leader, majorityReached };
  };

  const voteOptions = [
    ["accept", "Принять"],
    ["minor", "Принять после небольших правок"],
    ["major", "На доработку"],
    ["reject", "Отклонить"],
  ];

  // сохранить голос
  const castVote = (mid, memberId, vote, comment = "") => {
    saveMs(
      manuscripts.map((m) => {
        if (m.id !== mid) return m;
        const others = (m.councilVotes || []).filter(
          (v) => v.memberId !== memberId
        );
        return {
          ...m,
          councilVotes: uniqBy(
            [
              ...others,
              { memberId, vote, comment, at: new Date().toISOString() },
            ],
            (x) => x.memberId
          ),
        };
      })
    );
  };

  // финализация решения
  const finalize = (mid, decision) => {
    saveMs(
      manuscripts.map((m) =>
        m.id === mid
          ? {
              ...m,
              finalDecision: decision,
              finalizedAt: new Date().toISOString(),
              stage: "decision",
            }
          : m
      )
    );
    setOpenId(null);
  };

  // генерация протокола
  const makeProtocol = (m) => {
    const t = tally(m);
    const lines = (m.councilVotes || [])
      .map((v) => {
        const mem = council.find((c) => c.id === v.memberId);
        return `- ${mem?.name || "Член совета"}: ${labelOf(v.vote)}${v.comment ? ` — ${v.comment}` : ""}`;
      })
      .join("\n");
    const txt = `Протокол заседания редакционного совета
Журнал: ${journal?.name || "—"}
Дата: ${fmt(new Date())}

Рукопись: «${m.title}» (${m.authors || "—"})
Поступила: ${fmt(m.submittedAt)}

Голоса (${t.total}/${council.length}, кворум: ${t.quorum}):
${lines || "—"}

Итоговое решение: ${m.finalDecision ? labelOf(m.finalDecision) : t.leader[0] ? labelOf(t.leader[0]) : "—"}
Дата решения: ${fmt(m.finalizedAt || new Date())}
`;
    setProtoText(txt);
  };

  const labelOf = (v) => voteOptions.find(([k]) => k === v)?.[1] || "—";

  // прогресс карточки (условный)
  const progressOf = (m) =>
    m.finalDecision ? 100 : m.stage === "decision" ? 90 : 60;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              Редакционный совет — {journal?.name || "Журнал"}
            </h1>
            <p className="text-slate-600">
              Голоса, кворум, итоговые решения и протокол
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по названию/авторам"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Совет (состав) */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Состав совета
            </span>
            <Badge variant="secondary">Членов: {council.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <Input
              className="md:col-span-5"
              placeholder="ФИО"
              value={newMember.name}
              onChange={(e) =>
                setNewMember((f) => ({ ...f, name: e.target.value }))
              }
            />
            <Input
              className="md:col-span-5"
              placeholder="Роль (напр. член совета)"
              value={newMember.role}
              onChange={(e) =>
                setNewMember((f) => ({ ...f, role: e.target.value }))
              }
            />
            <div className="md:col-span-2 flex justify-end">
              <Button className="w-full md:w-auto gap-2" onClick={addMember}>
                <Plus className="w-4 h-4" /> Добавить
              </Button>
            </div>
          </div>

          {council.length === 0 ? (
            <div className="text-slate-500">
              Совет пока пуст. Добавьте участников для голосования.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {council.map((m) => (
                <span
                  key={m.id}
                  className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded"
                >
                  {m.name}
                  {m.role ? ` — ${m.role}` : ""}
                  <button
                    className="ml-2 text-slate-500 hover:text-rose-600"
                    onClick={() => removeMember(m.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="w-full overflow-x-auto rounded-lg bg-white shadow-sm px-1 py-1 gap-1">
          <TabsTrigger
            value="pending"
            className="whitespace-nowrap data-[state=active]:bg-slate-100"
          >
            Ожидают решения
          </TabsTrigger>
          <TabsTrigger
            value="decided"
            className="whitespace-nowrap data-[state=active]:bg-slate-100"
          >
            Решённые
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-0">
              {listFiltered.length === 0 ? (
                <div className="p-6 text-slate-500">Нет записей.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {listFiltered.map((m) => {
                    const t = tally(m);
                    return (
                      <li
                        key={m.id}
                        className="p-4 hover:bg-slate-50/70 transition"
                      >
                        <div className="flex items-start gap-4">
                          {/* прогресс */}
                          <div className="hidden sm:block w-20">
                            <div className="text-xs text-slate-600 mb-1">
                              Прогресс
                            </div>
                            <Progress value={progressOf(m)} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold leading-tight truncate">
                                    {m.title}
                                  </h3>
                                  {m.finalDecision ? (
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                      Решение: {labelOf(m.finalDecision)}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      Голоса: {t.total}/{council.length} (кворум{" "}
                                      {t.quorum})
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 truncate">
                                  {m.authors || "—"} • Получена:{" "}
                                  {fmt(m.submittedAt)}
                                </div>
                              </div>

                              {/* действия */}
                              <div className="flex flex-col gap-2 shrink-0">
                                {!m.finalDecision ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        setOpenId(openId === m.id ? null : m.id)
                                      }
                                    >
                                      Открыть голосование
                                    </Button>
                                    {t.majorityReached && (
                                      <Button
                                        size="sm"
                                        className="gap-2"
                                        onClick={() =>
                                          finalize(m.id, t.leader[0])
                                        }
                                      >
                                        <ClipboardCheck className="w-4 h-4" />{" "}
                                        Утвердить по большинству
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <Badge className="bg-emerald-100 text-emerald-800">
                                    Итог от {fmt(m.finalizedAt)}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* блок голосования/протокола */}
                            {openId === m.id && (
                              <div className="mt-4 p-4 border rounded-lg bg-white space-y-4">
                                {/* таблица голосов */}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-slate-600">
                                        <th className="py-2 pr-3">
                                          Член совета
                                        </th>
                                        <th className="py-2 pr-3">Голос</th>
                                        <th className="py-2 pr-3">
                                          Комментарий
                                        </th>
                                        <th className="py-2">Действие</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {council.map((mem) => {
                                        const current = (
                                          m.councilVotes || []
                                        ).find((v) => v.memberId === mem.id);
                                        return (
                                          <tr key={mem.id} className="border-t">
                                            <td className="py-2 pr-3">
                                              {mem.name}
                                              {mem.role ? ` — ${mem.role}` : ""}
                                            </td>
                                            <td className="py-2 pr-3">
                                              <select
                                                className="border rounded-md p-1"
                                                value={current?.vote || ""}
                                                onChange={(e) =>
                                                  castVote(
                                                    m.id,
                                                    mem.id,
                                                    e.target.value,
                                                    current?.comment || ""
                                                  )
                                                }
                                              >
                                                <option value="">—</option>
                                                {voteOptions.map(([v, l]) => (
                                                  <option key={v} value={v}>
                                                    {l}
                                                  </option>
                                                ))}
                                              </select>
                                            </td>
                                            <td className="py-2 pr-3">
                                              <Input
                                                value={current?.comment || ""}
                                                onChange={(e) =>
                                                  castVote(
                                                    m.id,
                                                    mem.id,
                                                    current?.vote || "",
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Комментарий (необяз.)"
                                              />
                                            </td>
                                            <td className="py-2">
                                              <div className="flex gap-1">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() =>
                                                    castVote(
                                                      m.id,
                                                      mem.id,
                                                      "accept",
                                                      current?.comment || ""
                                                    )
                                                  }
                                                >
                                                  <ThumbsUp className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() =>
                                                    castVote(
                                                      m.id,
                                                      mem.id,
                                                      "reject",
                                                      current?.comment || ""
                                                    )
                                                  }
                                                >
                                                  <ThumbsDown className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* резюме и финализация */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-slate-700">
                                    Голосов: <b>{t.total}</b> из{" "}
                                    {council.length} • Лидирует:{" "}
                                    <b>{labelOf(t.leader[0])}</b> (
                                    {t.leader[1] || 0})
                                  </span>
                                  {t.majorityReached ? (
                                    <Badge className="bg-emerald-100 text-emerald-800">
                                      Большинство достигнуто
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-100 text-amber-800">
                                      Ждём кворума
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {voteOptions.map(([v, l]) => (
                                    <Button
                                      key={v}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => finalize(m.id, v)}
                                    >
                                      {v === "accept" ? (
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                      ) : v === "reject" ? (
                                        <XCircle className="w-4 h-4 mr-1" />
                                      ) : null}
                                      Утвердить: {l}
                                    </Button>
                                  ))}
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      makeProtocol(m);
                                    }}
                                  >
                                    Сформировать протокол
                                  </Button>
                                </div>

                                {protoText && (
                                  <div className="mt-3">
                                    <Textarea
                                      rows={6}
                                      value={protoText}
                                      onChange={(e) =>
                                        setProtoText(e.target.value)
                                      }
                                    />
                                    <div className="mt-2 flex gap-2">
                                      <Button
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            protoText
                                          )
                                        }
                                      >
                                        Скопировать
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setProtoText("")}
                                      >
                                        Очистить
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
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
      </Tabs>

      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${jid}`}>
          <Button variant="outline">К журналу</Button>
        </Link>
      </div>
    </div>
  );
}
