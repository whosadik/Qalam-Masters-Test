import { useParams, useNavigate } from "react-router-dom";
import ArticleDetails from "@/components/articles/ArticleDetails";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// заглушка: возьми статью из твоего стора/АПИ. Пока — мок по id
const MOCK = [
  {
    id: 1,
    title: "Применение машинного обучения в прогнозировании изменения климата",
    journal: "Международный журнал экологических исследований",
    status: "Требует правок",
    plagiarismScore: 8,
    reviewerComments: [
      "Уточните выбор датасета и метод валидации.",
      "Добавьте сравнение с базовыми моделями."
    ],
    decisionNote: "Minor revision: исправьте методологический раздел.",
  },
];

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = MOCK.find((a) => String(a.id) === String(id));

  const handleUploadRevision = async (file, note) => {
    // тут сделай вызов API/стора
    console.log("upload revision", { file, note, articleId: id });
    alert("Ревизия загружена! (замени на реальный вызов)");
    // после успешной загрузки можешь обновить статус/перезагрузить данные
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <ArticleDetails article={article} onUploadRevision={handleUploadRevision} />
    </div>
  );
}
