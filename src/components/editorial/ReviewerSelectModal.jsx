"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { articlesStore } from "@/store/articlesStore";

function initials(name="") {
  return name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "R";
}

/** Props:
 *  isOpen: boolean
 *  initialSelected?: [{id,name,email}]
 *  onClose: () => void
 *  onSubmit: (arr) => void   // максимум 2
 */
export default function ReviewerSelectModal({ isOpen, initialSelected = [], onClose, onSubmit }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => setSelected(initialSelected), [initialSelected]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await articlesStore.searchReviewers(q);
      if (alive) setList(data);
    })();
    return () => { alive = false; };
  }, [q]);

  const canSubmit = selected.length >= 1 && selected.length <= 2;

  const toggle = (r) => {
    if (selected.find(x => x.id === r.id)) {
      setSelected(selected.filter(x => x.id !== r.id));
    } else if (selected.length < 2) {
      setSelected([...selected, { id:r.id, name:r.name, email:r.email }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-white shadow-xl overflow-y-auto">
        <Card className="rounded-none border-0">
          <CardHeader className="sticky top-0 bg-white z-10 border-b">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Выбор рецензентов</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Поиск по имени/почте/направлению…"
                  value={q}
                  onChange={(e)=>setQ(e.target.value)}
                  className="w-80"
                />
                <Button variant="outline" onClick={onClose}>Закрыть</Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map(s => (
                <Badge key={s.id} className="bg-blue-100 text-blue-800">{s.name}</Badge>
              ))}
              <span className="text-xs text-gray-500">Максимум 2</span>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            {list.map(r => (
              <div
                key={r.id}
                className={`border rounded-lg p-4 flex items-center justify-between gap-3 ${selected.find(s=>s.id===r.id) ? "ring-1 ring-blue-500" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{r.name}</div>
                      {r.active ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Активен</Badge>
                      ) : (
                        <Badge variant="secondary">Пауза</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{r.email} • Нагрузка: {r.workload ?? 0}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(r.fields||[]).map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant={selected.find(s=>s.id===r.id) ? "secondary" : "outline"}
                  onClick={() => toggle(r)}
                >
                  {selected.find(s=>s.id===r.id) ? "Убрать" : "Выбрать"}
                </Button>
              </div>
            ))}
            {list.length === 0 && <div className="text-gray-500">Рецензенты не найдены.</div>}
          </CardContent>

          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Отмена</Button>
            <Button onClick={()=> onSubmit?.(selected)} disabled={!canSubmit}>
              Назначить {selected.length > 0 ? `(${selected.length})` : ""}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
