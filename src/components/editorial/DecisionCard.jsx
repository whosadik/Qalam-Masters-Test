"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DecisionCard({ article, onDecision }) {
  const [decision, setDecision] = useState("");      // accept | minor | major | reject
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");

  const isRevision = decision === "minor" || decision === "major";
  const canSubmit =
    (decision === "accept" || decision === "reject") ||
    (isRevision && deadline);

  return (
    <Card className="border rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">
              {article.title}
            </CardTitle>
            <div className="text-sm text-gray-600 truncate">
              {article.journal} • {article.category}
            </div>
          </div>
          <Badge variant="secondary">Decision Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Кнопки решения */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={decision === "accept" ? "default" : "outline"}
            onClick={() => setDecision("accept")}
          >
            Принять
          </Button>
          <Button
            variant={decision === "minor" ? "default" : "outline"}
            onClick={() => setDecision("minor")}
          >
            Minor revision
          </Button>
        <Button
            variant={decision === "major" ? "default" : "outline"}
            onClick={() => setDecision("major")}
          >
            Major revision
          </Button>
          <Button
            variant={decision === "reject" ? "default" : "outline"}
            onClick={() => setDecision("reject")}
          >
            Отклонить
          </Button>
        </div>

        {/* Дедлайн для ревизии */}
        {isRevision && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Дедлайн ревизии"
            />
          </div>
        )}

        {/* Комментарий автору (и внутренний) */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Комментарий автору</label>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Коротко опишите основания решения и требования к ревизии (если есть)."
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() =>
              onDecision?.(article.id, decision, {
                revisionType: decision,
                deadline: deadline || undefined,
                note,
              })
            }
            disabled={!decision || !canSubmit}
          >
            Зафиксировать решение
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
