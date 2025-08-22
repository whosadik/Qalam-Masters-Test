"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield } from "lucide-react";

export default function ScreeningRow({ article, onOpen }) {
  const pl = article.plagiarism;
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <div className="font-semibold text-gray-900 truncate">{article.title}</div>
        <div className="text-sm text-gray-600 truncate">
          {article.journal} • {article.category}
        </div>
        {pl && (
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Ориг.: <b>{pl.originality}%</b>
            </span>
            <span>Совп.: <b>{pl.matches}%</b></span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Initial Screening</Badge>
        <Button variant="outline" onClick={() => onOpen(article)}>
          <FileText className="w-4 h-4 mr-1" />
          Открыть
        </Button>
      </div>
    </div>
  );
}
