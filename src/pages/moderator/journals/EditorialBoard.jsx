import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const KEY = "myOrgJournals";

const normalizeBoard = (arr) =>
  (Array.isArray(arr) ? arr : []).map((m, i) => ({
    id: m.id ?? Date.now() + i,
    role: m.role ?? "",
    name: m.name ?? "",
    affiliation: m.affiliation ?? "",
    email: m.email ?? "",
    visible: m.visible !== false, // по умолчанию показываем
    order: Number.isFinite(m.order) ? m.order : i,
  }));

export default function EditorialBoard() {
  const { jid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [journal, setJournal] = useState(null);
  const [board, setBoard] = useState([]);
  const [boardPublic, setBoardPublic] = useState(true);

  // загрузка
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    const j = list.find((x) => String(x.id) === String(jid));
    if (j) {
      setJournal(j);
      setBoard(normalizeBoard(j.editorial));
      setBoardPublic(j.boardPublic !== false);
    }
  }, [jid]);

  // сортированное представление
  const ordered = useMemo(
    () => [...board].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [board]
  );

  const reindex = (arr) => arr.map((m, i) => ({ ...m, order: i }));

  const addRow = () =>
    setBoard((b) =>
      reindex([
        ...b,
        {
          id: Date.now(),
          role: "",
          name: "",
          affiliation: "",
          email: "",
          visible: true,
          order: b.length,
        },
      ])
    );

  const updateRow = (id, key, val) =>
    setBoard((b) => b.map((m) => (m.id === id ? { ...m, [key]: val } : m)));

  const removeRow = (id) =>
    setBoard((b) => reindex(b.filter((m) => m.id !== id)));

  const move = (id, dir) =>
    setBoard((b) => {
      const arr = [...b].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((m) => m.id === id);
      const to = dir === "up" ? idx - 1 : idx + 1;
      if (to < 0 || to >= arr.length) return b;
      [arr[idx].order, arr[to].order] = [arr[to].order, arr[idx].order];
      return [...arr];
    });

  const save = () => {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    const idx = list.findIndex((x) => String(x.id) === String(journal.id));
    if (idx < 0) return;
    list[idx] = {
      ...list[idx],
      editorial: reindex(board),
      boardPublic,
    };
    localStorage.setItem(KEY, JSON.stringify(list));
    alert(
        t(
            "moderator_journals:editorial_board.saved",
            "Редколлегия сохранена"
        )
    );
    navigate(`/moderator/journals/${journal.id}`);
  };

  if (!journal) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
              {t("moderator_journals:editorial_board.back", "Назад")}
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />{" "}
              {t("moderator_journals:editorial_board.title", "Редколлегия —")}{" "}
              {journal.name || t("moderator_journals:editorial_board.journal_fallback", "Журнал")}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/moderator/journals/${journal.id}`}>
            <Button variant="outline">
                {t("moderator_journals:editorial_board.to_journal", "К журналу")}
            </Button>
          </Link>
          <Button onClick={save}>{t("moderator_journals:editorial_board.save", "Сохранить")}</Button>
        </div>
      </div>

      {/* Общая видимость блока */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">
                {t(
                    "moderator_journals:editorial_board.public_title",
                    "Показывать раздел «Редакционная коллегия» на публичной странице"
                )}
            </div>
            <div className="text-sm text-slate-600">
                {t(
                    "moderator_journals:editorial_board.public_hint",
                    "Если выключить, раздел целиком скрывается в «Паспорте журнала»."
                )}
            </div>
          </div>
          <Switch checked={boardPublic} onCheckedChange={setBoardPublic} />
        </CardContent>
      </Card>

      {/* Таблица членов редколлегии */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
              {t(
                  "moderator_journals:editorial_board.members_title",
                  "Состав редколлегии"
              )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                  {t("moderator_journals:editorial_board.total", "Всего:")}{" "}
                  {board.length}</Badge>
              <Button onClick={addRow}>
                  {t(
                      "moderator_journals:editorial_board.add_row",
                      "Добавить строку"
                  )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {ordered.length === 0 ? (
            <div className="p-6 text-slate-500">
                {t(
                    "moderator_journals:editorial_board.empty",
                    "Пока пусто. Добавьте первого члена редколлегии."
                )}

            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ordered.map((m, i) => (
                <li key={m.id} className="p-4 hover:bg-slate-50/60 transition">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Порядок и видимость */}
                    <div className="flex items-center gap-1 md:col-span-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => move(m.id, "up")}
                        disabled={i === 0}
                        className="w-9"
                        title={t(
                            "moderator_journals:editorial_board.move_up",
                            "Выше"
                        )}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => move(m.id, "down")}
                        disabled={i === ordered.length - 1}
                        className="w-9"
                        title={t(
                            "moderator_journals:editorial_board.move_down",
                            "Ниже"
                        )}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRow(m.id, "visible", !m.visible)}
                        className="w-28 gap-2"
                        title={t(
                            "moderator_journals:editorial_board.toggle_visibility",
                            "Показать/скрыть"
                        )}
                      >
                        {m.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                        {m.visible
                            ? t(
                                "moderator_journals:editorial_board.visible",
                                "Виден"
                            )
                            : t(
                                "moderator_journals:editorial_board.hidden",
                                "Скрыт"
                            )}
                      </Button>
                    </div>

                    {/* Роль */}
                    <div className="md:col-span-3">
                      <label className="text-xs text-slate-500">
                          {t(
                              "moderator_journals:editorial_board.role_label",
                              "Роль"
                          )}
                      </label>
                      <Input
                        value={m.role}
                        onChange={(e) =>
                          updateRow(m.id, "role", e.target.value)
                        }
                        placeholder={t(
                            "moderator_journals:editorial_board.role_ph",
                            "Главный редактор"
                        )}
                      />
                    </div>

                    {/* Имя */}
                    <div className="md:col-span-4">
                      <label className="text-xs text-slate-500">
                          {t(
                              "moderator_journals:editorial_board.name_label",
                              "ФИО, уч. степень"
                          )}
                      </label>
                      <Input
                        value={m.name}
                        onChange={(e) =>
                          updateRow(m.id, "name", e.target.value)
                        }
                        placeholder={t(
                            "moderator_journals:editorial_board.name_ph",
                            "Иванов Иван Иванович, д.ф.н., профессор"
                        )}
                      />
                    </div>

                    {/* Афилиация / e-mail */}
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-500">
                          {t(
                              "moderator_journals:editorial_board.affiliation_label",
                              "Организация/страна"
                          )}
                      </label>
                      <Input
                        value={m.affiliation}
                        onChange={(e) =>
                          updateRow(m.id, "affiliation", e.target.value)
                        }
                        placeholder={t(
                            "moderator_journals:editorial_board.affiliation_ph",
                            "КазНУ, Казахстан"
                        )}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs text-slate-500">Email</label>
                      <Input
                        type="email"
                        value={m.email}
                        onChange={(e) =>
                          updateRow(m.id, "email", e.target.value)
                        }
                        placeholder="user@domain.com"
                      />
                    </div>

                    {/* Удалить */}
                    <div className="md:col-span-0">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeRow(m.id)}
                        className="w-full md:w-10"
                        title={t(
                            "moderator_journals:editorial_board.delete",
                            "Удалить"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link to={`/moderator/journals/${journal.id}`}>
          <Button variant="outline">
              {t("moderator_journals:editorial_board.to_journal", "К журналу")}
          </Button>
        </Link>
        <Button onClick={save}>{t("moderator_journals:editorial_board.save", "Сохранить")}</Button>
      </div>
    </div>
  );
}
