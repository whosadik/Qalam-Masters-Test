// src/routes/RequirePermission.jsx
import { Navigate, useLocation, useParams } from "react-router-dom";
import React from "react";
import { makeUsePermissions } from "@/auth/permissions";
import { ACT } from "@/constants/permissions";

const usePermissions = makeUsePermissions(React);

export default function RequirePermission({
  action = ACT.ARTICLE_VIEW_ALL,
  children,
}) {
  const { jid } = useParams(); // ожидаем наличие :jid в роуте
  const { loading, can } = usePermissions(Number(jid));
  const location = useLocation();

  if (loading)
    return <div className="p-6 text-gray-500">Проверка доступа…</div>;
  if (!can(action))
    return (
      <Navigate to="/author-dashboard" state={{ from: location }} replace />
    );
  return children;
}
