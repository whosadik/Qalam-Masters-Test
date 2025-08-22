"use client";
import { useEffect, useState } from "react";
import { articlesStore } from "@/store/articlesStore";
import ScreeningCard from "@/components/editorial/ScreeningCard";
import { ARTICLE_STATUS } from "@/constants/articleStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function InitialScreeningPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const list = await articlesStore.listForScreening();
    // ставим всем статус INITIAL_SCREENING при входе, если были SUBMITTED
    const normalized = await Promise.all(
      list.map(async (a) => {
        if (a.status === ARTICLE_STATUS.SUBMITTED) {
          return articlesStore.setStatus(a.id, ARTICLE_STATUS.INITIAL_SCREENING);
        }
        return a;
      })
    );
    setItems(normalized);
  };

  useEffect(() => { load(); }, []);

  const handleAllow = async (id, checklist) => {
    // в реальном API: POST /articles/:id/screening { decision: 'allow', checklist }
    await articlesStore.addNote(id, { type: "screening", checklist, decision: "allow" });
    await articlesStore.setStatus(id, ARTICLE_STATUS.REVIEWER_ASSIGNMENT);
    await load();
    alert("Статья допущена к рецензированию (статус: Reviewer Assignment).");
  };

  const handleReturn = async (id, checklist) => {
    // в реальном API: POST /articles/:id/screening { decision: 'return', checklist, message }
    await articlesStore.addNote(id, { type: "screening", checklist, decision: "return" });
    await articlesStore.setStatus(id, ARTICLE_STATUS.RETURNED_TO_AUTHOR, {
      returnReason: checklist?.comment || "Вернуть на доработку (оформление/тематика/антиплагиат).",
    });
    await load();
    alert("Статья возвращена автору на доработку.");
  };

  const filtered = items.filter(a =>
    (a.title || "").toLowerCase().includes(q.toLowerCase()) ||
    (a.journal || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Первичная проверка</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Поиск по названию/журналу…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <Button variant="outline" onClick={load}>Обновить</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-gray-500">Нет статей на первичной проверке.</div>
        ) : (
          filtered.map((a) => (
            <ScreeningCard
              key={a.id}
              article={a}
              onAllowToReview={handleAllow}
              onReturnToAuthor={handleReturn}
            />
          ))
        )}
      </div>
    </div>
  );
}
