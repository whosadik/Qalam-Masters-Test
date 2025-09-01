// src/components/VisibleIf.jsx
import React from "react";
import { makeUsePermissions } from "@/auth/permissions";

export default function VisibleIf({
  journalId,
  when,
  children,
  loader = null,
}) {
  const usePermissions = makeUsePermissions(React);
  const { loading, can } = usePermissions(Number(journalId));
  if (loading) return loader;
  return can(when) ? children : null;
}
