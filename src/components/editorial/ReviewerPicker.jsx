"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { articlesStore } from "@/store/articlesStore";
import { X } from "lucide-react";

/** value: [{id,name,email}], onChange(arr) */
export default function ReviewerPicker({ value = [], onChange }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!q.trim()) return setResults([]);
      const list = await articlesStore.searchReviewers(q.trim());
      if (alive) setResults(list);
    })();
    return () => { alive = false; };
  }, [q]);

  const add = (p) => {
    if (value.find(v => v.id === p.id)) return;
    if (value.length >= 2) return;
    onChange?.([...value, p]);
    setQ("");
    setResults([]);
  };
  const removeAt = (i) => onChange?.(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((p, i) => (
          <Badge key={p.id} className="bg-blue-100 text-blue-800 flex items-center gap-1">
            {p.name}
            <Button variant="ghost" size="icon" onClick={() => removeAt(i)}>
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
        {value.length < 2 && (
          <Input
            placeholder="Поиск: имя / email / направление…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-72"
          />
        )}
      </div>

      {results.length > 0 && (
        <div className="border rounded-lg divide-y bg-white max-h-56 overflow-auto">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-blue-50"
              onClick={() => add(p)}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">{p.email} • {(p.fields||[]).join(", ")}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
