export const onRequestGet = async ({ params, env }) => {
  const id = params["*"];
  const u =
    `${env.STRIKE_BASE || "https://lmsapi.plagiat.pl"}` +
    `/api/v2/documents?APIKEY=${encodeURIComponent(env.STRIKE_APIKEY)}&id=${encodeURIComponent(id)}`;
  const r = await fetch(u);
  return new Response(await r.text(), {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
};
