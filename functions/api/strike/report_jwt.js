export const onRequestPost = async ({ request, env }) => {
  const { documentId } = await request.json();
  const r = await fetch(
    `${env.STRIKE_BASE || "https://lmsapi.plagiat.pl"}/report/api/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: env.STRIKE_APIKEY,
        documentId,
        viewOnly: true,
      }),
    }
  );
  return new Response(await r.text(), {
    status: r.status,
    headers: { "content-type": r.headers.get("content-type") || "text/plain" },
  });
};
