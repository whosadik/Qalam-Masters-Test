import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Shield, Upload } from "lucide-react";
import UploadRevisionForm from "@/components/articles/UploadRevisionForm";

export default function ArticleDetails({
  article,
  onUploadRevision, // (file, note) => Promise/void
}) {
  if (!article) return null;

  const showUploadRevision =
    article.status === "Требует правок" ||
    article.status === "Revision Requested" ||
    article.status === "На доработке";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{article.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{article.journal}</Badge>
            <Badge>{article.status}</Badge>
            {typeof article.plagiarismScore === "number" && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                <Shield className="w-4 h-4 text-green-600" />
                Антиплагиат: <b>{article.plagiarismScore}%</b>
              </span>
            )}
          </div>

          <Separator />

          <section className="space-y-2">
            <h4 className="font-semibold">Решение редакции</h4>
            <p className="text-sm text-gray-700">
              {article.decisionNote || "Ожидается решение редакции."}
            </p>
          </section>

          <Separator />

          <section className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Комментарии рецензентов
            </h4>
            <div className="space-y-2">
              {(article.reviewerComments || []).length === 0 ? (
                <p className="text-sm text-gray-600">Пока нет комментариев.</p>
              ) : (
                article.reviewerComments.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-md bg-gray-50 border text-sm text-gray-800"
                  >
                    {c}
                  </div>
                ))
              )}
            </div>
          </section>
        </CardContent>
      </Card>

      {showUploadRevision && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Загрузка исправленной версии (Revision)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UploadRevisionForm onSubmit={onUploadRevision} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
