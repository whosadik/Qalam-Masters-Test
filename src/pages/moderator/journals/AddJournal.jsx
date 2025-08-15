import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const KEY_JOURNALS = "myOrgJournals";

export default function AddJournal() {
  const navigate = useNavigate();
  const { id } = useParams(); // id организации (не обязателен в моках)
  const [form, setForm] = useState({
    name: "",
    description: "",
    topics: [], // массив строк
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleTopics = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, topics: selected }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return; // обязательное поле

    const existing = JSON.parse(localStorage.getItem(KEY_JOURNALS) || "[]");
    const next = [
      ...existing,
      {
        id: Date.now(),
        orgId: Number(id) || 1,
        name: form.name.trim(),
        description: form.description.trim(),
        topics: form.topics,
        createdAt: new Date().toLocaleDateString("ru-RU"),
        lang: "ru",
        periodicity: "quarterly",
      },
    ];

    localStorage.setItem(KEY_JOURNALS, JSON.stringify(next));
    alert("Журнал добавлен!");
    navigate("/moderator"); // назад в кабинет модератора организации
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Добавить журнал</h1>

      <Card className="border rounded-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Название журнала<span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                placeholder="Вестник Академии полиции"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <Textarea
                name="description"
                placeholder="Научно‑практический журнал о современных буднях полиции."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Тематика журнала
              </label>
              {/* простой multiple-select для моков */}
              <select
                multiple
                className="w-full border rounded-md p-2 h-28 outline-none"
                value={form.topics}
                onChange={handleTopics}
              >
                <option value="Право">Право</option>
                <option value="Криминология">Криминология</option>
                <option value="Госуправление">Госуправление</option>
                <option value="Социология">Социология</option>
                <option value="Образование">Образование</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Удерживайте Ctrl/⌘ для выбора нескольких.
              </p>
            </div>

            <div className="flex justify-center">
              {/* Надпись на кнопке на скрине «Войти», но логичнее «Создать журнал» */}
              <Button type="submit" className="px-8">
                Создать журнал
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
