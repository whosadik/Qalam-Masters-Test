"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import MetaStep from "@/components/articles/MetaStep";
import FilesStep from "@/components/submit/FilesStep"; // мы уже добавляли этот компонент

export default function EditArticleSheet({
  open,
  onOpenChange,
  article,           // объект статьи
  onSave,            // async (updated) => void
}) {
  const [meta, setMeta] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (article) {
      setMeta({
        title: article.title || "",
        abstract: article.abstract || "",
        keywords: article.keywords || [],
      });
      setFiles({
        articleFile: article.articleFile || null,
        expertConclusion: article.expertConclusion || null,
        originalityCertificate: article.originalityCertificate || null,
        authorsConsent: article.authorsConsent || null,
        conflictOfInterest: article.conflictOfInterest || null,
        ethicsApproval: article.ethicsApproval || null,
      });
    }
  }, [article]);

  const handleSave = async () => {
    const updated = { ...article, ...meta, ...files };
    await onSave?.(updated);
    onOpenChange?.(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Редактирование статьи</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Tabs defaultValue="meta" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="meta">Метаданные</TabsTrigger>
              <TabsTrigger value="files">Файлы</TabsTrigger>
            </TabsList>

            <TabsContent value="meta">
              <MetaStep value={meta} onChange={setMeta} />
            </TabsContent>

            <TabsContent value="files">
              <FilesStep
                formData={files}
                onChange={(k, v) => setFiles(prev => ({ ...prev, [k]: v }))}
                // можно задать свою цену:
                // priceTenge={10000}
              />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
