const API = "/api";

export async function strikeUpload(file, title = "", userEmail) {
  const fd = new FormData();
  fd.append("file", file);
  if (title) fd.append("title", title);
  if (userEmail) fd.append("userEmail", userEmail);
  const r = await fetch(`${API}/strike/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`upload ${r.status}`);
  const txt = await r.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { raw: txt };
  }
}

export async function strikeStatus(id) {
  const r = await fetch(`${API}/strike/docs/${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(`status ${r.status}`);
  return r.json();
}

export function strikePdfUrl(id) {
  return `${API}/strike/report/${encodeURIComponent(id)}.pdf`;
}

export async function strikeJwt(id) {
  const r = await fetch(`${API}/strike/report/jwt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId: id }),
  });
  if (!r.ok) throw new Error(`jwt ${r.status}`);
  return (await r.text()).trim();
}
