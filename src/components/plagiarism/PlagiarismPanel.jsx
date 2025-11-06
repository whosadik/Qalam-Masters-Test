import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Loader2, Link as LinkIcon, Shield, RefreshCw} from "lucide-react";
import {strikeUpload, strikeStatus, strikeJwt, strikePdfUrl} from "@/services/strikeService";
 import { http, tokenStore } from "@/lib/apiClient";
// file helper: взять основную рукопись
function pickManuscript(files){
  if (!Array.isArray(files)) return null;
  const norm = (v)=>String(v||"").toLowerCase();
   return files.find(f => {
   const tc = norm(f.type_code);
   const tt = norm(f.type);
   return tc === "manuscript" || tt === "manuscript" || /рукопись/.test(tt);
 });
}

export default function PlagiarismPanel({
  article, files, currentUser, authorAccess = "off", // off|view|submit
  onStoreStrike // async ({id, score?}) => persist в бэкенд (можно null если пока нет)
}){
  const editorial = new Set(["secretary","section_editor","editor_in_chief","admin"]);
  const role = currentUser?.role || "guest";
  const isEditor = editorial.has(role);

  const canSend = isEditor || (role==="author" && authorAccess==="submit");
  const canOpen = isEditor || (role==="author" && (authorAccess==="view" || authorAccess==="submit"));

  const [busy, setBusy] = useState(false);
  const [strikeId, setStrikeId] = useState(article?.strike_id || null);
  const [score, setScore] = useState(
    typeof article?.strike_score === "number" ? article.strike_score : null
  );
  const [err, setErr] = useState("");

  const manus = useMemo(()=>pickManuscript(files), [files]);

  async function doUpload(){
    setErr(""); setBusy(true);
    try{
      if(!manus?.file) throw new Error("Нет файла рукописи");
      // скачать исходный файл как blob и отправить
         // 1) подменяем origin → уходит через Vite proxy
const proxiedUrl = new URL(manus.file).pathname; // даст "/media/articles/53/Project_overview.docx"
    // 2) тянем бинарь; при необходимости добавляем Bearer
    const resp = await fetch(proxiedUrl, {
      headers: tokenStore.access ? { Authorization: `Bearer ${tokenStore.access}` } : undefined,
      credentials: "include",
    });
    if (!resp.ok) throw new Error("Не удалось скачать рукопись");
    const blob = await resp.blob();

    // 3) собираем File и отправляем в Strike
    const filename = manus.file.split("/").pop() || "manuscript.docx";
    const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
    const res = await strikeUpload(file, filename, currentUser?.email);
    const id = res?.id || res?.documentId || res?.document_id;
    if (!id) throw new Error("Strike не вернул id");
    setStrikeId(id);
    if (onStoreStrike) await onStoreStrike({ id });
       } catch(e){
     setErr(String(e.message || e));
  } finally{
     setBusy(false);
  }
  }

  async function refreshStatus(){
    if(!strikeId) return;
    setErr(""); setBusy(true);
    try{
      const st = await strikeStatus(strikeId); // ожидаем {ready:boolean, score?:number}
      const ready = !!(st?.ready || st?.reportReady || st?.status==="ready");
      const s = Number(st?.score ?? st?.similarity ?? st?.totalScore);
      if(ready && Number.isFinite(s)) setScore(s);
      onStoreStrike && await onStoreStrike({id: strikeId, score: Number.isFinite(s)? s : undefined});
    }catch(e){ setErr(String(e.message||e)); }
    finally{ setBusy(false); }
  }

  async function openInteractive(){
    const jwt = await strikeJwt(strikeId); // строка токена
    const url = `https://lmsapi.plagiat.pl/report/?auth=${jwt}`;
    window.open(url, "_blank", "noreferrer");
  }

  const pdfUrl = strikeId ? strikePdfUrl(strikeId) : null;

  const statusBadge = strikeId
    ? (score!=null
        ? <Badge className="bg-emerald-100 text-emerald-700">Готово {score}%</Badge>
        : <Badge className="bg-amber-100 text-amber-700">Отправлено</Badge>)
    : <Badge className="bg-slate-100 text-slate-700">Не отправлено</Badge>;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4"/>{`Антиплагиат`}</CardTitle>
        <CardDescription>Strike Plagiarism</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {statusBadge}
        {err ? <span className="text-sm text-red-600">{err}</span> : null}

        {/* действия */}
        {canSend && !strikeId && (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={busy || !manus} onClick={doUpload}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : null} Отправить в Strike
          </Button>
        )}

        {strikeId && (
          <>
            <Button size="sm" variant="outline" disabled={busy} onClick={refreshStatus}>
              <RefreshCw className="h-4 w-4 mr-2"/>{`Обновить статус`}
            </Button>
            {canOpen && (
              <>
                <Button size="sm" variant="outline" onClick={openInteractive}>
                  <LinkIcon className="h-4 w-4 mr-2"/> Интерактивный отчёт
                </Button>
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">PDF отчёт</Button>
                </a>
              </>
            )}
          </>
        )}

        {!canOpen && strikeId && score!=null && (
          <span className="text-sm text-slate-600">Итог: {score}%</span>
        )}
        {!manus && <span className="text-sm text-slate-500">Нет файла «Рукопись»</span>}
      </CardContent>
    </Card>
  );
}
