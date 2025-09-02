// src/routes/AppHomeSwitch.jsx
"use client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

/**
 * Куда приземлять пользователя после /app.
 * Приоритет:
 * 1) org admin/owner/moderator → /moderator
 * 2) chief_editor → /editor-chief-dashboard
 * 3) editor/proofreader/secretary → /editorial-board-dashboard
 * 4) manager → /manager
 * 5) reviewer → /reviewer-profile
 * 6) обычный автор → /author-dashboard
 */
export default function AppHomeSwitch() {
  const nav = useNavigate();
  const {
    booted,
    isOrgAdmin,
    hasChiefEditor,
    hasEditor,
    hasProofreader,
    hasSecretary,
    hasManager,
    hasReviewer,
  } = useAuth();

  useEffect(() => {
    if (!booted) return;

    if (isOrgAdmin) {
      nav("/moderator", { replace: true });
      return;
    }

    if (hasEditor) {
      nav("/editorial", { replace: true });
      return;
    }

    if (hasChiefEditor) {
      nav("/chief_editorial", { replace: true });
      return;
    }

    if (hasSecretary) {
      nav("/secretary", { replace: true });
      return;
    }

    if (hasManager) {
      nav("/manager", { replace: true });
      return;
    }
    if (hasReviewer) {
      nav("/reviewer-dashboard", { replace: true });
      return;
    }
        if (hasProofreader) {
      nav("/proofreafer-dashboard", { replace: true });
      return;
    }
    nav("/author-dashboard", { replace: true });
  }, [
    booted,
    isOrgAdmin,
    hasChiefEditor,
    hasEditor,
    hasProofreader,
    hasSecretary,
    hasManager,
    hasReviewer,
    nav,
  ]);

  return null;
}
