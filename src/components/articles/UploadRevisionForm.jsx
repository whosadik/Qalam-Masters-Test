import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FileDropZone from "@/components/files/FileDropZone";

export default function UploadRevisionForm({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");

  const canSubmit = !!file;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    await onSubmit?.(file, note);
    setFile(null);
    setNote("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FileDropZone
        label="Исправленный файл статьи"
        value={file}
        onFileChange={setFile}
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Ответ рецензентам (опционально)</label>
        <Textarea
          placeholder="Опишите, как вы учли замечания рецензентов..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          Загрузить ревизию
        </Button>
      </div>
    </form>
  );
}
