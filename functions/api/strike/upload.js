export const onRequestPost = async ({ request, env }) => {
  const form = await request.formData();
  const fd = new FormData();
  fd.append("APIKEY", env.STRIKE_APIKEY);
  fd.append("title", (form.get("title") || "untitled").toString());

  const file = form.get("file");
  if (file) fd.append("file", file, file.name);

  const userEmail = form.get("userEmail");
  if (userEmail) fd.append("userEmail", userEmail.toString());

  fd.append("action", "check");
  const r = await fetch(
    `${env.STRIKE_BASE || "https://lmsapi.plagiat.pl"}/api/v2/documents/add`,
    {
      method: "POST",
      body: fd,
    }
  );
  return new Response(await r.text(), {
    status: r.status,
    headers: {
      "content-type": r.headers.get("content-type") || "application/json",
    },
  });
};
