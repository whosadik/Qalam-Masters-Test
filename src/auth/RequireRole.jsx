import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { http } from "@/lib/apiClient";
import { API } from "@/constants/api";

/**
 * roles: ["manager", "chief_editor", "editor", "reviewer", "proofreader", ...]
 * allowOrgAdmins: если true — пускаем и org admin’ов.
 */
export default function RequireRole({
  roles = [],
  allowOrgAdmins = false,
  children,
}) {
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    (async () => {
      try {
        // 1) мои роли в журналах
        const { data: jm } = await http.get(
          `${API.JOURNAL_MEMBERSHIPS}?page_size=500`
        );
        const journalRoles = (jm?.results ?? jm ?? [])
          .filter((r) => Number(r?.user ?? r?.user_id) === myId)
          .map((r) => String(r.role));

        let orgAdmin = false;
        if (allowOrgAdmins) {
          const { data: om } = await http.get(
            `${API.ORG_MEMBERSHIPS}?page_size=200`
          );
          orgAdmin = (om?.results ?? om ?? [])
            .filter((m) => Number(m?.user?.id ?? m?.user) === myId)
            .some((m) => String(m.role) === "admin");
        }

        const ok =
          orgAdmin ||
          roles.length === 0 ||
          journalRoles.some((r) => roles.includes(r));
        setState({ loading: false, ok });
      } catch (e) {
        console.error("role check failed", e);
        setState({ loading: false, ok: false });
      }
    })();
  }, [roles, allowOrgAdmins]);

  if (state.loading)
    return <div className="p-6 text-gray-500">Проверка прав…</div>;
  if (!state.ok) return <Navigate to="/403" replace />;

  return children;
}
