export const onRequestGet = async ({ params, env }) => {
  const raw = params["*"] || "";
  const id = raw.replace(/\.pdf$/i, "");
  const u =
    `${env.STRIKE_BASE || "https://lmsapi.plagiat.pl"}` +
    `/api/v2/documents/report?APIKEY=${encodeURIComponent(env.STRIKE_APIKEY)}` +
    `&id=${encodeURIComponent(id)}&pdf=true`;
  const r = await fetch(u);
  return new Response(r.body, {
    status: r.status,
    headers: { "content-type": "application/pdf" },
  });
};
