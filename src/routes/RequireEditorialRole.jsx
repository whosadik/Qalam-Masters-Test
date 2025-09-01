// src/routes/RequireEditorialRole.jsx
import { useEffect, useState } from "react";
import { useLocation, useParams, Navigate } from "react-router-dom";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";

const ALLOWED = new Set(["chief_editor", "editor", "manager"]); // при желании расширь

export default function RequireEditorialRole({ children }) {
  const { jid } = useParams(); // journalId из URL
  const location = useLocation();
  const [ok, setOk] = useState(null); // null=загрузка, true/false=решение

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // тянем членства ТОЛЬКО по этому журналу
        const url = withParams(API.JOURNAL_MEMBERSHIPS, {
          journal: Number(jid),
          page_size: 200,
        });
        const { data } = await http.get(url);
        const results = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : [];
        // выясняем мой userId из /users/me
        const { data: me } = await http.get(API.ME);
        const mine = results.filter((m) => Number(m.user) === Number(me.id));
        const hasRole = mine.some((m) => ALLOWED.has(String(m.role)));
        if (mounted) setOk(hasRole);
      } catch {
        if (mounted) setOk(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [jid]);

  if (ok === null)
    return <div className="p-6 text-gray-500">Проверка доступа…</div>;
  if (!ok)
    return (
      <Navigate to="/author-dashboard" state={{ from: location }} replace />
    );
  return children;
}
